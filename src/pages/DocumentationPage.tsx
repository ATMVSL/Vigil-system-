import { useMutation, useQuery } from "convex/react";
import {
  BookOpen,
  ChevronRight,
  Download,
  File,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Image as ImageIcon,
  Paperclip,
  Plus,
  ScrollText,
  Shield,
  Trash2,
  Upload,
  Wrench,
  X,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
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

const categoryIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  founder_doctrine: Shield,
  technical: Wrench,
  architecture: FileText,
  validation_reports: ScrollText,
  academy_handbook: GraduationCap,
  instructor_manual: BookOpen,
  student_workbook: BookOpen,
  release_notes: FileText,
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(fileType: string | undefined) {
  if (!fileType) return File;
  if (fileType.startsWith("image/")) return ImageIcon;
  if (
    fileType.includes("spreadsheet") ||
    fileType.includes("excel") ||
    fileType.includes("csv")
  )
    return FileSpreadsheet;
  if (fileType.includes("pdf")) return FileText;
  return File;
}

export function DocumentationPage() {
  const [selectedId, setSelectedId] = useState<Id<"documents"> | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [newDocOpen, setNewDocOpen] = useState(false);
  const [newDoc, setNewDoc] = useState({
    title: "",
    content: "",
    category: "technical",
    version: "1.0",
  });
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const documents = useQuery(
    api.docs.listDocuments,
    categoryFilter ? { category: categoryFilter } : {},
  );
  const stats = useQuery(api.docs.getStats);
  const selectedDoc = useQuery(
    api.docs.getDocument,
    selectedId ? { documentId: selectedId } : "skip",
  );
  const myProfile = useQuery(api.roles.getMyProfile);
  const isFounder =
    myProfile && "role" in myProfile && myProfile.role === "founder";
  const createDocument = useMutation(api.docs.createDocument);
  const deleteDocument = useMutation(api.docs.deleteDocument);
  const generateUploadUrl = useMutation(api.docs.generateUploadUrl);

  const handleFileSelect = useCallback(
    (file: File) => {
      setUploadingFile(file);
      // Auto-fill title from filename if empty
      if (!newDoc.title) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        setNewDoc(prev => ({ ...prev, title: nameWithoutExt }));
      }
    },
    [newDoc.title],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleCreate = async () => {
    setIsUploading(true);
    try {
      let fileId: Id<"_storage"> | undefined;
      let fileName: string | undefined;
      let fileType: string | undefined;
      let fileSize: number | undefined;

      // Upload file to Convex storage if one is selected
      if (uploadingFile) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": uploadingFile.type },
          body: uploadingFile,
        });
        const { storageId } = await result.json();
        fileId = storageId;
        fileName = uploadingFile.name;
        fileType = uploadingFile.type;
        fileSize = uploadingFile.size;
      }

      await createDocument({
        title: newDoc.title,
        content:
          newDoc.content ||
          (uploadingFile ? `Uploaded file: ${uploadingFile.name}` : ""),
        category: newDoc.category as "technical",
        version: newDoc.version,
        fileId,
        fileName,
        fileType,
        fileSize,
      });

      setNewDoc({
        title: "",
        content: "",
        category: "technical",
        version: "1.0",
      });
      setUploadingFile(null);
      setNewDocOpen(false);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (docId: Id<"documents">) => {
    if (!confirm("Delete this document?")) return;
    await deleteDocument({ documentId: docId });
    if (selectedId === docId) setSelectedId(null);
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
          {isFounder && (
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
                  {/* File Upload Drop Zone */}
                  <div
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === "Enter" || e.key === " ")
                        fileInputRef.current?.click();
                    }}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                      dragOver
                        ? "border-primary bg-primary/10"
                        : uploadingFile
                          ? "border-primary/40 bg-primary/5"
                          : "border-border/50 hover:border-primary/30 hover:bg-muted/30"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(file);
                      }}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.md,.png,.jpg,.jpeg,.gif,.svg,.mp4,.mp3,.zip,.json,.yaml,.yml"
                    />
                    {uploadingFile ? (
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Paperclip className="size-5 text-primary" />
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {uploadingFile.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(uploadingFile.size)} ·{" "}
                            {uploadingFile.type || "unknown"}
                          </p>
                        </div>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setUploadingFile(null);
                          }}
                          className="p-1.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="size-8 mx-auto text-muted-foreground/40 mb-2" />
                        <p className="text-sm text-muted-foreground">
                          <span className="text-primary font-medium">
                            Click to upload
                          </span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                          PDF, Word, Excel, images, videos, code — any file type
                        </p>
                      </>
                    )}
                  </div>

                  <div>
                    <Label>Title</Label>
                    <Input
                      value={newDoc.title}
                      onChange={e =>
                        setNewDoc({ ...newDoc, title: e.target.value })
                      }
                      placeholder="Document title..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Category</Label>
                      <Select
                        value={newDoc.category}
                        onValueChange={v =>
                          setNewDoc({ ...newDoc, category: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(categoryLabels).map(([k, v]) => (
                            <SelectItem key={k} value={k}>
                              {v}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Version</Label>
                      <Input
                        value={newDoc.version}
                        onChange={e =>
                          setNewDoc({ ...newDoc, version: e.target.value })
                        }
                        placeholder="1.0"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Description / Content</Label>
                    <Textarea
                      value={newDoc.content}
                      onChange={e =>
                        setNewDoc({ ...newDoc, content: e.target.value })
                      }
                      placeholder={
                        uploadingFile
                          ? "Optional description for this file..."
                          : "Document content..."
                      }
                      rows={6}
                    />
                  </div>
                  <Button
                    onClick={handleCreate}
                    disabled={!newDoc.title || isUploading}
                    className="w-full gap-2"
                  >
                    {isUploading ? (
                      <>Uploading...</>
                    ) : uploadingFile ? (
                      <>
                        <Upload className="size-4" /> Upload & Create Document
                      </>
                    ) : (
                      <>Create Document</>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={categoryFilter === "" ? "default" : "outline"}
          size="sm"
          className="text-xs"
          onClick={() => setCategoryFilter("")}
        >
          All
        </Button>
        {Object.entries(categoryLabels).map(([k, v]) => (
          <Button
            key={k}
            variant={categoryFilter === k ? "default" : "outline"}
            size="sm"
            className="text-xs"
            onClick={() => setCategoryFilter(k)}
          >
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
                <p className="text-xs text-muted-foreground">
                  No documents yet.
                </p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">
                  Click "New Document" to upload files or create content.
                </p>
              </CardContent>
            </Card>
          ) : (
            documents.map(doc => {
              const Icon = doc.fileId
                ? getFileIcon(doc.fileType ?? undefined)
                : categoryIcons[doc.category] || FileText;
              return (
                <Card
                  key={doc._id}
                  className={`vigil-border cursor-pointer transition-all hover:border-primary/30 ${selectedId === doc._id ? "border-primary/50 bg-primary/5" : ""}`}
                  onClick={() => setSelectedId(doc._id)}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="size-9 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                      <Icon className="size-4 text-muted-foreground/60" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {doc.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-[8px]">
                          {categoryLabels[doc.category]}
                        </Badge>
                        {doc.fileName && (
                          <span className="text-[8px] text-primary/60 flex items-center gap-0.5">
                            <Paperclip className="size-2.5" />{" "}
                            {doc.fileSize
                              ? formatFileSize(doc.fileSize)
                              : "file"}
                          </span>
                        )}
                        <span className="text-[9px] text-muted-foreground">
                          v{doc.version}
                        </span>
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
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[9px]">
                      {categoryLabels[selectedDoc.category]}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      v{selectedDoc.version}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {selectedDoc.fileUrl && (
                      <a
                        href={selectedDoc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={selectedDoc.fileName}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        <Download className="size-3.5" /> Download
                      </a>
                    )}
                    {isFounder && (
                      <button
                        onClick={() => handleDelete(selectedDoc._id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Delete document"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <CardTitle className="text-lg">{selectedDoc.title}</CardTitle>
                <CardDescription className="text-xs">
                  Last updated:{" "}
                  {new Date(selectedDoc.updatedAt).toLocaleDateString()}
                  {selectedDoc.fileName && (
                    <span className="ml-2 text-primary/60">
                      <Paperclip className="size-3 inline mr-0.5" />
                      {selectedDoc.fileName}
                      {selectedDoc.fileSize
                        ? ` (${formatFileSize(selectedDoc.fileSize)})`
                        : ""}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* File Preview */}
                {selectedDoc.fileUrl &&
                  selectedDoc.fileType?.startsWith("image/") && (
                    <div className="mb-4 rounded-lg overflow-hidden border border-border/30 bg-muted/20">
                      <img
                        src={selectedDoc.fileUrl}
                        alt={selectedDoc.title}
                        className="max-w-full max-h-[500px] object-contain mx-auto"
                      />
                    </div>
                  )}
                {selectedDoc.fileUrl &&
                  selectedDoc.fileType === "application/pdf" && (
                    <div className="mb-4 rounded-lg overflow-hidden border border-border/30">
                      <iframe
                        src={selectedDoc.fileUrl}
                        className="w-full h-[600px]"
                        title={selectedDoc.title}
                      />
                    </div>
                  )}
                {selectedDoc.fileUrl &&
                  selectedDoc.fileType?.startsWith("video/") && (
                    <div className="mb-4 rounded-lg overflow-hidden border border-border/30 bg-black">
                      <video
                        src={selectedDoc.fileUrl}
                        controls
                        className="max-w-full max-h-[500px] mx-auto"
                      >
                        <track kind="captions" />
                      </video>
                    </div>
                  )}
                {selectedDoc.fileUrl &&
                  selectedDoc.fileType?.startsWith("audio/") && (
                    <div className="mb-4 p-4 rounded-lg border border-border/30 bg-muted/20">
                      <audio
                        src={selectedDoc.fileUrl}
                        controls
                        className="w-full"
                      >
                        <track kind="captions" />
                      </audio>
                    </div>
                  )}

                {/* Text Content */}
                <div className="prose prose-sm prose-invert max-w-none">
                  {selectedDoc.content.split("\n").map((line, i) => (
                    <p
                      key={i}
                      className={`text-sm mb-2 ${line.startsWith("•") ? "pl-4" : ""}`}
                    >
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
                <p className="text-muted-foreground">
                  Select a document to read.
                </p>
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
