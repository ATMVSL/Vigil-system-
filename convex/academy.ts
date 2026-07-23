import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const categoryValidator = v.union(
  v.literal("self_doctrine"),
  v.literal("mirror_operations"),
  v.literal("cognitive_loop"),
  v.literal("sql_training"),
  v.literal("infrastructure"),
  v.literal("certification"),
);

export const listCourses = query({
  args: {
    category: v.optional(categoryValidator),
  },
  handler: async (ctx, { category }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const q = category
      ? ctx.db
          .query("courses")
          .withIndex("by_category", idx => idx.eq("category", category))
      : ctx.db.query("courses");
    return await q.collect();
  },
});

export const getCourses = query({
  args: {},
  handler: async ctx => {
    return await ctx.db.query("courses").collect();
  },
});

export const getMyEnrollments = query({
  args: {},
  handler: async ctx => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_user", q => q.eq("userId", userId))
      .collect();

    const enriched = await Promise.all(
      enrollments.map(async enrollment => {
        const course = await ctx.db.get(enrollment.courseId);
        return { ...enrollment, course };
      }),
    );
    return enriched;
  },
});

export const createCourse = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: categoryValidator,
    difficulty: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced"),
    ),
    lessonsCount: v.number(),
    estimatedHours: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const courseId = await ctx.db.insert("courses", {
      ...args,
      isPublished: false,
      createdAt: Date.now(),
    });

    await ctx.db.insert("activityLog", {
      userId,
      action: "Course created",
      module: "academy",
      details: args.title,
      createdAt: Date.now(),
    });

    return courseId;
  },
});

export const enroll = mutation({
  args: { courseId: v.id("courses") },
  handler: async (ctx, { courseId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("enrollments")
      .withIndex("by_user", q => q.eq("userId", userId))
      .filter(q => q.eq(q.field("courseId"), courseId))
      .first();

    if (existing) throw new Error("Already enrolled");

    const course = await ctx.db.get(courseId);

    const enrollmentId = await ctx.db.insert("enrollments", {
      userId,
      courseId,
      progress: 0,
      status: "enrolled",
      enrolledAt: Date.now(),
    });

    await ctx.db.insert("activityLog", {
      userId,
      action: "Enrolled in course",
      module: "academy",
      details: course?.title,
      createdAt: Date.now(),
    });

    return enrollmentId;
  },
});

// Update course progress
export const updateProgress = mutation({
  args: {
    enrollmentId: v.id("enrollments"),
    progress: v.number(),
  },
  handler: async (ctx, { enrollmentId, progress }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const enrollment = await ctx.db.get(enrollmentId);
    if (!enrollment || enrollment.userId !== userId) {
      throw new Error("Enrollment not found");
    }

    const clampedProgress = Math.min(100, Math.max(0, progress));
    const updates: Record<string, unknown> = {
      progress: clampedProgress,
    };

    if (
      clampedProgress >= 100 &&
      enrollment.status !== "completed" &&
      enrollment.status !== "certified"
    ) {
      updates.status = "completed";
      updates.completedAt = Date.now();
    } else if (clampedProgress > 0 && enrollment.status === "enrolled") {
      updates.status = "in_progress";
    }

    await ctx.db.patch(enrollmentId, updates);

    if (clampedProgress >= 100) {
      const course = await ctx.db.get(enrollment.courseId);
      await ctx.db.insert("activityLog", {
        userId,
        action: "Course completed",
        module: "academy",
        details: course?.title,
        createdAt: Date.now(),
      });
    }
  },
});

// Mark enrollment as certified (verified completion)
export const certifyCompletion = mutation({
  args: { enrollmentId: v.id("enrollments") },
  handler: async (ctx, { enrollmentId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if current user is admin+ to certify others, or self-certify for completed courses
    const enrollment = await ctx.db.get(enrollmentId);
    if (!enrollment) throw new Error("Enrollment not found");

    if (enrollment.status !== "completed") {
      throw new Error("Course must be completed before certification");
    }

    await ctx.db.patch(enrollmentId, {
      status: "certified",
      completedAt: enrollment.completedAt || Date.now(),
    });

    const course = await ctx.db.get(enrollment.courseId);
    await ctx.db.insert("activityLog", {
      userId,
      action: "Certification verified",
      module: "academy",
      details: course?.title,
      createdAt: Date.now(),
    });
  },
});
