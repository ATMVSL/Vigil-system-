import { useQuery } from "convex/react";
import {
  Activity,
  CheckCircle,
  Cpu,
  Eye,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { api } from "../../convex/_generated/api";

export function LearningEngineWidget() {
  const mirror = useQuery(api.mirrors.getMyMirror);
  const status = useQuery(
    api.learningEngine.getLearningPipelineStatus,
    mirror ? { mirrorId: mirror._id } : "skip",
  );
  const drift = useQuery(
    api.learningEngine.detectDrift,
    mirror ? { mirrorId: mirror._id } : "skip",
  );

  const reflectionCount = status?.reflectionCount ?? 0;
  const baselineEstablished = status?.baselineEstablished ?? false;
  const driftIndex = drift?.driftIndex ?? 0;
  const driftStatus = drift?.status ?? "baseline_establishing";

  return (
    <Card className="border-border/60 bg-card/40 backdrop-blur">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="size-4 text-primary" />
            <CardTitle className="text-sm font-semibold">
              VIGIL Learning Engine™ (Zero-Drift Pipeline)
            </CardTitle>
          </div>
          <Badge
            variant="outline"
            className={`text-[10px] uppercase font-mono ${
              baselineEstablished
                ? "bg-success/10 text-success border-success/20"
                : "bg-chart-2/10 text-chart-2 border-chart-2/20"
            }`}
          >
            {baselineEstablished ? "Baseline Active" : "Establishing Baseline"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 4-Stage Pipeline Visualizer */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {/* Stage 1: Capture */}
          <div className="p-2.5 rounded-lg border border-border/50 bg-muted/20 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
              <span>1. Capture</span>
              <Eye className="size-3 text-primary" />
            </div>
            <div className="text-xs font-semibold">
              {reflectionCount}/3 Reflections
            </div>
            <Progress
              value={Math.min(100, (reflectionCount / 3) * 100)}
              className="h-1"
            />
          </div>

          {/* Stage 2: Scramble */}
          <div className="p-2.5 rounded-lg border border-border/50 bg-muted/20 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
              <span>2. Scramble</span>
              <Lock className="size-3 text-accent-foreground" />
            </div>
            <div className="text-xs font-semibold">PII Masked</div>
            <div className="text-[10px] font-mono text-muted-foreground truncate">
              SHA-256 Verified
            </div>
          </div>

          {/* Stage 3: Verify */}
          <div className="p-2.5 rounded-lg border border-border/50 bg-muted/20 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
              <span>3. Verify</span>
              <ShieldCheck className="size-3 text-success" />
            </div>
            <div className="text-xs font-semibold">Axiom Audit</div>
            <div className="text-[10px] text-muted-foreground">
              0 Doctrine Rewrite
            </div>
          </div>

          {/* Stage 4: Apply */}
          <div className="p-2.5 rounded-lg border border-border/50 bg-muted/20 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
              <span>4. Apply</span>
              <CheckCircle className="size-3 text-primary" />
            </div>
            <div className="text-xs font-semibold">Sovereign Intel</div>
            <div className="text-[10px] text-muted-foreground">
              Per-User Guarded
            </div>
          </div>
        </div>

        {/* Drift & Stability Meter */}
        <div className="flex items-center justify-between pt-1 text-xs border-t border-border/40">
          <div className="flex items-center gap-2">
            <Activity className="size-3.5 text-muted-foreground" />
            <span className="text-muted-foreground font-medium">
              Cognitive Drift Index:
            </span>
            <span className="font-semibold font-mono">{driftIndex}%</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[11px] capitalize">
            <span
              className={`size-2 rounded-full ${
                driftStatus === "stable"
                  ? "bg-success"
                  : driftStatus === "critical"
                    ? "bg-destructive animate-pulse"
                    : "bg-chart-2"
              }`}
            />
            {driftStatus.replace("_", " ")}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
