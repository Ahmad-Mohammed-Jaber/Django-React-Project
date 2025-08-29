// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";               // JWT axios (with refresh)
import weatherApi from "../weatherApi"; // OpenWeather axios

// shadcn (relative imports)
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
import { Checkbox } from "../components/ui/checkbox"; // <-- tag chooser

export default function Home() {
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState([]);
  const [city, setCity] = useState("");

  // tags
  const [availableTags, setAvailableTags] = useState([]); // [{id, name}]
  const [selectedTagIds, setSelectedTagIds] = useState([]); // [id, id, ...]
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editCity, setEditCity] = useState("");

  // GET /api/profiles/
  const loadProfiles = async () => {
    setErr("");
    try {
      const res = await api.get("/api/profiles/");
      setProfiles(res.data);
    } catch (e) {
      console.error(e);
      setErr("Could not load profiles.");
    }
  };

  // GET /api/tags/  (user + global tags)
  const loadTags = async () => {
    try {
      const res = await api.get("/api/tags/");
      setAvailableTags(res.data || []);
    } catch (e) {
      console.error("Could not load tags:", e);
      // non-fatal: user can still create profiles without tags
    }
  };

  useEffect(() => {
    loadProfiles();
    loadTags();
  }, []);

  // POST /api/profiles/  body: { city_name, last_temp, tag_ids: [] }
  const addProfile = async (e) => {
    e.preventDefault();
    if (!city.trim()) return;

    setLoading(true);
    setErr("");
    try {
      // fetch temp first
      const wx = await weatherApi.get("/weather", { params: { q: city.trim() } });
      const temp = wx.data?.main?.temp ?? null;

      const payload = {
        city_name: city.trim(),
        last_temp: temp,
        tag_ids: selectedTagIds.length ? selectedTagIds : [], // always include
      };

      const res = await api.post("/api/profiles/", payload);
      setProfiles((prev) => [res.data, ...prev]);
      setCity("");
      setSelectedTagIds([]); // clear selection
    } catch (e) {
      console.error("Create failed:", e);
      const msg = e?.response?.data ? JSON.stringify(e.response.data) : "Failed to add city.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  // PATCH /api/profiles/:id/  body: { last_temp, tag_ids }
  const refreshProfile = async (profile) => {
    setErr("");
    try {
      const wx = await weatherApi.get("/weather", { params: { q: profile.city_name } });
      const temp = wx.data?.main?.temp ?? null;

      const tag_ids = Array.isArray(profile.tags) ? profile.tags.map((t) => t.id) : [];

      const res = await api.patch(`/api/profiles/${profile.id}/`, {
        last_temp: temp,
        tag_ids,
      });

      setProfiles((prev) => prev.map((p) => (p.id === profile.id ? res.data : p)));
    } catch (e) {
      console.error("Refresh failed:", e);
      const msg =
        e?.response?.data ? JSON.stringify(e.response.data) : `Failed to refresh ${profile.city_name}.`;
      setErr(msg);
    }
  };

  // DELETE /api/profiles/:id/
  const deleteProfile = async (profileId) => {
    setErr("");
    try {
      await api.delete(`/api/profiles/${profileId}/`);
      setProfiles((prev) => prev.filter((p) => p.id !== profileId));
    } catch (e) {
      console.error(e);
      setErr("Failed to delete profile.");
    }
  };

  // Edit handlers (change city)
  const startEdit = (profile) => {
    setEditingId(profile.id);
    setEditCity(profile.city_name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditCity("");
  };

  // PATCH /api/profiles/:id/  body: { city_name, last_temp, tag_ids }
  const saveEdit = async (profile) => {
    const newCity = editCity.trim();
    if (!newCity || newCity === profile.city_name) {
      cancelEdit();
      return;
    }
    setErr("");
    try {
      const wx = await weatherApi.get("/weather", { params: { q: newCity } });
      const temp = wx.data?.main?.temp ?? null;

      const tag_ids = Array.isArray(profile.tags) ? profile.tags.map((t) => t.id) : [];

      const res = await api.patch(`/api/profiles/${profile.id}/`, {
        city_name: newCity,
        last_temp: temp,
        tag_ids,
      });

      setProfiles((prev) => prev.map((p) => (p.id === profile.id ? res.data : p)));
      cancelEdit();
    } catch (e) {
      console.error("Update failed:", e);
      const msg =
        e?.response?.data ? JSON.stringify(e.response.data) : `Failed to update ${profile.city_name}.`;
      setErr(msg);
    }
  };

  // handle selecting/deselecting tag checkboxes for create form
  const toggleTag = (id) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen w-full max-w-5xl mx-auto p-6">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold">Your Weather</h1>
          <p className="text-slate-600">Manage cities and check current temperatures.</p>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate("/blogs")}>
            My Blogs
          </Button>
          <Button variant="secondary" onClick={() => navigate("/tags")}>
            Manage Tags
          </Button>
          {/* navigate to /logout, App.jsx will clear localStorage */}
          <Button variant="outline" onClick={() => navigate("/logout")}>
            Logout
          </Button>
        </div>
      </header>

      {err && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription className="break-words">{err}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add a city</CardTitle>
          <CardDescription>
            Create a new weather profile and (optionally) attach tags
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={addProfile} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="city">City name</Label>
              <Input
                id="city"
                placeholder="Amman"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>Choose tags (optional)</Label>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {availableTags.length === 0 ? (
                  <div className="text-sm text-slate-500">
                    No tags found. Create some in <b>Manage Tags</b>.
                  </div>
                ) : (
                  availableTags.map((tag) => (
                    <label
                      key={tag.id}
                      className="flex items-center gap-2 rounded-md border p-2 cursor-pointer"
                    >
                      <Checkbox
                        id={`tag-${tag.id}`}
                        checked={selectedTagIds.includes(tag.id)}
                        onCheckedChange={() => toggleTag(tag.id)}
                      />
                      <span className="text-sm">{tag.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add City"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Separator className="mb-6" />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {profiles.length === 0 ? (
          <p className="text-slate-600">No profiles yet—add your first city above.</p>
        ) : (
          profiles.map((p) => {
            const isEditing = editingId === p.id;
            return (
              <Card key={p.id} className="flex flex-col">
                <CardHeader>
                  {isEditing ? (
                    <>
                      <CardTitle className="text-xl">Edit City</CardTitle>
                      <CardDescription>Update city for profile #{p.id}</CardDescription>
                    </>
                  ) : (
                    <>
                      <CardTitle className="text-xl">{p.city_name}</CardTitle>
                      <CardDescription>
                        ID: {p.id} • Created: {new Date(p.created_at).toLocaleString()}
                      </CardDescription>
                    </>
                  )}
                </CardHeader>

                <CardContent className="grow space-y-3">
                  {isEditing ? (
                    <div className="grid gap-2">
                      <Label htmlFor={`city-${p.id}`}>City name</Label>
                      <Input
                        id={`city-${p.id}`}
                        value={editCity}
                        onChange={(e) => setEditCity(e.target.value)}
                        placeholder="Enter new city"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="text-4xl font-bold">
                        {typeof p.last_temp === "number" ? `${Math.round(p.last_temp)}°` : "—"}
                      </div>
                      {p.settings && (
                        <p className="text-sm text-slate-600">
                          Units: <b>{p.settings.units}</b>{" "}
                          {p.settings.include_forecast ? "• Forecast ON" : "• Forecast OFF"}
                        </p>
                      )}
                      {p.tags?.length ? (
                        <p className="text-sm text-slate-600">
                          Tags: {p.tags.map((t) => t.name).join(", ")}
                        </p>
                      ) : (
                        <p className="text-sm text-slate-500">No tags</p>
                      )}
                    </>
                  )}
                </CardContent>

                <CardFooter className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button onClick={() => saveEdit(p)}>Save</Button>
                      <Button variant="outline" onClick={cancelEdit}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button onClick={() => refreshProfile(p)}>Refresh</Button>
                      <Button variant="secondary" onClick={() => startEdit(p)}>
                        Edit
                      </Button>
                      <Button variant="destructive" onClick={() => deleteProfile(p.id)}>
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
