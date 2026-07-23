import { useAction, useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  Award,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code2,
  Eye,
  FileText,
  GraduationCap,
  HelpCircle,
  RefreshCw,
  Server,
  Shield,
  Square,
  Star,
  Users,
  Volume2,
} from "lucide-react";
import { useRef, useState } from "react";
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
import { RiseCoursePlayer } from "@/components/RiseCoursePlayer";

const categoryIcons: Record<string, React.ReactNode> = {
  self_doctrine: <Users className="size-5" />,
  mirror_operations: <Eye className="size-5" />,
  cognitive_loop: <Brain className="size-5" />,
  sql_training: <Code2 className="size-5" />,
  infrastructure: <Server className="size-5" />,
  certification: <Award className="size-5" />,
};

const categoryColors: Record<string, string> = {
  self_doctrine: "text-chart-1",
  mirror_operations: "text-primary",
  cognitive_loop: "text-chart-3",
  sql_training: "text-chart-2",
  infrastructure: "text-chart-5",
  certification: "text-chart-4",
};

const difficultyStyles: Record<string, string> = {
  beginner: "bg-success/10 text-success border-success/20",
  intermediate: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  advanced: "bg-chart-4/10 text-chart-4 border-chart-4/20",
};

const typeIcons: Record<string, React.ReactNode> = {
  lecture: <BookOpen className="size-4" />,
  lab: <Code2 className="size-4" />,
  assessment: <FileText className="size-4" />,
  simulation: <Eye className="size-4" />,
  practical: <Server className="size-4" />,
};

const roleProgression = [
  { role: "operator", label: "Operator", desc: "Basic access" },
  { role: "certified", label: "Certified", desc: "Pass VIGIL Certification" },
  { role: "admin", label: "Admin", desc: "Complete all courses" },
  { role: "superadmin", label: "Superadmin", desc: "Full verified completion" },
];

// ─── ASSESSMENT QUIZ COMPONENT ───
// Parses assessment content into interactive questions with hidden answers

interface QuizQuestion {
  question: string;
  correctAnswer: string;
  section?: string;
}

function parseAssessmentContent(content: string): {
  intro: string;
  questions: QuizQuestion[];
} {
  const lines = content.split("\n");
  const questions: QuizQuestion[] = [];
  let intro = "";
  let currentSection = "";
  let i = 0;

  // Collect intro until first numbered question
  while (i < lines.length) {
    const line = lines[i].trim();
    if (/^\d+\./.test(line)) break;
    if (line.startsWith("SECTION") || line.startsWith("PART")) {
      currentSection = line;
      i++;
      // Skip next line if it's a description
      if (i < lines.length && !lines[i].trim().startsWith("1.")) {
        currentSection += ` — ${lines[i].trim()}`;
        i++;
      }
      continue;
    }
    intro += `${line}\n`;
    i++;
  }

  // Parse numbered questions
  while (i < lines.length) {
    const line = lines[i].trim();
    if (line.startsWith("SECTION") || line.startsWith("PART")) {
      currentSection = line;
      i++;
      if (i < lines.length && !/^\d+\./.test(lines[i].trim())) {
        currentSection += ` — ${lines[i].trim()}`;
        i++;
      }
      continue;
    }
    const qMatch = line.match(/^(\d+)\.\s+(.+)/);
    if (qMatch) {
      const questionText = qMatch[2];
      let answer = "";
      // Look for answer on next lines (→ prefix)
      i++;
      while (i < lines.length) {
        const nextLine = lines[i].trim();
        if (nextLine.startsWith("→") || nextLine.startsWith("->")) {
          answer = nextLine.replace(/^[→\->]+\s*/, "").trim();
          i++;
          break;
        } else if (
          nextLine === "" ||
          /^\d+\./.test(nextLine) ||
          nextLine.startsWith("SECTION") ||
          nextLine.startsWith("PART") ||
          nextLine.startsWith("Review")
        ) {
          break;
        } else {
          // Additional context for the question
          i++;
        }
      }
      if (answer) {
        questions.push({
          question: questionText,
          correctAnswer: answer,
          section: currentSection,
        });
      }
    } else {
      i++;
    }
  }

  return { intro: intro.trim(), questions };
}

