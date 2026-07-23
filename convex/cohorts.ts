import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── CREATE COHORT (Admin / Instructor) ───
export const createCohort = mutation({
  args: {
    name: v.string(),
    type: v.union(
      v.literal("veterans"),
      v.literal("reentry"),
      v.literal("operators"),
      v.literal("agency_partners"),
    ),
    description: v.optional(v.string()),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile || (profile.role !== "admin" && profile.role !== "superadmin" && profile.role !== "founder")) {
      throw new Error("Only instructors/admins can create cohorts");
    }

    const cohortId = await ctx.db.insert("cohorts", {
      name: args.name,
      type: args.type,
      instructorId: userId,
      description: args.description,
      startDate: args.startDate,
      endDate: args.endDate,
      status: "active",
      createdAt: Date.now(),
    });

    // Add instructor as lead member
    await ctx.db.insert("cohortMemberships", {
      cohortId,
      userId,
      role: "lead",
      joinedAt: Date.now(),
    });

    return cohortId;
  },
});

// ─── ADD MEMBER TO COHORT ───
export const addMember = mutation({
  args: {
    cohortId: v.id("cohorts"),
    userId: v.id("users"),
    role: v.optional(v.union(v.literal("student"), v.literal("lead"), v.literal("auditor"))),
  },
  handler: async (ctx, args) => {
    const callerId = await getAuthUserId(ctx);
    if (!callerId) throw new Error("Unauthorized");

    const existing = await ctx.db
      .query("cohortMemberships")
      .withIndex("by_cohort", (q) => q.eq("cohortId", args.cohortId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("cohortMemberships", {
      cohortId: args.cohortId,
      userId: args.userId,
      role: args.role || "student",
      joinedAt: Date.now(),
    });
  },
});

// ─── LIST COHORTS ───
export const listCohorts = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const allCohorts = await ctx.db.query("cohorts").collect();

    const cohortsWithCounts = await Promise.all(
      allCohorts.map(async (cohort) => {
        const members = await ctx.db
          .query("cohortMemberships")
          .withIndex("by_cohort", (q) => q.eq("cohortId", cohort._id))
          .collect();

        return {
          ...cohort,
          memberCount: members.length,
        };
      }),
    );

    return cohortsWithCounts;
  },
});

// ─── GET COHORT PROGRESS & AGENCY REPORT ───
export const getCohortReport = query({
  args: { cohortId: v.id("cohorts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const cohort = await ctx.db.get(args.cohortId);
    if (!cohort) throw new Error("Cohort not found");

    const members = await ctx.db
      .query("cohortMemberships")
      .withIndex("by_cohort", (q) => q.eq("cohortId", args.cohortId))
      .collect();

    const memberDetails = await Promise.all(
      members.map(async (m) => {
        const u = await ctx.db.get(m.userId);
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", m.userId))
          .unique();

        const enrollments = await ctx.db
          .query("enrollments")
          .withIndex("by_user", (q) => q.eq("userId", m.userId))
          .collect();

        const certs = await ctx.db
          .query("certifications")
          .withIndex("by_user", (q) => q.eq("userId", m.userId))
          .collect();

        const avgProgress = enrollments.length
          ? Math.round(
              enrollments.reduce((acc, e) => acc + e.progress, 0) /
                enrollments.length,
            )
          : 0;

        return {
          userId: m.userId,
          name: u?.name || u?.email || "Operator",
          email: u?.email || "",
          role: m.role,
          userRole: profile?.role || "operator",
          completedCourses: profile?.completedCourses || 0,
          avgProgress,
          totalCertifications: certs.length,
          joinedAt: m.joinedAt,
        };
      }),
    );

    const overallAvgProgress = memberDetails.length
      ? Math.round(
          memberDetails.reduce((acc, m) => acc + m.avgProgress, 0) /
            memberDetails.length,
        )
      : 0;

    const totalCertificationsIssued = memberDetails.reduce(
      (acc, m) => acc + m.totalCertifications,
      0,
    );

    return {
      cohort,
      totalMembers: members.length,
      overallAvgProgress,
      totalCertificationsIssued,
      members: memberDetails,
    };
  },
});
