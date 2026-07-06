import { v } from "convex/values";
import { action, query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import {
  buildMirrorSystemPrompt,
  buildTrainingFeedbackPrompt,
  buildSqlEvalPrompt,
  buildAssessmentGradingPrompt,
} from "./mirrorPrompts";

declare const process: { env: Record<string, string | undefined> };

// ─── AI ACTIONS ───

// Mirror Chat — AI-powered doctrine conversation (non-streaming fallback)
export const mirrorChat = action({
  args: {
    content: v.string(),
    pillar: v.optional(v.string()),
    cognitiveState: v.string(),
    callsign: v.string(),
    recentReflections: v.optional(v.array(v.object({
      content: v.string(),
      role: v.string(),
    }))),
    voiceMode: v.optional(v.boolean()),
    userApiKey: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const apiKey: string | null = args.userApiKey || process.env.OPENAI_API_KEY || null;
    if (!apiKey) return { response: "Mirror system requires an API key. Add yours in Settings.", error: true };

    const systemPrompt = buildMirrorSystemPrompt(args.cognitiveState, args.callsign, args.voiceMode ?? false);

    const messages: Array<{ role: string; content: string }> = [
      { role: "system", content: systemPrompt },
    ];

    if (args.recentReflections) {
      for (const r of args.recentReflections) {
        messages.push({ role: r.role, content: r.content });
      }
    }

    messages.push({ role: "user", content: args.content });

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4.1",
          messages,
          temperature: 0.75,
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        console.error("OpenAI error:", err);
        if (response.status === 401) {
          return { response: "API key is invalid. Please update your OpenAI API key in Settings.", error: true };
        }
        return { response: "The mirror encounters interference. Try again.", error: true };
      }

      const data = await response.json();
      return { response: data.choices[0].message.content, error: false };
    } catch (e) {
      console.error("Mirror AI error:", e);
      return { response: "The mirror encounters interference. Try again.", error: true };
    }
  },
});

// Training Scenario Feedback
export const gradeTrainingResponse = action({
  args: {
    scenarioDescription: v.string(),
    cognitiveState: v.string(),
    pillar: v.string(),
    userResponse: v.string(),
    userApiKey: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const apiKey: string | null = args.userApiKey || process.env.OPENAI_API_KEY || null;
    if (!apiKey) return { score: 0, feedback: "AI grading unavailable. Add your API key in Settings.", error: true };

    const messages = [
      { role: "system", content: buildTrainingFeedbackPrompt() },
      {
        role: "user",
        content: `SCENARIO: ${args.scenarioDescription}\nCOGNITIVE STATE: ${args.cognitiveState.toUpperCase()}\nACTIVE PILLAR: ${args.pillar}\n\nOPERATOR'S RESPONSE:\n${args.userResponse}\n\nEvaluate this response.`,
      },
    ];

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "gpt-4.1", messages, max_tokens: 400, temperature: 0.5 }),
      });
      if (!response.ok) return { score: 0, feedback: "Evaluation system error. Try again.", error: true };
      const data = await response.json();
      return { score: 0, feedback: data.choices[0].message.content, error: false };
    } catch {
      return { score: 0, feedback: "Evaluation system error. Try again.", error: true };
    }
  },
});

// SQL Query Evaluation
export const evaluateSqlQuery = action({
  args: {
    challengeTitle: v.string(),
    challengeDescription: v.string(),
    tableSchema: v.string(),
    expectedQuery: v.string(),
    userQuery: v.string(),
    hints: v.string(),
    userApiKey: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const apiKey: string | null = args.userApiKey || process.env.OPENAI_API_KEY || null;
    if (!apiKey) return { passed: false, feedback: "AI evaluation unavailable.", score: 0 };

    const messages = [
      { role: "system", content: buildSqlEvalPrompt() },
      {
        role: "user",
        content: `CHALLENGE: ${args.challengeTitle}\nDESCRIPTION: ${args.challengeDescription}\nTABLE SCHEMA: ${args.tableSchema}\nEXPECTED QUERY: ${args.expectedQuery}\n\nUSER'S QUERY: ${args.userQuery}\n\nEvaluate this query.`,
      },
    ];

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "gpt-4.1", messages, max_tokens: 300, temperature: 0.3, response_format: { type: "json_object" } }),
      });
      if (!response.ok) return { passed: false, feedback: "Evaluation error.", score: 0 };
      const data = await response.json();
      try {
        const result = JSON.parse(data.choices[0].message.content);
        return { passed: result.passed || false, feedback: result.feedback || "", score: result.score || 0, hints: result.hints || "" };
      } catch {
        return { passed: false, feedback: data.choices[0].message.content, score: 0 };
      }
    } catch {
      return { passed: false, feedback: "Evaluation error.", score: 0 };
    }
  },
});

