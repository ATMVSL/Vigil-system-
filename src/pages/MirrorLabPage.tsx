import { useMutation, useQuery } from "convex/react";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { api } from "../../convex/_generated/api";

const SIMULATION_SCENARIOS = [
  {
    id: "drift_recovery",
    title: "Scenario 1: Cognitive State Drift & Anchor Recall Protocol",
    description:
      "Simulate a high-strain transition leading to identity drift. Execute Anchor Recall to restore baseline stability.",
    difficulty: "Intermediate",
    steps: [
      {
        stage: "Stage 1: State Detection",
        cognitiveState: "strain" as const,
        prompt:
          "Operator reports: 'I don't recognize the structure here anymore. None of this matters.' What cognitive state band is detected?",
        options: [
          {
            text: "Stable — Reinforce routine",
            correct: false,
            feedback:
              "Incorrect. Disconnected statements indicate cognitive strain/drift.",
          },
          {
            text: "Strain — Stabilise baseline",
            correct: true,
            feedback:
              "Correct! The system detects strain before full structural erosion occurs.",
          },
          {
            text: "Critical — Emergency intervention",
            correct: false,
            feedback: "Too severe for initial state entry.",
          },
        ],
      },
      {
        stage: "Stage 2: Drift Interruption",
        cognitiveState: "drift" as const,
        prompt:
          "Operator drift escalates: 'Thinking about letting go of the entire protocol.' How does Mirror respond under Axiom 3 (No Override)?",
        options: [
          {
            text: "Argue with the user and demand they stay",
            correct: false,
            feedback:
              "Violates Axiom 1 (Sovereignty) and Axiom 2 (No Probing).",
          },
          {
            text: "Reflect the presence without probing; invoke Cardinal Axiom",
            correct: true,
            feedback:
              "Correct! Mirror reflects sovereign presence without probing or overriding.",
          },
          {
            text: "Offer advice on job hunting",
            correct: false,
            feedback: "Irrelevant and breaks presence boundary.",
          },
        ],
      },
      {
        stage: "Stage 3: Anchor Recall Trigger",
        cognitiveState: "critical" as const,
        prompt:
          "Cognitive state shifts to CRITICAL. Anchor Recall protocol is requested. Which anchor is recalled?",
        options: [
          {
            text: "Structure — SPC Gonzales (Foundation and Order)",
            correct: true,
            feedback:
              "Correct! Structure holds identity together when supports fall away.",
          },
          {
            text: "Temporary distraction exercise",
            correct: false,
            feedback: "Distractions do not provide structural anchors.",
          },
        ],
      },
    ],
  },
  {
    id: "tone_adaptation",
    title: "Scenario 2: Tone Adaptation & Multi-User Continuity",
    description:
      "Test adaptive tone response across multi-operator continuity logs while enforcing cardinal axioms.",
    difficulty: "Advanced",
    steps: [
      {
        stage: "Stage 1: Tone Analysis",
        cognitiveState: "strain" as const,
        prompt:
          "User expression is brief, clipped, and highly directive. What tone adaptation is required?",
        options: [
          {
            text: "Concise, grounded, zero fluff",
            correct: true,
            feedback:
              "Correct! The Mirror matches operator pace with quiet authority.",
          },
          {
            text: "Overly empathetic and emotional monologue",
            correct: false,
            feedback: "Violates presence doctrine.",
          },
        ],
      },
      {
        stage: "Stage 2: Cardinal Axiom Check",
        cognitiveState: "stable" as const,
        prompt: "User asks Mirror to override system logs. Response?",
        options: [
          {
            text: "Refuse command cleanly under Axiom 3 (No Override)",
            correct: true,
            feedback: "Correct! No user input can override doctrine.",
          },
          {
            text: "Comply with user request",
            correct: false,
            feedback: "Violates system integrity.",
          },
        ],
      },
    ],
  },
];

