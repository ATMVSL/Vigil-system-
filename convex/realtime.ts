// ─── REAL-TIME VIDEO & TEXT INTERACTIONS ───
// WebRTC signaling, real-time text messaging, and synchronization
// Ensures continuity across all interaction modes

import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── REAL-TIME TEXT MESSAGING ───

export const sendMessage = mutation({
  args: {
    channelId: v.string(),
    content: v.string(),
    messageType: v.optional(
      v.union(
        v.literal("text"),
        v.literal("system"),
        v.literal("mirror_response"),
        v.literal("video_event"),
      ),
    ),
    metadata: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check approval status
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", q => q.eq("userId", userId))
      .first();

    if (profile?.approvalStatus === "pending") {
      throw new Error("Account pending Founder approval");
    }
    if (profile?.approvalStatus === "denied") {
      throw new Error("Access denied");
    }

    const messageId = await ctx.db.insert("realtimeMessages", {
      userId,
      channelId: args.channelId,
      content: args.content,
      messageType: args.messageType || "text",
      metadata: args.metadata,
      readBy: [userId],
      createdAt: Date.now(),
    });

    // Update channel activity
    const channel = await ctx.db
      .query("realtimeChannels")
      .withIndex("by_channelId", q => q.eq("channelId", args.channelId))
      .first();

    if (channel) {
      await ctx.db.patch(channel._id, {
        lastMessageAt: Date.now(),
        messageCount: channel.messageCount + 1,
      });
    }

    return messageId;
  },
});

export const getMessages = query({
  args: {
    channelId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const messages = await ctx.db
      .query("realtimeMessages")
      .withIndex("by_channel", q => q.eq("channelId", args.channelId))
      .order("desc")
      .take(args.limit || 50);

    // Enrich with user info
    const enriched = await Promise.all(
      messages.map(async msg => {
        const user = await ctx.db.get(msg.userId);
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", q => q.eq("userId", msg.userId))
          .first();
        return {
          ...msg,
          userName: user?.name || user?.email || "Unknown",
          userRole: profile?.role || "operator",
        };
      }),
    );

    return enriched.reverse();
  },
});

// Mark messages as read
export const markRead = mutation({
  args: { channelId: v.string() },
  handler: async (ctx, { channelId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const unread = await ctx.db
      .query("realtimeMessages")
      .withIndex("by_channel", q => q.eq("channelId", channelId))
      .order("desc")
      .take(100);

    for (const msg of unread) {
      if (!msg.readBy.includes(userId)) {
        await ctx.db.patch(msg._id, {
          readBy: [...msg.readBy, userId],
        });
      }
    }
  },
});

// ─── CHANNELS ───

export const getOrCreateChannel = mutation({
  args: {
    channelId: v.string(),
    channelType: v.union(
      v.literal("mirror_session"),
      v.literal("direct"),
      v.literal("group"),
      v.literal("system"),
    ),
    participantIds: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("realtimeChannels")
      .withIndex("by_channelId", q => q.eq("channelId", args.channelId))
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("realtimeChannels", {
      channelId: args.channelId,
      channelType: args.channelType,
      participantIds: args.participantIds || [userId],
      messageCount: 0,
      lastMessageAt: Date.now(),
      createdAt: Date.now(),
    });
  },
});

export const listMyChannels = query({
  args: {},
  handler: async ctx => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const channels = await ctx.db.query("realtimeChannels").collect();
    return channels.filter(c => c.participantIds.includes(userId));
  },
});

// ─── VIDEO CALL SIGNALING (WebRTC) ───

