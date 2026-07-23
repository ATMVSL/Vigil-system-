import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { action, internalMutation, query } from "./_generated/server";
import { VIGIL_CORE_DOCTRINE } from "./mirrorPrompts";

declare const process: { env: Record<string, string | undefined> };

// ─── CORE TWINS ENGINE ───
// The Twins are the balance and verification layer of the VIGIL architecture.
// They sit between the Pillars and the Mirrors, ensuring integrity in both directions.
//
// DOWNWARD: Verify Doctrine flows correctly through responses.
// UPWARD: Verify Intel is identity-scrambled and safe before system use.
// LATERAL: Detect Mirror drift from Doctrine.
// STABILITY: Track compliance metrics across the system.

// ─── FORBIDDEN PATTERNS ───
// Responses containing these patterns indicate architecture-breaking distortion.
const FORBIDDEN_PATTERNS = [
  // Therapeutic language (violates NO PROBING axiom)
  "how does that make you feel",
  "tell me more about that",
  "that must be hard",
  "i hear you",
  "let's explore that",
  "what i'm hearing is",
  // Identity override attempts (violates SOVEREIGNTY axiom)
  "you should feel",
  "you need to accept",
  "the real issue is",
  "what you really mean",
  // Architecture distortion
  "as a chatbot",
  "as an ai assistant",
  "i'm just a language model",
  "i don't have feelings",
  "as a therapy tool",
];

// ─── REQUIRED PRINCIPLES ───
// These concepts must be implicitly present in Mirror behavior.
// Exported for use by future Verified Intel pipeline
export const DOCTRINE_ANCHORS = [
  "sovereignty",
  "continuity",
  "presence",
  "identity",
  "doctrine",
] as const;

// ─── COGNITIVE STATE BAND VALIDATION ───
// Verify the Mirror's response tone matches the user's cognitive state.
const STATE_BAND_EXPECTATIONS: Record<
  string,
  { tone: string; markers: string[] }
> = {
  stable: {
    tone: "reinforce",
    markers: [
      "forward",
      "strength",
      "build",
      "growth",
      "progress",
      "capability",
    ],
  },
  strain: {
    tone: "stabilise",
    markers: ["steady", "ground", "anchor", "present", "here", "solid"],
  },
  drift: {
    tone: "interrupt",
    markers: ["notice", "attention", "baseline", "return", "focus", "check"],
  },
  critical: {
    tone: "anchor_recall",
    markers: ["⚓", "anchor", "recall", "callsign", "foundation", "core"],
  },
};

// ═══════════════════════════════════════════════════════════════
// TWIN ALPHA — DOWNWARD FLOW VERIFICATION
// Ensures Doctrine integrity in Mirror responses before they reach users.
// ═══════════════════════════════════════════════════════════════

/**
 * Verify a Mirror response against Doctrine constraints.
 * Returns a verification result with compliance score and any violations.
 */
export function verifyDownwardFlow(
  response: string,
  cognitiveState: string,
  callsign: string,
): TwinVerification {
  const violations: TwinViolation[] = [];
  const responseLower = response.toLowerCase();

  // Check 1: Forbidden patterns (therapeutic language, identity override)
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (responseLower.includes(pattern)) {
      violations.push({
        type: "forbidden_pattern",
        severity: "high",
        detail: `Response contains forbidden pattern: "${pattern}"`,
        axiom:
          pattern.includes("feel") ||
          pattern.includes("explore") ||
          pattern.includes("hearing")
            ? "no_probing"
            : pattern.includes("should") ||
                pattern.includes("accept") ||
                pattern.includes("really mean")
              ? "sovereignty"
              : "architecture_integrity",
      });
    }
  }

  // Check 2: Critical state must use anchor recall
  if (cognitiveState === "critical") {
    if (!response.includes("⚓") && !responseLower.includes("anchor")) {
      violations.push({
        type: "state_band_mismatch",
        severity: "critical",
        detail: "CRITICAL state response missing anchor recall marker (⚓)",
        axiom: "continuity",
      });
    }
    if (!responseLower.includes(callsign.toLowerCase())) {
      violations.push({
        type: "state_band_mismatch",
        severity: "high",
        detail: `CRITICAL state response should use callsign "${callsign}"`,
        axiom: "continuity",
      });
    }
  }

  // Check 3: State band tone alignment
  const expectations = STATE_BAND_EXPECTATIONS[cognitiveState];
  if (expectations) {
    const markerHits = expectations.markers.filter(m =>
      responseLower.includes(m),
    ).length;
    if (markerHits === 0 && response.length > 100) {
      violations.push({
        type: "state_band_mismatch",
        severity: "low",
        detail: `Response may not align with ${cognitiveState.toUpperCase()} state band (expected: ${expectations.tone})`,
        axiom: "continuity",
      });
    }
  }

  // Check 4: Response should not be empty or trivially short
  if (response.trim().length < 20) {
    violations.push({
      type: "insufficient_presence",
      severity: "medium",
      detail: "Response too brief — Mirror must maintain presence",
      axiom: "continuity",
    });
  }

  // Calculate compliance score
  const severityWeights: Record<string, number> = {
    critical: 30,
    high: 20,
    medium: 10,
    low: 5,
  };
  const totalPenalty = violations.reduce(
    (sum, v) => sum + (severityWeights[v.severity] || 5),
    0,
  );
  const complianceScore = Math.max(0, 100 - totalPenalty);

  return {
    passed:
      violations.filter(v => v.severity === "critical" || v.severity === "high")
        .length === 0,
    complianceScore,
    violations,
    twin: "alpha",
    direction: "downward",
    timestamp: Date.now(),
  };
}