function LessonVoiceButton({ text }: { text: string }) {
  const generateSpeech = useAction(api.ai.generateSpeech);
  const voicePreference = useQuery(api.ai.getVoicePreference);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlay = async () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setPlaying(false);
      return;
    }

    setLoading(true);
    try {
      const voice = voicePreference === "male" ? "onyx" : "nova";
      // Clean text for TTS — remove formatting chars
      const cleaned = text
        .replace(/[•✗✓→]/g, "")
        .replace(/\n+/g, ". ")
        .replace(/\s+/g, " ")
        .trim();
      const result = await generateSpeech({
        text: cleaned,
        voice: voice as "onyx",
      });
      if (result.audio) {
        const audio = new Audio(`data:audio/mp3;base64,${result.audio}`);
        audioRef.current = audio;
        setPlaying(true);
        audio.play();
        audio.onended = () => {
          setPlaying(false);
          audioRef.current = null;
        };
      }
    } catch {
      // Voice unavailable — silently fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2 text-xs shrink-0"
      onClick={handlePlay}
      disabled={loading}
    >
      {loading ? (
        <RefreshCw className="size-3 animate-spin" />
      ) : playing ? (
        <Square className="size-3" />
      ) : (
        <Volume2 className="size-3" />
      )}
      {loading ? "Loading..." : playing ? "Stop" : "Listen"}
    </Button>
  );
}

