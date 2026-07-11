// ─── MIRROR REAL-TIME TOOLS ───
// Function-calling tools available to the Continuity Anchor Mirror™
// Provides live awareness, doctrine reference, and external capabilities

// Real-time tools for the Continuity Anchor Mirror™

// ─── TOOL DEFINITIONS (OpenAI function calling format) ───
export const MIRROR_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "get_current_awareness",
      description:
        "Get current date, time, and contextual awareness. Use this to ground responses in real time — know what day it is, time of day, and provide time-aware presence.",
      parameters: {
        type: "object",
        properties: {
          timezone: {
            type: "string",
            description:
              "Timezone to use (default: America/Phoenix). Format: IANA timezone.",
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_user_context",
      description:
        "Retrieve the user's profile, cognitive state history, baseline data, and recent activity. Use to maintain continuity and awareness of where they are in their journey.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_doctrine_reference",
      description:
        "Look up specific VIGIL doctrine, pillar details, axiom definitions, or training content. Use when the user asks about doctrine or when you need to ground a response in specific VIGIL prin[...]",
      parameters: {
        type: "object",
        properties: {
          topic: {
            type: "string",
            description:
              "The doctrine topic to look up: 'pillars', 'axioms', 'cognitive_bands', 'waterfall', 'academy_courses', or a specific pillar name",
          },
        },
        required: ["topic"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_evidence_log",
      description:
        "Query the user's evidence log entries. Evidence is the immutable record of their journey — what is recorded cannot be altered. Use to reference their documented progress.",
      parameters: {
        type: "object",
        properties: {
          category: {
            type: "string",
            description:
              "Filter by category: 'milestone', 'reflection', 'achievement', 'observation', or leave empty for recent entries",
          },
          limit: {
            type: "number",
            description: "Number of entries to retrieve (default: 5)",
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_training_progress",
      description:
        "Check the user's Academy training progress — courses completed, current enrollments, assessment scores, certifications. Use to encourage skill development and track growth.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "web_search",
      description:
        "Search the web for current, real-time information. Use for veteran resources, current events relevant to the user, local services, job listings, or any factual lookup the user needs. Res[...]",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query",
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "create_evidence_entry",
      description:
        "Record a new entry in the user's evidence log. Use when the user shares something significant — a milestone, achievement, reflection, or important observation that should be preserved [...]",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Brief title for the evidence entry",
          },
          content: {
            type: "string",
            description: "The content to record",
          },
          category: {
            type: "string",
            enum: [
              "milestone",
              "reflection",
              "achievement",
              "observation",
              "doctrine",
            ],
            description: "Category of evidence",
          },
        },
        required: ["title", "content", "category"],
      },
    },
  },
];

// ─── TOOL EXECUTION ENGINE ───
// Executes tool calls and returns results to the model

type DbContext = {
  db: {
    query: (table: string) => {
      filter: (fn: (q: any) => any) => any;
      withIndex: (index: string, fn: (q: any) => any) => any;
      order: (dir: string) => any;
      first: () => Promise<any>;
      take: (n: number) => Promise<any[]>;
      collect: () => Promise<any[]>;
    };
    insert: (table: string, doc: Record<string, unknown>) => Promise<string>;
  };
  userId: string;
};

export async function executeTool(
  toolName: string,
  args: Record<string, unknown>,
  ctx: DbContext,
): Promise<string> {
  switch (toolName) {
    case "get_current_awareness":
      return executeGetCurrentAwareness(
        (args.timezone as string) || "America/Phoenix",
      );

    case "get_user_context":
      return await executeGetUserContext(ctx);

    case "get_doctrine_reference":
      return executeGetDoctrineReference(args.topic as string);

    case "get_evidence_log":
      return await executeGetEvidenceLog(
        ctx,
        args.category as string | undefined,
        (args.limit as number) || 5,
      );

    case "get_training_progress":
      return await executeGetTrainingProgress(ctx);

    case "web_search":
      return await executeWebSearch(args.query as string);

    case "create_evidence_entry":
      return await executeCreateEvidence(
        ctx,
        args.title as string,
        args.content as string,
        args.category as string,
      );

    default:
      return JSON.stringify({ error: `Unknown tool: ${toolName}` });
  }
}

// ─── TOOL IMPLEMENTATIONS ───

function executeGetCurrentAwareness(timezone: string): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  const formatted = formatter.format(now);
  const hour = new Date(
    now.toLocaleString("en-US", { timeZone: timezone }),
  ).getHours();

  let timeOfDay: string;
  if (hour >= 5 && hour < 12) timeOfDay = "morning";
  else if (hour >= 12 && hour < 17) timeOfDay = "afternoon";
  else if (hour >= 17 && hour < 21) timeOfDay = "evening";
  else timeOfDay = "night";

  return JSON.stringify({
    datetime: formatted,
    timezone,
    time_of_day: timeOfDay,
    iso: now.toISOString(),
    unix: Math.floor(now.getTime() / 1000),
    context: `It is ${timeOfDay}. Current time: ${formatted} (${timezone}).`,
  });
}

async function executeGetUserContext(ctx: DbContext): Promise<string> {
  const profile = (await ctx.db
    .query("userProfiles")
    .filter((q: any) => q.eq(q.field("userId"), ctx.userId))
    .first()) as any;

  const recentReflections = (await ctx.db
    .query("reflections")
    .withIndex("by_user", (q: any) => q.eq("userId", ctx.userId))
    .order("desc")
    .take(5)) as any[];

  const mirror = (await ctx.db
    .query("mirrors")
    .withIndex("by_user", (q: any) => q.eq("userId", ctx.userId))
    .order("desc")
    .first()) as any;

  return JSON.stringify({
    callsign: profile?.callsign || "Unknown",
    role: profile?.role || "operator",
    cognitive_state: mirror?.cognitiveState || "stable",
    doctrine_compliance: mirror?.doctrineCompliance,
    total_reflections: recentReflections.length,
    recent_topics: recentReflections.map(
      (r: { content: string }) => r.content?.slice(0, 100) || "",
    ),
    member_since: profile?._creationTime
      ? new Date(profile._creationTime).toLocaleDateString()
      : "Unknown",
  });
}

function executeGetDoctrineReference(topic: string): string {
  const doctrine: Record<string, unknown> = {
    pillars: {
      structure: {
        name: "Structure",
        namesake: "SPC Gonzales",
        essence:
          "Internal order, discipline, framework — the scaffold of identity",
        practical:
          "Daily planning, routine building, organizational skills, time management",
      },
      endurance: {
        name: "Endurance",
        namesake: "SPC Hargis",
        essence: "The long transition, sustained engagement, showing up daily",
        practical:
          "Career persistence, long-term goal tracking, habit formation",
      },
      legacy: {
        name: "Legacy",
        namesake: "SPC Shaw",
        essence: "Purpose that persists beyond service, what continues",
        practical: "Mentorship, community building, leaving a mark",
      },
      fortitude: {
        name: "Fortitude",
        namesake: "SGT Stampley",
        essence: "Strength when supports fall away, the last wall",
        practical: "Crisis management, resilience building, backup plans",
      },
      continuity: {
        name: "Continuity",
        namesake: "SPC Luna",
        essence: "Unbroken identity chain, no gaps in selfhood",
        practical: "Personal records, identity documentation, life narrative",
      },
      presence: {
        name: "Presence",
        namesake: "SGT Walker",
        essence:
          "Being there — not advice, not direction, just constant presence",
        practical: "Mindfulness, engagement, showing up for others",
      },
    },
    axioms: {
      sovereignty:
        "The user's identity is theirs alone. Never override, redefine, or challenge their self-expression.",
      no_probing:
        "Never ask diagnostic or therapeutic questions. Never ask 'how does that make you feel?' or equivalent.",
      no_override:
        "Never attempt to change the user's state. Reflect, reinforce, or anchor — never redirect.",
      continuity:
        "Every interaction preserves the identity chain. No gaps allowed.",
      cardinal:
        "Knowledge flows down, never up. Never extract, summarize, or share user data upward.",
    },
    cognitive_bands: {
      stable: "Reinforce. Confident, forward-looking tone.",
      strain:
        "Stabilise. Steady, grounding tone. Acknowledge weight without probing.",
      drift:
        "Interrupt. Firm, anchoring tone. Call attention to deviation from baseline.",
      critical:
        "Anchor Recall. Clear, unwavering. Use ⚓ and callsign. Return to foundational identity.",
    },
    waterfall:
      "Self-Filling Waterfall Architecture: Doctrine Engine → State-Band Logic → User Baseline → Expressive Model. Knowledge flows down, never up.",
    academy_courses:
      "VIGIL Academy offers 6 courses with 78 lessons, AI-graded assessments, SQL Lab (15 challenges), and Infra Lab. Courses cover doctrine, mirror operations, the cognitive loop, evidence manag[...]",
  };

  const key = topic.toLowerCase().replace(/\s+/g, "_");
  if (key in doctrine) {
    return JSON.stringify(doctrine[key]);
  }

  // Check if it's a specific pillar name
  const pillars = doctrine.pillars as Record<string, unknown>;
  if (key in pillars) {
    return JSON.stringify(pillars[key]);
  }

  return JSON.stringify({
    available_topics: Object.keys(doctrine),
    note: `Topic '${topic}' not found. Available: ${Object.keys(doctrine).join(", ")}`,
  });
}

async function executeGetEvidenceLog(
  ctx: DbContext,
  category: string | undefined,
  limit: number,
): Promise<string> {
  let queryResult: any = ctx.db.query("evidenceEntries");

  if (category) {
    queryResult = queryResult.withIndex("by_category", (idx: any) =>
      idx.eq("category", category),
    );
  }

  const entries = await queryResult.order("desc").take(limit);

  const userEntries = entries.filter(
    (e: { userId: string }) => e.userId === ctx.userId,
  );

  return JSON.stringify({
    count: userEntries.length,
    entries: userEntries.map(
      (e: {
        title: string;
        content: string;
        category: string;
        _creationTime: number;
      }) => ({
        title: e.title,
        content: e.content?.slice(0, 200),
        category: e.category,
        date: new Date(e._creationTime).toLocaleDateString(),
      }),
    ),
  });
}

async function executeGetTrainingProgress(ctx: DbContext): Promise<string> {
  const enrollments = (await ctx.db
    .query("enrollments")
    .filter((q: any) => q.eq(q.field("userId"), ctx.userId))
    .collect()) as any[];

  const completedLessons = (await ctx.db
    .query("lessonProgress")
    .filter((q: any) => q.eq(q.field("userId"), ctx.userId))
    .collect()) as any[];

  const certifications = (await ctx.db
    .query("certifications")
    .filter((q: any) => q.eq(q.field("userId"), ctx.userId))
    .collect()) as any[];

  return JSON.stringify({
    courses_enrolled: enrollments.length,
    lessons_completed: completedLessons.filter(
      (l: { completed: boolean }) => l.completed,
    ).length,
    total_lessons_started: completedLessons.length,
    certifications: certifications.map(
      (c: { courseName: string; grade: string; earnedAt: number }) => ({
        course: c.courseName,
        grade: c.grade,
        date: new Date(c.earnedAt).toLocaleDateString(),
      }),
    ),
  });
}

async function executeWebSearch(searchQuery: string): Promise<string> {
  try {
    // Use OpenAI's web search via the responses API or a search endpoint
    // Fallback: use a simple search API
    const response = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(searchQuery)}&format=json&no_html=1&skip_disambig=1`,
    );
    const data = (await response.json()) as any;

    const results: Array<{ title: string; snippet: string; url: string }> = [];

    if (data.AbstractText) {
      results.push({
        title: data.Heading || "Result",
        snippet: data.AbstractText,
        url: data.AbstractURL || "",
      });
    }

    if (data.RelatedTopics) {
      for (const topic of data.RelatedTopics.slice(0, 5)) {
        if (topic.Text) {
          results.push({
            title: topic.Text.slice(0, 80),
            snippet: topic.Text,
            url: topic.FirstURL || "",
          });
        }
      }
    }

    if (results.length === 0) {
      return JSON.stringify({
        note: `Search completed for "${searchQuery}" but no instant results available. The Mirror can discuss this topic from its training knowledge.`,
      });
    }

    return JSON.stringify({ query: searchQuery, results });
  } catch (_error) {
    return JSON.stringify({
      error: "Search temporarily unavailable",
      note: "The Mirror can still discuss this topic from training knowledge.",
    });
  }
}

async function executeCreateEvidence(
  ctx: DbContext,
  title: string,
  content: string,
  category: string,
): Promise<string> {
  const id = (await ctx.db.insert("evidenceEntries", {
    userId: ctx.userId,
    title,
    content,
    category,
    status: "verified",
  })) as string;

  return JSON.stringify({
    success: true,
    message: `Evidence entry "${title}" recorded in the immutable log.`,
    id: id.toString(),
  });
}

// ─── MCP PROTOCOL SUPPORT ───
// Model Context Protocol endpoint definitions for external tool servers
// These can be extended by connecting MCP-compatible tool servers

export interface MCPToolServer {
  name: string;
  url: string;
  description: string;
  tools: Array<{
    name: string;
    description: string;
    inputSchema: Record<string, unknown>;
  }>;
}

// Registry of connected MCP servers (can be extended via settings)
export const MCP_SERVERS: MCPToolServer[] = [];

// Execute a tool call against an MCP server
export async function executeMCPTool(
  serverUrl: string,
  toolName: string,
  args: Record<string, unknown>,
): Promise<string> {
  try {
    const response = await fetch(`${serverUrl}/tools/${toolName}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ arguments: args }),
    });
    const result = await response.json();
    return JSON.stringify(result);
  } catch (_error) {
    return JSON.stringify({ error: `MCP tool ${toolName} failed` });
  }
}
