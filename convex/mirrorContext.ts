import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// ─── LIVE USER CONTEXT FOR MIRROR ───
// Gathers all user data so the Mirror has full situational awareness:
// profile, mirror state, course progress, certifications, training history,
// SQL lab performance, exam results, and recent activity.

export const getUserMirrorContext = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    // ─── Profile ───
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    // ─── Mirror ───
    const mirror = await ctx.db
      .query("mirrors")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    // ─── All courses (for title lookups) ───
    const allCourses = await ctx.db.query("courses").collect();
    const courseMap = new Map(allCourses.map((c) => [c._id, c]));

    // ─── Enrollments ───
    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const courseProgress = enrollments.map((e) => {
      const course = courseMap.get(e.courseId);
      return {
        courseTitle: course?.title || "Unknown",
        category: course?.category || "unknown",
        status: e.status,
        progress: Math.round(e.progress * 100),
        currentLesson: e.currentLessonOrder || 0,
        totalLessons: course?.lessonsCount || 0,
        enrolledAt: new Date(e.enrolledAt).toLocaleDateString(),
        completedAt: e.completedAt
          ? new Date(e.completedAt).toLocaleDateString()
          : null,
      };
    });

    // ─── Certifications ───
    const certifications = await ctx.db
      .query("certifications")
      .collect();
    const userCerts = certifications
      .filter((c) => c.userId === userId)
      .map((c) => ({
        type: c.type,
        issuedAt: new Date(c.issuedAt).toLocaleDateString(),
        status: c.status,
      }));

    // ─── SQL Lab Performance ───
    const sqlSubmissions = await ctx.db
      .query("sqlSubmissions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const sqlPassed = sqlSubmissions.filter((s) => s.passed);
    const sqlStats = {
      totalAttempts: sqlSubmissions.length,
      passed: sqlPassed.length,
      failed: sqlSubmissions.length - sqlPassed.length,
      passRate:
        sqlSubmissions.length > 0
          ? Math.round((sqlPassed.length / sqlSubmissions.length) * 100)
          : 0,
    };

    // ─── Infra Lab Performance ───
    const infraAttempts = await ctx.db
      .query("infraAttempts")
      .collect();
    const userInfra = infraAttempts.filter((a) => a.userId === userId);
    const infraCompleted = userInfra.filter((a) => a.status === "completed");
    const infraStats = {
      totalAttempts: userInfra.length,
      passed: infraCompleted.length,
      passRate:
        userInfra.length > 0
          ? Math.round((infraCompleted.length / userInfra.length) * 100)
          : 0,
    };

    // ─── Exam Results ───
    const examAttempts = await ctx.db
      .query("examAttempts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const allExams = await ctx.db.query("exams").collect();
    const examMap = new Map(allExams.map((e) => [e._id, e]));

    const examResults = examAttempts.map((a) => {
      const exam = examMap.get(a.examId);
      return {
        examTitle: exam?.title || "Unknown",
        score: a.score,
        passed: a.passed,
        completedAt: new Date(a.completedAt).toLocaleDateString(),
      };
    });

    // ─── Recent Activity (last 20) ───
    const activities = await ctx.db
      .query("activityLog")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(20);

    const recentActivity = activities.map((a) => ({
      action: a.action,
      module: a.module,
      when: new Date(a.createdAt).toLocaleDateString(),
    }));

    // ─── Recent Reflections count ───
    const reflections = mirror
      ? await ctx.db
          .query("reflections")
          .withIndex("by_mirror", (q) => q.eq("mirrorId", mirror._id))
          .collect()
      : [];

    // ─── Summary stats ───
    const completedCourses = enrollments.filter(
      (e) => e.status === "completed" || e.status === "certified"
    ).length;
    const inProgressCourses = enrollments.filter(
      (e) => e.status === "in_progress"
    ).length;
    const totalCourses = allCourses.length;

    return {
      profile: profile
        ? {
            role: profile.role,
            callsign: mirror?.callsign || "Unknown",
            cognitiveState: mirror?.cognitiveState || "stable",
            certificationVerified: profile.certificationVerified || false,
            joinedAt: new Date(profile._creationTime).toLocaleDateString(),
          }
        : null,
      academyProgress: {
        completedCourses,
        inProgressCourses,
        totalCoursesAvailable: totalCourses,
        enrolledCourses: courseProgress,
      },
      certifications: userCerts,
      sqlLab: sqlStats,
      infraLab: infraStats,
      exams: examResults,
      recentActivity,
      totalReflections: reflections.length,
      mirrorSessionsCount: reflections.length,
    };
  },
});
