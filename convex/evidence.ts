import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {
    category: v.optional(v.union(
      v.literal("identity"),
      v.literal("continuity"),
      v.literal("doctrine"),
      v.literal("operational"),
      v.literal("behavioral")
    )),
    status: v.optional(v.union(
      v.literal("active"),
      v.literal("archived"),
      v.literal("under_review"),
      v.literal("validated")
    )),
  },
  handler: async (ctx, { category, status }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    let q;
    if (category) {
      q = ctx.db.query("evidenceEntries").withIndex("by_category", (idx) => idx.eq("category", category));
    } else if (status) {
      q = ctx.db.query("evidenceEntries").withIndex("by_status", (idx) => idx.eq("status", status));
    } else {
      q = ctx.db.query("evidenceEntries");
    }

    const entries = await q.order("desc").collect();

    const enriched = await Promise.all(
      entries.map(async (entry) => {
        const creator = await ctx.db.get(entry.createdBy);
        return { ...entry, creatorName: creator?.name || creator?.email || "System" };
      })
    );
    return enriched;
  },
});

export const get = query({
  args: { entryId: v.id("evidenceEntries") },
  handler: async (ctx, { entryId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const entry = await ctx.db.get(entryId);
    if (!entry) return null;
    const creator = await ctx.db.get(entry.createdBy);
    return { ...entry, creatorName: creator?.name || creator?.email || "System" };
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("identity"),
      v.literal("continuity"),
      v.literal("doctrine"),
      v.literal("operational"),
      v.literal("behavioral")
    ),
    severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
    source: v.string(),
    linkedMirrorId: v.optional(v.id("mirrors")),
    metadata: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const entryId = await ctx.db.insert("evidenceEntries", {
      ...args,
      status: "active",
      createdBy: userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await ctx.db.insert("activityLog", {
      userId,
      action: "Evidence entry created",
      module: "evidence",
      details: `${args.title} [${args.severity}]`,
      createdAt: Date.now(),
    });

    return entryId;
  },
});

export const updateStatus = mutation({
  args: {
    entryId: v.id("evidenceEntries"),
    status: v.union(
      v.literal("active"),
      v.literal("archived"),
      v.literal("under_review"),
      v.literal("validated")
    ),
  },
  handler: async (ctx, { entryId, status }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.patch(entryId, { status, updatedAt: Date.now() });

    await ctx.db.insert("activityLog", {
      userId,
      action: `Evidence status: ${status}`,
      module: "evidence",
      details: `Entry ID: ${entryId}`,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { entryId: v.id("evidenceEntries") },
  handler: async (ctx, { entryId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.delete(entryId);

    await ctx.db.insert("activityLog", {
      userId,
      action: "Evidence entry removed",
      module: "evidence",
      createdAt: Date.now(),
    });
  },
});
