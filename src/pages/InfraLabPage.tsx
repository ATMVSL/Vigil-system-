import { useMutation, useQuery } from "convex/react";
import {
  CheckCircle2,
  ChevronRight,
  Cloud,
  HardDrive,
  Lock,
  MonitorCheck,
  Network,
  Play,
  RefreshCw,
  Server,
  UserCog,
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
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

const categoryIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  server_architecture: Server,
  networking: Network,
  security: Lock,
  identity: UserCog,
  deployment: Cloud,
  backup: HardDrive,
  monitoring: MonitorCheck,
  disaster_recovery: RefreshCw,
};

const categoryLabels: Record<string, string> = {
  server_architecture: "Server Architecture",
  networking: "Networking",
  security: "Security",
  identity: "Identity & Access",
  deployment: "Deployment",
  backup: "Backup",
  monitoring: "Monitoring",
  disaster_recovery: "Disaster Recovery",
};

const difficultyColors: Record<string, string> = {
  beginner: "bg-success/10 text-success",
  intermediate: "bg-chart-4/10 text-chart-4",
  advanced: "bg-destructive/10 text-destructive",
};

export function InfraLabPage() {
  const [selectedId, setSelectedId] = useState<Id<"infraScenarios"> | null>(
    null,
  );
  const [activeAttemptId, setActiveAttemptId] =
    useState<Id<"infraAttempts"> | null>(null);

  const scenarios = useQuery(api.infraLab.listScenarios, {});
  const stats = useQuery(api.infraLab.getStats);
  const attempts = useQuery(api.infraLab.getMyAttempts);
  const startScenario = useMutation(api.infraLab.startScenario);
  const advanceStep = useMutation(api.infraLab.advanceStep);

  const selectedScenario = scenarios?.find(s => s._id === selectedId);
  const activeAttempt = attempts?.find(a => a._id === activeAttemptId);
  const completedScenarioIds = new Set(
    attempts?.filter(a => a.status === "completed").map(a => a.scenarioId) ||
      [],
  );

  const handleStart = async () => {
    if (!selectedId) return;
    const id = await startScenario({ scenarioId: selectedId });
    setActiveAttemptId(id);
  };

  const handleAdvance = async () => {
    if (!activeAttemptId) return;
    const result = await advanceStep({ attemptId: activeAttemptId });
    if (result.completed) {
      setActiveAttemptId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Infrastructure Lab
          </h1>
          <p className="text-muted-foreground text-sm">
            Interactive simulations for server, networking, security, and
            operations.
          </p>
        </div>
        {stats && (
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-lg font-bold">
                {stats.completed}/{stats.totalScenarios}
              </p>
              <p className="text-[9px] text-muted-foreground uppercase">
                Completed
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

      {/* Progress */}
      {stats && stats.totalScenarios > 0 && (
        <Card className="vigil-border">
          <CardContent className="py-3">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-muted-foreground">
                Infrastructure Certification Progress
              </span>
              <span className="font-medium">
                {Math.round((stats.completed / stats.totalScenarios) * 100)}%
              </span>
            </div>
            <Progress
              value={(stats.completed / stats.totalScenarios) * 100}
              className="h-2"
            />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scenarios List */}
        <div className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Scenarios ({scenarios?.length || 0})
          </h2>
          {scenarios === undefined ? (
            <p className="text-xs text-muted-foreground">Loading...</p>
          ) : scenarios.length === 0 ? (
            <Card className="vigil-border">
              <CardContent className="py-8 text-center">
                <Server className="size-8 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground">
                  No scenarios yet. Seed platform data from Dashboard.
                </p>
              </CardContent>
            </Card>
          ) : (
            scenarios.map(sc => {
              const Icon = categoryIcons[sc.category] || Server;
              return (
                <Card
                  key={sc._id}
                  className={`vigil-border cursor-pointer transition-all hover:border-primary/30 ${selectedId === sc._id ? "border-primary/50 bg-primary/5" : ""}`}
                  onClick={() => {
                    setSelectedId(sc._id);
                    setActiveAttemptId(null);
                  }}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="shrink-0">
                      {completedScenarioIds.has(sc._id) ? (
                        <CheckCircle2 className="size-5 text-success" />
                      ) : (
                        <Icon className="size-5 text-muted-foreground/50" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{sc.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge
                          variant="outline"
                          className={`text-[8px] ${difficultyColors[sc.difficulty]}`}
                        >
                          {sc.difficulty}
                        </Badge>
                        <span className="text-[9px] text-muted-foreground">
                          {sc.points} pts
                        </span>
                        <span className="text-[9px] text-muted-foreground">
                          ~{sc.estimatedMinutes}min
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground/30 shrink-0" />
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Scenario Detail */}
        <div className="lg:col-span-2">
          {selectedScenario ? (
            <Card className="vigil-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const Icon =
                        categoryIcons[selectedScenario.category] || Server;
                      return <Icon className="size-5 text-primary" />;
                    })()}
                    <CardTitle className="text-base">
                      {selectedScenario.title}
                    </CardTitle>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[9px] ${difficultyColors[selectedScenario.difficulty]}`}
                  >
                    {selectedScenario.difficulty} · {selectedScenario.points}{" "}
                    pts
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  {selectedScenario.description}
                </CardDescription>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Category: {categoryLabels[selectedScenario.category]}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Objectives
                  </p>
                  <p className="text-xs">{selectedScenario.objectives}</p>
                </div>

                {/* Steps */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Steps
                  </p>
                  <div className="space-y-2">
                    {JSON.parse(selectedScenario.steps).map(
                      (
                        step: {
                          step: number;
                          title: string;
                          description: string;
                          validation: string;
                        },
                        idx: number,
                      ) => {
                        const isComplete = activeAttempt
                          ? idx < activeAttempt.currentStep
                          : false;
                        const isCurrent = activeAttempt
                          ? idx === activeAttempt.currentStep
                          : false;
                        return (
                          <div
                            key={step.step}
                            className={`p-3 rounded-md border transition-all ${
                              isComplete
                                ? "border-success/30 bg-success/5"
                                : isCurrent
                                  ? "border-primary/40 bg-primary/5"
                                  : "border-border/30"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              {isComplete ? (
                                <CheckCircle2 className="size-4 text-success" />
                              ) : (
                                <div
                                  className={`size-4 rounded-full border flex items-center justify-center text-[8px] font-bold ${isCurrent ? "border-primary text-primary" : "border-muted-foreground/30 text-muted-foreground/50"}`}
                                >
                                  {step.step}
                                </div>
                              )}
                              <span
                                className={`text-sm font-medium ${isComplete ? "text-success" : isCurrent ? "text-primary" : ""}`}
                              >
                                {step.title}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground ml-6">
                              {step.description}
                            </p>
                            <p className="text-[10px] text-muted-foreground/50 ml-6 mt-1">
                              ✓ {step.validation}
                            </p>
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {activeAttempt && activeAttempt.status === "in_progress" ? (
                    <>
                      <Button
                        size="sm"
                        className="gap-2"
                        onClick={handleAdvance}
                      >
                        <CheckCircle2 className="size-3" /> Complete Step{" "}
                        {activeAttempt.currentStep + 1}
                      </Button>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Score: {activeAttempt.score}</span>
                        <span>·</span>
                        <span>
                          Step {activeAttempt.currentStep + 1}/
                          {activeAttempt.totalSteps}
                        </span>
                      </div>
                    </>
                  ) : (
                    <Button size="sm" className="gap-2" onClick={handleStart}>
                      <Play className="size-3" /> Start Scenario
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="vigil-border">
              <CardContent className="py-20 text-center">
                <Server className="size-12 mx-auto text-muted-foreground/20 mb-4" />
                <p className="text-muted-foreground">
                  Select a scenario to begin.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Practice infrastructure operations in a safe environment.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
