"use client";

import React, { useState } from "react";
import { Tank, WaterParameter, UnitSystem, SalinityUnit } from "@/types";
import { Sliders, CheckCircle2, ArrowUpRight, ArrowDownRight, Compass } from "lucide-react";
import { formatTemp, formatSalinity, cToF, fToC, convertRangeString, sgToPpt, pptToSg } from "@/lib/units";

interface Props {
  tank: Tank;
  latestParam?: WaterParameter;
  unitSystem: UnitSystem;
  salinityUnit: SalinityUnit;
  onUpdateTank: (updated: Partial<Tank>) => Promise<void>;
  onToggleUnitSystem?: () => void;
  onToggleSalinityUnit?: () => void;
}

export default function StickyBanner({
  tank,
  latestParam,
  unitSystem,
  salinityUnit,
  onUpdateTank,
}: Props) {
  const isFreshwater = tank.tankType === "FRESHWATER";
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    // SW
    salinityTarget: tank.salinityTarget || "1.025 - 1.026",
    tempTarget: tank.tempTarget || (isFreshwater ? "22.0 - 24.5" : "25.0 - 26.0"),
    phTarget: tank.phTarget || (isFreshwater ? "6.2 - 6.8" : "8.1 - 8.4"),
    dkhTarget: tank.dkhTarget || "7.8 - 9.0",
    caTarget: tank.caTarget || "400 - 450",
    mgTarget: tank.mgTarget || "1300 - 1400",
    no3Target: tank.no3Target || (isFreshwater ? "5.0 - 15.0" : "5.0 - 15.0"),
    po4Target: tank.po4Target || "0.03 - 0.08",
    // FW
    ammoniaTarget: tank.ammoniaTarget || "0.0 ppm",
    nitriteTarget: tank.nitriteTarget || "0.0 ppm",
    ghTarget: tank.ghTarget || "4.0 - 8.0 dGH",
    khTarget: tank.khTarget || "1.0 - 4.0 dKH",
    tdsTarget: tank.tdsTarget || "120 - 180 ppm",
  });

  // Re-sync form state when tank changes
  React.useEffect(() => {
    setFormData({
      salinityTarget: tank.salinityTarget || "1.025 - 1.026",
      tempTarget: tank.tempTarget || (tank.tankType === "FRESHWATER" ? "22.0 - 24.5" : "25.0 - 26.0"),
      phTarget: tank.phTarget || (tank.tankType === "FRESHWATER" ? "6.2 - 6.8" : "8.1 - 8.4"),
      dkhTarget: tank.dkhTarget || "7.8 - 9.0",
      caTarget: tank.caTarget || "400 - 450",
      mgTarget: tank.mgTarget || "1300 - 1400",
      no3Target: tank.no3Target || "5.0 - 15.0",
      po4Target: tank.po4Target || "0.03 - 0.08",
      ammoniaTarget: tank.ammoniaTarget || "0.0 ppm",
      nitriteTarget: tank.nitriteTarget || "0.0 ppm",
      ghTarget: tank.ghTarget || "4.0 - 8.0 dGH",
      khTarget: tank.khTarget || "1.0 - 4.0 dKH",
      tdsTarget: tank.tdsTarget || "120 - 180 ppm",
    });
  }, [tank]);

  const [isSaving, setIsSaving] = useState(false);

  const parseRange = (rangeStr: string): [number, number] | null => {
    if (!rangeStr) return null;
    const clean = rangeStr.replace(/[^\d.\s-]/g, "").trim();
    const parts = clean.split("-").map((s) => parseFloat(s.trim())).filter((n) => !isNaN(n));
    if (parts.length === 2) {
      return [parts[0], parts[1]];
    }
    if (parts.length === 1) {
      return [0, parts[0]];
    }
    return null;
  };

  const getStatus = (val?: number | null, rangeStr?: string) => {
    if (val === undefined || val === null || !rangeStr) return { status: "unknown", label: "No Data" };
    const range = parseRange(rangeStr);
    if (!range) return { status: "unknown", label: "Set Target" };
    const [min, max] = range;
    if (val < min) return { status: "low", label: "Low", icon: ArrowDownRight };
    if (val > max) return { status: "high", label: "High", icon: ArrowUpRight };
    return { status: "optimal", label: "Optimal", icon: CheckCircle2 };
  };

  const displayTemp = (celsius?: number | null) => {
    if (celsius === undefined || celsius === null) return "-";
    return formatTemp(celsius, unitSystem);
  };

  const displayTempTarget = (targetStr: string) => {
    if (unitSystem === "imperial") {
      return convertRangeString(targetStr, cToF, 1);
    }
    return targetStr;
  };

  const displaySalinity = (sg?: number | null) => {
    if (sg === undefined || sg === null) return "-";
    return formatSalinity(sg, salinityUnit);
  };

  const displaySalinityTarget = (targetStr: string) => {
    if (salinityUnit === "ppt") {
      return convertRangeString(targetStr, sgToPpt, 1);
    }
    return targetStr;
  };

  // 8 Cards for Freshwater or 8 Cards for Saltwater
  const items = isFreshwater
    ? [
        {
          key: "temp",
          name: "Temperature",
          unit: unitSystem === "imperial" ? "°F" : "°C",
          val: latestParam?.temp,
          target: displayTempTarget(tank.tempTarget),
          format: () => displayTemp(latestParam?.temp),
          baseTarget: tank.tempTarget,
        },
        {
          key: "ph",
          name: "pH Level",
          unit: "",
          val: latestParam?.ph,
          target: tank.phTarget,
          format: () => (latestParam?.ph ? latestParam.ph.toFixed(2) : "-"),
          baseTarget: tank.phTarget,
        },
        {
          key: "ammonia",
          name: "Ammonia NH3",
          unit: "ppm",
          val: latestParam?.ammonia,
          target: tank.ammoniaTarget || "0.0 ppm",
          format: () =>
            latestParam?.ammonia !== undefined && latestParam?.ammonia !== null
              ? `${latestParam.ammonia.toFixed(2)} ppm`
              : "-",
          baseTarget: tank.ammoniaTarget || "0.0 ppm",
        },
        {
          key: "nitrite",
          name: "Nitrite NO2",
          unit: "ppm",
          val: latestParam?.nitrite,
          target: tank.nitriteTarget || "0.0 ppm",
          format: () =>
            latestParam?.nitrite !== undefined && latestParam?.nitrite !== null
              ? `${latestParam.nitrite.toFixed(2)} ppm`
              : "-",
          baseTarget: tank.nitriteTarget || "0.0 ppm",
        },
        {
          key: "no3",
          name: "Nitrate NO3",
          unit: "ppm",
          val: latestParam?.no3,
          target: tank.no3Target || "5.0 - 15.0",
          format: () =>
            latestParam?.no3 !== undefined && latestParam?.no3 !== null
              ? `${latestParam.no3.toFixed(1)} ppm`
              : "-",
          baseTarget: tank.no3Target || "5.0 - 15.0",
        },
        {
          key: "gh",
          name: "General Hardness",
          unit: "dGH",
          val: latestParam?.gh,
          target: tank.ghTarget || "4.0 - 8.0 dGH",
          format: () =>
            latestParam?.gh !== undefined && latestParam?.gh !== null
              ? `${latestParam.gh.toFixed(1)} dGH`
              : "-",
          baseTarget: tank.ghTarget || "4.0 - 8.0 dGH",
        },
        {
          key: "kh",
          name: "Carbonate (KH)",
          unit: "dKH",
          val: latestParam?.kh,
          target: tank.khTarget || "1.0 - 4.0 dKH",
          format: () =>
            latestParam?.kh !== undefined && latestParam?.kh !== null
              ? `${latestParam.kh.toFixed(1)} dKH`
              : "-",
          baseTarget: tank.khTarget || "1.0 - 4.0 dKH",
        },
        {
          key: "tds",
          name: "TDS Level",
          unit: "ppm",
          val: latestParam?.tds,
          target: tank.tdsTarget || "120 - 180 ppm",
          format: () =>
            latestParam?.tds !== undefined && latestParam?.tds !== null
              ? `${Math.round(latestParam.tds)} ppm`
              : "-",
          baseTarget: tank.tdsTarget || "120 - 180 ppm",
        },
      ]
    : [
        {
          key: "salinity",
          name: "Salinity",
          unit: salinityUnit === "ppt" ? "ppt" : "SG",
          val: latestParam?.salinity,
          target: displaySalinityTarget(tank.salinityTarget),
          format: () => displaySalinity(latestParam?.salinity),
          baseTarget: tank.salinityTarget,
        },
        {
          key: "temp",
          name: "Temperature",
          unit: unitSystem === "imperial" ? "°F" : "°C",
          val: latestParam?.temp,
          target: displayTempTarget(tank.tempTarget),
          format: () => displayTemp(latestParam?.temp),
          baseTarget: tank.tempTarget,
        },
        {
          key: "ph",
          name: "pH Level",
          unit: "",
          val: latestParam?.ph,
          target: tank.phTarget,
          format: () => (latestParam?.ph ? latestParam.ph.toFixed(2) : "-"),
          baseTarget: tank.phTarget,
        },
        {
          key: "alk",
          name: "Alkalinity",
          unit: "dKH",
          val: latestParam?.alk,
          target: tank.dkhTarget,
          format: () => (latestParam?.alk ? `${latestParam.alk.toFixed(1)} dKH` : "-"),
          baseTarget: tank.dkhTarget,
        },
        {
          key: "ca",
          name: "Calcium",
          unit: "ppm",
          val: latestParam?.ca,
          target: tank.caTarget,
          format: () => (latestParam?.ca ? `${Math.round(latestParam.ca)} ppm` : "-"),
          baseTarget: tank.caTarget,
        },
        {
          key: "mg",
          name: "Magnesium",
          unit: "ppm",
          val: latestParam?.mg,
          target: tank.mgTarget,
          format: () => (latestParam?.mg ? `${Math.round(latestParam.mg)} ppm` : "-"),
          baseTarget: tank.mgTarget,
        },
        {
          key: "no3",
          name: "Nitrate",
          unit: "ppm",
          val: latestParam?.no3,
          target: tank.no3Target,
          format: () => (latestParam?.no3 ? `${latestParam.no3.toFixed(1)} ppm` : "-"),
          baseTarget: tank.no3Target,
        },
        {
          key: "po4",
          name: "Phosphate",
          unit: "ppm",
          val: latestParam?.po4,
          target: tank.po4Target,
          format: () => (latestParam?.po4 ? `${latestParam.po4.toFixed(2)} ppm` : "-"),
          baseTarget: tank.po4Target,
        },
      ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateTank(formData);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="sticky top-0 z-40 bg-[#161e2b]/95 backdrop-blur-md border-b border-[#28364a] shadow-xl px-4 py-2.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Streamlined Parameter Cards (8 cards) */}
          <div className="flex-1 flex 2xl:grid 2xl:grid-cols-8 gap-2.5 overflow-x-auto pb-1 2xl:pb-0 scrollbar-none">
            {items.map((item) => {
              const { status, label } = getStatus(item.val, item.baseTarget);
              const isOptimal = status === "optimal";
              const isLow = status === "low";
              const isHigh = status === "high";

              return (
                <div
                  key={item.key}
                  className="bg-[#0f1520] border border-[#28364a] rounded-xl px-3 py-2 flex flex-col justify-between hover:border-[#00d2be]/50 transition-all shadow-sm min-w-[130px] flex-1 shrink-0 2xl:shrink"
                >
                  {/* Card Header: Title + Status */}
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-[#8e9fb5] tracking-tight">
                      {item.name}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                        isOptimal
                          ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/40"
                          : isLow || isHigh
                          ? "bg-amber-950/80 text-amber-300 border border-amber-800/40"
                          : "bg-slate-800/80 text-slate-400 border border-slate-700/40"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isOptimal
                            ? "bg-emerald-400"
                            : isLow || isHigh
                            ? "bg-amber-400"
                            : "bg-slate-500"
                        }`}
                      />
                      {isOptimal ? "OK" : label}
                    </span>
                  </div>

                  {/* Current Reading */}
                  <div className="my-0.5">
                    <span className="text-base sm:text-lg font-black text-[#f0f4f8] tracking-tight">
                      {item.format()}
                    </span>
                  </div>

                  {/* Target Range */}
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#28364a]/60">
                    <span className="text-[10px] uppercase tracking-wider text-[#8e9fb5]/70 font-semibold">
                      Target
                    </span>
                    <span className="text-[11px] text-[#00d2be] font-bold font-mono">
                      {item.target}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Controls: Edit Targets Button */}
          <div className="flex items-center shrink-0">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-[#0f1520] text-[#00d2be] border border-[#00d2be]/30 hover:bg-[#00d2be] hover:text-[#0d121a] transition-all shadow-sm"
              title="Configure parameter target ranges"
            >
              <Sliders size={14} />
              <span className="hidden sm:inline">Edit Targets</span>
            </button>
          </div>
        </div>
      </div>

      {/* Edit Targets Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#161e2b] border border-[#28364a] rounded-xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-[#f0f4f8] mb-1 flex items-center gap-2">
              <Sliders size={18} className="text-[#00d2be]" />
              Configure {isFreshwater ? "Freshwater" : "Reef"} Target Ranges
            </h3>
            <p className="text-xs text-[#8e9fb5] mb-4">
              Specify your ideal maintenance thresholds for <strong>{tank.name}</strong> ({isFreshwater ? "Freshwater Planted / Shrimp" : "Saltwater Marine Reef"}).
            </p>

            <form onSubmit={handleSave} className="space-y-3">
              {isFreshwater ? (
                // Freshwater Target Inputs
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                      Temp Range (°C)
                    </label>
                    <input
                      type="text"
                      value={formData.tempTarget}
                      onChange={(e) =>
                        setFormData({ ...formData, tempTarget: e.target.value })
                      }
                      className="w-full bg-[#0f1520] border border-[#28364a] rounded-md px-3 py-1.5 text-sm text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                      placeholder="22.0 - 24.5"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                      pH Target Range
                    </label>
                    <input
                      type="text"
                      value={formData.phTarget}
                      onChange={(e) =>
                        setFormData({ ...formData, phTarget: e.target.value })
                      }
                      className="w-full bg-[#0f1520] border border-[#28364a] rounded-md px-3 py-1.5 text-sm text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                      placeholder="6.2 - 6.8"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                      Ammonia NH3 (ppm)
                    </label>
                    <input
                      type="text"
                      value={formData.ammoniaTarget}
                      onChange={(e) =>
                        setFormData({ ...formData, ammoniaTarget: e.target.value })
                      }
                      className="w-full bg-[#0f1520] border border-[#28364a] rounded-md px-3 py-1.5 text-sm text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                      placeholder="0.0 ppm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                      Nitrite NO2 (ppm)
                    </label>
                    <input
                      type="text"
                      value={formData.nitriteTarget}
                      onChange={(e) =>
                        setFormData({ ...formData, nitriteTarget: e.target.value })
                      }
                      className="w-full bg-[#0f1520] border border-[#28364a] rounded-md px-3 py-1.5 text-sm text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                      placeholder="0.0 ppm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                      Nitrate NO3 (ppm)
                    </label>
                    <input
                      type="text"
                      value={formData.no3Target}
                      onChange={(e) =>
                        setFormData({ ...formData, no3Target: e.target.value })
                      }
                      className="w-full bg-[#0f1520] border border-[#28364a] rounded-md px-3 py-1.5 text-sm text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                      placeholder="5.0 - 15.0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                      General Hardness (dGH)
                    </label>
                    <input
                      type="text"
                      value={formData.ghTarget}
                      onChange={(e) =>
                        setFormData({ ...formData, ghTarget: e.target.value })
                      }
                      className="w-full bg-[#0f1520] border border-[#28364a] rounded-md px-3 py-1.5 text-sm text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                      placeholder="4.0 - 8.0 dGH"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                      Carbonate Hardness (dKH)
                    </label>
                    <input
                      type="text"
                      value={formData.khTarget}
                      onChange={(e) =>
                        setFormData({ ...formData, khTarget: e.target.value })
                      }
                      className="w-full bg-[#0f1520] border border-[#28364a] rounded-md px-3 py-1.5 text-sm text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                      placeholder="1.0 - 4.0 dKH"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                      Total Dissolved Solids (TDS ppm)
                    </label>
                    <input
                      type="text"
                      value={formData.tdsTarget}
                      onChange={(e) =>
                        setFormData({ ...formData, tdsTarget: e.target.value })
                      }
                      className="w-full bg-[#0f1520] border border-[#28364a] rounded-md px-3 py-1.5 text-sm text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                      placeholder="120 - 180 ppm"
                      required
                    />
                  </div>
                </div>
              ) : (
                // Saltwater Target Inputs
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                      Salinity Range (SG)
                    </label>
                    <input
                      type="text"
                      value={formData.salinityTarget}
                      onChange={(e) =>
                        setFormData({ ...formData, salinityTarget: e.target.value })
                      }
                      className="w-full bg-[#0f1520] border border-[#28364a] rounded-md px-3 py-1.5 text-sm text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                      placeholder="1.025 - 1.026"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                      Temp Range (°C)
                    </label>
                    <input
                      type="text"
                      value={formData.tempTarget}
                      onChange={(e) =>
                        setFormData({ ...formData, tempTarget: e.target.value })
                      }
                      className="w-full bg-[#0f1520] border border-[#28364a] rounded-md px-3 py-1.5 text-sm text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                      placeholder="25.0 - 26.0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                      pH Target Range
                    </label>
                    <input
                      type="text"
                      value={formData.phTarget}
                      onChange={(e) =>
                        setFormData({ ...formData, phTarget: e.target.value })
                      }
                      className="w-full bg-[#0f1520] border border-[#28364a] rounded-md px-3 py-1.5 text-sm text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                      placeholder="8.1 - 8.4"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                      Alkalinity Range (dKH)
                    </label>
                    <input
                      type="text"
                      value={formData.dkhTarget}
                      onChange={(e) =>
                        setFormData({ ...formData, dkhTarget: e.target.value })
                      }
                      className="w-full bg-[#0f1520] border border-[#28364a] rounded-md px-3 py-1.5 text-sm text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                      placeholder="7.8 - 9.0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                      Calcium (ppm)
                    </label>
                    <input
                      type="text"
                      value={formData.caTarget}
                      onChange={(e) =>
                        setFormData({ ...formData, caTarget: e.target.value })
                      }
                      className="w-full bg-[#0f1520] border border-[#28364a] rounded-md px-3 py-1.5 text-sm text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                      placeholder="400 - 450"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                      Magnesium (ppm)
                    </label>
                    <input
                      type="text"
                      value={formData.mgTarget}
                      onChange={(e) =>
                        setFormData({ ...formData, mgTarget: e.target.value })
                      }
                      className="w-full bg-[#0f1520] border border-[#28364a] rounded-md px-3 py-1.5 text-sm text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                      placeholder="1300 - 1400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                      Nitrate (ppm)
                    </label>
                    <input
                      type="text"
                      value={formData.no3Target}
                      onChange={(e) =>
                        setFormData({ ...formData, no3Target: e.target.value })
                      }
                      className="w-full bg-[#0f1520] border border-[#28364a] rounded-md px-3 py-1.5 text-sm text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                      placeholder="5.0 - 15.0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                      Phosphate (ppm)
                    </label>
                    <input
                      type="text"
                      value={formData.po4Target}
                      onChange={(e) =>
                        setFormData({ ...formData, po4Target: e.target.value })
                      }
                      className="w-full bg-[#0f1520] border border-[#28364a] rounded-md px-3 py-1.5 text-sm text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                      placeholder="0.03 - 0.08"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-[#28364a]">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#0f1520] text-[#8e9fb5] hover:text-[#f0f4f8] border border-[#28364a]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-[#00d2be] text-[#0d121a] hover:bg-[#14ebd7] disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Targets"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
