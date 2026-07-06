import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// ─── INFRASTRUCTURE SCENARIOS ───

export const listScenarios = query({
  args: { category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.category) {
      return await ctx.db
        .query("infraScenarios")
        .withIndex("by_category", (q) => q.eq("category", args.category as "server_architecture"))
        .collect();
    }
    return await ctx.db.query("infraScenarios").collect();
  },
});

export const getScenario = query({
  args: { scenarioId: v.id("infraScenarios") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.scenarioId);
  },
});

export const startScenario = mutation({
  args: { scenarioId: v.id("infraScenarios") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const scenario = await ctx.db.get(args.scenarioId);
    if (!scenario) throw new Error("Scenario not found");
    const steps = JSON.parse(scenario.steps);
    return await ctx.db.insert("infraAttempts", {
      userId,
      scenarioId: args.scenarioId,
      status: "in_progress",
      currentStep: 0,
      totalSteps: steps.length,
      score: 0,
      startedAt: Date.now(),
    });
  },
});

export const advanceStep = mutation({
  args: { attemptId: v.id("infraAttempts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const attempt = await ctx.db.get(args.attemptId);
    if (!attempt || attempt.userId !== userId) throw new Error("Not authorized");
    const nextStep = attempt.currentStep + 1;
    const pointsEarned = Math.floor(100 / attempt.totalSteps);
    if (nextStep >= attempt.totalSteps) {
      await ctx.db.patch(args.attemptId, {
        currentStep: nextStep,
        score: attempt.score + pointsEarned,
        status: "completed",
        completedAt: Date.now(),
      });
      return { completed: true, score: attempt.score + pointsEarned };
    }
    await ctx.db.patch(args.attemptId, {
      currentStep: nextStep,
      score: attempt.score + pointsEarned,
    });
    return { completed: false, currentStep: nextStep, score: attempt.score + pointsEarned };
  },
});

export const getMyAttempts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("infraAttempts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { totalScenarios: 0, attempted: 0, completed: 0, totalPoints: 0 };
    const scenarios = await ctx.db.query("infraScenarios").collect();
    const attempts = await ctx.db
      .query("infraAttempts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const completedIds = new Set(attempts.filter((a) => a.status === "completed").map((a) => a.scenarioId));
    const attemptedIds = new Set(attempts.map((a) => a.scenarioId));
    return {
      totalScenarios: scenarios.length,
      attempted: attemptedIds.size,
      completed: completedIds.size,
      totalPoints: attempts.reduce((sum, a) => sum + a.score, 0),
    };
  },
});

export const createScenario = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("server_architecture"), v.literal("networking"), v.literal("security"),
      v.literal("identity"), v.literal("deployment"), v.literal("backup"),
      v.literal("monitoring"), v.literal("disaster_recovery")
    ),
    difficulty: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
    steps: v.string(),
    objectives: v.string(),
    points: v.number(),
    estimatedMinutes: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("infraScenarios", { ...args, isPublished: true, createdAt: Date.now() });
  },
});
