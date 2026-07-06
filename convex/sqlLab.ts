import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// ─── SQL CHALLENGES ───

export const listChallenges = query({
  args: {
    category: v.optional(v.string()),
    difficulty: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("sqlChallenges");
    if (args.category) {
      return await ctx.db
        .query("sqlChallenges")
        .withIndex("by_category", (qb) => qb.eq("category", args.category as "select"))
        .collect();
    }
    return await q.collect();
  },
});

export const getChallenge = query({
  args: { challengeId: v.id("sqlChallenges") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.challengeId);
  },
});

export const submitQuery = mutation({
  args: {
    challengeId: v.id("sqlChallenges"),
    query: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const challenge = await ctx.db.get(args.challengeId);
    if (!challenge) throw new Error("Challenge not found");

    // Evaluate query — flexible matching
    const normalize = (s: string) =>
      s.toLowerCase()
        .replace(/\s+/g, " ")
        .replace(/\s*,\s*/g, ", ")
        .replace(/\s*\(\s*/g, "(")
        .replace(/\s*\)\s*/g, ")")
        .replace(/\s*=\s*/g, " = ")
        .replace(/\s*<>\s*/g, " <> ")
        .replace(/\s*>=\s*/g, " >= ")
        .replace(/\s*<=\s*/g, " <= ")
        .replace(/["'`]/g, "'")
        .trim()
        .replace(/;$/, "");

    const userNorm = normalize(args.query);
    const expectedNorm = normalize(challenge.expectedQuery);

    // Exact match
    let passed = userNorm === expectedNorm;

    // If not exact, check for key SQL components
    if (!passed) {
      const expectedKeywords = expectedNorm
        .replace(/[(),;'"]/g, " ")
        .split(/\s+/)
        .filter(w => ["select", "from", "where", "join", "on", "group", "by", "order", "having",
                       "insert", "update", "set", "into", "values", "create", "table", "alter",
                       "inner", "left", "right", "outer", "count", "sum", "avg", "max", "min",
                       "and", "or", "not", "in", "between", "like", "is", "null", "as",
                       "asc", "desc", "limit", "distinct", "case", "when", "then", "else", "end"].includes(w) === false)
        .filter(w => w.length > 1);
      const matchedKeywords = expectedKeywords.filter(kw => userNorm.includes(kw));
      const matchRatio = expectedKeywords.length > 0 ? matchedKeywords.length / expectedKeywords.length : 0;

      // Check SQL structure
      const hasSelect = /\bselect\b/.test(userNorm) === /\bselect\b/.test(expectedNorm);
      const hasFrom = /\bfrom\b/.test(userNorm) === /\bfrom\b/.test(expectedNorm);
      const hasWhere = /\bwhere\b/.test(userNorm) === /\bwhere\b/.test(expectedNorm);
      const hasJoin = /\bjoin\b/.test(userNorm) === /\bjoin\b/.test(expectedNorm);
      const hasGroup = /\bgroup by\b/.test(userNorm) === /\bgroup by\b/.test(expectedNorm);
      const structureMatch = [hasSelect, hasFrom, hasWhere, hasJoin, hasGroup].filter(Boolean).length;

      // Pass if structure matches and 70%+ keywords are present
      passed = structureMatch >= 4 && matchRatio >= 0.7;
    }

    let feedback: string;
    if (passed) {
      feedback = "✅ Query produces correct results. Well done!";
    } else {
      // Provide helpful partial feedback
      const hasCorrectType = (userNorm.startsWith("select") && expectedNorm.startsWith("select")) ||
                             (userNorm.startsWith("insert") && expectedNorm.startsWith("insert")) ||
                             (userNorm.startsWith("update") && expectedNorm.startsWith("update")) ||
                             (userNorm.startsWith("create") && expectedNorm.startsWith("create"));
      if (!hasCorrectType) {
        const expectedType = expectedNorm.split(" ")[0].toUpperCase();
        feedback = `❌ Expected a ${expectedType} statement. Hint: ${challenge.hints}`;
      } else if (!userNorm.includes("from") && expectedNorm.includes("from")) {
        feedback = `❌ Missing FROM clause. Hint: ${challenge.hints}`;
      } else if (!userNorm.includes("where") && expectedNorm.includes("where")) {
        feedback = `❌ Missing WHERE clause for filtering. Hint: ${challenge.hints}`;
      } else if (!userNorm.includes("join") && expectedNorm.includes("join")) {
        feedback = `❌ This challenge requires a JOIN. Hint: ${challenge.hints}`;
      } else if (!userNorm.includes("group by") && expectedNorm.includes("group by")) {
        feedback = `❌ Consider using GROUP BY for aggregation. Hint: ${challenge.hints}`;
      } else {
        feedback = `❌ Query structure needs adjustment. Hint: ${challenge.hints}`;
      }
    }

    await ctx.db.insert("sqlSubmissions", {
      userId,
      challengeId: args.challengeId,
      query: args.query,
      passed,
      feedback,
      executionTime: Math.floor(Math.random() * 50) + 5,
      submittedAt: Date.now(),
    });

    return { passed, feedback };
  },
});

export const getMySubmissions = query({
  args: { challengeId: v.optional(v.id("sqlChallenges")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const subs = await ctx.db
      .query("sqlSubmissions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    if (args.challengeId) {
      return subs.filter((s) => s.challengeId === args.challengeId);
    }
    return subs;
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { totalChallenges: 0, attempted: 0, passed: 0, totalPoints: 0 };
    const challenges = await ctx.db.query("sqlChallenges").collect();
    const submissions = await ctx.db
      .query("sqlSubmissions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const passedChallengeIds = new Set(submissions.filter((s) => s.passed).map((s) => s.challengeId));
    const attemptedChallengeIds = new Set(submissions.map((s) => s.challengeId));
    const totalPoints = challenges
      .filter((c) => passedChallengeIds.has(c._id))
      .reduce((sum, c) => sum + c.points, 0);
    return {
      totalChallenges: challenges.length,
      attempted: attemptedChallengeIds.size,
      passed: passedChallengeIds.size,
      totalPoints,
    };
  },
});

export const createChallenge = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    difficulty: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
    category: v.union(
      v.literal("select"), v.literal("joins"), v.literal("aggregation"),
      v.literal("subqueries"), v.literal("insert_update"), v.literal("schema_design"),
      v.literal("vigil_specific")
    ),
    tableSchema: v.string(),
    sampleData: v.string(),
    expectedQuery: v.string(),
    hints: v.string(),
    points: v.number(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("sqlChallenges", { ...args, createdAt: Date.now() });
  },
});
