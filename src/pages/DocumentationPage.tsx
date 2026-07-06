import { useMutation, useQuery } from "convex/react";
import {
  BookOpen,
  ChevronRight,
  FileText,
  GraduationCap,
  Plus,
  ScrollText,
  Shield,
  Wrench,
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
import {
  Dialog,
  DialogContent,
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
import type { Id } from "../../convex/_generated/dataModel";

const categoryLabels: Record<string, string> = {
  founder_doctrine: "Founder Doctrine",
  technical: "Technical Documentation",
  architecture: "Architecture",
  validation_reports: "Validation Reports",
  academy_handbook: "Academy Handbook",
  instructor_manual: "Instructor Manual",
  student_workbook: "Student Workbook",
  release_notes: "Release Notes",
};

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  founder_doctrine: Shield,
  technical: Wrench,
  architecture: FileText,
  validation_reports: ScrollText,
  academy_handbook: GraduationCap,
  instructor_manual: BookOpen,
  student_workbook: BookOpen,
  release_notes: FileText,
};

export function DocumentationPage() {
  const [selectedId, setSelectedId] = useState<Id<"documents"> | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [newDocOpen, setNewDocOpen] = useState(false);
  const [newDoc, setNewDoc] = useState({ title: "", content: "", category: "technical", version: "1.0" });

  const documents = useQuery(api.docs.listDocuments, categoryFilter ? { category: categoryFilter } : {});
  const stats = useQuery(api.docs.getStats);
  const selectedDoc = useQuery(api.docs.getDocument, selectedId ? { documentId: selectedId } : "skip");
  const createDocument = useMutation(api.docs.createDocument);

  const handleCreate = async () => {
    await createDocument({
      title: newDoc.title,
      content: newDoc.content,
      category: newDoc.category as "technical",
      version: newDoc.version,
    });
    setNewDoc({ title: "", content: "", category: "technical", version: "1.0" });
    setNewDocOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Documentation</h1>
          <p className="text-muted-foreground text-sm">
            Founder doctrine, technical docs, handbooks, and release notes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {stats && (
            <Badge variant="outline" className="text-xs">
              {stats.total} documents
            </Badge>
          )}
          <Dialog open={newDocOpen} onOpenChange={setNewDocOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="size-4" /> New Document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Document</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={newDoc.title}
                    onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                    placeholder="Document title..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Category</Label>
                    <Select value={newDoc.category} onValueChange={(v) => setNewDoc({ ...newDoc, category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryLabels).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Version</Label>
                    <Input
                      value={newDoc.version}
                      onChange={(e) => setNewDoc({ ...newDoc, version: e.target.value })}
                      placeholder="1.0"
                    />
                  </div>
                </div>
                <div>
                  <Label>Content</Label>
                  <Textarea
                    value={newDoc.content}
                    onChange={(e) => setNewDoc({ ...newDoc, content: e.target.value })}
                    placeholder="Document content..."
                    rows={8}
                  />
                </div>
                <Button onClick={handleCreate} disabled={!newDoc.title || !newDoc.content}>
                  Create Document
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 flex-wrap">
        <Button variant={categoryFilter === "" ? "default" : "outline"} size="sm" className="text-xs" onClick={() => setCategoryFilter("")}>
          All
        </Button>
        {Object.entries(categoryLabels).map(([k, v]) => (
          <Button key={k} variant={categoryFilter === k ? "default" : "outline"} size="sm" className="text-xs" onClick={() => setCategoryFilter(k)}>
            {v}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document List */}
        <div className="space-y-2">
          {documents === undefined ? (
            <p className="text-xs text-muted-foreground">Loading...</p>
          ) : documents.length === 0 ? (
            <Card className="vigil-border">
              <CardContent className="py-8 text-center">
                <FileText className="size-8 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground">No documents yet. Seed platform data from Dashboard.</p>
              </CardContent>
            </Card>
          ) : (
            documents.map((doc) => {
              const Icon = categoryIcons[doc.category] || FileText;
              return (
                <Card
                  key={doc._id}
                  className={`vigil-border cursor-pointer transition-all hover:border-primary/30 ${selectedId === doc._id ? "border-primary/50 bg-primary/5" : ""}`}
                  onClick={() => setSelectedId(doc._id)}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    <Icon className="size-5 text-muted-foreground/50 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-[8px]">
                          {categoryLabels[doc.category]}
                        </Badge>
                        <span className="text-[9px] text-muted-foreground">v{doc.version}</span>
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground/30 shrink-0" />
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Document Viewer */}
        <div className="lg:col-span-2">
          {selectedDoc ? (
            <Card className="vigil-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[9px]">
                    {categoryLabels[selectedDoc.category]}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">v{selectedDoc.version}</span>
                </div>
                <CardTitle className="text-lg">{selectedDoc.title}</CardTitle>
                <CardDescription className="text-xs">
                  Last updated: {new Date(selectedDoc.updatedAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm prose-invert max-w-none">
                  {selectedDoc.content.split("\n").map((line, i) => (
                    <p key={i} className={`text-sm mb-2 ${line.startsWith("•") ? "pl-4" : ""}`}>
                      {line}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="vigil-border">
              <CardContent className="py-20 text-center">
                <BookOpen className="size-12 mx-auto text-muted-foreground/20 mb-4" />
                <p className="text-muted-foreground">Select a document to read.</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Living documentation for the VIGIL platform.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
