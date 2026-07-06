import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const mirrors = await ctx.db.query("mirrors").collect();
    const activeMirrors = mirrors.filter((m) => m.status === "active").length;

    const doctrineArticles = await ctx.db.query("doctrineArticles").collect();
    const activeArticles = doctrineArticles.filter((a) => a.isActive).length;

    const evidenceEntries = await ctx.db.query("evidenceEntries").collect();
    const activeEvidence = evidenceEntries.filter((e) => e.status === "active").length;
    const criticalEvidence = evidenceEntries.filter((e) => e.severity === "critical").length;

    const courses = await ctx.db.query("courses").collect();
    const enrollments = await ctx.db.query("enrollments").collect();

    return {
      mirrors: { total: mirrors.length, active: activeMirrors },
      doctrine: { total: doctrineArticles.length, active: activeArticles },
      evidence: { total: evidenceEntries.length, active: activeEvidence, critical: criticalEvidence },
      academy: { courses: courses.length, enrollments: enrollments.length },
    };
  },
});

export const getRecentActivity = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const activities = await ctx.db
      .query("activityLog")
      .order("desc")
      .take(15);

    const enriched = await Promise.all(
      activities.map(async (activity) => {
        const user = await ctx.db.get(activity.userId);
        return { ...activity, userName: user?.name || user?.email || "System" };
      })
    );
    return enriched;
  },
});
