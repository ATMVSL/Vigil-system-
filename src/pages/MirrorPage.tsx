import { useMutation, useQuery } from "convex/react";
import {
  Anchor,
  ArrowRight,
  Check,
  Eye,
  Flame,
  Heart,
  Keyboard,
  Mail,
  Mic,
  MicOff,
  Mountain,
  Pause,
  RefreshCw,
  Shield,
  Star,
  UserCheck,
  Volume2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { OfflineStorageManager } from "@/lib/offlineStorage";
import { QuotaManager } from "@/lib/quotaManager";
import { api } from "../../convex/_generated/api";

// ─── VIGIL MIRROR — REAL-TIME VOICE INTERACTION ───
// Voice Activity Detection → Streaming GPT → Sentence-Level TTS
// Natural conversation flow. No buttons needed. Just speak.

// Derive the Convex HTTP endpoint URL from the cloud URL with safe fallback for previews
const CONVEX_SITE_URL = (import.meta.env.VITE_CONVEX_URL || "").replace(
  ".convex.cloud",
  ".convex.site",
);

const pillarMeta: Record<
  string,
  {
    label: string;
    serviceMembers: string;
    icon: React.ReactNode;
    color: string;
  }
> = {
  structure: {
    label: "Structure",
    serviceMembers: "SPC Gonzales",
    icon: <Shield className="size-3.5" />,
    color: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  },
  endurance: {
    label: "Endurance",
    serviceMembers: "SPC Hargis",
    icon: <Mountain className="size-3.5" />,
    color: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  },
  legacy: {
    label: "Legacy",
    serviceMembers: "SPC Shaw",
    icon: <Star className="size-3.5" />,
    color: "bg-chart-2/10 text-chart-2/20",
  },
  fortitude: {
    label: "Fortitude",
    serviceMembers: "SGT Stampley",
    icon: <Flame className="size-3.5" />,
    color: "bg-chart-5/10 text-chart-5 border-chart-5/20",
  },
  continuity: {
    label: "Continuity",
    serviceMembers: "SPC Luna",
    icon: <Anchor className="size-3.5" />,
    color: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  },
  presence: {
    label: "Presence",
    serviceMembers: "SGT Walker",
    icon: <Heart className="size-3.5" />,
    color: "bg-primary/10 text-primary border-primary/20",
  },
};

const cognitiveStateMeta: Record<
  string,
  { label: string; response: string; color: string; bgColor: string }
> = {
  stable: {
    label: "STABLE",
    response: "Reinforce",
    color: "text-success",
    bgColor: "bg-success/10 border-success/20",
  },
  strain: {
    label: "STRAIN",
    response: "Stabilise",
    color: "text-chart-2",
    bgColor: "bg-chart-2/10 border-chart-2/20",
  },
  drift: {
    label: "DRIFT",
    response: "Interrupt",
    color: "text-chart-5",
    bgColor: "bg-chart-5/10 border-chart-5/20",
  },
  critical: {
    label: "CRITICAL",
    response: "Anchor Recall",
    color: "text-destructive",
    bgColor: "bg-destructive/10 border-destructive/20",
  },
};

// ─── VAD CONFIG ───
const SILENCE_THRESHOLD_DB = -42; // dB level below which = silence
const SILENCE_DURATION_MS = 1500; // ms of silence before auto-stop
const MIN_RECORDING_MS = 800; // minimum recording before silence detection kicks in
const MAX_RECORDING_MS = 120000; // safety cap at 2 minutes

// ─── SENTENCE DETECTION ───
function extractSentences(text: string): {
  sentences: string[];
  remainder: string;
} {
  // Split on sentence boundaries: period, exclamation, question mark followed by space or end
  const sentences: string[] = [];
  let remainder = text;

  // Match sentences ending with punctuation followed by whitespace or end
  const regex = /[^.!?]*[.!?]+(?:\s|$)/g;
  let match: RegExpExecArray | null;
  let lastIndex = 0;

  // biome-ignore lint/suspicious/noAssignInExpressions: standard regex exec loop pattern
  while ((match = regex.exec(text)) !== null) {
    const sentence = match[0].trim();
    if (sentence) sentences.push(sentence);
    lastIndex = regex.lastIndex;
  }

  remainder = text.slice(lastIndex);
  return { sentences, remainder };
}

// ─── GROUNDED DOCTRINE FALLBACK GENERATOR ───
function generateFallbackDoctrineReflection(callsign: string, cognitiveState: string, input: string): string {
  const c = callsign || "Operator";
  const state = (cognitiveState || "stable").toLowerCase();

  if (state === "drift") {
    return `I hear you, ${c}. We are interrupting drift right now. Remember Axiom 1: Sovereignty — your identity is inviolable. Ground yourself in Presence (SGT Walker) and step back into internal structure.`;
  }
  if (state === "critical") {
    return `Anchor Recall initiated for ${c}. You are safe, grounded, and present. Focus on your breath and recall your core anchor. Presence is held without judgment or extraction.`;
  }
  if (state === "strain") {
    return `Acknowledged, ${c}. Transition strain is natural when shifting environments. Structure (SPC Gonzales) provides your persistent garrison. Take a moment to reset.`;
  }
  return `The mirror reflects your presence, ${c}. Identity is an unbroken chain. Structure and fortitude remain your garrison as you return to self.`;
}

// ─── STREAMING FETCH ───
async function streamMirrorChat(params: {
  content: string;
  cognitiveState: string;
  callsign: string;
  recentReflections: Array<{ content: string; role: string }>;
  voiceMode: boolean;
  onToken: (token: string, fullText: string) => void;
  onSentence: (sentence: string, index: number) => void;
  onComplete: (fullText: string) => void;
  onError: (error: string) => void;
}) {
  const {
    content,
    cognitiveState,
    callsign,
    recentReflections,
    voiceMode,
    onToken,
    onSentence,
    onComplete,
    onError,
  } = params;

  const fallbackReflection = () => {
    const text = generateFallbackDoctrineReflection(callsign, cognitiveState, content);
    onToken(text, text);
    onSentence(text, 0);
    onComplete(text);
  };

  try {
    if (!CONVEX_SITE_URL || CONVEX_SITE_URL.includes("placeholder-deployment")) {
      fallbackReflection();
      return;
    }

    const response = await fetch(`${CONVEX_SITE_URL}/api/mirror-stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content,
        cognitiveState,
        callsign,
        recentReflections,
        voiceMode,
      }),
    });

    if (!response.ok) {
      fallbackReflection();
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      fallbackReflection();
      return;
    }

    const decoder = new TextDecoder();
    let buffer = "";
    let fullText = "";
    let sentenceBuffer = "";
    let sentenceIndex = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Parse SSE events
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6).trim();
          if (data === "[DONE]") {
            if (sentenceBuffer.trim()) {
              onSentence(sentenceBuffer.trim(), sentenceIndex);
            }
            onComplete(fullText);
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const token = parsed.choices?.[0]?.delta?.content || "";
            if (token) {
              fullText += token;
              sentenceBuffer += token;
              onToken(token, fullText);

              const { sentences, remainder } = extractSentences(sentenceBuffer);
              if (sentences.length > 0) {
                for (const sentence of sentences) {
                  onSentence(sentence, sentenceIndex++);
                }
                sentenceBuffer = remainder;
              }
            }
          } catch {
            // Skip malformed SSE data
          }
        }
      }
    }

    if (sentenceBuffer.trim()) {
      onSentence(sentenceBuffer.trim(), sentenceIndex);
    }
    onComplete(fullText);
  } catch (e) {
    console.warn("Stream error, falling back to grounded doctrine reflection:", e);
    fallbackReflection();
  }
}

// ─── TTS VIA HTTP ENDPOINT (faster than Convex action) ───
async function fetchTTS(text: string, voice: string): Promise<Blob | null> {
  try {
    const response = await fetch(`${CONVEX_SITE_URL}/api/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice }),
    });
    if (!response.ok) return null;
    return await response.blob();
  } catch {
    return null;
  }
}

