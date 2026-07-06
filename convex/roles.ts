import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Founder email — full unrestricted access
const FOUNDER_EMAILS = [
  "dragonleadera1@gmail.com",
  "steven.gonzales@vigilsysllc.com",
];
function isFounderEmail(email?: string | null): boolean {
  if (!email) return false;
  return FOUNDER_EMAILS.includes(email.toLowerCase());
}

const ROLE_HIERARCHY = ["operator", "certified", "admin", "superadmin", "founder"] as const;
type Role = (typeof ROLE_HIERARCHY)[number];

export function roleLevel(role: Role): number {
  return ROLE_HIERARCHY.indexOf(role);
}

export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!profile) {
      // Profile not yet created — return default
      const user = await ctx.db.get(userId);
      return {
        role: isFounderEmail(user?.email) ? "founder" : "operator",
        completedCourses: 0,
        totalCertifications: 0,
        certificationVerified: false,
        needsInit: true,
      };
    }

    return { ...profile, needsInit: false };
  },
});

export const getProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const authId = await getAuthUserId(ctx);
    if (!authId) return null;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return profile;
  },
});

// Initialize profile on first login (called by dashboard)
export const initProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if profile already exists
    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) return existing._id;

    // Check if this is the founder
    const user = await ctx.db.get(userId);
    const isFounder = isFounderEmail(user?.email);

    const profileId = await ctx.db.insert("userProfiles", {
      userId,
      role: isFounder ? "founder" : "operator",
      completedCourses: 0,
      totalCertifications: 0,
      certificationVerified: false,
      promotedAt: isFounder ? Date.now() : undefined,
      createdAt: Date.now(),
    });

    await ctx.db.insert("activityLog", {
      userId,
      action: isFounder ? "Founder profile initialized" : "Operator profile initialized",
      module: "system",
      details: `Role: ${isFounder ? "FOUNDER" : "OPERATOR"}`,
      createdAt: Date.now(),
    });

    return profileId;
  },
});

// Check and upgrade role based on course completions
export const checkRolePromotion = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!profile) throw new Error("Profile not initialized");
    if (profile.role === "founder") return { promoted: false, role: "founder" };

    // Count completed courses
    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const completedEnrollments = enrollments.filter(
      (e) => e.status === "completed" || e.status === "certified"
    );

    const certifiedEnrollments = enrollments.filter(
      (e) => e.status === "certified"
    );

    // Check if VIGIL Operator Certification is completed
    const allCourses = await ctx.db.query("courses").collect();
    const certCourse = allCourses.find((c) => c.category === "certification");
    const hasCertification = certCourse
      ? enrollments.some(
          (e) => e.courseId === certCourse._id && (e.status === "completed" || e.status === "certified")
        )
      : false;

    const totalCourses = allCourses.length;
    const allCoursesCompleted = completedEnrollments.length >= totalCourses;

    // Determine new role
    let newRole: Role = profile.role as Role;

    if (allCoursesCompleted && hasCertification) {
      // All courses + certification = superadmin
      newRole = "superadmin";
    } else if (allCoursesCompleted) {
      // All courses completed = admin
      newRole = "admin";
    } else if (hasCertification) {
      // Certification passed = certified
      newRole = "certified";
    }

    const promoted = roleLevel(newRole) > roleLevel(profile.role as Role);

    // Update profile
    await ctx.db.patch(profile._id, {
      completedCourses: completedEnrollments.length,
      totalCertifications: certifiedEnrollments.length,
      certificationVerified: hasCertification,
      ...(promoted ? { role: newRole, promotedAt: Date.now() } : {}),
    });

    if (promoted) {
      await ctx.db.insert("activityLog", {
        userId,
        action: `Role promoted to ${newRole.toUpperCase()}`,
        module: "system",
        details: `Completed ${completedEnrollments.length}/${totalCourses} courses`,
        createdAt: Date.now(),
      });
    }

    return { promoted, role: newRole, completedCourses: completedEnrollments.length, totalCourses };
  },
});

// Founder/superadmin: manually set a user's role
export const setUserRole = mutation({
  args: {
    targetUserId: v.id("users"),
    role: v.union(
      v.literal("operator"),
      v.literal("certified"),
      v.literal("admin"),
      v.literal("superadmin")
    ),
  },
  handler: async (ctx, { targetUserId, role }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Only founder/superadmin can set roles
    const myProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!myProfile || (myProfile.role !== "founder" && myProfile.role !== "superadmin")) {
      throw new Error("Insufficient privileges — requires Founder or Superadmin role");
    }

    // Can't demote founder
    const targetProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", targetUserId))
      .first();

    if (targetProfile?.role === "founder") {
      throw new Error("Cannot modify Founder role");
    }

    if (targetProfile) {
      await ctx.db.patch(targetProfile._id, { role, promotedAt: Date.now() });
    } else {
      await ctx.db.insert("userProfiles", {
        userId: targetUserId,
        role,
        completedCourses: 0,
        totalCertifications: 0,
        certificationVerified: false,
        promotedAt: Date.now(),
        createdAt: Date.now(),
      });
    }

    await ctx.db.insert("activityLog", {
      userId,
      action: `Set user role to ${role.toUpperCase()}`,
      module: "admin",
      details: `Target: ${targetUserId}`,
      createdAt: Date.now(),
    });
  },
});

// Fix any existing founder-email users who have wrong roles
export const fixFounderAccess = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    let fixed = 0;
    for (const user of users) {
      if (isFounderEmail(user.email)) {
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q: any) => q.eq("userId", user._id))
          .first();
        if (profile && profile.role !== "founder") {
          await ctx.db.patch(profile._id, { role: "founder", promotedAt: Date.now() });
          fixed++;
        }
      }
    }
    return { fixed };
  },
});
