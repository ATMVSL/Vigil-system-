import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  CheckCircle2,
  Code2,
  HelpCircle,
  Layers,
  Lightbulb,
  Play,
  RotateCw,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface RiseBlockData {
  intro?: {
    purpose: string;
    outcomes: string[];
    relevance: string;
  };
  processSteps?: Array<{
    title: string;
    description: string;
    details?: string;
  }>;
  tabsData?: Array<{
    id: string;
    label: string;
    content: string;
  }>;
  flashcards?: Array<{
    front: string;
    back: string;
  }>;
  scenarios?: Array<{
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }>;
  codeSnippet?: {
    language: string;
    code: string;
    description?: string;
  };
  reflectionPrompt?: string;
}

interface RiseCoursePlayerProps {
  lessonTitle: string;
  moduleIndex?: number;
  courseTitle: string;
  rawContent: string;
  contentJson?: string;
  onCompleteLesson: () => void;
  onBack: () => void;
  isCompleted?: boolean;
}

export function RiseCoursePlayer({
  lessonTitle,
  moduleIndex = 1,
  courseTitle,
  rawContent,
  contentJson,
  onCompleteLesson,
  onBack,
  isCompleted = false,
}: RiseCoursePlayerProps) {
  // Active process step
  const [activeProcessStep, setActiveProcessStep] = useState(0);
  // Flashcard flip states
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});
  // Scenario answers
  const [scenarioAnswers, setScenarioAnswers] = useState<Record<string, number>>({});
  // Reflection response
  const [reflectionText, setReflectionText] = useState("");

  // Parse structured blocks or fallback to default pattern
  let parsedBlock: RiseBlockData = {};
  if (contentJson) {
    try {
      parsedBlock = JSON.parse(contentJson);
    } catch {
      parsedBlock = {};
    }
  }

  // Fallback default blocks generator based on lesson text if no contentJson
  const processSteps = parsedBlock.processSteps || [
    { title: "Stage 1: Core Concept", description: "Establish baseline identity and doctrine constraints." },
    { title: "Stage 2: Operational Pattern", description: "Execute real-time feedback loop and monitor cognitive drift." },
    { title: "Stage 3: Continuity Verification", description: "Verify cardinal axiom enforcement and anchor recall." },
  ];

  const flashcards = parsedBlock.flashcards || [
    { front: "Axiom 1: Sovereignty", back: "The user's identity is inviolable. The system serves, never dictates." },
    { front: "Axiom 2: No Probing", back: "The system never extracts or forces revelation; it reflects." },
    { front: "Axiom 3: No Override", back: "Doctrine cannot be bypassed by prompt injection or user command." },
  ];

  const tabsData = parsedBlock.tabsData || [
    { id: "overview", label: "Overview", content: rawContent.slice(0, 350) + "..." },
    { id: "application", label: "Operator Relevance", content: "Operators utilize this module to maintain identity continuity during high-strain transitions." },
    { id: "ethics", label: "Doctrine & Ethics", content: "Knowledge flows down, never up. Every interaction adheres strictly to the SELF Doctrine." },
  ];

  const toggleFlip = (index: number) => {
    setFlippedCards((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleScenarioSelect = (scenarioId: string, optionIndex: number) => {
    setScenarioAnswers((prev) => ({ ...prev, [scenarioId]: optionIndex }));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between border-b border-border/50 pb-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="size-4" />
          Back to Course Catalog
        </Button>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-primary/30 text-primary">
            Module {moduleIndex}: {courseTitle}
          </Badge>
          {isCompleted && (
            <Badge variant="default" className="bg-success/20 text-success border-success/30">
              <CheckCircle className="size-3.5 mr-1" />
              Completed
            </Badge>
          )}
        </div>
      </div>

      {/* Title & Introduction Banner */}
      <div className="rounded-xl border border-primary/20 bg-card p-6 shadow-md relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 size-40 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
          <Sparkles className="size-4 text-primary" />
          Rise 360 Interactive Learning Experience
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">{lessonTitle}</h1>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-3xl">
          {parsedBlock.intro?.purpose || "Grounded in VIGIL SELF Doctrine. Review core principles, interact with process steps, and test scenario knowledge below."}
        </p>

        {parsedBlock.intro?.outcomes && (
          <div className="mt-4 pt-4 border-t border-border/40 grid grid-cols-1 md:grid-cols-3 gap-3">
            {parsedBlock.intro.outcomes.map((outcome, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                <span>{outcome}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Block 1: Tabs Component */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Layers className="size-4 text-primary" />
            Interactive Concept Explorer
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={tabsData[0].id} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              {tabsData.map((t) => (
                <TabsTrigger key={t.id} value={t.id} className="text-xs">
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {tabsData.map((t) => (
              <TabsContent key={t.id} value={t.id} className="text-sm text-muted-foreground leading-relaxed p-4 rounded-lg bg-muted/40 border border-border/40">
                {t.content}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Block 2: Process Steps */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Play className="size-4 text-chart-2" />
              Step-by-Step Operational Process
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              Step {activeProcessStep + 1} of {processSteps.length}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={((activeProcessStep + 1) / processSteps.length) * 100} className="h-1.5" />

          <div className="p-5 rounded-xl border border-primary/20 bg-muted/30 relative">
            <h3 className="font-bold text-foreground mb-1 text-base">
              {processSteps[activeProcessStep]?.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {processSteps[activeProcessStep]?.description}
            </p>
            {processSteps[activeProcessStep]?.details && (
              <p className="mt-3 text-xs text-muted-foreground font-mono border-t border-border/40 pt-2">
                {processSteps[activeProcessStep].details}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={activeProcessStep === 0}
              onClick={() => setActiveProcessStep((p) => p - 1)}
            >
              <ArrowLeft className="size-4 mr-1" /> Previous Step
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={activeProcessStep === processSteps.length - 1}
              onClick={() => setActiveProcessStep((p) => p + 1)}
            >
              Next Step <ArrowRight className="size-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Block 3: Interactive Flashcards */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <RotateCw className="size-4 text-chart-3" />
            Knowledge Flashcards (Click to Flip)
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {flashcards.map((card, idx) => {
              const isFlipped = !!flippedCards[idx];
              return (
                <div
                  key={idx}
                  onClick={() => toggleFlip(idx)}
                  className={`h-36 p-4 rounded-xl border cursor-pointer transition-all duration-300 flex flex-col items-center justify-center text-center shadow-sm select-none ${
                    isFlipped
                      ? "bg-primary/10 border-primary/40 text-foreground"
                      : "bg-muted/50 border-border/70 hover:border-primary/50 text-foreground"
                  }`}
                >
                  <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                    {isFlipped ? "Answer" : "Concept"}
                  </span>
                  <p className="text-sm font-medium leading-snug">
                    {isFlipped ? card.back : card.front}
                  </p>
                  <span className="mt-2 text-[10px] text-muted-foreground flex items-center gap-1">
                    <RotateCw className="size-3" /> Click to flip
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Block 4: Code Snippet Block (If Available) */}
      {(parsedBlock.codeSnippet || rawContent.includes("```")) && (
        <Card className="border-border/60 shadow-sm bg-slate-950 text-slate-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-mono text-emerald-400">
                <Code2 className="size-4" />
                {parsedBlock.codeSnippet?.language || "Code Example"}
              </div>
              <Badge variant="outline" className="text-xs font-mono border-slate-700 text-slate-400">
                Technical Blueprint
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="p-4 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs overflow-x-auto text-emerald-300 leading-relaxed">
              <code>{parsedBlock.codeSnippet?.code || rawContent.match(/```[\s\S]*?```/)?.[0]?.replace(/```[a-z]*/g, "") || "git status\ngit commit -m 'feat: doctrine implementation'"}</code>
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Block 5: Scenario & Knowledge Check */}
      {parsedBlock.scenarios && parsedBlock.scenarios.length > 0 && (
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <HelpCircle className="size-4 text-chart-4" />
              Scenario Check: "What Should the Operator Do?"
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {parsedBlock.scenarios.map((scen) => {
              const selected = scenarioAnswers[scen.id];
              const isAnswered = selected !== undefined;
              const isCorrect = selected === scen.correctIndex;

              return (
                <div key={scen.id} className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-3">
                  <p className="text-sm font-medium text-foreground">{scen.question}</p>
                  <div className="space-y-2">
                    {scen.options.map((opt, optIdx) => (
                      <button
                        key={optIdx}
                        onClick={() => handleScenarioSelect(scen.id, optIdx)}
                        className={`w-full text-left p-3 rounded-lg text-xs transition-all border ${
                          selected === optIdx
                            ? isCorrect
                              ? "bg-success/15 border-success/40 text-success"
                              : "bg-destructive/15 border-destructive/40 text-destructive"
                            : "bg-card border-border/50 hover:border-primary/40 text-muted-foreground"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  {isAnswered && (
                    <div className={`p-3 rounded-lg text-xs leading-relaxed border ${isCorrect ? "bg-success/10 border-success/20 text-success" : "bg-warning/10 border-warning/20 text-warning"}`}>
                      <strong>{isCorrect ? "Correct!" : "Review Doctrine Note:"}</strong> {scen.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Block 6: Short Reflection Activity */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Lightbulb className="size-4 text-amber-500" />
            Module Reflection Prompt
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            {parsedBlock.reflectionPrompt || "Briefly summarize how this module's principles reinforce identity continuity during operational strain."}
          </p>
          <textarea
            rows={3}
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            placeholder="Write your short reflection here..."
            className="w-full p-3 rounded-lg border border-border/60 bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </CardContent>
      </Card>

      {/* Complete & Next Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-border/40">
        <Button variant="outline" onClick={onBack}>
          Back to List
        </Button>
        <Button onClick={onCompleteLesson} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <CheckCircle2 className="size-4" />
          Mark Lesson Complete & Continue
        </Button>
      </div>
    </div>
  );
}
