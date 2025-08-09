// src/pages/Tags.jsx
import React, { useEffect, useState } from "react";
import api from "../api";

// shadcn (relative imports)
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "../components/ui/alert";
import { Separator } from "../components/ui/separator";

export default function Tags() {
  const [tags, setTags] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  const loadTags = async () => {
    setErr("");
    try {
      const res = await api.get("/api/tags/");
      setTags(res.data);
    } catch (e) {
      console.error(e);
      setErr("Could not load tags.");
    }
  };

  useEffect(() => {
    loadTags();
  }, []);

  const addTag = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setErr("");
    try {
      const res = await api.post("/api/tags/", { name: name.trim() });
      setTags((prev) => [res.data, ...prev]);
      setName("");
    } catch (e) {
      console.error(e);
      const msg =
        e?.response?.data ? JSON.stringify(e.response.data) : "Failed to create tag.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (tag) => {
    setEditingId(tag.id);
    setEditName(tag.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const saveEdit = async (tag) => {
    const newName = editName.trim();
    if (!newName || newName === tag.name) return cancelEdit();
    setErr("");
    try {
      const res = await api.patch(`/api/tags/${tag.id}/`, { name: newName });
      setTags((prev) => prev.map((t) => (t.id === tag.id ? res.data : t)));
      cancelEdit();
    } catch (e) {
      console.error(e);
      const msg =
        e?.response?.data ? JSON.stringify(e.response.data) : "Failed to rename tag.";
      setErr(msg);
    }
  };

  const deleteTag = async (id) => {
    setErr("");
    try {
      await api.delete(`/api/tags/${id}/`);
      setTags((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      console.error(e);
      const msg =
        e?.response?.data ? JSON.stringify(e.response.data) : "Failed to delete tag.";
      setErr(msg);
    }
  };

  return (
    <div className="min-h-screen w-full max-w-3xl mx-auto p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold">Manage Tags</h1>
        <p className="text-slate-600">Create, rename, and delete your tags.</p>
      </header>

      {err && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription className="break-words">{err}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add a new tag</CardTitle>
          <CardDescription>Tags help you organize your weather profiles</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={addTag} className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <div className="grid gap-2">
              <Label htmlFor="tag-name">Tag name</Label>
              <Input
                id="tag-name"
                placeholder="e.g. Travel, Work, Favorite"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                {loading ? "Adding..." : "Add Tag"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Separator className="mb-6" />

      <Card>
        <CardHeader>
          <CardTitle>Your Tags</CardTitle>
          <CardDescription>Click edit to rename, or delete to remove</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {tags.length === 0 ? (
            <p className="text-slate-600">No tags yet — create your first tag above.</p>
          ) : (
            tags.map((tag) => {
              const isEditing = editingId === tag.id;
              return (
                <div
                  key={tag.id}
                  className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  {isEditing ? (
                    <div className="flex-1 flex gap-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="New tag name"
                      />
                    </div>
                  ) : (
                    <div className="flex-1">
                      <div className="font-medium">{tag.name}</div>
                      <div className="text-xs text-slate-500">ID: {tag.id}</div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button onClick={() => saveEdit(tag)}>Save</Button>
                        <Button variant="outline" onClick={cancelEdit}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="secondary" onClick={() => startEdit(tag)}>
                          Edit
                        </Button>
                        <Button variant="destructive" onClick={() => deleteTag(tag.id)}>
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
