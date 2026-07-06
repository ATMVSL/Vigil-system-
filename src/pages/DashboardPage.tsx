import { useMutation, useQuery } from "convex/react";
import {
  Activity,
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Eye,
  FileText,
  GraduationCap,
  Shield,
  Star,
} from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
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

const moduleIcons: Record<string, React.ReactNode> = {
  mirror: <Eye className="size-3.5" />,
  doctrine: <BookOpen className="size-3.5" />,
  evidence: <FileText className="size-3.5" />,
  academy: <GraduationCap className="size-3.5" />,
  admin: <Shield className="size-3.5" />,
  system: <Activity className="size-3.5" />,
};

function formatTime(ts: number) {
  const diff = Date.now() - ts;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(ts).toLocaleDateString();
}

export function DashboardPage() {
  const user = useQuery(api.auth.currentUser);
  const stats = useQuery(api.dashboard.getStats);
  const activity = useQuery(api.dashboard.getRecentActivity);
  const health = useQuery(api.admin.getSystemHealth);
  const profile = useQuery(api.roles.getMyProfile);
  const seedDoctrine = useMutation(api.admin.seedDoctrineData);
  const seedPlatform = useMutation(api.admin.seedPlatformData);
  const seedContent = useMutation(api.seedContent.seedTrainingContent);
  const seedLegal = useMutation(api.admin.seedLegalDocs);
  const initProfile = useMutation(api.roles.initProfile);

  useEffect(() => {
    if (!stats) return;
    if (stats.doctrine.total === 0) {
      // First visit: seed everything
      seedDoctrine().then(() => seedPlatform()).then(() => seedContent()).then(() => seedLegal()).catch(() => {});
    } else {
      // Doctrine exists but lessons may not — seed content separately
      seedContent().catch(() => {});
    }
  }, [stats, seedDoctrine, seedPlatform, seedContent, seedLegal]);

  useEffect(() => {
    // Auto-init profile on first login
    if (profile?.needsInit) {
      initProfile().catch(() => {});
    }
  }, [profile, initProfile]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Command Center
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-muted-foreground text-sm">
              Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}. System status overview.
            </p>
            {profile && !profile.needsInit && (
              <Badge
                variant="outline"
                className={`text-[10px] uppercase ${
                  profile.role === "founder"
                    ? "bg-chart-4/10 text-chart-4 border-chart-4/20"
                    : profile.role === "superadmin"
                    ? "bg-destructive/10 text-destructive border-destructive/20"
                    : profile.role === "admin"
                    ? "bg-chart-2/10 text-chart-2 border-chart-2/20"
                    : profile.role === "certified"
                    ? "bg-success/10 text-success border-success/20"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {profile.role === "founder" && <Star className="size-3 mr-1" />}
                {profile.role}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium ${
              health?.systemStatus === "operational"
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {health?.systemStatus === "operational" ? (
              <CheckCircle2 className="size-3.5" />
            ) : (
              <AlertTriangle className="size-3.5" />
            )}
            {health?.systemStatus === "operational" ? "OPERATIONAL" : "ALERT"}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="vigil-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Active Mirrors
            </CardTitle>
            <Eye className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">
              {stats?.mirrors.active ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              of {stats?.mirrors.total ?? 0} total
            </p>
          </CardContent>
        </Card>

        <Card className="vigil-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Doctrine Articles
            </CardTitle>
            <BookOpen className="size-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">
              {stats?.doctrine.active ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              active principles
            </p>
          </CardContent>
        </Card>

        <Card className="vigil-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Evidence Entries
            </CardTitle>
            <FileText className="size-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">
              {stats?.evidence.active ?? 0}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {(stats?.evidence.critical ?? 0) > 0 && (
                <span className="text-xs font-medium text-destructive">
                  {stats?.evidence.critical} critical
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                {stats?.evidence.total ?? 0} total
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="vigil-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Academy
            </CardTitle>
            <GraduationCap className="size-4 text-chart-5" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">
              {stats?.academy.courses ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              courses • {stats?.academy.enrollments ?? 0} enrollments
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wider">
              Quick Actions
            </CardTitle>
            <CardDescription>Common operations</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {[
              { label: "Open Mirror", href: "/mirror", icon: Eye, desc: "View your continuity profile" },
              { label: "View Doctrine", href: "/doctrine", icon: BookOpen, desc: "Review active principles" },
              { label: "Evidence Log", href: "/evidence", icon: FileText, desc: "Track and record evidence" },
              { label: "Academy", href: "/academy", icon: GraduationCap, desc: "Training and certification" },
            ].map((action) => (
              <Button
                key={action.label}
                variant="outline"
                className="justify-start h-auto py-3 px-3 group"
                asChild
              >
                <Link to={action.href}>
                  <div className="rounded-md bg-muted p-1.5 mr-3 transition-colors group-hover:bg-primary/10">
                    <action.icon className="size-4 transition-colors group-hover:text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium">{action.label}</div>
                    <div className="text-xs text-muted-foreground">{action.desc}</div>
                  </div>
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wider">
              Activity Feed
            </CardTitle>
            <CardDescription>Recent system activity</CardDescription>
          </CardHeader>
          <CardContent>
            {!activity || activity.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No activity yet. Start by creating your mirror.
              </p>
            ) : (
              <div className="space-y-3">
                {activity.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0"
                  >
                    <div className="rounded-md bg-muted p-1.5 mt-0.5">
                      {moduleIcons[item.module] || <Activity className="size-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{item.action}</p>
                      {item.details && (
                        <p className="text-xs text-muted-foreground truncate">
                          {item.details}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{item.userName}</span>
                        <span className="text-xs text-muted-foreground/50">•</span>
                        <span className="text-xs text-muted-foreground">{formatTime(item.createdAt)}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {item.module}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      {health && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wider">
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-3 p-3 rounded-md bg-muted/50">
                <Shield className="size-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Doctrine Compliance</p>
                  <p className="text-xl font-bold">{health.avgDoctrineCompliance}%</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-md bg-muted/50">
                <AlertTriangle className={`size-5 ${health.criticalAlerts > 0 ? "text-destructive" : "text-success"}`} />
                <div>
                  <p className="text-sm font-medium">Critical Alerts</p>
                  <p className="text-xl font-bold">{health.criticalAlerts}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-md bg-muted/50">
                <FileText className="size-5 text-chart-2" />
                <div>
                  <p className="text-sm font-medium">Pending Reviews</p>
                  <p className="text-xl font-bold">{health.pendingReviews}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
