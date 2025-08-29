import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "../components/ui/alert";
import { Separator } from "../components/ui/separator";
import { Checkbox } from "../components/ui/checkbox";
import { 
  PenTool, 
  MessageCircle, 
  Calendar, 
  User, 
  Edit3, 
  Trash2, 
  Plus,
  ArrowLeft,
  Send
} from "lucide-react";

export default function Blogs() {
  const navigate = useNavigate();
  
  const [blogs, setBlogs] = useState([]);
  const [weatherProfiles, setWeatherProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Create blog form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selectedProfileIds, setSelectedProfileIds] = useState([]);
  
  // Edit blog
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editProfileIds, setEditProfileIds] = useState([]);

  const loadBlogs = async () => {
    setError("");
    try {
      const res = await api.get("/api/v2/blogs/");
      setBlogs(res.data);
    } catch (e) {
      console.error(e);
      setError("Could not load blogs.");
    }
  };

  const loadWeatherProfiles = async () => {
    try {
      const res = await api.get("/api/profiles/");
      setWeatherProfiles(res.data || []);
    } catch (e) {
      console.error("Could not load weather profiles:", e);
    }
  };

  useEffect(() => {
    loadBlogs();
    loadWeatherProfiles();
  }, []);

  const createBlog = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    setLoading(true);
    setError("");
    try {
      const payload = {
        title: title.trim(),
        body: body.trim(),
        weather_profiles: selectedProfileIds,
      };

      const res = await api.post("/api/v2/blogs/", payload);
      setBlogs((prev) => [res.data, ...prev]);
      
      // Reset form
      setTitle("");
      setBody("");
      setSelectedProfileIds([]);
      setShowCreateForm(false);
    } catch (e) {
      console.error("Create failed:", e);
      const msg = e?.response?.data ? JSON.stringify(e.response.data) : "Failed to create blog.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (blog) => {
    setEditingId(blog.id);
    setEditTitle(blog.title);
    setEditBody(blog.body);
    setEditProfileIds(blog.weather_profiles || []);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditBody("");
    setEditProfileIds([]);
  };

  const saveEdit = async (blog) => {
    if (!editTitle.trim() || !editBody.trim()) return;
    
    setError("");
    try {
      const payload = {
        title: editTitle.trim(),
        body: editBody.trim(),
        weather_profiles: editProfileIds,
      };

      const res = await api.patch(`/api/v2/blogs/${blog.id}/`, payload);
      setBlogs((prev) => prev.map((b) => (b.id === blog.id ? res.data : b)));
      cancelEdit();
    } catch (e) {
      console.error("Update failed:", e);
      const msg = e?.response?.data ? JSON.stringify(e.response.data) : "Failed to update blog.";
      setError(msg);
    }
  };

  const deleteBlog = async (blogId) => {
    setError("");
    try {
      await api.delete(`/api/v2/blogs/${blogId}/`);
      setBlogs((prev) => prev.filter((b) => b.id !== blogId));
    } catch (e) {
      console.error(e);
      setError("Failed to delete blog.");
    }
  };

  const toggleProfile = (profileId, isEdit = false) => {
    const setter = isEdit ? setEditProfileIds : setSelectedProfileIds;
    setter((prev) =>
      prev.includes(profileId) 
        ? prev.filter((id) => id !== profileId)
        : [...prev, profileId]
    );
  };

  const getProfileNames = (profileIds) => {
    return profileIds
      .map(id => weatherProfiles.find(p => p.id === id)?.city_name)
      .filter(Boolean)
      .join(", ");
  };

  return (
    <div className="min-h-screen w-full max-w-6xl mx-auto p-6">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold">Your Blogs</h1>
          <p className="text-slate-600">Share your thoughts and connect them to weather profiles.</p>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" />
            Back to Weather
          </Button>
          <Button variant="secondary" onClick={() => navigate("/tags")}>
            Manage Tags
          </Button>
          <Button variant="outline" onClick={() => navigate("/logout")}>
            Logout
          </Button>
        </div>
      </header>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription className="break-words">{error}</AlertDescription>
        </Alert>
      )}

      {/* Create Blog Form */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <PenTool className="h-5 w-5" />
                {showCreateForm ? "Write a New Blog" : "Create Blog Post"}
              </CardTitle>
              <CardDescription>
                {showCreateForm 
                  ? "Share your thoughts and optionally link to weather profiles"
                  : "Click to start writing a new blog post"
                }
              </CardDescription>
            </div>
            {!showCreateForm && (
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4" />
                New Post
              </Button>
            )}
          </div>
        </CardHeader>
        
        {showCreateForm && (
          <CardContent>
            <form onSubmit={createBlog} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter your blog title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="body">Content</Label>
                <textarea
                  id="body"
                  placeholder="Write your blog content here..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label>Link Weather Profiles (optional)</Label>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {weatherProfiles.length === 0 ? (
                    <div className="text-sm text-slate-500">
                      No weather profiles found. Create some first.
                    </div>
                  ) : (
                    weatherProfiles.map((profile) => (
                      <label
                        key={profile.id}
                        className="flex items-center gap-2 rounded-md border p-2 cursor-pointer hover:bg-slate-50"
                      >
                        <Checkbox
                          checked={selectedProfileIds.includes(profile.id)}
                          onCheckedChange={() => toggleProfile(profile.id)}
                        />
                        <span className="text-sm">{profile.city_name}</span>
                        {typeof profile.last_temp === "number" && (
                          <span className="text-xs text-slate-500">
                            {Math.round(profile.last_temp)}°
                          </span>
                        )}
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Send className="h-4 w-4 animate-pulse" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Publish Blog
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      <Separator className="mb-6" />

      {/* Blog List */}
      <section className="grid gap-6">
        {blogs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <PenTool className="h-12 w-12 text-slate-300 mb-4" />
              <p className="text-slate-600 text-center">
                No blog posts yet. Create your first post to get started!
              </p>
            </CardContent>
          </Card>
        ) : (
          blogs.map((blog) => {
            const isEditing = editingId === blog.id;
            return (
              <Card key={blog.id} className="overflow-hidden">
                <CardHeader>
                  {isEditing ? (
                    <div className="grid gap-3">
                      <div className="grid gap-2">
                        <Label htmlFor={`edit-title-${blog.id}`}>Title</Label>
                        <Input
                          id={`edit-title-${blog.id}`}
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          placeholder="Blog title"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor={`edit-body-${blog.id}`}>Content</Label>
                        <textarea
                          id={`edit-body-${blog.id}`}
                          value={editBody}
                          onChange={(e) => setEditBody(e.target.value)}
                          className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          placeholder="Blog content"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Weather Profiles</Label>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {weatherProfiles.map((profile) => (
                            <label
                              key={profile.id}
                              className="flex items-center gap-2 rounded-md border p-2 cursor-pointer hover:bg-slate-50"
                            >
                              <Checkbox
                                checked={editProfileIds.includes(profile.id)}
                                onCheckedChange={() => toggleProfile(profile.id, true)}
                              />
                              <span className="text-sm">{profile.city_name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <CardTitle className="text-2xl">{blog.title}</CardTitle>
                      <CardDescription className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Author ID: {blog.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(blog.created_on).toLocaleDateString()}
                        </span>
                        {blog.updated_on !== blog.created_on && (
                          <span className="text-xs text-slate-500">
                            Updated: {new Date(blog.updated_on).toLocaleDateString()}
                          </span>
                        )}
                      </CardDescription>
                    </>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  {!isEditing && (
                    <>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {blog.body}
                        </p>
                      </div>

                      {blog.weather_profiles && blog.weather_profiles.length > 0 && (
                        <div className="bg-slate-50 rounded-lg p-3">
                          <h4 className="text-sm font-medium text-slate-700 mb-2">
                            Linked Weather Profiles:
                          </h4>
                          <p className="text-sm text-slate-600">
                            {getProfileNames(blog.weather_profiles)}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>

                <CardFooter className="flex gap-2 bg-slate-50/50">
                  {isEditing ? (
                    <>
                      <Button onClick={() => saveEdit(blog)}>
                        <Send className="h-4 w-4" />
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={cancelEdit}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="secondary" onClick={() => startEdit(blog)}>
                        <Edit3 className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button variant="outline" onClick={() => navigate(`/blogs/${blog.id}/comments`)}>
                        <MessageCircle className="h-4 w-4" />
                        Comments
                      </Button>
                      <Button variant="destructive" onClick={() => deleteBlog(blog.id)}>
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </>
                  )}
                </CardFooter>
              </Card>
            );
          })
        )}
      </section>
    </div>
  );
}