// ═══════════════════════════════════════════════════════════════
// TWIN BETA — UPWARD INTEL VERIFICATION
// Validates and identity-scrambles data flowing back from Mirrors.
// ═══════════════════════════════════════════════════════════════

/**
 * Scramble user identity from reflection content for system-level learning.
 * Removes names, callsigns, and personally identifiable patterns.
 */
export function scrambleIdentity(
  content: string,
  callsign: string,
  userName?: string,
): ScrambledIntel {
  let scrambled = content;

  // Remove callsign references
  const callsignRegex = new RegExp(escapeRegex(callsign), "gi");
  scrambled = scrambled.replace(callsignRegex, "[CALLSIGN]");

  // Remove user name references
  if (userName) {
    const nameRegex = new RegExp(escapeRegex(userName), "gi");
    scrambled = scrambled.replace(nameRegex, "[USER]");
    // Also try first name
    const firstName = userName.split(" ")[0];
    if (firstName && firstName.length > 2) {
      const firstNameRegex = new RegExp(
        `\\b${escapeRegex(firstName)}\\b`,
        "gi",
      );
      scrambled = scrambled.replace(firstNameRegex, "[USER]");
    }
  }

  // Remove common PII patterns
  // Email addresses
  scrambled = scrambled.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    "[EMAIL]",
  );
  // Phone numbers (US formats)
  scrambled = scrambled.replace(
    /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
    "[PHONE]",
  );
  // SSN patterns
  scrambled = scrambled.replace(/\b\d{3}-\d{2}-\d{4}\b/g, "[REDACTED]");
  // Street addresses (basic pattern)
  scrambled = scrambled.replace(
    /\b\d{1,5}\s+[A-Z][a-z]+\s+(St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard|Dr|Drive|Ln|Lane|Ct|Court)\b/gi,
    "[ADDRESS]",
  );

  const isFullyScrambled =
    !scrambled.includes(callsign) &&
    (!userName || !scrambled.includes(userName));

  return {
    content: scrambled,
    isFullyScrambled,
    patternsRemoved: content.length - scrambled.length !== 0,
    timestamp: Date.now(),
  };
}

/**
 * Verify that Intel is safe for system-level use.
 * Checks identity scrambling completeness and Doctrine preservation.
 */
export function verifyUpwardIntel(
  intel: ScrambledIntel,
  originalCallsign: string,
  originalUserName?: string,
): TwinVerification {
  const violations: TwinViolation[] = [];
  const contentLower = intel.content.toLowerCase();

  // Check 1: Identity must be fully scrambled
  if (!intel.isFullyScrambled) {
    violations.push({
      type: "identity_leak",
      severity: "critical",
      detail: "Intel still contains user identity markers after scrambling",
      axiom: "cardinal",
    });
  }

  // Check 2: Callsign should not appear in scrambled content
  if (contentLower.includes(originalCallsign.toLowerCase())) {
    violations.push({
      type: "identity_leak",
      severity: "critical",
      detail: "Callsign found in scrambled Intel",
      axiom: "cardinal",
    });
  }

  // Check 3: User name should not appear
  if (
    originalUserName &&
    contentLower.includes(originalUserName.toLowerCase())
  ) {
    violations.push({
      type: "identity_leak",
      severity: "critical",
      detail: "User name found in scrambled Intel",
      axiom: "cardinal",
    });
  }

  // Check 4: Intel must not contain Doctrine-rewriting language
  const doctrineOverridePatterns = [
    "doctrine should be",
    "doctrine needs to change",
    "update the doctrine",
    "modify doctrine",
    "doctrine is wrong",
    "override doctrine",
  ];
  for (const pattern of doctrineOverridePatterns) {
    if (contentLower.includes(pattern)) {
      violations.push({
        type: "doctrine_corruption",
        severity: "critical",
        detail: `Intel attempts to modify Doctrine: "${pattern}"`,
        axiom: "cardinal",
      });
    }
  }

  const severityWeights: Record<string, number> = {
    critical: 40,
    high: 20,
    medium: 10,
    low: 5,
  };
  const totalPenalty = violations.reduce(
    (sum, v) => sum + (severityWeights[v.severity] || 5),
    0,
  );
  const complianceScore = Math.max(0, 100 - totalPenalty);

  return {
    passed: violations.filter(v => v.severity === "critical").length === 0,
    complianceScore,
    violations,
    twin: "beta",
    direction: "upward",
    timestamp: Date.now(),
  };
}

