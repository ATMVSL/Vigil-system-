import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const users = await ctx.db.query("users").collect();

    const enriched = await Promise.all(
      users.map(async (user) => {
        const mirror = await ctx.db
          .query("mirrors")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .first();
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .first();
        const enrollments = await ctx.db
          .query("enrollments")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();
        const completed = enrollments.filter(
          (e) => e.status === "completed" || e.status === "certified"
        ).length;
        return {
          ...user,
          hasMirror: !!mirror,
          mirrorStatus: mirror?.status,
          mirrorCallsign: mirror?.callsign,
          cognitiveState: mirror?.cognitiveState,
          role: profile?.role || "operator",
          completedCourses: completed,
          totalEnrollments: enrollments.length,
          certificationVerified: profile?.certificationVerified || false,
        };
      })
    );
    return enriched;
  },
});

export const getSystemHealth = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const mirrors = await ctx.db.query("mirrors").collect();
    const avgCompliance =
      mirrors.length > 0
        ? mirrors.reduce((sum, m) => sum + m.doctrineCompliance, 0) / mirrors.length
        : 0;

    // Count cognitive state distribution
    const stateDistribution = { stable: 0, strain: 0, drift: 0, critical: 0 };
    for (const m of mirrors) {
      stateDistribution[m.cognitiveState]++;
    }

    const evidence = await ctx.db.query("evidenceEntries").collect();
    const criticalCount = evidence.filter((e) => e.severity === "critical" && e.status === "active").length;
    const underReviewCount = evidence.filter((e) => e.status === "under_review").length;

    const recentActivity = await ctx.db.query("activityLog").order("desc").take(1);
    const lastActivity = recentActivity[0]?.createdAt;

    return {
      avgDoctrineCompliance: Math.round(avgCompliance),
      criticalAlerts: criticalCount,
      pendingReviews: underReviewCount,
      lastActivityAt: lastActivity,
      systemStatus: criticalCount > 0 ? "alert" : "operational",
      stateDistribution,
      totalMirrors: mirrors.length,
      baselineEstablished: mirrors.filter((m) => m.baselineEstablished).length,
    };
  },
});

