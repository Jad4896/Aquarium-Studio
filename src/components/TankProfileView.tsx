"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Tank, TankMilestone, UnitSystem } from "@/types";
import { formatVolume } from "@/lib/units";
import {
  Compass,
  Settings,
  Calendar,
  Layers,
  Cpu,
  Sun,
  PlusCircle,
  Image as ImageIcon,
  Video,
  X,
  Sparkles,
  Edit3,
  Trash2,
  Check,
  Loader2,
} from "lucide-react";
import HoverVideo from "./HoverVideo";
import EnlargeableImage from "./EnlargeableImage";
import { useMediaLightbox } from "@/context/MediaLightboxContext";

interface Props {
  tank: Tank;
  unitSystem?: UnitSystem;
  onUpdateTank: (data: Partial<Tank>) => Promise<void>;
  onAddMilestone: (data: any) => Promise<void>;
  onUpdateMilestone?: (id: string, data: any) => Promise<void>;
  onDeleteMilestone?: (id: string) => Promise<void>;
  onModalChange?: (isOpen: boolean) => void;
}

export default function TankProfileView({
  tank,
  unitSystem = "metric",
  onUpdateTank,
  onAddMilestone,
  onUpdateMilestone,
  onDeleteMilestone,
  onModalChange,
}: Props) {
  const { openMedia } = useMediaLightbox();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [showEditSpec, setShowEditSpec] = useState(false);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<TankMilestone | null>(null);

  // Edit spec state
  const [specForm, setSpecForm] = useState({
    name: tank.name || "Main Reef",
    hasSump: Boolean(tank.hasSump),
    displayVolumeLiters: tank.displayVolumeLiters || tank.volumeLiters || 80,
    sumpVolumeLiters: tank.sumpVolumeLiters || 0,
    volumeLiters: tank.volumeLiters || 80,
    purpose: tank.purpose || "Mixed Reef (Soft, LPS, SPS)",
    cycle: tank.cycle || "11 Days (CaribSea Arag-Alive)",
    setupDate: tank.setupDate || "2026-08-05",
    equipment: tank.equipment || "",
    lighting: tank.lighting || "",
  });
  const [savingSpec, setSavingSpec] = useState(false);

  // Sync when tank changes
  useEffect(() => {
    setSpecForm({
      name: tank.name || "Main Reef",
      hasSump: Boolean(tank.hasSump),
      displayVolumeLiters: tank.displayVolumeLiters || tank.volumeLiters || 80,
      sumpVolumeLiters: tank.sumpVolumeLiters || 0,
      volumeLiters: tank.volumeLiters || 80,
      purpose: tank.purpose || "Mixed Reef (Soft, LPS, SPS)",
      cycle: tank.cycle || "11 Days (CaribSea Arag-Alive)",
      setupDate: tank.setupDate || "2026-08-05",
      equipment: tank.equipment || "",
      lighting: tank.lighting || "",
    });
  }, [tank]);

  // Add milestone state
  const [milestoneForm, setMilestoneForm] = useState({
    title: "",
    caption: "",
    photoUrl: "",
    videoUrl: "",
    date: new Date().toISOString().slice(0, 10),
  });
  const [uploadingMilestone, setUploadingMilestone] = useState(false);
  const [savingMilestone, setSavingMilestone] = useState(false);

  // Edit milestone state
  const [editingMilestone, setEditingMilestone] = useState<TankMilestone | null>(null);
  const [editMilestoneForm, setEditMilestoneForm] = useState({
    title: "",
    caption: "",
    photoUrl: "",
    videoUrl: "",
    date: new Date().toISOString().slice(0, 10),
  });
  const [uploadingEditMilestone, setUploadingEditMilestone] = useState(false);
  const [savingEditMilestone, setSavingEditMilestone] = useState(false);

  // Sync modal open state to parent (to hide header menus and prevent overlap)
  const isAnyModalOpen = Boolean(
    showEditSpec || showAddMilestone || selectedMilestone || editingMilestone
  );

  useEffect(() => {
    onModalChange?.(isAnyModalOpen);
    return () => {
      onModalChange?.(false);
    };
  }, [isAnyModalOpen, onModalChange]);

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
      console.error(e);
      return null;
    }
  };

  const handleSaveSpecs = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSpec(true);
    try {
      const displayVol = parseFloat(specForm.displayVolumeLiters.toString()) || 80;
      const sumpVol = specForm.hasSump ? (parseFloat(specForm.sumpVolumeLiters.toString()) || 0) : 0;
      const totalVol = specForm.hasSump ? displayVol + sumpVol : displayVol;

      await onUpdateTank({
        name: specForm.name,
        hasSump: specForm.hasSump,
        displayVolumeLiters: displayVol,
        sumpVolumeLiters: sumpVol,
        volumeLiters: totalVol,
        purpose: specForm.purpose,
        cycle: specForm.cycle,
        setupDate: specForm.setupDate,
        equipment: specForm.equipment,
        lighting: specForm.lighting,
      });
      setShowEditSpec(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingSpec(false);
    }
  };

  const handleSaveMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingMilestone(true);
    try {
      await onAddMilestone({
        tankId: tank.id,
        ...milestoneForm,
      });
      setShowAddMilestone(false);
      setMilestoneForm({
        title: "",
        caption: "",
        photoUrl: "",
        videoUrl: "",
        date: new Date().toISOString().slice(0, 10),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSavingMilestone(false);
    }
  };

  const handleStartEditMilestone = (milestone: TankMilestone, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingMilestone(milestone);
    setEditMilestoneForm({
      title: milestone.title || "",
      caption: milestone.caption || "",
      photoUrl: milestone.photoUrl || "",
      videoUrl: milestone.videoUrl || "",
      date: milestone.date ? new Date(milestone.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    });
  };

  const handleSaveEditMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMilestone) return;
    setSavingEditMilestone(true);
    try {
      if (onUpdateMilestone) {
        await onUpdateMilestone(editingMilestone.id, editMilestoneForm);
      } else {
        await fetch(`/api/milestones/${editingMilestone.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editMilestoneForm),
        });
      }
      setSelectedMilestone((prev) =>
        prev && prev.id === editingMilestone.id
          ? { ...prev, ...editMilestoneForm, date: new Date(editMilestoneForm.date) as any }
          : prev
      );
      setEditingMilestone(null);
    } catch (err) {
      console.error("Failed to save milestone edit:", err);
    } finally {
      setSavingEditMilestone(false);
    }
  };

  const handleDeleteMilestone = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm("Are you sure you want to delete this tank progression milestone?")) return;
    try {
      if (onDeleteMilestone) {
        await onDeleteMilestone(id);
      } else {
        await fetch(`/api/milestones/${id}`, { method: "DELETE" });
      }
      if (selectedMilestone?.id === id) setSelectedMilestone(null);
      if (editingMilestone?.id === id) setEditingMilestone(null);
    } catch (err) {
      console.error("Failed to delete milestone:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* System Specifications Card */}
      <div className="bg-[#161e2b] border border-[#28364a] rounded-xl p-6 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#28364a] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00d2be]/15 border border-[#00d2be]/30 flex items-center justify-center text-[#00d2be]">
              <Compass size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#f0f4f8] flex items-center gap-2">
                {tank.name}
              </h2>
              {tank.hasSump ? (
                <div className="flex items-center gap-1.5 flex-wrap text-xs text-[#00d2be] font-semibold mt-0.5">
                  <span>Display: {formatVolume(tank.displayVolumeLiters || tank.volumeLiters, unitSystem)}</span>
                  <span className="text-white/40">•</span>
                  <span>Sump: {formatVolume(tank.sumpVolumeLiters || 0, unitSystem)}</span>
                  <span className="text-white/40">•</span>
                  <span className="text-[#f0f4f8] font-bold">Total: {formatVolume(tank.volumeLiters, unitSystem)}</span>
                  <span>• System Overview</span>
                </div>
              ) : (
                <p className="text-xs text-[#00d2be] font-semibold">
                  {unitSystem === "imperial"
                    ? `${(tank.volumeLiters * 0.264172).toFixed(1)} Gallons (${tank.volumeLiters} Liters)`
                    : `${tank.volumeLiters} Liters (~${Math.round(tank.volumeLiters * 0.264172)} Gallons)`}{" "}
                  • System Overview
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => setShowEditSpec(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f1520] hover:bg-[#1e293b] text-xs font-semibold text-[#f0f4f8] border border-[#28364a] transition-all cursor-pointer"
          >
            <Settings size={14} className="text-[#00d2be]" />
            Edit System Specs
          </button>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0f1520] border border-[#28364a] rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-[#8e9fb5] flex items-center gap-1.5">
              <Layers size={13} className="text-[#00d2be]" />
              Tank Purpose & Style
            </span>
            <p className="text-sm font-bold text-[#f0f4f8] mt-2">
              {tank.purpose}
            </p>
            <div className="text-[10px] text-[#8e9fb5] mt-1 space-y-0.5">
              <div>Display: {formatVolume(tank.displayVolumeLiters || tank.volumeLiters, unitSystem)}</div>
              {tank.hasSump && (
                <div>Sump: {formatVolume(tank.sumpVolumeLiters || 0, unitSystem)} (Total: {formatVolume(tank.volumeLiters, unitSystem)})</div>
              )}
            </div>
          </div>

          <div className="bg-[#0f1520] border border-[#28364a] rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-[#8e9fb5] flex items-center gap-1.5">
              <Calendar size={13} className="text-[#ff6b35]" />
              Cycle & Initial Setup
            </span>
            <p className="text-sm font-bold text-[#f0f4f8] mt-2">
              {tank.cycle}
            </p>
            <span className="text-[10px] text-[#8e9fb5] mt-1">
              Established Date: {tank.setupDate}
            </span>
          </div>

          <div className="bg-[#0f1520] border border-[#28364a] rounded-xl p-4 flex flex-col justify-between sm:col-span-2">
            <span className="text-[11px] font-semibold text-[#8e9fb5] flex items-center gap-1.5">
              <Cpu size={13} className="text-[#00d2be]" />
              Filtration & Hardware Stack
            </span>
            <p className="text-xs text-[#f0f4f8] mt-2 leading-relaxed">
              {tank.equipment}
            </p>
          </div>

          <div className="bg-[#0f1520] border border-[#28364a] rounded-xl p-4 flex flex-col justify-between sm:col-span-2 lg:col-span-4">
            <span className="text-[11px] font-semibold text-[#8e9fb5] flex items-center gap-1.5">
              <Sun size={13} className="text-[#f1c40f]" />
              Photoperiod & Lighting Spectrum Schedule
            </span>
            <p className="text-xs text-[#f0f4f8] mt-1.5 leading-relaxed font-mono">
              {tank.lighting}
            </p>
          </div>
        </div>
      </div>

      {/* Full Tank Progression & Evolution Milestones */}
      <div className="bg-[#161e2b] border border-[#28364a] rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#28364a] pb-3">
          <div>
            <h3 className="font-bold text-base text-[#f0f4f8] flex items-center gap-2">
              <Sparkles className="text-[#00d2be]" size={18} />
              Full Tank Progression & Evolution Milestones
            </h3>
            <p className="text-xs text-[#8e9fb5] mt-0.5">
              Document aquascape maturation, coral colony establishment, and full tank shot (FTS) milestones.
            </p>
          </div>

          <button
            onClick={() => setShowAddMilestone(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00d2be] text-[#0d121a] hover:bg-[#14ebd7] text-xs font-bold transition-all shadow-md"
          >
            <PlusCircle size={14} />
            Add Milestone
          </button>
        </div>

        {/* Milestones Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tank.milestones && tank.milestones.length > 0 ? (
            tank.milestones.map((milestone) => (
              <div
                key={milestone.id}
                onClick={() => setSelectedMilestone(milestone)}
                className="bg-[#0f1520] border border-[#28364a] hover:border-[#00d2be]/50 rounded-xl overflow-hidden cursor-pointer group transition-all flex flex-col"
              >
                <div
                  className="aspect-[16/10] bg-black relative overflow-hidden cursor-pointer"
                  onClick={(e) => {
                    if (milestone.videoUrl) {
                      e.stopPropagation();
                      openMedia({
                        type: "video",
                        url: milestone.videoUrl,
                        title: milestone.title,
                        subtitle: "Progression Milestone Video",
                        caption: milestone.caption || undefined,
                        date: new Date(milestone.date).toLocaleDateString(),
                      });
                    } else if (milestone.photoUrl) {
                      e.stopPropagation();
                      openMedia({
                        type: "image",
                        url: milestone.photoUrl,
                        title: milestone.title,
                        subtitle: "Progression Milestone Shot",
                        caption: milestone.caption || undefined,
                        date: new Date(milestone.date).toLocaleDateString(),
                      });
                    }
                  }}
                >
                  {milestone.videoUrl ? (
                    <HoverVideo
                      src={milestone.videoUrl}
                      title={milestone.title}
                      onEnlarge={() =>
                        openMedia({
                          type: "video",
                          url: milestone.videoUrl!,
                          title: milestone.title,
                          subtitle: "Progression Milestone Video",
                          caption: milestone.caption || undefined,
                          date: new Date(milestone.date).toLocaleDateString(),
                        })
                      }
                    />
                  ) : milestone.photoUrl ? (
                    <EnlargeableImage
                      src={milestone.photoUrl}
                      alt={milestone.title}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                      onEnlarge={() =>
                        openMedia({
                          type: "image",
                          url: milestone.photoUrl!,
                          title: milestone.title,
                          subtitle: "Progression Milestone Shot",
                          caption: milestone.caption || undefined,
                          date: new Date(milestone.date).toLocaleDateString(),
                        })
                      }
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-[#8e9fb5]">
                      No photo attached
                    </div>
                  )}

                  <div className="absolute top-2.5 right-2.5 bg-[#0d121a]/85 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold text-[#00d2be] border border-[#28364a] z-10 pointer-events-none">
                    {new Date(milestone.date).toLocaleDateString()}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-sm text-[#f0f4f8] group-hover:text-[#00d2be] transition-colors leading-tight">
                        {milestone.title}
                      </h4>
                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => handleStartEditMilestone(milestone, e)}
                          className="p-1.5 rounded-lg bg-[#161e2b] hover:bg-[#1e293b] text-[#8e9fb5] hover:text-[#00d2be] border border-[#28364a] transition-all cursor-pointer"
                          title="Edit Milestone Data"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteMilestone(milestone.id, e)}
                          className="p-1.5 rounded-lg bg-[#161e2b] hover:bg-rose-950/40 text-[#8e9fb5] hover:text-rose-400 border border-[#28364a] transition-all cursor-pointer"
                          title="Delete Milestone"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    {milestone.caption && (
                      <p className="text-xs text-[#8e9fb5] mt-1.5 leading-relaxed line-clamp-2">
                        {milestone.caption}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-10 text-xs text-[#8e9fb5]">
              No tank milestones documented yet. Click "Add Milestone" to upload a full tank shot.
            </div>
          )}
        </div>
      </div>

      {/* Edit Specifications Modal */}
      {mounted && showEditSpec && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setShowEditSpec(false)}
        >
          <div 
            className="bg-[#161e2b] border border-[#28364a] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#28364a] pb-3 mb-4">
              <h3 className="text-base font-bold text-[#f0f4f8]">
                Edit System Specifications
              </h3>
              <button
                onClick={() => setShowEditSpec(false)}
                className="p-1 rounded text-[#8e9fb5] hover:text-[#f0f4f8]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSpecs} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                  Tank Profile Name
                </label>
                <input
                  type="text"
                  value={specForm.name}
                  onChange={(e) => setSpecForm({ ...specForm, name: e.target.value })}
                  className="w-full bg-[#0f1520] border border-[#28364a] rounded px-3 py-1.5 text-xs text-[#f0f4f8] outline-none"
                  required
                />
              </div>

              {/* Sump Filtration & Volume Inputs */}
              <div className="bg-[#0b1018] border border-[#233144] rounded-xl p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#f0f4f8] flex items-center gap-1.5">
                    <span>🌊</span>
                    <span>Sump Filtration System</span>
                  </span>
                  <div className="flex items-center gap-1 bg-[#070b12] p-1 rounded-lg border border-[#233144]">
                    <button
                      type="button"
                      onClick={() => setSpecForm({ ...specForm, hasSump: false })}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                        !specForm.hasSump
                          ? "bg-white/10 text-[#f0f4f8]"
                          : "text-[#8e9fb5] hover:text-[#f0f4f8]"
                      }`}
                    >
                      No Sump
                    </button>
                    <button
                      type="button"
                      onClick={() => setSpecForm({ ...specForm, hasSump: true })}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                        specForm.hasSump
                          ? "bg-[#00d2be] text-[#080d14]"
                          : "text-[#8e9fb5] hover:text-[#00d2be]"
                      }`}
                    >
                      Has Sump
                    </button>
                  </div>
                </div>

                {specForm.hasSump ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-[#1e2a3a]">
                    <div>
                      <label className="block text-[10px] font-semibold text-[#8e9fb5] mb-1">
                        Display Volume (L) *
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="1"
                        value={specForm.displayVolumeLiters}
                        onChange={(e) =>
                          setSpecForm({
                            ...specForm,
                            displayVolumeLiters: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full bg-[#0f1520] border border-[#28364a] rounded px-2.5 py-1 text-xs text-[#f0f4f8] outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-[#00d2be] mb-1">
                        Sump Volume (L) *
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={specForm.sumpVolumeLiters}
                        onChange={(e) =>
                          setSpecForm({
                            ...specForm,
                            sumpVolumeLiters: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full bg-[#0f1520] border border-[#00d2be]/50 rounded px-2.5 py-1 text-xs text-[#f0f4f8] outline-none"
                        required
                      />
                    </div>
                    <div className="bg-[#0e1622] border border-[#00d2be]/30 rounded p-2 flex flex-col justify-center">
                      <span className="text-[9px] uppercase tracking-wider text-[#8e9fb5] block font-semibold">
                        Total Water
                      </span>
                      <span className="text-sm font-extrabold text-[#00d2be]">
                        {(
                          (parseFloat(specForm.displayVolumeLiters.toString()) || 0) +
                          (parseFloat(specForm.sumpVolumeLiters.toString()) || 0)
                        ).toFixed(1)}{" "}
                        Liters
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-[#1e2a3a]">
                    <label className="block text-[10px] font-semibold text-[#8e9fb5] mb-1">
                      Display & Total Volume (Liters) *
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      value={specForm.displayVolumeLiters}
                      onChange={(e) =>
                        setSpecForm({
                          ...specForm,
                          displayVolumeLiters: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-[#0f1520] border border-[#28364a] rounded px-2.5 py-1 text-xs text-[#f0f4f8] outline-none"
                      required
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                  Setup Date
                </label>
                <input
                  type="date"
                  value={specForm.setupDate}
                  onChange={(e) => setSpecForm({ ...specForm, setupDate: e.target.value })}
                  className="w-full bg-[#0f1520] border border-[#28364a] rounded px-3 py-1.5 text-xs text-[#f0f4f8] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                  Aquarium Purpose / Biotope
                </label>
                <input
                  type="text"
                  value={specForm.purpose}
                  onChange={(e) => setSpecForm({ ...specForm, purpose: e.target.value })}
                  className="w-full bg-[#0f1520] border border-[#28364a] rounded px-3 py-1.5 text-xs text-[#f0f4f8] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                  Cycle & Inoculation
                </label>
                <input
                  type="text"
                  value={specForm.cycle}
                  onChange={(e) => setSpecForm({ ...specForm, cycle: e.target.value })}
                  className="w-full bg-[#0f1520] border border-[#28364a] rounded px-3 py-1.5 text-xs text-[#f0f4f8] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                  Equipment & Hardware Stack
                </label>
                <textarea
                  rows={2}
                  value={specForm.equipment}
                  onChange={(e) => setSpecForm({ ...specForm, equipment: e.target.value })}
                  className="w-full bg-[#0f1520] border border-[#28364a] rounded px-3 py-1.5 text-xs text-[#f0f4f8] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                  Photoperiod & Spectrum Schedule
                </label>
                <textarea
                  rows={2}
                  value={specForm.lighting}
                  onChange={(e) => setSpecForm({ ...specForm, lighting: e.target.value })}
                  className="w-full bg-[#0f1520] border border-[#28364a] rounded px-3 py-1.5 text-xs text-[#f0f4f8] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#28364a]">
                <button
                  type="button"
                  onClick={() => setShowEditSpec(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#0f1520] text-[#8e9fb5] border border-[#28364a]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSpec}
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-[#00d2be] text-[#0d121a] hover:bg-[#14ebd7] disabled:opacity-50"
                >
                  {savingSpec ? "Saving..." : "Save Specifications"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Add Milestone Modal */}
      {mounted && showAddMilestone && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setShowAddMilestone(false)}
        >
          <div 
            className="bg-[#161e2b] border border-[#28364a] rounded-2xl max-w-md w-full p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#28364a] pb-3 mb-4">
              <h3 className="text-base font-bold text-[#f0f4f8]">
                Add Progression Milestone
              </h3>
              <button
                onClick={() => setShowAddMilestone(false)}
                className="p-1 rounded text-[#8e9fb5] hover:text-[#f0f4f8]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveMilestone} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                  Milestone Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Month 6 Full Tank Shot"
                  value={milestoneForm.title}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
                  className="w-full bg-[#0f1520] border border-[#28364a] rounded px-3 py-1.5 text-xs text-[#f0f4f8] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                  Milestone Date
                </label>
                <input
                  type="date"
                  value={milestoneForm.date}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, date: e.target.value })}
                  className="w-full bg-[#0f1520] border border-[#28364a] rounded px-3 py-1.5 text-xs text-[#f0f4f8] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                  Observation Caption
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Added plating montipora and tuned wavemaker."
                  value={milestoneForm.caption}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, caption: e.target.value })}
                  className="w-full bg-[#0f1520] border border-[#28364a] rounded px-3 py-1.5 text-xs text-[#f0f4f8] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                  Upload Photo or Video (Local Storage)
                </label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={async (e) => {
                    if (e.target.files && e.target.files[0]) {
                      setUploadingMilestone(true);
                      const file = e.target.files[0];
                      const url = await handleFileUpload(file);
                      if (url) {
                        if (file.type.startsWith("video/")) {
                          setMilestoneForm((prev) => ({ ...prev, videoUrl: url }));
                        } else {
                          setMilestoneForm((prev) => ({ ...prev, photoUrl: url }));
                        }
                      }
                      setUploadingMilestone(false);
                    }
                  }}
                  className="block w-full text-xs text-[#8e9fb5] file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#00d2be] file:text-[#0d121a] hover:file:bg-[#14ebd7] cursor-pointer"
                />
                {uploadingMilestone && (
                  <p className="text-xs text-[#00d2be] mt-1">Uploading...</p>
                )}
                {milestoneForm.photoUrl && (
                  <p className="text-xs text-emerald-400 mt-1">✓ Photo: {milestoneForm.photoUrl}</p>
                )}
                {milestoneForm.videoUrl && (
                  <p className="text-xs text-emerald-400 mt-1">✓ Video: {milestoneForm.videoUrl}</p>
                )}

                {(milestoneForm.photoUrl || milestoneForm.videoUrl) && (
                  <div className="aspect-[16/9] max-h-40 bg-black rounded-lg overflow-hidden border border-[#28364a] mt-2 relative">
                    {milestoneForm.videoUrl ? (
                      <HoverVideo
                        src={milestoneForm.videoUrl}
                        title={milestoneForm.title || "Milestone Video"}
                        onEnlarge={() =>
                          openMedia({
                            type: "video",
                            url: milestoneForm.videoUrl,
                            title: milestoneForm.title || "Milestone Video",
                          })
                        }
                      />
                    ) : (
                      <EnlargeableImage
                        src={milestoneForm.photoUrl}
                        alt="Preview"
                        onEnlarge={() =>
                          openMedia({
                            type: "image",
                            url: milestoneForm.photoUrl,
                            title: milestoneForm.title || "Milestone Photo",
                          })
                        }
                      />
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#28364a]">
                <button
                  type="button"
                  onClick={() => setShowAddMilestone(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#0f1520] text-[#8e9fb5] border border-[#28364a]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingMilestone || uploadingMilestone}
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-[#00d2be] text-[#0d121a] hover:bg-[#14ebd7] disabled:opacity-50"
                >
                  {savingMilestone ? "Saving..." : "Save Milestone"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Inspect Milestone Modal */}
      {mounted && selectedMilestone && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedMilestone(null)}
        >
          <div 
            className="bg-[#161e2b] border border-[#28364a] rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#28364a] pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-[#f0f4f8]">
                  {selectedMilestone.title}
                </h3>
                <span className="text-xs text-[#00d2be]">
                  {new Date(selectedMilestone.date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStartEditMilestone(selectedMilestone)}
                  className="px-3 py-1.5 rounded-lg bg-[#00d2be]/10 text-[#00d2be] border border-[#00d2be]/30 hover:bg-[#00d2be]/20 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Edit3 size={13} />
                  Edit Milestone
                </button>
                <button
                  onClick={() => setSelectedMilestone(null)}
                  className="p-1 rounded text-[#8e9fb5] hover:text-[#f0f4f8]"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="aspect-[16/10] bg-black rounded-xl overflow-hidden mb-4 relative cursor-pointer">
              {selectedMilestone.videoUrl ? (
                <HoverVideo
                  src={selectedMilestone.videoUrl}
                  title={selectedMilestone.title}
                  onEnlarge={() =>
                    openMedia({
                      type: "video",
                      url: selectedMilestone.videoUrl!,
                      title: selectedMilestone.title,
                      subtitle: "Progression Milestone Video",
                      caption: selectedMilestone.caption || undefined,
                      date: new Date(selectedMilestone.date).toLocaleDateString(),
                    })
                  }
                />
              ) : selectedMilestone.photoUrl ? (
                <EnlargeableImage
                  src={selectedMilestone.photoUrl}
                  alt={selectedMilestone.title}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                  onEnlarge={() =>
                    openMedia({
                      type: "image",
                      url: selectedMilestone.photoUrl!,
                      title: selectedMilestone.title,
                      subtitle: "Progression Milestone Shot",
                      caption: selectedMilestone.caption || undefined,
                      date: new Date(selectedMilestone.date).toLocaleDateString(),
                    })
                  }
                />
              ) : null}
            </div>

            {selectedMilestone.caption && (
              <p className="text-xs text-[#8e9fb5] leading-relaxed">
                {selectedMilestone.caption}
              </p>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Edit Milestone Modal */}
      {mounted && editingMilestone && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setEditingMilestone(null)}
        >
          <div 
            className="bg-[#161e2b] border border-[#28364a] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#28364a] pb-3">
              <h3 className="text-base font-bold text-[#f0f4f8] flex items-center gap-2">
                <Edit3 size={16} className="text-[#00d2be]" />
                Edit Progression Milestone
              </h3>
              <button
                type="button"
                onClick={() => setEditingMilestone(null)}
                className="p-1 rounded text-[#8e9fb5] hover:text-[#f0f4f8]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditMilestone} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                  Milestone Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mixed Reef Established, Initial Setup"
                  value={editMilestoneForm.title}
                  onChange={(e) => setEditMilestoneForm({ ...editMilestoneForm, title: e.target.value })}
                  className="w-full bg-[#0f1520] border border-[#28364a] rounded px-3 py-1.5 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                  Milestone Date *
                </label>
                <input
                  type="date"
                  value={editMilestoneForm.date}
                  onChange={(e) => setEditMilestoneForm({ ...editMilestoneForm, date: e.target.value })}
                  className="w-full bg-[#0f1520] border border-[#28364a] rounded px-3 py-1.5 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                  Observation Caption / Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe coral growth, system stability, equipment adjustments, or tank changes..."
                  value={editMilestoneForm.caption}
                  onChange={(e) => setEditMilestoneForm({ ...editMilestoneForm, caption: e.target.value })}
                  className="w-full bg-[#0f1520] border border-[#28364a] rounded px-3 py-1.5 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                />
              </div>

              {/* Photo or Video preview & replace */}
              <div>
                <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                  Milestone Media (Photo or Video)
                </label>
                {(editMilestoneForm.videoUrl || editMilestoneForm.photoUrl) && (
                  <div className="aspect-[16/9] max-h-44 bg-black rounded-lg overflow-hidden mb-2 relative border border-[#28364a]">
                    {editMilestoneForm.videoUrl ? (
                      <HoverVideo
                        src={editMilestoneForm.videoUrl}
                        title={editMilestoneForm.title || "Milestone Video"}
                        onEnlarge={() =>
                          openMedia({
                            type: "video",
                            url: editMilestoneForm.videoUrl,
                            title: editMilestoneForm.title || "Milestone Video",
                          })
                        }
                      />
                    ) : (
                      <EnlargeableImage
                        src={editMilestoneForm.photoUrl}
                        alt="Preview"
                        onEnlarge={() =>
                          openMedia({
                            type: "image",
                            url: editMilestoneForm.photoUrl,
                            title: editMilestoneForm.title || "Milestone Photo",
                          })
                        }
                      />
                    )}
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={async (e) => {
                    if (e.target.files && e.target.files[0]) {
                      setUploadingEditMilestone(true);
                      const file = e.target.files[0];
                      const url = await handleFileUpload(file);
                      if (url) {
                        if (file.type.startsWith("video/")) {
                          setEditMilestoneForm((prev) => ({ ...prev, videoUrl: url, photoUrl: "" }));
                        } else {
                          setEditMilestoneForm((prev) => ({ ...prev, photoUrl: url, videoUrl: "" }));
                        }
                      }
                      setUploadingEditMilestone(false);
                    }
                  }}
                  className="block w-full text-xs text-[#8e9fb5] file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#00d2be] file:text-[#0d121a] hover:file:bg-[#14ebd7] cursor-pointer"
                />
                {uploadingEditMilestone && (
                  <p className="text-xs text-[#00d2be] mt-1 flex items-center gap-1">
                    <Loader2 size={12} className="animate-spin" /> Uploading media...
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#28364a]">
                <button
                  type="button"
                  onClick={() => handleDeleteMilestone(editingMilestone.id)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Trash2 size={13} />
                  Delete
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingMilestone(null)}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#0f1520] text-[#8e9fb5] hover:text-[#f0f4f8] border border-[#28364a]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingEditMilestone || uploadingEditMilestone}
                    className="px-5 py-2 text-xs font-bold rounded-lg bg-[#00d2be] text-[#0d121a] hover:bg-[#14ebd7] flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-md"
                  >
                    {savingEditMilestone ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                    {savingEditMilestone ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