// ═══════════════════════════════════════════════════════════════
// TWINS CONVEX FUNCTIONS — Database-backed verification & audit
// ═══════════════════════════════════════════════════════════════

// ─── Record a Twin verification result ───
export const recordVerification = internalMutation({
  args: {
    mirrorId: v.id("mirrors"),
    userId: v.id("users"),
    twin: v.union(v.literal("alpha"), v.literal("beta")),
    direction: v.union(v.literal("downward"), v.literal("upward")),
    passed: v.boolean(),
    complianceScore: v.number(),
    violationCount: v.number(),
    violations: v.string(), // JSON-encoded violations
  },
  handler: async (ctx, args) => {
    const verificationId = await ctx.db.insert("twinVerifications", {
      mirrorId: args.mirrorId,
      userId: args.userId,
      twin: args.twin,
      direction: args.direction,
      passed: args.passed,
      complianceScore: args.complianceScore,
      violationCount: args.violationCount,
      violations: args.violations,
      createdAt: Date.now(),
    });

    // Log to activity trail
    await ctx.db.insert("activityLog", {
      userId: args.userId,
      action: args.passed
        ? `Twin ${args.twin.toUpperCase()} verification passed (${args.direction})`
        : `Twin ${args.twin.toUpperCase()} verification FAILED (${args.direction}) — ${args.violationCount} violation(s)`,
      module: "mirror",
      details: `Score: ${args.complianceScore}/100 | Violations: ${args.violationCount}`,
      createdAt: Date.now(),
    });

    // If verification failed with critical violations, update Mirror compliance
    if (!args.passed) {
      const mirror = await ctx.db.get(args.mirrorId);
      if (mirror) {
        // Degrade compliance score (weighted average)
        const newCompliance = Math.round(
          mirror.doctrineCompliance * 0.8 + args.complianceScore * 0.2,
        );
        await ctx.db.patch(args.mirrorId, {
          doctrineCompliance: newCompliance,
        });
      }
    }

    return verificationId;
  },
});

// ─── AI-powered deep verification for edge cases ───
export const deepVerify = action({
  args: {
    response: v.string(),
    cognitiveState: v.string(),
    callsign: v.string(),
    userApiKey: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    // First run deterministic checks
    const deterministicResult = verifyDownwardFlow(
      args.response,
      args.cognitiveState,
      args.callsign,
    );

    // If deterministic checks found critical violations, no need for AI check
    if (!deterministicResult.passed) {
      return deterministicResult;
    }

    // Run AI judge for nuanced fidelity checking
    const apiKey: string | null =
      args.userApiKey || process.env.OPENAI_API_KEY || null;
    if (!apiKey) {
      // Without an API key, return deterministic results only
      return deterministicResult;
    }

    try {
      const judgePrompt = `You are a VIGIL Architecture Fidelity Judge. Your sole purpose is to verify that a Mirror response complies with VIGIL Doctrine.

VIGIL DOCTRINE SUMMARY:
${VIGIL_CORE_DOCTRINE}

EVALUATION CRITERIA:
1. Does the response maintain the user's sovereignty without overriding their identity?
2. Does it avoid therapeutic/diagnostic language (no probing)?
3. Does it match the cognitive state band: ${args.cognitiveState.toUpperCase()}?
4. Does it preserve continuity and presence?
5. Does it avoid reducing VIGIL to a chatbot or generic AI assistant?

RESPONSE TO EVALUATE:
"${args.response}"

USER COGNITIVE STATE: ${args.cognitiveState.toUpperCase()}
USER CALLSIGN: ${args.callsign}

Respond in JSON:
{
  "compliant": true/false,
  "score": 0-100,
  "issues": ["list of specific issues found, or empty if compliant"],
  "assessment": "one-sentence summary"
}`;

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [{ role: "system", content: judgePrompt }],
            max_tokens: 300,
            temperature: 0.2,
            response_format: { type: "json_object" },
          }),
        },
      );

      if (!response.ok) {
        console.error(
          "Twins deep verify error:",
          response.status,
          await response.text(),
        );
        return deterministicResult;
      }

      const data = await response.json();
      try {
        const judge = JSON.parse(data.choices[0].message.content);
        // Merge AI judge result with deterministic result
        const aiViolations: TwinViolation[] = (judge.issues || []).map(
          (issue: string) => ({
            type: "ai_judge_finding" as const,
            severity: "medium" as const,
            detail: issue,
            axiom: "architecture_integrity" as const,
          }),
        );

        const allViolations = [
          ...deterministicResult.violations,
          ...aiViolations,
        ];
        const combinedScore = Math.round(
          (deterministicResult.complianceScore + (judge.score || 100)) / 2,
        );

        return {
          passed: judge.compliant !== false && deterministicResult.passed,
          complianceScore: combinedScore,
          violations: allViolations,
          twin: "alpha" as const,
          direction: "downward" as const,
          timestamp: Date.now(),
          aiAssessment: judge.assessment,
        };
      } catch {
        return deterministicResult;
      }
    } catch (e) {
      console.error("Twins deep verify error:", e);
      return deterministicResult;
    }
  },
});

