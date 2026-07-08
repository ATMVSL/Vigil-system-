import { useAction, useMutation, useQuery } from "convex/react";
import {
  CheckCircle2,
  ChevronRight,
  Code2,
  Database,
  HelpCircle,
  Loader2,
  Play,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

const categoryLabels: Record<string, string> = {
  select: "SELECT",
  joins: "JOINs",
  aggregation: "Aggregation",
  subqueries: "Subqueries",
  insert_update: "Insert/Update",
  schema_design: "Schema Design",
  vigil_specific: "VIGIL-Specific",
};

const difficultyColors: Record<string, string> = {
  beginner: "bg-success/10 text-success border-success/20",
  intermediate: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  advanced: "bg-destructive/10 text-destructive border-destructive/20",
};

export function SqlLabPage() {
  const [selectedId, setSelectedId] = useState<Id<"sqlChallenges"> | null>(
    null,
  );
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<{
    passed: boolean;
    feedback: string;
  } | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [evaluating, setEvaluating] = useState(false);

  const challenges = useQuery(
    api.sqlLab.listChallenges,
    categoryFilter ? { category: categoryFilter } : {},
  );
  const stats = useQuery(api.sqlLab.getStats);
  const submissions = useQuery(api.sqlLab.getMySubmissions, {});
  const submitQueryMutation = useMutation(api.sqlLab.submitQuery);
  const evaluateSql = useAction(api.ai.evaluateSqlQuery);

  const selectedChallenge = challenges?.find(c => c._id === selectedId);
  const passedChallengeIds = new Set(
    submissions?.filter(s => s.passed).map(s => s.challengeId) || [],
  );

  const handleSubmit = async () => {
    if (!selectedId || !query.trim() || !selectedChallenge) return;
    setEvaluating(true);
    setResult(null);

    try {
      // Use AI evaluation
      const aiResult = await evaluateSql({
        challengeTitle: selectedChallenge.title,
        challengeDescription: selectedChallenge.description,
        tableSchema: selectedChallenge.tableSchema,
        expectedQuery: selectedChallenge.expectedQuery,
        userQuery: query,
        hints: selectedChallenge.hints,
      });

      // Also save to backend for tracking
      await submitQueryMutation({ challengeId: selectedId, query });

      setResult({
        passed: aiResult.passed,
        feedback:
          aiResult.feedback +
          (aiResult.hints ? `\n\nHint: ${aiResult.hints}` : ""),
      });
    } catch {
      // Fallback to mutation-based evaluation
      const res = await submitQueryMutation({ challengeId: selectedId, query });
      setResult(res);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">SQL Lab</h1>
          <p className="text-muted-foreground text-sm">
            Interactive SQL training against VIGIL database schemas.
          </p>
        </div>
        {stats && (
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-lg font-bold">
                {stats.passed}/{stats.totalChallenges}
              </p>
              <p className="text-[9px] text-muted-foreground uppercase">
                Solved
              </p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-chart-4">
                {stats.totalPoints}
              </p>
              <p className="text-[9px] text-muted-foreground uppercase">
                Points
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {stats && stats.totalChallenges > 0 && (
        <Card className="vigil-border">
          <CardContent className="py-3">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-muted-foreground">
                SQL Certification Progress
              </span>
              <span className="font-medium">
                {Math.round((stats.passed / stats.totalChallenges) * 100)}%
              </span>
            </div>
            <Progress
              value={(stats.passed / stats.totalChallenges) * 100}
              className="h-2"
            />
          </CardContent>
        </Card>
      )}

      {/* Category Filters */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={categoryFilter === "" ? "default" : "outline"}
          size="sm"
          className="text-xs"
          onClick={() => setCategoryFilter("")}
        >
          All
        </Button>
        {Object.entries(categoryLabels).map(([k, v]) => (
          <Button
            key={k}
            variant={categoryFilter === k ? "default" : "outline"}
            size="sm"
            className="text-xs"
            onClick={() => setCategoryFilter(k)}
          >
            {v}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Challenges List */}
        <div className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Challenges ({challenges?.length || 0})
          </h2>
          {challenges === undefined ? (
            <p className="text-xs text-muted-foreground">Loading...</p>
          ) : challenges.length === 0 ? (
            <Card className="vigil-border">
              <CardContent className="py-8 text-center">
                <Database className="size-8 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground">
                  No challenges yet. Seed platform data from Dashboard.
                </p>
              </CardContent>
            </Card>
          ) : (
            challenges
              .sort((a, b) => a.order - b.order)
              .map(ch => (
                <Card
                  key={ch._id}
                  className={`vigil-border cursor-pointer transition-all hover:border-primary/30 ${selectedId === ch._id ? "border-primary/50 bg-primary/5" : ""}`}
                  onClick={() => {
                    setSelectedId(ch._id);
                    setQuery("");
                    setResult(null);
                    setShowHint(false);
                  }}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="shrink-0">
                      {passedChallengeIds.has(ch._id) ? (
                        <CheckCircle2 className="size-5 text-success" />
                      ) : (
                        <Code2 className="size-5 text-muted-foreground/50" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{ch.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge
                          variant="outline"
                          className={`text-[8px] ${difficultyColors[ch.difficulty]}`}
                        >
                          {ch.difficulty}
                        </Badge>
                        <span className="text-[9px] text-muted-foreground">
                          {ch.points} pts
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground/30 shrink-0" />
                  </CardContent>
                </Card>
              ))
          )}
        </div>

        {/* SQL Editor */}
        <div className="lg:col-span-2">
          {selectedChallenge ? (
            <div className="space-y-4">
              <Card className="vigil-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {selectedChallenge.title}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={`text-[9px] ${difficultyColors[selectedChallenge.difficulty]}`}
                    >
                      {selectedChallenge.difficulty} ·{" "}
                      {selectedChallenge.points} pts
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    {selectedChallenge.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Table Schema */}
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Table Schema
                    </p>
                    <div className="bg-muted/30 rounded-md p-3 font-mono text-xs">
                      {Object.entries(
                        JSON.parse(selectedChallenge.tableSchema),
                      ).map(([table, cols]) => (
                        <div key={table}>
                          <span className="text-primary">{table}</span>
                          <span className="text-muted-foreground">
                            {" "}
                            ({(cols as string[]).join(", ")})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sample Data */}
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Sample Output
                    </p>
                    <div className="bg-muted/30 rounded-md p-3 font-mono text-[10px] overflow-x-auto">
                      <pre>
                        {JSON.stringify(
                          JSON.parse(selectedChallenge.sampleData),
                          null,
                          2,
                        )}
                      </pre>
                    </div>
                  </div>

                  {/* SQL Editor */}
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Your Query
                    </p>
                    <Textarea
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      placeholder="Write your SQL query here..."
                      className="font-mono text-xs min-h-[100px]"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="gap-2"
                      onClick={handleSubmit}
                      disabled={!query.trim() || evaluating}
                    >
                      {evaluating ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <Play className="size-3" />
                      )}
                      {evaluating ? "Evaluating..." : "Execute"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 text-xs"
                      onClick={() => setShowHint(!showHint)}
                    >
                      <HelpCircle className="size-3" />{" "}
                      {showHint ? "Hide Hint" : "Show Hint"}
                    </Button>
                  </div>

                  {showHint && (
                    <div className="bg-chart-4/5 border border-chart-4/20 rounded-md p-3">
                      <p className="text-xs text-chart-4">
                        {selectedChallenge.hints}
                      </p>
                    </div>
                  )}

                  {/* Result */}
                  {result && (
                    <div
                      className={`rounded-md p-4 border ${result.passed ? "bg-success/5 border-success/20" : "bg-destructive/5 border-destructive/20"}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {result.passed ? (
                          <CheckCircle2 className="size-5 text-success" />
                        ) : (
                          <XCircle className="size-5 text-destructive" />
                        )}
                        <span
                          className={`font-semibold text-sm ${result.passed ? "text-success" : "text-destructive"}`}
                        >
                          {result.passed ? "Query Passed!" : "Query Failed"}
                        </span>
                      </div>
                      <p className="text-xs">{result.feedback}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="vigil-border">
              <CardContent className="py-20 text-center">
                <Database className="size-12 mx-auto text-muted-foreground/20 mb-4" />
                <p className="text-muted-foreground">
                  Select a challenge to begin.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Practice SQL against VIGIL database schemas.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
