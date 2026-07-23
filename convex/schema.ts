import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,

  // ─── USER PROFILES ─── Role progression & access control
  userProfiles: defineTable({
    userId: v.id("users"),
    role: v.union(
      v.literal("operator"),
      v.literal("certified"),
      v.literal("admin"),
      v.literal("superadmin"),
      v.literal("founder"),
    ),
    approvalStatus: v.optional(
      v.union(v.literal("pending"), v.literal("approved"), v.literal("denied")),
    ),
    completedCourses: v.number(),
    totalCertifications: v.number(),
    certificationVerified: v.boolean(),
    isInstructor: v.optional(v.boolean()),
    voiceGender: v.optional(v.union(v.literal("male"), v.literal("female"))),
    autoVoice: v.optional(v.boolean()),
    openaiApiKey: v.optional(v.string()),
    colorScheme: v.optional(v.string()),
    promotedAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // ─── CONTINUITY ANCHOR MIRROR™ ─── Sovereign presence profiles (production)
  mirrors: defineTable({
    userId: v.id("users"),
    callsign: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("dormant"),
      v.literal("suspended"),
    ),
    cognitiveState: v.union(
      v.literal("stable"),
      v.literal("strain"),
      v.literal("drift"),
      v.literal("critical"),
    ),
    classification: v.union(
      v.literal("standard"),
      v.literal("elevated"),
      v.literal("restricted"),
    ),
    lastReflection: v.optional(v.number()),
    totalReflections: v.number(),
    doctrineCompliance: v.number(),
    baselineEstablished: v.boolean(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // ─── REFLECTIONS ─── Continuity chain entries
  reflections: defineTable({
    mirrorId: v.id("mirrors"),
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
    pillar: v.union(
      v.literal("structure"),
      v.literal("endurance"),
      v.literal("legacy"),
      v.literal("fortitude"),
      v.literal("continuity"),
      v.literal("presence"),
    ),
    cognitiveState: v.optional(
      v.union(
        v.literal("stable"),
        v.literal("strain"),
        v.literal("drift"),
        v.literal("critical"),
      ),
    ),
    createdAt: v.number(),
  })
    .index("by_mirror", ["mirrorId"])
    .index("by_user", ["userId"]),

  // ─── DOCTRINE ARTICLES ─── SELF governing principles
  doctrineArticles: defineTable({
    title: v.string(),
    content: v.string(),
    section: v.union(
      v.literal("axiom"),
      v.literal("structure"),
      v.literal("endurance"),
      v.literal("legacy"),
      v.literal("fortitude"),
      v.literal("continuity_pillar"),
      v.literal("presence"),
    ),
    priority: v.union(
      v.literal("critical"),
      v.literal("standard"),
      v.literal("advisory"),
    ),
    version: v.string(),
    isActive: v.boolean(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_section", ["section"]),

  // ─── EVIDENCE ─── Immutable chain of custody
  evidenceEntries: defineTable({
    title: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("identity"),
      v.literal("continuity"),
      v.literal("doctrine"),
      v.literal("operational"),
      v.literal("behavioral"),
      v.literal("validation"),
      v.literal("certification"),
    ),
    status: v.union(
      v.literal("active"),
      v.literal("archived"),
      v.literal("under_review"),
      v.literal("validated"),
    ),
    severity: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical"),
    ),
    source: v.string(),
    linkedMirrorId: v.optional(v.id("mirrors")),
    metadata: v.optional(v.string()),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_status", ["status"])
    .index("by_severity", ["severity"]),

  // ─── COURSES ─── Academy course catalog
  // ─── COURSES ─── Academy course catalog
  courses: defineTable({
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
      v.literal("git_vc"),
      v.literal("node_backend"),
      v.literal("devops"),
      v.literal("python"),
      v.literal("fullstack"),
    ),
    division: v.optional(
      v.union(
        v.literal("doctrine"),
        v.literal("technical"),
        v.literal("professional"),
        v.literal("lab"),
      ),
    ),
    difficulty: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced"),
    ),
    lessonsCount: v.number(),
    estimatedHours: v.number(),
    isPublished: v.boolean(),
    createdBy: v.optional(v.id("users")),
    createdAt: v.number(),
  }).index("by_category", ["category"]),

  // ─── LESSONS ─── Individual lessons within courses
  lessons: defineTable({
    courseId: v.id("courses"),
    title: v.string(),
    content: v.string(),
    contentJson: v.optional(v.string()), // Flexible Rise 360 blocks (intro, process, tabs, flashcards, scenarios, code)
    moduleIndex: v.optional(v.number()), // Module 1-5 structure
    type: v.union(
      v.literal("lecture"),
      v.literal("lab"),
      v.literal("assessment"),
      v.literal("simulation"),
      v.literal("practical"),
    ),
    order: v.number(),
    durationMinutes: v.number(),
    isPublished: v.boolean(),
    createdAt: v.number(),
  }).index("by_course", ["courseId"]),

  // ─── ENROLLMENTS ─── Student course progress
  enrollments: defineTable({
    userId: v.id("users"),
    courseId: v.id("courses"),
    progress: v.number(),
    status: v.union(
      v.literal("enrolled"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("certified"),
    ),
    currentLessonOrder: v.optional(v.number()),
    enrolledAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_course", ["courseId"]),

  // ─── COHORTS ─── Group tracking for Veterans, Reentry, Operators & Partners
  cohorts: defineTable({
    name: v.string(),
    type: v.union(
      v.literal("veterans"),
      v.literal("reentry"),
      v.literal("operators"),
      v.literal("agency_partners"),
    ),
    instructorId: v.optional(v.id("users")),
    description: v.optional(v.string()),
    startDate: v.number(),
    endDate: v.number(),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("archived"),
    ),
    createdAt: v.number(),
  }).index("by_type", ["type"]),

  cohortMemberships: defineTable({
    cohortId: v.id("cohorts"),
    userId: v.id("users"),
    role: v.union(
      v.literal("student"),
      v.literal("lead"),
      v.literal("auditor"),
    ),
    joinedAt: v.number(),
  })
    .index("by_cohort", ["cohortId"])
    .index("by_user", ["userId"]),

  // ─── TRAINING MIRRORS ─── Isolated training mirrors (NOT production)
  trainingMirrors: defineTable({
    userId: v.id("users"),
    callsign: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("paused"),
      v.literal("completed"),
    ),
    cognitiveState: v.union(
      v.literal("stable"),
      v.literal("strain"),
      v.literal("drift"),
      v.literal("critical"),
    ),
    scenarioId: v.optional(v.id("simulations")),
    syntheticUserCount: v.number(),
    totalInteractions: v.number(),
    score: v.number(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // ─── MIRROR LAB LOGS ─── Scored drift & recovery simulation runs
  mirrorLabLogs: defineTable({
    userId: v.id("users"),
    scenarioTitle: v.string(),
    cognitiveState: v.union(
      v.literal("stable"),
      v.literal("strain"),
      v.literal("drift"),
      v.literal("critical"),
    ),
    driftDetected: v.boolean(),
    anchorRecallTriggered: v.boolean(),
    score: v.number(),
    passed: v.boolean(),
    detailsJson: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // ─── SIMULATIONS ─── Training scenarios and mirror simulations
  simulations: defineTable({
    title: v.string(),
    description: v.string(),
    type: v.union(
      v.literal("mirror"),
      v.literal("sql"),
      v.literal("infrastructure"),
      v.literal("peer_support"),
      v.literal("crisis"),
      v.literal("doctrine_review"),
    ),
    difficulty: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced"),
    ),
    scenario: v.string(), // JSON scenario data
    objectives: v.string(),
    estimatedMinutes: v.number(),
    isPublished: v.boolean(),
    createdBy: v.optional(v.id("users")),
    createdAt: v.number(),
  }).index("by_type", ["type"]),

  // ─── SQL CHALLENGES ─── Interactive SQL training
  sqlChallenges: defineTable({
    title: v.string(),
    description: v.string(),
    difficulty: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced"),
    ),
    category: v.union(
      v.literal("select"),
      v.literal("joins"),
      v.literal("aggregation"),
      v.literal("subqueries"),
      v.literal("insert_update"),
      v.literal("schema_design"),
      v.literal("vigil_specific"),
    ),
    tableSchema: v.string(), // JSON: table definitions for this challenge
    sampleData: v.string(), // JSON: sample rows
    expectedQuery: v.string(),
    hints: v.string(),
    points: v.number(),
    order: v.number(),
    createdAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_difficulty", ["difficulty"]),

  // ─── SQL SUBMISSIONS ─── Student SQL query attempts
  sqlSubmissions: defineTable({
    userId: v.id("users"),
    challengeId: v.id("sqlChallenges"),
    query: v.string(),
    passed: v.boolean(),
    feedback: v.string(),
    executionTime: v.optional(v.number()),
    submittedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_challenge", ["challengeId"]),

  // ─── INFRASTRUCTURE SCENARIOS ─── Interactive infra training
  infraScenarios: defineTable({
    title: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("server_architecture"),
      v.literal("networking"),
      v.literal("security"),
      v.literal("identity"),
      v.literal("deployment"),
      v.literal("backup"),
      v.literal("monitoring"),
      v.literal("disaster_recovery"),
    ),
    difficulty: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced"),
    ),
    steps: v.string(), // JSON: ordered steps with validation
    objectives: v.string(),
    points: v.number(),
    estimatedMinutes: v.number(),
    isPublished: v.boolean(),
    createdAt: v.number(),
  }).index("by_category", ["category"]),

  // ─── INFRASTRUCTURE ATTEMPTS ─── Student infra scenario progress
  infraAttempts: defineTable({
    userId: v.id("users"),
    scenarioId: v.id("infraScenarios"),
    status: v.union(
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("failed"),
    ),
    currentStep: v.number(),
    totalSteps: v.number(),
    score: v.number(),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_scenario", ["scenarioId"]),

  // ─── EXAMS ─── Course assessments
  exams: defineTable({
    courseId: v.optional(v.id("courses")),
    certificationType: v.optional(v.string()),
    title: v.string(),
    description: v.string(),
    questions: v.string(), // JSON: array of questions with options
    passingScore: v.number(),
    timeLimitMinutes: v.number(),
    maxAttempts: v.number(),
    isPublished: v.boolean(),
    createdBy: v.optional(v.id("users")),
    createdAt: v.number(),
  }).index("by_course", ["courseId"]),

  // ─── EXAM QUESTIONS BANK ─── Detailed question bank with sectioning
  examQuestions: defineTable({
    examId: v.id("exams"),
    section: v.optional(v.string()), // e.g., "Section 1: Doctrine", "Section 2: Mirror Operations"
    questionText: v.string(),
    optionsJson: v.string(), // JSON array of options
    correctOptionKey: v.string(),
    explanation: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_exam", ["examId"]),

  // ─── EXAM ATTEMPTS ─── Student exam submissions
  examAttempts: defineTable({
    userId: v.id("users"),
    examId: v.id("exams"),
    answers: v.string(), // JSON: student answers
    score: v.number(),
    passed: v.boolean(),
    startedAt: v.number(),
    completedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_exam", ["examId"]),

  // ─── CERTIFICATIONS ─── Digital certificates across 9 tracks
  certifications: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("backend_developer"),
      v.literal("fullstack_developer"),
      v.literal("devsecops_practitioner"),
      v.literal("infrastructure_engineer"),
      v.literal("sql_analyst"),
      v.literal("python_technician"),
      v.literal("ai_operations_specialist"),
      v.literal("peer_support_specialist"),
      v.literal("continuity_operator"),
      v.literal("sql"),
      v.literal("infrastructure"),
      v.literal("mirror_operator"),
      v.literal("peer_support"),
      v.literal("vigil_operator"),
      v.literal("vigil_instructor"),
    ),
    courseId: v.optional(v.id("courses")),
    certificateNumber: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("expired"),
      v.literal("revoked"),
    ),
    issuedAt: v.number(),
    expiresAt: v.number(),
    issuedBy: v.optional(v.id("users")),
  })
    .index("by_user", ["userId"])
    .index("by_type", ["type"]),

  // ─── INSTRUCTOR REVIEWS ─── Instructor grading and feedback
  instructorReviews: defineTable({
    instructorId: v.id("users"),
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
    createdAt: v.number(),
  })
    .index("by_student", ["studentId"])
    .index("by_instructor", ["instructorId"]),

  // ─── COMMUNITY ─── Peer support and discussion
  communityPosts: defineTable({
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
    category: v.union(
      v.literal("general"),
      v.literal("peer_support"),
      v.literal("study_group"),
      v.literal("doctrine_discussion"),
      v.literal("technical_help"),
      v.literal("announcements"),
    ),
    replyCount: v.number(),
    isPinned: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_user", ["userId"]),

  communityReplies: defineTable({
    postId: v.id("communityPosts"),
    userId: v.id("users"),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_post", ["postId"]),

  // ─── DOCUMENTATION ─── Living manuals and doctrine
  documents: defineTable({
    title: v.string(),
    content: v.string(),
    category: v.union(
      v.literal("founder_doctrine"),
      v.literal("technical"),
      v.literal("architecture"),
      v.literal("validation_reports"),
      v.literal("academy_handbook"),
      v.literal("instructor_manual"),
      v.literal("student_workbook"),
      v.literal("release_notes"),
    ),
    version: v.string(),
    isPublished: v.boolean(),
    authorId: v.optional(v.id("users")),
    // File attachment fields
    fileId: v.optional(v.id("_storage")),
    fileName: v.optional(v.string()),
    fileType: v.optional(v.string()),
    fileSize: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_category", ["category"]),

  // ─── CORE TWINS ─── Verification & balance layer
  twinVerifications: defineTable({
    mirrorId: v.id("mirrors"),
    userId: v.id("users"),
    twin: v.union(v.literal("alpha"), v.literal("beta")),
    direction: v.union(v.literal("downward"), v.literal("upward")),
    passed: v.boolean(),
    complianceScore: v.number(),
    violationCount: v.number(),
    violations: v.string(), // JSON-encoded violation details
    createdAt: v.number(),
  })
    .index("by_mirror", ["mirrorId"])
    .index("by_user", ["userId"])
    .index("by_twin", ["twin"]),

  // ─── ACTIVITY LOG ─── System-wide audit trail
  activityLog: defineTable({
    userId: v.id("users"),
    action: v.string(),
    module: v.union(
      v.literal("mirror"),
      v.literal("doctrine"),
      v.literal("evidence"),
      v.literal("academy"),
      v.literal("admin"),
      v.literal("system"),
      v.literal("training"),
      v.literal("sql_lab"),
      v.literal("infra_lab"),
      v.literal("certification"),
      v.literal("community"),
      v.literal("documentation"),
      v.literal("learning_engine"),
    ),
    details: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_module", ["module"])
    .index("by_user", ["userId"]),

  // ─── LEARNING ENGINE PIPELINE (capture → scramble → verify → apply) ───
  learningPipeline: defineTable({
    userId: v.id("users"),
    mirrorId: v.id("mirrors"),
    stage: v.union(
      v.literal("capture"),
      v.literal("scramble"),
      v.literal("verify"),
      v.literal("apply"),
    ),
    baselineEstablished: v.boolean(),
    reflectionCount: v.number(),
    driftScore: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("verified"),
      v.literal("applied"),
      v.literal("rejected"),
    ),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_mirror", ["mirrorId"])
    .index("by_stage", ["stage"]),

  // ─── SCRAMBLED INTEL ─── Anonymized, non-identifying pattern metrics
  scrambledIntel: defineTable({
    patternHash: v.string(),
    cognitiveState: v.string(),
    scrambledMetrics: v.string(), // JSON string of anonymized pattern metrics
    isVerified: v.boolean(),
    verifiedBy: v.optional(v.id("users")),
    createdAt: v.number(),
  })
    .index("by_hash", ["patternHash"])
    .index("by_verified", ["isVerified"]),
});

export default schema;
