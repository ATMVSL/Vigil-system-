import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// ─── DOCUMENTATION ───

export const listDocuments = query({
  args: { category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.category) {
      return await ctx.db
        .query("documents")
        .withIndex("by_category", (q) => q.eq("category", args.category as "founder_doctrine"))
        .collect();
    }
    return await ctx.db.query("documents").collect();
  },
});

export const getDocument = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.documentId);
  },
});

export const createDocument = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    category: v.union(
      v.literal("founder_doctrine"), v.literal("technical"), v.literal("architecture"),
      v.literal("validation_reports"), v.literal("academy_handbook"), v.literal("instructor_manual"),
      v.literal("student_workbook"), v.literal("release_notes")
    ),
    version: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("documents", {
      ...args,
      isPublished: true,
      authorId: userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const updateDocument = mutation({
  args: {
    documentId: v.id("documents"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    version: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const { documentId, ...updates } = args;
    const filtered = Object.fromEntries(Object.entries(updates).filter(([, v]) => v !== undefined));
    await ctx.db.patch(documentId, { ...filtered, updatedAt: Date.now() });
  },
});

export const deleteDocument = mutation({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.delete(args.documentId);
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const docs = await ctx.db.query("documents").collect();
    const categories = new Map<string, number>();
    for (const doc of docs) {
      categories.set(doc.category, (categories.get(doc.category) || 0) + 1);
    }
    return {
      total: docs.length,
      categories: Object.fromEntries(categories),
    };
  },
});
