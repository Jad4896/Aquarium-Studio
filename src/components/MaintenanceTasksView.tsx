"use client";

import React, { useState } from "react";
import { MaintenanceTask } from "@/types";
import {
  CheckCircle2,
  Clock,
  PlusCircle,
  Pencil,
  Trash2,
  AlertTriangle,
  RotateCcw,
  Calendar,
  X,
} from "lucide-react";

interface Props {
  tasks: MaintenanceTask[];
  tankId: string;
  onAddTask: (data: any) => Promise<void>;
  onUpdateTask: (id: string, data: any) => Promise<void>;
  onCompleteTask: (id: string) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
}

export default function MaintenanceTasksView({
  tasks,
  tankId,
  onAddTask,
  onUpdateTask,
  onCompleteTask,
  onDeleteTask,
}: Props) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    intervalDays: "7",
    desc: "",
  });
  const [editingTask, setEditingTask] = useState<MaintenanceTask | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    intervalDays: "7",
    desc: "",
    lastCompleted: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const getTaskStatus = (task: MaintenanceTask) => {
    const last = new Date(task.lastCompleted).getTime();
    const intervalMs = task.intervalDays * 24 * 60 * 60 * 1000;
    const dueTime = last + intervalMs;
    const now = new Date().getTime();
    const diffMs = dueTime - now;
    const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));

    if (diffDays < 0) {
      return {
        status: "overdue",
        label: `Overdue by ${Math.abs(diffDays)}d`,
        color: "text-rose-400 bg-rose-950/40 border-rose-800/50",
      };
    }
    if (diffDays === 0) {
      return {
        status: "today",
        label: "Due Today",
        color: "text-amber-300 bg-amber-950/40 border-amber-800/50",
      };
    }
    return {
      status: "upcoming",
      label: `Due in ${diffDays}d`,
      color: "text-emerald-400 bg-emerald-950/40 border-emerald-800/50",
    };
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onAddTask({
        tankId,
        title: formData.title,
        intervalDays: parseInt(formData.intervalDays, 10),
        desc: formData.desc,
      });
      setShowAddModal(false);
      setFormData({ title: "", intervalDays: "7", desc: "" });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEditModal = (task: MaintenanceTask) => {
    setEditingTask(task);
    let dateStr = "";
    try {
      dateStr = new Date(task.lastCompleted).toISOString().split("T")[0];
    } catch {
      dateStr = new Date().toISOString().split("T")[0];
    }
    setEditFormData({
      title: task.title,
      intervalDays: task.intervalDays.toString(),
      desc: task.desc || "",
      lastCompleted: dateStr,
    });
  };

  const handleSaveEditTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    setSubmitting(true);
    try {
      await onUpdateTask(editingTask.id, {
        title: editFormData.title.trim(),
        intervalDays: parseInt(editFormData.intervalDays, 10),
        desc: editFormData.desc.trim(),
        lastCompleted: editFormData.lastCompleted
          ? new Date(editFormData.lastCompleted).toISOString()
          : undefined,
      });
      setEditingTask(null);
    } catch (err) {
      console.error("Failed to update maintenance task:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Sort tasks: overdue first, then today, then upcoming
  const sortedTasks = [...tasks].sort((a, b) => {
    const aLast = new Date(a.lastCompleted).getTime() + a.intervalDays * 86400000;
    const bLast = new Date(b.lastCompleted).getTime() + b.intervalDays * 86400000;
    return aLast - bLast;
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#161e2b] border border-[#28364a] p-4 rounded-xl shadow-lg">
        <div>
          <h2 className="text-lg font-bold text-[#f0f4f8] flex items-center gap-2">
            <Clock className="text-[#00d2be]" size={20} />
            Automated Maintenance & Husbandry Checklist
          </h2>
          <p className="text-xs text-[#8e9fb5] mt-0.5">
            Never miss a filter swap, water change, or equipment cleaning schedule.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#00d2be] text-[#0d121a] hover:bg-[#14ebd7] text-xs font-bold transition-all shadow-md cursor-pointer"
        >
          <PlusCircle size={15} />
          Add Maintenance Task
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {sortedTasks.map((task) => {
          const { label, color, status } = getTaskStatus(task);

          return (
            <div
              key={task.id}
              className="bg-[#161e2b] border border-[#28364a] hover:border-[#00d2be]/40 rounded-xl p-4 shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-sm text-[#f0f4f8]">
                    {task.title}
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${color}`}
                  >
                    {label}
                  </span>
                  <span className="text-[11px] text-[#8e9fb5] bg-[#0f1520] px-2 py-0.5 rounded border border-[#28364a]">
                    Every {task.intervalDays} days
                  </span>
                </div>

                {task.desc && (
                  <p className="text-xs text-[#8e9fb5] leading-relaxed">
                    {task.desc}
                  </p>
                )}

                <div className="flex items-center gap-4 text-[11px] text-[#8e9fb5] pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} className="text-[#00d2be]" />
                    Last Completed:{" "}
                    <strong className="text-[#f0f4f8]">
                      {new Date(task.lastCompleted).toLocaleDateString()}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onCompleteTask(task.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00d2be]/15 text-[#00d2be] border border-[#00d2be]/40 hover:bg-[#00d2be] hover:text-[#0d121a] text-xs font-bold transition-all shadow-sm cursor-pointer"
                  title="Mark this task as completed today"
                >
                  <CheckCircle2 size={14} />
                  Mark Done Today
                </button>

                <button
                  onClick={() => handleOpenEditModal(task)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f1520] text-[#8e9fb5] border border-[#28364a] hover:text-[#00d2be] hover:border-[#00d2be]/50 text-xs font-semibold transition-all shadow-sm cursor-pointer"
                  title="Edit maintenance task"
                >
                  <Pencil size={13} />
                  Edit
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Delete task "${task.title}"?`)) {
                      onDeleteTask(task.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-[#8e9fb5] hover:text-rose-400 hover:bg-rose-950/30 transition-all cursor-pointer"
                  title="Delete task"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}

        {sortedTasks.length === 0 && (
          <div className="text-center py-12 bg-[#161e2b] border border-[#28364a] rounded-xl text-[#8e9fb5]">
            <Clock size={36} className="mx-auto mb-2 opacity-30 text-[#00d2be]" />
            <p className="text-sm font-semibold text-[#f0f4f8]">No maintenance tasks scheduled.</p>
            <p className="text-xs text-[#8e9fb5] mt-1">Add tasks like water changes, skimmer cleanings, or test reminders.</p>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#161e2b] border border-[#28364a] rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#28364a] pb-3 mb-4">
              <h3 className="text-base font-bold text-[#f0f4f8] flex items-center gap-2">
                <PlusCircle size={18} className="text-[#00d2be]" />
                Add Recurring Task
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded text-[#8e9fb5] hover:text-[#f0f4f8] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 10% Water Change & Vacuum"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-3 py-2 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                  Repeat Interval (Days) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={formData.intervalDays}
                  onChange={(e) => setFormData({ ...formData, intervalDays: e.target.value })}
                  className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-3 py-2 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                  Husbandry Instructions / Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Siphon detritus from rear chambers and inspect impeller."
                  value={formData.desc}
                  onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                  className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-3 py-2 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#28364a]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#0f1520] text-[#8e9fb5] hover:text-[#f0f4f8] border border-[#28364a] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-[#00d2be] text-[#0d121a] hover:bg-[#14ebd7] disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {submitting ? "Saving..." : "Save Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#161e2b] border border-[#28364a] rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#28364a] pb-3 mb-4">
              <h3 className="text-base font-bold text-[#f0f4f8] flex items-center gap-2">
                <Pencil size={18} className="text-[#00d2be]" />
                Edit Maintenance Task
              </h3>
              <button
                onClick={() => setEditingTask(null)}
                className="p-1 rounded text-[#8e9fb5] hover:text-[#f0f4f8] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditTask} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 10% Water Change & Vacuum"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-3 py-2 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                    Repeat Interval (Days) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={editFormData.intervalDays}
                    onChange={(e) => setEditFormData({ ...editFormData, intervalDays: e.target.value })}
                    className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-3 py-2 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                    Last Completed Date
                  </label>
                  <input
                    type="date"
                    value={editFormData.lastCompleted}
                    onChange={(e) => setEditFormData({ ...editFormData, lastCompleted: e.target.value })}
                    className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-3 py-2 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                  Husbandry Instructions / Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Siphon detritus from rear chambers and inspect impeller."
                  value={editFormData.desc}
                  onChange={(e) => setEditFormData({ ...editFormData, desc: e.target.value })}
                  className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-3 py-2 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#28364a]">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#0f1520] text-[#8e9fb5] hover:text-[#f0f4f8] border border-[#28364a] cursor-pointer"
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
