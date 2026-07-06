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
    const doc = await ctx.db.get(args.documentId);
    if (!doc) return null;
    // If there's a file, get the URL
    let fileUrl: string | null = null;
    if (doc.fileId) {
      fileUrl = await ctx.storage.getUrl(doc.fileId);
    }
    return { ...doc, fileUrl };
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
    fileId: v.optional(v.id("_storage")),
    fileName: v.optional(v.string()),
    fileType: v.optional(v.string()),
    fileSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("documents", {
      title: args.title,
      content: args.content,
      category: args.category,
      version: args.version,
      isPublished: true,
      authorId: userId,
      fileId: args.fileId,
      fileName: args.fileName,
      fileType: args.fileType,
      fileSize: args.fileSize,
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
    fileId: v.optional(v.id("_storage")),
    fileName: v.optional(v.string()),
    fileType: v.optional(v.string()),
    fileSize: v.optional(v.number()),
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
    // Delete associated file from storage if exists
    const doc = await ctx.db.get(args.documentId);
    if (doc?.fileId) {
      await ctx.storage.delete(doc.fileId);
    }
    await ctx.db.delete(args.documentId);
  },
});

// Generate a URL for the client to upload a file to Convex storage
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
});

// Get a download URL for a stored file
export const getFileUrl = query({
  args: { fileId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.fileId);
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