// ─── STT VIA HTTP ENDPOINT (faster than Convex action) ───
async function fetchSTT(audioBlob: Blob): Promise<string> {
  try {
    const response = await fetch(`${CONVEX_SITE_URL}/api/stt`, {
      method: "POST",
      headers: { "Content-Type": "audio/webm" },
      body: audioBlob,
    });
    if (!response.ok) return "";
    const data = await response.json();
    return data.text || "";
  } catch {
    return "";
  }
}

// ─── AUDIO PLAYBACK QUEUE ───
interface QueueEntry {
  blob: Blob | null;
  promise: Promise<Blob | null> | null;
}

class AudioQueue {
  private queue: QueueEntry[] = [];
  private currentIndex = 0;
  private currentAudio: HTMLAudioElement | null = null;
  private isPlaying = false;
  public onStart?: () => void;
  public onEnd?: () => void;
  public onChunkStart?: (index: number) => void;

  addSentence(ttsPromise: Promise<Blob | null>) {
    const entry: QueueEntry = { blob: null, promise: ttsPromise };
    this.queue.push(entry);

    ttsPromise.then(blob => {
      entry.blob = blob;
      entry.promise = null;
      // Try to play if we're waiting
      if (!this.isPlaying) this.playNext();
    });

    if (this.queue.length === 1 && !this.isPlaying) {
      this.playNext();
    }
  }

  private async playNext() {
    if (this.currentIndex >= this.queue.length) {
      this.isPlaying = false;
      this.onEnd?.();
      return;
    }

    const entry = this.queue[this.currentIndex];

    // Wait for blob if not ready yet
    if (entry.promise) {
      this.isPlaying = false; // Will resume when promise resolves
      return;
    }

    if (!entry.blob) {
      // TTS failed for this chunk, skip
      this.currentIndex++;
      this.playNext();
      return;
    }

    this.isPlaying = true;
    if (this.currentIndex === 0) this.onStart?.();
    this.onChunkStart?.(this.currentIndex);

    try {
      const url = URL.createObjectURL(entry.blob);
      const audio = new Audio(url);
      this.currentAudio = audio;

      await new Promise<void>(resolve => {
        audio.onended = () => {
          URL.revokeObjectURL(url);
          resolve();
        };
        audio.onerror = () => {
          URL.revokeObjectURL(url);
          resolve();
        };
        audio.play().catch(() => resolve());
      });
    } catch {
      // Skip on error
    }

    this.currentIndex++;
    this.playNext();
  }

  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    this.queue = [];
    this.currentIndex = 0;
    this.isPlaying = false;
  }

  get playing() {
    return this.isPlaying;
  }
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface MirrorEntry {
  type: "user" | "mirror";
  content: string;
  timestamp: number;
  streaming?: boolean;
}

