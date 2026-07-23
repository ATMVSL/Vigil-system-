import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── CERTIFICATIONS ───

export const getMyCertifications = query({
  args: {},
  handler: async ctx => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("certifications")
      .withIndex("by_user", q => q.eq("userId", userId))
      .collect();
  },
});

export const issueCertification = mutation({
  args: {
    studentId: v.id("users"),
    type: v.union(
      v.literal("sql"),
      v.literal("infrastructure"),
      v.literal("mirror_operator"),
      v.literal("peer_support"),
      v.literal("vigil_operator"),
      v.literal("vigil_instructor"),
    ),
    courseId: v.optional(v.id("courses")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const certNum = `VIGIL-${args.type.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    const oneYear = 365 * 24 * 60 * 60 * 1000;
    return await ctx.db.insert("certifications", {
      userId: args.studentId,
      type: args.type,
      courseId: args.courseId,
      certificateNumber: certNum,
      status: "active",
      issuedAt: Date.now(),
      expiresAt: Date.now() + oneYear,
      issuedBy: userId,
    });
  },
});

export const revokeCertification = mutation({
  args: { certificationId: v.id("certifications") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.patch(args.certificationId, { status: "revoked" });
  },
});

export const getProgress = query({
  args: {},
  handler: async ctx => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_user", q => q.eq("userId", userId))
      .collect();
    const certs = await ctx.db
      .query("certifications")
      .withIndex("by_user", q => q.eq("userId", userId))
      .collect();
    const examAttempts = await ctx.db
      .query("examAttempts")
      .withIndex("by_user", q => q.eq("userId", userId))
      .collect();
    const sqlSubs = await ctx.db
      .query("sqlSubmissions")
      .withIndex("by_user", q => q.eq("userId", userId))
      .collect();
    const infraAttempts = await ctx.db
      .query("infraAttempts")
      .withIndex("by_user", q => q.eq("userId", userId))
      .collect();
    const reviews = await ctx.db
      .query("instructorReviews")
      .withIndex("by_student", q => q.eq("studentId", userId))
      .collect();

    return {
      completedCourses: enrollments.filter(
        e => e.status === "completed" || e.status === "certified",
      ).length,
      totalEnrollments: enrollments.length,
      activeCerts: certs.filter(c => c.status === "active").length,
      totalCerts: certs.length,
      examsPassed: examAttempts.filter(a => a.passed).length,
      sqlPassed: new Set(sqlSubs.filter(s => s.passed).map(s => s.challengeId))
        .size,
      infraCompleted: infraAttempts.filter(a => a.status === "completed")
        .length,
      instructorReviews: reviews.length,
      passedReviews: reviews.filter(r => r.grade !== "fail").length,
    };
  },
});

// ─── EXAMS ───

export const listExams = query({
  args: {},
  handler: async ctx => {
    return await ctx.db.query("exams").collect();
  },
});

export const getExam = query({
  args: { examId: v.id("exams") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.examId);
  },
});

export const submitExam = mutation({
  args: {
    examId: v.id("exams"),
    answers: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const exam = await ctx.db.get(args.examId);
    if (!exam) throw new Error("Exam not found");

    const questions = JSON.parse(exam.questions);
    const studentAnswers = JSON.parse(args.answers);
    let correct = 0;
    for (let i = 0; i < questions.length; i++) {
      if (studentAnswers[i] === questions[i].correctAnswer) correct++;
    }
    const score = Math.round((correct / questions.length) * 100);
    const passed = score >= exam.passingScore;

    await ctx.db.insert("examAttempts", {
      userId,
      examId: args.examId,
      answers: args.answers,
      score,
      passed,
      startedAt: Date.now() - 1000,
      completedAt: Date.now(),
    });

    return { score, passed, correct, total: questions.length };
  },
});

export const getMyExamAttempts = query({
  args: {},
  handler: async ctx => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("examAttempts")
      .withIndex("by_user", q => q.eq("userId", userId))
      .collect();
  },
});

export const verifyCertificate = query({
  args: { certificateNumber: v.string() },
  handler: async (ctx, args) => {
    const cert = await ctx.db
      .query("certifications")
      .filter(q => q.eq(q.field("certificateNumber"), args.certificateNumber))
      .first();
    return cert;
  },
});
