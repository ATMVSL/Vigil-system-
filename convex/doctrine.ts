import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const sectionValidator = v.union(
  v.literal("axiom"),
  v.literal("structure"),
  v.literal("endurance"),
  v.literal("legacy"),
  v.literal("fortitude"),
  v.literal("continuity_pillar"),
  v.literal("presence")
);

export const list = query({
  args: {
    section: v.optional(sectionValidator),
  },
  handler: async (ctx, { section }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    if (section) {
      return await ctx.db
        .query("doctrineArticles")
        .withIndex("by_section", (q) => q.eq("section", section))
        .collect();
    }
    return await ctx.db.query("doctrineArticles").collect();
  },
});

export const get = query({
  args: { articleId: v.id("doctrineArticles") },
  handler: async (ctx, { articleId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get(articleId);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    section: sectionValidator,
    priority: v.union(v.literal("critical"), v.literal("standard"), v.literal("advisory")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const articleId = await ctx.db.insert("doctrineArticles", {
      ...args,
      version: "1.0",
      isActive: true,
      createdBy: userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await ctx.db.insert("activityLog", {
      userId,
      action: "Doctrine article created",
      module: "doctrine",
      details: args.title,
      createdAt: Date.now(),
    });

    return articleId;
  },
});

export const update = mutation({
  args: {
    articleId: v.id("doctrineArticles"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    section: v.optional(sectionValidator),
    priority: v.optional(v.union(v.literal("critical"), v.literal("standard"), v.literal("advisory"))),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { articleId, ...updates }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const filtered: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [k, val] of Object.entries(updates)) {
      if (val !== undefined) filtered[k] = val;
    }

    await ctx.db.patch(articleId, filtered);

    await ctx.db.insert("activityLog", {
      userId,
      action: "Doctrine article updated",
      module: "doctrine",
      details: `Article ID: ${articleId}`,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { articleId: v.id("doctrineArticles") },
  handler: async (ctx, { articleId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.delete(articleId);

    await ctx.db.insert("activityLog", {
      userId,
      action: "Doctrine article removed",
      module: "doctrine",
      createdAt: Date.now(),
    });
  },
});
