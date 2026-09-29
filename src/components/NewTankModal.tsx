"use client";

import React, { useState } from "react";
import { PlusCircle, X, Compass } from "lucide-react";
import { UnitSystem } from "@/types";
import { galToL } from "@/lib/units";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  unitSystem: UnitSystem;
  onCreateTank: (data: any) => Promise<void>;
}

export default function NewTankModal({
  isOpen,
  onClose,
  unitSystem,
  onCreateTank,
}: Props) {
  const [tankType, setTankType] = useState<"SALTWATER" | "FRESHWATER">("SALTWATER");
  const [aquascapeStyle, setAquascapeStyle] = useState<string>("mixed");
  const [name, setName] = useState("");
  const [hasSump, setHasSump] = useState(false);
  const [displayVolInput, setDisplayVolInput] = useState(unitSystem === "imperial" ? "20" : "80");
  const [sumpVolInput, setSumpVolInput] = useState(unitSystem === "imperial" ? "5" : "20");
  const [formFactor, setFormFactor] = useState<"nano_cube" | "standard" | "panoramic">("standard");
  const [purpose, setPurpose] = useState("Mixed Reef (Soft, LPS, SPS)");
  const [cycle, setCycle] = useState("Cycled with live bacteria");
  const [setupDate, setSetupDate] = useState(new Date().toISOString().slice(0, 10));
  const [equipment, setEquipment] = useState("AIO filter, titanium heater, flow pump");
  const [lighting, setLighting] = useState("LED Reef Light 9h photoperiod");
  const [submitting, setSubmitting] = useState(false);

  const handleSelectTankType = (type: "SALTWATER" | "FRESHWATER") => {
    setTankType(type);
    if (type === "FRESHWATER") {
      setAquascapeStyle("nature");
      setFormFactor("standard");
      setPurpose("High-Tech Planted Aquascape");
      setEquipment("Canister filter, In-line CO2 diffuser, Chihiros WRGB light, heater");
      setLighting("Full Spectrum WRGB 7h photoperiod");
      setDisplayVolInput(unitSystem === "imperial" ? "15" : "60");
      if (!name) setName("Planted Nature Driftwood");
    } else {
      setAquascapeStyle("mixed");
      setFormFactor("standard");
      setPurpose("Mixed Reef (Soft, LPS, SPS)");
      setEquipment("AIO filter, titanium heater, flow pump");
      setLighting("LED Reef Light 9h photoperiod");
      setDisplayVolInput(unitSystem === "imperial" ? "24" : "90");
      if (name === "Planted Nature Driftwood") setName("");
    }
  };

  const handleSelectStyle = (style: string) => {
    setAquascapeStyle(style);
    // Lagoon only has Rectangular and Wide Peninsula
    if (style === "lagoon" && formFactor === "nano_cube") {
      setFormFactor("standard");
      setDisplayVolInput(unitSystem === "imperial" ? "26" : "100");
    }
  };

  const handleSelectSize = (size: "nano_cube" | "standard" | "panoramic") => {
    setFormFactor(size);
    if (size === "nano_cube") {
      setDisplayVolInput(unitSystem === "imperial" ? (tankType === "FRESHWATER" ? "8" : "10") : (tankType === "FRESHWATER" ? "30" : "40"));
    } else if (size === "standard") {
      setDisplayVolInput(unitSystem === "imperial" ? (tankType === "FRESHWATER" ? "16" : "24") : (tankType === "FRESHWATER" ? "60" : "90"));
    } else if (size === "panoramic") {
      setDisplayVolInput(unitSystem === "imperial" ? (tankType === "FRESHWATER" ? "48" : "60") : (tankType === "FRESHWATER" ? "180" : "240"));
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const dispNum = parseFloat(displayVolInput) || (tankType === "FRESHWATER" ? 60 : 90);
      const displayVolumeLiters = unitSystem === "imperial" ? galToL(dispNum) : dispNum;
      const sumpNum = hasSump ? (parseFloat(sumpVolInput) || 0) : 0;
      const sumpVolumeLiters = hasSump ? (unitSystem === "imperial" ? galToL(sumpNum) : sumpNum) : 0;
      const volumeLiters = hasSump ? displayVolumeLiters + sumpVolumeLiters : displayVolumeLiters;

      await onCreateTank({
        name,
        tankType,
        volumeLiters,
        hasSump,
        displayVolumeLiters,
        sumpVolumeLiters,
        formFactor,
        purpose,
        cycle,
        setupDate,
        equipment,
        lighting,
        aquascapeStyle,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-[#161e2b] border border-[#28364a] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#28364a] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Compass className="text-[#00d2be]" size={20} />
            <h3 className="text-base font-bold text-[#f0f4f8]">
              Create New Aquarium Tank Profile
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#8e9fb5] hover:text-[#f0f4f8]"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tank Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#8e9fb5] mb-1.5">
              Aquarium System Type *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSelectTankType("SALTWATER")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  tankType === "SALTWATER"
                    ? "bg-[#00d2be]/15 border-[#00d2be] text-[#00d2be] shadow-sm"
                    : "bg-[#0f1520] border-[#28364a] text-[#8e9fb5] hover:text-[#f0f4f8] hover:border-[#8e9fb5]"
                }`}
              >
                <span>🐠</span>
                <span>Saltwater (Reef)</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectTankType("FRESHWATER")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  tankType === "FRESHWATER"
                    ? "bg-emerald-500/15 border-emerald-400 text-emerald-400 shadow-sm"
                    : "bg-[#0f1520] border-[#28364a] text-[#8e9fb5] hover:text-[#f0f4f8] hover:border-[#8e9fb5]"
                }`}
              >
                <span>🌿</span>
                <span>Freshwater (Planted)</span>
              </button>
            </div>
          </div>

          {/* Visual Aquascape Style Presets */}
          <div>
            <label className="block text-xs font-semibold text-[#8e9fb5] mb-1.5 flex items-center justify-between">
              <span>Aquarium Style</span>
              <span className="text-[10px] text-[#00d2be] font-medium">Distinct Visual 3D Scapes</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {tankType === "SALTWATER" ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleSelectStyle("mixed")}
                    className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      aquascapeStyle === "mixed"
                        ? "bg-[#00d2be]/15 border-[#00d2be] text-[#00d2be] font-bold ring-1 ring-[#00d2be]"
                        : "bg-[#0f1520] border-[#28364a] text-[#8e9fb5] hover:text-[#f0f4f8] hover:border-[#8e9fb5]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🪸</span>
                        <span className="font-bold text-[#f0f4f8]">Mixed Reef</span>
                      </div>
                      {aquascapeStyle === "mixed" && (
                        <span className="w-2 h-2 rounded-full bg-[#00d2be]" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#8e9fb5] font-normal leading-tight">
                      Frogspawn, Montipora plates & softies under balanced blue/white reef spectrum.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectStyle("lagoon")}
                    className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      aquascapeStyle === "lagoon"
                        ? "bg-[#00d2be]/15 border-[#00d2be] text-[#00d2be] font-bold ring-1 ring-[#00d2be]"
                        : "bg-[#0f1520] border-[#28364a] text-[#8e9fb5] hover:text-[#f0f4f8] hover:border-[#8e9fb5]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🏝️</span>
                        <span className="font-bold text-[#f0f4f8]">Lagoon Reef</span>
                      </div>
                      {aquascapeStyle === "lagoon" && (
                        <span className="w-2 h-2 rounded-full bg-[#00d2be]" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#8e9fb5] font-normal leading-tight">
                      Shallow turquoise water with pink birdsnest, brain corals & pristine white sandbed.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectStyle("sps")}
                    className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      aquascapeStyle === "sps"
                        ? "bg-[#00d2be]/15 border-[#00d2be] text-[#00d2be] font-bold ring-1 ring-[#00d2be]"
                        : "bg-[#0f1520] border-[#28364a] text-[#8e9fb5] hover:text-[#f0f4f8] hover:border-[#8e9fb5]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🔮</span>
                        <span className="font-bold text-[#f0f4f8]">Actinic SPS</span>
                      </div>
                      {aquascapeStyle === "sps" && (
                        <span className="w-2 h-2 rounded-full bg-[#00d2be]" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#8e9fb5] font-normal leading-tight">
                      Deep actinic violet lighting with high-PAR Acropora coral pinnacles.
                    </p>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleSelectStyle("nature")}
                    className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      aquascapeStyle === "nature"
                        ? "bg-emerald-500/15 border-emerald-400 text-emerald-400 font-bold ring-1 ring-emerald-400"
                        : "bg-[#0f1520] border-[#28364a] text-[#8e9fb5] hover:text-[#f0f4f8] hover:border-[#8e9fb5]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🪵</span>
                        <span className="font-bold text-[#f0f4f8]">Nature Driftwood</span>
                      </div>
                      {aquascapeStyle === "nature" && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#8e9fb5] font-normal leading-tight">
                      ADA-style river driftwood branches with lush mosses and anubias.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectStyle("iwagumi")}
                    className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      aquascapeStyle === "iwagumi"
                        ? "bg-emerald-500/15 border-emerald-400 text-emerald-400 font-bold ring-1 ring-emerald-400"
                        : "bg-[#0f1520] border-[#28364a] text-[#8e9fb5] hover:text-[#f0f4f8] hover:border-[#8e9fb5]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base">⛰️</span>
                        <span className="font-bold text-[#f0f4f8]">Iwagumi Stones</span>
                      </div>
                      {aquascapeStyle === "iwagumi" && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#8e9fb5] font-normal leading-tight">
                      Minimalist Japanese dragon stone layout with sweeping Monte Carlo carpet.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectStyle("emerald")}
                    className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      aquascapeStyle === "emerald"
                        ? "bg-emerald-500/15 border-emerald-400 text-emerald-400 font-bold ring-1 ring-emerald-400"
                        : "bg-[#0f1520] border-[#28364a] text-[#8e9fb5] hover:text-[#f0f4f8] hover:border-[#8e9fb5]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🌿</span>
                        <span className="font-bold text-[#f0f4f8]">Dutch Stem Garden</span>
                      </div>
                      {aquascapeStyle === "emerald" && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#8e9fb5] font-normal leading-tight">
                      High-tech Dutch planted aquascape with rich vibrant red and green stem rows.
                    </p>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Form Factor / Sizing Selection */}
          <div>
            <label className="block text-xs font-semibold text-[#8e9fb5] mb-1.5 flex items-center justify-between">
              <span>Tank Size & Proportions</span>
              <span className="text-[10px] text-[#00d2be] font-medium">Distinct Visual Form Factors</span>
            </label>
            <div className={`grid gap-2 ${aquascapeStyle === "lagoon" ? "grid-cols-2" : "grid-cols-3"}`}>
              {aquascapeStyle !== "lagoon" && (
                <button
                  type="button"
                  onClick={() => handleSelectSize("nano_cube")}
                  className={`py-2.5 px-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                    formFactor === "nano_cube"
                      ? "bg-[#00d2be]/15 border-[#00d2be] text-[#00d2be] font-bold ring-1 ring-[#00d2be]"
                      : "bg-[#0f1520] border-[#28364a] text-[#8e9fb5] hover:text-[#f0f4f8]"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>🧊</span>
                    <span className="font-semibold">Nano Cube</span>
                  </div>
                  <p className="text-[10px] text-[#8e9fb5] mt-0.5 opacity-80">1:1 Square (~30–40L)</p>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleSelectSize("standard")}
                className={`py-2.5 px-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                  formFactor === "standard"
                    ? "bg-[#00d2be]/15 border-[#00d2be] text-[#00d2be] font-bold ring-1 ring-[#00d2be]"
                    : "bg-[#0f1520] border-[#28364a] text-[#8e9fb5] hover:text-[#f0f4f8]"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span>📐</span>
                  <span className="font-semibold">Rectangular</span>
                </div>
                <p className="text-[10px] text-[#8e9fb5] mt-0.5 opacity-80">Standard Rimless (~60–120L)</p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectSize("panoramic")}
                className={`py-2.5 px-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                  formFactor === "panoramic"
                    ? "bg-[#00d2be]/15 border-[#00d2be] text-[#00d2be] font-bold ring-1 ring-[#00d2be]"
                    : "bg-[#0f1520] border-[#28364a] text-[#8e9fb5] hover:text-[#f0f4f8]"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span>🌅</span>
                  <span className="font-semibold">Wide Peninsula</span>
                </div>
                <p className="text-[10px] text-[#8e9fb5] mt-0.5 opacity-80">Panoramic Display (~180–300L)</p>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
              Aquarium Name *
            </label>
            <input
              type="text"
              placeholder={tankType === "FRESHWATER" ? "e.g. Driftwood Island, Iwagumi 60P, Dutch Terrace" : "e.g. Office Nano Reef, Frag Tank, Lagoon 50"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-3 py-2 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
              required
            />
          </div>

          {/* Sump Filtration & Volumes */}
          <div className="bg-[#0b1018] border border-[#233144] rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">🌊</span>
                <div>
                  <span className="text-xs font-bold text-[#f0f4f8] block">
                    Sump Filtration System
                  </span>
                  <span className="text-[10px] text-[#8e9fb5]">
                    Does this aquarium use an external under-cabinet sump or rear chamber?
                  </span>
                </div>
              </div>

              {/* Sump Toggle Switch */}
              <div className="flex items-center gap-1.5 bg-[#070b12] p-1 rounded-lg border border-[#233144]">
                <button
                  type="button"
                  onClick={() => setHasSump(false)}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                    !hasSump
                      ? "bg-white/10 text-[#f0f4f8] shadow-sm"
                      : "text-[#8e9fb5] hover:text-[#f0f4f8]"
                  }`}
                >
                  No Sump
                </button>
                <button
                  type="button"
                  onClick={() => setHasSump(true)}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                    hasSump
                      ? "bg-[#00d2be] text-[#080d14] shadow-sm"
                      : "text-[#8e9fb5] hover:text-[#00d2be]"
                  }`}
                >
                  Has Sump
                </button>
              </div>
            </div>

            {hasSump ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-[#1e2a3a]">
                <div>
                  <label className="block text-[11px] font-semibold text-[#8e9fb5] mb-1">
                    Display Tank ({unitSystem === "imperial" ? "Gal" : "L"}) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={displayVolInput}
                    onChange={(e) => setDisplayVolInput(e.target.value)}
                    className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-3 py-1.5 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                    required
                  />
                  <span className="text-[9px] text-[#8e9fb5] mt-0.5 block">
                    Visual vessel size
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#00d2be] mb-1">
                    Sump Volume ({unitSystem === "imperial" ? "Gal" : "L"}) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={sumpVolInput}
                    onChange={(e) => setSumpVolInput(e.target.value)}
                    className="w-full bg-[#0f1520] border border-[#00d2be]/50 focus:border-[#00d2be] rounded-lg px-3 py-1.5 text-xs text-[#f0f4f8] outline-none"
                    required
                  />
                  <span className="text-[9px] text-[#8e9fb5] mt-0.5 block">
                    Operating sump water
                  </span>
                </div>

                <div className="bg-[#0e1622] border border-[#00d2be]/40 rounded-lg p-2.5 flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-[#8e9fb5] uppercase tracking-wider block">
                    Total System Water
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-base font-extrabold text-[#00d2be]">
                      {((parseFloat(displayVolInput) || 0) + (parseFloat(sumpVolInput) || 0)).toFixed(1)}
                    </span>
                    <span className="text-xs text-[#8e9fb5] font-semibold">
                      {unitSystem === "imperial" ? "Gallons" : "Liters"}
                    </span>
                  </div>
                  <span className="text-[9px] text-emerald-400 mt-0.5 block font-medium">
                    ✓ Total water volume
                  </span>
                </div>
              </div>
            ) : (
              <div className="pt-2 border-t border-[#1e2a3a]">
                <label className="block text-[11px] font-semibold text-[#8e9fb5] mb-1">
                  Display & Total Volume ({unitSystem === "imperial" ? "Gallons" : "Liters"}) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  value={displayVolInput}
                  onChange={(e) => setDisplayVolInput(e.target.value)}
                  className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-3 py-1.5 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
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
              value={setupDate}
              onChange={(e) => setSetupDate(e.target.value)}
              className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-3 py-2 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
              Aquarium Style / Purpose
            </label>
            <input
              type="text"
              placeholder="e.g. Mixed Reef (Soft, LPS, SPS), SPS Dominant, Macroalgae Seahorse"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-3 py-2 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
              Cycle Method / Rockwork
            </label>
            <input
              type="text"
              placeholder="e.g. 14-day dark cycle with nitrifying bacteria"
              value={cycle}
              onChange={(e) => setCycle(e.target.value)}
              className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-3 py-2 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
              Hardware & Equipment Stack
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Skimmer, DC return pump, Nero 3 wavemaker, titanium heater"
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-3 py-2 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
              Photoperiod Schedule
            </label>
            <textarea
              rows={2}
              placeholder="e.g. 8h schedule, blues ramp from 11am to 8pm"
              value={lighting}
              onChange={(e) => setLighting(e.target.value)}
              className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-3 py-2 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[#28364a]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#0f1520] text-[#8e9fb5] border border-[#28364a]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !name}
              className="px-5 py-2 text-xs font-bold rounded-lg bg-[#00d2be] text-[#0d121a] hover:bg-[#14ebd7] disabled:opacity-50"
            >
              {submitting ? "Creating Tank..." : "Create Tank Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
