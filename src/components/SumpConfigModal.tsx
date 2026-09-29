"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Tank, UnitSystem } from "@/types";
import { formatVolume, galToL, lToGal } from "@/lib/units";
import {
  Waves,
  X,
  Sliders,
  Sprout,
  Check,
  Plus,
  Loader2,
  Box,
  Layers,
  Sparkles,
  Zap,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tank: Tank;
  unitSystem?: UnitSystem;
  onUpdateTank?: (data: Partial<Tank>) => Promise<void>;
}

export default function SumpConfigModal({
  isOpen,
  onClose,
  tank,
  unitSystem = "metric",
  onUpdateTank,
}: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const isFreshwater = tank.tankType === "FRESHWATER";

  const initDisplayVol =
    typeof tank.displayVolumeLiters === "number" && tank.displayVolumeLiters > 0
      ? tank.displayVolumeLiters
      : tank.volumeLiters || (isFreshwater ? 40 : 80);
  const initSumpVol = tank.sumpVolumeLiters || 0;
  const initRefugiumVol = tank.refugiumVolumeLiters || 0;

  const [hasSump, setHasSump] = useState(Boolean(tank.hasSump));
  const [hasRefugium, setHasRefugium] = useState(Boolean(tank.hasRefugium));
  const [sumpChambers, setSumpChambers] = useState<number>(tank.sumpChambers || 3);

  const [displayVolInput, setDisplayVolInput] = useState(
    unitSystem === "imperial"
      ? (initDisplayVol * 0.264172).toFixed(1)
      : initDisplayVol.toString()
  );
  const [sumpVolInput, setSumpVolInput] = useState(
    unitSystem === "imperial"
      ? (initSumpVol * 0.264172).toFixed(1)
      : initSumpVol.toString()
  );
  const [refugiumVolInput, setRefugiumVolInput] = useState(
    unitSystem === "imperial"
      ? (initRefugiumVol * 0.264172).toFixed(1)
      : initRefugiumVol.toString()
  );

  const [sumpEquipment, setSumpEquipment] = useState(
    tank.sumpEquipment ||
      (isFreshwater
        ? "Mechanical Foam, In-line Heater, DC Return Pump"
        : "Mechanical Fleece / Sock, Protein Skimmer, Return Pump & ATO")
  );
  const [sumpMedia, setSumpMedia] = useState(
    tank.sumpMedia ||
      (isFreshwater
        ? "Bio-rings, coarse foam, activated carbon"
        : "Filter fleece, activated carbon, bio-blocks")
  );
  const [refugiumType, setRefugiumType] = useState(
    tank.refugiumType ||
      (isFreshwater ? "Pothos & Aquatic Moss" : "Chaetomorpha Macroalgae")
  );
  const [refugiumLighting, setRefugiumLighting] = useState(
    tank.refugiumLighting || "Reverse Photoperiod (12h Grow Spectrum)"
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state whenever modal opens or tank changes
  useEffect(() => {
    if (isOpen) {
      const disp =
        typeof tank.displayVolumeLiters === "number" && tank.displayVolumeLiters > 0
          ? tank.displayVolumeLiters
          : tank.volumeLiters || (isFreshwater ? 40 : 80);
      const smp = tank.sumpVolumeLiters || 0;
      const refVol = tank.refugiumVolumeLiters || 0;

      setHasSump(Boolean(tank.hasSump));
      setHasRefugium(Boolean(tank.hasRefugium));
      setSumpChambers(tank.sumpChambers || 3);
      setDisplayVolInput(
        unitSystem === "imperial"
          ? (disp * 0.264172).toFixed(1)
          : disp.toString()
      );
      setSumpVolInput(
        unitSystem === "imperial"
          ? (smp * 0.264172).toFixed(1)
          : smp.toString()
      );
      setRefugiumVolInput(
        unitSystem === "imperial"
          ? (refVol * 0.264172).toFixed(1)
          : refVol.toString()
      );
      setSumpEquipment(
        tank.sumpEquipment ||
          (isFreshwater
            ? "Mechanical Foam, In-line Heater, DC Return Pump"
            : "Mechanical Fleece / Sock, Protein Skimmer, Return Pump & ATO")
      );
      setSumpMedia(
        tank.sumpMedia ||
          (isFreshwater
            ? "Bio-rings, coarse foam, activated carbon"
            : "Filter fleece, activated carbon, bio-blocks")
      );
      setRefugiumType(
        tank.refugiumType ||
          (isFreshwater ? "Pothos & Aquatic Moss" : "Chaetomorpha Macroalgae")
      );
      setRefugiumLighting(
        tank.refugiumLighting || "Reverse Photoperiod (12h Grow Spectrum)"
      );
    }
  }, [isOpen, tank, unitSystem, isFreshwater]);

  if (!isOpen) return null;

  // Real-time calculated volumes for display
  const rawDisp = parseFloat(displayVolInput) || (isFreshwater ? 40 : 80);
  const calcDisplayLiters = unitSystem === "imperial" ? galToL(rawDisp) : rawDisp;

  const rawSump = hasSump ? parseFloat(sumpVolInput) || 0 : 0;
  const calcSumpLiters = hasSump
    ? unitSystem === "imperial"
      ? galToL(rawSump)
      : rawSump
    : 0;

  const rawRefugium = hasRefugium ? parseFloat(refugiumVolInput) || 0 : 0;
  const calcRefugiumLiters = hasRefugium
    ? unitSystem === "imperial"
      ? galToL(rawRefugium)
      : rawRefugium
    : 0;

  const calcTotalLiters = calcDisplayLiters + calcSumpLiters + calcRefugiumLiters;

  const handleAppendItem = (
    currentText: string,
    setText: (val: string) => void,
    item: string
  ) => {
    if (!currentText.trim()) {
      setText(item);
    } else if (!currentText.toLowerCase().includes(item.toLowerCase())) {
      setText(`${currentText.trim()}, ${item}`);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateTank) return;
    setIsSubmitting(true);
    try {
      await onUpdateTank({
        hasSump,
        hasRefugium,
        sumpChambers: hasSump ? sumpChambers : 0,
        displayVolumeLiters: calcDisplayLiters,
        sumpVolumeLiters: calcSumpLiters,
        refugiumVolumeLiters: calcRefugiumLiters,
        volumeLiters: calcTotalLiters,
        sumpEquipment,
        sumpMedia,
        refugiumType,
        refugiumLighting,
      });
      onClose();
    } catch (err) {
      console.error("Failed to update sump/refugium configuration:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const equipmentSuggestions = isFreshwater
    ? [
        "Mechanical Filter Sock",
        "Coarse Foam Mat",
        "In-Line Heater",
        "DC Return Pump",
        "UV Clarifier",
        "CO2 Reactor",
        "Automatic Top-Off (ATO)",
        "Pothos Root Basket",
      ]
    : [
        "Roller Fleece Mat",
        "Filter Socks (200 Micron)",
        "Internal Protein Skimmer",
        "DC Variable Return Pump",
        "Titanium Heater Element",
        "Smart Optical ATO Sensor",
        "UV Sterilizer",
        "Media Reactor (GFO/Carbon)",
        "Calcium Reactor",
      ];

  const mediaSuggestions = isFreshwater
    ? [
        "Siporax Ceramic Rings",
        "Biohome Ultimate",
        "Activated Carbon",
        "Seachem Purigen",
        "Fine Filter Floss",
        "Coarse 20ppi Foam",
        "Substrat Pro",
      ]
    : [
        "MarinePure Bio-Blocks",
        "Activated Carbon (Rox 0.8)",
        "GFO Phosphate Media",
        "Seachem Matrix",
        "Filter Floss / Fleece",
        "Poly-Filter Pad",
        "Brightwell Kold-Steril",
        "Live Rock Rubble",
      ];

  const refugiumTypeSuggestions = isFreshwater
    ? [
        "Pothos & Emerged Ivy",
        "Java Moss / Subwassertang Bed",
        "Floating Salvinia / Red Root Floaters",
        "Volcanic Stone & Bio-Media Haven",
      ]
    : [
        "Chaetomorpha (Chaeto) Tumbler",
        "Caulerpa Prolifera / Feather",
        "Dragon's Breath (Halymenia)",
        "Red Mangrove Shoots & Miracle Mud",
        "Live Rock Rubble & Copepod Haven",
        "Deep Sand Bed (DSB) Nitrate Reducer",
      ];

  const refugiumLightingSuggestions = [
    "Reverse Photoperiod (12h Opposite Main Lights)",
    "24/7 Continuous Macro Growth",
    "High-Intensity Horticultural Grow LED (14h)",
    "Full Spectrum WRGB Flora Spectrum (10h)",
  ];

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-2.5 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-[#141b27] border border-[#28364a] rounded-2xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl relative max-h-[92vh] sm:max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#28364a] pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#00d2be]/15 border border-[#00d2be]/30 flex items-center justify-center text-[#00d2be] shadow-inner">
              <Waves size={18} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#f0f4f8]">
                Sump & Refugium Filtration Architecture
              </h3>
              <p className="text-[11px] text-[#8e9fb5]">
                {tank.name} • Configure filtration chambers, equipment stack, and refugium
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8e9fb5] hover:text-[#f0f4f8] hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* SECTION 1: SYSTEM INCLUSIONS TOGGLES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#0d131d] p-3 rounded-xl border border-[#233144]">
            {/* Sump Toggle Card */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setHasSump(!hasSump)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setHasSump(!hasSump);
                }
              }}
              className={`group/sumptoggle flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
                hasSump
                  ? "bg-[#00d2be]/10 border-[#00d2be]/50 shadow-[0_0_12px_rgba(0,210,190,0.18)] hover:border-[#00d2be] hover:shadow-[0_0_18px_rgba(0,210,190,0.35)] hover:bg-[#00d2be]/15"
                  : "bg-[#141b27]/80 border-[#28364a]/60 hover:border-[#00d2be]/60 hover:bg-[#182335] hover:shadow-[0_0_14px_rgba(0,210,190,0.22)]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    hasSump
                      ? "bg-[#00d2be]/20 text-[#00d2be] shadow-[0_0_10px_rgba(0,210,190,0.3)]"
                      : "bg-white/5 text-[#8e9fb5] group-hover/sumptoggle:text-[#00d2be] group-hover/sumptoggle:bg-[#00d2be]/10"
                  }`}
                >
                  <Waves size={16} />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#f0f4f8] block group-hover/sumptoggle:text-[#00d2be] transition-colors">
                    Under-Cabinet Sump
                  </span>
                  <span className="text-[10px] text-[#8e9fb5] block">
                    External or sump chamber
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setHasSump(!hasSump);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                  hasSump
                    ? "bg-[#00d2be] text-[#080d14] shadow-[0_0_12px_rgba(0,210,190,0.45)] hover:shadow-[0_0_18px_rgba(0,210,190,0.7)] hover:bg-[#14ebd7] hover:scale-105 active:scale-95"
                    : "bg-white/5 border border-white/10 hover:border-[#00d2be]/60 hover:bg-[#00d2be]/15 hover:text-[#00d2be] hover:shadow-[0_0_12px_rgba(0,210,190,0.35)] hover:scale-105 active:scale-95 text-[#8e9fb5]"
                }`}
              >
                {hasSump ? "Installed" : "None"}
              </button>
            </div>

            {/* Refugium Toggle Card */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setHasRefugium(!hasRefugium)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setHasRefugium(!hasRefugium);
                }
              }}
              className={`group/fugetoggle flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
                hasRefugium
                  ? "bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.18)] hover:border-emerald-400 hover:shadow-[0_0_18px_rgba(16,185,129,0.35)] hover:bg-emerald-500/15"
                  : "bg-[#141b27]/80 border-[#28364a]/60 hover:border-emerald-400/60 hover:bg-[#182335] hover:shadow-[0_0_14px_rgba(16,185,129,0.22)]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    hasRefugium
                      ? "bg-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                      : "bg-white/5 text-[#8e9fb5] group-hover/fugetoggle:text-emerald-400 group-hover/fugetoggle:bg-emerald-500/10"
                  }`}
                >
                  <Sprout size={16} />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#f0f4f8] block group-hover/fugetoggle:text-emerald-400 transition-colors">
                    Refugium System
                  </span>
                  <span className="text-[10px] text-[#8e9fb5] block">
                    Macroalgae / Pod haven
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setHasRefugium(!hasRefugium);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                  hasRefugium
                    ? "bg-emerald-400 text-[#080d14] shadow-[0_0_12px_rgba(52,211,153,0.45)] hover:shadow-[0_0_18px_rgba(52,211,153,0.7)] hover:bg-emerald-300 hover:scale-105 active:scale-95"
                    : "bg-white/5 border border-white/10 hover:border-emerald-400/60 hover:bg-emerald-400/15 hover:text-emerald-400 hover:shadow-[0_0_12px_rgba(52,211,153,0.35)] hover:scale-105 active:scale-95 text-[#8e9fb5]"
                }`}
              >
                {hasRefugium ? "Active 🌿" : "None"}
              </button>
            </div>
          </div>

          {/* SECTION 2: SUMP CHAMBERS (When Sump Installed) */}
          {hasSump && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#8e9fb5]">
                Number of Sump Filtration Chambers
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { num: 1, label: "1 Chamber", desc: "Open / Baffleless" },
                  { num: 2, label: "2 Chambers", desc: "Dual Stage" },
                  { num: 3, label: "3 Chambers", desc: "Classic 3-Stage" },
                  { num: 4, label: "4+ Chambers", desc: "Advanced Multi-Bay" },
                ].map((c) => (
                  <button
                    key={c.num}
                    type="button"
                    onClick={() => setSumpChambers(c.num)}
                    className={`py-2 px-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                      sumpChambers === c.num
                        ? "bg-[#00d2be]/15 border-[#00d2be] text-[#00d2be] shadow-[0_0_10px_rgba(0,210,190,0.25)]"
                        : "bg-[#0d131d] border-[#28364a] text-[#8e9fb5] hover:text-[#f0f4f8] hover:border-[#00d2be]/50 hover:bg-[#141d2b] hover:shadow-[0_0_10px_rgba(0,210,190,0.15)]"
                    }`}
                  >
                    <span className="text-xs font-bold block">{c.label}</span>
                    <span className="text-[9px] text-[#8e9fb5] opacity-80 block truncate">
                      {c.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: VOLUME BREAKDOWN & REAL-TIME TRI-PILL */}
          <div className="bg-[#0d131d] p-3 rounded-xl border border-[#233144] space-y-3">
            <span className="text-[11px] font-bold text-[#8e9fb5] uppercase tracking-wider block">
              System Water Volume Distribution ({unitSystem === "imperial" ? "Gallons" : "Litres"})
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Display Volume */}
              <div>
                <label className="block text-[11px] font-semibold text-[#8e9fb5] mb-1">
                  Display Tank Volume *
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  value={displayVolInput}
                  onChange={(e) => setDisplayVolInput(e.target.value)}
                  className="w-full bg-[#141b27] border border-[#28364a] rounded-lg px-2.5 py-1.5 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                  required
                />
              </div>

              {/* Sump Volume */}
              <div>
                <label className="block text-[11px] font-semibold text-[#8e9fb5] mb-1">
                  Sump Water Volume
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  disabled={!hasSump}
                  value={hasSump ? sumpVolInput : "0"}
                  onChange={(e) => setSumpVolInput(e.target.value)}
                  className={`w-full border rounded-lg px-2.5 py-1.5 text-xs outline-none ${
                    hasSump
                      ? "bg-[#141b27] border-[#28364a] text-[#f0f4f8] focus:border-[#00d2be]"
                      : "bg-[#0a0f17] border-white/5 text-[#8e9fb5]/40 cursor-not-allowed"
                  }`}
                />
              </div>

              {/* Refugium Volume */}
              <div>
                <label className="block text-[11px] font-semibold text-[#8e9fb5] mb-1">
                  Refugium Volume
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  disabled={!hasRefugium}
                  value={hasRefugium ? refugiumVolInput : "0"}
                  onChange={(e) => setRefugiumVolInput(e.target.value)}
                  className={`w-full border rounded-lg px-2.5 py-1.5 text-xs outline-none ${
                    hasRefugium
                      ? "bg-[#141b27] border-[#28364a] text-[#f0f4f8] focus:border-emerald-400"
                      : "bg-[#0a0f17] border-white/5 text-[#8e9fb5]/40 cursor-not-allowed"
                  }`}
                />
              </div>
            </div>

            {/* Real-time Dynamic Sum Pill */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#070b12] border border-[#1e2a3a] text-xs">
              <span className="text-[#8e9fb5] text-[11px] font-medium">
                Calculated Total Water System:
              </span>
              <div className="flex items-center gap-1.5 font-mono text-xs">
                <span className="text-[#f0f4f8]">{formatVolume(calcDisplayLiters, unitSystem)}</span>
                {hasSump && (
                  <>
                    <span className="text-white/40">+</span>
                    <span className="text-cyan-300">{formatVolume(calcSumpLiters, unitSystem)} Sump</span>
                  </>
                )}
                {hasRefugium && (
                  <>
                    <span className="text-white/40">+</span>
                    <span className="text-emerald-400">{formatVolume(calcRefugiumLiters, unitSystem)} Refugium</span>
                  </>
                )}
                <span className="text-white/40">=</span>
                <span className="text-[#00d2be] font-extrabold px-1.5 py-0.5 rounded bg-[#00d2be]/15">
                  {formatVolume(calcTotalLiters, unitSystem)}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 4: EQUIPMENT STACK */}
          {hasSump && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#8e9fb5]">
                Sump Hardware & Equipment Stack
              </label>
              <textarea
                rows={2}
                value={sumpEquipment}
                onChange={(e) => setSumpEquipment(e.target.value)}
                placeholder="e.g. Roller fleece, protein skimmer, DC return pump, titanium heater, ATO sensor"
                className="w-full bg-[#0d131d] border border-[#28364a] rounded-lg px-3 py-2 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
              />
              {/* Quick suggestion chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="text-[10px] text-[#8e9fb5]">Quick Add:</span>
                {equipmentSuggestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleAppendItem(sumpEquipment, setSumpEquipment, item)}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] hover:bg-[#00d2be]/20 border border-white/10 hover:border-[#00d2be]/40 text-[#8e9fb5] hover:text-[#00d2be] transition-colors cursor-pointer flex items-center gap-0.5"
                  >
                    <Plus size={9} />
                    <span>{item}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 5: FILTER MEDIA USED */}
          {hasSump && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#8e9fb5]">
                Filter Media Used in Sump
              </label>
              <textarea
                rows={2}
                value={sumpMedia}
                onChange={(e) => setSumpMedia(e.target.value)}
                placeholder="e.g. MarinePure bio-blocks, Rox 0.8 activated carbon, GFO reactor, filter socks"
                className="w-full bg-[#0d131d] border border-[#28364a] rounded-lg px-3 py-2 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
              />
              {/* Quick suggestion chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="text-[10px] text-[#8e9fb5]">Quick Add:</span>
                {mediaSuggestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleAppendItem(sumpMedia, setSumpMedia, item)}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400/40 text-[#8e9fb5] hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-0.5"
                  >
                    <Plus size={9} />
                    <span>{item}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 6: REFUGIUM ADVANCED SETUP (When Refugium Enabled) */}
          {hasRefugium && (
            <div className="bg-[#0b1414] border border-emerald-500/30 p-3.5 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-base">🌿</span>
                <div>
                  <h4 className="text-xs font-bold text-emerald-300">
                    Dedicated Refugium Configuration
                  </h4>
                  <p className="text-[10px] text-[#8e9fb5]">
                    Natural nutrient export, microfauna pod breeding, and pH stabilization
                  </p>
                </div>
              </div>

              {/* Refugium Macroalgae / Media Type */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-[#8e9fb5]">
                  Refugium Macroalgae & Substrate Type
                </label>
                <input
                  type="text"
                  value={refugiumType}
                  onChange={(e) => setRefugiumType(e.target.value)}
                  placeholder="e.g. Chaetomorpha Algae, Caulerpa, Mangrove Shoots & Miracle Mud"
                  className="w-full bg-[#141b27] border border-[#28364a] rounded-lg px-2.5 py-1.5 text-xs text-[#f0f4f8] focus:border-emerald-400 outline-none"
                />
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <span className="text-[10px] text-[#8e9fb5]">Preset:</span>
                  {refugiumTypeSuggestions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setRefugiumType(item)}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-400/40 text-[#8e9fb5] hover:text-emerald-300 transition-colors cursor-pointer"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Refugium Lighting Schedule */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-[#8e9fb5]">
                  Refugium Lighting Spectrum & Photoperiod
                </label>
                <input
                  type="text"
                  value={refugiumLighting}
                  onChange={(e) => setRefugiumLighting(e.target.value)}
                  placeholder="e.g. Reverse Daylight Photoperiod (12h Opposite Main Lights)"
                  className="w-full bg-[#141b27] border border-[#28364a] rounded-lg px-2.5 py-1.5 text-xs text-[#f0f4f8] focus:border-emerald-400 outline-none"
                />
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <span className="text-[10px] text-[#8e9fb5]">Preset:</span>
                  {refugiumLightingSuggestions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setRefugiumLighting(item)}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-400/40 text-[#8e9fb5] hover:text-emerald-300 transition-colors cursor-pointer"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#28364a]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#0f1520] hover:bg-[#182335] text-[#8e9fb5] hover:text-[#f0f4f8] border border-[#28364a] transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-[#00d2be] text-[#0d121a] hover:bg-[#14ebd7] flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-md"
            >
              {isSubmitting ? (
                <Loader2 size={13} className="animate-spin shrink-0" />
              ) : (
                <Check size={13} className="shrink-0" />
              )}
              <span>{isSubmitting ? "Saving..." : "Save Filtration Setup"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
