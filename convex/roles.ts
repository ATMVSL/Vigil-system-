import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";

// Founder email — full unrestricted access
const FOUNDER_EMAILS = [
  "dragonleadera1@gmail.com",
  "steven.gonzales@vigilsysllc.com",
  "azvsysllc@gmail.com",
  "thatguy520az@gmail.com",
];
function isFounderEmail(email?: string | null): boolean {
  if (!email) return false;
  return FOUNDER_EMAILS.includes(email.toLowerCase());
}

// Super admin emails — elevated access, still below Founder
const SUPERADMIN_EMAILS = [
  "breakitdowninside@gmail.com",
  "plunaiii@yahoo.com",
  "lany002@live.com",
];
function isSuperadminEmail(email?: string | null): boolean {
  if (!email) return false;
  return SUPERADMIN_EMAILS.includes(email.toLowerCase());
}

const ROLE_HIERARCHY = [
  "operator",
  "certified",
  "admin",
  "superadmin",
  "founder",
] as const;
type Role = (typeof ROLE_HIERARCHY)[number];

export function roleLevel(role: Role): number {
  return ROLE_HIERARCHY.indexOf(role);
}

export const getMyProfile = query({
  args: {},
  handler: async ctx => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", q => q.eq("userId", userId))
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
      .withIndex("by_user", q => q.eq("userId", userId))
      .first();

    return profile;
  },
});

// Initialize profile on first login (called by dashboard)
export const initProfile = mutation({
  args: {},
  handler: async ctx => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if profile already exists
    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", q => q.eq("userId", userId))
      .first();

    if (existing) return existing._id;

    // Check if this is the founder or pre-approved superadmin
    const user = await ctx.db.get(userId);
    const isFounder = isFounderEmail(user?.email);
    const isSuperadmin = isSuperadminEmail(user?.email);

    // Determine initial role and approval status
    const initialRole = isFounder
      ? "founder"
      : isSuperadmin
        ? "superadmin"
        : "operator";
    const initialApproval = isFounder || isSuperadmin ? "approved" : "pending";

    const profileId = await ctx.db.insert("userProfiles", {
      userId,
      role: initialRole,
      approvalStatus: initialApproval,
      completedCourses: 0,
      totalCertifications: 0,
      certificationVerified: false,
      promotedAt: isFounder || isSuperadmin ? Date.now() : undefined,
      createdAt: Date.now(),
    });

    await ctx.db.insert("activityLog", {
      userId,
      action: isFounder
        ? "Founder profile initialized"
        : isSuperadmin
          ? "Super admin profile initialized (pre-approved)"
          : "New applicant — pending Founder approval",
      module: "system",
      details: `Role: ${initialRole.toUpperCase()}${initialApproval === "pending" ? " (PENDING)" : ""}`,
      createdAt: Date.now(),
    });

    // Send email notification to Founder for new applicants who need approval
    if (!isFounder && !isSuperadmin && user?.email) {
      await ctx.scheduler.runAfter(
        0,
        internal.notifications.notifyFounderNewApplicant,
        {
          applicantEmail: user.email,
          applicantId: userId,
          timestamp: Date.now(),
        },
      );
    }

    return profileId;
  },
});

// Check and upgrade role based on course completions
export const checkRolePromotion = mutation({
  args: {},
  handler: async ctx => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", q => q.eq("userId", userId))
      .first();

    if (!profile) throw new Error("Profile not initialized");
    if (profile.role === "founder") return { promoted: false, role: "founder" };

    // Count completed courses
    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_user", q => q.eq("userId", userId))
      .collect();

    const completedEnrollments = enrollments.filter(
      e => e.status === "completed" || e.status === "certified",
    );

    const certifiedEnrollments = enrollments.filter(
      e => e.status === "certified",
    );

    // Check if VIGIL Operator Certification is completed
    const allCourses = await ctx.db.query("courses").collect();
    const certCourse = allCourses.find(c => c.category === "certification");
    const hasCertification = certCourse
      ? enrollments.some(
          e =>
            e.courseId === certCourse._id &&
            (e.status === "completed" || e.status === "certified"),
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

    return {
      promoted,
      role: newRole,
      completedCourses: completedEnrollments.length,
      totalCourses,
    };
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
      v.literal("superadmin"),
    ),
  },
  handler: async (ctx, { targetUserId, role }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Only founder/superadmin can set roles
    const myProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", q => q.eq("userId", userId))
      .first();

    if (
      !myProfile ||
      (myProfile.role !== "founder" && myProfile.role !== "superadmin")
    ) {
      throw new Error(
        "Insufficient privileges — requires Founder or Superadmin role",
      );
    }

    // Can't demote founder
    const targetProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", q => q.eq("userId", targetUserId))
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

// ─── APPLICANT APPROVAL SYSTEM ───

// Get all pending applicants (Founder only)
export const getPendingApplicants = query({
  args: {},
  handler: async ctx => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Only founders can see pending applicants
    const myProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", q => q.eq("userId", userId))
      .first();

    if (!myProfile || myProfile.role !== "founder") return [];

    // Get all profiles with pending status
    const allProfiles = await ctx.db.query("userProfiles").collect();
    const pendingProfiles = allProfiles.filter(
      p => p.approvalStatus === "pending",
    );

    // Enrich with user email info
    const results = [];
    for (const profile of pendingProfiles) {
      const user = await ctx.db.get(profile.userId);
      results.push({
        profileId: profile._id,
        userId: profile.userId,
        email: user?.email || "unknown",
        createdAt: profile.createdAt,
      });
    }

    return results;
  },
});

// Approve or deny an applicant (Founder only)
export const reviewApplicant = mutation({
  args: {
    profileId: v.id("userProfiles"),
    decision: v.union(v.literal("approved"), v.literal("denied")),
  },
  handler: async (ctx, { profileId, decision }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Only founders can approve/deny
    const myProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", q => q.eq("userId", userId))
      .first();

    if (!myProfile || myProfile.role !== "founder") {
      throw new Error("Only the Founder can approve or deny applicants");
    }

    const targetProfile = await ctx.db.get(profileId);
    if (!targetProfile) throw new Error("Profile not found");

    await ctx.db.patch(profileId, { approvalStatus: decision });

    // Get applicant email for notification
    const targetUser = await ctx.db.get(targetProfile.userId);

    await ctx.db.insert("activityLog", {
      userId,
      action: `Applicant ${decision}: ${targetUser?.email || "unknown"}`,
      module: "admin",
      details: `Decision: ${decision.toUpperCase()}`,
      createdAt: Date.now(),
    });

    // Notify applicant of decision
    if (targetUser?.email) {
      await ctx.scheduler.runAfter(
        0,
        internal.notifications.notifyApplicantDecision,
        {
          applicantEmail: targetUser.email,
          approved: decision === "approved",
        },
      );
    }
  },
});

// Get approval status for current user
export const getMyApprovalStatus = query({
  args: {},
  handler: async ctx => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", q => q.eq("userId", userId))
      .first();

    if (!profile) return null;

    // Founders are always approved
    if (profile.role === "founder") return "approved";

    return profile.approvalStatus || "approved"; // Legacy profiles without status are approved
  },
});

