import { useMutation, useQuery } from "convex/react";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Code2,
  FileText,
  GraduationCap,
  Server,
  Target,
  Trophy,
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
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

const certTypeLabels: Record<string, string> = {
  sql: "SQL Certification",
  infrastructure: "Infrastructure Certification",
  mirror_operator: "Mirror Operator",
  peer_support: "Peer Support",
  vigil_operator: "VIGIL Operator",
  vigil_instructor: "VIGIL Instructor",
};

const certStatusColors: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  expired: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  revoked: "bg-destructive/10 text-destructive border-destructive/20",
};

export function CertificationPage() {
  const [selectedExamId, setSelectedExamId] = useState<Id<"exams"> | null>(
    null,
  );
  const [answers, setAnswers] = useState<number[]>([]);
  const [examResult, setExamResult] = useState<{
    score: number;
    passed: boolean;
    correct: number;
    total: number;
  } | null>(null);

  const progress = useQuery(api.certification.getProgress);
  const certs = useQuery(api.certification.getMyCertifications);
  const exams = useQuery(api.certification.listExams);
  const examAttempts = useQuery(api.certification.getMyExamAttempts);
  const submitExam = useMutation(api.certification.submitExam);

  const selectedExam = exams?.find(e => e._id === selectedExamId);
  const passedExamIds = new Set(
    examAttempts?.filter(a => a.passed).map(a => a.examId) || [],
  );

  const handleStartExam = (examId: Id<"exams">) => {
    const exam = exams?.find(e => e._id === examId);
    if (!exam) return;
    const questions = JSON.parse(exam.questions);
    setSelectedExamId(examId);
    setAnswers(new Array(questions.length).fill(-1));
    setExamResult(null);
  };

  const handleSubmitExam = async () => {
    if (!selectedExamId) return;
    const result = await submitExam({
      examId: selectedExamId,
      answers: JSON.stringify(answers),
    });
    setExamResult(result);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Certification</h1>
        <p className="text-muted-foreground text-sm">
          Track your progress, take exams, and earn digital certificates.
        </p>
      </div>

      {/* Progress Overview */}
      {progress && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: "Courses Completed",
              value: progress.completedCourses,
              icon: BookOpen,
              color: "text-chart-2",
            },
            {
              label: "Active Certs",
              value: progress.activeCerts,
              icon: Award,
              color: "text-chart-4",
            },
            {
              label: "Exams Passed",
              value: progress.examsPassed,
              icon: CheckCircle2,
              color: "text-success",
            },
            {
              label: "SQL Challenges",
              value: progress.sqlPassed,
              icon: Code2,
              color: "text-chart-3",
            },
            {
              label: "Infra Completed",
              value: progress.infraCompleted,
              icon: Server,
              color: "text-primary",
            },
            {
              label: "Reviews Passed",
              value: progress.passedReviews,
              icon: FileText,
              color: "text-chart-5",
            },
            {
              label: "Total Certs",
              value: progress.totalCerts,
              icon: Trophy,
              color: "text-chart-4",
            },
            {
              label: "Enrollments",
              value: progress.totalEnrollments,
              icon: GraduationCap,
              color: "text-muted-foreground",
            },
          ].map(stat => (
            <Card key={stat.label} className="vigil-border">
              <CardContent className="p-3 flex items-center gap-3">
                <stat.icon className={`size-5 ${stat.color} shrink-0`} />
                <div>
                  <p className="text-lg font-bold">{stat.value}</p>
                  <p className="text-[9px] text-muted-foreground uppercase">
                    {stat.label}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Digital Certificates */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Digital Certificates
          </h2>
          {certs === undefined ? (
            <p className="text-xs text-muted-foreground">Loading...</p>
          ) : certs.length === 0 ? (
            <Card className="vigil-border">
              <CardContent className="py-8 text-center">
                <Award className="size-10 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  No certificates yet.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Complete courses and pass exams to earn certifications.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {certs.map(cert => (
                <Card key={cert._id} className="vigil-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Award className="size-8 text-chart-4" />
                        <div>
                          <p className="font-medium text-sm">
                            {certTypeLabels[cert.type] || cert.type}
                          </p>
                          <p className="font-mono text-[10px] text-muted-foreground">
                            {cert.certificateNumber}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[9px] uppercase ${certStatusColors[cert.status]}`}
                      >
                        {cert.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
                      <span>
                        Issued: {new Date(cert.issuedAt).toLocaleDateString()}
                      </span>
                      <span>
                        Expires: {new Date(cert.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Exams */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Available Exams
          </h2>
          {exams === undefined ? (
            <p className="text-xs text-muted-foreground">Loading...</p>
          ) : exams.length === 0 ? (
            <Card className="vigil-border">
              <CardContent className="py-8 text-center">
                <Target className="size-10 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  No exams available yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {exams.map(exam => (
                <Card
                  key={exam._id}
                  className={`vigil-border ${selectedExamId === exam._id ? "border-primary/50" : ""}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {passedExamIds.has(exam._id) && (
                          <CheckCircle2 className="size-4 text-success" />
                        )}
                        <h3 className="font-medium text-sm">{exam.title}</h3>
                      </div>
                      <Badge variant="outline" className="text-[9px]">
                        Pass: {exam.passingScore}%
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {exam.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" /> {exam.timeLimitMinutes}
                          min
                        </span>
                        <span>
                          {JSON.parse(exam.questions).length} questions
                        </span>
                        <span>Max {exam.maxAttempts} attempts</span>
                      </div>
                      <Button
                        size="sm"
                        className="h-6 text-[10px] px-3"
                        onClick={() => handleStartExam(exam._id)}
                      >
                        {passedExamIds.has(exam._id) ? "Retake" : "Start"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Exam Modal */}
      {selectedExam && !examResult && (
        <Card className="vigil-border border-primary/30">
          <CardHeader>
            <CardTitle className="text-base">{selectedExam.title}</CardTitle>
            <CardDescription>
              Answer all questions. {selectedExam.passingScore}% required to
              pass.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {JSON.parse(selectedExam.questions).map(
              (q: { q: string; options: string[] }, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded-md border border-border/30"
                >
                  <p className="text-sm font-medium mb-2">
                    {idx + 1}. {q.q}
                  </p>
                  <div className="space-y-1">
                    {q.options.map((opt: string, optIdx: number) => (
                      <button
                        key={optIdx}
                        className={`w-full text-left p-2 rounded text-xs transition-all ${
                          answers[idx] === optIdx
                            ? "bg-primary/10 border-primary/30 border"
                            : "hover:bg-muted/50 border border-transparent"
                        }`}
                        onClick={() => {
                          const newAnswers = [...answers];
                          newAnswers[idx] = optIdx;
                          setAnswers(newAnswers);
                        }}
                      >
                        {String.fromCharCode(65 + optIdx)}. {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ),
            )}
            <div className="flex gap-2">
              <Button
                onClick={handleSubmitExam}
                disabled={answers.includes(-1)}
              >
                Submit Exam
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedExamId(null);
                  setExamResult(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exam Result */}
      {examResult && (
        <Card
          className={`vigil-border ${examResult.passed ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"}`}
        >
          <CardContent className="py-6 text-center">
            {examResult.passed ? (
              <Trophy className="size-12 mx-auto text-chart-4 mb-3" />
            ) : (
              <Target className="size-12 mx-auto text-destructive mb-3" />
            )}
            <h3 className="text-xl font-bold mb-1">
              {examResult.passed ? "Exam Passed!" : "Exam Failed"}
            </h3>
            <p className="text-lg mb-2">Score: {examResult.score}%</p>
            <p className="text-xs text-muted-foreground">
              {examResult.correct}/{examResult.total} questions correct
            </p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => {
                setSelectedExamId(null);
                setExamResult(null);
              }}
            >
              Close
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
