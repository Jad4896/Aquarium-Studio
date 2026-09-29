"use client";

import React, { useState } from "react";
import { Tank } from "@/types";
import {
  Printer,
  Edit3,
  PhoneCall,
  AlertOctagon,
  CheckSquare,
  Thermometer,
  ShieldAlert,
  Info,
  X,
  Plus,
  Trash2,
} from "lucide-react";

interface Props {
  tank: Tank;
  onUpdateTank: (data: Partial<Tank>) => Promise<void>;
}

export default function PrintableSitterSheetView({ tank, onUpdateTank }: Props) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isFreshwater = tank.tankType === "FRESHWATER";

  // Parse checklist JSON
  let checklist: string[] = [];
  try {
    checklist = JSON.parse(tank.sitterChecklist || "[]");
  } catch (e) {
    checklist = isFreshwater
      ? [
          "Check temperature reading on digital display (~24°C / 75°F).",
          "Ensure ATO reservoir has freshwater (RO/DI water ONLY).",
          "Feed fish & shrimp once daily at lights-on (micro-pellets or pinch of flake).",
          "Check CO2 drop checker is green and filter outflow has surface ripple.",
        ]
      : [
          "Check temperature reading on digital display (~25.5°C / 78°F).",
          "Ensure ATO reservoir has freshwater (RO/DI water ONLY, never saltwater).",
          "Feed fish once daily at lights-on (1/2 cube of frozen mysis shrimp thawed in cup).",
          "Check surface skimmer and overflow weir for normal quiet water level.",
        ];
  }

  if (checklist.length === 0) {
    checklist = isFreshwater
      ? [
          "Check temperature reading on digital display (~24°C / 75°F).",
          "Ensure ATO reservoir has freshwater (RO/DI water ONLY).",
          "Feed fish & shrimp once daily at lights-on (micro-pellets or pinch of flake).",
          "Check CO2 drop checker is green and filter outflow has surface ripple.",
        ]
      : [
          "Check temperature reading on digital display (~25.5°C / 78°F).",
          "Ensure ATO reservoir has freshwater (RO/DI water ONLY, never saltwater).",
          "Feed fish once daily at lights-on (1/2 cube of frozen mysis shrimp thawed in cup).",
          "Check surface skimmer and overflow weir for normal quiet water level.",
        ];
  }

  const [formData, setFormData] = useState({
    sitterTitle:
      tank.sitterTitle ||
      (isFreshwater
        ? "🌿 Freshwater Planted Tank Care & Emergency Instructions"
        : "🐠 Reef Tank Care & Emergency Instructions"),
    sitterContact: tank.sitterContact || "Tank Owner (+1-555-0199)",
    sitterEmergency: tank.sitterEmergency || "Call immediately on leak or equipment failure: +1-555-0199",
    sitterNotes:
      tank.sitterNotes ||
      (isFreshwater
        ? "Do NOT dose any liquid fertilizers or chemicals unless contacted. Ensure aerator/filter outflow stays active."
        : "Do NOT dose any additives unless contacted. In case of power loss, connect battery bubbler to main display."),
    checklistItems: checklist,
  });

  const handlePrint = () => {
    window.print();
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateTank({
        sitterTitle: formData.sitterTitle,
        sitterContact: formData.sitterContact,
        sitterEmergency: formData.sitterEmergency,
        sitterNotes: formData.sitterNotes,
        sitterChecklist: JSON.stringify(formData.checklistItems.filter((i) => i.trim() !== "")),
      });
      setShowEditModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header (Hidden in Print) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-4 bg-[#161e2b] border border-[#28364a] p-4 rounded-xl shadow-lg">
        <div>
          <h2 className="text-lg font-bold text-[#f0f4f8] flex items-center gap-2">
            <Printer className="text-[#00d2be]" size={20} />
            Printable Aquarium Sitter Sheet
          </h2>
          <p className="text-xs text-[#8e9fb5] mt-0.5">
            Leave crystal-clear emergency protocols and daily care instructions for your tank sitter.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0f1520] hover:bg-[#1e293b] text-xs font-semibold text-[#f0f4f8] border border-[#28364a] transition-all"
          >
            <Edit3 size={14} className="text-[#00d2be]" />
            Edit Instructions
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#00d2be] text-[#0d121a] hover:bg-[#14ebd7] text-xs font-bold transition-all shadow-md"
          >
            <Printer size={15} />
            Print / Export PDF
          </button>
        </div>
      </div>

      {/* Printable Sheet Canvas */}
      <div className="sitter-print-card bg-[#161e2b] border border-[#28364a] rounded-2xl p-8 max-w-4xl mx-auto shadow-2xl space-y-6">
        {/* Document Header */}
        <div className="border-b-2 border-[#00d2be] pb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#f0f4f8] tracking-tight">
              {tank.sitterTitle}
            </h1>
            <p className="text-xs font-semibold text-[#00d2be] mt-1 uppercase tracking-wider">
              {tank.name} • {tank.volumeLiters} Liters ({Math.round(tank.volumeLiters * 0.264172)} Gallons) • {tank.purpose}
            </p>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-[#8e9fb5] block">Date Printed</span>
            <span className="text-xs font-bold text-[#f0f4f8]">
              {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </span>
          </div>
        </div>

        {/* Emergency Contacts Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#0f1520] border-2 border-[#ff6b35] rounded-xl p-4 flex items-start gap-3">
            <PhoneCall size={20} className="text-[#ff6b35] shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#ff6b35]">
                Primary Tank Owner Contact
              </span>
              <p className="text-sm font-bold text-[#f0f4f8] mt-0.5">
                {tank.sitterContact}
              </p>
            </div>
          </div>

          <div className="bg-[#0f1520] border-2 border-[#e74c3c] rounded-xl p-4 flex items-start gap-3">
            <AlertOctagon size={20} className="text-[#e74c3c] shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#e74c3c]">
                Emergency Protocol Notice
              </span>
              <p className="text-xs font-semibold text-[#f0f4f8] mt-0.5 leading-relaxed">
                {tank.sitterEmergency}
              </p>
            </div>
          </div>
        </div>

        {/* Key System Baselines */}
        <div className="bg-[#0f1520] border border-[#28364a] rounded-xl p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#8e9fb5] mb-2 flex items-center gap-1.5">
            <Thermometer size={14} className="text-[#00d2be]" />
            Normal Operating Baselines
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[#8e9fb5] block">Target Temp</span>
              <strong className="text-[#f0f4f8]">{tank.tempTarget}°C (~78°F)</strong>
            </div>
            <div>
              <span className="text-[#8e9fb5] block">
                {tank.tankType === "FRESHWATER" ? "Target TDS / Hardness" : "Target Salinity"}
              </span>
              <strong className="text-[#f0f4f8]">
                {tank.tankType === "FRESHWATER"
                  ? `${tank.tdsTarget || 130} ppm (GH ${tank.ghTarget || 5} dGH)`
                  : `${tank.salinityTarget || 1.026} SG (35 ppt)`}
              </strong>
            </div>
            <div>
              <span className="text-[#8e9fb5] block">Photoperiod</span>
              <strong className="text-[#f0f4f8]">Auto Timer Active</strong>
            </div>
            <div>
              <span className="text-[#8e9fb5] block">
                {tank.tankType === "FRESHWATER" ? "Water Level Line" : "Water Sump Level"}
              </span>
              <strong className="text-[#f0f4f8]">
                {tank.tankType === "FRESHWATER" ? "At Rim Waterline" : "Between Weir Marks"}
              </strong>
            </div>
          </div>
        </div>

        {/* Daily Checklist */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#00d2be] flex items-center gap-2">
            <CheckSquare size={16} />
            Daily Sitter Checklist
          </h3>

          <div className="space-y-2">
            {checklist.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-[#0f1520] border border-[#28364a] rounded-xl"
              >
                <div className="w-5 h-5 rounded border-2 border-[#00d2be] flex items-center justify-center shrink-0 mt-0.5" />
                <span className="text-xs text-[#f0f4f8] font-medium leading-relaxed">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Warnings */}
        <div className="bg-rose-950/20 border-2 border-rose-800/60 rounded-xl p-5 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
            <ShieldAlert size={16} />
            CRITICAL RULES & DO-NOT-DOS
          </h3>
          <ul className="text-xs text-[#f0f4f8] space-y-1.5 list-disc list-inside leading-relaxed">
            <li>
              <strong>NEVER add untreated tap water to the aquarium under any circumstances.</strong>{" "}
              {tank.tankType === "FRESHWATER"
                ? "Use only remineralized RO/DI or dechlorinated water as instructed."
                : "Use only pure RO/DI water in the labelled reservoir."}
            </li>
            <li>
              <strong>DO NOT dose any chemicals, fertilizers, or additives</strong> unless explicitly instructed by phone.
            </li>
            <li>
              <strong>DO NOT overfeed!</strong> Uneaten food pollutes the aquarium water and leads to toxic ammonia spikes. If food is not consumed within 2 minutes, stop.
            </li>
            <li>
              <strong>In case of power outage:</strong> Plug battery-powered airstone into the main aquarium display immediately and call the emergency number.
            </li>
          </ul>
        </div>

        {/* Additional Custom Notes */}
        {tank.sitterNotes && (
          <div className="bg-[#0f1520] border border-[#28364a] rounded-xl p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8e9fb5] mb-1.5 flex items-center gap-1.5">
              <Info size={14} className="text-[#00d2be]" />
              Special Care & Equipment Notes
            </h3>
            <p className="text-xs text-[#f0f4f8] leading-relaxed whitespace-pre-line">
              {tank.sitterNotes}
            </p>
          </div>
        )}
      </div>

      {/* Edit Sitter Sheet Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 no-print">
          <div className="bg-[#161e2b] border border-[#28364a] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#28364a] pb-3 mb-4">
              <h3 className="text-base font-bold text-[#f0f4f8] flex items-center gap-2">
                <Edit3 size={18} className="text-[#00d2be]" />
                Edit Sitter Sheet Instructions
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded text-[#8e9fb5] hover:text-[#f0f4f8]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                  Sheet Header Title
                </label>
                <input
                  type="text"
                  value={formData.sitterTitle}
                  onChange={(e) => setFormData({ ...formData, sitterTitle: e.target.value })}
                  className="w-full bg-[#0f1520] border border-[#28364a] rounded px-3 py-1.5 text-xs text-[#f0f4f8] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                  Primary Owner Contact Details
                </label>
                <input
                  type="text"
                  value={formData.sitterContact}
                  onChange={(e) => setFormData({ ...formData, sitterContact: e.target.value })}
                  className="w-full bg-[#0f1520] border border-[#28364a] rounded px-3 py-1.5 text-xs text-[#f0f4f8] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                  Emergency Phone & Protocol
                </label>
                <input
                  type="text"
                  value={formData.sitterEmergency}
                  onChange={(e) => setFormData({ ...formData, sitterEmergency: e.target.value })}
                  className="w-full bg-[#0f1520] border border-[#28364a] rounded px-3 py-1.5 text-xs text-[#f0f4f8] outline-none"
                  required
                />
              </div>

              {/* Checklist editor */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#8e9fb5]">
                    Checklist Items
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        checklistItems: [...formData.checklistItems, ""],
                      })
                    }
                    className="text-[11px] text-[#00d2be] font-bold flex items-center gap-1 hover:underline"
                  >
                    <Plus size={12} /> Add Item
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {formData.checklistItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const newItems = [...formData.checklistItems];
                          newItems[idx] = e.target.value;
                          setFormData({ ...formData, checklistItems: newItems });
                        }}
                        className="flex-1 bg-[#0f1520] border border-[#28364a] rounded px-2.5 py-1 text-xs text-[#f0f4f8] outline-none"
                        placeholder="Task description..."
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newItems = formData.checklistItems.filter((_, i) => i !== idx);
                          setFormData({ ...formData, checklistItems: newItems });
                        }}
                        className="p-1 text-[#8e9fb5] hover:text-rose-400"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                  Special Instructions & Notes
                </label>
                <textarea
                  rows={3}
                  value={formData.sitterNotes}
                  onChange={(e) => setFormData({ ...formData, sitterNotes: e.target.value })}
                  className="w-full bg-[#0f1520] border border-[#28364a] rounded px-3 py-1.5 text-xs text-[#f0f4f8] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#28364a]">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#0f1520] text-[#8e9fb5] border border-[#28364a]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-[#00d2be] text-[#0d121a] hover:bg-[#14ebd7] disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Sitter Instructions"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
