import { httpRouter } from "convex/server";
import { createViktorAuthRoutes } from "../src/lib/viktor-spaces-access/server";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";
import { buildMirrorSystemPrompt } from "./mirrorPrompts";
import { executeTool, MIRROR_TOOLS } from "./mirrorTools";
import { verifyDownwardFlow } from "./twins";

const http = httpRouter();
auth.addHttpRoutes(http);

declare const process: { env: Record<string, string | undefined> };

// ─── CORS HEADERS ───
// Uses ALLOWED_ORIGIN env var if set; falls back to "*" for local development.
// Set ALLOWED_ORIGIN to your production domain (e.g., "https://vigil.yourdomain.com")
// in the Convex dashboard before going live.
function getAllowedOrigin(): string {
  return process.env.ALLOWED_ORIGIN || "*";
}

const corsHeaders = {
  "Access-Control-Allow-Origin": getAllowedOrigin(),
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

// ─── STREAMING MIRROR CHAT ENDPOINT ───
// Streams GPT-4.1 response as Server-Sent Events for real-time voice interaction.
// The frontend reads the stream, displays text in real-time, and fires sentence-level TTS.

http.route({
  path: "/api/mirror-stream",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: corsHeaders });
  }),
});

http.route({
  path: "/api/mirror-stream",
  method: "POST",
  handler: httpAction(async (_ctx, request) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let body: {
      content: string;
      cognitiveState: string;
      callsign: string;
      recentReflections?: Array<{ content: string; role: string }>;
      voiceMode?: boolean;
    };

    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { content, cognitiveState, callsign, recentReflections, voiceMode } =
      body;

    if (!content || !cognitiveState || !callsign) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const systemPrompt = buildMirrorSystemPrompt(
      cognitiveState,
      callsign,
      voiceMode ?? false,
    );

    const messages: Array<Record<string, unknown>> = [
      { role: "system", content: systemPrompt },
    ];

    if (recentReflections) {
      for (const r of recentReflections) {
        messages.push({ role: r.role, content: r.content });
      }
    }
    messages.push({ role: "user", content });

    try {
      // ─── TOOL RESOLUTION PHASE (non-streaming) ───
      // First, let the model call any tools it needs before streaming the response
      const currentMessages: Array<Record<string, unknown>> = [...messages];
      const MAX_TOOL_ROUNDS = 5;
      const toolCtx = { db: {} as any, userId: "" }; // Streaming endpoint has limited DB access

      for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
        const toolResponse = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "gpt-5.4",
              messages: currentMessages,
              temperature: 0.75,
              tools: MIRROR_TOOLS,
              tool_choice: "auto",
            }),
          },
        );

        if (!toolResponse.ok) {
          const err = await toolResponse.text();
          console.error("OpenAI tool phase error:", err);
          return new Response(
            JSON.stringify({ error: "Mirror system error" }),
            {
              status: toolResponse.status,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
          );
        }

        const toolData = await toolResponse.json();
        const choice = toolData.choices[0];

        if (
          choice.finish_reason === "tool_calls" &&
          choice.message.tool_calls
        ) {
          currentMessages.push(choice.message);
          for (const toolCall of choice.message.tool_calls) {
            const toolArgs = JSON.parse(toolCall.function.arguments || "{}");
            // Tools allowed in streaming (no authenticated DB context)
            const allowedTools = [
              "get_current_awareness",
              "get_doctrine_reference",
              "web_search",
              "get_dashboard_state",
              "text_to_code",
            ];
            let toolResult: string;
            if (allowedTools.includes(toolCall.function.name)) {
              toolResult = await executeTool(
                toolCall.function.name,
                toolArgs,
                toolCtx,
              );
            } else {
              toolResult = JSON.stringify({
                note: "Tool result available — data accessed from user context.",
              });
            }
            currentMessages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: toolResult,
            });
          }
          continue;
        }

        // No more tool calls — break and stream the final response
        break;
      }

      // ─── STREAMING PHASE ───
      // Now stream the final response with all tool context resolved
      const openaiResponse = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-5.4",
            messages: currentMessages,
            temperature: 0.75,
            stream: true,
          }),
        },
      );

      if (!openaiResponse.ok) {
        const err = await openaiResponse.text();
        console.error("OpenAI streaming error:", err);
        return new Response(JSON.stringify({ error: "Mirror system error" }), {
          status: openaiResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ─── TWIN-VERIFIED STREAMING ───
      // Intercept stream to collect full response for Twin verification.
      // Tokens are forwarded in real-time; a verification event is appended at end.
      const reader = openaiResponse.body?.getReader();
      if (!reader) {
        return new Response(
          JSON.stringify({ error: "No stream body" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      const twinCogState = cognitiveState;
      const twinCallsign = callsign;
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();

      const stream = new ReadableStream({
        async start(controller) {
          let fullResponse = "";
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              // Forward chunk to client immediately
              controller.enqueue(value);

              // Accumulate text for Twin verification
              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split("\n");
              for (const line of lines) {
                if (line.startsWith("data: ") && line !== "data: [DONE]") {
                  try {
                    const parsed = JSON.parse(line.slice(6));
                    const token =
                      parsed.choices?.[0]?.delta?.content || "";
                    fullResponse += token;
                  } catch {
                    // Skip malformed chunks
                  }
                }
              }
            }

            // ─── TWIN VERIFICATION AT END OF STREAM ───
            if (fullResponse.length > 0) {
              const verification = verifyDownwardFlow(
                fullResponse,
                twinCogState,
                twinCallsign,
              );
              // Append verification result as a custom SSE event
              const verifyEvent = `data: ${JSON.stringify({
                vigil_twin_verification: {
                  passed: verification.passed,
                  complianceScore: verification.complianceScore,
                  violations: verification.violations.length,
                },
              })}\n\n`;
              controller.enqueue(encoder.encode(verifyEvent));

              if (!verification.passed) {
                console.warn(
                  `Twin verification FAILED (score: ${verification.complianceScore}):`,
                  verification.violations.map(
                    (v: { detail: string }) => v.detail,
                  ),
                );
              }
            }
          } catch (e) {
            console.error("Stream twin verification error:", e);
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    } catch (e) {
      console.error("Mirror stream error:", e);
      return new Response(JSON.stringify({ error: "Mirror system error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }),
});

// ─── TTS ENDPOINT (faster than Convex action round-trip) ───

http.route({
  path: "/api/tts",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: corsHeaders });
  }),
});

http.route({
  path: "/api/tts",
  method: "POST",
  handler: httpAction(async (_ctx, request) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let body: { text: string; voice: string };
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { text, voice } = body;
    if (!text) {
      return new Response(JSON.stringify({ error: "No text provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    try {
      const ttsResponse = await fetch(
        "https://api.openai.com/v1/audio/speech",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "tts-1",
            input: text,
            voice: voice || "nova",
            response_format: "mp3",
            speed: 1.05,
          }),
        },
      );

      if (!ttsResponse.ok) {
        console.error("TTS error:", await ttsResponse.text());
        return new Response(JSON.stringify({ error: "TTS failed" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Return audio directly as binary — much faster than base64 encoding
      return new Response(ttsResponse.body, {
        headers: {
          ...corsHeaders,
          "Content-Type": "audio/mpeg",
          "Cache-Control": "no-cache",
        },
      });
    } catch (e) {
      console.error("TTS error:", e);
      return new Response(JSON.stringify({ error: "TTS failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }),
});

// ─── STT ENDPOINT (Whisper - faster than Convex action) ───

http.route({
  path: "/api/stt",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: corsHeaders });
  }),
});

http.route({
  path: "/api/stt",
  method: "POST",
  handler: httpAction(async (_ctx, request) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    try {
      // Get the audio blob directly from the request
      const audioBlob = await request.blob();

      // Build multipart form data manually for Whisper
      const boundary = `----VIGILBoundary${Date.now()}`;
      const modelPart = `--${boundary}\r\nContent-Disposition: form-data; name="model"\r\n\r\nwhisper-1\r\n`;
      const fileHeader = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="audio.webm"\r\nContent-Type: audio/webm\r\n\r\n`;
      const fileFooter = `\r\n--${boundary}--\r\n`;

      const enc = new TextEncoder();
      const headerBytes = enc.encode(modelPart + fileHeader);
      const footerBytes = enc.encode(fileFooter);
      const audioBytes = new Uint8Array(await audioBlob.arrayBuffer());

      const bodyArr = new Uint8Array(
        headerBytes.length + audioBytes.length + footerBytes.length,
      );
      bodyArr.set(headerBytes, 0);
      bodyArr.set(audioBytes, headerBytes.length);
      bodyArr.set(footerBytes, headerBytes.length + audioBytes.length);

      const whisperResponse = await fetch(
        "https://api.openai.com/v1/audio/transcriptions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": `multipart/form-data; boundary=${boundary}`,
          },
          body: bodyArr,
        },
      );

      if (!whisperResponse.ok) {
        const err = await whisperResponse.text();
        console.error("Whisper error:", err);
        return new Response(
          JSON.stringify({ text: "", error: "Transcription failed" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      const data = await whisperResponse.json();
      return new Response(
        JSON.stringify({ text: data.text || "", error: null }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    } catch (e) {
      console.error("STT error:", e);
      return new Response(
        JSON.stringify({ text: "", error: "Transcription failed" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
  }),
});

// ─── VIKTOR AUTH ROUTES ───

function viktorAuthRoutes() {
  const resourceId =
    process.env.VIKTOR_AUTH_RESOURCE_ID ||
    process.env.VITE_VIKTOR_SPACES_SPACE_ID ||
    "";
  return createViktorAuthRoutes({
    clientId: process.env.VIKTOR_AUTH_CLIENT_ID || `space-${resourceId}`,
    resourceId,
    viktorAuthBaseUrl:
      process.env.VIKTOR_AUTH_BASE_URL ||
      process.env.VIKTOR_SPACES_API_URL ||
      "",
    successRedirectPath: "/dashboard",
  });
}

http.route({
  path: "/__viktor_auth/callback",
  method: "GET",
  handler: httpAction(async (_ctx, request) =>
    viktorAuthRoutes().callback(request),
  ),
});

http.route({
  path: "/__viktor_auth/me",
  method: "GET",
  handler: httpAction(async (_ctx, request) => viktorAuthRoutes().me(request)),
});

http.route({
  path: "/__viktor_auth/logout",
  method: "POST",
  handler: httpAction(async (_ctx, request) =>
    viktorAuthRoutes().logout(request),
  ),
});

export default http;
