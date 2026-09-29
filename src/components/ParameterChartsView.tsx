"use client";

import React, { useState, useMemo, useEffect } from "react";
import { WaterParameter, Tank, UnitSystem, SalinityUnit } from "@/types";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import {
  Activity,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Pin,
  Settings,
  X,
  Loader2,
  HelpCircle,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  Lightbulb,
  Wrench,
} from "lucide-react";
import { cToF, sgToPpt, convertRangeString } from "@/lib/units";
import AiSettingsModal from "./AiSettingsModal";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Props {
  parameters: WaterParameter[];
  tank: Tank;
  unitSystem?: UnitSystem;
  salinityUnit?: SalinityUnit;
  onPinRecipeToNotes?: (
    recipe: string,
    customTitle?: string,
    customTag?: string
  ) => Promise<void>;
}

type ParamKey =
  | "salinity"
  | "temp"
  | "ph"
  | "alk"
  | "ca"
  | "mg"
  | "no3"
  | "po4"
  | "ammonia"
  | "nitrite"
  | "gh"
  | "kh"
  | "tds";

interface ParamConfig {
  key: ParamKey;
  label: string;
  unit: string;
  color: string;
  targetStr: string;
  decimals: number;
}

export default function ParameterChartsView({
  parameters,
  tank,
  unitSystem = "metric",
  salinityUnit = "sg",
  onPinRecipeToNotes,
}: Props) {
  const isFreshwater = tank.tankType === "FRESHWATER";
  const [selectedParam, setSelectedParam] = useState<ParamKey | "all">(
    isFreshwater ? "tds" : "alk"
  );
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">("all");

  // Re-sync selectedParam when switching between Saltwater and Freshwater
  useEffect(() => {
    if (tank.tankType === "FRESHWATER") {
      if (
        selectedParam === "salinity" ||
        selectedParam === "alk" ||
        selectedParam === "ca" ||
        selectedParam === "mg" ||
        selectedParam === "po4"
      ) {
        setSelectedParam("tds");
      }
    } else {
      if (
        selectedParam === "ammonia" ||
        selectedParam === "nitrite" ||
        selectedParam === "gh" ||
        selectedParam === "kh" ||
        selectedParam === "tds"
      ) {
        setSelectedParam("alk");
      }
    }
  }, [tank.id, tank.tankType]);

  // AI Trends Analysis State
  const [analyzingTrends, setAnalyzingTrends] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [pinnedSuccess, setPinnedSuccess] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiProvider, setAiProvider] = useState("gemini");
  const [activeApiKey, setActiveApiKey] = useState("");

  const syncAiKeysAndProvider = () => {
    if (typeof window !== "undefined") {
      const savedProvider = localStorage.getItem("reef_default_ai_provider") || "gemini";
      setAiProvider(savedProvider);

      let key = "";
      if (savedProvider === "openai") key = localStorage.getItem("reef_openai_api_key") || "";
      else if (savedProvider === "anthropic") key = localStorage.getItem("reef_anthropic_api_key") || "";
      else if (savedProvider === "openrouter") key = localStorage.getItem("reef_openrouter_api_key") || "";
      else key = localStorage.getItem("reef_gemini_api_key") || "";

      if (key) {
        setActiveApiKey(key);
      } else {
        fetch("/api/config/api-key")
          .then((r) => r.json())
          .then((d) => {
            if (d.providers?.[savedProvider] || d.hasKey) {
              setActiveApiKey("env_configured");
            } else {
              setActiveApiKey("");
            }
          })
          .catch(() => {});
      }
    }
  };

  useEffect(() => {
    syncAiKeysAndProvider();
  }, []);

  const isImperial = unitSystem === "imperial";
  const isPpt = salinityUnit === "ppt";

  const configs: Partial<Record<ParamKey, ParamConfig>> = useMemo(() => {
    if (isFreshwater) {
      return {
        temp: {
          key: "temp",
          label: "Temperature",
          unit: isImperial ? "°F" : "°C",
          color: "#ff6b35",
          targetStr: isImperial
            ? convertRangeString(tank.tempTarget, cToF, 1)
            : tank.tempTarget,
          decimals: 1,
        },
        ph: {
          key: "ph",
          label: "pH Level",
          unit: "",
          color: "#9b59b6",
          targetStr: tank.phTarget,
          decimals: 2,
        },
        ammonia: {
          key: "ammonia",
          label: "Ammonia (NH3)",
          unit: "ppm",
          color: "#f43f5e",
          targetStr: tank.ammoniaTarget || "0.0 ppm",
          decimals: 2,
        },
        nitrite: {
          key: "nitrite",
          label: "Nitrite (NO2)",
          unit: "ppm",
          color: "#fb7185",
          targetStr: tank.nitriteTarget || "0.0 ppm",
          decimals: 2,
        },
        no3: {
          key: "no3",
          label: "Nitrate (NO3)",
          unit: "ppm",
          color: "#e74c3c",
          targetStr: tank.no3Target || "5.0 - 15.0",
          decimals: 1,
        },
        gh: {
          key: "gh",
          label: "General Hardness",
          unit: "dGH",
          color: "#00d2be",
          targetStr: tank.ghTarget || "4.0 - 8.0 dGH",
          decimals: 1,
        },
        kh: {
          key: "kh",
          label: "Carbonate Hardness",
          unit: "dKH",
          color: "#38bdf8",
          targetStr: tank.khTarget || "1.0 - 4.0 dKH",
          decimals: 1,
        },
        tds: {
          key: "tds",
          label: "TDS Level",
          unit: "ppm",
          color: "#a855f7",
          targetStr: tank.tdsTarget || "120 - 180 ppm",
          decimals: 0,
        },
      };
    }

    return {
      salinity: {
        key: "salinity",
        label: "Salinity",
        unit: isPpt ? "ppt" : "SG",
        color: "#00d2be",
        targetStr: isPpt
          ? convertRangeString(tank.salinityTarget, sgToPpt, 1)
          : tank.salinityTarget,
        decimals: isPpt ? 1 : 3,
      },
      temp: {
        key: "temp",
        label: "Temperature",
        unit: isImperial ? "°F" : "°C",
        color: "#ff6b35",
        targetStr: isImperial
          ? convertRangeString(tank.tempTarget, cToF, 1)
          : tank.tempTarget,
        decimals: 1,
      },
      ph: {
        key: "ph",
        label: "pH Level",
        unit: "",
        color: "#9b59b6",
        targetStr: tank.phTarget,
        decimals: 2,
      },
      alk: {
        key: "alk",
        label: "Alkalinity",
        unit: "dKH",
        color: "#3498db",
        targetStr: tank.dkhTarget,
        decimals: 1,
      },
      ca: {
        key: "ca",
        label: "Calcium",
        unit: "ppm",
        color: "#2ecc71",
        targetStr: tank.caTarget,
        decimals: 0,
      },
      mg: {
        key: "mg",
        label: "Magnesium",
        unit: "ppm",
        color: "#e67e22",
        targetStr: tank.mgTarget,
        decimals: 0,
      },
      no3: {
        key: "no3",
        label: "Nitrate (NO3)",
        unit: "ppm",
        color: "#e74c3c",
        targetStr: tank.no3Target,
        decimals: 1,
      },
      po4: {
        key: "po4",
        label: "Phosphate (PO4)",
        unit: "ppm",
        color: "#f1c40f",
        targetStr: tank.po4Target,
        decimals: 2,
      },
    };
  }, [tank, isFreshwater, isImperial, isPpt]);

  // Helper to convert parameter readings based on active units
  const getConvertedParamValue = (p: WaterParameter, key: ParamKey): number => {
    const rawVal = p[key];
    if (typeof rawVal !== "number" || isNaN(rawVal)) return 0;
    if (key === "temp" && isImperial) {
      return cToF(rawVal);
    }
    if (key === "salinity" && isPpt) {
      return sgToPpt(rawVal);
    }
    return rawVal;
  };

  // Filter and sort parameters chronologically (oldest to newest for charting)
  const sortedParams = useMemo(() => {
    let list = [...parameters].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    if (timeRange !== "all") {
      const now = new Date().getTime();
      const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      const cutoff = now - days * 24 * 60 * 60 * 1000;
      list = list.filter((p) => new Date(p.date).getTime() >= cutoff);
    }
    return list;
  }, [parameters, timeRange]);

  const labels = sortedParams.map((p) => {
    const d = new Date(p.date);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  });

  const makeChartData = (cfg: ParamConfig) => {
    const values = sortedParams.map((p) => getConvertedParamValue(p, cfg.key));

    // parse targets for horizontal guide lines if possible
    const rangeParts = cfg.targetStr.split("-").map((s) => parseFloat(s.trim()));
    const hasTarget = rangeParts.length === 2 && !isNaN(rangeParts[0]) && !isNaN(rangeParts[1]);

    const datasetLabel = cfg.unit ? `${cfg.label} (${cfg.unit})` : cfg.label;

    const datasets: any[] = [
      {
        label: datasetLabel,
        data: values,
        borderColor: cfg.color,
        backgroundColor: `${cfg.color}22`,
        fill: true,
        tension: 0.35,
        pointBackgroundColor: cfg.color,
        pointBorderColor: "#0d121a",
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ];

    if (hasTarget && values.length > 0) {
      datasets.push({
        label: `Target Min (${rangeParts[0]}${cfg.unit ? ` ${cfg.unit}` : ""})`,
        data: values.map(() => rangeParts[0]),
        borderColor: "rgba(255, 255, 255, 0.25)",
        borderDash: [5, 5],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
      });
      datasets.push({
        label: `Target Max (${rangeParts[1]}${cfg.unit ? ` ${cfg.unit}` : ""})`,
        data: values.map(() => rangeParts[1]),
        borderColor: "rgba(255, 255, 255, 0.25)",
        borderDash: [5, 5],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
      });
    }

    return { labels, datasets };
  };

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#8e9fb5",
          font: { size: 11, family: "sans-serif" },
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: "#161e2b",
        titleColor: "#f0f4f8",
        bodyColor: "#00d2be",
        borderColor: "#28364a",
        borderWidth: 1,
        padding: 10,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(40, 54, 74, 0.4)" },
        ticks: { color: "#8e9fb5", font: { size: 10 } },
      },
      y: {
        grid: { color: "rgba(40, 54, 74, 0.4)" },
        ticks: { color: "#8e9fb5", font: { size: 10 } },
      },
    },
  };

  // Calculate stats for current selected param
  const activeCfg = selectedParam !== "all" ? configs[selectedParam] : null;
  const activeValues = useMemo(() => {
    if (!activeCfg) return [];
    return sortedParams
      .map((p) => getConvertedParamValue(p, activeCfg.key))
      .filter((v) => typeof v === "number" && !isNaN(v));
  }, [sortedParams, activeCfg, isImperial, isPpt]);

  const stats = useMemo(() => {
    if (!activeValues.length) return null;
    const min = Math.min(...activeValues);
    const max = Math.max(...activeValues);
    const sum = activeValues.reduce((a, b) => a + b, 0);
    const avg = sum / activeValues.length;
    const latest = activeValues[activeValues.length - 1];
    const prev = activeValues.length > 1 ? activeValues[activeValues.length - 2] : latest;
    const diff = latest - prev;
    return { min, max, avg, latest, diff };
  }, [activeValues]);

  const handleGenerateAiTrendAnalysis = async () => {
    if (parameters.length === 0) {
      setAnalysisError("No parameter logs recorded yet. Please log at least 1-2 water tests first.");
      setTimeout(() => setAnalysisError(null), 4000);
      return;
    }

    setAnalyzingTrends(true);
    setAnalysisError(null);

    try {
      const res = await fetch("/api/analyze-trends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tank,
          parameters: sortedParams,
          selectedParam,
          timeRange,
          provider: aiProvider,
          apiKey: activeApiKey === "env_configured" ? undefined : activeApiKey,
        }),
      });

      const data = await res.json();
      if (data.success && data.analysis) {
        setAnalysisResult({
          ...data.analysis,
          source: data.source,
          provider: data.provider,
          scopeParam: selectedParam,
          scopeTimeRange: timeRange,
        });
      } else {
        setAnalysisError(data.error || "Failed to analyze trends. Please check your network or API keys.");
      }
    } catch (err: any) {
      console.error("AI Trend analysis error:", err);
      setAnalysisError("Network error while generating AI analysis. Please try again.");
    } finally {
      setAnalyzingTrends(false);
    }
  };

  const handlePinAnalysis = async () => {
    if (!analysisResult || !onPinRecipeToNotes) return;
    const focusLabel =
      analysisResult.scopeParam === "all"
        ? "Multi-Parameter Suite"
        : configs[analysisResult.scopeParam as ParamKey]?.label || analysisResult.scopeParam.toUpperCase();
    const title = `🔬 AI Trends: ${focusLabel} (${analysisResult.scopeTimeRange})`;

    let text = `${analysisResult.disclaimer}\n\n`;
    text += `Health Status: ${analysisResult.overallHealthStatus}\n\n`;
    text += `Trend Summary:\n${analysisResult.trendSummary}\n\n`;

    if (analysisResult.fluctuations?.length) {
      text += `Parameter Diagnostics & Fixes:\n`;
      analysisResult.fluctuations.forEach((f: any) => {
        text += `\n• ${f.parameter} (${f.currentReading}, Target: ${f.targetRange}) - ${f.trendDirection} [${f.status || "Status"}]\n`;
        if (f.potentialCauses?.length) {
          text += `  Potential Causes:\n  - ${f.potentialCauses.join("\n  - ")}\n`;
        }
        if (f.howToFix?.length) {
          text += `  How to Fix:\n  - ${f.howToFix.join("\n  - ")}\n`;
        }
      });
      text += "\n";
    }

    if (analysisResult.tipsAndTricks?.length) {
      text += `${isFreshwater ? "Planted & Freshwater Care Tips & Tricks" : "Reefkeeper Tips & Tricks"}:\n- ${analysisResult.tipsAndTricks.join("\n- ")}\n`;
    }

    await onPinRecipeToNotes(text, title, "analysis");
    setPinnedSuccess(true);
    setTimeout(() => setPinnedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#161e2b] border border-[#28364a] p-4 rounded-xl shadow-lg">
        <div>
          <h2 className="text-lg font-bold text-[#f0f4f8] flex items-center gap-2">
            <Activity className="text-[#00d2be]" size={20} />
            Water Chemistry & Parameter Trends
          </h2>
          <p className="text-xs text-[#8e9fb5] mt-0.5">
            Visualize stability, consumption rates, and target alignment over time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* AI Trends Analysis Button */}
          <button
            onClick={handleGenerateAiTrendAnalysis}
            disabled={analyzingTrends}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#00d2be] to-emerald-400 text-[#0d121a] hover:from-[#14ebd7] hover:to-emerald-300 font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
            title="Generate AI summary of recent trends, fluctuation causes, how to fix, and tips"
          >
            {analyzingTrends ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Analyzing Trends...
              </>
            ) : (
              <>
                <Sparkles size={14} />
                Generate AI Trend Analysis
              </>
            )}
          </button>

          {/* AI Provider Settings Cog */}
          <button
            onClick={() => setShowAiModal(true)}
            className="p-1.5 rounded-lg bg-[#0f1520] border border-[#28364a] text-[#8e9fb5] hover:text-[#00d2be] hover:border-[#00d2be]/40 text-xs font-semibold transition-all cursor-pointer shadow-sm"
            title="Configure AI model & API keys"
          >
            <Settings size={14} />
          </button>

          {/* Time Filter Pills */}
          <div className="flex items-center gap-1 bg-[#0f1520] p-1 border border-[#28364a] rounded-lg">
            <Calendar size={13} className="text-[#8e9fb5] ml-2 mr-1" />
            {(["7d", "30d", "90d", "all"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                  timeRange === r
                    ? "bg-[#00d2be] text-[#0d121a] shadow-sm font-bold"
                    : "text-[#8e9fb5] hover:text-[#f0f4f8]"
                }`}
              >
                {r === "all" ? "All Time" : r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Analysis Error Message */}
      {analysisError && (
        <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-3.5 flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-rose-400 shrink-0" />
            <span>{analysisError}</span>
          </div>
          <button
            onClick={() => setAnalysisError(null)}
            className="text-rose-400 hover:text-rose-200 p-1 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* AI Analyzing Loading State */}
      {analyzingTrends && (
        <div className="bg-[#161e2b] border border-[#00d2be]/40 rounded-xl p-5 shadow-xl flex items-center gap-4 text-xs text-[#f0f4f8]">
          <div className="w-9 h-9 rounded-xl bg-[#00d2be]/10 border border-[#00d2be]/30 flex items-center justify-center shrink-0">
            <Loader2 size={20} className="animate-spin text-[#00d2be]" />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-bold text-sm text-[#f0f4f8] flex items-center gap-2">
              <Sparkles size={14} className="text-[#00d2be]" />
              Synthesizing Historical Parameter Trends...
            </h4>
            <p className="text-xs text-[#8e9fb5]">
              Analyzing stability, consumption drift, target alignments, and {isFreshwater ? "nutrient and mineral balances" : "ionic balances"} with {aiProvider.toUpperCase()} AI.
            </p>
          </div>
        </div>
      )}

      {/* AI Trend Analysis Output Card */}
      {analysisResult && (
        <div className="bg-[#161e2b] border-2 border-[#00d2be]/50 rounded-2xl p-6 shadow-2xl space-y-5">
          {/* MANDATORY TOP ADVISORY DISCLAIMER */}
          <div className="bg-amber-950/70 border-2 border-amber-500/80 rounded-xl p-4 text-amber-100 shadow-md">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-amber-400 shrink-0 mt-0.5" size={20} />
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <ShieldAlert size={14} />
                  Advisory Disclaimer — Purely Informative
                </h4>
                <p className="text-xs leading-relaxed text-amber-100 font-medium">
                  {analysisResult.disclaimer ||
                    (isFreshwater
                      ? "This AI trend analysis and guidance is provided purely for informational and educational purposes and is NOT the exact solution or a definitive chemical prescription. Every freshwater aquarium is a unique, living ecosystem with complex individual biological loads and consumption rates. You must always conduct your own research, cross-verify readings with reliable calibrated test kits, and observe your aquatic plants, fish, and inverts closely before making any adjustments or chemical additions."
                      : "This AI trend analysis and guidance is provided purely for informational and educational purposes and is NOT the exact solution or a definitive chemical prescription. Every reef aquarium is a unique, living ecosystem with complex individual biological loads and consumption rates. You must always conduct your own research, cross-verify readings with reliable calibrated test kits, and observe your livestock closely before making any adjustments or chemical additions.")}
                </p>
              </div>
            </div>
          </div>

          {/* Analysis Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#28364a] pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-[#00d2be] text-[#0d121a]">
                  AI Chemistry Intelligence
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-[#0f1520] border border-[#28364a] text-[#8e9fb5]">
                  Scope: {analysisResult.scopeParam === "all" ? "All Parameters" : configs[analysisResult.scopeParam as ParamKey]?.label || analysisResult.scopeParam.toUpperCase()}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-[#0f1520] border border-[#28364a] text-[#8e9fb5]">
                  Timeframe: {analysisResult.scopeTimeRange === "all" ? "All Time" : analysisResult.scopeTimeRange.toUpperCase()}
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-[#f0f4f8] flex items-center gap-2">
                <Sparkles size={18} className="text-[#00d2be]" />
                Recent Trends Summary & Diagnostics
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {/* Overall Health Status Badge */}
              <span
                className={`text-xs font-bold px-3 py-1 rounded-lg border ${
                  analysisResult.overallHealthStatus === "Stable"
                    ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/40"
                    : analysisResult.overallHealthStatus === "Action Required"
                    ? "bg-rose-950/40 text-rose-300 border-rose-500/40"
                    : "bg-amber-950/40 text-amber-300 border-amber-500/40"
                }`}
              >
                Health: {analysisResult.overallHealthStatus || "Evaluated"}
              </span>

              {/* Pin to Sticky Notes */}
              {onPinRecipeToNotes && (
                <button
                  onClick={handlePinAnalysis}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f1520] text-[#f0f4f8] border border-[#28364a] hover:border-[#00d2be] text-xs font-bold transition-all cursor-pointer shadow-sm"
                  title="Pin analysis and recommendations to Sticky Notes"
                >
                  <Pin size={13} className="text-[#00d2be]" />
                  {pinnedSuccess ? "✓ Pinned!" : "Pin to Sticky Notes"}
                </button>
              )}

              {/* Re-run Analysis */}
              <button
                onClick={handleGenerateAiTrendAnalysis}
                disabled={analyzingTrends}
                className="p-1.5 rounded-lg bg-[#0f1520] text-[#8e9fb5] hover:text-[#00d2be] border border-[#28364a] transition-all cursor-pointer"
                title="Re-run AI Analysis"
              >
                <RefreshCw size={14} className={analyzingTrends ? "animate-spin" : ""} />
              </button>

              {/* Dismiss Button */}
              <button
                onClick={() => setAnalysisResult(null)}
                className="p-1.5 rounded-lg text-[#8e9fb5] hover:text-[#f0f4f8] hover:bg-[#28364a] transition-all cursor-pointer"
                title="Dismiss analysis"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Trend Summary Narrative */}
          <div className="bg-[#0f1520] border border-[#28364a] p-4 rounded-xl space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#00d2be] flex items-center gap-1.5">
              <Activity size={14} /> Summary of Recent Trends
            </h4>
            <p className="text-xs text-[#f0f4f8] leading-relaxed whitespace-pre-line font-normal">
              {analysisResult.trendSummary}
            </p>
          </div>

          {/* Fluctuation Causes & Corrective Guidance */}
          {analysisResult.fluctuations && analysisResult.fluctuations.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#8e9fb5] flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-amber-400" /> Parameter Fluctuation Causes & Corrective Actions
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {analysisResult.fluctuations.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="bg-[#0f1520] border border-[#28364a] rounded-xl p-4 space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      {/* Item Top Bar */}
                      <div className="flex items-center justify-between gap-2 border-b border-[#28364a]/80 pb-2 mb-2.5">
                        <div>
                          <span className="font-extrabold text-sm text-[#f0f4f8] block">
                            {item.parameter}
                          </span>
                          <span className="text-[11px] text-[#8e9fb5]">
                            Latest: <strong className="text-[#00d2be]">{item.currentReading}</strong> (Target: {item.targetRange})
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                            item.status === "Optimal"
                              ? "bg-emerald-950/40 text-emerald-300 border-emerald-800/40"
                              : "bg-amber-950/40 text-amber-300 border-amber-800/40"
                          }`}
                        >
                          {item.trendDirection || item.status}
                        </span>
                      </div>

                      {/* Potential Causes */}
                      {item.potentialCauses && item.potentialCauses.length > 0 && (
                        <div className="space-y-1 mb-2.5">
                          <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                            <HelpCircle size={12} /> Potential Causes of Fluctuation:
                          </span>
                          <ul className="text-xs text-[#8e9fb5] space-y-1 pl-3 list-disc marker:text-amber-400/70">
                            {item.potentialCauses.map((cause: string, cIdx: number) => (
                              <li key={cIdx} className="leading-snug">
                                {cause}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* How to Fix */}
                      {item.howToFix && item.howToFix.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-[#00d2be] flex items-center gap-1">
                            <Wrench size={12} /> How to Fix & Stabilize:
                          </span>
                          <ul className="text-xs text-[#f0f4f8] space-y-1 pl-3 list-disc marker:text-[#00d2be]">
                            {item.howToFix.map((fix: string, fIdx: number) => (
                              <li key={fIdx} className="leading-snug">
                                {fix}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips and Tricks */}
          {analysisResult.tipsAndTricks && analysisResult.tipsAndTricks.length > 0 && (
            <div className="bg-[#0f1520] border border-[#28364a] p-4 rounded-xl space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#00d2be] flex items-center gap-1.5">
                <Lightbulb size={14} className="text-amber-400" /> {isFreshwater ? "Freshwater Care Tips & Best Practices" : "Reefkeeper Tips & Best Practices"}
              </h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-[#8e9fb5]">
                {analysisResult.tipsAndTricks.map((tip: string, tIdx: number) => (
                  <li key={tIdx} className="flex items-start gap-2 bg-[#161e2b] p-2.5 rounded-lg border border-[#28364a]/50">
                    <span className="text-[#00d2be] font-bold mt-0.5">•</span>
                    <span className="leading-relaxed text-[#f0f4f8]">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Parameter Selection Pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedParam("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
            selectedParam === "all"
              ? "bg-[#00d2be] text-[#0d121a] border-[#00d2be]"
              : "bg-[#161e2b] text-[#8e9fb5] border-[#28364a] hover:border-[#00d2be]/50 hover:text-[#f0f4f8]"
          }`}
        >
          📊 Multi-Parameter Grid
        </button>

        {(Object.keys(configs) as ParamKey[]).map((key) => {
          const c = configs[key];
          if (!c) return null;
          const isSelected = selectedParam === key;
          return (
            <button
              key={key}
              onClick={() => setSelectedParam(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-2 transition-all ${
                isSelected
                  ? "bg-[#161e2b] text-[#f0f4f8] shadow-md"
                  : "bg-[#0f1520] text-[#8e9fb5] border-[#28364a] hover:border-[#8e9fb5]"
              }`}
              style={{
                borderColor: isSelected ? c.color : undefined,
                boxShadow: isSelected ? `0 0 10px ${c.color}33` : undefined,
              }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: c.color }}
              />
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Stats Strip when single parameter selected */}
      {selectedParam !== "all" && activeCfg && stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-[#161e2b] border border-[#28364a] rounded-xl p-3.5 flex flex-col">
            <span className="text-[11px] font-semibold text-[#8e9fb5]">
              Current Reading
            </span>
            <span
              className="text-xl font-extrabold mt-1"
              style={{ color: activeCfg.color }}
            >
              {stats.latest.toFixed(activeCfg.decimals)}{activeCfg.unit ? ` ${activeCfg.unit}` : ""}
            </span>
            <span className="text-[10px] text-[#8e9fb5] mt-1 flex items-center gap-1">
              {stats.diff > 0 ? (
                <>
                  <TrendingUp size={11} className="text-emerald-400" />
                  <span className="text-emerald-400">
                    +{stats.diff.toFixed(activeCfg.decimals)}
                  </span>
                </>
              ) : stats.diff < 0 ? (
                <>
                  <TrendingDown size={11} className="text-rose-400" />
                  <span className="text-rose-400">
                    {stats.diff.toFixed(activeCfg.decimals)}
                  </span>
                </>
              ) : (
                <>
                  <Minus size={11} className="text-[#8e9fb5]" />
                  <span>No change</span>
                </>
              )}
              <span>vs previous</span>
            </span>
          </div>

          <div className="bg-[#161e2b] border border-[#28364a] rounded-xl p-3.5 flex flex-col">
            <span className="text-[11px] font-semibold text-[#8e9fb5]">
              Target Range
            </span>
            <span className="text-xl font-extrabold text-[#f0f4f8] mt-1">
              {activeCfg.targetStr}{activeCfg.unit ? ` ${activeCfg.unit}` : ""}
            </span>
            <span className="text-[10px] text-[#00d2be] mt-1">Recommended safe band</span>
          </div>

          <div className="bg-[#161e2b] border border-[#28364a] rounded-xl p-3.5 flex flex-col">
            <span className="text-[11px] font-semibold text-[#8e9fb5]">Period Average</span>
            <span className="text-xl font-extrabold text-[#f0f4f8] mt-1">
              {stats.avg.toFixed(activeCfg.decimals)}{activeCfg.unit ? ` ${activeCfg.unit}` : ""}
            </span>
            <span className="text-[10px] text-[#8e9fb5] mt-1">
              Over {sortedParams.length} logs
            </span>
          </div>

          <div className="bg-[#161e2b] border border-[#28364a] rounded-xl p-3.5 flex flex-col">
            <span className="text-[11px] font-semibold text-[#8e9fb5]">Minimum</span>
            <span className="text-xl font-extrabold text-[#f0f4f8] mt-1">
              {stats.min.toFixed(activeCfg.decimals)}{activeCfg.unit ? ` ${activeCfg.unit}` : ""}
            </span>
            <span className="text-[10px] text-[#8e9fb5] mt-1">Lowest recorded</span>
          </div>

          <div className="bg-[#161e2b] border border-[#28364a] rounded-xl p-3.5 flex flex-col">
            <span className="text-[11px] font-semibold text-[#8e9fb5]">Maximum</span>
            <span className="text-xl font-extrabold text-[#f0f4f8] mt-1">
              {stats.max.toFixed(activeCfg.decimals)}{activeCfg.unit ? ` ${activeCfg.unit}` : ""}
            </span>
            <span className="text-[10px] text-[#8e9fb5] mt-1">Highest recorded</span>
          </div>
        </div>
      )}

      {/* Main Chart Area */}
      {selectedParam !== "all" && activeCfg ? (
        <div className="bg-[#161e2b] border border-[#28364a] rounded-xl p-6 shadow-xl h-[420px] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-[#f0f4f8] flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: activeCfg.color }}
              />
              {activeCfg.label} Stability Curve
            </h3>
            <span className="text-xs text-[#8e9fb5]">
              Target: <strong className="text-[#00d2be]">{activeCfg.targetStr}{activeCfg.unit ? ` ${activeCfg.unit}` : ""}</strong>
            </span>
          </div>

          <div className="flex-1 w-full min-h-0">
            {sortedParams.length > 0 ? (
              <Line data={makeChartData(activeCfg)} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-[#8e9fb5]">
                No parameter data found for this time range.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Multi-Parameter Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.keys(configs) as ParamKey[]).map((key) => {
            const c = configs[key];
            if (!c) return null;
            return (
              <div
                key={key}
                className="bg-[#161e2b] border border-[#28364a] rounded-xl p-4 shadow-lg flex flex-col h-[280px]"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#f0f4f8] flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: c.color }}
                    />
                    {c.label}{c.unit ? ` (${c.unit})` : ""}
                  </span>
                  <span className="text-[11px] text-[#00d2be] font-mono">
                    Target: {c.targetStr}{c.unit ? ` ${c.unit}` : ""}
                  </span>
                </div>
                <div className="flex-1 w-full min-h-0">
                  <Line data={makeChartData(c)} options={chartOptions} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Multi-Provider AI Settings Modal */}
      <AiSettingsModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        onKeysUpdated={syncAiKeysAndProvider}
      />
    </div>
  );
}
