import { useMutation, useQuery } from "convex/react";
import {
  MessageSquare,
  Pin,
  Plus,
  Send,
  Users,
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
  general: "General",
  peer_support: "Peer Support",
  study_group: "Study Group",
  doctrine_discussion: "Doctrine Discussion",
  technical_help: "Technical Help",
  announcements: "Announcements",
};

const categoryColors: Record<string, string> = {
  general: "bg-muted text-muted-foreground",
  peer_support: "bg-chart-2/10 text-chart-2",
  study_group: "bg-chart-3/10 text-chart-3",
  doctrine_discussion: "bg-primary/10 text-primary",
  technical_help: "bg-chart-4/10 text-chart-4",
  announcements: "bg-destructive/10 text-destructive",
};

export function CommunityPage() {
  const [filter, setFilter] = useState<string>("");
  const [selectedPostId, setSelectedPostId] = useState<Id<"communityPosts"> | null>(null);
  const [newPostOpen, setNewPostOpen] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "", category: "general" });
  const [replyContent, setReplyContent] = useState("");

  const posts = useQuery(api.community.listPosts, filter ? { category: filter } : {});
  const selectedPost = useQuery(
    api.community.getPost,
    selectedPostId ? { postId: selectedPostId } : "skip"
  );
  const createPost = useMutation(api.community.createPost);
  const createReply = useMutation(api.community.createReply);
  const togglePin = useMutation(api.community.togglePin);

  const handleCreatePost = async () => {
    await createPost({
      title: newPost.title,
      content: newPost.content,
      category: newPost.category as "general",
    });
    setNewPost({ title: "", content: "", category: "general" });
    setNewPostOpen(false);
  };

  const handleReply = async () => {
    if (!selectedPostId || !replyContent.trim()) return;
    await createReply({ postId: selectedPostId, content: replyContent });
    setReplyContent("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Community</h1>
          <p className="text-muted-foreground text-sm">
            Peer support, study groups, and doctrine discussions.
          </p>
        </div>
        <Dialog open={newPostOpen} onOpenChange={setNewPostOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="size-4" /> New Post
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  placeholder="Post title..."
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={newPost.category} onValueChange={(v) => setNewPost({ ...newPost, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Content</Label>
                <Textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder="Share your thoughts..."
                  rows={4}
                />
              </div>
              <Button onClick={handleCreatePost} disabled={!newPost.title || !newPost.content}>
                Post
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filter === "" ? "default" : "outline"}
          size="sm"
          className="text-xs"
          onClick={() => setFilter("")}
        >
          All
        </Button>
        {Object.entries(categoryLabels).map(([k, v]) => (
          <Button
            key={k}
            variant={filter === k ? "default" : "outline"}
            size="sm"
            className="text-xs"
            onClick={() => setFilter(k)}
          >
            {v}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Posts List */}
        <div className="lg:col-span-2 space-y-3">
          {posts === undefined ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : posts.length === 0 ? (
            <Card className="vigil-border">
              <CardContent className="py-12 text-center">
                <Users className="size-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">No posts yet. Start a conversation.</p>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card
                key={post._id}
                className={`vigil-border cursor-pointer transition-all hover:border-primary/30 ${selectedPostId === post._id ? "border-primary/50 bg-primary/5" : ""}`}
                onClick={() => setSelectedPostId(post._id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {post.isPinned && <Pin className="size-3 text-chart-4" />}
                        <h3 className="font-medium text-sm truncate">{post.title}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{post.content}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] text-muted-foreground">{post.userName}</span>
                        <Badge variant="outline" className={`text-[9px] ${categoryColors[post.category]}`}>
                          {categoryLabels[post.category]}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <MessageSquare className="size-3" /> {post.replyCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Post Detail / Replies */}
        <div>
          {selectedPost ? (
            <Card className="vigil-border sticky top-4">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={`text-[9px] ${categoryColors[selectedPost.category]}`}>
                    {categoryLabels[selectedPost.category]}
                  </Badge>
                  <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => togglePin({ postId: selectedPost._id })}>
                    <Pin className="size-3 mr-1" /> {selectedPost.isPinned ? "Unpin" : "Pin"}
                  </Button>
                </div>
                <CardTitle className="text-base">{selectedPost.title}</CardTitle>
                <CardDescription className="text-xs">
                  by {selectedPost.userName} · {new Date(selectedPost.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm whitespace-pre-wrap">{selectedPost.content}</p>

                {/* Replies */}
                <div className="border-t border-border/30 pt-3 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Replies ({selectedPost.replies.length})
                  </p>
                  {selectedPost.replies.map((reply) => (
                    <div key={reply._id} className="bg-muted/30 rounded-md p-3">
                      <p className="text-xs">{reply.content}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {reply.userName} · {new Date(reply.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Write a reply..."
                      className="text-xs h-8"
                      onKeyDown={(e) => e.key === "Enter" && handleReply()}
                    />
                    <Button size="sm" className="h-8" onClick={handleReply} disabled={!replyContent.trim()}>
                      <Send className="size-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="vigil-border">
              <CardContent className="py-12 text-center">
                <MessageSquare className="size-8 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-xs text-muted-foreground">Select a post to view details and replies.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