function AssessmentQuiz({ content }: { content: string }) {
  const { intro, questions } = parseAssessmentContent(content);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [aiFeedback, setAiFeedback] = useState<
    Record<
      number,
      { correct: boolean; feedback: string; correctAnswer?: string }
    >
  >({});
  const [gradingIdx, setGradingIdx] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const gradeAssessment = useAction(api.ai.gradeAssessment);

  const totalRevealed = Object.keys(revealed).length;
  const totalCorrect = Object.entries(aiFeedback).filter(
    ([, fb]) => fb.correct,
  ).length;

  const handleGrade = async (idx: number) => {
    const q = questions[idx];
    const answer = userAnswers[idx]?.trim();
    if (!q || !answer) return;

    setGradingIdx(idx);
    setRevealed(prev => ({ ...prev, [idx]: true }));

    try {
      const result = await gradeAssessment({
        question: q.question,
        userAnswer: answer,
        expectedAnswer: q.correctAnswer,
      });
      setAiFeedback(prev => ({
        ...prev,
        [idx]: {
          correct: result.correct,
          feedback: result.feedback,
          correctAnswer: result.correctAnswer || q.correctAnswer,
        },
      }));
    } catch {
      // Fallback to simple matching
      const isCorrect =
        q.correctAnswer.toLowerCase().includes(answer.toLowerCase()) &&
        answer.length > 2;
      setAiFeedback(prev => ({
        ...prev,
        [idx]: {
          correct: isCorrect,
          feedback: isCorrect
            ? "Correct!"
            : "Review the expected answer below.",
          correctAnswer: q.correctAnswer,
        },
      }));
    } finally {
      setGradingIdx(null);
    }
  };

  if (questions.length === 0) {
    // Fallback to regular content display if parsing fails
    return (
      <div className="prose prose-sm prose-invert max-w-none">
        {content.split("\n").map((line, i) => {
          if (line.trim() === "") return <div key={i} className="h-2" />;
          return (
            <p key={i} className="text-sm mb-2 text-foreground/90">
              {line}
            </p>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Intro */}
      {intro && (
        <div className="p-4 rounded-md border border-chart-4/20 bg-chart-4/5">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="size-4 text-chart-4" />
            <span className="text-xs font-semibold uppercase text-chart-4">
              Assessment
            </span>
          </div>
          <p className="text-sm text-foreground/80">{intro}</p>
        </div>
      )}

      {/* Score */}
      {totalRevealed > 0 && (
        <div className="flex items-center justify-between p-3 rounded-md border border-primary/20 bg-primary/5">
          <span className="text-sm font-medium">
            Progress: {totalRevealed}/{questions.length} answered
          </span>
          <Badge variant="outline" className="text-xs">
            Score: {totalCorrect}/{totalRevealed} correct
          </Badge>
        </div>
      )}

      {/* Questions */}
      {questions.map((q, idx) => {
        const prevSection = idx > 0 ? questions[idx - 1].section : "";
        const showSectionHeader = q.section && q.section !== prevSection;
        const isRevealed = revealed[idx] || showAll;

        return (
          <div key={idx}>
            {showSectionHeader && (
              <h4 className="text-sm font-bold text-primary mt-6 mb-3">
                {q.section}
              </h4>
            )}
            <div
              className={`p-4 rounded-md border transition-all ${
                isRevealed
                  ? "border-success/20 bg-success/5"
                  : "border-border/30 hover:border-primary/30"
              }`}
            >
              <p className="text-sm font-medium mb-3">
                <span className="text-primary font-bold mr-2">{idx + 1}.</span>
                {q.question}
              </p>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={userAnswers[idx] || ""}
                  onChange={e =>
                    setUserAnswers(prev => ({ ...prev, [idx]: e.target.value }))
                  }
                  placeholder="Type your answer..."
                  className="flex-1 bg-muted/30 border border-border/30 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-primary/50"
                  disabled={isRevealed}
                />
                {!isRevealed && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs shrink-0"
                    disabled={gradingIdx === idx || !userAnswers[idx]?.trim()}
                    onClick={() => handleGrade(idx)}
                  >
                    {gradingIdx === idx ? "Grading..." : "Check"}
                  </Button>
                )}
              </div>

              {isRevealed && aiFeedback[idx] && (
                <div
                  className={`mt-3 p-3 rounded ${aiFeedback[idx].correct ? "bg-success/10 border border-success/20" : "bg-chart-4/10 border border-chart-4/20"}`}
                >
                  <div className="flex items-start gap-2">
                    {aiFeedback[idx].correct ? (
                      <CheckCircle2 className="size-4 text-success mt-0.5 shrink-0" />
                    ) : (
                      <HelpCircle className="size-4 text-chart-4 mt-0.5 shrink-0" />
                    )}
                    <div>
                      <p className="text-xs mb-1">{aiFeedback[idx].feedback}</p>
                      <p className="text-[10px] text-muted-foreground uppercase mt-1">
                        Expected Answer
                      </p>
                      <p className="text-sm font-medium text-success">
                        {aiFeedback[idx].correctAnswer || q.correctAnswer}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Show All / Reset */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "Hide Answers" : "Reveal All Answers"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setUserAnswers({});
            setRevealed({});
            setShowAll(false);
          }}
        >
          Reset Quiz
        </Button>
      </div>
    </div>
  );
}

export function AcademyPage() {
  const [selectedCourse, setSelectedCourse] = useState<Id<"courses"> | null>(
    null,
  );
  const [selectedLessonIdx, setSelectedLessonIdx] = useState<number | null>(
    null,
  );

  const courses = useQuery(api.academy.listCourses, {});
  const enrollments = useQuery(api.academy.getMyEnrollments);
  const profile = useQuery(api.roles.getMyProfile);
  const lessons = useQuery(
    api.instructor.getLessons,
    selectedCourse ? { courseId: selectedCourse } : "skip",
  );
  const enroll = useMutation(api.academy.enroll);
  const updateProgress = useMutation(api.academy.updateProgress);
  const checkPromotion = useMutation(api.roles.checkRolePromotion);

  if (courses === undefined) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Loading academy...
      </div>
    );
  }

  const enrolledCourseIds = new Set(enrollments?.map(e => e.courseId) || []);
  const currentRole = profile?.role || "operator";
  const currentRoleIdx = roleProgression.findIndex(r => r.role === currentRole);
  const completedCount =
    enrollments?.filter(
      e => e.status === "completed" || e.status === "certified",
    ).length || 0;
  const selectedCourseData = courses.find(c => c._id === selectedCourse);
  const selectedLesson =
    selectedLessonIdx !== null && lessons ? lessons[selectedLessonIdx] : null;

  // ─── LESSON READER VIEW (RISE 360 INTERACTIVE PLAYER) ───
  if (selectedLesson && selectedCourseData) {
    const enrollment = enrollments?.find((e) => e.courseId === selectedCourse);

    return (
      <RiseCoursePlayer
        lessonTitle={selectedLesson.title}
        moduleIndex={selectedLesson.moduleIndex || selectedLesson.order || 1}
        courseTitle={selectedCourseData.title}
        rawContent={selectedLesson.content}
        contentJson={(selectedLesson as any).contentJson}
        onBack={() => setSelectedLessonIdx(null)}
        isCompleted={enrollment?.progress === 100}
        onCompleteLesson={async () => {
          if (enrollment) {
            const nextProgress = Math.min(100, enrollment.progress + 20);
            await updateProgress({
              enrollmentId: enrollment._id,
              progress: nextProgress,
            });
            if (nextProgress >= 100) await checkPromotion();
          }
          if (lessons && selectedLessonIdx !== null && selectedLessonIdx < lessons.length - 1) {
            setSelectedLessonIdx(selectedLessonIdx + 1);
          } else {
            setSelectedLessonIdx(null);
          }
        }}
      />
    );
  }

  // ─── COURSE LESSONS VIEW ───
  if (selectedCourse && selectedCourseData) {
    const enrollment = enrollments?.find(e => e.courseId === selectedCourse);
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-xs"
            onClick={() => setSelectedCourse(null)}
          >
            <ArrowLeft className="size-3" /> Back to Academy
          </Button>
        </div>
        <Card className="vigil-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={categoryColors[selectedCourseData.category]}>
                  {categoryIcons[selectedCourseData.category] || (
                    <BookOpen className="size-5" />
                  )}
                </span>
                <div>
                  <CardTitle className="text-lg">
                    {selectedCourseData.title}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {selectedCourseData.description}
                  </CardDescription>
                </div>
              </div>
              <Badge
                variant="outline"
                className={`text-[10px] uppercase ${difficultyStyles[selectedCourseData.difficulty]}`}
              >
                {selectedCourseData.difficulty}
              </Badge>
            </div>
            {enrollment && (
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Course Progress</span>
                  <span className="font-medium">{enrollment.progress}%</span>
                </div>
                <Progress value={enrollment.progress} className="h-1.5" />
              </div>
            )}
          </CardHeader>
        </Card>

        <h3 className="text-sm font-semibold uppercase tracking-wider">
          Lessons ({lessons?.length || 0})
        </h3>

        {lessons === undefined ? (
          <p className="text-xs text-muted-foreground">Loading lessons...</p>
        ) : lessons.length === 0 ? (
          <Card className="vigil-border">
            <CardContent className="py-8 text-center">
              <BookOpen className="size-8 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-xs text-muted-foreground">
                Lessons loading... Visit Dashboard to seed content.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {lessons.map((lesson, idx) => (
              <Card
                key={lesson._id}
                className="vigil-border cursor-pointer transition-all hover:border-primary/30"
                onClick={() => setSelectedLessonIdx(idx)}
              >
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="flex items-center justify-center size-8 rounded-md bg-muted text-muted-foreground/70 text-xs font-bold shrink-0">
                    {lesson.order}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground/60 shrink-0">
                    {typeIcons[lesson.type] || <BookOpen className="size-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{lesson.title}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <Badge variant="outline" className="text-[8px] uppercase">
                        {lesson.type}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="size-2.5" /> {lesson.durationMinutes}{" "}
                        min
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground/30 shrink-0" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!enrollment && (
          <Button
            className="w-full"
            onClick={() => enroll({ courseId: selectedCourse })}
          >
            <Shield className="size-4 mr-2" /> Enroll in This Course
          </Button>
        )}
        {enrollment &&
          enrollment.status !== "completed" &&
          enrollment.status !== "certified" && (
            <Button
              className="w-full"
              variant="outline"
              onClick={async () => {
                const next = Math.min(100, enrollment.progress + 25);
                await updateProgress({
                  enrollmentId: enrollment._id,
                  progress: next,
                });
                if (next >= 100) await checkPromotion();
              }}
            >
              Mark Progress (+25%)
            </Button>
          )}
      </div>
    );
  }

  // ─── MAIN ACADEMY VIEW ───
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Academy</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            VIGIL training, doctrine study, and operator certification
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20">
          <GraduationCap className="size-4 text-primary" />
          <span className="text-xs font-medium text-primary">
            {enrollments?.length || 0} Enrolled
          </span>
        </div>
      </div>

      {/* Role Progression Tracker */}
      <Card className="vigil-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider">
              Role Progression
            </CardTitle>
            <Badge
              variant="outline"
              className={`text-[10px] uppercase ${
                currentRole === "founder"
                  ? "bg-chart-4/10 text-chart-4 border-chart-4/20"
                  : currentRole === "superadmin"
                    ? "bg-destructive/10 text-destructive border-destructive/20"
                    : currentRole === "admin"
                      ? "bg-chart-2/10 text-chart-2 border-chart-2/20"
                      : currentRole === "certified"
                        ? "bg-success/10 text-success border-success/20"
                        : "bg-muted text-muted-foreground"
              }`}
            >
              {currentRole === "founder" && <Star className="size-3 mr-1" />}
              {currentRole}
            </Badge>
          </div>
          <CardDescription>
            Complete courses and certifications to advance. {completedCount}/
            {courses.length} courses completed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1">
            {roleProgression.map((step, idx) => {
              const isActive =
                currentRole === step.role || currentRole === "founder";
              const isPast = currentRole === "founder" || currentRoleIdx > idx;
              return (
                <div key={step.role} className="flex items-center flex-1">
                  <div
                    className={`flex-1 p-2 rounded-md text-center border transition-all ${
                      isActive
                        ? "border-primary/40 bg-primary/10"
                        : isPast
                          ? "border-success/30 bg-success/5"
                          : "border-border/50 opacity-50"
                    }`}
                  >
                    <p
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        isActive
                          ? "text-primary"
                          : isPast
                            ? "text-success"
                            : "text-muted-foreground"
                      }`}
                    >
                      {isPast && !isActive ? "✓ " : ""}
                      {step.label}
                    </p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">
                      {step.desc}
                    </p>
                  </div>
                  {idx < roleProgression.length - 1 && (
                    <ChevronRight className="size-3 text-muted-foreground/30 mx-0.5 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* My Enrollments */}
      {enrollments && enrollments.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-3">
            My Courses
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {enrollments.map(enrollment => (
              <Card
                key={enrollment._id}
                className="vigil-border cursor-pointer transition-all hover:border-primary/30"
                onClick={() => setSelectedCourse(enrollment.courseId)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        categoryColors[enrollment.course?.category || ""]
                      }
                    >
                      {categoryIcons[enrollment.course?.category || ""] || (
                        <BookOpen className="size-5" />
                      )}
                    </span>
                    <CardTitle className="text-sm">
                      {enrollment.course?.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {enrollment.progress}%
                      </span>
                    </div>
                    <Progress value={enrollment.progress} className="h-1.5" />
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      {enrollment.status === "certified" ? (
                        <>
                          <Award className="size-3 text-chart-4" />
                          <span className="text-chart-4">Certified</span>
                        </>
                      ) : enrollment.status === "completed" ? (
                        <>
                          <CheckCircle2 className="size-3 text-success" />
                          <span className="text-success">Completed</span>
                        </>
                      ) : (
                        <>
                          <Clock className="size-3" />
                          <span className="capitalize">
                            {enrollment.status.replace("_", " ")}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available Courses */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-3">
          Course Catalog
        </h2>
        {courses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <GraduationCap className="size-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No courses available yet. Visit Dashboard to seed data.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map(course => {
              const isEnrolled = enrolledCourseIds.has(course._id);
              return (
                <Card
                  key={course._id}
                  className={`cursor-pointer transition-all hover:border-primary/30 ${isEnrolled ? "opacity-75" : ""}`}
                  onClick={() => setSelectedCourse(course._id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div
                        className={`rounded-md p-2 ${categoryColors[course.category]} bg-muted`}
                      >
                        {categoryIcons[course.category] || (
                          <BookOpen className="size-5" />
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] uppercase ${difficultyStyles[course.difficulty]}`}
                      >
                        {course.difficulty}
                      </Badge>
                    </div>
                    <CardTitle className="text-base mt-3">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="text-xs line-clamp-3">
                      {course.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <BookOpen className="size-3" />
                        {course.lessonsCount} lessons
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {course.estimatedHours}h
                      </div>
                    </div>
                    {isEnrolled ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedCourse(course._id);
                        }}
                      >
                        <BookOpen className="size-4 mr-1.5" /> View Lessons
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={e => {
                          e.stopPropagation();
                          enroll({ courseId: course._id });
                        }}
                      >
                        <Shield className="size-4 mr-1.5" /> Enroll
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
