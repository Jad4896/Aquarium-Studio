"use client";

import React, { useState } from "react";
import { TimelineEvent } from "@/types";
import {
  History,
  PlusCircle,
  Search,
  Calendar,
  Tag,
  Trash2,
  X,
  Upload,
  Fish,
  Sparkles,
  Cpu,
  Layers,
  Image as ImageIcon,
} from "lucide-react";
import EnlargeableImage from "./EnlargeableImage";
import { useMediaLightbox } from "@/context/MediaLightboxContext";

interface Props {
  events: TimelineEvent[];
  tankId: string;
  onAddEvent: (data: any) => Promise<void>;
  onDeleteEvent: (id: string) => Promise<void>;
}

export default function StockingTimelineView({
  events,
  tankId,
  onAddEvent,
  onDeleteEvent,
}: Props) {
  const { openMedia } = useMediaLightbox();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    category: "Livestock",
    date: new Date().toISOString().slice(0, 10),
    description: "",
    photoUrl: "",
  });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleFileUpload = async (file: File): Promise<string | null> => {
    const data = new FormData();
    data.append("file", file);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });
      const result = await res.json();
      return result.url || null;
    } catch (e) {
      console.error("Upload failed", e);
      return null;
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onAddEvent({
        tankId,
        ...formData,
      });
      setShowAddModal(false);
      setFormData({
        title: "",
        category: "Livestock",
        date: new Date().toISOString().slice(0, 10),
        description: "",
        photoUrl: "",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const categories = ["all", "Livestock", "Equipment", "Milestone", "Chemical/Dosing", "Maintenance"];

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "Livestock":
        return { color: "bg-[#00d2be]/20 text-[#00d2be] border-[#00d2be]/40", icon: Fish };
      case "Equipment":
        return { color: "bg-[#ff6b35]/20 text-[#ff6b35] border-[#ff6b35]/40", icon: Cpu };
      case "Milestone":
        return { color: "bg-purple-500/20 text-purple-300 border-purple-500/40", icon: Sparkles };
      default:
        return { color: "bg-blue-500/20 text-blue-300 border-blue-500/40", icon: Layers };
    }
  };

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      (e.description || "").toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || e.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort descending by date (most recent additions first)
  const sortedEvents = [...filteredEvents].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#161e2b] border border-[#28364a] p-4 rounded-xl shadow-lg">
        <div>
          <h2 className="text-lg font-bold text-[#f0f4f8] flex items-center gap-2">
            <History className="text-[#00d2be]" size={20} />
            Stocking Timeline & Colony Additions Log
          </h2>
          <p className="text-xs text-[#8e9fb5] mt-0.5">
            Full chronological archive of every fish, coral, invert, and equipment addition to your tank.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#00d2be] text-[#0d121a] hover:bg-[#14ebd7] text-xs font-bold transition-all shadow-md"
        >
          <PlusCircle size={15} />
          Log Addition Event
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8e9fb5]"
          />
          <input
            type="text"
            placeholder="Search stocking events, coral additions, or equipment changes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#161e2b] border border-[#28364a] rounded-lg pl-9 pr-4 py-2 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                selectedCategory === cat
                  ? "bg-[#00d2be] text-[#0d121a] border-[#00d2be]"
                  : "bg-[#161e2b] text-[#8e9fb5] border-[#28364a] hover:border-[#8e9fb5]"
              }`}
            >
              {cat === "all" ? "All Events" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#28364a]">
        {sortedEvents.map((item) => {
          const { color, icon: CatIcon } = getCategoryBadge(item.category);

          return (
            <div key={item.id} className="relative group">
              {/* Timeline Marker Dot */}
              <div className="absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full bg-[#0d121a] border-2 border-[#00d2be] flex items-center justify-center text-[10px] text-[#00d2be] shadow-[0_0_10px_rgba(0,210,190,0.4)] group-hover:scale-110 transition-transform">
                <CatIcon size={12} />
              </div>

              {/* Event Card */}
              <div className="bg-[#161e2b] border border-[#28364a] hover:border-[#00d2be]/50 rounded-xl p-4 sm:p-5 shadow-lg transition-all flex flex-col md:flex-row gap-4 justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-mono text-[#00d2be] font-bold flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(item.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${color}`}
                    >
                      {item.category}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#f0f4f8]">
                    {item.title}
                  </h3>

                  {item.description && (
                    <p className="text-xs text-[#8e9fb5] leading-relaxed whitespace-pre-line">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Optional Attached Media Preview */}
                {item.photoUrl && (
                  <div
                    className="w-full md:w-48 h-32 rounded-lg overflow-hidden border border-[#28364a] bg-black shrink-0 relative cursor-pointer"
                    onClick={() =>
                      openMedia({
                        type: "image",
                        url: item.photoUrl!,
                        title: item.title,
                        subtitle: `${item.category} Event`,
                        caption: item.description || undefined,
                        date: new Date(item.date).toLocaleDateString(),
                      })
                    }
                  >
                    <EnlargeableImage
                      src={item.photoUrl}
                      alt={item.title}
                      onEnlarge={() =>
                        openMedia({
                          type: "image",
                          url: item.photoUrl!,
                          title: item.title,
                          subtitle: `${item.category} Event`,
                          caption: item.description || undefined,
                          date: new Date(item.date).toLocaleDateString(),
                        })
                      }
                    />
                  </div>
                )}

                {/* Delete Button */}
                <div className="flex md:flex-col justify-end items-end shrink-0">
                  <button
                    onClick={() => {
                      if (confirm(`Delete event "${item.title}"?`)) {
                        onDeleteEvent(item.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-[#8e9fb5] hover:text-rose-400 hover:bg-rose-950/30 transition-all"
                    title="Delete timeline event"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {sortedEvents.length === 0 && (
          <div className="text-center py-12 bg-[#161e2b] border border-[#28364a] rounded-xl text-[#8e9fb5]">
            <History size={36} className="mx-auto mb-2 opacity-30 text-[#00d2be]" />
            <p className="text-sm font-semibold text-[#f0f4f8]">No stocking events logged yet.</p>
            <p className="text-xs text-[#8e9fb5] mt-1">Click "Log Addition Event" to record your first addition.</p>
          </div>
        )}
      </div>

      {/* Add Timeline Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#161e2b] border border-[#28364a] rounded-2xl max-w-md w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#28364a] pb-3 mb-4">
              <h3 className="text-base font-bold text-[#f0f4f8] flex items-center gap-2">
                <PlusCircle size={18} className="text-[#00d2be]" />
                Log Stocking / Addition Event
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded text-[#8e9fb5] hover:text-[#f0f4f8]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Added Wall Frogspawn & Rasta Zoas"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-3 py-2 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-3 py-2 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                  >
                    <option value="Livestock">🐠 Livestock / Corals</option>
                    <option value="Equipment">⚙️ Equipment / Hardware</option>
                    <option value="Milestone">🌟 Tank Milestone</option>
                    <option value="Chemical/Dosing">🧪 Chemical / Dosing</option>
                    <option value="Maintenance">⏱️ Major Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-3 py-2 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                  Acclimation, Placement & Care Observations
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Drip acclimated over 45 minutes; polyps extending well."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-3 py-2 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                  Attach Photo (Local Storage)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    if (e.target.files && e.target.files[0]) {
                      setUploading(true);
                      const file = e.target.files[0];
                      const url = await handleFileUpload(file);
                      if (url) {
                        setFormData((prev) => ({ ...prev, photoUrl: url }));
                      }
                      setUploading(false);
                    }
                  }}
                  className="block w-full text-xs text-[#8e9fb5] file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#00d2be] file:text-[#0d121a] hover:file:bg-[#14ebd7] cursor-pointer"
                />
                {uploading && (
                  <p className="text-xs text-[#00d2be] mt-1">Uploading photo...</p>
                )}
                {formData.photoUrl && (
                  <p className="text-xs text-emerald-400 mt-1">✓ Attached: {formData.photoUrl}</p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#28364a]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#0f1520] text-[#8e9fb5] border border-[#28364a]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploading}
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-[#00d2be] text-[#0d121a] hover:bg-[#14ebd7] disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Log Addition"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
