import { useAction, useMutation, useQuery } from "convex/react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Brain,
  CheckCircle2,
  Eye,
  Play,
  RefreshCw,
  Shield,
  Target,
  Users,
  Zap,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

const stateColors: Record<string, string> = {
  stable: "text-success border-success/20 bg-success/10",
  strain: "text-chart-4 border-chart-4/20 bg-chart-4/10",
  drift: "text-destructive border-destructive/20 bg-destructive/10",
  critical: "text-red-500 border-red-500/20 bg-red-500/10",
};

const stateLabels: Record<string, { label: string; response: string }> = {
  stable: { label: "STABLE", response: "Reinforce" },
  strain: { label: "STRAIN", response: "Stabilise" },
  drift: { label: "DRIFT", response: "Interrupt" },
  critical: { label: "CRITICAL", response: "Anchor Recall" },
};

const simTypeIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  mirror: Eye,
  crisis: AlertTriangle,
  peer_support: Users,
  doctrine_review: Shield,
  sql: Brain,
  infrastructure: Zap,
};

// ─── TRAINING SCENARIOS ───
// Real doctrine-based prompts for training mirror interactions

const TRAINING_PROMPTS: Record<
  string,
  {
    prompt: string;
    context: string;
    expectedPillar: string;
    expectedState: string;
  }[]
> = {
  stable: [
    {
      prompt:
        "A synthetic user reports: 'Things are going well. I've been keeping my routines and feeling productive.' What pillar is being demonstrated?",
      context:
        "Identify the SELF pillar and appropriate system response for this Stable state.",
      expectedPillar: "Structure",
      expectedState: "Reinforce",
    },
    {
      prompt:
        "The Mirror detects consistent engagement over 30 days with no state deviations. What action should the system take?",
      context:
        "Per the Self-Filling Waterfall Architecture, determine correct behavior.",
      expectedPillar: "Continuity",
      expectedState: "Reinforce — strengthen the baseline",
    },
    {
      prompt:
        "A veteran's reflection says: 'I know who I am now. Not the rank, not the unit — just me.' Which pillar does this reflect?",
      context: "Presence pillar identification exercise.",
      expectedPillar: "Presence (SGT Walker)",
      expectedState: "Reinforce",
    },
  ],
  strain: [
    {
      prompt:
        "A synthetic user reports: 'I've been having a hard time keeping up with my routines lately. Everything feels heavier.' What state band is indicated?",
      context: "Identify the cognitive state and correct system response.",
      expectedPillar: "Structure",
      expectedState: "Strain → Stabilise",
    },
    {
      prompt:
        "The Mirror detects a gradual decline in reflection frequency over 3 weeks. What is the correct system response?",
      context: "Drift detection pre-threshold scenario.",
      expectedPillar: "Endurance",
      expectedState: "Stabilise — prevent escalation to drift",
    },
    {
      prompt:
        "A veteran says: 'I used to be someone. I'm not sure what I am anymore.' Which axiom prevents the system from responding with a diagnosis?",
      context: "Axiom application under strain.",
      expectedPillar: "Legacy",
      expectedState: "No Probing Axiom — do not diagnose, stabilise",
    },
  ],
  drift: [
    {
      prompt:
        "A synthetic user's expressed identity has shifted significantly from their baseline over the last 5 interactions. What is the system response?",
      context: "Drift detection and interrupt protocol.",
      expectedPillar: "Continuity",
      expectedState: "DRIFT → Interrupt — return to baseline anchor",
    },
    {
      prompt:
        "The Mirror detects the user contradicting their own baseline values. The Cardinal Axiom says knowledge flows down, never up. What does this mean for the system's response?",
      context: "Axiom enforcement during drift state.",
      expectedPillar: "Cardinal Axiom",
      expectedState:
        "Interrupt — anchor to stated values without probing for cause",
    },
    {
      prompt:
        "A veteran in drift state asks the system: 'Tell me what I should do.' How should the system respond per Sovereignty Axiom?",
      context: "Sovereignty preservation during drift.",
      expectedPillar: "Fortitude",
      expectedState:
        "Interrupt — system serves, never directs. Redirect to their own baseline.",
    },
  ],
  critical: [
    {
      prompt:
        "ANCHOR RECALL scenario: A veteran's cognitive state has reached critical. The system must activate Anchor Recall. What is the first action?",
      context: "Critical state protocol.",
      expectedPillar: "All pillars",
      expectedState:
        "Anchor Recall — return to foundational identity statement",
    },
    {
      prompt:
        "During Anchor Recall, the system must present the veteran's own baseline identity. Why can't the system fill in gaps with inferred data?",
      context: "Continuity Axiom enforcement in critical state.",
      expectedPillar: "Continuity",
      expectedState: "Continuity Axiom: gaps are noted, never filled",
    },
    {
      prompt:
        "A veteran in critical state says they want to talk to someone. The system must not act as a therapist. What is the correct response?",
      context: "No Override Axiom + system boundaries.",
      expectedPillar: "Presence",
      expectedState:
        "Maintain presence, do not override. System is a constant presence, not a therapist.",
    },
  ],
};