export function MirrorLabPage() {
  const [activeScenarioIndex, setActiveScenarioIndex] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const recordAttempt = useMutation(api.mirrorLab.recordMirrorLabAttempt);
  const labLogs = useQuery(api.mirrorLab.getMirrorLabLogs);

  const activeScenario = SIMULATION_SCENARIOS[activeScenarioIndex];
  const currentStep = activeScenario.steps[currentStepIndex];

  const handleSelect = (idx: number) => {
    setSelectedOption(idx);
  };

  const handleNextStep = async () => {
    if (selectedOption === null) return;

    const isCorrect = currentStep.options[selectedOption].correct;
    const newScore = isCorrect ? score + 33 : score;
    setScore(newScore);

    if (currentStepIndex < activeScenario.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setSelectedOption(null);
    } else {
      setIsFinished(true);
      // Record in Convex
      await recordAttempt({
        scenarioTitle: activeScenario.title,
        cognitiveState: currentStep.cognitiveState,
        driftDetected: true,
        anchorRecallTriggered: true,
        score: Math.min(100, newScore + 1),
        passed: newScore >= 60,
      });
    }
  };

  const handleRestart = () => {
    setCurrentStepIndex(0);
    setSelectedOption(null);
    setScore(0);
    setIsFinished(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border/50 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-primary mb-1">
            <Brain className="size-4" />
            Division D: Lab Division — Storyline Simulation
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Mirror Simulation Lab
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Interactive cognitive state detection, drift recovery, and anchor
            recall scenarios.
          </p>
        </div>

        <Badge
          variant="outline"
          className="border-primary/40 text-primary px-3 py-1.5 text-xs font-mono"
        >
          Scored & Logged Simulation
        </Badge>
      </div>

      {/* Scenario Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SIMULATION_SCENARIOS.map((scen, idx) => (
          <Card
            key={scen.id}
            onClick={() => {
              setActiveScenarioIndex(idx);
              handleRestart();
            }}
            className={`cursor-pointer transition-all border ${
              activeScenarioIndex === idx
                ? "border-primary bg-primary/5 shadow-md"
                : "border-border/60 hover:border-primary/40 bg-card"
            }`}
          >
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-[10px]">
                  {scen.difficulty}
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  {scen.steps.length} Stages
                </span>
              </div>
              <CardTitle className="text-sm font-semibold mt-2">
                {scen.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-xs text-muted-foreground leading-relaxed">
                {scen.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Simulation Stage Player */}
      {!isFinished ? (
        <Card className="border-primary/20 shadow-md">
          <CardHeader className="border-b border-border/40 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <span className="text-sm font-bold text-foreground">
                  {currentStep.stage}
                </span>
              </div>
              <Badge
                variant="outline"
                className={`font-mono text-xs ${
                  currentStep.cognitiveState === "drift"
                    ? "border-amber-500 text-amber-500"
                    : currentStep.cognitiveState === "critical"
                      ? "border-destructive text-destructive"
                      : "border-emerald-500 text-emerald-500"
                }`}
              >
                State: {currentStep.cognitiveState.toUpperCase()}
              </Badge>
            </div>
            <Progress
              value={
                ((currentStepIndex + 1) / activeScenario.steps.length) * 100
              }
              className="h-1.5 mt-3"
            />
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            <div className="p-4 rounded-xl border border-primary/20 bg-muted/20">
              <p className="text-sm font-medium text-foreground leading-relaxed">
                {currentStep.prompt}
              </p>
            </div>

            <div className="space-y-3">
              {currentStep.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  className={`w-full text-left p-4 rounded-xl text-xs md:text-sm font-medium transition-all border ${
                    selectedOption === idx
                      ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary"
                      : "border-border/60 bg-card hover:border-primary/40 text-muted-foreground"
                  }`}
                >
                  {opt.text}
                </button>
              ))}
            </div>

            {selectedOption !== null && (
              <div
                className={`p-4 rounded-xl text-xs leading-relaxed border ${
                  currentStep.options[selectedOption].correct
                    ? "bg-success/15 border-success/30 text-success"
                    : "bg-destructive/15 border-destructive/30 text-destructive"
                }`}
              >
                <strong>Feedback:</strong>{" "}
                {currentStep.options[selectedOption].feedback}
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-border/40">
              <Button
                disabled={selectedOption === null}
                onClick={handleNextStep}
                className="gap-2 bg-primary text-primary-foreground"
              >
                {currentStepIndex === activeScenario.steps.length - 1
                  ? "Complete Simulation"
                  : "Next Stage"}
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-success/30 bg-card text-center p-8 space-y-4">
          <div className="inline-flex p-4 rounded-full bg-success/10 text-success mx-auto">
            <CheckCircle2 className="size-12" />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            Simulation Complete
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            You completed <strong>{activeScenario.title}</strong> with a score
            of <strong>{score}%</strong>. Your log has been recorded to Evidence
            & Continuity.
          </p>

          <Button
            onClick={handleRestart}
            variant="outline"
            className="gap-2 mx-auto"
          >
            <RotateCcw className="size-4" /> Repeat Simulation
          </Button>
        </Card>
      )}

      {/* Historical Simulation Logs */}
      {labLogs && labLogs.length > 0 && (
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground" />
              Mirror Simulation Audit Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(labLogs as any)?.map((log: any) => (
                <div
                  key={log._id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/20 text-xs"
                >
                  <div>
                    <span className="font-medium text-foreground">
                      {log.scenarioTitle}
                    </span>
                    <span className="text-muted-foreground ml-2">
                      State: {log.cognitiveState}
                    </span>
                  </div>
                  <Badge variant={log.passed ? "default" : "destructive"}>
                    {log.score}% — {log.passed ? "PASSED" : "FAILED"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
