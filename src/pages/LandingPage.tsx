import {
  BookOpen,
  Eye,
  FileText,
  GraduationCap,
  Lock,
  Shield,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function LandingPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="mx-auto size-20 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
          <Eye className="size-10 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
          VIGIL
        </h1>
        <p className="text-sm text-muted-foreground tracking-[0.3em] uppercase mb-4">
          Veteran Identity Garrison for Intentional Living
        </p>
        <p className="text-muted-foreground max-w-lg mx-auto mb-8 text-sm leading-relaxed">
          A doctrine-driven, sovereign presence system that maintains continuity 
          of identity, purpose, and accountability for veterans navigating 
          military-to-civilian transition. Not therapy. Not a chatbot. A constant presence.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link to="/login">
              <Shield className="size-4 mr-2" />
              Sign In
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/signup">Create Account</Link>
          </Button>
        </div>
      </div>

      {/* Core Principles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-16 max-w-4xl mx-auto w-full">
        {[
          {
            icon: Eye,
            title: "Continuity Anchor Mirror™",
            desc: "Monitors cognitive state across four bands — preserving identity through every transition",
          },
          {
            icon: BookOpen,
            title: "SELF Doctrine",
            desc: "Six pillars named for service members: Structure, Endurance, Legacy, Fortitude, Continuity, Presence",
          },
          {
            icon: FileText,
            title: "Evidence Log",
            desc: "Immutable chain of custody — what is recorded cannot be altered or erased",
          },
          {
            icon: GraduationCap,
            title: "Academy",
            desc: "VIGIL-specific training in doctrine, mirror operations, and the cognitive loop",
          },
        ].map((feature) => (
          <div
            key={feature.title}
            className="p-4 rounded-md border border-border/50 bg-card/50"
          >
            <feature.icon className="size-5 text-primary mb-3" />
            <h3 className="font-medium text-sm mb-1">{feature.title}</h3>
            <p className="text-xs text-muted-foreground">{feature.desc}</p>
          </div>
        ))}
      </div>

      {/* Axioms */}
      <div className="mt-12 max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Lock className="size-4 text-destructive" />
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Immutable Axioms
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {["Sovereignty", "No Probing", "No Override", "Continuity", "Cardinal"].map((axiom) => (
            <span
              key={axiom}
              className="px-3 py-1 text-[10px] font-medium uppercase tracking-wider rounded-full border border-destructive/20 text-destructive/70 bg-destructive/5"
            >
              {axiom}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <p className="text-xs text-muted-foreground/50 mt-16 tracking-wider uppercase">
        VIGIL &bull; Sovereign Presence System &bull; Knowledge Flows Down, Never Up
      </p>
    </div>
  );
}
