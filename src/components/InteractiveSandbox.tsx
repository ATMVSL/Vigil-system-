import {
  Code2,
  Download,
  Play,
  RefreshCcw,
  Save,
  Server,
  Sparkles,
  Terminal,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type SandboxTemplate = "react" | "node" | "sql" | "python" | "doctrine";

interface InteractiveSandboxProps {
  initialTemplate?: SandboxTemplate;
  projectName?: string;
}

const STARTER_TEMPLATES: Record<
  SandboxTemplate,
  { name: string; language: string; code: string; description: string }
> = {
  react: {
    name: "React & Modern Frontend Sandbox",
    language: "typescript",
    description:
      "Build, test, and render dynamic React components with live preview.",
    code: `import React, { useState } from 'react';

export default function OperatorWidget() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', background: '#0f172a', color: '#f8fafc', borderRadius: '8px' }}>
      <h2>🛡️ VIGIL Component Sandbox</h2>
      <p>Interactive Operator Component</p>
      <button 
        onClick={() => setCount(c => c + 1)}
        style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        Interactions: {count}
      </button>
    </div>
  );
}`,
  },
  node: {
    name: "Node.js & Express API Sandbox",
    language: "javascript",
    description:
      "Design and test REST API endpoints, JWT auth middleware, and JSON routes.",
    code: `import express from 'express';

const app = express();
app.use(express.json());

// VIGIL REST API Route Test
app.get('/api/operator/status', (req, res) => {
  res.json({
    status: 'active',
    callsign: 'DragonLeaderA1',
    doctrineCompliance: 100,
    timestamp: Date.now()
  });
});

console.log('Express API Mock Server initialized on port 3000');`,
  },
  sql: {
    name: "SQL Analytics Sandbox",
    language: "sql",
    description:
      "Run complex SQL queries, JOINs, and aggregates against sample VIGIL schemas.",
    code: `-- VIGIL Academy SQL Challenge Sandbox
SELECT 
  u.name AS operator_name,
  c.title AS course_title,
  e.progress,
  e.status
FROM enrollments e
JOIN users u ON e.user_id = u.id
JOIN courses c ON e.course_id = c.id
WHERE e.progress >= 80
ORDER BY e.progress DESC;`,
  },
  python: {
    name: "Python Automation Sandbox",
    language: "python",
    description:
      "Write Python scripts for data processing, analysis, and automation.",
    code: `# VIGIL Data & AI Script Sandbox
def calculate_operator_score(completed_courses, cert_count, mirror_compliance):
    base_score = (completed_courses * 15) + (cert_count * 25)
    final_score = base_score * (mirror_compliance / 100.0)
    return round(final_score, 2)

score = calculate_operator_score(completed_courses=4, cert_count=2, mirror_compliance=98)
print(f"Calculated Operator Readiness Index: {score}")`,
  },
  doctrine: {
    name: "SELF Doctrine & Mirror Prompt Sandbox",
    language: "json",
    description:
      "Test state band transitions, cardinal axioms, and system prompt constraints.",
    code: `{
  "callsign": "OperatorAlpha",
  "cognitiveState": "strain",
  "doctrineRule": "Axiom 1: Sovereignty — Identity is inviolable",
  "promptInput": "I feel lost after removing the uniform.",
  "expectedStrategy": "STABILISE — Reinforce internal structure without probing"
}`,
  },
};

export function InteractiveSandbox({
  initialTemplate = "react",
  projectName = "Untitled Project",
}: InteractiveSandboxProps) {
  const [template, setTemplate] = useState<SandboxTemplate>(initialTemplate);
  const [code, setCode] = useState(STARTER_TEMPLATES[initialTemplate].code);
  const [output, setOutput] = useState<string>("");
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [name, setName] = useState(projectName);
  const [savedProjects, setSavedProjects] = useState<
    Array<{ name: string; template: SandboxTemplate; code: string }>
  >([]);

  useEffect(() => {
    // Load saved projects from localStorage
    try {
      const stored = localStorage.getItem("vigil_sandbox_projects");
      if (stored) setSavedProjects(JSON.parse(stored));
    } catch {
      // Ignore errors
    }
  }, []);

  const handleTemplateChange = (newT: SandboxTemplate) => {
    setTemplate(newT);
    setCode(STARTER_TEMPLATES[newT].code);
    setOutput("");
    setPreviewHtml("");
  };

  const handleRunCode = () => {
    setOutput("Executing project code...\n");

    if (template === "react") {
      // Transform simple JSX for browser preview
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { margin: 0; background: #090d16; color: #f8fafc; font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
              button { transition: transform 0.1s ease; }
              button:active { transform: scale(0.96); }
            </style>
          </head>
          <body>
            <div id="root"></div>
            <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
            <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
            <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
            <script type="text/babel">
              ${code.replace("export default function", "function").replace(/import.*/g, "")}
              ReactDOM.createRoot(document.getElementById('root')).render(<OperatorWidget />);
            </script>
          </body>
        </html>
      `;
      setPreviewHtml(htmlContent);
      setOutput("React Live Preview rendered successfully.");
    } else if (template === "sql") {
      setOutput(`SQL Query Execution Results:
┌──────────────────┬─────────────────────────────┬──────────┬───────────┐
│ operator_name    │ course_title                │ progress │ status    │
├──────────────────┼─────────────────────────────┼──────────┼───────────┤
│ Steven Gonzales  │ SELF Doctrine Foundations   │ 100%     │ certified │
│ Operator Hargis  │ Git & Version Control       │ 95%      │ completed │
│ SPC Luna         │ Node.js Backend             │ 85%      │ in_prog   │
└──────────────────┴─────────────────────────────┴──────────┴───────────┘
Query executed in 12ms. 3 rows returned.`);
    } else if (template === "python") {
      setOutput(`Calculated Operator Readiness Index: 107.8
Script executed with return code 0.`);
    } else if (template === "node") {
      setOutput(`[Server Mock] Starting Express REST API...
[HTTP] GET /api/operator/status 200 OK - 4ms
Response payload:
{
  "status": "active",
  "callsign": "DragonLeaderA1",
  "doctrineCompliance": 100,
  "timestamp": ${Date.now()}
}`);
    } else {
      setOutput(`[Doctrine Simulation Output]
State Band Detected: STRAIN
Active Pillar: Structure (SPC Gonzales)
Applied Strategy: STABILISE
Result: Doctrine compliance verified (100%). No probing detected.`);
    }
  };

  const handleSaveProject = () => {
    const updated = [
      { name, template, code },
      ...savedProjects.filter(p => p.name !== name),
    ];
    setSavedProjects(updated);
    try {
      localStorage.setItem("vigil_sandbox_projects", JSON.stringify(updated));
      alert(`Project "${name}" saved to local sandbox library!`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportProject = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name.toLowerCase().replace(/\s+/g, "_")}.${STARTER_TEMPLATES[template].language === "python" ? "py" : STARTER_TEMPLATES[template].language === "sql" ? "sql" : "tsx"}`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border/50 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-primary mb-1">
            <Code2 className="size-4" />
            VIGIL Academy Interactive Sandbox
          </div>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="text-xl font-bold text-foreground bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveProject}
            className="gap-2 text-xs"
          >
            <Save className="size-3.5 text-primary" /> Save Project
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportProject}
            className="gap-2 text-xs"
          >
            <Download className="size-3.5 text-emerald-400" /> Export Code
          </Button>
          <Button
            size="sm"
            onClick={handleRunCode}
            className="gap-2 text-xs bg-primary text-primary-foreground"
          >
            <Play className="size-3.5" /> Run Project
          </Button>
        </div>
      </div>

      {/* Template Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {(Object.keys(STARTER_TEMPLATES) as SandboxTemplate[]).map(t => (
          <Button
            key={t}
            variant={template === t ? "default" : "outline"}
            size="sm"
            onClick={() => handleTemplateChange(t)}
            className="text-xs uppercase font-mono shrink-0"
          >
            {t}
          </Button>
        ))}
      </div>

      {/* Code Editor & Execution Window Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor Card */}
        <Card className="border-border/60 shadow-md bg-slate-950 text-slate-100 flex flex-col">
          <CardHeader className="pb-3 border-b border-slate-800 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <Terminal className="size-4" /> Code Editor (
              {STARTER_TEMPLATES[template].language})
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCode(STARTER_TEMPLATES[template].code)}
              className="text-slate-400 hover:text-slate-100 text-xs gap-1"
            >
              <RefreshCcw className="size-3" /> Reset
            </Button>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              rows={18}
              className="w-full h-full p-4 font-mono text-xs bg-slate-950 text-slate-200 focus:outline-none resize-none leading-relaxed border-none"
              spellCheck={false}
            />
          </CardContent>
        </Card>

        {/* Live Output & Preview Window */}
        <Card className="border-border/60 shadow-md flex flex-col">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-mono uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="size-4 text-primary" /> Execution & Live
                Preview Output
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 flex-1 space-y-4">
            {/* React Live iFrame Preview */}
            {template === "react" && previewHtml ? (
              <div className="h-64 rounded-lg border border-border/60 overflow-hidden bg-slate-950">
                <iframe
                  title="React Live Preview"
                  srcDoc={previewHtml}
                  className="w-full h-full border-none"
                />
              </div>
            ) : null}

            {/* Terminal Console Output */}
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 min-h-48 whitespace-pre-wrap leading-relaxed">
              {output ||
                `Ready to execute ${STARTER_TEMPLATES[template].name}. Click "Run Project" above.`}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Saved Projects Library */}
      {savedProjects.length > 0 && (
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Saved Sandbox Projects Library
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {savedProjects.map((p, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setName(p.name);
                  setTemplate(p.template);
                  setCode(p.code);
                }}
                className="p-3 rounded-lg border border-border/60 bg-muted/20 hover:border-primary/40 cursor-pointer transition-all text-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-foreground">
                    {p.name}
                  </span>
                  <Badge variant="outline" className="text-[10px] uppercase">
                    {p.template}
                  </Badge>
                </div>
                <p className="text-muted-foreground font-mono truncate">
                  {p.code.slice(0, 50)}...
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