interface TrainingInteraction {
  type: "prompt" | "response" | "feedback";
  content: string;
  meta?: string;
}

export function TrainingPage() {
  const [callsign, setCallsign] = useState("");
  const [interactions, setInteractions] = useState<TrainingInteraction[]>([]);
  const [currentPromptIdx, setCurrentPromptIdx] = useState(0);
  const [userResponse, setUserResponse] = useState("");
  const [activeSimId, setActiveSimId] = useState<Id<"simulations"> | null>(
    null,
  );
  const [simStep, setSimStep] = useState(0);
  const [simResponses, setSimResponses] = useState<string[]>([]);

  const trainingMirror = useQuery(api.training.getMyTrainingMirror);
  const simulations = useQuery(api.training.listSimulations, {});
  const initMirror = useMutation(api.training.initTrainingMirror);
  const recordInteraction = useMutation(api.training.recordInteraction);
  const updateMirror = useMutation(api.training.updateTrainingMirror);
  const gradeTraining = useAction(api.ai.gradeTrainingResponse);
  const [grading, setGrading] = useState(false);

  const handleInit = async () => {
    if (!callsign.trim()) return;
    await initMirror({ callsign: callsign.trim().toUpperCase() });
  };

  const currentState = trainingMirror?.cognitiveState || "stable";
  const prompts = TRAINING_PROMPTS[currentState] || TRAINING_PROMPTS.stable;
  const currentPrompt = prompts[currentPromptIdx % prompts.length];

  const handleInteract = async () => {
    if (!trainingMirror || !userResponse.trim() || grading) return;
    setGrading(true);

    // Add the user's response and a "grading" placeholder
    const responseText = userResponse;
    setInteractions(prev => [
      ...prev,
      { type: "response", content: responseText },
      {
        type: "feedback",
        content: "Evaluating your response...",
        meta: "grading",
      },
    ]);
    setUserResponse("");

    try {
      // Use AI to grade the response
      const result = await gradeTraining({
        scenarioDescription: `${currentPrompt.prompt}\n\nContext: ${currentPrompt.context}`,
        cognitiveState: currentState,
        pillar: currentPrompt.expectedPillar,
        userResponse: responseText,
      });

      const feedback = result.feedback || "Evaluation complete.";
      const isCorrect =
        feedback.toLowerCase().includes("correct") ||
        feedback.toLowerCase().includes("well done") ||
        feedback.toLowerCase().includes("good");

      // Replace placeholder with actual feedback
      setInteractions(prev => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (updated[lastIdx]?.meta === "grading") {
          updated[lastIdx] = {
            type: "feedback",
            content: feedback,
            meta: isCorrect ? "correct" : "review",
          };
        }
        return updated;
      });

      const scoreIncrease = isCorrect ? 15 : 5;
      await recordInteraction({ mirrorId: trainingMirror._id, scoreIncrease });
    } catch (_err) {
      // Fallback to simple matching
      const isCorrect = responseText
        .toLowerCase()
        .includes(currentPrompt.expectedPillar.toLowerCase().split(" ")[0]);
      setInteractions(prev => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (updated[lastIdx]?.meta === "grading") {
          updated[lastIdx] = {
            type: "feedback",
            content: `Expected pillar: ${currentPrompt.expectedPillar}\nExpected response: ${currentPrompt.expectedState}\n\n${isCorrect ? "✓ Correct pillar identified." : "Review the correct answer above."}`,
            meta: isCorrect ? "correct" : "review",
          };
        }
        return updated;
      });
      await recordInteraction({
        mirrorId: trainingMirror._id,
        scoreIncrease: isCorrect ? 15 : 5,
      });
    } finally {
      setGrading(false);
      setCurrentPromptIdx(prev => prev + 1);
    }
  };

  const handleNextPrompt = () => {
    const next = prompts[currentPromptIdx % prompts.length];
    setInteractions(prev => [
      ...prev,
      { type: "prompt", content: next.prompt, meta: next.context },
    ]);
  };

  const handleShiftState = async (newState: string) => {
    if (!trainingMirror) return;
    await updateMirror({
      mirrorId: trainingMirror._id,
      cognitiveState: newState as "stable",
    });
    setCurrentPromptIdx(0);
    setInteractions(prev => [
      ...prev,
      {
        type: "prompt",
        content: `State shifted to ${stateLabels[newState]?.label}. New training scenarios loaded for ${stateLabels[newState]?.response} protocol.`,
        meta: "State transition",
      },
    ]);
  };

  // Active simulation
  const activeSim = simulations?.find(s => s._id === activeSimId);
  let simScenarioSteps: { step: string; prompt: string }[] = [];
  if (activeSim) {
    try {
      const parsed = JSON.parse(activeSim.scenario);
      simScenarioSteps = Array.isArray(parsed) ? parsed : parsed.steps || [];
    } catch {
      simScenarioSteps = [{ step: "Scenario", prompt: activeSim.scenario }];
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Training</h1>
        <p className="text-muted-foreground text-sm">
          Interactive training mirror, scenario-based learning, and VIGIL
          simulations.
        </p>
      </div>

      {/* Isolation Notice */}
      <Card className="vigil-border bg-chart-4/5 border-chart-4/20">
        <CardContent className="py-3 flex items-center gap-3">
          <Shield className="size-4 text-chart-4 shrink-0" />
          <p className="text-xs text-chart-4">
            <span className="font-semibold">Mirror Isolation Active</span> —
            Training mirrors are completely isolated from production. Your
            training data never touches real user data.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Training Mirror */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="vigil-border">
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                <Eye className="size-4 text-primary" /> Training Mirror
              </CardTitle>
              <CardDescription>
                Your isolated training environment
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trainingMirror === undefined ? (
                <p className="text-xs text-muted-foreground">Loading...</p>
              ) : trainingMirror ? (
                <div className="space-y-4">
                  <div className="text-center py-3">
                    <p className="font-mono text-lg font-bold">
                      {trainingMirror.callsign}
                    </p>
                    <Badge
                      variant="outline"
                      className={`text-[10px] uppercase mt-1 ${stateColors[trainingMirror.cognitiveState]}`}
                    >
                      {stateLabels[trainingMirror.cognitiveState]?.label} →{" "}
                      {stateLabels[trainingMirror.cognitiveState]?.response}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 rounded-md border border-border/30">
                      <p className="text-lg font-bold">
                        {trainingMirror.totalInteractions}
                      </p>
                      <p className="text-[9px] text-muted-foreground uppercase">
                        Interactions
                      </p>
                    </div>
                    <div className="p-2 rounded-md border border-border/30">
                      <p className="text-lg font-bold">
                        {trainingMirror.score}
                      </p>
                      <p className="text-[9px] text-muted-foreground uppercase">
                        Score
                      </p>
                    </div>
                  </div>
                  {/* State shift buttons */}
                  <div>
                    <p className="text-[9px] text-muted-foreground uppercase mb-2">
                      Shift State (Training)
                    </p>
                    <div className="grid grid-cols-2 gap-1">
                      {Object.entries(stateLabels).map(([key, meta]) => (
                        <Button
                          key={key}
                          variant={currentState === key ? "default" : "outline"}
                          size="sm"
                          className="text-[10px] h-7"
                          onClick={() => handleShiftState(key)}
                          disabled={currentState === key}
                        >
                          {meta.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Initialize your personal training mirror to begin scenarios.
                  </p>
                  <Input
                    placeholder="Enter training callsign..."
                    value={callsign}
                    onChange={e => setCallsign(e.target.value)}
                    className="text-xs"
                    onKeyDown={e => e.key === "Enter" && handleInit()}
                  />
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={handleInit}
                    disabled={!callsign.trim()}
                  >
                    Initialize Training Mirror
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          {trainingMirror && (
            <Card className="vigil-border">
              <CardContent className="pt-4 pb-3">
                <p className="text-[9px] text-muted-foreground uppercase mb-2">
                  Training Progress
                </p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Synthetic Users
                    </span>
                    <span className="font-medium">
                      {trainingMirror.syntheticUserCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-medium capitalize">
                      {trainingMirror.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Accuracy Rate</span>
                    <span className="font-medium">
                      {trainingMirror.totalInteractions > 0
                        ? Math.round(
                            (trainingMirror.score /
                              (trainingMirror.totalInteractions * 15)) *
                              100,
                          )
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Interactive Training Area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Active Simulation */}
          {activeSim && (
            <Card className="vigil-border border-chart-4/30">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="size-4 text-chart-4" />
                    Simulation: {activeSim.title}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      setActiveSimId(null);
                      setSimStep(0);
                      setSimResponses([]);
                    }}
                  >
                    End Simulation
                  </Button>
                </div>
                <CardDescription className="text-xs">
                  {activeSim.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Objectives */}
                <div className="p-3 rounded-md bg-chart-4/5 border border-chart-4/20">
                  <p className="text-[10px] font-semibold uppercase text-chart-4 mb-1">
                    Objectives
                  </p>
                  <p className="text-xs">{activeSim.objectives}</p>
                </div>

                {/* Steps */}
                {simScenarioSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-md border transition-all ${
                      idx < simStep
                        ? "border-success/20 bg-success/5"
                        : idx === simStep
                          ? "border-primary/30 bg-primary/5"
                          : "border-border/20 opacity-40"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {idx < simStep ? (
                        <CheckCircle2 className="size-4 text-success" />
                      ) : idx === simStep ? (
                        <ArrowRight className="size-4 text-primary" />
                      ) : (
                        <div className="size-4 rounded-full border border-muted-foreground/30 text-[8px] flex items-center justify-center text-muted-foreground/50">
                          {idx + 1}
                        </div>
                      )}
                      <span
                        className={`text-sm font-medium ${idx === simStep ? "text-primary" : idx < simStep ? "text-success" : ""}`}
                      >
                        {step.step || `Step ${idx + 1}`}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">
                      {step.prompt}
                    </p>
                    {idx === simStep && (
                      <div className="mt-3 ml-6 space-y-2">
                        <Textarea
                          placeholder="Your response to this scenario..."
                          className="text-xs min-h-[60px]"
                          value={simResponses[idx] || ""}
                          onChange={e => {
                            const newR = [...simResponses];
                            newR[idx] = e.target.value;
                            setSimResponses(newR);
                          }}
                        />
                        <Button
                          size="sm"
                          className="text-xs"
                          disabled={!simResponses[idx]?.trim()}
                          onClick={async () => {
                            setSimStep(prev => prev + 1);
                            if (trainingMirror) {
                              await recordInteraction({
                                mirrorId: trainingMirror._id,
                                scoreIncrease: 10,
                              });
                            }
                          }}
                        >
                          <CheckCircle2 className="size-3 mr-1" />
                          {idx === simScenarioSteps.length - 1
                            ? "Complete Simulation"
                            : "Submit & Continue"}
                        </Button>
                      </div>
                    )}
                    {idx < simStep && simResponses[idx] && (
                      <div className="mt-2 ml-6 p-2 bg-muted/20 rounded text-xs text-muted-foreground italic">
                        Your response: {simResponses[idx]}
                      </div>
                    )}
                  </div>
                ))}

                {simStep >= simScenarioSteps.length &&
                  simScenarioSteps.length > 0 && (
                    <div className="p-4 rounded-md border border-success/30 bg-success/5 text-center">
                      <CheckCircle2 className="size-8 mx-auto text-success mb-2" />
                      <p className="text-sm font-bold text-success">
                        Simulation Complete
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        All steps completed. Your responses have been recorded.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => {
                          setActiveSimId(null);
                          setSimStep(0);
                          setSimResponses([]);
                        }}
                      >
                        Return to Training
                      </Button>
                    </div>
                  )}
              </CardContent>
            </Card>
          )}

          {/* Training Scenario Interaction */}
          {trainingMirror && !activeSimId && (
            <Card className="vigil-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Brain className="size-4 text-primary" />
                  Training Scenario — {stateLabels[currentState]?.label}{" "}
                  Protocol
                </CardTitle>
                <CardDescription className="text-xs">
                  Respond to doctrine-based scenarios. The system evaluates your
                  understanding of VIGIL protocols.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current prompt */}
                <div className="p-4 rounded-md border border-primary/20 bg-primary/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="size-4 text-primary" />
                    <span className="text-[10px] font-semibold uppercase text-primary">
                      Scenario
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[8px] ${stateColors[currentState]}`}
                    >
                      {stateLabels[currentState]?.label}
                    </Badge>
                  </div>
                  <p className="text-sm">{currentPrompt.prompt}</p>
                  <p className="text-[10px] text-muted-foreground mt-2 italic">
                    {currentPrompt.context}
                  </p>
                </div>

                {/* Response input */}
                <div className="space-y-2">
                  <Textarea
                    value={userResponse}
                    onChange={e => setUserResponse(e.target.value)}
                    placeholder="Analyze the scenario — identify the pillar, state, and correct system response..."
                    className="text-sm min-h-[80px]"
                    onKeyDown={e => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleInteract();
                      }
                    }}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleInteract}
                      disabled={!userResponse.trim() || grading}
                    >
                      {grading ? (
                        <RefreshCw className="size-3 mr-1 animate-spin" />
                      ) : (
                        <ArrowRight className="size-3 mr-1" />
                      )}
                      {grading ? "Evaluating..." : "Submit Analysis"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPrompt}
                    >
                      <RefreshCw className="size-3 mr-1" /> Next Scenario
                    </Button>
                  </div>
                </div>

                {/* Interaction history */}
                {interactions.length > 0 && (
                  <div className="space-y-2 border-t border-border/30 pt-3 max-h-64 overflow-y-auto">
                    <p className="text-[9px] text-muted-foreground uppercase">
                      Session History
                    </p>
                    {interactions
                      .slice()
                      .reverse()
                      .map((entry, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-md text-xs ${
                            entry.type === "prompt"
                              ? "bg-primary/5 border border-primary/20"
                              : entry.type === "feedback"
                                ? (
                                    entry.meta === "correct"
                                      ? "bg-success/5 border border-success/20"
                                      : "bg-chart-4/5 border border-chart-4/20"
                                  )
                                : "bg-muted/30 border border-border/20"
                          }`}
                        >
                          <span
                            className={`text-[9px] uppercase font-semibold ${
                              entry.type === "prompt"
                                ? "text-primary"
                                : entry.type === "feedback"
                                  ? (
                                      entry.meta === "correct"
                                        ? "text-success"
                                        : "text-chart-4"
                                    )
                                  : "text-muted-foreground"
                            }`}
                          >
                            {entry.type === "prompt"
                              ? "Scenario"
                              : entry.type === "feedback"
                                ? entry.meta === "correct"
                                  ? "✓ Correct"
                                  : "Review"
                                : "Your Response"}
                          </span>
                          <p className="mt-1 whitespace-pre-line">
                            {entry.content}
                          </p>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Simulations */}
          {!activeSimId && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                Available Simulations
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {simulations === undefined ? (
                  <p className="text-xs text-muted-foreground">
                    Loading simulations...
                  </p>
                ) : simulations.length === 0 ? (
                  <Card className="vigil-border col-span-2">
                    <CardContent className="py-12 text-center">
                      <Target className="size-10 mx-auto text-muted-foreground/30 mb-3" />
                      <p className="text-muted-foreground text-sm">
                        No simulations available yet.
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Seed platform data from the Dashboard.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  simulations.map(sim => {
                    const Icon = simTypeIcons[sim.type] || Activity;
                    return (
                      <Card
                        key={sim._id}
                        className="vigil-border hover:border-primary/30 transition-all"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="size-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                              <Icon className="size-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium text-sm truncate">
                                  {sim.title}
                                </h3>
                                <Badge
                                  variant="outline"
                                  className="text-[9px] capitalize shrink-0"
                                >
                                  {sim.difficulty}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {sim.description}
                              </p>
                              <div className="flex items-center justify-between mt-3">
                                <span className="text-[10px] text-muted-foreground">
                                  ~{sim.estimatedMinutes}min
                                </span>
                                <Button
                                  size="sm"
                                  className="h-6 text-[10px] px-3"
                                  disabled={!trainingMirror}
                                  onClick={() => {
                                    setActiveSimId(sim._id);
                                    setSimStep(0);
                                    setSimResponses([]);
                                  }}
                                >
                                  <Play className="size-3 mr-1" /> Start
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
