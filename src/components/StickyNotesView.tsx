"use client";

import React, { useState } from "react";
import { StickyNote } from "@/types";
import {
  StickyNote as StickyIcon,
  PlusCircle,
  Pin,
  Trash2,
  Tag,
  X,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Edit3,
  Maximize2,
  Minimize2,
} from "lucide-react";

interface Props {
  notes: StickyNote[];
  tankId: string;
  onAddNote: (data: any) => Promise<void>;
  onUpdateNote?: (id: string, data: any) => Promise<any>;
  onTogglePin: (id: string, isPinned: boolean) => Promise<void>;
  onDeleteNote: (id: string) => Promise<void>;
}

export default function StickyNotesView({
  notes,
  tankId,
  onAddNote,
  onUpdateNote,
  onTogglePin,
  onDeleteNote,
}: Props) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingNote, setEditingNote] = useState<StickyNote | null>(null);
  const [selectedTag, setSelectedTag] = useState("all");

  // Expanded notes state - empty set initially so all notes are compressed by default
  const [expandedNoteIds, setExpandedNoteIds] = useState<Set<string>>(new Set());

  // Form state for creating a note
  const [formData, setFormData] = useState({
    title: "",
    tag: "recipe",
    tagColor: "#00d2be",
    body: "",
    dateLabel: "Pinned",
    isPinned: true,
  });

  // Form state for editing a note
  const [editFormData, setEditFormData] = useState({
    title: "",
    tag: "recipe",
    tagColor: "#00d2be",
    body: "",
    dateLabel: "Pinned",
    isPinned: true,
  });

  const [submitting, setSubmitting] = useState(false);

  const tags = [
    { id: "recipe", label: "🌊 Recipe / Mixing", color: "#00d2be" },
    { id: "general", label: "📌 General Note", color: "#ff6b35" },
    { id: "warning", label: "⚠️ Warning / Limit", color: "#f39c12" },
    { id: "trace", label: "🧬 Trace & Dosing", color: "#9b59b6" },
  ];

  // Toggle single note expand/shrink
  const toggleExpand = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedNoteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Expand all notes
  const handleExpandAll = () => {
    setExpandedNoteIds(new Set(notes.map((n) => n.id)));
  };

  // Collapse (shrink) all notes
  const handleCollapseAll = () => {
    setExpandedNoteIds(new Set());
  };

  // Open Edit Modal for a note
  const handleNoteClick = (note: StickyNote) => {
    setEditingNote(note);
    setEditFormData({
      title: note.title,
      tag: note.tag,
      tagColor: note.tagColor || "#00d2be",
      body: note.body,
      dateLabel: note.dateLabel || "Pinned",
      isPinned: Boolean(note.isPinned),
    });
    setShowEditModal(true);
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const tagObj = tags.find((t) => t.id === formData.tag);
      await onAddNote({
        tankId,
        title: formData.title,
        tag: formData.tag,
        tagColor: tagObj ? tagObj.color : "#00d2be",
        body: formData.body,
        dateLabel: formData.dateLabel,
        isPinned: formData.isPinned,
      });
      setShowAddModal(false);
      setFormData({
        title: "",
        tag: "recipe",
        tagColor: "#00d2be",
        body: "",
        dateLabel: "Pinned",
        isPinned: true,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNote) return;
    setSubmitting(true);
    try {
      const tagObj = tags.find((t) => t.id === editFormData.tag);
      const updateData = {
        title: editFormData.title,
        tag: editFormData.tag,
        tagColor: tagObj ? tagObj.color : "#00d2be",
        body: editFormData.body,
        dateLabel: editFormData.dateLabel,
        isPinned: editFormData.isPinned,
      };

      if (onUpdateNote) {
        await onUpdateNote(editingNote.id, updateData);
      } else {
        await fetch(`/api/notes/${editingNote.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        });
      }
      setShowEditModal(false);
      setEditingNote(null);
    } catch (err) {
      console.error("Failed to update note:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredNotes = notes.filter((n) => {
    if (selectedTag === "all") return true;
    return n.tag === selectedTag;
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#161e2b] border border-[#28364a] p-4 rounded-xl shadow-lg">
        <div>
          <h2 className="text-lg font-bold text-[#f0f4f8] flex items-center gap-2">
            <StickyIcon className="text-[#00d2be]" size={20} />
            Reefkeeper Sticky Notes & Salt Recipes
          </h2>
          <p className="text-xs text-[#8e9fb5] mt-0.5">
            Click on any note to expand. Press the Click to Edit button to modify note contents.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {notes.length > 0 && (
            <div className="flex items-center bg-[#0f1520] border border-[#28364a] rounded-lg p-0.5">
              <button
                type="button"
                onClick={handleCollapseAll}
                className="px-2.5 py-1.5 rounded text-[11px] font-semibold text-[#8e9fb5] hover:text-[#00d2be] hover:bg-[#161e2b] transition-all flex items-center gap-1 cursor-pointer"
                title="Compress all notes to title and type only"
              >
                <Minimize2 size={12} />
                Shrink All
              </button>
              <button
                type="button"
                onClick={handleExpandAll}
                className="px-2.5 py-1.5 rounded text-[11px] font-semibold text-[#8e9fb5] hover:text-[#00d2be] hover:bg-[#161e2b] transition-all flex items-center gap-1 cursor-pointer"
                title="Expand all notes fully"
              >
                <Maximize2 size={12} />
                Expand All
              </button>
            </div>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#00d2be] text-[#0d121a] hover:bg-[#14ebd7] text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <PlusCircle size={15} />
            Create Sticky Note
          </button>
        </div>
      </div>

      {/* Tag filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSelectedTag("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
            selectedTag === "all"
              ? "bg-[#00d2be] text-[#0d121a] border-[#00d2be]"
              : "bg-[#161e2b] text-[#8e9fb5] border-[#28364a] hover:border-[#8e9fb5]"
          }`}
        >
          All Notes ({notes.length})
        </button>

        {tags.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTag(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedTag === t.id
                ? "bg-[#161e2b] text-[#f0f4f8] border-[#00d2be]"
                : "bg-[#0f1520] text-[#8e9fb5] border-[#28364a] hover:border-[#8e9fb5]"
            }`}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: t.color }}
            />
            {t.label}
          </button>
        ))}
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
        {filteredNotes.map((note) => {
          const isExpanded = expandedNoteIds.has(note.id);

          // COMPRESSED STATE: Only Title, Note Type (Tag), and Dropdown Arrow
          if (!isExpanded) {
            return (
              <div
                key={note.id}
                onClick={() => toggleExpand(note.id)}
                className="bg-[#161e2b] border rounded-xl p-3.5 shadow-md flex items-center justify-between gap-3 transition-all hover:border-[#00d2be] hover:bg-[#1a2332] cursor-pointer group select-none"
                style={{ borderColor: `${note.tagColor}55` }}
                title="Click note to expand and view"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0"
                    style={{
                      backgroundColor: `${note.tagColor}22`,
                      color: note.tagColor,
                    }}
                  >
                    {note.tag}
                  </span>
                  <h3 className="font-bold text-xs text-[#f0f4f8] truncate group-hover:text-[#00d2be] transition-colors">
                    {note.title}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {note.isPinned && (
                    <span title="Pinned to top">
                      <Pin size={12} className="text-[#00d2be] fill-[#00d2be]" />
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => toggleExpand(note.id, e)}
                    className="p-1.5 rounded-md text-[#8e9fb5] hover:text-[#00d2be] hover:bg-[#0f1520] transition-all cursor-pointer"
                    title="Click arrow to expand full note"
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
              </div>
            );
          }

          // EXPANDED STATE: Full note with Body, Dates, Actions, and Shrink Arrow
          return (
            <div
              key={note.id}
              className="bg-[#161e2b] border rounded-xl p-5 shadow-lg flex flex-col justify-between transition-all hover:border-[#00d2be]/70 group"
              style={{ borderColor: `${note.tagColor}55` }}
            >
              <div>
                <div
                  className="flex items-start justify-between gap-2 mb-2 cursor-pointer select-none"
                  onClick={(e) => toggleExpand(note.id, e)}
                  title="Click to shrink note"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                      style={{
                        backgroundColor: `${note.tagColor}22`,
                        color: note.tagColor,
                      }}
                    >
                      {note.tag}
                    </span>
                    <span className="text-[10px] text-[#8e9fb5] font-mono">
                      {note.dateLabel}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePin(note.id, !note.isPinned);
                      }}
                      className={`p-1 rounded transition-colors cursor-pointer ${
                        note.isPinned
                          ? "text-[#00d2be] hover:text-[#8e9fb5]"
                          : "text-[#8e9fb5] hover:text-[#00d2be]"
                      }`}
                      title={note.isPinned ? "Unpin note" : "Pin note to top"}
                    >
                      <Pin size={14} className={note.isPinned ? "fill-[#00d2be]" : ""} />
                    </button>

                    {/* Small dropdown/shrink arrow */}
                    <button
                      type="button"
                      onClick={(e) => toggleExpand(note.id, e)}
                      className="p-1 rounded text-[#8e9fb5] hover:text-[#00d2be] hover:bg-[#0f1520] transition-all cursor-pointer"
                      title="Click arrow to shrink note"
                    >
                      <ChevronUp size={16} />
                    </button>
                  </div>
                </div>

                <h3
                  className="font-bold text-sm text-[#f0f4f8] mb-2 leading-snug cursor-pointer select-none group-hover:text-[#00d2be] transition-colors"
                  onClick={(e) => toggleExpand(note.id, e)}
                  title="Click to shrink note"
                >
                  {note.title}
                </h3>

                <p className="text-xs text-[#f0f4f8]/90 whitespace-pre-line leading-relaxed select-text">
                  {note.body}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#28364a] flex items-center justify-between text-[11px] text-[#8e9fb5]">
                <div className="flex items-center gap-2">
                  <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNoteClick(note);
                    }}
                    className="text-[11px] px-2 py-0.5 rounded bg-[#0f1520] hover:bg-[#00d2be]/15 border border-[#28364a] hover:border-[#00d2be]/40 text-[#8e9fb5] hover:text-[#00d2be] font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                    title="Click to edit this note"
                  >
                    <Edit3 size={11} className="text-[#00d2be]" /> Click to edit
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNoteClick(note);
                    }}
                    className="p-1.5 rounded text-[#8e9fb5] hover:text-[#00d2be] hover:bg-[#0f1520] transition-all cursor-pointer"
                    title="Edit note"
                  >
                    <Edit3 size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete note "${note.title}"?`)) {
                        onDeleteNote(note.id);
                      }
                    }}
                    className="p-1.5 rounded text-[#8e9fb5] hover:text-rose-400 hover:bg-rose-950/30 transition-all cursor-pointer"
                    title="Delete note"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredNotes.length === 0 && (
        <div className="text-center py-12 bg-[#161e2b] border border-[#28364a] rounded-xl text-[#8e9fb5]">
          <StickyIcon size={36} className="mx-auto mb-2 opacity-30 text-[#00d2be]" />
          <p className="text-sm font-semibold text-[#f0f4f8]">No sticky notes found.</p>
          <p className="text-xs text-[#8e9fb5] mt-1">Pin helpful reminders or mixing instructions.</p>
        </div>
      )}

      {/* CREATE Note Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#161e2b] border border-[#28364a] rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#28364a] pb-3 mb-4">
              <h3 className="text-base font-bold text-[#f0f4f8] flex items-center gap-2">
                <PlusCircle size={18} className="text-[#00d2be]" />
                Create New Sticky Note
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded text-[#8e9fb5] hover:text-[#f0f4f8] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateNote} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                  Note Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 🌊 35 ppt Salt Recipe"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-3 py-2 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                    Tag / Category
                  </label>
                  <select
                    value={formData.tag}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                    className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-3 py-2 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                  >
                    <option value="recipe">🌊 Recipe / Mixing</option>
                    <option value="general">📌 General Note</option>
                    <option value="warning">⚠️ Warning / Limit</option>
                    <option value="trace">🧬 Trace & Dosing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                    Date Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pinned, Weekly, Rule"
                    value={formData.dateLabel}
                    onChange={(e) => setFormData({ ...formData, dateLabel: e.target.value })}
                    className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-3 py-2 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                  Note Content *
                </label>
                <textarea
                  rows={4}
                  placeholder="Enter mixing instructions or reminders..."
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-3 py-2 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                  required
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-[#8e9fb5] cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPinned}
                  onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                  className="accent-[#00d2be]"
                />
                <span>Pin this note to the top</span>
              </label>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#28364a]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#0f1520] text-[#8e9fb5] border border-[#28364a] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-[#00d2be] text-[#0d121a] hover:bg-[#14ebd7] disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {submitting ? "Saving..." : "Pin Note"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT Note Modal */}
      {showEditModal && editingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#161e2b] border border-[#28364a] rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#28364a] pb-3 mb-4">
              <h3 className="text-base font-bold text-[#f0f4f8] flex items-center gap-2">
                <Edit3 size={18} className="text-[#00d2be]" />
                Edit Sticky Note
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingNote(null);
                }}
                className="p-1 rounded text-[#8e9fb5] hover:text-[#f0f4f8] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateNoteSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                  Note Title *
                </label>
                <input
                  type="text"
                  placeholder="Note Title"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-3 py-2 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                    Tag / Category
                  </label>
                  <select
                    value={editFormData.tag}
                    onChange={(e) => setEditFormData({ ...editFormData, tag: e.target.value })}
                    className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-3 py-2 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                  >
                    <option value="recipe">🌊 Recipe / Mixing</option>
                    <option value="general">📌 General Note</option>
                    <option value="warning">⚠️ Warning / Limit</option>
                    <option value="trace">🧬 Trace & Dosing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                    Date Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pinned, Weekly, Rule"
                    value={editFormData.dateLabel}
                    onChange={(e) => setEditFormData({ ...editFormData, dateLabel: e.target.value })}
                    className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-3 py-2 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                  Note Content *
                </label>
                <textarea
                  rows={5}
                  placeholder="Enter note text..."
                  value={editFormData.body}
                  onChange={(e) => setEditFormData({ ...editFormData, body: e.target.value })}
                  className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-3 py-2 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                  required
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-[#8e9fb5] cursor-pointer">
                <input
                  type="checkbox"
                  checked={editFormData.isPinned}
                  onChange={(e) => setEditFormData({ ...editFormData, isPinned: e.target.checked })}
                  className="accent-[#00d2be]"
                />
                <span>Pin this note to the top</span>
              </label>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#28364a]">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingNote(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#0f1520] text-[#8e9fb5] border border-[#28364a] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-[#00d2be] text-[#0d121a] hover:bg-[#14ebd7] disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
