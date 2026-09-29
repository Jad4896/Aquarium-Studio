"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Bug,
  Activity,
  Upload,
  Image as ImageIcon,
  Video,
  Search,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Copy,
  Check,
  RefreshCw,
  FileText,
  ShieldCheck,
  Layers,
  ArrowRight,
  Info,
} from "lucide-react";
import { Tank } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tank?: Tank | null;
}

type TabType = "hitchhiker" | "disease";

export default function HealthDiagnosticsModal({ isOpen, onClose, tank }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>("hitchhiker");

  // Environment mode
  const [isFreshwater, setIsFreshwater] = useState<boolean>(
    Boolean(tank && tank.tankType === "FRESHWATER")
  );

  useEffect(() => {
    if (tank) {
      setIsFreshwater(tank.tankType === "FRESHWATER");
    }
  }, [tank]);

  // Form State for Hitchhiker
  const [hhMediaUrl, setHhMediaUrl] = useState<string>("");
  const [hhMediaBase64, setHhMediaBase64] = useState<string>("");
  const [hhMimeType, setHhMimeType] = useState<string>("image/jpeg");
  const [hhIsVideo, setHhIsVideo] = useState<boolean>(false);
  const [hhDescription, setHhDescription] = useState<string>("");
  const [hhResults, setHhResults] = useState<any | null>(null);
  const [hhLoading, setHhLoading] = useState<boolean>(false);
  const [hhSource, setHhSource] = useState<string>("");

  // Form State for Disease
  const [disMediaUrl, setDisMediaUrl] = useState<string>("");
  const [disMediaBase64, setDisMediaBase64] = useState<string>("");
  const [disMimeType, setDisMimeType] = useState<string>("image/jpeg");
  const [disIsVideo, setDisIsVideo] = useState<boolean>(false);
  const [disDescription, setDisDescription] = useState<string>("");
  const [disResults, setDisResults] = useState<any | null>(null);
  const [disLoading, setDisLoading] = useState<boolean>(false);
  const [disSource, setDisSource] = useState<string>("");

  // Feedback & Copy State
  const [copied, setCopied] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");

  const hhFileInputRef = useRef<HTMLInputElement>(null);
  const disFileInputRef = useRef<HTMLInputElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Handle Media Upload for Hitchhiker
  const handleHhMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVid = file.type.startsWith("video/");
    setHhIsVideo(isVid);
    setHhMimeType(file.type);

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setHhMediaUrl(result);

      if (isVid) {
        // Extract video frame
        const video = document.createElement("video");
        video.src = result;
        video.muted = true;
        video.playsInline = true;
        video.currentTime = 0.5;
        video.onloadeddata = () => {
          video.currentTime = 0.5;
        };
        video.onseeked = () => {
          const canvas = document.createElement("canvas");
          canvas.width = Math.min(video.videoWidth || 640, 800);
          canvas.height = Math.min(video.videoHeight || 480, 600);
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const frameData = canvas.toDataURL("image/jpeg", 0.85);
            setHhMediaBase64(frameData);
          }
        };
      } else {
        setHhMediaBase64(result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Media Upload for Disease
  const handleDisMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVid = file.type.startsWith("video/");
    setDisIsVideo(isVid);
    setDisMimeType(file.type);

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setDisMediaUrl(result);

      if (isVid) {
        const video = document.createElement("video");
        video.src = result;
        video.muted = true;
        video.playsInline = true;
        video.currentTime = 0.5;
        video.onloadeddata = () => {
          video.currentTime = 0.5;
        };
        video.onseeked = () => {
          const canvas = document.createElement("canvas");
          canvas.width = Math.min(video.videoWidth || 640, 800);
          canvas.height = Math.min(video.videoHeight || 480, 600);
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const frameData = canvas.toDataURL("image/jpeg", 0.85);
            setDisMediaBase64(frameData);
          }
        };
      } else {
        setDisMediaBase64(result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit Identification (Local or AI)
  const handleDiagnose = async (tab: TabType, mode: "local" | "ai") => {
    setStatusMessage("");
    if (tab === "hitchhiker") {
      setHhLoading(true);
    } else {
      setDisLoading(true);
    }

    try {
      const isHh = tab === "hitchhiker";
      const desc = isHh ? hhDescription : disDescription;
      const base64 = isHh ? hhMediaBase64 : disMediaBase64;
      const mime = isHh ? hhMimeType : disMimeType;

      const res = await fetch("/api/diagnose-health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tab,
          mode,
          description: desc,
          imageBase64: base64,
          mimeType: mime,
          tankType: isFreshwater ? "FRESHWATER" : "SALTWATER",
          isFreshwater,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setStatusMessage(data.error || "Diagnostic request failed.");
        return;
      }

      if (isHh) {
        setHhResults(data.result || data.results);
        setHhSource(data.source);
        if (data.note) setStatusMessage(data.note);
      } else {
        setDisResults(data.result || data.results);
        setDisSource(data.source);
        if (data.note) setStatusMessage(data.note);
      }
    } catch (err: any) {
      console.error("Diagnosis error:", err);
      setStatusMessage("Network error during diagnostic request.");
    } finally {
      if (tab === "hitchhiker") {
        setHhLoading(false);
      } else {
        setDisLoading(false);
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5 animate-in fade-in duration-200"
    >
      <div className="bg-[#101622] border border-[#233144] hover:border-[#00d2be]/40 rounded-2xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl relative max-h-[92vh] flex flex-col overscroll-contain transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#233144] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 shadow-[0_0_12px_rgba(244,63,94,0.25)]">
              <Activity size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#f0f4f8]">
                  Hitchhiker & Disease Diagnostic Suite
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30">
                  Local DB + AI
                </span>
              </div>
              <p className="text-[11px] text-[#8e9fb5]">
                Identify unknown tank hitchhikers and diagnose fish or coral health symptoms via photos and text
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Environment Toggle */}
            <button
              type="button"
              onClick={() => setIsFreshwater((prev) => !prev)}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-medium text-[#8e9fb5] hover:text-[#f0f4f8] transition-all cursor-pointer"
              title="Toggle between Saltwater Reef and Freshwater diagnostic mode"
            >
              <span className={!isFreshwater ? "text-[#00d2be] font-bold" : ""}>🪸 Marine Reef</span>
              <span className="text-white/20">/</span>
              <span className={isFreshwater ? "text-emerald-400 font-bold" : ""}>🌿 Freshwater</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8e9fb5] hover:text-[#f0f4f8] hover:bg-white/5 transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 pt-3 pb-2 border-b border-[#233144]/60 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("hitchhiker")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "hitchhiker"
                ? "bg-[#00d2be]/15 text-[#00d2be] border border-[#00d2be]/40 shadow-[0_0_12px_rgba(0,210,190,0.25)]"
                : "text-[#8e9fb5] hover:text-[#f0f4f8] hover:bg-white/[0.04] border border-transparent"
            }`}
          >
            <Bug size={15} />
            <span>1. Hitchhiker & Pest Identification</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("disease")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "disease"
                ? "bg-rose-500/15 text-rose-400 border border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.25)]"
                : "text-[#8e9fb5] hover:text-[#f0f4f8] hover:bg-white/[0.04] border border-transparent"
            }`}
          >
            <Activity size={15} />
            <span>2. Disease & Illness Symptom Signs</span>
          </button>
        </div>

        {/* Main Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1 text-xs text-[#cad5e2]">
          {/* Reference & Educational Disclaimer Banner */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
            <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5 leading-relaxed">
              <strong className="text-amber-300 font-semibold block">
                Reference & Educational Disclaimer:
              </strong>
              <p className="text-[11px] text-amber-200/90">
                The Hitchhiker and Disease Diagnostic Suite is provided <strong>purely for reference and educational purposes</strong>. Identifications, symptoms, and treatment suggestions should not replace certified aquatic veterinary guidance. Users must conduct their own thorough research and verify all water parameters and species sensitivities before administering treatments or taking corrective actions.
              </p>
            </div>
          </div>

          {statusMessage && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2 animate-in fade-in">
              <Info size={14} className="text-amber-400 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 1: HITCHHIKER & PEST IDENTIFICATION */}
          {/* ============================================================== */}
          {activeTab === "hitchhiker" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Media Upload Column */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#f0f4f8] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <ImageIcon size={14} className="text-[#00d2be]" />
                      <span>Photo or Video of Hitchhiker</span>
                    </span>
                    {hhMediaUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setHhMediaUrl("");
                          setHhMediaBase64("");
                          if (hhFileInputRef.current) hhFileInputRef.current.value = "";
                        }}
                        className="text-[11px] text-rose-400 hover:text-rose-300 cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </label>

                  <div
                    onClick={() => hhFileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-3 flex flex-col items-center justify-center min-h-[140px] max-h-[200px] cursor-pointer transition-all ${
                      hhMediaUrl
                        ? "border-[#00d2be]/50 bg-black/40"
                        : "border-[#28364a] hover:border-[#00d2be]/50 bg-[#0b1018] hover:bg-[#121926]"
                    }`}
                  >
                    <input
                      ref={hhFileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleHhMediaUpload}
                      className="hidden"
                    />

                    {hhMediaUrl ? (
                      hhIsVideo ? (
                        <video
                          src={hhMediaUrl}
                          className="max-h-[180px] w-auto rounded-lg object-contain"
                          controls
                          muted
                        />
                      ) : (
                        <img
                          src={hhMediaUrl}
                          alt="Hitchhiker"
                          className="max-h-[180px] w-auto rounded-lg object-contain shadow-md"
                        />
                      )
                    ) : (
                      <div className="text-center space-y-1.5 p-2">
                        <div className="w-9 h-9 rounded-full bg-[#00d2be]/10 text-[#00d2be] mx-auto flex items-center justify-center">
                          <Upload size={18} />
                        </div>
                        <p className="text-xs font-semibold text-[#f0f4f8]">
                          Drop photo or video here, or browse
                        </p>
                        <p className="text-[10px] text-[#8e9fb5]">
                          Clear macro shots of tentacles, body shape, or movement work best
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Text Description Column */}
                <div className="space-y-2 flex flex-col">
                  <label className="text-xs font-bold text-[#f0f4f8] flex items-center gap-1.5">
                    <FileText size={14} className="text-[#00d2be]" />
                    <span>Describe the Organism</span>
                  </label>
                  <textarea
                    rows={6}
                    value={hhDescription}
                    onChange={(e) => setHhDescription(e.target.value)}
                    placeholder={
                      isFreshwater
                        ? "Describe the freshwater critter: e.g. tiny white hydra with tentacles on glass, flatworm with triangular head and two eyespots, fast moving white worm in substrate, black fuzzy tufts on plant leaves..."
                        : "Describe what you saw: e.g. translucent brown anemone with long tentacles in rock crevice that retracts fast, fast segmented pink worm with white bristles, flat red discs on mushroom corals, shiny green grape-like bubbles..."
                    }
                    className="flex-1 w-full bg-[#0b1018] border border-[#28364a] focus:border-[#00d2be] rounded-xl p-2.5 text-xs text-[#f0f4f8] placeholder-[#5d718a] focus:outline-none transition-colors resize-none leading-relaxed"
                  />
                  <span className="text-[10px] text-[#8e9fb5]">
                    💡 Both photo and description are supported. You can use either one or both!
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2 border-t border-[#233144]">
                <span className="text-[11px] text-[#8e9fb5] hidden sm:inline">
                  Step 1: Try Local DB (instant & offline) • Step 2: Use AI if you need deeper visual inspection
                </span>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleDiagnose("hitchhiker", "local")}
                    disabled={hhLoading}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-[#00d2be]/50 text-[#00d2be] font-bold text-xs transition-all cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {hhLoading ? <RefreshCw size={13} className="animate-spin" /> : <Search size={13} />}
                    <span>1. Identify with Local DB</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDiagnose("hitchhiker", "ai")}
                    disabled={hhLoading}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#00d2be] hover:bg-[#14ebd7] text-[#0b0f17] font-bold text-xs transition-all shadow-[0_0_15px_rgba(0,210,190,0.3)] cursor-pointer disabled:opacity-50"
                  >
                    {hhLoading ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />}
                    <span>2. Identify with AI</span>
                  </button>
                </div>
              </div>

              {/* Hitchhiker Results Display */}
              {hhResults && (
                <div className="mt-4 p-4 rounded-xl bg-[#0b1018] border border-[#233144] space-y-3.5 animate-in fade-in">
                  {/* Results Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#233144]">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-[#f0f4f8]">
                          {Array.isArray(hhResults) ? hhResults[0]?.name : hhResults.name}
                        </h4>
                        {(hhResults.scientificName || hhResults[0]?.scientificName) && (
                          <span className="text-[11px] font-mono text-[#8e9fb5] italic">
                            ({hhResults.scientificName || hhResults[0]?.scientificName})
                          </span>
                        )}
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            (hhResults.category || hhResults[0]?.category) === "Beneficial"
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : (hhResults.category || hhResults[0]?.category) === "Pest" ||
                                (hhResults.category || hhResults[0]?.category) === "Harmful" ||
                                (hhResults.category || hhResults[0]?.category) === "Parasite"
                              ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                              : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {hhResults.category || hhResults[0]?.category || "Identified"}
                        </span>

                        {hhResults.confidence && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00d2be]/10 text-[#00d2be] border border-[#00d2be]/20">
                            {hhResults.confidence}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-[#8e9fb5] mt-1">
                        Source:{" "}
                        <strong className="text-[#00d2be]">
                          {hhSource === "local-database"
                            ? "100% Offline Local Catalog"
                            : hhSource === "local-database-suggested"
                            ? "Local Database Suggestions"
                            : "AI Deep Vision Diagnostic"}
                        </strong>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          JSON.stringify(hhResults, null, 2)
                        )
                      }
                      className="self-start sm:self-center flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[#8e9fb5] hover:text-[#f0f4f8] text-[11px] transition-colors cursor-pointer"
                    >
                      {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      <span>{copied ? "Copied" : "Copy Report"}</span>
                    </button>
                  </div>

                  {/* Summary / Description */}
                  <div>
                    <h5 className="font-bold text-[#f0f4f8] text-xs mb-1">Overview:</h5>
                    <p className="text-[11px] text-[#cad5e2] leading-relaxed">
                      {hhResults.summary || hhResults.description || hhResults[0]?.description}
                    </p>
                  </div>

                  {/* Visual Traits */}
                  {((hhResults.visualTraits && hhResults.visualTraits.length > 0) ||
                    (hhResults[0]?.visualTraits && hhResults[0]?.visualTraits.length > 0)) && (
                    <div>
                      <h5 className="font-bold text-[#f0f4f8] text-xs mb-1">Key Visual Markers:</h5>
                      <ul className="text-[11px] text-[#8e9fb5] space-y-1 list-disc list-inside">
                        {(hhResults.visualTraits || hhResults[0]?.visualTraits || []).map(
                          (trait: string, idx: number) => (
                            <li key={idx}>{trait}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Management / Action Guide */}
                  {((hhResults.managementGuide && hhResults.managementGuide.length > 0) ||
                    (hhResults[0]?.managementGuide && hhResults[0]?.managementGuide.length > 0)) && (
                    <div className="p-3 rounded-xl bg-[#141d2b] border border-[#28394e] space-y-1.5">
                      <h5 className="font-bold text-[#00d2be] text-xs flex items-center gap-1.5">
                        <ShieldCheck size={14} />
                        <span>Action & Eradication Guide:</span>
                      </h5>
                      <ul className="text-[11px] text-[#cad5e2] space-y-1 list-disc list-inside">
                        {(hhResults.managementGuide || hhResults[0]?.managementGuide || []).map(
                          (step: string, idx: number) => (
                            <li key={idx} className="leading-relaxed">
                              {step}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Natural Predators */}
                  {((hhResults.naturalPredators && hhResults.naturalPredators.length > 0) ||
                    (hhResults[0]?.naturalPredators && hhResults[0]?.naturalPredators.length > 0)) && (
                    <div>
                      <h5 className="font-bold text-[#f0f4f8] text-xs mb-1">Biological Predators:</h5>
                      <div className="flex flex-wrap gap-1.5">
                        {(hhResults.naturalPredators || hhResults[0]?.naturalPredators || []).map(
                          (pred: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px]"
                            >
                              🌿 {pred}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Multiple Local Results List if Array */}
                  {Array.isArray(hhResults) && hhResults.length > 1 && (
                    <div className="pt-2 border-t border-[#233144] space-y-2">
                      <h5 className="font-bold text-[#8e9fb5] text-xs">
                        Other Potential Matches ({hhResults.length - 1}):
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {hhResults.slice(1).map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-lg bg-[#121926] border border-[#233144] space-y-1"
                          >
                            <span className="font-semibold text-[#f0f4f8] text-xs block">
                              {item.name}
                            </span>
                            <p className="text-[10px] text-[#8e9fb5] line-clamp-2">
                              {item.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: DISEASE & ILLNESS SYMPTOM SIGNS */}
          {/* ============================================================== */}
          {activeTab === "disease" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Media Upload Column */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#f0f4f8] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <ImageIcon size={14} className="text-rose-400" />
                      <span>Photo or Video of Affected Fish / Coral</span>
                    </span>
                    {disMediaUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setDisMediaUrl("");
                          setDisMediaBase64("");
                          if (disFileInputRef.current) disFileInputRef.current.value = "";
                        }}
                        className="text-[11px] text-rose-400 hover:text-rose-300 cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </label>

                  <div
                    onClick={() => disFileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-3 flex flex-col items-center justify-center min-h-[140px] max-h-[200px] cursor-pointer transition-all ${
                      disMediaUrl
                        ? "border-rose-500/50 bg-black/40"
                        : "border-[#28364a] hover:border-rose-500/50 bg-[#0b1018] hover:bg-[#121926]"
                    }`}
                  >
                    <input
                      ref={disFileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleDisMediaUpload}
                      className="hidden"
                    />

                    {disMediaUrl ? (
                      disIsVideo ? (
                        <video
                          src={disMediaUrl}
                          className="max-h-[180px] w-auto rounded-lg object-contain"
                          controls
                          muted
                        />
                      ) : (
                        <img
                          src={disMediaUrl}
                          alt="Affected Livestock"
                          className="max-h-[180px] w-auto rounded-lg object-contain shadow-md"
                        />
                      )
                    ) : (
                      <div className="text-center space-y-1.5 p-2">
                        <div className="w-9 h-9 rounded-full bg-rose-500/10 text-rose-400 mx-auto flex items-center justify-center">
                          <Upload size={18} />
                        </div>
                        <p className="text-xs font-semibold text-[#f0f4f8]">
                          Drop photo or video of affected specimen
                        </p>
                        <p className="text-[10px] text-[#8e9fb5]">
                          Focus on skin spots, frayed fins, coral tissue recession, or eyes
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Text Description Column */}
                <div className="space-y-2 flex flex-col">
                  <label className="text-xs font-bold text-[#f0f4f8] flex items-center gap-1.5">
                    <FileText size={14} className="text-rose-400" />
                    <span>Describe Symptoms & Situation</span>
                  </label>
                  <textarea
                    rows={6}
                    value={disDescription}
                    onChange={(e) => setDisDescription(e.target.value)}
                    placeholder={
                      isFreshwater
                        ? "Describe the fish/plant symptoms: e.g. white salt dots all over neon tetra body, flashing against rocks, scales sticking out like a pinecone, cottony white fuzz around mouth, torn ragged fins..."
                        : "Describe the situation: e.g. fine gold dusting on blue tang with rapid breathing, swimming directly into powerhead flow, white bare coral skeleton peeling from base on Acropora, brown foul-smelling slime on torch coral..."
                    }
                    className="flex-1 w-full bg-[#0b1018] border border-[#28364a] focus:border-rose-400 rounded-xl p-2.5 text-xs text-[#f0f4f8] placeholder-[#5d718a] focus:outline-none transition-colors resize-none leading-relaxed"
                  />
                  <span className="text-[10px] text-[#8e9fb5]">
                    💡 Both photo and description are supported. Include behavior (eating, breathing, flashing).
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2 border-t border-[#233144]">
                <span className="text-[11px] text-[#8e9fb5] hidden sm:inline">
                  Step 1: Check Local Disease DB • Step 2: Use AI for full clinical symptom inspection
                </span>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleDiagnose("disease", "local")}
                    disabled={disLoading}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-rose-500/50 text-rose-400 font-bold text-xs transition-all cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {disLoading ? <RefreshCw size={13} className="animate-spin" /> : <Search size={13} />}
                    <span>1. Check Local Disease DB</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDiagnose("disease", "ai")}
                    disabled={disLoading}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs transition-all shadow-[0_0_15px_rgba(244,63,94,0.3)] cursor-pointer disabled:opacity-50"
                  >
                    {disLoading ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />}
                    <span>2. Diagnose with AI</span>
                  </button>
                </div>
              </div>

              {/* Disease Results Display */}
              {disResults && (
                <div className="mt-4 p-4 rounded-xl bg-[#0b1018] border border-[#233144] space-y-3.5 animate-in fade-in">
                  {/* Results Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#233144]">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-[#f0f4f8]">
                          {Array.isArray(disResults) ? disResults[0]?.name : disResults.name}
                        </h4>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            (disResults.riskLevel || disResults[0]?.riskLevel) === "Critical"
                              ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                              : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {(disResults.riskLevel || disResults[0]?.riskLevel) || "Moderate"} Severity
                        </span>

                        {(disResults.pathogenType || disResults[0]?.pathogenType) && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#141d2b] text-[#8e9fb5] border border-[#28394e]">
                            {disResults.pathogenType || disResults[0]?.pathogenType}
                          </span>
                        )}

                        {disResults.progressionSpeed && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                            ⏱️ {disResults.progressionSpeed}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-[#8e9fb5] mt-1">
                        Source:{" "}
                        <strong className="text-rose-400">
                          {disSource === "local-database"
                            ? "100% Offline Local Medical Catalog"
                            : disSource === "local-database-suggested"
                            ? "Local Medical Suggestions"
                            : "AI Clinical Diagnostic Vision Model"}
                        </strong>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          JSON.stringify(disResults, null, 2)
                        )
                      }
                      className="self-start sm:self-center flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[#8e9fb5] hover:text-[#f0f4f8] text-[11px] transition-colors cursor-pointer"
                    >
                      {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      <span>{copied ? "Copied" : "Copy Treatment Plan"}</span>
                    </button>
                  </div>

                  {/* Primary Symptoms */}
                  <div>
                    <h5 className="font-bold text-[#f0f4f8] text-xs mb-1">Observed Clinical Signs:</h5>
                    <ul className="text-[11px] text-[#8e9fb5] space-y-1 list-disc list-inside">
                      {(disResults.observedSymptoms ||
                        disResults.primarySymptoms ||
                        disResults[0]?.primarySymptoms ||
                        []
                      ).map((sym: string, idx: number) => (
                        <li key={idx}>{sym}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Differential Diagnoses */}
                  {disResults.differentialDiagnoses && disResults.differentialDiagnoses.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-white/[0.02] border border-[#233144] space-y-1">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                        Differential Diagnoses to Rule Out:
                      </span>
                      <ul className="text-[11px] text-[#8e9fb5] space-y-0.5 list-disc list-inside">
                        {disResults.differentialDiagnoses.map((diff: string, idx: number) => (
                          <li key={idx}>{diff}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Treatment Protocol */}
                  <div className="p-3 rounded-xl bg-[#141d2b] border border-[#28394e] space-y-2">
                    <h5 className="font-bold text-rose-400 text-xs flex items-center gap-1.5">
                      <ShieldAlert size={14} />
                      <span>Step-by-Step Veterinary Treatment Protocol:</span>
                    </h5>
                    <ul className="text-[11px] text-[#cad5e2] space-y-1.5 list-decimal list-inside">
                      {(disResults.treatmentProtocol || disResults[0]?.treatmentProtocol || []).map(
                        (step: string, idx: number) => (
                          <li key={idx} className="leading-relaxed">
                            {step}
                          </li>
                        )
                      )}
                    </ul>
                  </div>

                  {/* Reef Safe Warning */}
                  {(disResults.reefSafeWarning || disResults[0]?.reefSafeWarning) && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-amber-400">
                        <AlertTriangle size={14} />
                        <span>Reef Safety & Medication Warning:</span>
                      </div>
                      <p className="text-[11px] text-amber-200/90 leading-relaxed">
                        {disResults.reefSafeWarning || disResults[0]?.reefSafeWarning}
                      </p>
                    </div>
                  )}

                  {/* Prevention Tips */}
                  {((disResults.preventionTips && disResults.preventionTips.length > 0) ||
                    (disResults[0]?.preventionTips && disResults[0]?.preventionTips.length > 0)) && (
                    <div>
                      <h5 className="font-bold text-[#f0f4f8] text-xs mb-1">Long-Term Prevention Tips:</h5>
                      <ul className="text-[11px] text-[#8e9fb5] space-y-1 list-disc list-inside">
                        {(disResults.preventionTips || disResults[0]?.preventionTips || []).map(
                          (tip: string, idx: number) => (
                            <li key={idx}>{tip}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Multiple Local Results List if Array */}
                  {Array.isArray(disResults) && disResults.length > 1 && (
                    <div className="pt-2 border-t border-[#233144] space-y-2">
                      <h5 className="font-bold text-[#8e9fb5] text-xs">
                        Other Potential Disease Matches ({disResults.length - 1}):
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {disResults.slice(1).map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-lg bg-[#121926] border border-[#233144] space-y-1"
                          >
                            <span className="font-semibold text-[#f0f4f8] text-xs block">
                              {item.name}
                            </span>
                            <p className="text-[10px] text-[#8e9fb5] line-clamp-2">
                              {item.primarySymptoms?.join(", ")}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-[#233144] flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-[#8e9fb5]">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span>Educational reference only • Always conduct your own research before treating • Local DB active</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-[#f0f4f8] font-semibold text-xs transition-all shadow-md cursor-pointer text-center"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
