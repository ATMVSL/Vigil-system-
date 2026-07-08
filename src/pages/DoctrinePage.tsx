import { useMutation, useQuery } from "convex/react";
import {
  Anchor,
  BookOpen,
  ChevronDown,
  Flame,
  Heart,
  Lock,
  Mountain,
  Plus,
  RefreshCw,
  Shield,
  Star,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "../../convex/_generated/api";

const sectionLabels: Record<
  string,
  { label: string; subtitle: string; icon: React.ReactNode; color: string }
> = {
  axiom: {
    label: "Immutable Axioms",
    subtitle: "Sovereign. Inviolable.",
    icon: <Lock className="size-4" />,
    color: "text-destructive",
  },
  structure: {
    label: "Structure",
    subtitle: "SPC Gonzales",
    icon: <Shield className="size-4" />,
    color: "text-chart-1",
  },
  endurance: {
    label: "Endurance",
    subtitle: "SPC Hargis",
    icon: <Mountain className="size-4" />,
    color: "text-chart-3",
  },
  legacy: {
    label: "Legacy",
    subtitle: "SPC Shaw",
    icon: <Star className="size-4" />,
    color: "text-chart-2",
  },
  fortitude: {
    label: "Fortitude",
    subtitle: "SGT Stampley",
    icon: <Flame className="size-4" />,
    color: "text-chart-5",
  },
  continuity_pillar: {
    label: "Continuity",
    subtitle: "SPC Luna",
    icon: <Anchor className="size-4" />,
    color: "text-chart-4",
  },
  presence: {
    label: "Presence",
    subtitle: "SGT Walker",
    icon: <Heart className="size-4" />,
    color: "text-primary",
  },
};

const priorityStyles: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive border-destructive/20",
  standard: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  advisory: "bg-muted text-muted-foreground border-border",
};

function NewDoctrineDialog() {
  const create = useMutation(api.doctrine.create);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [section, setSection] = useState("");
  const [priority, setPriority] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !section || !priority) return;
    setLoading(true);
    try {
      await create({
        title: title.trim(),
        content: content.trim(),
        section: section as
          | "axiom"
          | "structure"
          | "endurance"
          | "legacy"
          | "fortitude"
          | "continuity_pillar"
          | "presence",
        priority: priority as "critical" | "standard" | "advisory",
      });
      setTitle("");
      setContent("");
      setSection("");
      setPriority("");
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="size-4 mr-1.5" />
          New Article
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Doctrine Article</DialogTitle>
          <DialogDescription>
            Add a new principle to the SELF Doctrine framework.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Article title..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Section</Label>
              <Select value={section} onValueChange={setSection}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="axiom">Immutable Axiom</SelectItem>
                  <SelectItem value="structure">
                    Structure (SPC Gonzales)
                  </SelectItem>
                  <SelectItem value="endurance">
                    Endurance (SPC Hargis)
                  </SelectItem>
                  <SelectItem value="legacy">Legacy (SPC Shaw)</SelectItem>
                  <SelectItem value="fortitude">
                    Fortitude (SGT Stampley)
                  </SelectItem>
                  <SelectItem value="continuity_pillar">
                    Continuity (SPC Luna)
                  </SelectItem>
                  <SelectItem value="presence">
                    Presence (SGT Walker)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="advisory">Advisory</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Content</Label>
            <Textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Doctrine content..."
              rows={5}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={
              !title.trim() ||
              !content.trim() ||
              !section ||
              !priority ||
              loading
            }
          >
            {loading ? (
              <RefreshCw className="size-4 mr-2 animate-spin" />
            ) : null}
            Create Article
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DoctrinePage() {
  const articles = useQuery(api.doctrine.list, {});
  const [activeSection, setActiveSection] = useState<string | null>(null);

  if (articles === undefined) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Loading doctrine...
      </div>
    );
  }

  // Group articles by section
  const grouped = articles.reduce<Record<string, typeof articles>>(
    (acc, article) => {
      if (!acc[article.section]) acc[article.section] = [];
      acc[article.section].push(article);
      return acc;
    },
    {},
  );

  const sectionOrder = [
    "axiom",
    "structure",
    "endurance",
    "legacy",
    "fortitude",
    "continuity_pillar",
    "presence",
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">SELF Doctrine</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Governing principles for intentional living • {articles.length}{" "}
            articles
          </p>
        </div>
        <NewDoctrineDialog />
      </div>

      {/* SELF acronym banner */}
      <Card className="vigil-border bg-primary/5">
        <CardContent className="py-4">
          <div className="flex items-center gap-3 mb-2">
            <Users className="size-5 text-primary" />
            <p className="text-sm font-semibold tracking-wide uppercase">
              S.E.L.F. — Structure · Endurance · Legacy · Fortitude
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Each pillar is named for a service member. Together with Continuity
            and Presence, they form the doctrine that governs VIGIL's approach
            to veteran identity preservation.
          </p>
        </CardContent>
      </Card>

      {/* Section overview */}
      <div className="grid gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {sectionOrder.map(section => {
          const info = sectionLabels[section];
          const count = grouped[section]?.length ?? 0;
          return (
            <button
              key={section}
              onClick={() =>
                setActiveSection(activeSection === section ? null : section)
              }
              className={`flex flex-col gap-1 p-3 rounded-md border transition-colors text-left ${
                activeSection === section
                  ? "border-primary/40 bg-primary/5"
                  : "border-border hover:border-primary/20 hover:bg-muted/50"
              }`}
            >
              <span className={info.color}>{info.icon}</span>
              <p className="text-xs font-medium">{info.label}</p>
              <p className="text-[10px] text-muted-foreground">
                {info.subtitle}
              </p>
              <p className="text-lg font-bold">{count}</p>
            </button>
          );
        })}
      </div>

      {/* Articles */}
      <div className="space-y-3">
        {sectionOrder.map(section => {
          const sectionArticles = grouped[section] || [];
          if (sectionArticles.length === 0) return null;
          if (activeSection && activeSection !== section) return null;

          const info = sectionLabels[section];
          return (
            <div key={section}>
              <div className="flex items-center gap-2 mb-3">
                <span className={info.color}>{info.icon}</span>
                <h2 className="text-sm font-semibold uppercase tracking-wider">
                  {info.label}
                </h2>
                {info.subtitle !== "Sovereign. Inviolable." && (
                  <span className="text-xs text-muted-foreground">
                    — {info.subtitle}
                  </span>
                )}
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="space-y-2">
                {sectionArticles.map(article => (
                  <Collapsible key={article._id}>
                    <Card>
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <CardTitle className="text-sm font-medium">
                                {article.title}
                              </CardTitle>
                              <Badge
                                variant="outline"
                                className={`text-[10px] uppercase ${priorityStyles[article.priority]}`}
                              >
                                {article.priority}
                              </Badge>
                              <Badge variant="outline" className="text-[10px]">
                                v{article.version}
                              </Badge>
                            </div>
                            <ChevronDown className="size-4 text-muted-foreground transition-transform [[data-state=open]_&]:rotate-180" />
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="pt-0 pb-4">
                          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                            {article.content}
                          </p>
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {articles.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="size-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No doctrine articles yet. The SELF Doctrine will be seeded on
              first load.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