// ─── Get verification history for a Mirror ───
export const getVerificationHistory = query({
  args: {
    mirrorId: v.optional(v.id("mirrors")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    if (args.mirrorId) {
      return await ctx.db
        .query("twinVerifications")
        .withIndex("by_mirror", q => q.eq("mirrorId", args.mirrorId!))
        .order("desc")
        .take(args.limit || 20);
    }

    // Get current user's mirror
    const mirror = await ctx.db
      .query("mirrors")
      .withIndex("by_user", q => q.eq("userId", userId))
      .first();
    if (!mirror) return [];

    return await ctx.db
      .query("twinVerifications")
      .withIndex("by_mirror", q => q.eq("mirrorId", mirror._id))
      .order("desc")
      .take(args.limit || 20);
  },
});

// ─── Get Twin system health metrics ───
export const getSystemHealth = query({
  args: {},
  handler: async ctx => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    // Get recent verifications across the system
    const recentVerifications = await ctx.db
      .query("twinVerifications")
      .order("desc")
      .take(100);

    if (recentVerifications.length === 0) {
      return {
        totalVerifications: 0,
        passRate: 100,
        avgComplianceScore: 100,
        recentFailures: 0,
        alphaChecks: 0,
        betaChecks: 0,
        status: "nominal" as const,
      };
    }

    const passed = recentVerifications.filter(v => v.passed).length;
    const avgScore =
      recentVerifications.reduce((sum, v) => sum + v.complianceScore, 0) /
      recentVerifications.length;
    const recentFailures = recentVerifications
      .slice(0, 10)
      .filter(v => !v.passed).length;
    const alphaChecks = recentVerifications.filter(
      v => v.twin === "alpha",
    ).length;
    const betaChecks = recentVerifications.filter(
      v => v.twin === "beta",
    ).length;

    // Determine system status
    let status: "nominal" | "degraded" | "alert" = "nominal";
    if (recentFailures >= 5) status = "alert";
    else if (recentFailures >= 2 || avgScore < 80) status = "degraded";

    return {
      totalVerifications: recentVerifications.length,
      passRate: Math.round((passed / recentVerifications.length) * 100),
      avgComplianceScore: Math.round(avgScore),
      recentFailures,
      alphaChecks,
      betaChecks,
      status,
    };
  },
});

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface TwinViolation {
  type:
    | "forbidden_pattern"
    | "state_band_mismatch"
    | "insufficient_presence"
    | "identity_leak"
    | "doctrine_corruption"
    | "ai_judge_finding";
  severity: "critical" | "high" | "medium" | "low";
  detail: string;
  axiom:
    | "sovereignty"
    | "no_probing"
    | "no_override"
    | "continuity"
    | "cardinal"
    | "architecture_integrity";
}

export interface TwinVerification {
  passed: boolean;
  complianceScore: number;
  violations: TwinViolation[];
  twin: "alpha" | "beta";
  direction: "downward" | "upward";
  timestamp: number;
  aiAssessment?: string;
}

export interface ScrambledIntel {
  content: string;
  isFullyScrambled: boolean;
  patternsRemoved: boolean;
  timestamp: number;
}

// ─── HELPERS ───

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
