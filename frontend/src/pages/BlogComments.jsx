import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "../components/ui/alert";
import { Separator } from "../components/ui/separator";
import { 
  MessageCircle, 
  Calendar, 
  User, 
  Reply, 
  Edit3, 
  Trash2, 
  ArrowLeft,
  Send,
  Clock
} from "lucide-react";

export default function BlogComments() {
  const navigate = useNavigate();
  const { blogId } = useParams();
  
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Create comment
  const [commentBody, setCommentBody] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyBody, setReplyBody] = useState("");
  
  // Edit comment
  const [editingId, setEditingId] = useState(null);
  const [editBody, setEditBody] = useState("");

  const loadBlog = async () => {
    setError("");
    try {
      const res = await api.get(`/api/v2/blogs/${blogId}/`);
      setBlog(res.data);
    } catch (e) {
      console.error(e);
      setError("Could not load blog.");
    }
  };

  const loadComments = async () => {
    setError("");
    try {
      const res = await api.get("/api/v2/comments/", {
        params: { blog: blogId }
      });
      setComments(res.data || []);
    } catch (e) {
      console.error(e);
      setError("Could not load comments.");
    }
  };

  useEffect(() => {
    if (blogId) {
      loadBlog();
      loadComments();
    }
  }, [blogId]);

  const createComment = async (e) => {
    e.preventDefault();
    if (!commentBody.trim()) return;

    setLoading(true);
    setError("");
    try {
      const payload = {
        body: commentBody.trim(),
        blog: parseInt(blogId),
      };

      const res = await api.post("/api/v2/comments/", payload);
      setComments((prev) => [res.data, ...prev]);
      setCommentBody("");
    } catch (e) {
      console.error("Create comment failed:", e);
      const msg = e?.response?.data ? JSON.stringify(e.response.data) : "Failed to create comment.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const createReply = async (e) => {
    e.preventDefault();
    if (!replyBody.trim() || !replyingTo) return;

    setLoading(true);
    setError("");
    try {
      const payload = {
        body: replyBody.trim(),
        parent: replyingTo,
      };

      const res = await api.post("/api/v2/comments/", payload);
      setComments((prev) => [res.data, ...prev]);
      setReplyBody("");
      setReplyingTo(null);
    } catch (e) {
      console.error("Create reply failed:", e);
      const msg = e?.response?.data ? JSON.stringify(e.response.data) : "Failed to create reply.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (comment) => {
    setEditingId(comment.id);
    setEditBody(comment.body);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditBody("");
  };

  const saveEdit = async (comment) => {
    if (!editBody.trim()) return;
    
    setError("");
    try {
      const res = await api.patch(`/api/v2/comments/${comment.id}/`, {
        body: editBody.trim(),
      });
      setComments((prev) => prev.map((c) => (c.id === comment.id ? res.data : c)));
      cancelEdit();
    } catch (e) {
      console.error("Update failed:", e);
      const msg = e?.response?.data ? JSON.stringify(e.response.data) : "Failed to update comment.";
      setError(msg);
    }
  };

  const deleteComment = async (commentId) => {
    setError("");
    try {
      await api.delete(`/api/v2/comments/${commentId}/`);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (e) {
      console.error(e);
      setError("Failed to delete comment.");
    }
  };

  const canEdit = (comment) => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const createdAt = new Date(comment.created_on);
    return createdAt >= fiveMinutesAgo;
  };

  const startReply = (commentId) => {
    setReplyingTo(commentId);
    setReplyBody("");
  };

  // Organize comments into top-level and replies
  const topLevelComments = comments.filter(c => c.blog && !c.parent);
  const replies = comments.filter(c => c.parent && !c.blog);

  const getRepliesForComment = (commentId) => {
    return replies.filter(r => r.parent === commentId);
  };

  if (!blog) {
    return (
      <div className="min-h-screen w-full grid place-items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p>Loading blog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-4xl mx-auto p-6">
      <header className="mb-6">
        <Button variant="ghost" onClick={() => navigate("/blogs")} className="mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Blogs
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{blog.title}</CardTitle>
            <CardDescription className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                Author ID: {blog.author}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(blog.created_on).toLocaleDateString()}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
              {blog.body}
            </p>
          </CardContent>
        </Card>
      </header>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription className="break-words">{error}</AlertDescription>
        </Alert>
      )}

      {/* Add Comment Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Add a Comment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={createComment} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="comment">Your comment</Label>
              <textarea
                id="comment"
                placeholder="Share your thoughts..."
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                required
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Posting..." : "Post Comment"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator className="mb-6" />

      {/* Comments List */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          Comments ({topLevelComments.length})
        </h2>
        
        {topLevelComments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <MessageCircle className="h-8 w-8 text-slate-300 mb-2" />
              <p className="text-slate-600">No comments yet. Be the first to comment!</p>
            </CardContent>
          </Card>
        ) : (
          topLevelComments.map((comment) => {
            const commentReplies = getRepliesForComment(comment.id);
            const isEditingComment = editingId === comment.id;
            
            return (
              <div key={comment.id} className="space-y-3">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardDescription className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Author ID: {comment.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(comment.created_on).toLocaleDateString()}
                        </span>
                        {canEdit(comment) && (
                          <span className="flex items-center gap-1 text-green-600">
                            <Clock className="h-3 w-3" />
                            Editable
                          </span>
                        )}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {isEditingComment ? (
                      <div className="grid gap-2">
                        <Label htmlFor={`edit-comment-${comment.id}`}>Edit comment</Label>
                        <textarea
                          id={`edit-comment-${comment.id}`}
                          value={editBody}
                          onChange={(e) => setEditBody(e.target.value)}
                          className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                      </div>
                    ) : (
                      <p className="text-slate-700 whitespace-pre-wrap">{comment.body}</p>
                    )}
                  </CardContent>

                  <CardFooter className="flex gap-2 pt-3">
                    {isEditingComment ? (
                      <>
                        <Button size="sm" onClick={() => saveEdit(comment)}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => startReply(comment.id)}
                        >
                          <Reply className="h-3 w-3" />
                          Reply
                        </Button>
                        {canEdit(comment) && (
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            onClick={() => startEdit(comment)}
                          >
                            <Edit3 className="h-3 w-3" />
                            Edit
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => deleteComment(comment.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </Button>
                      </>
                    )}
                  </CardFooter>
                </Card>

                {/* Reply Form */}
                {replyingTo === comment.id && (
                  <Card className="ml-8 border-l-4 border-l-blue-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Reply to comment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={createReply} className="grid gap-3">
                        <textarea
                          placeholder="Write your reply..."
                          value={replyBody}
                          onChange={(e) => setReplyBody(e.target.value)}
                          className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          required
                        />
                        <div className="flex gap-2">
                          <Button type="submit" size="sm" disabled={loading}>
                            {loading ? "Posting..." : "Post Reply"}
                          </Button>
                          <Button 
                            type="button" 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setReplyingTo(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}

                {/* Replies */}
                {commentReplies.length > 0 && (
                  <div className="ml-8 space-y-3">
                    {commentReplies.map((reply) => {
                      const isEditingReply = editingId === reply.id;
                      
                      return (
                        <Card key={reply.id} className="border-l-4 border-l-slate-200">
                          <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-4 text-xs">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                Author ID: {reply.author}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(reply.created_on).toLocaleDateString()}
                              </span>
                              {canEdit(reply) && (
                                <span className="flex items-center gap-1 text-green-600">
                                  <Clock className="h-3 w-3" />
                                  Editable
                                </span>
                              )}
                            </CardDescription>
                          </CardHeader>
                          
                          <CardContent className="pt-0">
                            {isEditingReply ? (
                              <div className="grid gap-2">
                                <textarea
                                  value={editBody}
                                  onChange={(e) => setEditBody(e.target.value)}
                                  className="flex min-h-[50px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                />
                              </div>
                            ) : (
                              <p className="text-sm text-slate-700 whitespace-pre-wrap">
                                {reply.body}
                              </p>
                            )}
                          </CardContent>

                          <CardFooter className="flex gap-2 pt-2">
                            {isEditingReply ? (
                              <>
                                <Button size="sm" onClick={() => saveEdit(reply)}>
                                  Save
                                </Button>
                                <Button size="sm" variant="outline" onClick={cancelEdit}>
                                  Cancel
                                </Button>
                              </>
                            ) : (
                              <>
                                {canEdit(reply) && (
                                  <Button 
                                    size="sm" 
                                    variant="secondary" 
                                    onClick={() => startEdit(reply)}
                                  >
                                    <Edit3 className="h-3 w-3" />
                                    Edit
                                  </Button>
                                )}
                                <Button 
                                  size="sm" 
                                  variant="destructive" 
                                  onClick={() => deleteComment(reply.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                  Delete
                                </Button>
                              </>
                            )}
                          </CardFooter>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}