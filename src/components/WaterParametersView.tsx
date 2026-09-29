"use client";

import React, { useState } from "react";
import { WaterParameter, Tank, UnitSystem, SalinityUnit } from "@/types";
import {
  Droplet,
  PlusCircle,
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  FileText,
  X,
  Calendar,
  Activity,
  Check,
  Copy,
  Pin,
  Clock,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import {
  formatTemp,
  formatSalinity,
  formatVolume,
  cToF,
  fToC,
  lToGal,
  galToL,
  convertRangeString,
  sgToPpt,
  pptToSg,
} from "@/lib/units";

interface Props {
  parameters: WaterParameter[];
  tank: Tank;
  unitSystem: UnitSystem;
  salinityUnit: SalinityUnit;
  onAddParameter: (param: any) => Promise<void>;
  onDeleteParameter: (id: string) => Promise<void>;
  onPinRecipeToNotes?: (
    recipe: string,
    customTitle?: string,
    customTag?: string
  ) => Promise<void>;
}

export default function WaterParametersView({
  parameters,
  tank,
  unitSystem,
  salinityUnit,
  onAddParameter,
  onDeleteParameter,
  onPinRecipeToNotes,
}: Props) {
  const [showForm, setShowForm] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLog, setSelectedLog] = useState<WaterParameter | null>(null);
  const [copiedLog, setCopiedLog] = useState(false);
  const [pinnedLogSuccess, setPinnedLogSuccess] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [moodFilter, setMoodFilter] = useState("all");

  const isFreshwater = tank.tankType === "FRESHWATER";

  const getInitialFormData = () => ({
    date: new Date().toISOString().slice(0, 16),
    salinity: salinityUnit === "ppt" ? "35.0" : "1.025",
    temp: unitSystem === "imperial" ? (isFreshwater ? "74.3" : "77.9") : (isFreshwater ? "23.5" : "25.5"),
    ph: isFreshwater ? "6.50" : "8.25",
    alk: "8.3",
    ca: "430",
    mg: "1350",
    no3: "10.0",
    po4: "0.04",
    ammonia: "0.00",
    nitrite: "0.00",
    gh: "5.0",
    kh: "1.5",
    tds: "130",
    wcVol: "0",
    mood: "Thriving 😍",
    notes: "",
  });

  const [formData, setFormData] = useState(getInitialFormData);

  // Re-sync form inputs when active tank changes
  React.useEffect(() => {
    setFormData(getInitialFormData());
  }, [tank.id, tank.tankType]);

  // Synchronize form inputs if user toggles units from header
  React.useEffect(() => {
    setFormData((prev) => {
      let nextTemp = prev.temp;
      const t = parseFloat(prev.temp);
      if (!isNaN(t)) {
        if (unitSystem === "imperial" && t < 45) {
          nextTemp = cToF(t).toString();
        } else if (unitSystem === "metric" && t > 45) {
          nextTemp = fToC(t).toString();
        }
      }

      let nextSal = prev.salinity;
      const s = parseFloat(prev.salinity);
      if (!isNaN(s)) {
        if (salinityUnit === "ppt" && s < 2.0) {
          nextSal = sgToPpt(s).toString();
        } else if (salinityUnit === "sg" && s > 2.0) {
          nextSal = pptToSg(s).toString();
        }
      }

      return {
        ...prev,
        temp: nextTemp,
        salinity: nextSal,
      };
    });
  }, [unitSystem, salinityUnit]);

  const parseRange = (rangeStr?: string | null): [number, number] | null => {
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

  const isOutOfRange = (val?: number | null, rangeStr?: string | null) => {
    if (val === undefined || val === null || !rangeStr) return false;
    const range = parseRange(rangeStr);
    if (!range) return false;
    return val < range[0] || val > range[1];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Standardize to database storage (metric °C, SG, Liters)
      let storedTemp = parseFloat(formData.temp);
      if (unitSystem === "imperial") {
        storedTemp = fToC(storedTemp);
      }

      let storedSalinity = parseFloat(formData.salinity);
      if (salinityUnit === "ppt" || storedSalinity > 2.0) {
        storedSalinity = pptToSg(storedSalinity);
      }

      let storedWc = parseFloat(formData.wcVol) || 0;
      if (unitSystem === "imperial" && storedWc > 0) {
        storedWc = galToL(storedWc);
      }

      const payload = isFreshwater
        ? {
            tankId: tank.id,
            date: formData.date,
            temp: storedTemp,
            ph: formData.ph,
            ammonia: formData.ammonia,
            nitrite: formData.nitrite,
            no3: formData.no3,
            gh: formData.gh,
            kh: formData.kh,
            tds: formData.tds,
            wcLiters: storedWc,
            mood: formData.mood,
            notes: formData.notes,
          }
        : {
            tankId: tank.id,
            date: formData.date,
            salinity: storedSalinity,
            temp: storedTemp,
            ph: formData.ph,
            alk: formData.alk,
            ca: formData.ca,
            mg: formData.mg,
            no3: formData.no3,
            po4: formData.po4,
            wcLiters: storedWc,
            mood: formData.mood,
            notes: formData.notes,
          };

      await onAddParameter(payload);

      setFormData({
        ...formData,
        date: new Date().toISOString().slice(0, 16),
        notes: "",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLog = (log: WaterParameter) => {
    const text = isFreshwater
      ? `Freshwater Parameter Test Log (${tank.name})
Date: ${new Date(log.date).toLocaleString()}
Vitality: ${log.mood || "Thriving"}
Temperature: ${unitSystem === "imperial" ? `${cToF(log.temp)}°F` : `${log.temp.toFixed(1)}°C`} (Target: ${tank.tempTarget})
pH Level: ${log.ph.toFixed(2)} (Target: ${tank.phTarget})
Ammonia (NH3): ${log.ammonia !== undefined && log.ammonia !== null ? `${log.ammonia.toFixed(2)} ppm` : "N/A"} (Target: ${tank.ammoniaTarget || "0.0 ppm"})
Nitrite (NO2): ${log.nitrite !== undefined && log.nitrite !== null ? `${log.nitrite.toFixed(2)} ppm` : "N/A"} (Target: ${tank.nitriteTarget || "0.0 ppm"})
Nitrate (NO3): ${log.no3 !== undefined && log.no3 !== null ? `${log.no3.toFixed(1)} ppm` : "N/A"} (Target: ${tank.no3Target || "5.0 - 15.0 ppm"})
General Hardness (GH): ${log.gh !== undefined && log.gh !== null ? `${log.gh.toFixed(1)} dGH` : "N/A"} (Target: ${tank.ghTarget || "4.0 - 8.0 dGH"})
Carbonate Hardness (KH): ${log.kh !== undefined && log.kh !== null ? `${log.kh.toFixed(1)} dKH` : "N/A"} (Target: ${tank.khTarget || "1.0 - 4.0 dKH"})
TDS: ${log.tds !== undefined && log.tds !== null ? `${Math.round(log.tds)} ppm` : "N/A"} (Target: ${tank.tdsTarget || "120 - 180 ppm"})
Water Change: ${log.wcLiters ? `${log.wcLiters} L` : "None"}

Notes & Observations:
${log.notes || "None"}`
      : `Reef Water Parameter Test Log (${tank.name})
Date: ${new Date(log.date).toLocaleString()}
Reef Mood: ${log.mood || "Thriving"}
Salinity: ${formatSalinity(log.salinity ?? 35, salinityUnit)} (Target: ${tank.salinityTarget})
Temperature: ${unitSystem === "imperial" ? `${cToF(log.temp)}°F` : `${log.temp.toFixed(1)}°C`} (Target: ${tank.tempTarget})
pH Level: ${log.ph.toFixed(2)} (Target: ${tank.phTarget})
Alkalinity: ${log.alk !== undefined && log.alk !== null ? `${log.alk.toFixed(1)} dKH` : "-"} (Target: ${tank.dkhTarget})
Calcium: ${log.ca !== undefined && log.ca !== null ? `${Math.round(log.ca)} ppm` : "-"} (Target: ${tank.caTarget})
Magnesium: ${log.mg !== undefined && log.mg !== null ? `${Math.round(log.mg)} ppm` : "-"} (Target: ${tank.mgTarget})
Nitrate (NO3): ${log.no3 !== undefined && log.no3 !== null ? `${log.no3.toFixed(1)} ppm` : "-"} (Target: ${tank.no3Target})
Phosphate (PO4): ${log.po4 !== undefined && log.po4 !== null ? `${log.po4.toFixed(2)} ppm` : "-"} (Target: ${tank.po4Target})
Water Change: ${log.wcLiters ? `${log.wcLiters} L` : "None"}

Notes & Observations:
${log.notes || "None"}`;

    navigator.clipboard.writeText(text);
    setCopiedLog(true);
    setTimeout(() => setCopiedLog(false), 2500);
  };

  const handlePinLogToNotes = async (log: WaterParameter) => {
    if (!onPinRecipeToNotes) return;
    const title = `💧 Test Log: ${new Date(log.date).toLocaleDateString()} (${log.mood || "Tank Test"})`;
    const text = isFreshwater
      ? `Date & Time: ${new Date(log.date).toLocaleString()}
Vitality: ${log.mood || "Thriving"}

Measured Parameters:
• Temp: ${unitSystem === "imperial" ? `${cToF(log.temp)}°F` : `${log.temp.toFixed(1)}°C`}
• pH: ${log.ph.toFixed(2)}
• Ammonia (NH3): ${log.ammonia !== undefined && log.ammonia !== null ? `${log.ammonia.toFixed(2)} ppm` : "N/A"}
• Nitrite (NO2): ${log.nitrite !== undefined && log.nitrite !== null ? `${log.nitrite.toFixed(2)} ppm` : "N/A"}
• Nitrate (NO3): ${log.no3 !== undefined && log.no3 !== null ? `${log.no3.toFixed(1)} ppm` : "N/A"}
• General Hardness: ${log.gh !== undefined && log.gh !== null ? `${log.gh.toFixed(1)} dGH` : "N/A"}
• Carbonate Hardness: ${log.kh !== undefined && log.kh !== null ? `${log.kh.toFixed(1)} dKH` : "N/A"}
• Total Dissolved Solids: ${log.tds !== undefined && log.tds !== null ? `${Math.round(log.tds)} ppm` : "N/A"}
${log.wcLiters ? `• Water Change: ${log.wcLiters} L\n` : ""}
Observations & Husbandry:
${log.notes || "None"}`
      : `Date & Time: ${new Date(log.date).toLocaleString()}
Mood / Vitality: ${log.mood || "Thriving"}

Measured Parameters:
• Salinity: ${formatSalinity(log.salinity ?? 35, salinityUnit)}
• Temp: ${unitSystem === "imperial" ? `${cToF(log.temp)}°F` : `${log.temp.toFixed(1)}°C`}
• pH: ${log.ph.toFixed(2)}
• Alkalinity: ${log.alk !== undefined && log.alk !== null ? `${log.alk.toFixed(1)} dKH` : "-"}
• Calcium: ${log.ca !== undefined && log.ca !== null ? `${Math.round(log.ca)} ppm` : "-"}
• Magnesium: ${log.mg !== undefined && log.mg !== null ? `${Math.round(log.mg)} ppm` : "-"}
• Nitrate (NO3): ${log.no3 !== undefined && log.no3 !== null ? `${log.no3.toFixed(1)} ppm` : "-"}
• Phosphate (PO4): ${log.po4 !== undefined && log.po4 !== null ? `${log.po4.toFixed(2)} ppm` : "-"}
${log.wcLiters ? `• Water Change: ${log.wcLiters} L\n` : ""}
Husbandry Notes & Observations:
${log.notes || "None"}`;

    await onPinRecipeToNotes(text, title, "test-log");
    setPinnedLogSuccess(true);
    setTimeout(() => setPinnedLogSuccess(false), 2500);
  };

  const filteredParams = parameters.filter((p) => {
    if (moodFilter === "all") return true;
    return p.mood?.includes(moodFilter);
  });

  const totalPages = Math.ceil(filteredParams.length / pageSize) || 1;
  const paginatedParams = filteredParams.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const exportCSV = () => {
    const headers = isFreshwater
      ? [
          "Date",
          `Temp (${unitSystem === "imperial" ? "°F" : "°C"})`,
          "pH",
          "Ammonia (ppm)",
          "Nitrite (ppm)",
          "Nitrate (ppm)",
          "GH (dGH)",
          "KH (dKH)",
          "TDS (ppm)",
          `WC (${unitSystem === "imperial" ? "Gal" : "L"})`,
          "Vitality",
          "Notes",
        ]
      : [
          "Date",
          `Salinity (${salinityUnit.toUpperCase()})`,
          `Temp (${unitSystem === "imperial" ? "°F" : "°C"})`,
          "pH",
          "Alk (dKH)",
          "Calcium (ppm)",
          "Magnesium (ppm)",
          "Nitrate (ppm)",
          "Phosphate (ppm)",
          `WC (${unitSystem === "imperial" ? "Gal" : "L"})`,
          "Mood",
          "Notes",
        ];

    const rows = parameters.map((p) =>
      isFreshwater
        ? [
            new Date(p.date).toLocaleString(),
            unitSystem === "imperial" ? cToF(p.temp) : p.temp,
            p.ph,
            p.ammonia ?? "",
            p.nitrite ?? "",
            p.no3 ?? "",
            p.gh ?? "",
            p.kh ?? "",
            p.tds ?? "",
            unitSystem === "imperial" ? (p.wcLiters ? lToGal(p.wcLiters) : 0) : (p.wcLiters || 0),
            `"${p.mood || ""}"`,
            `"${(p.notes || "").replace(/"/g, '""')}"`,
          ]
        : [
            new Date(p.date).toLocaleString(),
            formatSalinity(p.salinity ?? 35, salinityUnit),
            unitSystem === "imperial" ? cToF(p.temp) : p.temp,
            p.ph,
            p.alk ?? "",
            p.ca ?? "",
            p.mg ?? "",
            p.no3 ?? "",
            p.po4 ?? "",
            unitSystem === "imperial" ? (p.wcLiters ? lToGal(p.wcLiters) : 0) : (p.wcLiters || 0),
            `"${p.mood || ""}"`,
            `"${(p.notes || "").replace(/"/g, '""')}"`,
          ]
    );

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `water_log_${tank.name.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#161e2b] border border-[#28364a] p-4 rounded-xl shadow-lg">
        <div>
          <h2 className="text-lg font-bold text-[#f0f4f8] flex items-center gap-2">
            <Droplet className="text-[#00d2be]" size={20} />
            Water Testing Log & Chemistry Archive
          </h2>
          <p className="text-xs text-[#8e9fb5] mt-0.5">
            Log water test measurements, track water changes, and view parameter history in{" "}
            <strong>{unitSystem === "imperial" ? "Imperial (°F / Gal)" : "Metric (°C / L)"}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f1520] text-[#8e9fb5] hover:text-[#f0f4f8] border border-[#28364a] text-xs font-semibold"
          >
            <Download size={13} />
            Export CSV
          </button>

          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#00d2be] text-[#0d121a] hover:bg-[#14ebd7] text-xs font-bold transition-all shadow-md"
          >
            <PlusCircle size={14} />
            {showForm ? "Hide Form" : "Log New Test"}
          </button>
        </div>
      </div>

      {/* Log Form */}
      {showForm && (
        <div className="bg-[#161e2b] border border-[#00d2be]/30 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#28364a] pb-3 mb-4">
            <h3 className="font-bold text-sm text-[#f0f4f8] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00d2be]" />
              New Water Parameter Test Entry
            </h3>
            <span className="text-xs text-[#8e9fb5]">
              Active System: <strong className="text-[#00d2be]">{tank.name} ({formatVolume(tank.volumeLiters, unitSystem)})</strong>
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isFreshwater ? (
              // Freshwater Input Fields
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#8e9fb5] mb-1">
                    Test Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-2.5 py-1.5 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#8e9fb5] mb-1">
                    Temp ({unitSystem === "imperial" ? "°F" : "°C"}){" "}
                    <span className="text-[#00d2be]">
                      [{unitSystem === "imperial" ? convertRangeString(tank.tempTarget, cToF, 1) : tank.tempTarget}]
                    </span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.temp}
                    onChange={(e) => setFormData({ ...formData, temp: e.target.value })}
                    className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-2.5 py-1.5 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#8e9fb5] mb-1">
                    pH Level <span className="text-[#00d2be]">[{tank.phTarget}]</span>
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={formData.ph}
                    onChange={(e) => setFormData({ ...formData, ph: e.target.value })}
                    className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-2.5 py-1.5 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#8e9fb5] mb-1">
                    Ammonia NH3 (ppm){" "}
                    <span className="text-[#00d2be]">[{tank.ammoniaTarget || "0.0 ppm"}]</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.ammonia}
                    onChange={(e) => setFormData({ ...formData, ammonia: e.target.value })}
                    className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-2.5 py-1.5 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#8e9fb5] mb-1">
                    Nitrite NO2 (ppm){" "}
                    <span className="text-[#00d2be]">[{tank.nitriteTarget || "0.0 ppm"}]</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.nitrite}
                    onChange={(e) => setFormData({ ...formData, nitrite: e.target.value })}
                    className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-2.5 py-1.5 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#8e9fb5] mb-1">
                    Nitrate NO3 (ppm){" "}
                    <span className="text-[#00d2be]">[{tank.no3Target || "5.0 - 15.0"}]</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.no3}
                    onChange={(e) => setFormData({ ...formData, no3: e.target.value })}
                    className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-2.5 py-1.5 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#8e9fb5] mb-1">
                    General Hardness (dGH){" "}
                    <span className="text-[#00d2be]">[{tank.ghTarget || "4.0 - 8.0 dGH"}]</span>
                  </label>
                  <input
                    type="number"
                    step="0.2"
                    value={formData.gh}
                    onChange={(e) => setFormData({ ...formData, gh: e.target.value })}
                    className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-2.5 py-1.5 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#8e9fb5] mb-1">
                    Carbonate KH (dKH){" "}
                    <span className="text-[#00d2be]">[{tank.khTarget || "1.0 - 4.0 dKH"}]</span>
                  </label>
                  <input
                    type="number"
                    step="0.2"
                    value={formData.kh}
                    onChange={(e) => setFormData({ ...formData, kh: e.target.value })}
                    className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-2.5 py-1.5 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#8e9fb5] mb-1">
                    TDS Level (ppm){" "}
                    <span className="text-[#00d2be]">[{tank.tdsTarget || "120 - 180 ppm"}]</span>
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={formData.tds}
                    onChange={(e) => setFormData({ ...formData, tds: e.target.value })}
                    className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-2.5 py-1.5 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#8e9fb5] mb-1">
                    Water Change Vol ({unitSystem === "imperial" ? "Gal" : "L"})
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.wcVol}
                    onChange={(e) => setFormData({ ...formData, wcVol: e.target.value })}
                    className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-2.5 py-1.5 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                  />
                </div>
              </div>
            ) : (
              // Saltwater Input Fields
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#8e9fb5] mb-1">
                    Test Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-2.5 py-1.5 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#8e9fb5] mb-1">
                    Salinity ({salinityUnit.toUpperCase()}){" "}
                    <span className="text-[#00d2be]">
                      [{salinityUnit === "ppt" ? convertRangeString(tank.salinityTarget, sgToPpt, 1) : tank.salinityTarget}]
                    </span>
                  </label>
                  <input
                    type="number"
                    step={salinityUnit === "ppt" ? "0.1" : "0.0005"}
                    value={formData.salinity}
                    onChange={(e) => setFormData({ ...formData, salinity: e.target.value })}
                    className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-2.5 py-1.5 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#8e9fb5] mb-1">
                    Temp ({unitSystem === "imperial" ? "°F" : "°C"}){" "}
                    <span className="text-[#00d2be]">
                      [{unitSystem === "imperial" ? convertRangeString(tank.tempTarget, cToF, 1) : tank.tempTarget}]
                    </span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.temp}
                    onChange={(e) => setFormData({ ...formData, temp: e.target.value })}
                    className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-2.5 py-1.5 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#8e9fb5] mb-1">
                    pH Level <span className="text-[#00d2be]">[{tank.phTarget}]</span>
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={formData.ph}
                    onChange={(e) => setFormData({ ...formData, ph: e.target.value })}
                    className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-2.5 py-1.5 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#8e9fb5] mb-1">
                    Alkalinity (dKH) <span className="text-[#00d2be]">[{tank.dkhTarget}]</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.alk}
                    onChange={(e) => setFormData({ ...formData, alk: e.target.value })}
                    className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-2.5 py-1.5 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#8e9fb5] mb-1">
                    Calcium (ppm) <span className="text-[#00d2be]">[{tank.caTarget}]</span>
                  </label>
                  <input
                    type="number"
                    step="5"
                    value={formData.ca}
                    onChange={(e) => setFormData({ ...formData, ca: e.target.value })}
                    className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-2.5 py-1.5 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#8e9fb5] mb-1">
                    Magnesium (ppm) <span className="text-[#00d2be]">[{tank.mgTarget}]</span>
                  </label>
                  <input
                    type="number"
                    step="10"
                    value={formData.mg}
                    onChange={(e) => setFormData({ ...formData, mg: e.target.value })}
                    className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-2.5 py-1.5 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#8e9fb5] mb-1">
                    Nitrate NO3 (ppm) <span className="text-[#00d2be]">[{tank.no3Target}]</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.no3}
                    onChange={(e) => setFormData({ ...formData, no3: e.target.value })}
                    className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-2.5 py-1.5 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#8e9fb5] mb-1">
                    Phosphate PO4 (ppm) <span className="text-[#00d2be]">[{tank.po4Target}]</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.po4}
                    onChange={(e) => setFormData({ ...formData, po4: e.target.value })}
                    className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-2.5 py-1.5 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#8e9fb5] mb-1">
                    Water Change Vol ({unitSystem === "imperial" ? "Gal" : "L"})
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.wcVol}
                    onChange={(e) => setFormData({ ...formData, wcVol: e.target.value })}
                    className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-2.5 py-1.5 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#8e9fb5] mb-1">
                  {isFreshwater ? "Planted Vitality / System Vitality" : "Reef Mood / System Vitality"}
                </label>
                <select
                  value={formData.mood}
                  onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
                  className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-3 py-1.5 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                >
                  {isFreshwater ? (
                    <>
                      <option value="Thriving 😍">Thriving 😍 (Vibrant pearling & high activity)</option>
                      <option value="Happy 😊">Happy 😊 (Healthy plant growth, clear water)</option>
                      <option value="Stable 😐">Stable 😐 (Steady balance)</option>
                      <option value="Concerned 😟">Concerned 😟 (Algae onset / slow growth)</option>
                      <option value="Critical ⚠️">Critical ⚠️ (Ammonia spike / shrimp stress)</option>
                    </>
                  ) : (
                    <>
                      <option value="Thriving 😍">Thriving 😍 (Vibrant, high polyp extension)</option>
                      <option value="Happy 😊">Happy 😊 (Healthy, normal behavior)</option>
                      <option value="Stable 😐">Stable 😐 (No noticeable changes)</option>
                      <option value="Concerned 😟">Concerned 😟 (Slight pale color/retraction)</option>
                      <option value="Critical ⚠️">Critical ⚠️ (STN/RTN, emergency check)</option>
                    </>
                  )}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-[#8e9fb5] mb-1">
                  Test Observations, Livestock Additions & Husbandry Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={
                    isFreshwater
                      ? "e.g. 50% RO/DI water change with Bee Shrimp GH+ remineralizer, dosed APT Complete, Monte Carlo pearling, shrimp active."
                      : "e.g. Water change done, corals fully expanded, dosed trace iodine, skimmer cup cleaned."
                  }
                  rows={2}
                  className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-3 py-2 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none resize-y"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-lg bg-[#00d2be] text-[#0d121a] hover:bg-[#14ebd7] text-xs font-bold transition-all shadow-md disabled:opacity-50"
              >
                {isSubmitting ? "Recording Log..." : "Save Test Log"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* History Table */}
      <div className="bg-[#161e2b] border border-[#28364a] rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#28364a] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#f0f4f8]">
              Parameter History Log ({filteredParams.length} tests)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-[#8e9fb5]">
              <Filter size={13} />
              <span>Filter:</span>
              <select
                value={moodFilter}
                onChange={(e) => {
                  setMoodFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-[#0f1520] border border-[#28364a] rounded px-2 py-1 text-xs text-[#f0f4f8] outline-none"
              >
                <option value="all">All Vitalities</option>
                <option value="Thriving">Thriving 😍</option>
                <option value="Happy">Happy 😊</option>
                <option value="Stable">Stable 😐</option>
                <option value="Concerned">Concerned 😟</option>
                <option value="Critical">Critical ⚠️</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#8e9fb5]">
              <span>Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-[#0f1520] border border-[#28364a] rounded px-2 py-1 text-xs text-[#f0f4f8] outline-none"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#0f1520] border-b border-[#28364a] text-[#8e9fb5] font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-3">Date</th>
                {isFreshwater ? (
                  <>
                    <th className="py-2.5 px-3">Temp ({unitSystem === "imperial" ? "°F" : "°C"})</th>
                    <th className="py-2.5 px-3">pH</th>
                    <th className="py-2.5 px-3">Ammonia (NH3)</th>
                    <th className="py-2.5 px-3">Nitrite (NO2)</th>
                    <th className="py-2.5 px-3">Nitrate (NO3)</th>
                    <th className="py-2.5 px-3">GH (dGH)</th>
                    <th className="py-2.5 px-3">KH (dKH)</th>
                    <th className="py-2.5 px-3">TDS (ppm)</th>
                  </>
                ) : (
                  <>
                    <th className="py-2.5 px-3">Salinity ({salinityUnit.toUpperCase()})</th>
                    <th className="py-2.5 px-3">Temp ({unitSystem === "imperial" ? "°F" : "°C"})</th>
                    <th className="py-2.5 px-3">pH</th>
                    <th className="py-2.5 px-3">dKH</th>
                    <th className="py-2.5 px-3">Calcium</th>
                    <th className="py-2.5 px-3">Magnesium</th>
                    <th className="py-2.5 px-3">NO3</th>
                    <th className="py-2.5 px-3">PO4</th>
                  </>
                )}
                <th className="py-2.5 px-3">WC ({unitSystem === "imperial" ? "Gal" : "L"})</th>
                <th className="py-2.5 px-3">{isFreshwater ? "Vitality" : "Mood"}</th>
                <th className="py-2.5 px-3">Notes</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#28364a]">
              {paginatedParams.length === 0 ? (
                <tr>
                  <td colSpan={13} className="text-center py-8 text-[#8e9fb5]">
                    No water parameter tests recorded yet.
                  </td>
                </tr>
              ) : (
                paginatedParams.map((p) => {
                  const outTemp = isOutOfRange(p.temp, tank.tempTarget);
                  const outPh = isOutOfRange(p.ph, tank.phTarget);

                  // SW Out of range checks
                  const outSal = isOutOfRange(p.salinity, tank.salinityTarget);
                  const outAlk = isOutOfRange(p.alk, tank.dkhTarget);
                  const outCa = isOutOfRange(p.ca, tank.caTarget);
                  const outMg = isOutOfRange(p.mg, tank.mgTarget);
                  const outNo3 = isOutOfRange(p.no3, tank.no3Target);
                  const outPo4 = isOutOfRange(p.po4, tank.po4Target);

                  // FW Out of range checks
                  const outAmmonia = isOutOfRange(p.ammonia, tank.ammoniaTarget || "0.0 ppm") || (p.ammonia !== undefined && p.ammonia !== null && p.ammonia > 0.05);
                  const outNitrite = isOutOfRange(p.nitrite, tank.nitriteTarget || "0.0 ppm") || (p.nitrite !== undefined && p.nitrite !== null && p.nitrite > 0.05);
                  const outGh = isOutOfRange(p.gh, tank.ghTarget || "4.0 - 8.0 dGH");
                  const outKh = isOutOfRange(p.kh, tank.khTarget || "1.0 - 4.0 dKH");
                  const outTds = isOutOfRange(p.tds, tank.tdsTarget || "120 - 180 ppm");

                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedLog(p)}
                      className="hover:bg-[#1e293b]/70 cursor-pointer transition-colors group"
                      title="Click to view full test details & complete notes"
                    >
                      <td className="py-3 px-3 font-medium text-[#f0f4f8] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>
                            {new Date(p.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </td>

                      {isFreshwater ? (
                        <>
                          <td
                            className={`py-3 px-3 font-mono ${
                              outTemp ? "text-amber-400 bg-amber-950/20" : "text-[#f0f4f8]"
                            }`}
                          >
                            {unitSystem === "imperial" ? `${cToF(p.temp)}°F` : `${p.temp.toFixed(1)}°C`}
                          </td>

                          <td
                            className={`py-3 px-3 font-mono ${
                              outPh ? "text-amber-400 bg-amber-950/20" : "text-[#f0f4f8]"
                            }`}
                          >
                            {p.ph.toFixed(2)}
                          </td>

                          <td
                            className={`py-3 px-3 font-mono ${
                              outAmmonia ? "text-rose-400 font-bold bg-rose-950/30" : "text-emerald-400"
                            }`}
                          >
                            {p.ammonia !== undefined && p.ammonia !== null ? p.ammonia.toFixed(2) : "-"}
                          </td>

                          <td
                            className={`py-3 px-3 font-mono ${
                              outNitrite ? "text-rose-400 font-bold bg-rose-950/30" : "text-emerald-400"
                            }`}
                          >
                            {p.nitrite !== undefined && p.nitrite !== null ? p.nitrite.toFixed(2) : "-"}
                          </td>

                          <td
                            className={`py-3 px-3 font-mono ${
                              outNo3 ? "text-amber-400 bg-amber-950/20" : "text-[#f0f4f8]"
                            }`}
                          >
                            {p.no3 !== undefined && p.no3 !== null ? p.no3.toFixed(1) : "-"}
                          </td>

                          <td
                            className={`py-3 px-3 font-mono font-bold ${
                              outGh ? "text-amber-400 bg-amber-950/20" : "text-[#00d2be]"
                            }`}
                          >
                            {p.gh !== undefined && p.gh !== null ? p.gh.toFixed(1) : "-"}
                          </td>

                          <td
                            className={`py-3 px-3 font-mono ${
                              outKh ? "text-amber-400 bg-amber-950/20" : "text-[#f0f4f8]"
                            }`}
                          >
                            {p.kh !== undefined && p.kh !== null ? p.kh.toFixed(1) : "-"}
                          </td>

                          <td
                            className={`py-3 px-3 font-mono font-bold ${
                              outTds ? "text-amber-400 bg-amber-950/20" : "text-[#00d2be]"
                            }`}
                          >
                            {p.tds !== undefined && p.tds !== null ? Math.round(p.tds) : "-"}
                          </td>
                        </>
                      ) : (
                        <>
                          <td
                            className={`py-3 px-3 font-mono font-bold ${
                              outSal ? "text-amber-400 bg-amber-950/20" : "text-[#f0f4f8]"
                            }`}
                          >
                            {formatSalinity(p.salinity ?? 35, salinityUnit)}
                          </td>

                          <td
                            className={`py-3 px-3 font-mono ${
                              outTemp ? "text-amber-400 bg-amber-950/20" : "text-[#f0f4f8]"
                            }`}
                          >
                            {unitSystem === "imperial" ? `${cToF(p.temp)}°F` : `${p.temp.toFixed(1)}°C`}
                          </td>

                          <td
                            className={`py-3 px-3 font-mono ${
                              outPh ? "text-amber-400 bg-amber-950/20" : "text-[#f0f4f8]"
                            }`}
                          >
                            {p.ph.toFixed(2)}
                          </td>

                          <td
                            className={`py-3 px-3 font-mono font-bold ${
                              outAlk ? "text-amber-400 bg-amber-950/20" : "text-[#00d2be]"
                            }`}
                          >
                            {p.alk !== undefined && p.alk !== null ? p.alk.toFixed(1) : "-"}
                          </td>

                          <td
                            className={`py-3 px-3 font-mono ${
                              outCa ? "text-amber-400 bg-amber-950/20" : "text-[#f0f4f8]"
                            }`}
                          >
                            {p.ca !== undefined && p.ca !== null ? Math.round(p.ca) : "-"}
                          </td>

                          <td
                            className={`py-3 px-3 font-mono ${
                              outMg ? "text-amber-400 bg-amber-950/20" : "text-[#f0f4f8]"
                            }`}
                          >
                            {p.mg !== undefined && p.mg !== null ? Math.round(p.mg) : "-"}
                          </td>

                          <td
                            className={`py-3 px-3 font-mono ${
                              outNo3 ? "text-amber-400 bg-amber-950/20" : "text-[#f0f4f8]"
                            }`}
                          >
                            {p.no3 !== undefined && p.no3 !== null ? p.no3.toFixed(1) : "-"}
                          </td>

                          <td
                            className={`py-3 px-3 font-mono ${
                              outPo4 ? "text-amber-400 bg-amber-950/20" : "text-[#f0f4f8]"
                            }`}
                          >
                            {p.po4 !== undefined && p.po4 !== null ? p.po4.toFixed(2) : "-"}
                          </td>
                        </>
                      )}

                      <td className="py-3 px-3 text-[#8e9fb5] whitespace-nowrap font-mono">
                        {p.wcLiters
                          ? unitSystem === "imperial"
                            ? `${lToGal(p.wcLiters)} gal`
                            : `${p.wcLiters} L`
                          : "-"}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#0f1520] border border-[#28364a] text-[#f0f4f8]">
                          {p.mood || "Thriving"}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-[#8e9fb5] max-w-[200px]" title={p.notes || ""}>
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="truncate">{p.notes || "-"}</span>
                          {p.notes && (
                            <span className="shrink-0 text-[10px] text-[#00d2be] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                              <Eye size={10} /> View
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => setSelectedLog(p)}
                            className="p-1.5 rounded text-[#8e9fb5] hover:text-[#00d2be] hover:bg-[#00d2be]/10 transition-colors"
                            title="View full log details and uncompressed notes"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Delete this test entry?")) {
                                onDeleteParameter(p.id);
                              }
                            }}
                            className="p-1.5 rounded text-[#8e9fb5] hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                            title="Delete test log"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="p-3 border-t border-[#28364a] flex items-center justify-between text-xs text-[#8e9fb5]">
          <div>
            Showing{" "}
            <span className="text-[#f0f4f8] font-bold">
              {filteredParams.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
            </span>{" "}
            to{" "}
            <span className="text-[#f0f4f8] font-bold">
              {Math.min(currentPage * pageSize, filteredParams.length)}
            </span>{" "}
            of{" "}
            <span className="text-[#f0f4f8] font-bold">
              {filteredParams.length}
            </span>{" "}
            entries
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage <= 1}
              className="p-1.5 rounded bg-[#0f1520] border border-[#28364a] disabled:opacity-40 hover:text-[#f0f4f8]"
            >
              <ChevronLeft size={14} />
            </button>

            <span className="px-2 font-semibold text-[#f0f4f8]">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded bg-[#0f1520] border border-[#28364a] disabled:opacity-40 hover:text-[#f0f4f8]"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Full Water Parameter Log Details & Complete Notes Modal */}
      {selectedLog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedLog(null);
          }}
        >
          <div className="bg-[#161e2b] border border-[#28364a] rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#28364a] flex items-center justify-between bg-[#0f1520]/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00d2be]/10 border border-[#00d2be]/30 flex items-center justify-center text-[#00d2be] shrink-0">
                  <Activity size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#f0f4f8]">
                      {isFreshwater ? "Freshwater Chemistry Log" : "Marine Reef Chemistry Log"}
                    </h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#161e2b] border border-[#28364a] text-[#00d2be] font-medium">
                      {selectedLog.mood || "Thriving 😍"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#8e9fb5] mt-0.5">
                    <Calendar size={13} className="text-[#00d2be]" />
                    <span>
                      {new Date(selectedLog.date).toLocaleString(undefined, {
                        dateStyle: "full",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 rounded-lg text-[#8e9fb5] hover:text-[#f0f4f8] hover:bg-[#1e293b] transition-colors"
                title="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 custom-scrollbar text-xs">
              {/* Chemistry Cards Grid */}
              <div>
                <h4 className="text-xs font-semibold text-[#8e9fb5] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Droplet size={13} className="text-[#00d2be]" />
                  Measured Water Chemistry
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {isFreshwater ? (
                    // Freshwater Details Cards
                    <>
                      {/* Temperature */}
                      {(() => {
                        const out = isOutOfRange(selectedLog.temp, tank.tempTarget);
                        return (
                          <div
                            className={`p-3 rounded-xl border transition-all ${
                              out
                                ? "bg-amber-950/20 border-amber-500/40"
                                : "bg-[#0f1520] border-[#28364a]"
                            }`}
                          >
                            <div className="flex items-center justify-between text-[#8e9fb5] mb-1">
                              <span className="font-medium">Temperature</span>
                              {out ? (
                                <span className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5">
                                  <AlertTriangle size={10} /> Alert
                                </span>
                              ) : (
                                <span className="text-[10px] text-[#00d2be] font-bold flex items-center gap-0.5">
                                  <Check size={10} /> Optimal
                                </span>
                              )}
                            </div>
                            <div className="text-base font-bold font-mono text-[#f0f4f8]">
                              {unitSystem === "imperial"
                                ? `${cToF(selectedLog.temp)}°F`
                                : `${selectedLog.temp.toFixed(1)}°C`}
                            </div>
                            <div className="text-[10px] text-[#8e9fb5] mt-0.5">
                              Target: {tank.tempTarget}
                            </div>
                          </div>
                        );
                      })()}

                      {/* pH */}
                      {(() => {
                        const out = isOutOfRange(selectedLog.ph, tank.phTarget);
                        return (
                          <div
                            className={`p-3 rounded-xl border transition-all ${
                              out
                                ? "bg-amber-950/20 border-amber-500/40"
                                : "bg-[#0f1520] border-[#28364a]"
                            }`}
                          >
                            <div className="flex items-center justify-between text-[#8e9fb5] mb-1">
                              <span className="font-medium">pH Level</span>
                              {out ? (
                                <span className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5">
                                  <AlertTriangle size={10} /> Alert
                                </span>
                              ) : (
                                <span className="text-[10px] text-[#00d2be] font-bold flex items-center gap-0.5">
                                  <Check size={10} /> Optimal
                                </span>
                              )}
                            </div>
                            <div className="text-base font-bold font-mono text-[#f0f4f8]">
                              {selectedLog.ph.toFixed(2)}
                            </div>
                            <div className="text-[10px] text-[#8e9fb5] mt-0.5">
                              Target: {tank.phTarget}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Ammonia */}
                      {(() => {
                        const out = isOutOfRange(selectedLog.ammonia, tank.ammoniaTarget || "0.0 ppm") || (selectedLog.ammonia ?? 0) > 0.05;
                        return (
                          <div
                            className={`p-3 rounded-xl border transition-all ${
                              out
                                ? "bg-rose-950/30 border-rose-500/50"
                                : "bg-[#0f1520] border-[#28364a]"
                            }`}
                          >
                            <div className="flex items-center justify-between text-[#8e9fb5] mb-1">
                              <span className="font-medium">Ammonia (NH3)</span>
                              {out ? (
                                <span className="text-[10px] text-rose-400 font-bold flex items-center gap-0.5">
                                  <AlertTriangle size={10} /> Danger
                                </span>
                              ) : (
                                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                                  <Check size={10} /> Safe
                                </span>
                              )}
                            </div>
                            <div className={`text-base font-bold font-mono ${out ? "text-rose-400" : "text-emerald-400"}`}>
                              {selectedLog.ammonia !== undefined && selectedLog.ammonia !== null
                                ? `${selectedLog.ammonia.toFixed(2)} ppm`
                                : "-"}
                            </div>
                            <div className="text-[10px] text-[#8e9fb5] mt-0.5">
                              Target: {tank.ammoniaTarget || "0.0 ppm"}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Nitrite */}
                      {(() => {
                        const out = isOutOfRange(selectedLog.nitrite, tank.nitriteTarget || "0.0 ppm") || (selectedLog.nitrite ?? 0) > 0.05;
                        return (
                          <div
                            className={`p-3 rounded-xl border transition-all ${
                              out
                                ? "bg-rose-950/30 border-rose-500/50"
                                : "bg-[#0f1520] border-[#28364a]"
                            }`}
                          >
                            <div className="flex items-center justify-between text-[#8e9fb5] mb-1">
                              <span className="font-medium">Nitrite (NO2)</span>
                              {out ? (
                                <span className="text-[10px] text-rose-400 font-bold flex items-center gap-0.5">
                                  <AlertTriangle size={10} /> Danger
                                </span>
                              ) : (
                                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                                  <Check size={10} /> Safe
                                </span>
                              )}
                            </div>
                            <div className={`text-base font-bold font-mono ${out ? "text-rose-400" : "text-emerald-400"}`}>
                              {selectedLog.nitrite !== undefined && selectedLog.nitrite !== null
                                ? `${selectedLog.nitrite.toFixed(2)} ppm`
                                : "-"}
                            </div>
                            <div className="text-[10px] text-[#8e9fb5] mt-0.5">
                              Target: {tank.nitriteTarget || "0.0 ppm"}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Nitrate */}
                      {(() => {
                        const out = isOutOfRange(selectedLog.no3, tank.no3Target);
                        return (
                          <div
                            className={`p-3 rounded-xl border transition-all ${
                              out
                                ? "bg-amber-950/20 border-amber-500/40"
                                : "bg-[#0f1520] border-[#28364a]"
                            }`}
                          >
                            <div className="flex items-center justify-between text-[#8e9fb5] mb-1">
                              <span className="font-medium">Nitrate (NO3)</span>
                              {out ? (
                                <span className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5">
                                  <AlertTriangle size={10} /> Alert
                                </span>
                              ) : (
                                <span className="text-[10px] text-[#00d2be] font-bold flex items-center gap-0.5">
                                  <Check size={10} /> Optimal
                                </span>
                              )}
                            </div>
                            <div className="text-base font-bold font-mono text-[#f0f4f8]">
                              {selectedLog.no3 !== undefined && selectedLog.no3 !== null
                                ? `${selectedLog.no3.toFixed(1)} ppm`
                                : "-"}
                            </div>
                            <div className="text-[10px] text-[#8e9fb5] mt-0.5">
                              Target: {tank.no3Target || "5.0 - 15.0"}
                            </div>
                          </div>
                        );
                      })()}

                      {/* GH */}
                      {(() => {
                        const out = isOutOfRange(selectedLog.gh, tank.ghTarget || "4.0 - 8.0 dGH");
                        return (
                          <div
                            className={`p-3 rounded-xl border transition-all ${
                              out
                                ? "bg-amber-950/20 border-amber-500/40"
                                : "bg-[#0f1520] border-[#28364a]"
                            }`}
                          >
                            <div className="flex items-center justify-between text-[#8e9fb5] mb-1">
                              <span className="font-medium">General Hardness</span>
                              {out ? (
                                <span className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5">
                                  <AlertTriangle size={10} /> Alert
                                </span>
                              ) : (
                                <span className="text-[10px] text-[#00d2be] font-bold flex items-center gap-0.5">
                                  <Check size={10} /> Optimal
                                </span>
                              )}
                            </div>
                            <div className="text-base font-bold font-mono text-[#00d2be]">
                              {selectedLog.gh !== undefined && selectedLog.gh !== null
                                ? `${selectedLog.gh.toFixed(1)} dGH`
                                : "-"}
                            </div>
                            <div className="text-[10px] text-[#8e9fb5] mt-0.5">
                              Target: {tank.ghTarget || "4.0 - 8.0 dGH"}
                            </div>
                          </div>
                        );
                      })()}

                      {/* KH */}
                      {(() => {
                        const out = isOutOfRange(selectedLog.kh, tank.khTarget || "1.0 - 4.0 dKH");
                        return (
                          <div
                            className={`p-3 rounded-xl border transition-all ${
                              out
                                ? "bg-amber-950/20 border-amber-500/40"
                                : "bg-[#0f1520] border-[#28364a]"
                            }`}
                          >
                            <div className="flex items-center justify-between text-[#8e9fb5] mb-1">
                              <span className="font-medium">Carbonate (KH)</span>
                              {out ? (
                                <span className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5">
                                  <AlertTriangle size={10} /> Alert
                                </span>
                              ) : (
                                <span className="text-[10px] text-[#00d2be] font-bold flex items-center gap-0.5">
                                  <Check size={10} /> Optimal
                                </span>
                              )}
                            </div>
                            <div className="text-base font-bold font-mono text-[#f0f4f8]">
                              {selectedLog.kh !== undefined && selectedLog.kh !== null
                                ? `${selectedLog.kh.toFixed(1)} dKH`
                                : "-"}
                            </div>
                            <div className="text-[10px] text-[#8e9fb5] mt-0.5">
                              Target: {tank.khTarget || "1.0 - 4.0 dKH"}
                            </div>
                          </div>
                        );
                      })()}

                      {/* TDS */}
                      {(() => {
                        const out = isOutOfRange(selectedLog.tds, tank.tdsTarget || "120 - 180 ppm");
                        return (
                          <div
                            className={`p-3 rounded-xl border transition-all ${
                              out
                                ? "bg-amber-950/20 border-amber-500/40"
                                : "bg-[#0f1520] border-[#28364a]"
                            }`}
                          >
                            <div className="flex items-center justify-between text-[#8e9fb5] mb-1">
                              <span className="font-medium">TDS Level</span>
                              {out ? (
                                <span className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5">
                                  <AlertTriangle size={10} /> Alert
                                </span>
                              ) : (
                                <span className="text-[10px] text-[#00d2be] font-bold flex items-center gap-0.5">
                                  <Check size={10} /> Optimal
                                </span>
                              )}
                            </div>
                            <div className="text-base font-bold font-mono text-[#00d2be]">
                              {selectedLog.tds !== undefined && selectedLog.tds !== null
                                ? `${Math.round(selectedLog.tds)} ppm`
                                : "-"}
                            </div>
                            <div className="text-[10px] text-[#8e9fb5] mt-0.5">
                              Target: {tank.tdsTarget || "120 - 180 ppm"}
                            </div>
                          </div>
                        );
                      })()}
                    </>
                  ) : (
                    // Saltwater Details Cards
                    <>
                      {/* Salinity */}
                      {(() => {
                        const out = isOutOfRange(selectedLog.salinity, tank.salinityTarget);
                        return (
                          <div
                            className={`p-3 rounded-xl border transition-all ${
                              out
                                ? "bg-amber-950/20 border-amber-500/40"
                                : "bg-[#0f1520] border-[#28364a]"
                            }`}
                          >
                            <div className="flex items-center justify-between text-[#8e9fb5] mb-1">
                              <span className="font-medium">Salinity</span>
                              {out ? (
                                <span className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5">
                                  <AlertTriangle size={10} /> Alert
                                </span>
                              ) : (
                                <span className="text-[10px] text-[#00d2be] font-bold flex items-center gap-0.5">
                                  <Check size={10} /> Optimal
                                </span>
                              )}
                            </div>
                            <div className="text-base font-bold font-mono text-[#f0f4f8]">
                              {formatSalinity(selectedLog.salinity ?? 35, salinityUnit)}
                            </div>
                            <div className="text-[10px] text-[#8e9fb5] mt-0.5">
                              Target: {tank.salinityTarget}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Temperature */}
                      {(() => {
                        const out = isOutOfRange(selectedLog.temp, tank.tempTarget);
                        return (
                          <div
                            className={`p-3 rounded-xl border transition-all ${
                              out
                                ? "bg-amber-950/20 border-amber-500/40"
                                : "bg-[#0f1520] border-[#28364a]"
                            }`}
                          >
                            <div className="flex items-center justify-between text-[#8e9fb5] mb-1">
                              <span className="font-medium">Temperature</span>
                              {out ? (
                                <span className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5">
                                  <AlertTriangle size={10} /> Alert
                                </span>
                              ) : (
                                <span className="text-[10px] text-[#00d2be] font-bold flex items-center gap-0.5">
                                  <Check size={10} /> Optimal
                                </span>
                              )}
                            </div>
                            <div className="text-base font-bold font-mono text-[#f0f4f8]">
                              {unitSystem === "imperial"
                                ? `${cToF(selectedLog.temp)}°F`
                                : `${selectedLog.temp.toFixed(1)}°C`}
                            </div>
                            <div className="text-[10px] text-[#8e9fb5] mt-0.5">
                              Target: {tank.tempTarget}
                            </div>
                          </div>
                        );
                      })()}

                      {/* pH */}
                      {(() => {
                        const out = isOutOfRange(selectedLog.ph, tank.phTarget);
                        return (
                          <div
                            className={`p-3 rounded-xl border transition-all ${
                              out
                                ? "bg-amber-950/20 border-amber-500/40"
                                : "bg-[#0f1520] border-[#28364a]"
                            }`}
                          >
                            <div className="flex items-center justify-between text-[#8e9fb5] mb-1">
                              <span className="font-medium">pH Level</span>
                              {out ? (
                                <span className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5">
                                  <AlertTriangle size={10} /> Alert
                                </span>
                              ) : (
                                <span className="text-[10px] text-[#00d2be] font-bold flex items-center gap-0.5">
                                  <Check size={10} /> Optimal
                                </span>
                              )}
                            </div>
                            <div className="text-base font-bold font-mono text-[#f0f4f8]">
                              {selectedLog.ph.toFixed(2)}
                            </div>
                            <div className="text-[10px] text-[#8e9fb5] mt-0.5">
                              Target: {tank.phTarget}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Alkalinity */}
                      {(() => {
                        const out = isOutOfRange(selectedLog.alk, tank.dkhTarget);
                        return (
                          <div
                            className={`p-3 rounded-xl border transition-all ${
                              out
                                ? "bg-amber-950/20 border-amber-500/40"
                                : "bg-[#0f1520] border-[#28364a]"
                            }`}
                          >
                            <div className="flex items-center justify-between text-[#8e9fb5] mb-1">
                              <span className="font-medium">Alkalinity</span>
                              {out ? (
                                <span className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5">
                                  <AlertTriangle size={10} /> Alert
                                </span>
                              ) : (
                                <span className="text-[10px] text-[#00d2be] font-bold flex items-center gap-0.5">
                                  <Check size={10} /> Optimal
                                </span>
                              )}
                            </div>
                            <div className="text-base font-bold font-mono text-[#00d2be]">
                              {selectedLog.alk !== undefined && selectedLog.alk !== null ? selectedLog.alk.toFixed(1) : "-"} dKH
                            </div>
                            <div className="text-[10px] text-[#8e9fb5] mt-0.5">
                              Target: {tank.dkhTarget}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Calcium */}
                      {(() => {
                        const out = isOutOfRange(selectedLog.ca, tank.caTarget);
                        return (
                          <div
                            className={`p-3 rounded-xl border transition-all ${
                              out
                                ? "bg-amber-950/20 border-amber-500/40"
                                : "bg-[#0f1520] border-[#28364a]"
                            }`}
                          >
                            <div className="flex items-center justify-between text-[#8e9fb5] mb-1">
                              <span className="font-medium">Calcium</span>
                              {out ? (
                                <span className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5">
                                  <AlertTriangle size={10} /> Alert
                                </span>
                              ) : (
                                <span className="text-[10px] text-[#00d2be] font-bold flex items-center gap-0.5">
                                  <Check size={10} /> Optimal
                                </span>
                              )}
                            </div>
                            <div className="text-base font-bold font-mono text-[#f0f4f8]">
                              {selectedLog.ca !== undefined && selectedLog.ca !== null ? `${Math.round(selectedLog.ca)} ppm` : "-"}
                            </div>
                            <div className="text-[10px] text-[#8e9fb5] mt-0.5">
                              Target: {tank.caTarget}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Magnesium */}
                      {(() => {
                        const out = isOutOfRange(selectedLog.mg, tank.mgTarget);
                        return (
                          <div
                            className={`p-3 rounded-xl border transition-all ${
                              out
                                ? "bg-amber-950/20 border-amber-500/40"
                                : "bg-[#0f1520] border-[#28364a]"
                            }`}
                          >
                            <div className="flex items-center justify-between text-[#8e9fb5] mb-1">
                              <span className="font-medium">Magnesium</span>
                              {out ? (
                                <span className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5">
                                  <AlertTriangle size={10} /> Alert
                                </span>
                              ) : (
                                <span className="text-[10px] text-[#00d2be] font-bold flex items-center gap-0.5">
                                  <Check size={10} /> Optimal
                                </span>
                              )}
                            </div>
                            <div className="text-base font-bold font-mono text-[#f0f4f8]">
                              {selectedLog.mg !== undefined && selectedLog.mg !== null ? `${Math.round(selectedLog.mg)} ppm` : "-"}
                            </div>
                            <div className="text-[10px] text-[#8e9fb5] mt-0.5">
                              Target: {tank.mgTarget}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Nitrate */}
                      {(() => {
                        const out = isOutOfRange(selectedLog.no3, tank.no3Target);
                        return (
                          <div
                            className={`p-3 rounded-xl border transition-all ${
                              out
                                ? "bg-amber-950/20 border-amber-500/40"
                                : "bg-[#0f1520] border-[#28364a]"
                            }`}
                          >
                            <div className="flex items-center justify-between text-[#8e9fb5] mb-1">
                              <span className="font-medium">Nitrate (NO3)</span>
                              {out ? (
                                <span className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5">
                                  <AlertTriangle size={10} /> Alert
                                </span>
                              ) : (
                                <span className="text-[10px] text-[#00d2be] font-bold flex items-center gap-0.5">
                                  <Check size={10} /> Optimal
                                </span>
                              )}
                            </div>
                            <div className="text-base font-bold font-mono text-[#f0f4f8]">
                              {selectedLog.no3 !== undefined && selectedLog.no3 !== null ? `${selectedLog.no3.toFixed(1)} ppm` : "-"}
                            </div>
                            <div className="text-[10px] text-[#8e9fb5] mt-0.5">
                              Target: {tank.no3Target}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Phosphate */}
                      {(() => {
                        const out = isOutOfRange(selectedLog.po4, tank.po4Target);
                        return (
                          <div
                            className={`p-3 rounded-xl border transition-all ${
                              out
                                ? "bg-amber-950/20 border-amber-500/40"
                                : "bg-[#0f1520] border-[#28364a]"
                            }`}
                          >
                            <div className="flex items-center justify-between text-[#8e9fb5] mb-1">
                              <span className="font-medium">Phosphate (PO4)</span>
                              {out ? (
                                <span className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5">
                                  <AlertTriangle size={10} /> Alert
                                </span>
                              ) : (
                                <span className="text-[10px] text-[#00d2be] font-bold flex items-center gap-0.5">
                                  <Check size={10} /> Optimal
                                </span>
                              )}
                            </div>
                            <div className="text-base font-bold font-mono text-[#f0f4f8]">
                              {selectedLog.po4 !== undefined && selectedLog.po4 !== null ? `${selectedLog.po4.toFixed(2)} ppm` : "-"}
                            </div>
                            <div className="text-[10px] text-[#8e9fb5] mt-0.5">
                              Target: {tank.po4Target}
                            </div>
                          </div>
                        );
                      })()}
                    </>
                  )}
                </div>
              </div>

              {/* Water Change info banner if water change was logged */}
              {(selectedLog.wcLiters ?? 0) > 0 && (
                <div className="p-3.5 rounded-xl bg-[#00d2be]/10 border border-[#00d2be]/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Droplet size={16} className="text-[#00d2be]" />
                    <span className="text-xs font-bold text-[#f0f4f8]">
                      Water Change Logged:
                    </span>
                    <span className="text-xs font-mono font-bold text-[#00d2be]">
                      {unitSystem === "imperial"
                        ? `${lToGal(selectedLog.wcLiters!)} gallons`
                        : `${selectedLog.wcLiters} Liters`}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#8e9fb5]">
                    Refreshed water with new trace minerals
                  </span>
                </div>
              )}

              {/* Full Uncompressed Notes & Observations Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-[#8e9fb5] uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={13} className="text-[#00d2be]" />
                    Husbandry Notes & Observations
                  </h4>
                  {selectedLog.notes && (
                    <span className="text-[10px] text-[#8e9fb5]">
                      {selectedLog.notes.length} characters
                    </span>
                  )}
                </div>

                <div className="bg-[#0f1520] border border-[#28364a] rounded-xl p-4 min-h-[100px] max-h-[300px] overflow-y-auto custom-scrollbar">
                  {selectedLog.notes ? (
                    <div className="text-xs text-[#e2e8f0] leading-relaxed whitespace-pre-wrap break-words font-sans selection:bg-[#00d2be]/30 selection:text-white">
                      {selectedLog.notes}
                    </div>
                  ) : (
                    <div className="text-xs text-[#8e9fb5] italic flex items-center gap-1.5 py-4 justify-center">
                      <span>No observations or notes were recorded for this test session.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-[#28364a] bg-[#0f1520]/80 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyLog(selectedLog)}
                  className="px-3 py-1.5 rounded-lg bg-[#161e2b] border border-[#28364a] text-xs font-medium text-[#f0f4f8] hover:border-[#00d2be]/50 hover:text-[#00d2be] transition-colors flex items-center gap-1.5"
                >
                  {copiedLog ? (
                    <>
                      <Check size={13} className="text-[#00d2be]" />
                      <span className="text-[#00d2be]">Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy Log</span>
                    </>
                  )}
                </button>

                {onPinRecipeToNotes && (
                  <button
                    type="button"
                    onClick={() => handlePinLogToNotes(selectedLog)}
                    className="px-3 py-1.5 rounded-lg bg-[#161e2b] border border-[#28364a] text-xs font-medium text-[#f0f4f8] hover:border-[#00d2be]/50 hover:text-[#00d2be] transition-colors flex items-center gap-1.5"
                  >
                    {pinnedLogSuccess ? (
                      <>
                        <Check size={13} className="text-[#00d2be]" />
                        <span className="text-[#00d2be]">Pinned to Sticky Notes!</span>
                      </>
                    ) : (
                      <>
                        <Pin size={13} />
                        <span>Pin to Sticky Notes</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 rounded-lg bg-[#00d2be] text-[#0d121a] hover:bg-[#14ebd7] text-xs font-bold transition-all shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