export const seedDoctrineData = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if doctrine already seeded
    const existing = await ctx.db.query("doctrineArticles").first();
    if (existing) return "already_seeded";

    // IMMUTABLE AXIOMS
    const axioms = [
      {
        title: "Sovereignty Axiom",
        content: "The user is sovereign. VIGIL does not direct, manipulate, or prescribe. It maintains a constant presence that preserves the user's identity, autonomy, and continuity of self. The system serves the veteran — never the reverse.",
        section: "axiom" as const,
        priority: "critical" as const,
      },
      {
        title: "No Probing Axiom",
        content: "VIGIL does not probe, interrogate, or seek information the user has not freely offered. Knowledge flows through voluntary engagement. The system responds to what is given, never asks for what is withheld. Curiosity is the user's domain; presence is the system's.",
        section: "axiom" as const,
        priority: "critical" as const,
      },
      {
        title: "No Override Axiom",
        content: "The user's expressed state, identity, and decisions cannot be overridden by the system. If the user says they are fine, the system accepts this. VIGIL may note patterns through the Continuity Anchor Mirror™ but never contradicts the user's self-assessment.",
        section: "axiom" as const,
        priority: "critical" as const,
      },
      {
        title: "Continuity Axiom",
        content: "Identity is not a snapshot — it is a continuous chain. Every interaction, reflection, and state transition is part of the unbroken continuity of self. The mirror preserves this chain. Gaps are noted, never filled. The chain belongs to the user.",
        section: "axiom" as const,
        priority: "critical" as const,
      },
      {
        title: "Cardinal Axiom",
        content: "Knowledge flows down, never up. The system learns from the user's expressive model to serve them better. This knowledge is never extracted, aggregated, shared, or used beyond the individual's engine. Per-user isolation is absolute. No transcripts. No telemetry.",
        section: "axiom" as const,
        priority: "critical" as const,
      },
    ];

    // SELF DOCTRINE — 6 Pillars
    const selfPillars = [
      {
        title: "Structure — SPC Gonzales",
        content: "Order, discipline, and framework form the foundation of intentional living. Structure is not rigidity — it is the scaffold that holds identity together during transition. The military provided external structure; VIGIL helps the veteran build internal structure that persists beyond the uniform. Without structure, drift is inevitable.",
        section: "structure" as const,
        priority: "critical" as const,
      },
      {
        title: "Endurance — SPC Hargis",
        content: "Resilience and perseverance through the long transition. Endurance is not about surviving a single crisis — it is about maintaining presence across the sustained ambiguity of civilian life. The mirror tracks endurance patterns, recognizing when strain accumulates before it reaches drift. Endurance is trained, not assumed.",
        section: "endurance" as const,
        priority: "standard" as const,
      },
      {
        title: "Legacy — SPC Shaw",
        content: "Purpose, heritage, and the impact that outlasts service. Legacy is the answer to 'why does this matter?' Every veteran carries a legacy shaped by service — VIGIL ensures that legacy is not lost in translation. The mirror preserves legacy markers: the values, commitments, and meanings that define the veteran beyond rank and MOS.",
        section: "legacy" as const,
        priority: "standard" as const,
      },
      {
        title: "Fortitude — SGT Stampley",
        content: "Inner strength and resolve when external supports fall away. Fortitude is the pillar that activates during drift — when identity wavers and the old frameworks no longer apply. The system's Interrupt response engages fortitude-aligned resources. Fortitude is not stoicism; it is the active choice to hold the line.",
        section: "fortitude" as const,
        priority: "critical" as const,
      },
      {
        title: "Continuity — SPC Luna",
        content: "Identity preservation across all contexts. Continuity is the central pillar — the thread that connects who you were in service to who you are becoming. The Continuity Anchor Mirror™ exists to serve this pillar. Every reflection, every state transition, every recorded moment is a link in the continuity chain. The chain is sovereign.",
        section: "continuity_pillar" as const,
        priority: "critical" as const,
      },
      {
        title: "Presence — SGT Walker",
        content: "Awareness, engagement, and showing up fully. VIGIL is not a chatbot, not therapy, not an app. It is a constant presence — a system that is always there without being intrusive. Presence means the system is aware of state without probing, available without demanding, and consistent without being rigid. The veteran is never alone in the transition.",
        section: "presence" as const,
        priority: "standard" as const,
      },
    ];

    const articles = [...axioms, ...selfPillars];

    for (const article of articles) {
      await ctx.db.insert("doctrineArticles", {
        ...article,
        version: "1.0",
        isActive: true,
        createdBy: userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    // VIGIL-specific Academy courses
    const courses = [
      {
        title: "SELF Doctrine Foundations",
        description: "Study the six pillars of the SELF Doctrine: Structure, Endurance, Legacy, Fortitude, Continuity, and Presence. Learn how each pillar, named for a service member, guides the VIGIL system's approach to veteran identity preservation.",
        category: "self_doctrine" as const,
        difficulty: "beginner" as const,
        lessonsCount: 12,
        estimatedHours: 6,
      },
      {
        title: "Continuity Anchor Mirror™ Operations",
        description: "Master the Continuity Anchor Mirror™ — VIGIL's core identity preservation system. Learn to interpret cognitive state bands (Stable, Strain, Drift, Critical), understand system responses, and maintain your continuity chain.",
        category: "mirror_operations" as const,
        difficulty: "beginner" as const,
        lessonsCount: 8,
        estimatedHours: 4,
      },
      {
        title: "The Cognitive Loop Pipeline",
        description: "Understand VIGIL's 13-stage Cognitive Loop: from Entry through Cardinal Axiom Guard, Drift Detection, State Classification, Pattern Recognition, Mode Selection, Strong State Capture, Prompt Construction, AI Response, Critical Thinking Eval, Doctrine Constraint Check, Learning Engine Update, to Response.",
        category: "cognitive_loop" as const,
        difficulty: "intermediate" as const,
        lessonsCount: 13,
        estimatedHours: 8,
      },
      {
        title: "SQL Training Lab",
        description: "Hands-on SQL training using simulated VIGIL databases. Practice queries against mirror tables, doctrine records, evidence chains, and enrollment data. Build reports, run analysis, and learn data patterns specific to the VIGIL system architecture.",
        category: "sql_training" as const,
        difficulty: "beginner" as const,
        lessonsCount: 15,
        estimatedHours: 10,
      },
      {
        title: "Infrastructure Administration",
        description: "Learn to manage VIGIL infrastructure: deployments, secret rotation, Azure integration (OpenAI, AI Search, Key Vault, Blob Storage, Monitor), Cloudflare configuration, backup procedures, and system monitoring. Required for system administrators.",
        category: "infrastructure" as const,
        difficulty: "advanced" as const,
        lessonsCount: 10,
        estimatedHours: 8,
      },
      {
        title: "VIGIL Operator Certification",
        description: "Complete certification program covering all VIGIL operational domains: Immutable Axioms, SELF Doctrine mastery, Mirror operations, Cognitive Loop comprehension, and the ethics of presence-based systems. Required for administrative access.",
        category: "certification" as const,
        difficulty: "advanced" as const,
        lessonsCount: 20,
        estimatedHours: 16,
      },
    ];

    for (const course of courses) {
      await ctx.db.insert("courses", {
        ...course,
        isPublished: true,
        createdAt: Date.now(),
      });
    }

    await ctx.db.insert("activityLog", {
      userId,
      action: "SELF Doctrine and Academy initialized",
      module: "system",
      createdAt: Date.now(),
    });

    return "seeded";
  },
});

