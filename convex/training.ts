import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// ─── TRAINING MIRRORS ─── Isolated from production

export const getMyTrainingMirror = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db
      .query("trainingMirrors")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
  },
});

export const initTrainingMirror = mutation({
  args: { callsign: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const existing = await ctx.db
      .query("trainingMirrors")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (existing) return existing._id;
    return await ctx.db.insert("trainingMirrors", {
      userId,
      callsign: `TRN-${args.callsign}`,
      status: "active",
      cognitiveState: "stable",
      syntheticUserCount: 3,
      totalInteractions: 0,
      score: 0,
      createdAt: Date.now(),
    });
  },
});

export const updateTrainingMirror = mutation({
  args: {
    mirrorId: v.id("trainingMirrors"),
    cognitiveState: v.optional(v.union(
      v.literal("stable"), v.literal("strain"), v.literal("drift"), v.literal("critical")
    )),
    status: v.optional(v.union(v.literal("active"), v.literal("paused"), v.literal("completed"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const mirror = await ctx.db.get(args.mirrorId);
    if (!mirror || mirror.userId !== userId) throw new Error("Not authorized");
    const updates: Record<string, unknown> = {};
    if (args.cognitiveState) updates.cognitiveState = args.cognitiveState;
    if (args.status) updates.status = args.status;
    updates.totalInteractions = mirror.totalInteractions + 1;
    await ctx.db.patch(args.mirrorId, updates);
  },
});

export const recordInteraction = mutation({
  args: { mirrorId: v.id("trainingMirrors"), scoreIncrease: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const mirror = await ctx.db.get(args.mirrorId);
    if (!mirror || mirror.userId !== userId) throw new Error("Not authorized");
    await ctx.db.patch(args.mirrorId, {
      totalInteractions: mirror.totalInteractions + 1,
      score: mirror.score + args.scoreIncrease,
    });
  },
});

// ─── SIMULATIONS ───

export const listSimulations = query({
  args: { type: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.type) {
      return await ctx.db
        .query("simulations")
        .withIndex("by_type", (q) => q.eq("type", args.type as "mirror"))
        .collect();
    }
    return await ctx.db.query("simulations").collect();
  },
});

export const createSimulation = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    type: v.union(
      v.literal("mirror"), v.literal("sql"), v.literal("infrastructure"),
      v.literal("peer_support"), v.literal("crisis"), v.literal("doctrine_review")
    ),
    difficulty: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
    scenario: v.string(),
    objectives: v.string(),
    estimatedMinutes: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("simulations", {
      ...args,
      isPublished: true,
      createdBy: userId,
      createdAt: Date.now(),
    });
  },
});