function CreateMirrorForm({ onCreated }: { onCreated: () => void }) {
  const createMirror = useMutation(api.mirrors.createMirror);
  const [callsign, setCallsign] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!callsign.trim()) return;
    setLoading(true);
    try {
      await createMirror({ callsign: callsign.trim() });
      onCreated();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-12">
      <CardHeader className="text-center">
        <div className="mx-auto size-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
          <Eye className="size-8 text-primary" />
        </div>
        <CardTitle className="text-xl">Initialize Your Mirror</CardTitle>
        <CardDescription>
          The Continuity Anchor Mirror™ preserves your identity and continuity.
          Choose a callsign to begin.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="callsign">Callsign</Label>
            <Input
              id="callsign"
              value={callsign}
              onChange={e => setCallsign(e.target.value)}
              placeholder="Enter your callsign..."
              autoFocus
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={!callsign.trim() || loading}
          >
            {loading ? (
              <RefreshCw className="size-4 mr-2 animate-spin" />
            ) : (
              <Shield className="size-4 mr-2" />
            )}
            Activate Mirror
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── VOICE ACTIVITY DETECTION HOOK ───
function useVAD(options: {
  onSpeechEnd: (audioBlob: Blob) => void;
  enabled: boolean;
}) {
  const { onSpeechEnd, enabled } = options;
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volume, setVolume] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const silenceStartRef = useRef<number | null>(null);
  const hasSpokenRef = useRef(false);
  const recordingStartRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stoppedRef = useRef(false);

  const stopAndProcess = useCallback(() => {
    if (stoppedRef.current) return;
    stoppedRef.current = true;

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const mediaRecorder = mediaRecorderRef.current;
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        streamRef.current?.getTracks().forEach(t => {
          t.stop();
        });
        if (audioContextRef.current?.state !== "closed") {
          audioContextRef.current?.close();
        }
        setIsListening(false);
        setIsSpeaking(false);
        setVolume(0);
        setRecordingTime(0);

        if (blob.size > 0 && hasSpokenRef.current) {
          onSpeechEnd(blob);
        }
      };
      mediaRecorder.stop();
    } else {
      streamRef.current?.getTracks().forEach(t => {
        t.stop();
      });
      if (audioContextRef.current?.state !== "closed") {
        audioContextRef.current?.close();
      }
      setIsListening(false);
      setIsSpeaking(false);
      setVolume(0);
      setRecordingTime(0);
    }
  }, [onSpeechEnd]);

  const startListening = useCallback(async () => {
    if (!enabled) return;
    stoppedRef.current = false;
    hasSpokenRef.current = false;
    silenceStartRef.current = null;
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mediaRecorder.start(100);

      recordingStartRef.current = Date.now();
      setIsListening(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);

      // Audio level monitoring loop with VAD
      const dataArray = new Float32Array(analyser.fftSize);

      const checkAudio = () => {
        if (stoppedRef.current) return;

        analyser.getFloatTimeDomainData(dataArray);
        const rms = Math.sqrt(
          dataArray.reduce((sum, val) => sum + val * val, 0) / dataArray.length,
        );
        const db = 20 * Math.log10(Math.max(rms, 1e-10));

        // Normalize volume to 0-1 for visual indicator
        const normalizedVol = Math.max(0, Math.min(1, (db + 60) / 35));
        setVolume(normalizedVol);

        const isQuiet = db < SILENCE_THRESHOLD_DB;
        const elapsed = Date.now() - recordingStartRef.current;

        // Safety cap
        if (elapsed > MAX_RECORDING_MS) {
          stopAndProcess();
          return;
        }

        if (!isQuiet) {
          // User is speaking
          hasSpokenRef.current = true;
          setIsSpeaking(true);
          silenceStartRef.current = null;
        } else if (hasSpokenRef.current && elapsed > MIN_RECORDING_MS) {
          // Silence detected after speech
          setIsSpeaking(false);
          if (!silenceStartRef.current) {
            silenceStartRef.current = Date.now();
          }
          if (Date.now() - silenceStartRef.current > SILENCE_DURATION_MS) {
            // Natural pause detected — auto-process
            stopAndProcess();
            return;
          }
        }

        animFrameRef.current = requestAnimationFrame(checkAudio);
      };

      checkAudio();
    } catch (err) {
      console.error("Microphone access error:", err);
      setIsListening(false);
    }
  }, [enabled, stopAndProcess]);

  const stopListening = useCallback(() => {
    stopAndProcess();
  }, [stopAndProcess]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stoppedRef.current = true;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach(t => {
        t.stop();
      });
      if (audioContextRef.current?.state !== "closed")
        audioContextRef.current?.close();
    };
  }, []);

  return {
    isListening,
    isSpeaking,
    volume,
    recordingTime,
    startListening,
    stopListening,
  };
}