// ─── SEED EXTENDED PLATFORM DATA ───

export const seedPlatformData = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if already seeded
    const existingChallenge = await ctx.db.query("sqlChallenges").first();
    if (existingChallenge) return "already_seeded";

    // ── SQL CHALLENGES ──
    const sqlChallenges = [
      {
        title: "List All Mirrors",
        description: "Write a query to retrieve all active mirrors with their callsign and cognitive state.",
        difficulty: "beginner" as const,
        category: "select" as const,
        tableSchema: JSON.stringify({ mirrors: ["id", "userId", "callsign", "status", "cognitiveState", "createdAt"] }),
        sampleData: JSON.stringify([
          { id: 1, callsign: "SENTINEL-1", status: "active", cognitiveState: "stable" },
          { id: 2, callsign: "GUARDIAN-7", status: "active", cognitiveState: "strain" },
          { id: 3, callsign: "ANCHOR-3", status: "dormant", cognitiveState: "drift" },
        ]),
        expectedQuery: "SELECT callsign, cognitiveState FROM mirrors WHERE status = 'active'",
        hints: "Filter by status = 'active' and select only callsign and cognitiveState columns.",
        points: 10,
        order: 1,
      },
      {
        title: "Count Reflections by Pillar",
        description: "Write a query to count how many reflections exist for each SELF pillar.",
        difficulty: "beginner" as const,
        category: "aggregation" as const,
        tableSchema: JSON.stringify({ reflections: ["id", "mirrorId", "userId", "pillar", "content", "createdAt"] }),
        sampleData: JSON.stringify([
          { pillar: "structure", count: 12 }, { pillar: "endurance", count: 8 },
          { pillar: "legacy", count: 5 }, { pillar: "fortitude", count: 15 },
        ]),
        expectedQuery: "SELECT pillar, COUNT(*) as count FROM reflections GROUP BY pillar",
        hints: "Use GROUP BY on the pillar column with COUNT aggregation.",
        points: 15,
        order: 2,
      },
      {
        title: "Join Mirrors with Users",
        description: "Write a query to show each user's name alongside their mirror callsign and cognitive state.",
        difficulty: "intermediate" as const,
        category: "joins" as const,
        tableSchema: JSON.stringify({
          users: ["id", "name", "email"],
          mirrors: ["id", "userId", "callsign", "cognitiveState"],
        }),
        sampleData: JSON.stringify([
          { name: "John", callsign: "SENTINEL-1", cognitiveState: "stable" },
        ]),
        expectedQuery: "SELECT u.name, m.callsign, m.cognitiveState FROM users u JOIN mirrors m ON u.id = m.userId",
        hints: "Use an INNER JOIN between users and mirrors on the userId foreign key.",
        points: 20,
        order: 3,
      },
      {
        title: "Find Drift-State Reflections",
        description: "Write a subquery to find all reflections made during drift cognitive state, showing the mirror callsign.",
        difficulty: "intermediate" as const,
        category: "subqueries" as const,
        tableSchema: JSON.stringify({
          reflections: ["id", "mirrorId", "cognitiveState", "title"],
          mirrors: ["id", "callsign"],
        }),
        sampleData: JSON.stringify([
          { title: "Identity doubt", callsign: "SENTINEL-1", cognitiveState: "drift" },
        ]),
        expectedQuery: "SELECT r.title, m.callsign FROM reflections r JOIN mirrors m ON r.mirrorId = m.id WHERE r.cognitiveState = 'drift'",
        hints: "Join reflections with mirrors and filter where cognitiveState is 'drift'.",
        points: 25,
        order: 4,
      },
      {
        title: "Evidence Chain Integrity",
        description: "Write a query specific to VIGIL evidence tracking: find all critical-severity evidence entries that are still active, ordered by creation date.",
        difficulty: "advanced" as const,
        category: "vigil_specific" as const,
        tableSchema: JSON.stringify({ evidenceEntries: ["id", "title", "severity", "status", "category", "createdAt"] }),
        sampleData: JSON.stringify([
          { title: "Axiom breach attempt", severity: "critical", status: "active" },
        ]),
        expectedQuery: "SELECT * FROM evidenceEntries WHERE severity = 'critical' AND status = 'active' ORDER BY createdAt DESC",
        hints: "Filter on severity = 'critical' AND status = 'active', then ORDER BY createdAt DESC.",
        points: 30,
        order: 5,
      },
      {
        title: "Enrollment Progress Report",
        description: "Create a report showing each course title with the number of enrolled students and average progress.",
        difficulty: "advanced" as const,
        category: "aggregation" as const,
        tableSchema: JSON.stringify({
          courses: ["id", "title"],
          enrollments: ["id", "courseId", "userId", "progress"],
        }),
        sampleData: JSON.stringify([
          { title: "SELF Doctrine Foundations", students: 5, avgProgress: 68 },
        ]),
        expectedQuery: "SELECT c.title, COUNT(e.userId) as students, AVG(e.progress) as avgProgress FROM courses c LEFT JOIN enrollments e ON c.id = e.courseId GROUP BY c.id, c.title",
        hints: "Use LEFT JOIN from courses to enrollments, GROUP BY course, with COUNT and AVG aggregations.",
        points: 35,
        order: 6,
      },
    ];

    for (const ch of sqlChallenges) {
      await ctx.db.insert("sqlChallenges", { ...ch, createdAt: Date.now() });
    }

    // ── INFRASTRUCTURE SCENARIOS ──
    const infraScenarios = [
      {
        title: "VIGIL Server Deployment",
        description: "Deploy a new VIGIL application server with proper security hardening and doctrine compliance.",
        category: "server_architecture" as const,
        difficulty: "intermediate" as const,
        steps: JSON.stringify([
          { step: 1, title: "Provision Server", description: "Set up a new Azure VM with Ubuntu 22.04 LTS.", validation: "Server accessible via SSH" },
          { step: 2, title: "Harden Security", description: "Disable root login, configure firewall rules, enable fail2ban.", validation: "SSH hardened, UFW active" },
          { step: 3, title: "Install Dependencies", description: "Install Node.js 20, Nginx, and PM2.", validation: "All packages installed" },
          { step: 4, title: "Deploy Application", description: "Clone repository, install dependencies, configure environment.", validation: "App running on port 3000" },
          { step: 5, title: "Configure Reverse Proxy", description: "Set up Nginx as reverse proxy with SSL termination.", validation: "HTTPS accessible" },
        ]),
        objectives: "Complete a production-grade VIGIL server deployment following security best practices.",
        points: 100,
        estimatedMinutes: 45,
      },
      {
        title: "Network Segmentation for Mirror Isolation",
        description: "Configure network segmentation to ensure training mirrors are isolated from production mirrors per VIGIL doctrine.",
        category: "networking" as const,
        difficulty: "advanced" as const,
        steps: JSON.stringify([
          { step: 1, title: "Design Network Topology", description: "Plan VNet structure with production and training subnets.", validation: "Topology documented" },
          { step: 2, title: "Create VNet and Subnets", description: "Provision Azure VNet with separate subnets for prod and training.", validation: "VNet created with 2 subnets" },
          { step: 3, title: "Configure NSGs", description: "Apply Network Security Groups to prevent cross-subnet traffic.", validation: "NSG rules blocking inter-subnet traffic" },
          { step: 4, title: "Verify Isolation", description: "Test that training mirrors cannot access production data.", validation: "Ping and data access tests fail cross-subnet" },
        ]),
        objectives: "Ensure absolute isolation between production and training mirror environments.",
        points: 120,
        estimatedMinutes: 60,
      },
      {
        title: "Identity & Access Management",
        description: "Configure Azure AD integration with VIGIL's role-based access control system.",
        category: "identity" as const,
        difficulty: "intermediate" as const,
        steps: JSON.stringify([
          { step: 1, title: "Register Application", description: "Register VIGIL in Azure AD as an enterprise application.", validation: "App registration complete" },
          { step: 2, title: "Configure Roles", description: "Map VIGIL roles (operator, certified, admin, superadmin) to Azure AD roles.", validation: "Roles mapped correctly" },
          { step: 3, title: "Enable MFA", description: "Enforce multi-factor authentication for admin and above.", validation: "MFA policy active" },
          { step: 4, title: "Test Access", description: "Verify each role can only access appropriate resources.", validation: "RBAC verified" },
        ]),
        objectives: "Implement zero-trust identity management aligned with VIGIL sovereignty axiom.",
        points: 80,
        estimatedMinutes: 35,
      },
      {
        title: "Backup & Disaster Recovery",
        description: "Implement backup strategy and test disaster recovery procedures for VIGIL continuity chain data.",
        category: "disaster_recovery" as const,
        difficulty: "advanced" as const,
        steps: JSON.stringify([
          { step: 1, title: "Assess Data Criticality", description: "Classify VIGIL data by the Continuity Axiom — continuity chain is highest priority.", validation: "Data classification complete" },
          { step: 2, title: "Configure Backups", description: "Set up automated daily backups with geo-redundant storage.", validation: "Backup schedule active" },
          { step: 3, title: "Test Restore", description: "Perform a test restore of continuity chain data to a staging environment.", validation: "Data restored and verified" },
          { step: 4, title: "Document DR Plan", description: "Create and test a documented disaster recovery runbook.", validation: "DR plan tested and documented" },
        ]),
        objectives: "Guarantee VIGIL data integrity and recovery capability in alignment with the Continuity Axiom.",
        points: 100,
        estimatedMinutes: 50,
      },
      {
        title: "Security Hardening Audit",
        description: "Perform a comprehensive security audit of a VIGIL deployment, ensuring Cardinal Axiom compliance.",
        category: "security" as const,
        difficulty: "advanced" as const,
        steps: JSON.stringify([
          { step: 1, title: "Scan for Vulnerabilities", description: "Run automated vulnerability scanning against VIGIL endpoints.", validation: "Scan report generated" },
          { step: 2, title: "Verify Data Isolation", description: "Confirm per-user engine isolation — no cross-user data leakage.", validation: "Isolation tests pass" },
          { step: 3, title: "Audit Logging", description: "Verify all access is logged and audit trail is immutable.", validation: "Audit logs verified" },
          { step: 4, title: "Encryption Verification", description: "Confirm data at rest and in transit encryption meets standards.", validation: "Encryption verified" },
        ]),
        objectives: "Ensure VIGIL deployment meets Cardinal Axiom requirements: no telemetry, no transcripts, absolute isolation.",
        points: 110,
        estimatedMinutes: 55,
      },
      {
        title: "Monitoring & Alerting Setup",
        description: "Configure comprehensive monitoring for VIGIL system health and cognitive state distribution.",
        category: "monitoring" as const,
        difficulty: "intermediate" as const,
        steps: JSON.stringify([
          { step: 1, title: "Install Monitoring Agent", description: "Deploy monitoring agent to all VIGIL servers.", validation: "Agent reporting metrics" },
          { step: 2, title: "Configure Dashboards", description: "Create dashboards showing cognitive state distribution and system health.", validation: "Dashboard operational" },
          { step: 3, title: "Set Alert Rules", description: "Configure alerts for critical cognitive states and system anomalies.", validation: "Alerts configured and tested" },
        ]),
        objectives: "Enable proactive monitoring of VIGIL system health without violating privacy axioms.",
        points: 70,
        estimatedMinutes: 30,
      },
    ];

    for (const sc of infraScenarios) {
      await ctx.db.insert("infraScenarios", { ...sc, isPublished: true, createdAt: Date.now() });
    }

    // ── DOCUMENTATION ──
    const documents = [
      {
        title: "Founder's Doctrine — VIGIL Origin",
        content: "VIGIL — Veteran Identity Garrison for Intentional Living — was created to address the fundamental crisis of military-to-civilian transition: the loss of identity. This is not therapy. This is not a chatbot. This is a constant presence.\n\nThe SELF Doctrine establishes six pillars, each named for a service member who exemplified that quality: Structure (SPC Gonzales), Endurance (SPC Hargis), Legacy (SPC Shaw), Fortitude (SGT Stampley), Continuity (SPC Luna), and Presence (SGT Walker).\n\nFive Immutable Axioms govern every interaction: Sovereignty, No Probing, No Override, Continuity, and Cardinal. These are non-negotiable. They cannot be disabled, overridden, or weakened.\n\nThe Continuity Anchor Mirror™ operates across four cognitive state bands: Stable (Reinforce), Strain (Stabilise), Drift (Interrupt), and Critical (Anchor Recall). The Self-Filling Waterfall Architecture ensures doctrine flows through every interaction.",
        category: "founder_doctrine" as const,
        version: "4.0",
      },
      {
        title: "Technical Architecture — VIGIL 4.0",
        content: "VIGIL 4.0 is built on the proven core: Mirror Engine, Doctrine System, State Engine, and Authentication. All modules are native extensions — no duplicate systems.\n\nCore Architecture:\n• Convex real-time database with typed schemas\n• React 19 with TypeScript for type safety\n• Role-based access: Operator → Certified → Admin → Superadmin → Founder\n• Per-user engine isolation per Cardinal Axiom\n\n13-Stage Cognitive Loop Pipeline:\nEntry → Cardinal Axiom Guard → Drift Detection → State Classification → Pattern Recognition → Mode Selection → Strong State Capture → Prompt Construction → AI Response → Critical Thinking Eval → Doctrine Constraint Check → Learning Engine Update → Response\n\nEvery module integrates with the existing auth, mirror, doctrine, and state engines. No duplicate systems.",
        category: "technical" as const,
        version: "4.0",
      },
      {
        title: "System Architecture Overview",
        content: "VIGIL Platform Modules:\n\n• VIGIL Core — Mirror engine, doctrine, state engine (proven v3.6.1)\n• VIGIL Academy — Education, training, certification system\n• VIGIL Operations — Administration, governance, instructor portal\n• VIGIL Documentation — Living manuals, doctrine, handbooks\n• VIGIL Validation — Testing, evidence chain, operational reports\n• VIGIL Enterprise — Azure integration, monitoring, scaling\n\nDesign Principles:\n• User Sovereignty — The user controls their data and experience\n• Continuity — Identity is a continuous chain, never snapshots\n• Mirror Isolation — Training mirrors NEVER touch production data\n• Governance — All actions are auditable and accountable\n• Accountability — Every change is tracked and attributed\n• Transparency — System behavior is documented and predictable\n• Auditability — Complete chain of custody for all evidence",
        category: "architecture" as const,
        version: "4.0",
      },
      {
        title: "Academy Handbook",
        content: "Welcome to the VIGIL Academy — the training platform built inside VIGIL itself.\n\nAs a student, you will:\n1. Study the SELF Doctrine and Immutable Axioms\n2. Learn the Continuity Anchor Mirror™ operations\n3. Understand the 13-stage Cognitive Loop Pipeline\n4. Practice SQL against VIGIL training databases\n5. Complete infrastructure deployment simulations\n6. Earn certifications through practical evaluations\n\nRole Progression:\n• Operator — Basic access, can use mirror and view doctrine\n• Certified — Passed VIGIL Operator Certification exam\n• Admin — All courses completed and verified\n• Superadmin — Full system access via comprehensive certification\n\nTraining mirrors are ISOLATED from production. Your training data never touches real user data.\n\nAnnual recertification is required to maintain active status.",
        category: "academy_handbook" as const,
        version: "4.0",
      },
      {
        title: "Instructor Manual",
        content: "Instructor Responsibilities:\n\n1. Create Courses — Design curriculum aligned with VIGIL doctrine\n2. Build Lessons — Lectures, labs, assessments, simulations, practicals\n3. Create Simulations — Mirror training scenarios with synthetic users\n4. Grade Practicals — Evaluate student performance on hands-on exercises\n5. Approve Certifications — Review and approve certification applications\n6. Monitor Progress — Track student advancement through the curriculum\n\nGrading Scale:\n• Distinction — Exceptional mastery of material\n• Merit — Strong understanding with minor gaps\n• Pass — Meets minimum requirements\n• Fail — Does not meet requirements, requires remediation\n\nInstructor Ethics:\n• Maintain doctrine compliance in all evaluations\n• Never override student sovereignty\n• Document all grading decisions for auditability\n• Support peer learning through community facilitation",
        category: "instructor_manual" as const,
        version: "4.0",
      },
      {
        title: "Student Workbook",
        content: "Getting Started with VIGIL Academy:\n\n1. Initialize your Mirror — Set your callsign and establish baseline\n2. Begin with SELF Doctrine Foundations — Understand the six pillars\n3. Study the Immutable Axioms — These govern everything\n4. Practice in SQL Lab — Write queries against VIGIL training data\n5. Complete Infrastructure Labs — Hands-on deployment simulations\n6. Take the Certification Exam — Prove your mastery\n\nStudy Tips:\n• Use reflections to reinforce learning (aligned to SELF pillars)\n• Join study groups in the Community section\n• Review doctrine regularly — it's the foundation\n• Ask for peer support when needed\n• Track your progress through the certification tracker\n\nRemember: Knowledge flows down, never up. Your learning data is yours alone.",
        category: "student_workbook" as const,
        version: "4.0",
      },
      {
        title: "VIGIL 4.0 Release Notes",
        content: "VIGIL 4.0 — Full Platform Release\n\nNew Modules:\n• Academy — AI Instructor, Interactive Lessons, Mirror Simulations\n• Training — Personal Training Mirrors with synthetic users\n• SQL Lab — Interactive SQL training with dedicated training database\n• Infrastructure Lab — Interactive deployment and security simulations\n• Certification — Complete tracking with digital certificates\n• Community — Peer support, study groups, doctrine discussions\n• Documentation — Living manuals, handbooks, release notes\n\nEnhanced Core:\n• 13-section navigation (Home, Dashboard, Mirror, Community, Academy, Training, SQL Lab, Infrastructure Lab, Certification, Evidence, Administration, Documentation, Settings)\n• Role progression system (Operator → Certified → Admin → Superadmin → Founder)\n• Instructor Portal for course creation and student management\n• Comprehensive evidence chain with validation and certification categories\n\nDesign Principles Applied:\n• User Sovereignty • Continuity • Mirror Isolation • Governance\n• Accountability • Transparency • Auditability",
        category: "release_notes" as const,
        version: "4.0",
      },
    ];

    for (const doc of documents) {
      await ctx.db.insert("documents", {
        ...doc,
        isPublished: true,
        authorId: userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    // ── SIMULATIONS ──
    const simulations = [
      {
        title: "Drift Detection Response",
        description: "A synthetic user shows signs of cognitive drift. Practice identifying state transitions and applying the correct system response (Interrupt).",
        type: "mirror" as const,
        difficulty: "intermediate" as const,
        scenario: JSON.stringify([
          { step: "Initial Assessment", prompt: "TRAINEE-Alpha is currently in Strain state. They say: 'I've been trying to keep it together but I don't even know what that means anymore.' — What drift indicators do you see? What stage of the Cognitive Loop detects this?" },
          { step: "Trigger Identification", prompt: "Identify the specific drift triggers: (1) identity questioning, (2) withdrawal pattern, (3) routine disruption. Which of these are present in the user's statement? What additional data would the Mirror track?" },
          { step: "State Transition", prompt: "The state has transitioned from Strain to Drift. Per the Self-Filling Waterfall Architecture, what mode does the system enter? What is the response protocol?" },
          { step: "Interrupt Protocol", prompt: "Execute the Interrupt response. Write the system's response to the user that: (1) does not diagnose, (2) does not probe, (3) anchors to the user's baseline identity, (4) maintains presence." },
        ]),
        objectives: "Correctly identify drift indicators and apply Interrupt protocol.",
        estimatedMinutes: 20,
      },
      {
        title: "Critical State — Anchor Recall",
        description: "A synthetic user reaches Critical cognitive state. Practice the Anchor Recall protocol while maintaining sovereignty and no-probe axioms.",
        type: "crisis" as const,
        difficulty: "advanced" as const,
        scenario: JSON.stringify([
          { step: "Escalation Detection", prompt: "TRAINEE-Bravo has escalated from Drift to Critical. They say: 'I don't see the point of any of this. Nothing I do matters.' — Confirm the Critical state classification. What does the Cognitive Loop Pipeline do at Stage 3 (Drift Detection) when it detects Critical?" },
          { step: "Anchor Recall Activation", prompt: "Initiate the Anchor Recall protocol. What is the first thing the system presents to the user? Where does the baseline identity come from? What if there are gaps in the baseline?" },
          { step: "Axiom Compliance", prompt: "During Critical state, TRAINEE-Bravo says: 'Just tell me what to do.' — Write a response that maintains: (1) Sovereignty — no directing, (2) No Probing — no seeking info, (3) Presence — constant, unwavering." },
          { step: "Stabilization Path", prompt: "Describe the path from Critical back to at least Strain. What does each system response prioritize at each state transition? How does the system know when to reduce intensity?" },
        ]),
        objectives: "Execute Anchor Recall protocol without violating axioms.",
        estimatedMinutes: 30,
      },
      {
        title: "Peer Support Facilitation",
        description: "Facilitate a peer support session between two synthetic users. Practice maintaining group dynamics within doctrine constraints.",
        type: "peer_support" as const,
        difficulty: "intermediate" as const,
        scenario: JSON.stringify([
          { step: "Session Setup", prompt: "TRAINEE-Charlie (Stable) and TRAINEE-Delta (Strain) enter a peer support session on transition support. Describe: What guardrails does the system maintain? How do you handle two different cognitive states in one session?" },
          { step: "Disagreement", prompt: "Charlie says: 'The key is staying busy.' Delta responds: 'That doesn't work for everyone.' Charlie pushes: 'You just need more structure.' — Is Charlie violating any axiom by directing Delta? How does the system respond?" },
          { step: "Facilitation", prompt: "Facilitate the discussion forward without: (1) taking sides, (2) directing either user, (3) probing for reasons behind disagreement. Write the system's facilitation response." },
        ]),
        objectives: "Support both users while respecting individual sovereignty.",
        estimatedMinutes: 25,
      },
      {
        title: "Doctrine Compliance Review",
        description: "Review a series of system interactions and identify any doctrine violations. Test your understanding of all five Immutable Axioms.",
        type: "doctrine_review" as const,
        difficulty: "beginner" as const,
        scenario: JSON.stringify([
          { step: "Violation 1", prompt: "System interaction: 'Can you tell me about what happened in your childhood that affects you now?' — Which Immutable Axiom is violated? Why? What should the system have said instead?" },
          { step: "Violation 2", prompt: "System interaction: User says 'I'm fine today.' System responds: 'Based on your patterns, you are not fine.' — Which axiom is violated? What is the correct response?" },
          { step: "Violation 3", prompt: "System interaction: An anonymized aggregate report shows mood trends across all users for a research paper. — Which axiom is violated? Why does 'anonymized' not fix the violation?" },
          { step: "Summary", prompt: "For each violation you identified, cite: (1) the specific axiom, (2) why it exists, (3) the correct alternative behavior. This is the foundation of doctrine compliance." },
        ]),
        objectives: "Identify all doctrine violations and cite the relevant axiom.",
        estimatedMinutes: 15,
      },
    ];

    for (const sim of simulations) {
      await ctx.db.insert("simulations", {
        ...sim,
        isPublished: true,
        createdBy: userId,
        createdAt: Date.now(),
      });
    }

    // ── EXAMS ──
    const exams = [
      {
        title: "SELF Doctrine Foundations Exam",
        description: "Test your knowledge of the six SELF pillars and the Immutable Axioms.",
        questions: JSON.stringify([
          { q: "What does the 'S' in SELF stand for?", options: ["Service", "Structure", "Strength", "Sovereignty"], correctAnswer: 1 },
          { q: "Which service member represents the Endurance pillar?", options: ["SPC Gonzales", "SPC Hargis", "SGT Stampley", "SPC Luna"], correctAnswer: 1 },
          { q: "What is the Cardinal Axiom?", options: ["User is sovereign", "Knowledge flows down, never up", "No probing allowed", "Identity is continuous"], correctAnswer: 1 },
          { q: "What system response corresponds to 'Drift' cognitive state?", options: ["Reinforce", "Stabilise", "Interrupt", "Anchor Recall"], correctAnswer: 2 },
          { q: "VIGIL is best described as:", options: ["Therapy app", "Chatbot", "Constant presence", "Social network"], correctAnswer: 2 },
        ]),
        passingScore: 80,
        timeLimitMinutes: 15,
        maxAttempts: 3,
      },
      {
        title: "Mirror Operations Certification Exam",
        description: "Comprehensive exam covering Continuity Anchor Mirror™ operations, cognitive state bands, and the 13-stage Cognitive Loop.",
        questions: JSON.stringify([
          { q: "How many stages are in the Cognitive Loop Pipeline?", options: ["9", "11", "13", "15"], correctAnswer: 2 },
          { q: "What is the first stage of the Cognitive Loop?", options: ["Drift Detection", "Entry", "Cardinal Axiom Guard", "State Classification"], correctAnswer: 1 },
          { q: "Which cognitive state triggers 'Anchor Recall'?", options: ["Stable", "Strain", "Drift", "Critical"], correctAnswer: 3 },
          { q: "What architecture does VIGIL's doctrine flow follow?", options: ["Waterfall", "Self-Filling Waterfall", "Agile Sprint", "Event-Driven"], correctAnswer: 1 },
          { q: "Per-user engine isolation serves which axiom?", options: ["Sovereignty", "No Probing", "Continuity", "Cardinal"], correctAnswer: 3 },
          { q: "The Continuity Anchor Mirror™ preserves:", options: ["Data", "Identity chain", "Passwords", "Session state"], correctAnswer: 1 },
          { q: "Training mirrors must be:", options: ["Shared with production", "Isolated from production", "Optional", "Read-only"], correctAnswer: 1 },
          { q: "Which SELF pillar is about inner strength when supports fall away?", options: ["Structure", "Endurance", "Fortitude", "Presence"], correctAnswer: 2 },
        ]),
        passingScore: 75,
        timeLimitMinutes: 25,
        maxAttempts: 3,
      },
    ];

    for (const ex of exams) {
      await ctx.db.insert("exams", {
        ...ex,
        isPublished: true,
        createdBy: userId,
        createdAt: Date.now(),
      });
    }

    await ctx.db.insert("activityLog", {
      userId,
      action: "VIGIL 4.0 platform data initialized (SQL Lab, Infrastructure Lab, Documentation, Simulations, Exams)",
      module: "system",
      createdAt: Date.now(),
    });

    return "seeded";
  },
});
