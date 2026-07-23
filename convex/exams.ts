import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── SUBMIT & AUTO-SCORE EXAM ATTEMPTS ───
export const submitExamAttempt = mutation({
  args: {
    examId: v.id("exams"),
    answers: v.string(), // JSON map of questionId / questionIndex -> answer
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const exam = await ctx.db.get(args.examId);
    if (!exam) throw new Error("Exam not found");

    // Fetch questions from question bank
    const questions = await ctx.db
      .query("examQuestions")
      .withIndex("by_exam", q => q.eq("examId", args.examId))
      .collect();

    let studentAnswers: Record<string, string> = {};
    try {
      studentAnswers = JSON.parse(args.answers);
    } catch {
      studentAnswers = {};
    }

    let correctCount = 0;
    const totalQuestions = questions.length || 1;

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const answerKey = studentAnswers[q._id] || studentAnswers[String(i)];
      if (
        answerKey &&
        answerKey.trim().toLowerCase() ===
          q.correctOptionKey.trim().toLowerCase()
      ) {
        correctCount++;
      }
    }

    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= exam.passingScore;

    const attemptId = await ctx.db.insert("examAttempts", {
      userId,
      examId: args.examId,
      answers: args.answers,
      score,
      passed,
      startedAt: Date.now() - 1000 * 60 * 15,
      completedAt: Date.now(),
    });

    // Auto-issue certification if exam is tied to a certification track & passed
    if (passed && exam.certificationType) {
      const certType = exam.certificationType as any;
      const certNumber = `VMS-${Math.floor(100000 + Math.random() * 900000)}`;

      // Check if already certified
      const existingCert = await ctx.db
        .query("certifications")
        .withIndex("by_user", q => q.eq("userId", userId))
        .filter(q => q.eq(q.field("type"), certType))
        .first();

      if (!existingCert) {
        await ctx.db.insert("certifications", {
          userId,
          type: certType,
          certificateNumber: certNumber,
          status: "active",
          issuedAt: Date.now(),
          expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 365 * 2, // 2 years
        });

        // Upgrade user profile
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", q => q.eq("userId", userId))
          .unique();

        if (profile) {
          await ctx.db.patch(profile._id, {
            totalCertifications: profile.totalCertifications + 1,
            certificationVerified: true,
            role: profile.role === "operator" ? "certified" : profile.role,
          });
        }
      }
    }

    return {
      attemptId,
      score,
      passed,
      passingScore: exam.passingScore,
      totalQuestions,
      correctCount,
    };
  },
});

// ─── GET EXAM WITH QUESTION BANK ───
export const getExamDetails = query({
  args: { examId: v.id("exams") },
  handler: async (ctx, args) => {
    const exam = await ctx.db.get(args.examId);
    if (!exam) return null;

    const questions = await ctx.db
      .query("examQuestions")
      .withIndex("by_exam", q => q.eq("examId", args.examId))
      .collect();

    return {
      ...exam,
      questionBank: questions.map(q => {
        let options: string[] = [];
        try {
          options = JSON.parse(q.optionsJson);
        } catch {
          options = [];
        }
        return {
          id: q._id,
          section: q.section || "General",
          questionText: q.questionText,
          options,
          explanation: q.explanation,
        };
      }),
    };
  },
});