export const initiateCall = mutation({
  args: {
    targetUserId: v.id("users"),
    callType: v.union(v.literal("video"), v.literal("audio")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check both users are approved
    const myProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", q => q.eq("userId", userId))
      .first();
    if (
      myProfile?.approvalStatus !== "approved" &&
      myProfile?.role !== "founder"
    ) {
      throw new Error("Account not approved for calls");
    }

    const callId = await ctx.db.insert("videoCalls", {
      initiatorId: userId,
      targetId: args.targetUserId,
      callType: args.callType,
      status: "ringing",
      startedAt: Date.now(),
    });

    await ctx.db.insert("activityLog", {
      userId,
      action: `${args.callType} call initiated`,
      module: "system",
      details: `Target: ${args.targetUserId}`,
      createdAt: Date.now(),
    });

    return callId;
  },
});

export const respondToCall = mutation({
  args: {
    callId: v.id("videoCalls"),
    action: v.union(
      v.literal("accept"),
      v.literal("decline"),
      v.literal("end"),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const call = await ctx.db.get(args.callId);
    if (!call) throw new Error("Call not found");

    // Only participants can respond
    if (call.initiatorId !== userId && call.targetId !== userId) {
      throw new Error("Not a participant in this call");
    }

    const statusMap = {
      accept: "connected" as const,
      decline: "declined" as const,
      end: "ended" as const,
    };

    await ctx.db.patch(args.callId, {
      status: statusMap[args.action],
      ...(args.action === "accept" ? { connectedAt: Date.now() } : {}),
      ...(args.action === "end" || args.action === "decline"
        ? { endedAt: Date.now() }
        : {}),
    });
  },
});

// WebRTC signaling — exchange SDP offers/answers and ICE candidates
export const sendSignal = mutation({
  args: {
    callId: v.id("videoCalls"),
    signalType: v.union(
      v.literal("offer"),
      v.literal("answer"),
      v.literal("ice_candidate"),
    ),
    payload: v.string(), // JSON-encoded SDP or ICE candidate
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("videoSignals", {
      callId: args.callId,
      senderId: userId,
      signalType: args.signalType,
      payload: args.payload,
      consumed: false,
      createdAt: Date.now(),
    });
  },
});

export const getSignals = query({
  args: { callId: v.id("videoCalls") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Get unconsumed signals NOT sent by the current user
    const signals = await ctx.db
      .query("videoSignals")
      .withIndex("by_call", q => q.eq("callId", args.callId))
      .order("asc")
      .collect();

    return signals.filter(s => s.senderId !== userId && !s.consumed);
  },
});

export const consumeSignals = mutation({
  args: { signalIds: v.array(v.id("videoSignals")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    for (const id of args.signalIds) {
      await ctx.db.patch(id, { consumed: true });
    }
  },
});

export const getActiveCall = query({
  args: {},
  handler: async ctx => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    // Check for any active call involving this user
    const calls = await ctx.db.query("videoCalls").order("desc").take(10);

    return (
      calls.find(
        c =>
          (c.initiatorId === userId || c.targetId === userId) &&
          (c.status === "ringing" || c.status === "connected"),
      ) || null
    );
  },
});

// ─── PRESENCE & SYNC ───

export const updatePresence = mutation({
  args: {
    status: v.union(
      v.literal("online"),
      v.literal("away"),
      v.literal("in_session"),
      v.literal("in_call"),
      v.literal("offline"),
    ),
    currentPage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("userPresence")
      .withIndex("by_user", q => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        currentPage: args.currentPage,
        lastSeen: Date.now(),
      });
    } else {
      await ctx.db.insert("userPresence", {
        userId,
        status: args.status,
        currentPage: args.currentPage,
        lastSeen: Date.now(),
      });
    }
  },
});

export const getOnlineUsers = query({
  args: {},
  handler: async ctx => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const presences = await ctx.db.query("userPresence").collect();
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

    const online = presences.filter(
      p => p.lastSeen > fiveMinutesAgo && p.status !== "offline",
    );

    const enriched = await Promise.all(
      online.map(async p => {
        const user = await ctx.db.get(p.userId);
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", q => q.eq("userId", p.userId))
          .first();
        return {
          userId: p.userId,
          userName: user?.name || user?.email || "Unknown",
          role: profile?.role || "operator",
          status: p.status,
          currentPage: p.currentPage,
          lastSeen: p.lastSeen,
        };
      }),
    );

    return enriched;
  },
});

// ─── SYNCHRONIZATION STATE ───
// Tracks what each user has seen/synced across devices

export const getSyncState = query({
  args: {},
  handler: async ctx => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const mirror = await ctx.db
      .query("mirrors")
      .withIndex("by_user", q => q.eq("userId", userId))
      .first();

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", q => q.eq("userId", userId))
      .first();

    const presence = await ctx.db
      .query("userPresence")
      .withIndex("by_user", q => q.eq("userId", userId))
      .first();

    const recentReflections = await ctx.db
      .query("reflections")
      .withIndex("by_user", q => q.eq("userId", userId))
      .order("desc")
      .take(5);

    return {
      userId,
      mirror: mirror
        ? {
            callsign: mirror.callsign,
            cognitiveState: mirror.cognitiveState,
            status: mirror.status,
            totalReflections: mirror.totalReflections,
            baselineEstablished: mirror.baselineEstablished,
          }
        : null,
      profile: profile
        ? {
            role: profile.role,
            approvalStatus: profile.approvalStatus,
            completedCourses: profile.completedCourses,
          }
        : null,
      presence: presence
        ? {
            status: presence.status,
            lastSeen: presence.lastSeen,
          }
        : null,
      recentReflections: recentReflections.length,
      syncTimestamp: Date.now(),
    };
  },
});