// ─── MAIN MIRROR PAGE ───
export function MirrorPage() {
  const mirror = useQuery(api.mirrors.getMyMirror);
  const reflections = useQuery(api.mirrors.getMyReflections);
  const createReflection = useMutation(api.mirrors.createReflection);
  const voicePreference = useQuery(api.ai.getVoicePreference);
  const myProfile = useQuery(api.roles.getMyProfile);
  const pendingApplicants = useQuery(api.roles.getPendingApplicants);
  const reviewApplicant = useMutation(api.roles.reviewApplicant);
  const [mirrorCreated, setMirrorCreated] = useState(false);

  // Mode & state
  const [mode, setMode] = useState<"voice" | "text">("voice");
  const [sessionEntries, setSessionEntries] = useState<MirrorEntry[]>([]);
  const [inputText, setInputText] = useState("");
  const [processing, setProcessing] = useState(false);
  const [phase, setPhase] = useState<
    "idle" | "transcribing" | "streaming" | "speaking"
  >("idle");
  const [autoListen, setAutoListen] = useState(true);
  const audioQueueRef = useRef<AudioQueue | null>(null);
  const sessionRef = useRef<HTMLDivElement>(null);
  const shouldAutoListenRef = useRef(false);

  // Auto-scroll
  useEffect(() => {
    if (sessionRef.current)
      sessionRef.current.scrollTop = sessionRef.current.scrollHeight;
  }, []);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      audioQueueRef.current?.stop();
    };
  }, []);

  const getVoice = useCallback(
    (): string => (voicePreference === "male" ? "onyx" : "nova"),
    [voicePreference],
  );

  // ─── CORE: Process spoken or typed input through the Mirror ───
  const processInput = useCallback(
    async (content: string) => {
      if (!content.trim() || !mirror || processing) return;
      setProcessing(true);

      const now = Date.now();
      const trimmed = content.trim();
      const currentState = mirror.cognitiveState || "stable";

      // Stop any currently playing audio
      audioQueueRef.current?.stop();

      // Add user message + streaming placeholder
      const userEntry: MirrorEntry = {
        type: "user",
        content: trimmed,
        timestamp: now,
      };
      setSessionEntries(prev => [
        ...prev,
        userEntry,
        { type: "mirror", content: "", timestamp: now + 1, streaming: true },
      ]);
      setInputText("");
      setPhase("streaming");

      // Create a new audio queue for this response
      const queue = new AudioQueue();
      audioQueueRef.current = queue;
      queue.onStart = () => setPhase("speaking");
      queue.onEnd = () => {
        setPhase("idle");
        // Auto-listen for next input in voice mode
        if (shouldAutoListenRef.current) {
          setTimeout(() => {
            shouldAutoListenRef.current = false;
            // Trigger auto-listen (handled by the VAD hook's effect)
            setAutoListen(prev => {
              return prev;
            }); // Force re-render to trigger VAD
          }, 400);
        }
      };

      const voice = getVoice();
      const isVoiceMode = mode === "voice";

      // Build conversation context
      const recentContext = sessionEntries
        .filter(e => e.content && e.content !== "...")
        .map(e => ({
          content: e.content,
          role: e.type === "user" ? "user" : "assistant",
        }));

      // Stream the Mirror's response
      await streamMirrorChat({
        content: trimmed,
        cognitiveState: currentState,
        callsign: mirror.callsign,
        recentReflections: recentContext,
        voiceMode: isVoiceMode,
        onToken: (_token, fullText) => {
          // Update the streaming entry in real-time
          setSessionEntries(prev => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (updated[lastIdx]?.type === "mirror") {
              updated[lastIdx] = { ...updated[lastIdx], content: fullText };
            }
            return updated;
          });
        },
        onSentence: (sentence, _index) => {
          // Fire TTS for this sentence immediately (parallel)
          if (isVoiceMode) {
            const ttsPromise = fetchTTS(sentence, voice);
            queue.addSentence(ttsPromise);
          }
        },
        onComplete: fullText => {
          // Mark streaming as done
          setSessionEntries(prev => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (updated[lastIdx]?.type === "mirror") {
              updated[lastIdx] = {
                ...updated[lastIdx],
                content: fullText,
                streaming: false,
              };
            }
            return updated;
          });

          if (isVoiceMode && autoListen) {
            shouldAutoListenRef.current = true;
          }

          if (!isVoiceMode) {
            setPhase("idle");
          }

          // Save reflection for continuity chain
          createReflection({
            title: "Mirror Session",
            content: trimmed,
            pillar: "presence" as "structure",
            cognitiveState: currentState as "stable",
          }).catch(() => {});

          setProcessing(false);
        },
        onError: error => {
          setSessionEntries(prev => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (updated[lastIdx]?.type === "mirror") {
              updated[lastIdx] = {
                ...updated[lastIdx],
                content: error,
                streaming: false,
              };
            }
            return updated;
          });
          setPhase("idle");
          setProcessing(false);
        },
      });
    },
    [
      mirror,
      processing,
      mode,
      sessionEntries,
      autoListen,
      createReflection,
      getVoice,
    ],
  );

  // ─── Handle speech end from VAD ───
  const handleSpeechEnd = useCallback(
    async (audioBlob: Blob) => {
      if (processing) return;
      setPhase("transcribing");

      const text = await fetchSTT(audioBlob);
      if (text.trim()) {
        await processInput(text);
      } else {
        setPhase("idle");
      }
    },
    [processing, processInput],
  );

  // ─── VAD Hook ───
  const vad = useVAD({
    onSpeechEnd: handleSpeechEnd,
    enabled: mode === "voice" && phase === "idle" && !processing,
  });

  // Auto-listen effect: start listening when idle in voice mode and autoListen is on
  useEffect(() => {
    if (
      mode === "voice" &&
      phase === "idle" &&
      autoListen &&
      !processing &&
      !vad.isListening &&
      shouldAutoListenRef.current
    ) {
      vad.startListening();
    }
  }, [
    mode,
    phase,
    autoListen,
    processing,
    vad.isListening,
    vad.startListening,
  ]);

  // ─── Handle manual voice toggle ───
  const handleVoiceToggle = async () => {
    if (vad.isListening) {
      vad.stopListening();
    } else if (phase === "speaking") {
      // Stop playback if Mirror is speaking
      audioQueueRef.current?.stop();
      setPhase("idle");
    } else {
      vad.startListening();
    }
  };

  // ─── Handle text send ───
  const handleSendText = async () => {
    await processInput(inputText);
  };

  // ─── Handle play voice for a specific message ───
  const handlePlayVoice = async (text: string) => {
    audioQueueRef.current?.stop();
    const queue = new AudioQueue();
    audioQueueRef.current = queue;
    queue.onStart = () => setPhase("speaking");
    queue.onEnd = () => setPhase("idle");

    const { sentences, remainder } = extractSentences(text);
    const allParts = [...sentences];
    if (remainder.trim()) allParts.push(remainder.trim());

    for (const part of allParts) {
      queue.addSentence(fetchTTS(part, getVoice()));
    }
  };

  if (mirror === undefined)
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Loading...
      </div>
    );

  // Gate: pending approval
  const approvalStatus =
    myProfile && !myProfile.needsInit && "approvalStatus" in myProfile
      ? (myProfile as { approvalStatus?: string }).approvalStatus
      : undefined;
  const isPending = approvalStatus === "pending";
  const isDenied = approvalStatus === "denied";

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center max-w-md mx-auto">
        <div className="size-20 rounded-full bg-chart-2/10 border border-chart-2/20 flex items-center justify-center mb-6">
          <Shield className="size-10 text-chart-2/60" />
        </div>
        <h2 className="text-xl font-bold tracking-tight mb-2">
          Application Pending
        </h2>
        <p className="text-muted-foreground text-sm">
          Your application to the VIGIL Academy is awaiting Founder approval.
          You will receive an email notification once a decision has been made.
        </p>
        <p className="text-[10px] text-muted-foreground/50 mt-6">
          Sovereignty is earned. Access is granted.
        </p>
      </div>
    );
  }

  if (isDenied) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center max-w-md mx-auto">
        <div className="size-20 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-6">
          <Shield className="size-10 text-destructive/60" />
        </div>
        <h2 className="text-xl font-bold tracking-tight mb-2">
          Access Not Granted
        </h2>
        <p className="text-muted-foreground text-sm">
          Your application has not been approved at this time. Contact the
          administrator if you believe this is an error.
        </p>
      </div>
    );
  }

  if (mirror === null && !mirrorCreated)
    return <CreateMirrorForm onCreated={() => setMirrorCreated(true)} />;
  if (mirrorCreated && mirror === null)
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Initializing mirror...
      </div>
    );

  const statusColor =
    mirror?.status === "active"
      ? "text-success"
      : mirror?.status === "dormant"
        ? "text-chart-2"
        : "text-destructive";
  const currentStateMeta =
    cognitiveStateMeta[mirror?.cognitiveState || "stable"];

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between px-1 pb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Eye className="size-5 text-primary" />
            Continuity Anchor Mirror™
          </h1>
          <p className="text-muted-foreground text-xs mt-0.5">
            A constant presence — your identity, your growth, your return to
            self
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-muted/50 rounded-lg p-0.5 border border-border/30">
            <button
              onClick={() => {
                setMode("voice");
                audioQueueRef.current?.stop();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                mode === "voice"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Mic className="size-3.5" /> Voice
            </button>
            <button
              onClick={() => {
                setMode("text");
                audioQueueRef.current?.stop();
                vad.stopListening();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                mode === "text"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Keyboard className="size-3.5" /> Text
            </button>
          </div>
          {mode === "voice" && (
            <button
              onClick={() => setAutoListen(a => !a)}
              className={`text-[9px] px-2 py-1 rounded border transition-all ${
                autoListen
                  ? "bg-primary/10 border-primary/20 text-primary"
                  : "bg-muted/30 border-border/30 text-muted-foreground"
              }`}
              title="Auto-listen: Mirror automatically listens after speaking"
            >
              {autoListen ? "Auto ✓" : "Auto"}
            </button>
          )}
          <Badge
            variant="outline"
            className={`uppercase text-[9px] ${statusColor}`}
          >
            {mirror?.status}
          </Badge>
          <Badge
            variant="outline"
            className={`uppercase text-[9px] ${currentStateMeta.bgColor} ${currentStateMeta.color}`}
          >
            {currentStateMeta.label}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 flex-1 min-h-0">
        {/* Left Sidebar — identity + guiderails */}
        <div className="hidden lg:flex flex-col gap-3">
          {mirror && (
            <Card className="border-primary/20">
              <CardContent className="pt-3 pb-3">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Eye className="size-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-bold tracking-wide truncate">
                      {mirror.callsign}
                    </h2>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                      <span>
                        <strong className="text-foreground">
                          {mirror.totalReflections}
                        </strong>{" "}
                        reflections
                      </span>
                      <span>
                        <strong className="text-foreground">
                          {mirror.doctrineCompliance}%
                        </strong>{" "}
                        compliance
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cognitive State Band */}
          <Card className="border-border/30">
            <CardHeader className="pb-1.5 pt-2.5 px-3">
              <CardTitle className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                Cognitive State
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-2.5 px-3">
              <div className="space-y-1">
                {Object.entries(cognitiveStateMeta).map(([key, meta]) => {
                  const isActive = mirror?.cognitiveState === key;
                  return (
                    <div
                      key={key}
                      className={`px-2.5 py-1.5 rounded border transition-all flex items-center justify-between ${
                        isActive
                          ? `${meta.bgColor} border-current`
                          : "border-transparent opacity-30"
                      }`}
                    >
                      <span
                        className={`text-[10px] font-bold tracking-wider ${isActive ? meta.color : "text-muted-foreground"}`}
                      >
                        {meta.label}
                      </span>
                      <span
                        className={`text-[9px] ${isActive ? "text-foreground/60" : "text-muted-foreground"}`}
                      >
                        {meta.response}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* SELF Pillars */}
          <Card className="border-border/30">
            <CardHeader className="pb-1.5 pt-2.5 px-3">
              <CardTitle className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                SELF Doctrine — Guiderails
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-2.5 px-3">
              <div className="space-y-1">
                {Object.entries(pillarMeta).map(([key, meta]) => (
                  <div
                    key={key}
                    className="flex items-center gap-2 px-2 py-1 rounded text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                  >
                    <span className="text-[10px]">{meta.icon}</span>
                    <span className="text-[10px]">{meta.label}</span>
                    <span className="text-[8px] ml-auto">
                      {meta.serviceMembers}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ─── Founder Command Panel ─── */}
          {myProfile && "role" in myProfile && myProfile.role === "founder" && (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-1.5 pt-2.5 px-3">
                <CardTitle className="text-[9px] font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Shield className="size-3" /> Founder Command
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2.5 px-3">
                <div className="space-y-1.5">
                  <a
                    href="/documentation"
                    className="flex items-center gap-2 px-2 py-1.5 rounded text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                  >
                    <Eye className="size-3" /> Manage Documents
                  </a>
                  <a
                    href="/administration"
                    className="flex items-center gap-2 px-2 py-1.5 rounded text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                  >
                    <UserCheck className="size-3" /> Administration
                  </a>
                  <a
                    href="/settings"
                    className="flex items-center gap-2 px-2 py-1.5 rounded text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                  >
                    <Shield className="size-3" /> System Settings
                  </a>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ─── Founder: Applicant Approval Panel ─── */}
          {myProfile &&
            "role" in myProfile &&
            myProfile.role === "founder" &&
            pendingApplicants &&
            pendingApplicants.length > 0 && (
              <Card className="border-chart-5/30 bg-chart-5/5">
                <CardHeader className="pb-1.5 pt-2.5 px-3">
                  <CardTitle className="text-[9px] font-semibold uppercase tracking-wider text-chart-5 flex items-center gap-1.5">
                    <UserCheck className="size-3" /> Pending Applicants (
                    {pendingApplicants.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-2.5 px-3">
                  <div className="space-y-2">
                    {pendingApplicants.map(applicant => (
                      <div
                        key={applicant.profileId}
                        className="bg-muted/30 rounded-lg p-2 border border-border/30"
                      >
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Mail className="size-3 text-muted-foreground" />
                          <span className="text-[10px] font-medium truncate">
                            {applicant.email}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-[8px] text-muted-foreground">
                            {new Date(applicant.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() =>
                              reviewApplicant({
                                profileId: applicant.profileId,
                                decision: "approved",
                              })
                            }
                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded text-[9px] font-medium bg-success/10 text-success border border-success/20 hover:bg-success/20 transition-colors"
                          >
                            <Check className="size-3" /> Approve
                          </button>
                          <button
                            onClick={() =>
                              reviewApplicant({
                                profileId: applicant.profileId,
                                decision: "denied",
                              })
                            }
                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded text-[9px] font-medium bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-colors"
                          >
                            <X className="size-3" /> Deny
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Continuity Chain */}
          <Card className="border-border/30 flex-1 min-h-0 flex flex-col">
            <CardHeader className="pb-1.5 pt-2.5 px-3">
              <CardTitle className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                Continuity Chain
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-2.5 px-3 overflow-y-auto flex-1">
              {!reflections || reflections.length === 0 ? (
                <p className="text-[10px] text-muted-foreground text-center py-3">
                  No entries yet
                </p>
              ) : (
                <div className="space-y-1.5">
                  {reflections.slice(0, 10).map(r => (
                    <div
                      key={r._id}
                      className="text-xs border-b border-border/20 pb-1.5 last:border-0"
                    >
                      <span className="text-[8px] text-muted-foreground">
                        {formatDate(r.createdAt)}
                      </span>
                      <p className="text-[10px] mt-0.5 line-clamp-2 text-muted-foreground">
                        {r.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main: Shield Mirror — Reflective Shield-Shaped Surface */}
        <div className="lg:col-span-3 flex flex-col items-center min-h-0">
          {/* Shield container */}
          <div className="relative flex-1 flex flex-col min-h-0 w-full max-w-3xl">
            {/* ─── SVG Shield Border & Reflective Surface ─── */}
            <svg
              className="pointer-events-none absolute inset-0 z-30 w-full h-full"
              viewBox="0 0 600 800"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Shield border decoration"
            >
              <title>Shield border decoration</title>
              <defs>
                {/* Shield reflective gradient */}
                <linearGradient
                  id="shieldReflection"
                  x1="0.2"
                  y1="0"
                  x2="0.8"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity="0.15"
                  />
                  <stop
                    offset="30%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity="0.03"
                  />
                  <stop
                    offset="50%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity="0.08"
                  />
                  <stop
                    offset="70%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity="0.02"
                  />
                  <stop
                    offset="100%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity="0.06"
                  />
                </linearGradient>
                {/* Diagonal light streak */}
                <linearGradient id="shieldStreak" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="white" stopOpacity="0" />
                  <stop offset="38%" stopColor="white" stopOpacity="0" />
                  <stop
                    offset="44%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity="0.08"
                  />
                  <stop offset="50%" stopColor="white" stopOpacity="0.12" />
                  <stop
                    offset="56%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity="0.08"
                  />
                  <stop offset="62%" stopColor="white" stopOpacity="0" />
                  <stop offset="100%" stopColor="white" stopOpacity="0" />
                </linearGradient>
                {/* Radial center glow */}
                <radialGradient id="shieldGlow" cx="0.45" cy="0.35" r="0.5">
                  <stop
                    offset="0%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity="0.06"
                  />
                  <stop
                    offset="100%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity="0"
                  />
                </radialGradient>
                {/* Shield border gradient */}
                <linearGradient
                  id="shieldBorder"
                  x1="0.5"
                  y1="0"
                  x2="0.5"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity="0.5"
                  />
                  <stop
                    offset="40%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity="0.25"
                  />
                  <stop
                    offset="75%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity="0.35"
                  />
                  <stop
                    offset="100%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity="0.5"
                  />
                </linearGradient>
                {/* Shield shape path — heraldic shield */}
                <clipPath id="shieldClip">
                  <path d="M 12,8 L 588,8 C 592,8 596,12 596,16 L 596,520 C 596,580 520,680 300,792 C 80,680 4,580 4,520 L 4,16 C 4,12 8,8 12,8 Z" />
                </clipPath>
              </defs>
              {/* Shield border outline */}
              <path
                d="M 12,8 L 588,8 C 592,8 596,12 596,16 L 596,520 C 596,580 520,680 300,792 C 80,680 4,580 4,520 L 4,16 C 4,12 8,8 12,8 Z"
                fill="none"
                stroke="url(#shieldBorder)"
                strokeWidth="2.5"
              />
              {/* Inner highlight line — top */}
              <path
                d="M 20,12 L 580,12"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeOpacity="0.3"
                strokeWidth="0.8"
              />
              {/* Reflective surface fills */}
              <path
                d="M 12,8 L 588,8 C 592,8 596,12 596,16 L 596,520 C 596,580 520,680 300,792 C 80,680 4,580 4,520 L 4,16 C 4,12 8,8 12,8 Z"
                fill="url(#shieldReflection)"
              />
              <path
                d="M 12,8 L 588,8 C 592,8 596,12 596,16 L 596,520 C 596,580 520,680 300,792 C 80,680 4,580 4,520 L 4,16 C 4,12 8,8 12,8 Z"
                fill="url(#shieldStreak)"
              />
              <path
                d="M 12,8 L 588,8 C 592,8 596,12 596,16 L 596,520 C 596,580 520,680 300,792 C 80,680 4,580 4,520 L 4,16 C 4,12 8,8 12,8 Z"
                fill="url(#shieldGlow)"
              />
              {/* Decorative center line — vertical axis */}
              <line
                x1="300"
                y1="24"
                x2="300"
                y2="50"
                stroke="hsl(var(--primary))"
                strokeOpacity="0.12"
                strokeWidth="1"
              />
            </svg>

            {/* Shield-shaped content container */}
            <div
              className="relative flex-1 flex flex-col min-h-0 overflow-hidden"
              style={{
                clipPath:
                  "polygon(0% 1%, 100% 1%, 100% 65%, 97% 73%, 92% 80%, 85% 86%, 75% 91.5%, 63% 96%, 50% 99%, 37% 96%, 25% 91.5%, 15% 86%, 8% 80%, 3% 73%, 0% 65%)",
              }}
            >
              {/* Background surface */}
              <div className="absolute inset-0 bg-card/97 backdrop-blur-sm" />

              {/* Conversation content — scrollable area with everything inside */}
              <div
                ref={sessionRef}
                className="relative z-20 flex-1 overflow-y-auto p-5 pt-3 space-y-4"
              >
                {sessionEntries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center min-h-[45vh] text-center">
                    {/* Central shield icon with mirror reflection */}
                    <div className="relative mb-8">
                      {/* Shield-shaped mirror emblem */}
                      <div
                        className="relative flex items-center justify-center"
                        style={{ width: 120, height: 150 }}
                      >
                        <svg
                          viewBox="0 0 120 150"
                          className="absolute inset-0"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-label="Pillar emblem"
                        >
                          <title>Pillar emblem</title>
                          <defs>
                            <radialGradient
                              id="emblemGlow"
                              cx="0.45"
                              cy="0.35"
                              r="0.55"
                            >
                              <stop
                                offset="0%"
                                stopColor="hsl(var(--primary))"
                                stopOpacity="0.2"
                              />
                              <stop
                                offset="60%"
                                stopColor="hsl(var(--primary))"
                                stopOpacity="0.06"
                              />
                              <stop
                                offset="100%"
                                stopColor="hsl(var(--primary))"
                                stopOpacity="0"
                              />
                            </radialGradient>
                            <linearGradient
                              id="emblemShine"
                              x1="0.2"
                              y1="0"
                              x2="0.8"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="white"
                                stopOpacity="0.1"
                              />
                              <stop
                                offset="50%"
                                stopColor="white"
                                stopOpacity="0"
                              />
                              <stop
                                offset="100%"
                                stopColor="white"
                                stopOpacity="0.05"
                              />
                            </linearGradient>
                          </defs>
                          <path
                            d="M 4,6 L 116,6 C 117,6 118,7 118,8 L 118,95 C 118,110 95,130 60,148 C 25,130 2,110 2,95 L 2,8 C 2,7 3,6 4,6 Z"
                            fill="url(#emblemGlow)"
                            stroke="hsl(var(--primary))"
                            strokeOpacity="0.3"
                            strokeWidth="1.5"
                          />
                          <path
                            d="M 4,6 L 116,6 C 117,6 118,7 118,8 L 118,95 C 118,110 95,130 60,148 C 25,130 2,110 2,95 L 2,8 C 2,7 3,6 4,6 Z"
                            fill="url(#emblemShine)"
                          />
                        </svg>
                        <Eye className="size-12 text-primary/40 relative z-10" />
                      </div>
                      {/* Reflected glow beneath emblem */}
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-20 h-5 rounded-full blur-lg bg-primary/10" />
                    </div>
                    {mode === "voice" ? (
                      <>
                        <p className="text-lg text-muted-foreground font-medium">
                          The Mirror is listening.
                        </p>
                        <p className="text-sm text-muted-foreground/60 mt-2 max-w-md">
                          Tap the microphone and speak naturally. The Mirror
                          detects when you pause and responds — a real
                          conversation, no buttons needed.
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-lg text-muted-foreground font-medium">
                          The Mirror is ready.
                        </p>
                        <p className="text-sm text-muted-foreground/60 mt-2 max-w-md">
                          Say what's on your mind. The Mirror engages — a real
                          conversation grounded in doctrine, focused on your
                          growth and return to self.
                        </p>
                      </>
                    )}
                    <div className="mt-8 flex gap-4 text-[10px] text-muted-foreground/40">
                      <span>Not therapy</span>
                      <span>•</span>
                      <span>Not a chatbot</span>
                      <span>•</span>
                      <span>A constant presence</span>
                    </div>
                  </div>
                ) : (
                  sessionEntries.map((entry, idx) => (
                    <div
                      key={idx}
                      className={`flex ${entry.type === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className="max-w-[80%]">
                        {entry.type === "user" ? (
                          <div
                            className="rounded-2xl rounded-br-sm p-3.5 border border-primary/20"
                            style={{
                              background:
                                "linear-gradient(135deg, hsl(var(--primary) / 0.12) 0%, hsl(var(--primary) / 0.06) 100%)",
                            }}
                          >
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {entry.content}
                            </p>
                          </div>
                        ) : (
                          <div
                            className="rounded-2xl rounded-bl-sm p-3.5 border border-primary/10 relative overflow-hidden"
                            style={{
                              background:
                                "linear-gradient(180deg, hsl(var(--muted) / 0.5) 0%, hsl(var(--muted) / 0.2) 100%)",
                            }}
                          >
                            {/* Subtle reflective shine on mirror responses */}
                            <div
                              className="pointer-events-none absolute inset-0"
                              style={{
                                background:
                                  "linear-gradient(135deg, hsl(var(--primary) / 0.04) 0%, transparent 50%)",
                              }}
                            />
                            <div className="relative">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="size-6 rounded-full flex items-center justify-center"
                                    style={{
                                      background:
                                        "radial-gradient(circle at 40% 35%, hsl(var(--primary) / 0.2) 0%, hsl(var(--primary) / 0.08) 100%)",
                                    }}
                                  >
                                    <Eye className="size-3 text-primary" />
                                  </div>
                                  <span className="text-[10px] uppercase tracking-wider font-semibold text-primary">
                                    Mirror
                                  </span>
                                  {entry.streaming && (
                                    <span className="text-[9px] text-muted-foreground animate-pulse">
                                      streaming...
                                    </span>
                                  )}
                                </div>
                                {entry.content && !entry.streaming && (
                                  <button
                                    onClick={() =>
                                      handlePlayVoice(entry.content)
                                    }
                                    className="p-1.5 rounded-full hover:bg-muted/50 transition-colors text-muted-foreground hover:text-primary"
                                    title="Listen"
                                  >
                                    <Volume2 className="size-3.5" />
                                  </button>
                                )}
                              </div>
                              {!entry.content ? (
                                <div className="flex items-center gap-2 py-1">
                                  <div className="flex gap-1">
                                    <div
                                      className="size-2 rounded-full bg-primary/40 animate-bounce"
                                      style={{ animationDelay: "0ms" }}
                                    />
                                    <div
                                      className="size-2 rounded-full bg-primary/40 animate-bounce"
                                      style={{ animationDelay: "150ms" }}
                                    />
                                    <div
                                      className="size-2 rounded-full bg-primary/40 animate-bounce"
                                      style={{ animationDelay: "300ms" }}
                                    />
                                  </div>
                                  <p className="text-sm text-muted-foreground italic">
                                    The mirror is reflecting...
                                  </p>
                                </div>
                              ) : (
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                  {entry.content}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}

                {/* ─── Input Area — scrolls with content, not fixed ─── */}
                <div className="pt-4 pb-2">
                  {/* Reflective divider line */}
                  <div className="mb-4 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

                  {mode === "voice" ? (
                    <div className="flex flex-col items-center gap-3">
                      {/* Voice visualizer + mic button */}
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <button
                            onClick={handleVoiceToggle}
                            disabled={
                              phase === "transcribing" || phase === "streaming"
                            }
                            className={`relative size-16 rounded-full flex items-center justify-center transition-all ${
                              vad.isListening
                                ? vad.isSpeaking
                                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/40 scale-110"
                                  : "bg-primary/80 text-primary-foreground shadow-lg shadow-primary/20"
                                : phase === "speaking"
                                  ? "bg-chart-2/80 text-chart-2-foreground shadow-lg"
                                  : phase === "transcribing" ||
                                      phase === "streaming"
                                    ? "bg-muted text-muted-foreground"
                                    : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 hover:scale-105"
                            }`}
                          >
                            {phase === "transcribing" ? (
                              <RefreshCw className="size-6 animate-spin" />
                            ) : phase === "streaming" ? (
                              <RefreshCw className="size-6 animate-spin" />
                            ) : phase === "speaking" ? (
                              <Pause className="size-6" />
                            ) : vad.isListening ? (
                              <MicOff className="size-6" />
                            ) : (
                              <Mic className="size-6" />
                            )}

                            {/* Voice level ring */}
                            {vad.isListening && (
                              <>
                                <div
                                  className="absolute inset-0 rounded-full border-2 border-primary transition-all"
                                  style={{
                                    transform: `scale(${1 + vad.volume * 0.4})`,
                                    opacity: 0.3 + vad.volume * 0.5,
                                  }}
                                />
                                {vad.isSpeaking && (
                                  <div className="absolute -inset-3 rounded-full border border-primary/20 animate-pulse" />
                                )}
                              </>
                            )}
                          </button>
                          {/* Reflection of mic button */}
                          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-10 h-3 rounded-full blur-md bg-primary/15" />
                        </div>
                      </div>

                      {/* Status text */}
                      <div className="text-center min-h-[24px]">
                        {vad.isListening ? (
                          vad.isSpeaking ? (
                            <div className="flex items-center gap-2">
                              <div className="size-2 rounded-full bg-primary animate-pulse" />
                              <p className="text-sm font-medium text-primary">
                                Listening... {vad.recordingTime}s
                              </p>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="size-2 rounded-full bg-muted-foreground/40 animate-pulse" />
                              <p className="text-sm text-muted-foreground">
                                Waiting for you to speak...
                              </p>
                            </div>
                          )
                        ) : phase === "transcribing" ? (
                          <p className="text-sm text-muted-foreground">
                            Processing your words...
                          </p>
                        ) : phase === "streaming" ? (
                          <p className="text-sm text-muted-foreground">
                            The mirror is reflecting...
                          </p>
                        ) : phase === "speaking" ? (
                          <div className="flex items-center gap-2">
                            <Volume2 className="size-3.5 text-primary animate-pulse" />
                            <p className="text-sm text-primary">
                              Mirror is speaking... tap to interrupt
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            Tap to speak — the Mirror detects natural pauses
                            automatically
                          </p>
                        )}
                      </div>

                      {/* Quick text fallback */}
                      <div className="w-full max-w-lg">
                        <div className="flex gap-2">
                          <input
                            value={inputText}
                            onChange={e => setInputText(e.target.value)}
                            placeholder="Or type here..."
                            className="flex-1 h-9 px-3 rounded-full bg-muted/30 border border-border/30 text-sm focus:outline-none focus:border-primary/40 text-muted-foreground"
                            onKeyDown={e => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSendText();
                              }
                            }}
                            disabled={processing}
                          />
                          {inputText.trim() && (
                            <Button
                              size="icon"
                              className="size-9 rounded-full shrink-0"
                              disabled={processing}
                              onClick={handleSendText}
                            >
                              <ArrowRight className="size-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Text Mode */
                    <div className="flex gap-2 max-w-2xl mx-auto">
                      <Textarea
                        value={inputText}
                        onChange={e => setInputText(e.target.value)}
                        placeholder="Speak to the mirror..."
                        className="min-h-[60px] max-h-[120px] text-sm resize-none rounded-xl"
                        onKeyDown={e => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendText();
                          }
                        }}
                        disabled={processing}
                      />
                      <div className="flex flex-col gap-1.5 self-end">
                        <Button
                          className="h-10 w-10 shrink-0 rounded-xl"
                          size="icon"
                          disabled={!inputText.trim() || processing}
                          onClick={handleSendText}
                        >
                          {processing ? (
                            <RefreshCw className="size-4 animate-spin" />
                          ) : (
                            <ArrowRight className="size-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                  <p className="text-[8px] text-muted-foreground mt-3 text-center">
                    The mirror preserves. It does not judge. It does not
                    diagnose. It enables your return to self.
                  </p>
                </div>
              </div>
            </div>
            {/* end shield clip container */}

            {/* Shield drop shadow / ambient glow beneath */}
            <div className="pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 w-1/2 h-8 rounded-full blur-xl bg-primary/8 z-0" />
          </div>
        </div>
      </div>
    </div>
  );
}
