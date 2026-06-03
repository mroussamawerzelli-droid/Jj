import React, { useState, useEffect } from "react";
import { collection, query, orderBy, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { ProfileData } from "../types";
import { Trash2, Edit3, CheckCircle, BarChart3, Users, LayoutDashboard, ShieldX, X, Lock, Eye } from "lucide-react";

interface AdminPanelProps {
  onClose: () => void;
  isAdminSession?: boolean;
}

export default function AdminPanel({ onClose, isAdminSession = false }: AdminPanelProps) {
  const [accessCode, setAccessCode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(
    isAdminSession || localStorage.getItem("chila_admin_session") === "true"
  );
  const [failCount, setFailCount] = useState(0);

  // Administration dashboard state
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", description: "", instagram: "", likesCount: 0 });
  const [isLoading, setIsLoading] = useState(false);

  // Authentication mounting event hook
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfiles();
    }
  }, [isAuthenticated]);

  // Authentication access
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessCode === "190704") {
      setIsAuthenticated(true);
      setFailCount(0);
      localStorage.setItem("chila_admin_session", "true");
    } else {
      setFailCount((prev) => prev + 1);
      setAccessCode("");
    }
  };

  // Query profiles for administration management
  const fetchProfiles = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, "profiles"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const list: ProfileData[] = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as ProfileData);
      });
      setProfiles(list);
    } catch (err) {
      console.error("Admin dashboard query failure:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Moderate Delete
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you absolutely sure you want to delete this profile card? This action is irreversible.")) return;
    try {
      await deleteDoc(doc(db, "profiles", id));
      setProfiles((prev) => prev.filter((p) => p.id !== id));
      if (selectedProfile?.id === id) {
        setSelectedProfile(null);
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Failed to delete document from administration panel:", err);
    }
  };

  // Moderate Edit Selection
  const startEdit = (profile: ProfileData) => {
    setSelectedProfile(profile);
    setEditForm({
      name: profile.name,
      description: profile.description,
      instagram: profile.instagram,
      likesCount: profile.likesCount
    });
    setIsEditing(true);
  };

  // Submit edits
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfile) return;

    try {
      const updateRef = doc(db, "profiles", selectedProfile.id);
      const payload = {
        name: editForm.name,
        description: editForm.description,
        instagram: editForm.instagram,
        likesCount: Number(editForm.likesCount)
      };

      await updateDoc(updateRef, payload);

      setProfiles((prev) =>
        prev.map((p) =>
          p.id === selectedProfile.id
            ? { ...p, ...payload }
            : p
        )
      );

      setIsEditing(false);
      setSelectedProfile(null);
    } catch (err) {
      console.error("Administration edits submit error:", err);
    }
  };

  // Statistics calculation helpers
  const totalProfiles = profiles.length;
  const totalLikes = profiles.reduce((sum, p) => sum + (p.likesCount || 0), 0);
  const averageVibe = totalProfiles > 0 ? Math.round(profiles.reduce((sum, p) => sum + (p.metrics?.socialEnergy || 0), 0) / totalProfiles) : 0;

  // Render Gate - Input Code screen
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 z-50">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center space-y-6 shadow-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 mx-auto">
            <Lock className="w-6 h-6 animate-pulse" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-white">Chila Admin Portal</h3>
            <p className="text-gray-400 text-xs text-center leading-snug">
              Secure administration zone. Please verify your identity code credentials.
            </p>
          </div>

          {failCount > 0 && (
            <p className="text-xs text-red-400 font-semibold animate-shake">
              Invalid access code combination. (Attempt {failCount})
            </p>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="Enter passcode"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white text-center font-bold tracking-widest text-lg focus:outline-none focus:border-purple-500"
            />

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl text-sm transition tracking-wider uppercase cursor-pointer"
            >
              Verify Code
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex flex-col overflow-hidden text-white font-sans">
      
      {/* Top Header Panel bar */}
      <header className="border-b border-white/10 p-5 shrink-0 flex justify-between items-center bg-zinc-950">
        <div className="flex items-center gap-3">
          <div className="bg-purple-600 p-2 rounded-lg text-white">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
              Chila Admin Command Center
            </h1>
            <p className="text-[10px] text-gray-500 font-mono">ROOT LEVEL ZONE</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchProfiles}
            className="px-3.5 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold rounded-lg transition"
          >
            Refresh Data
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-red-600/20 border border-red-500/30 hover:bg-red-500/30 text-red-300 text-xs font-semibold rounded-lg transition flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            <span>Close Dashboard</span>
          </button>
        </div>
      </header>

      {/* Main Panel Content Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
        
        {/* Core statistics cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-zinc-900 border border-white/5 rounded-2xl p-5 flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-[10px] text-gray-500 uppercase tracking-widest font-extrabold font-mono">TOTAL PROFILES</span>
              <span className="text-2xl font-black">{totalProfiles}</span>
            </div>
          </div>

          <div className="bg-zinc-900 border border-white/5 rounded-2xl p-5 flex items-center gap-4">
            <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400 shrink-0">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-[10px] text-gray-500 uppercase tracking-widest font-extrabold font-mono">TOTAL UPVOTES</span>
              <span className="text-2xl font-black">{totalLikes}</span>
            </div>
          </div>

          <div className="bg-zinc-900 border border-white/5 rounded-2xl p-5 flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400 shrink-0">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-[10px] text-gray-500 uppercase tracking-widest font-extrabold font-mono">AVG ESCAPE ENERGY</span>
              <span className="text-2xl font-black">{averageVibe}%</span>
            </div>
          </div>
        </section>

        {/* Dynamic Modals / Editors */}
        {isEditing && selectedProfile && (
          <section className="bg-white/5 border border-purple-500/30 rounded-2xl p-6 md:p-8 backdrop-blur-md shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-purple-400" />
                <span>Override/Edit Profile: {selectedProfile.name}</span>
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-[10px] uppercase font-bold mb-1.5">Friend's Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm"
                    onInput={(e: any) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-[10px] uppercase font-bold mb-1.5">Instagram Handle/URL</label>
                  <input
                    type="text"
                    required
                    value={editForm.instagram}
                    onInput={(e: any) => setEditForm({ ...editForm, instagram: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-[10px] uppercase font-bold mb-1.5">Likes Count Gauge</label>
                  <input
                    type="number"
                    required
                    value={editForm.likesCount}
                    onInput={(e: any) => setEditForm({ ...editForm, likesCount: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-[10px] uppercase font-bold mb-1.5">Short description</label>
                  <textarea
                    required
                    rows={6}
                    value={editForm.description}
                    onInput={(e: any) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3 text-sm">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-white font-semibold transition"
                  >
                    Cancel Edit
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl text-white font-extrabold transition shadow-lg shadow-purple-600/25 uppercase tracking-wide cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </section>
        )}

        {/* Profiles collection moderation list table */}
        <section className="bg-zinc-900 border border-white/5 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-950">
            <div>
              <h2 className="text-xl font-bold">In-App Profiles Registry</h2>
              <p className="text-xs text-gray-400">Moderate generated profiles cards or adjust statistics directly.</p>
            </div>
            <div className="text-xs text-gray-400 font-mono">
              Displaying {profiles.length} items
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-purple-400 text-sm animate-pulse">Syncing registry corridor...</p>
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              No profiles have been loaded into Firestore yet. Run analysis first.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-black/40 text-gray-400 border-b border-white/5 uppercase tracking-wider font-bold">
                    <th className="p-4">Friend Detail</th>
                    <th className="p-4">Description</th>
                    <th className="p-4">Vibe Tag</th>
                    <th className="p-4 text-center">Likes</th>
                    <th className="p-4 text-right">Moderator Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {profiles.map((p) => (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="font-extrabold text-sm block text-white truncate">{p.name}</span>
                          <span className="text-[10px] text-gray-400 block truncate">{p.instagram}</span>
                        </div>
                      </td>

                      <td className="p-4 text-gray-300 max-w-sm">
                        <p className="line-clamp-2 italic">"{p.description}"</p>
                      </td>

                      <td className="p-4 shrink-0">
                        <span className="inline-block px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-[10px] font-semibold uppercase tracking-wider">
                          {p.analysis?.vibe || "Curator"}
                        </span>
                      </td>

                      <td className="p-4 text-center font-bold font-mono text-rose-400">
                        {p.likesCount}
                      </td>

                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => startEdit(p)}
                          className="p-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-gray-300 transition"
                          title="Override profile metadata"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-2 bg-red-600/10 border border-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg transition"
                          title="Delete card entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
