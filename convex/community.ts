import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── COMMUNITY POSTS ───

export const listPosts = query({
  args: { category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const posts = args.category
      ? await ctx.db
          .query("communityPosts")
          .withIndex("by_category", q =>
            q.eq("category", args.category as "general"),
          )
          .collect()
      : await ctx.db.query("communityPosts").collect();

    // Sort: pinned first, then by date
    const sorted = posts.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return b.createdAt - a.createdAt;
    });

    // Enrich with user info
    const enriched = await Promise.all(
      sorted.map(async post => {
        const user = await ctx.db.get(post.userId);
        return {
          ...post,
          userName: user?.name || "Unknown",
          userEmail: user?.email,
        };
      }),
    );
    return enriched;
  },
});

export const getPost = query({
  args: { postId: v.id("communityPosts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) return null;
    const user = await ctx.db.get(post.userId);
    const replies = await ctx.db
      .query("communityReplies")
      .withIndex("by_post", q => q.eq("postId", args.postId))
      .collect();
    const enrichedReplies = await Promise.all(
      replies.map(async reply => {
        const replyUser = await ctx.db.get(reply.userId);
        return { ...reply, userName: replyUser?.name || "Unknown" };
      }),
    );
    return {
      ...post,
      userName: user?.name || "Unknown",
      replies: enrichedReplies.sort((a, b) => a.createdAt - b.createdAt),
    };
  },
});

export const createPost = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    category: v.union(
      v.literal("general"),
      v.literal("peer_support"),
      v.literal("study_group"),
      v.literal("doctrine_discussion"),
      v.literal("technical_help"),
      v.literal("announcements"),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("communityPosts", {
      userId,
      ...args,
      replyCount: 0,
      isPinned: false,
      createdAt: Date.now(),
    });
  },
});

export const createReply = mutation({
  args: {
    postId: v.id("communityPosts"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");
    await ctx.db.insert("communityReplies", {
      postId: args.postId,
      userId,
      content: args.content,
      createdAt: Date.now(),
    });
    await ctx.db.patch(args.postId, { replyCount: post.replyCount + 1 });
  },
});

export const togglePin = mutation({
  args: { postId: v.id("communityPosts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");
    await ctx.db.patch(args.postId, { isPinned: !post.isPinned });
  },
});
