import { useMutation } from "convex/react";
import {
  Activity,
  CheckCircle2,
  Gauge,
  RefreshCw,
  ShieldAlert,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { OfflineStorageManager } from "@/lib/offlineStorage";
import { DEFAULT_OPERATOR_LIMITS, QuotaManager } from "@/lib/quotaManager";
import { api } from "../../convex/_generated/api";

export function OfflineSyncIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingReflections, setPendingReflections] = useState(
    OfflineStorageManager.getOfflineReflections(),
  );
  const [quotaStatus, setQuotaStatus] = useState(QuotaManager.checkCapStatus());
  const [quotaUsage, setQuotaUsage] = useState(QuotaManager.getUsage());
  const [isSyncing, setIsSyncing] = useState(false);

  const createReflection = useMutation(api.mirrors.createReflection);

  const handleSync = useCallback(async () => {
    const pending = OfflineStorageManager.getOfflineReflections();
    if (pending.length === 0 || !navigator.onLine) return;

    setIsSyncing(true);
    const syncedIds: string[] = [];

    for (const r of pending) {
      try {
        await createReflection({
          title: "Offline Reflection Sync",
          content: r.content,
          pillar: r.pillar as any,
          cognitiveState: r.cognitiveState as any,
        });
        syncedIds.push(r.id);
      } catch (e) {
        console.error("Failed to sync reflection:", e);
      }
    }

    if (syncedIds.length > 0) {
      OfflineStorageManager.markReflectionsSynced(syncedIds);
      setPendingReflections(OfflineStorageManager.getOfflineReflections());
    }
    setIsSyncing(false);
  }, [createReflection]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      handleSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const interval = setInterval(() => {
      setQuotaStatus(QuotaManager.checkCapStatus());
      setQuotaUsage(QuotaManager.getUsage());
      setPendingReflections(OfflineStorageManager.getOfflineReflections());
    }, 5000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, [handleSync]);

  return (
    <Card className="border-border/60 bg-card shadow-sm mb-4">
      <CardContent className="p-3 md:p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          {/* Network & Cache Status */}
          <div className="flex items-center gap-3">
            <Badge
              variant={isOnline ? "default" : "destructive"}
              className="gap-1.5 font-mono text-xs px-2.5 py-1"
            >
              {isOnline ? (
                <>
                  <Wifi className="size-3 text-emerald-400" /> ONLINE
                </>
              ) : (
                <>
                  <WifiOff className="size-3 text-destructive" /> OFFLINE MODE
                </>
              )}
            </Badge>

            {pendingReflections.length > 0 && (
              <Badge
                variant="outline"
                className="gap-1 text-xs border-amber-500/40 text-amber-500 font-mono"
              >
                <RefreshCw
                  className={`size-3 ${isSyncing ? "animate-spin" : ""}`}
                />
                {pendingReflections.length} Pending Sync
              </Badge>
            )}

            {!quotaStatus.canUseAI && (
              <Badge
                variant="outline"
                className="gap-1 text-xs border-destructive/40 text-destructive font-mono"
              >
                <ShieldAlert className="size-3" /> CAP REACHED
              </Badge>
            )}
          </div>

          {/* Sync & Refresh Button */}
          {isOnline && pendingReflections.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleSync}
              disabled={isSyncing}
              className="gap-2 text-xs"
            >
              <RefreshCw
                className={`size-3 ${isSyncing ? "animate-spin" : ""}`}
              />
              {isSyncing ? "Syncing..." : "Sync Offline Data"}
            </Button>
          )}
        </div>

        {/* Measurable Caps & Resource Quota Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 pt-3 border-t border-border/40 text-xs">
          <div>
            <div className="flex justify-between text-muted-foreground mb-1">
              <span className="flex items-center gap-1 font-mono">
                <Gauge className="size-3 text-primary" /> Daily Reflections
              </span>
              <span>
                {quotaUsage.reflectionsToday} /{" "}
                {DEFAULT_OPERATOR_LIMITS.maxReflectionsPerDay}
              </span>
            </div>
            <Progress value={quotaStatus.reflectionPercent} className="h-1" />
          </div>

          <div>
            <div className="flex justify-between text-muted-foreground mb-1">
              <span className="flex items-center gap-1 font-mono">
                <Activity className="size-3 text-chart-2" /> AI Token Cap
              </span>
              <span>
                {Math.round(quotaUsage.tokensToday / 1000)}k /{" "}
                {Math.round(DEFAULT_OPERATOR_LIMITS.maxTokensPerDay / 1000)}k
              </span>
            </div>
            <Progress value={quotaStatus.tokenPercent} className="h-1" />
          </div>

          <div>
            <div className="flex justify-between text-muted-foreground mb-1">
              <span className="flex items-center gap-1 font-mono">
                <CheckCircle2 className="size-3 text-chart-4" /> Voice Session
                Limit
              </span>
              <span>
                {quotaUsage.voiceMinutesToday}m /{" "}
                {DEFAULT_OPERATOR_LIMITS.maxVoiceMinutesPerDay}m
              </span>
            </div>
            <Progress value={quotaStatus.voicePercent} className="h-1" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