// Assessment Grading
export const gradeAssessment = action({
  args: {
    question: v.string(),
    userAnswer: v.string(),
    expectedAnswer: v.optional(v.string()),
    userApiKey: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const apiKey: string | null = args.userApiKey || process.env.OPENAI_API_KEY || null;
    if (!apiKey) return { correct: false, feedback: "AI grading unavailable.", score: 0 };

    const messages = [
      { role: "system", content: buildAssessmentGradingPrompt() },
      {
        role: "user",
        content: `QUESTION: ${args.question}\n${args.expectedAnswer ? `EXPECTED ANSWER: ${args.expectedAnswer}\n` : ""}\nSTUDENT'S ANSWER: ${args.userAnswer}\n\nGrade this answer.`,
      },
    ];

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "gpt-4.1", messages, max_tokens: 300, temperature: 0.3, response_format: { type: "json_object" } }),
      });
      if (!response.ok) return { correct: false, feedback: "Grading error.", score: 0 };
      const data = await response.json();
      try {
        const result = JSON.parse(data.choices[0].message.content);
        return { correct: result.correct || false, feedback: result.feedback || "", score: result.score || 0, correctAnswer: result.correctAnswer || "" };
      } catch {
        return { correct: false, feedback: data.choices[0].message.content, score: 0 };
      }
    } catch {
      return { correct: false, feedback: "Grading error.", score: 0 };
    }
  },
});

// Voice TTS — Generate speech from text (fallback, streaming uses HTTP endpoint)
export const generateSpeech = action({
  args: {
    text: v.string(),
    voice: v.union(v.literal("alloy"), v.literal("echo"), v.literal("fable"), v.literal("onyx"), v.literal("nova"), v.literal("shimmer")),
    userApiKey: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const apiKey: string | null = args.userApiKey || process.env.OPENAI_API_KEY || null;
    if (!apiKey) return { audio: null, error: "API key not configured." };

    try {
      const response = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "tts-1", input: args.text, voice: args.voice, response_format: "mp3" }),
      });

      if (!response.ok) { console.error("TTS error:", await response.text()); return { audio: null, error: "Voice generation failed" }; }

      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      let binary = "";
      for (let i = 0; i < uint8Array.length; i++) { binary += String.fromCharCode(uint8Array[i]); }
      return { audio: btoa(binary), error: null };
    } catch (e) {
      console.error("TTS error:", e);
      return { audio: null, error: "Voice generation failed" };
    }
  },
});

// ─── VOICE PREFERENCES ───

export const getVoicePreference = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const profile = await ctx.db.query("userProfiles").withIndex("by_user", (q) => q.eq("userId", userId)).first();
    return profile?.voiceGender || "female";
  },
});

export const setVoicePreference = mutation({
  args: { voiceGender: v.union(v.literal("male"), v.literal("female")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const profile = await ctx.db.query("userProfiles").withIndex("by_user", (q: any) => q.eq("userId", userId)).first();
    if (profile) await ctx.db.patch(profile._id, { voiceGender: args.voiceGender });
  },
});

// ─── API KEY ───

export const getMyApiKey = query({
  args: {},
  handler: async (ctx): Promise<string | null> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const profile = await ctx.db.query("userProfiles").withIndex("by_user", (q) => q.eq("userId", userId)).first();
    return profile?.openaiApiKey || null;
  },
});

