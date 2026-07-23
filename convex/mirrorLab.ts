import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const recordMirrorLabAttempt = mutation({
  args: {
    scenarioTitle: v.string(),
    cognitiveState: v.union(
      v.literal("stable"),
      v.literal("strain"),
      v.literal("drift"),
      v.literal("critical"),
    ),
    driftDetected: v.boolean(),
    anchorRecallTriggered: v.boolean(),
    score: v.number(),
    passed: v.boolean(),
    detailsJson: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const logId = await ctx.db.insert("mirrorLabLogs", {
      userId,
      scenarioTitle: args.scenarioTitle,
      cognitiveState: args.cognitiveState,
      driftDetected: args.driftDetected,
      anchorRecallTriggered: args.anchorRecallTriggered,
      score: args.score,
      passed: args.passed,
      detailsJson: args.detailsJson,
      createdAt: Date.now(),
    });

    return logId;
  },
});

export const getMirrorLabLogs = query({
  handler: async ctx => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("mirrorLabLogs")
      .withIndex("by_user", q => q.eq("userId", userId))
      .order("desc")
      .take(20);
  },
});
