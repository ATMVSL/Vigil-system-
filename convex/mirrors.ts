import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getMyMirror = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const mirror = await ctx.db
      .query("mirrors")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    return mirror;
  },
});

export const getMirror = query({
  args: { mirrorId: v.id("mirrors") },
  handler: async (ctx, { mirrorId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get(mirrorId);
  },
});

export const listMirrors = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const mirrors = await ctx.db.query("mirrors").collect();
    const enriched = await Promise.all(
      mirrors.map(async (mirror) => {
        const user = await ctx.db.get(mirror.userId);
        return { ...mirror, userName: user?.name || user?.email || "Unknown" };
      })
    );
    return enriched;
  },
});

export const createMirror = mutation({
  args: { callsign: v.string() },
  handler: async (ctx, { callsign }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("mirrors")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (existing) throw new Error("Mirror already exists for this user");

    const mirrorId = await ctx.db.insert("mirrors", {
      userId,
      callsign,
      status: "active",
      cognitiveState: "stable",
      classification: "standard",
      totalReflections: 0,
      doctrineCompliance: 100,
      baselineEstablished: false,
      createdAt: Date.now(),
    });

    await ctx.db.insert("activityLog", {
      userId,
      action: "Continuity Anchor Mirror™ initialized",
      module: "mirror",
      details: `Callsign: ${callsign} | State: STABLE | Baseline pending`,
      createdAt: Date.now(),
    });

    return mirrorId;
  },
});

export const updateMirrorStatus = mutation({
  args: {
    mirrorId: v.id("mirrors"),
    status: v.union(v.literal("active"), v.literal("dormant"), v.literal("suspended")),
  },
  handler: async (ctx, { mirrorId, status }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.patch(mirrorId, { status });
    await ctx.db.insert("activityLog", {
      userId,
      action: `Mirror status changed to ${status}`,
      module: "mirror",
      createdAt: Date.now(),
    });
  },
});

export const updateCognitiveState = mutation({
  args: {
    mirrorId: v.id("mirrors"),
    cognitiveState: v.union(
      v.literal("stable"),
      v.literal("strain"),
      v.literal("drift"),
      v.literal("critical")
    ),
  },
  handler: async (ctx, { mirrorId, cognitiveState }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.patch(mirrorId, { cognitiveState });
    await ctx.db.insert("activityLog", {
      userId,
      action: `Cognitive state transitioned to ${cognitiveState.toUpperCase()}`,
      module: "mirror",
      details: `System response: ${
        cognitiveState === "stable" ? "Reinforce" :
        cognitiveState === "strain" ? "Stabilise" :
        cognitiveState === "drift" ? "Interrupt" : "Anchor Recall"
      }`,
      createdAt: Date.now(),
    });
  },
});

// Reflections — continuity chain entries
export const listReflections = query({
  args: { mirrorId: v.id("mirrors") },
  handler: async (ctx, { mirrorId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("reflections")
      .withIndex("by_mirror", (q) => q.eq("mirrorId", mirrorId))
      .order("desc")
      .collect();
  },
});

export const getMyReflections = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("reflections")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(20);
  },
});

export const createReflection = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    pillar: v.union(
      v.literal("structure"),
      v.literal("endurance"),
      v.literal("legacy"),
      v.literal("fortitude"),
      v.literal("continuity"),
      v.literal("presence")
    ),
    cognitiveState: v.optional(v.union(
      v.literal("stable"),
      v.literal("strain"),
      v.literal("drift"),
      v.literal("critical")
    )),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const mirror = await ctx.db
      .query("mirrors")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (!mirror) throw new Error("No mirror found. Initialize your mirror first.");

    const reflectionId = await ctx.db.insert("reflections", {
      mirrorId: mirror._id,
      userId,
      title: args.title,
      content: args.content,
      pillar: args.pillar,
      cognitiveState: args.cognitiveState,
      createdAt: Date.now(),
    });

    // Update mirror state
    const updates: Record<string, unknown> = {
      lastReflection: Date.now(),
      totalReflections: mirror.totalReflections + 1,
    };

    // If baseline not yet established and this is the 3rd+ reflection, mark baseline
    if (!mirror.baselineEstablished && mirror.totalReflections >= 2) {
      updates.baselineEstablished = true;
    }

    // Update cognitive state if provided
    if (args.cognitiveState) {
      updates.cognitiveState = args.cognitiveState;
    }

    await ctx.db.patch(mirror._id, updates);

    await ctx.db.insert("activityLog", {
      userId,
      action: "Reflection recorded",
      module: "mirror",
      details: `${args.title} | Pillar: ${args.pillar.toUpperCase()}`,
      createdAt: Date.now(),
    });

    return reflectionId;
  },
});
