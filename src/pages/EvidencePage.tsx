import { useMutation, useQuery } from "convex/react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Filter,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { api } from "../../convex/_generated/api";

const severityStyles: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive border-destructive/20",
  high: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  medium: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  low: "bg-muted text-muted-foreground border-border",
};

const statusStyles: Record<
  string,
  { label: string; icon: React.ReactNode; class: string }
> = {
  active: {
    label: "Active",
    icon: <div className="size-2 rounded-full bg-chart-1" />,
    class: "text-chart-1",
  },
  under_review: {
    label: "Under Review",
    icon: <Clock className="size-3" />,
    class: "text-chart-2",
  },
  validated: {
    label: "Validated",
    icon: <CheckCircle2 className="size-3" />,
    class: "text-success",
  },
  archived: {
    label: "Archived",
    icon: <FileText className="size-3" />,
    class: "text-muted-foreground",
  },
};

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function NewEvidenceDialog() {
  const create = useMutation(api.evidence.create);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [severity, setSeverity] = useState("");
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !title.trim() ||
      !description.trim() ||
      !category ||
      !severity ||
      !source.trim()
    )
      return;
    setLoading(true);
    try {
      await create({
        title: title.trim(),
        description: description.trim(),
        category: category as
          | "identity"
          | "continuity"
          | "doctrine"
          | "operational"
          | "behavioral",
        severity: severity as "low" | "medium" | "high" | "critical",
        source: source.trim(),
      });
      setTitle("");
      setDescription("");
      setCategory("");
      setSeverity("");
      setSource("");
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
          New Entry
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Evidence</DialogTitle>
          <DialogDescription>
            Add a new entry to the evidence chain. All entries maintain
            immutable custody.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Evidence title..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="identity">Identity</SelectItem>
                  <SelectItem value="continuity">Continuity</SelectItem>
                  <SelectItem value="doctrine">Doctrine</SelectItem>
                  <SelectItem value="operational">Operational</SelectItem>
                  <SelectItem value="behavioral">Behavioral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Severity</Label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Source</Label>
            <Input
              value={source}
              onChange={e => setSource(e.target.value)}
              placeholder="Evidence source..."
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detailed description..."
              rows={4}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={
              !title.trim() ||
              !description.trim() ||
              !category ||
              !severity ||
              !source.trim() ||
              loading
            }
          >
            {loading ? (
              <RefreshCw className="size-4 mr-2 animate-spin" />
            ) : null}
            Record Evidence
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EvidencePage() {
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const entries = useQuery(
    api.evidence.list,
    filterCategory && filterCategory !== "all"
      ? {
          category: filterCategory as
            | "identity"
            | "continuity"
            | "doctrine"
            | "operational"
            | "behavioral",
        }
      : {},
  );
  const updateStatus = useMutation(api.evidence.updateStatus);

  if (entries === undefined) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Loading evidence...
      </div>
    );
  }

  const filtered = searchQuery
    ? entries.filter(
        e =>
          e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.source.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : entries;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Evidence Log</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Immutable chain of custody • {entries.length} entries
          </p>
        </div>
        <NewEvidenceDialog />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search evidence..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-40">
            <Filter className="size-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="identity">Identity</SelectItem>
            <SelectItem value="continuity">Continuity</SelectItem>
            <SelectItem value="doctrine">Doctrine</SelectItem>
            <SelectItem value="operational">Operational</SelectItem>
            <SelectItem value="behavioral">Behavioral</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Evidence Table */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="size-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {searchQuery
                ? "No evidence matches your search."
                : "No evidence entries yet. Create one to begin."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs uppercase tracking-wider">
                    Title
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">
                    Category
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">
                    Severity
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">
                    Source
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">
                    Date
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(entry => {
                  const status = statusStyles[entry.status];
                  return (
                    <TableRow key={entry._id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{entry.title}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {entry.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="text-[10px] uppercase"
                        >
                          {entry.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] uppercase ${severityStyles[entry.severity]}`}
                        >
                          {entry.severity === "critical" && (
                            <AlertTriangle className="size-3 mr-1" />
                          )}
                          {entry.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div
                          className={`flex items-center gap-1.5 text-xs ${status.class}`}
                        >
                          {status.icon}
                          {status.label}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {entry.source}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(entry.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={entry.status}
                          onValueChange={newStatus =>
                            updateStatus({
                              entryId: entry._id,
                              status: newStatus as
                                | "active"
                                | "archived"
                                | "under_review"
                                | "validated",
                            })
                          }
                        >
                          <SelectTrigger className="h-7 text-xs w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="under_review">Review</SelectItem>
                            <SelectItem value="validated">Validate</SelectItem>
                            <SelectItem value="archived">Archive</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