// ─── AUTO-VOICE ───

export const getAutoVoice = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;
    const profile = await ctx.db.query("userProfiles").withIndex("by_user", (q) => q.eq("userId", userId)).first();
    return profile?.autoVoice ?? false;
  },
});

export const setAutoVoice = mutation({
  args: { enabled: v.boolean() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const profile = await ctx.db.query("userProfiles").withIndex("by_user", (q: any) => q.eq("userId", userId)).first();
    if (profile) await ctx.db.patch(profile._id, { autoVoice: args.enabled });
  },
});

// ─── API KEY MANAGEMENT ───

export const getApiKeyStatus = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { hasKey: false, source: "none" as const };
    const profile = await ctx.db.query("userProfiles").withIndex("by_user", (q) => q.eq("userId", userId)).first();
    if (profile?.openaiApiKey) {
      const key = profile.openaiApiKey;
      return { hasKey: true, source: "user" as const, maskedKey: key.slice(0, 7) + "..." + key.slice(-4) };
    }
    if (process.env.OPENAI_API_KEY) return { hasKey: true, source: "system" as const, maskedKey: "System key active" };
    return { hasKey: false, source: "none" as const };
  },
});

export const setApiKey = mutation({
  args: { apiKey: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const profile = await ctx.db.query("userProfiles").withIndex("by_user", (q: any) => q.eq("userId", userId)).first();
    if (profile) await ctx.db.patch(profile._id, { openaiApiKey: args.apiKey });
  },
});

export const clearApiKey = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const profile = await ctx.db.query("userProfiles").withIndex("by_user", (q: any) => q.eq("userId", userId)).first();
    if (profile) await ctx.db.patch(profile._id, { openaiApiKey: undefined });
  },
});

// ─── COLOR SCHEME ───

export const getColorScheme = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return "vigil-green";
    const profile = await ctx.db.query("userProfiles").withIndex("by_user", (q) => q.eq("userId", userId)).first();
    return profile?.colorScheme || "vigil-green";
  },
});

export const setColorScheme = mutation({
  args: { colorScheme: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const profile = await ctx.db.query("userProfiles").withIndex("by_user", (q: any) => q.eq("userId", userId)).first();
    if (profile) await ctx.db.patch(profile._id, { colorScheme: args.colorScheme });
  },
});

// Speech-to-text using OpenAI Whisper (fallback — streaming uses HTTP endpoint)
export const transcribeAudio = action({
  args: {
    audioBase64: v.string(),
    userApiKey: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const apiKey: string | null = args.userApiKey || process.env.OPENAI_API_KEY || null;
    if (!apiKey) return { text: "", error: "API key not configured." };

    try {
      const binaryString = atob(args.audioBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) { bytes[i] = binaryString.charCodeAt(i); }

      const boundary = "----VIGILBoundary" + Date.now();
      const modelPart = `--${boundary}\r\nContent-Disposition: form-data; name="model"\r\n\r\nwhisper-1\r\n`;
      const fileHeader = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="audio.webm"\r\nContent-Type: audio/webm\r\n\r\n`;
      const fileFooter = `\r\n--${boundary}--\r\n`;

      const enc = new TextEncoder();
      const headerBytes = enc.encode(modelPart + fileHeader);
      const footerBytes = enc.encode(fileFooter);

      const body = new Uint8Array(headerBytes.length + bytes.length + footerBytes.length);
      body.set(headerBytes, 0);
      body.set(bytes, headerBytes.length);
      body.set(footerBytes, headerBytes.length + bytes.length);

      const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": `multipart/form-data; boundary=${boundary}` },
        body: body,
      });

      if (!response.ok) { console.error("Whisper error:", await response.text()); return { text: "", error: "Transcription failed." }; }

      const data = await response.json();
      return { text: data.text || "", error: null };
    } catch (e) {
      console.error("Transcribe error:", e);
      return { text: "", error: "Transcription failed." };
    }
  },
});
