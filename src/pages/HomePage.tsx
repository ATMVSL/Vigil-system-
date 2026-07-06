import { useQuery } from "convex/react";
import {
  Activity,
  Award,
  BookOpen,
  Code2,
  Eye,
  FileText,
  GraduationCap,
  Server,
  Shield,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "../../convex/_generated/api";

const quickActions = [
  { href: "/mirror", label: "Mirror System", desc: "Your continuity anchor", icon: Eye, color: "text-primary" },
  { href: "/academy", label: "Academy", desc: "Training curriculum", icon: GraduationCap, color: "text-chart-2" },
  { href: "/sql-lab", label: "SQL Lab", desc: "Practice queries", icon: Code2, color: "text-chart-3" },
  { href: "/infra-lab", label: "Infra Lab", desc: "Deploy & secure", icon: Server, color: "text-chart-4" },
  { href: "/training", label: "Training", desc: "Mirror simulations", icon: Activity, color: "text-success" },
  { href: "/community", label: "Community", desc: "Peer support", icon: Users, color: "text-chart-5" },
  { href: "/certification", label: "Certification", desc: "Track progress", icon: Award, color: "text-destructive" },
  { href: "/doctrine", label: "Doctrine", desc: "SELF pillars", icon: BookOpen, color: "text-primary" },
  { href: "/evidence", label: "Evidence", desc: "Chain of custody", icon: FileText, color: "text-muted-foreground" },
  { href: "/documentation", label: "Documentation", desc: "Manuals & guides", icon: Shield, color: "text-chart-2" },
];

export function HomePage() {
  const user = useQuery(api.auth.currentUser);
  const profile = useQuery(api.roles.getMyProfile);

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-muted-foreground">
          Veteran Identity Garrison for Intentional Living — Your platform, your presence, your continuity.
        </p>
        {profile && !profile.needsInit && (
          <Badge
            variant="outline"
            className="text-xs uppercase mt-1"
          >
            {profile.role}
          </Badge>
        )}
      </div>

      {/* SELF Doctrine Banner */}
      <Card className="vigil-border bg-primary/5">
        <CardContent className="py-4">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="size-5 text-primary" />
            <span className="text-sm font-semibold uppercase tracking-wider">SELF Doctrine</span>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {[
              { letter: "S", word: "Structure", name: "SPC Gonzales" },
              { letter: "E", word: "Endurance", name: "SPC Hargis" },
              { letter: "L", word: "Legacy", name: "SPC Shaw" },
              { letter: "F", word: "Fortitude", name: "SGT Stampley" },
              { letter: "", word: "Continuity", name: "SPC Luna" },
              { letter: "", word: "Presence", name: "SGT Walker" },
            ].map((p) => (
              <div key={p.word} className="text-center p-2 rounded-md bg-background/50 border border-border/30">
                <p className="text-xs font-bold text-primary">{p.word}</p>
                <p className="text-[9px] text-muted-foreground">{p.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          Platform Modules
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {quickActions.map((action) => (
            <Link key={action.href} to={action.href}>
              <Card className="vigil-border hover:border-primary/40 transition-all cursor-pointer h-full">
                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                  <action.icon className={`size-6 ${action.color}`} />
                  <p className="text-sm font-medium">{action.label}</p>
                  <p className="text-[10px] text-muted-foreground">{action.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Design Principles */}
      <Card className="vigil-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider">
            Design Principles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              "User Sovereignty", "Continuity", "Mirror Isolation", "Governance",
              "Accountability", "Transparency", "Auditability", "Privacy-First",
            ].map((p) => (
              <div key={p} className="text-center p-2 rounded-md border border-border/30 bg-background/30">
                <p className="text-xs font-medium">{p}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center py-4 border-t border-border/30">
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/50">
          Knowledge flows down, never up
        </p>
      </div>
    </div>
  );
}
