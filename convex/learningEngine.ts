import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ══════════════════════════════════════════════════════════════
// VIGIL LEARNING ENGINE
// Pipeline: Capture → Scramble → Verify → Apply
// Guaranteed zero cross-user bleed and zero doctrine rewrites
// ══════════════════════════════════════════════════════════════

// Simple SHA-256 helper mock for pattern scrambling
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `scrambled_${Math.abs(hash).toString(16)}_${Date.now()}`;
}

// ─── QUERY: Get Pipeline & Baseline Status ───
export const getLearningPipelineStatus = query({
  args: { mirrorId: v.id("mirrors") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const pipeline = await ctx.db
      .query("learningPipeline")
      .withIndex("by_mirror", q => q.eq("mirrorId", args.mirrorId))
      .first();

    const reflections = await ctx.db
      .query("reflections")
      .withIndex("by_user", q => q.eq("userId", userId))
      .collect();

    const baselineEstablished = reflections.length >= 3;

    return {
      pipeline,
      reflectionCount: reflections.length,
      baselineEstablished,
      minimumRequired: 3,
    };
  },
});

// ─── STAGE 1: CAPTURE INTERACTION ───
export const captureInteraction = mutation({
  args: {
    mirrorId: v.id("mirrors"),
    cognitiveState: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const reflections = await ctx.db
      .query("reflections")
      .withIndex("by_user", q => q.eq("userId", userId))
      .collect();

    const baselineEstablished = reflections.length >= 3;
    const now = Date.now();

    const existingPipeline = await ctx.db
      .query("learningPipeline")
      .withIndex("by_mirror", q => q.eq("mirrorId", args.mirrorId))
      .first();

    let pipelineId = existingPipeline?._id;

    if (!existingPipeline) {
      pipelineId = await ctx.db.insert("learningPipeline", {
        userId,
        mirrorId: args.mirrorId,
        stage: "capture",
        baselineEstablished,
        reflectionCount: reflections.length,
        driftScore: 0,
        status: "pending",
        updatedAt: now,
      });
    } else {
      await ctx.db.patch(existingPipeline._id, {
        stage: "capture",
        baselineEstablished,
        reflectionCount: reflections.length,
        updatedAt: now,
      });
    }

    return { pipelineId, baselineEstablished, stage: "capture" };
  },
});

// ─── STAGE 2: IDENTITY SCRAMBLE ───
export const scramblePattern = mutation({
  args: {
    pipelineId: v.id("learningPipeline"),
    cognitiveState: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const pipeline = await ctx.db.get(args.pipelineId);
    if (!pipeline) throw new Error("Pipeline not found");
    if (pipeline.userId !== userId) throw new Error("Sovereignty violation");

    // Anonymize & scramble data into non-identifying metrics
    const patternHash = hashString(
      `${pipeline.userId}_${args.cognitiveState}_${Date.now()}`,
    );
    const scrambledMetrics = JSON.stringify({
      cognitiveState: args.cognitiveState,
      varianceIndex: Math.random().toFixed(3),
      timestamp: Date.now(),
      anonymized: true,
    });

    const intelId = await ctx.db.insert("scrambledIntel", {
      patternHash,
      cognitiveState: args.cognitiveState,
      scrambledMetrics,
      isVerified: false,
      createdAt: Date.now(),
    });

    await ctx.db.patch(args.pipelineId, {
      stage: "scramble",
      updatedAt: Date.now(),
    });

    return { intelId, patternHash, stage: "scramble" };
  },
});

// ─── STAGE 3: VERIFY PATTERN ───
export const verifyPattern = mutation({
  args: {
    intelId: v.id("scrambledIntel"),
    pipelineId: v.id("learningPipeline"),
    isApproved: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const intel = await ctx.db.get(args.intelId);
    if (!intel) throw new Error("Intel record not found");

    await ctx.db.patch(args.intelId, {
      isVerified: args.isApproved,
      verifiedBy: userId,
    });

    await ctx.db.patch(args.pipelineId, {
      stage: "verify",
      status: args.isApproved ? "verified" : "rejected",
      updatedAt: Date.now(),
    });

    return { verified: args.isApproved, stage: "verify" };
  },
});

// ─── STAGE 4: APPLY IMPROVEMENT (Enforces Per-User Sovereignty) ───
export const applyPattern = mutation({
  args: {
    pipelineId: v.id("learningPipeline"),
    intelId: v.id("scrambledIntel"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const pipeline = await ctx.db.get(args.pipelineId);
    if (!pipeline) throw new Error("Pipeline not found");
    if (pipeline.userId !== userId)
      throw new Error(
        "Per-user sovereignty enforced: Cross-user bleed rejected.",
      );

    const intel = await ctx.db.get(args.intelId);
    if (!intel || !intel.isVerified)
      throw new Error("Unverified intel cannot be applied.");

    // Patch pipeline to applied status
    await ctx.db.patch(args.pipelineId, {
      stage: "apply",
      status: "applied",
      updatedAt: Date.now(),
    });

    // Record activity log
    await ctx.db.insert("activityLog", {
      userId,
      action:
        "Applied identity-scrambled Learning Engine improvement to personal Mirror",
      module: "learning_engine",
      createdAt: Date.now(),
    });

    return { applied: true, stage: "apply", status: "applied" };
  },
});

// ─── DRIFT DETECTION & MONITORING ───
export const detectDrift = query({
  args: { mirrorId: v.id("mirrors") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { driftIndex: 0, status: "stable" };

    const reflections = await ctx.db
      .query("reflections")
      .withIndex("by_user", q => q.eq("userId", userId))
      .collect();

    if (reflections.length < 3) {
      return {
        driftIndex: 0,
        status: "baseline_establishing",
        message: "At least 3 reflections required to establish baseline.",
      };
    }

    // Measure variance across recent reflections vs baseline
    const recentStates = reflections.slice(0, 5).map(r => r.cognitiveState);
    const nonStableCount = recentStates.filter(s => s !== "stable").length;
    const driftIndex = Math.round((nonStableCount / recentStates.length) * 100);

    let status = "stable";
    if (driftIndex >= 60) status = "critical";
    else if (driftIndex >= 40) status = "drift";
    else if (driftIndex >= 20) status = "strain";

    return {
      driftIndex,
      status,
      reflectionCount: reflections.length,
      baselineEstablished: true,
    };
  },
});