// ─── ACADEMY COMPLETION GATE ───
// Core features (Mirror, Evidence, Doctrine authoring) require Academy completion
// Founder and Superadmin bypass this gate. Everyone else must complete all courses.
export const getCoreAccessStatus = query({
  args: {},
  handler: async ctx => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { allowed: false, reason: "Not authenticated" };

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", q => q.eq("userId", userId))
      .first();

    if (!profile) return { allowed: false, reason: "Profile not initialized" };

    // Check approval status first — nobody gets in without Founder approval
    if (
      profile.approvalStatus === "pending" ||
      profile.approvalStatus === "denied"
    ) {
      return {
        allowed: false,
        reason:
          profile.approvalStatus === "pending"
            ? "Awaiting Founder approval"
            : "Access denied by Founder",
        approvalStatus: profile.approvalStatus,
      };
    }

    // Founder and Superadmin bypass Academy gate
    if (profile.role === "founder" || profile.role === "superadmin") {
      return {
        allowed: true,
        reason: `${profile.role === "founder" ? "Founder" : "Superadmin"} — full access`,
        role: profile.role,
        academyComplete: true,
      };
    }

    // Everyone else must complete all Academy courses
    const allCourses = await ctx.db.query("courses").collect();
    const publishedCourses = allCourses.filter(c => c.isPublished);

    if (publishedCourses.length === 0) {
      return {
        allowed: false,
        reason: "Academy courses not yet available",
        coursesTotal: 0,
        coursesCompleted: 0,
      };
    }

    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_user", q => q.eq("userId", userId))
      .collect();

    const completedCourseIds = new Set(
      enrollments
        .filter(e => e.status === "completed" || e.status === "certified")
        .map(e => e.courseId.toString()),
    );

    const coursesTotal = publishedCourses.length;
    const coursesCompleted = publishedCourses.filter(c =>
      completedCourseIds.has(c._id.toString()),
    ).length;
    const academyComplete = coursesCompleted >= coursesTotal;

    return {
      allowed: academyComplete,
      reason: academyComplete
        ? "Academy complete — core access granted"
        : `Complete all Academy courses first (${coursesCompleted}/${coursesTotal})`,
      role: profile.role,
      academyComplete,
      coursesTotal,
      coursesCompleted,
    };
  },
});

// Fix any existing founder/superadmin-email users who have wrong roles
export const fixFounderAccess = mutation({
  args: {},
  handler: async ctx => {
    const users = await ctx.db.query("users").collect();
    let fixed = 0;
    for (const user of users) {
      const profile = await ctx.db
        .query("userProfiles")
        .withIndex("by_user", (q: any) => q.eq("userId", user._id))
        .first();

      if (isFounderEmail(user.email)) {
        if (profile && profile.role !== "founder") {
          await ctx.db.patch(profile._id, {
            role: "founder",
            approvalStatus: "approved",
            promotedAt: Date.now(),
          });
          fixed++;
        }
      } else if (isSuperadminEmail(user.email)) {
        if (
          profile &&
          profile.role !== "superadmin" &&
          profile.role !== "founder"
        ) {
          await ctx.db.patch(profile._id, {
            role: "superadmin",
            approvalStatus: "approved",
            promotedAt: Date.now(),
          });
          fixed++;
        }
      }
    }
    return { fixed };
  },
});
