import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── INSTRUCTOR PORTAL ───

export const getMyStudents = query({
  args: {},
  handler: async ctx => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    // Instructors see all students' enrollments
    const enrollments = await ctx.db.query("enrollments").collect();
    const enriched = await Promise.all(
      enrollments.map(async e => {
        const user = await ctx.db.get(e.userId);
        const course = await ctx.db.get(e.courseId);
        return {
          ...e,
          studentName: user?.name || "Unknown",
          studentEmail: user?.email,
          courseTitle: course?.title || "Unknown",
        };
      }),
    );
    return enriched;
  },
});

export const submitReview = mutation({
  args: {
    studentId: v.id("users"),
    courseId: v.optional(v.id("courses")),
    type: v.union(
      v.literal("practical"),
      v.literal("simulation"),
      v.literal("peer_support"),
      v.literal("certification_review"),
      v.literal("general"),
    ),
    grade: v.union(
      v.literal("pass"),
      v.literal("fail"),
      v.literal("merit"),
      v.literal("distinction"),
    ),
    feedback: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("instructorReviews", {
      instructorId: userId,
      studentId: args.studentId,
      courseId: args.courseId,
      type: args.type,
      grade: args.grade,
      feedback: args.feedback,
      createdAt: Date.now(),
    });
  },
});

export const getReviewsForStudent = query({
  args: { studentId: v.id("users") },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("instructorReviews")
      .withIndex("by_student", q => q.eq("studentId", args.studentId))
      .collect();
    const enriched = await Promise.all(
      reviews.map(async r => {
        const instructor = await ctx.db.get(r.instructorId);
        const course = r.courseId ? await ctx.db.get(r.courseId) : null;
        return {
          ...r,
          instructorName: instructor?.name || "Unknown",
          courseTitle: course?.title,
        };
      }),
    );
    return enriched.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getMyReviews = query({
  args: {},
  handler: async ctx => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("instructorReviews")
      .withIndex("by_student", q => q.eq("studentId", userId))
      .collect();
  },
});

// ─── LESSON MANAGEMENT ───

export const createLesson = mutation({
  args: {
    courseId: v.id("courses"),
    title: v.string(),
    content: v.string(),
    type: v.union(
      v.literal("lecture"),
      v.literal("lab"),
      v.literal("assessment"),
      v.literal("simulation"),
      v.literal("practical"),
    ),
    order: v.number(),
    durationMinutes: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("lessons", {
      ...args,
      isPublished: true,
      createdAt: Date.now(),
    });
  },
});

export const getLessons = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_course", q => q.eq("courseId", args.courseId))
      .collect();
    return lessons.sort((a, b) => a.order - b.order);
  },
});

// ─── COURSE CREATION (Instructor) ───

export const createCourse = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("self_doctrine"),
      v.literal("mirror_operations"),
      v.literal("cognitive_loop"),
      v.literal("sql_training"),
      v.literal("infrastructure"),
      v.literal("certification"),
      v.literal("peer_support"),
      v.literal("continuing_education"),
    ),
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
    return await ctx.db.insert("courses", {
      ...args,
      isPublished: true,
      createdBy: userId,
      createdAt: Date.now(),
    });
  },
});
