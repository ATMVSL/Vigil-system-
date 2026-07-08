import { useMutation, useQuery } from "convex/react";
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Eye,
  GraduationCap,
  Shield,
  Star,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "../../convex/_generated/api";

const roleColors: Record<string, string> = {
  founder: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  superadmin: "bg-destructive/10 text-destructive border-destructive/20",
  admin: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  certified: "bg-success/10 text-success border-success/20",
  operator: "bg-muted text-muted-foreground border-border",
};

const cognitiveStateColor: Record<string, string> = {
  stable: "text-success",
  strain: "text-chart-2",
  drift: "text-chart-5",
  critical: "text-destructive",
};

export function AdminPage() {
  const users = useQuery(api.admin.listUsers);
  const health = useQuery(api.admin.getSystemHealth);
  const myProfile = useQuery(api.roles.getMyProfile);
  const setRole = useMutation(api.roles.setUserRole);
  const canManageRoles =
    myProfile?.role === "founder" || myProfile?.role === "superadmin";

  if (users === undefined) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Loading admin...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Administration</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          System management and operator oversight
        </p>
      </div>

      {/* System Status */}
      {health && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div
                  className={`rounded-md p-2 ${
                    health.systemStatus === "operational"
                      ? "bg-success/10"
                      : "bg-destructive/10"
                  }`}
                >
                  {health.systemStatus === "operational" ? (
                    <CheckCircle2 className="size-5 text-success" />
                  ) : (
                    <AlertTriangle className="size-5 text-destructive" />
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    System
                  </p>
                  <p className="font-bold uppercase text-sm">
                    {health.systemStatus}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-md p-2 bg-primary/10">
                  <Shield className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Compliance
                  </p>
                  <p className="font-bold text-lg">
                    {health.avgDoctrineCompliance}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-md p-2 bg-primary/10">
                  <Eye className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Mirrors
                  </p>
                  <p className="font-bold text-lg">{health.totalMirrors}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {health.baselineEstablished} baseline established
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-md p-2 bg-muted">
                  <Users className="size-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Operators
                  </p>
                  <p className="font-bold text-lg">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cognitive State Distribution */}
      {health && health.totalMirrors > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wider">
              Cognitive State Distribution
            </CardTitle>
            <CardDescription>
              Current state band across all active mirrors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3">
              {(["stable", "strain", "drift", "critical"] as const).map(
                state => {
                  const count = health.stateDistribution[state] || 0;
                  const total = health.totalMirrors;
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div
                      key={state}
                      className="p-3 rounded-md border border-border/50 text-center"
                    >
                      <p
                        className={`text-xs font-bold uppercase tracking-wider ${cognitiveStateColor[state]}`}
                      >
                        {state}
                      </p>
                      <p className="text-2xl font-bold mt-1">{count}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {pct}%
                      </p>
                    </div>
                  );
                },
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold uppercase tracking-wider">
            Registered Operators
          </CardTitle>
          <CardDescription>All operators in the system</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {users.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="size-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No operators registered yet.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs uppercase tracking-wider">
                    Operator
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">
                    Email
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">
                    Role
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">
                    Courses
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">
                    State Band
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">
                    Callsign
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="size-8 rounded-md bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">
                            {user.name?.charAt(0).toUpperCase() || "U"}
                          </span>
                        </div>
                        <span className="font-medium text-sm">
                          {user.name || "Unknown"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.email || "—"}
                    </TableCell>
                    <TableCell>
                      {canManageRoles && user.role !== "founder" ? (
                        <Select
                          value={user.role}
                          onValueChange={val =>
                            setRole({
                              targetUserId: user._id,
                              role: val as
                                | "operator"
                                | "certified"
                                | "admin"
                                | "superadmin",
                            })
                          }
                        >
                          <SelectTrigger className="h-7 w-28 text-[10px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="operator">Operator</SelectItem>
                            <SelectItem value="certified">Certified</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="superadmin">
                              Superadmin
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge
                          variant="outline"
                          className={`text-[10px] uppercase ${roleColors[user.role] || ""}`}
                        >
                          {user.role === "founder" && (
                            <Star className="size-3 mr-1" />
                          )}
                          {user.role}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <GraduationCap className="size-3.5 text-muted-foreground" />
                        <span className="text-xs">{user.completedCourses}</span>
                        {user.certificationVerified && (
                          <Award className="size-3 text-chart-4" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.cognitiveState ? (
                        <Badge
                          variant="outline"
                          className={`text-[10px] uppercase ${cognitiveStateColor[user.cognitiveState]}`}
                        >
                          {user.cognitiveState}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm font-mono">
                      {user.mirrorCallsign || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
