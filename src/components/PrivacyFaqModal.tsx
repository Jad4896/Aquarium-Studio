"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  ShieldCheck,
  Lock,
  Database,
  AlertTriangle,
  CheckCircle2,
  HardDrive,
  Wifi,
  Sparkles,
  Info,
  Layers,
  ExternalLink,
  Bot,
  Globe,
  Camera,
  LineChart,
  CloudOff,
  Search,
  Server,
  Activity,
  ArrowRight,
  FlaskConical,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "privacy" | "ai" | "internet" | "features" | "limits" | "backup";

export default function PrivacyFaqModal({ isOpen, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>("privacy");

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5 animate-in fade-in duration-200"
    >
      <div className="bg-[#101622] border border-[#233144] hover:border-[#00d2be]/40 rounded-2xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl relative max-h-[92vh] flex flex-col overscroll-contain transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#233144] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#00d2be]/15 border border-[#00d2be]/30 flex items-center justify-center text-[#00d2be] shrink-0 shadow-[0_0_12px_rgba(0,210,190,0.25)]">
              <ShieldCheck size={19} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#f0f4f8] flex items-center gap-2">
                <span>Privacy, Safety & App FAQ</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00d2be]/15 text-[#00d2be] font-medium border border-[#00d2be]/30">
                  100% Local PC
                </span>
              </h3>
              <p className="text-[11px] text-[#8e9fb5]">
                Non-invasive architecture, AI disclosures, external data fetching, and safety boundaries
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8e9fb5] hover:text-[#f0f4f8] hover:bg-white/5 transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 pt-3 pb-2 border-b border-[#233144]/60 overflow-x-auto shrink-0 no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("privacy")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "privacy"
                ? "bg-[#00d2be]/15 text-[#00d2be] border border-[#00d2be]/40 shadow-[0_0_10px_rgba(0,210,190,0.2)]"
                : "text-[#8e9fb5] hover:text-[#f0f4f8] hover:bg-white/[0.04] border border-transparent"
            }`}
          >
            <Lock size={13} />
            <span>Privacy & Security</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ai")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "ai"
                ? "bg-[#00d2be]/15 text-[#00d2be] border border-[#00d2be]/40 shadow-[0_0_10px_rgba(0,210,190,0.2)]"
                : "text-[#8e9fb5] hover:text-[#f0f4f8] hover:bg-white/[0.04] border border-transparent"
            }`}
          >
            <Bot size={13} />
            <span>AI Features</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("internet")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "internet"
                ? "bg-[#00d2be]/15 text-[#00d2be] border border-[#00d2be]/40 shadow-[0_0_10px_rgba(0,210,190,0.2)]"
                : "text-[#8e9fb5] hover:text-[#f0f4f8] hover:bg-white/[0.04] border border-transparent"
            }`}
          >
            <Globe size={13} />
            <span>Internet & Data Fetching</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("features")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "features"
                ? "bg-[#00d2be]/15 text-[#00d2be] border border-[#00d2be]/40 shadow-[0_0_10px_rgba(0,210,190,0.2)]"
                : "text-[#8e9fb5] hover:text-[#f0f4f8] hover:bg-white/[0.04] border border-transparent"
            }`}
          >
            <Sparkles size={13} />
            <span>What It Does</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("limits")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "limits"
                ? "bg-amber-500/15 text-amber-400 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                : "text-[#8e9fb5] hover:text-[#f0f4f8] hover:bg-white/[0.04] border border-transparent"
            }`}
          >
            <AlertTriangle size={13} />
            <span>Limits & Safety</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("backup")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "backup"
                ? "bg-[#00d2be]/15 text-[#00d2be] border border-[#00d2be]/40 shadow-[0_0_10px_rgba(0,210,190,0.2)]"
                : "text-[#8e9fb5] hover:text-[#f0f4f8] hover:bg-white/[0.04] border border-transparent"
            }`}
          >
            <Database size={13} />
            <span>Backup & Data</span>
          </button>
        </div>

        {/* Tab Content Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3.5 pr-1 text-xs text-[#cad5e2] leading-relaxed">
          {/* TAB 1: PRIVACY & SECURITY */}
          {activeTab === "privacy" && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="p-3 bg-[#0b1018] border border-[#233144] rounded-xl flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#00d2be]/10 text-[#00d2be] shrink-0 mt-0.5">
                  <HardDrive size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#f0f4f8] mb-1">
                    100% Offline & Locally Stored
                  </h4>
                  <p className="text-[#8e9fb5] leading-normal">
                    Aquarium Studio is designed to run entirely on your personal computer. Every aquarium profile, water parameter log, sump configuration, livestock photo, and task history is stored solely inside your local SQLite database file (<code className="text-[#00d2be] bg-[#141d2b] px-1 py-0.5 rounded text-[11px]">prisma/dev.db</code>).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 bg-[#0b1018] border border-[#233144] rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-[#00d2be] font-semibold text-xs">
                    <CheckCircle2 size={14} />
                    <span>Zero Telemetry or Tracking</span>
                  </div>
                  <p className="text-[11px] text-[#8e9fb5]">
                    No analytics, no telemetry, no tracking pixels, and no session monitoring. We never monitor your usage or collect remote statistics.
                  </p>
                </div>

                <div className="p-3 bg-[#0b1018] border border-[#233144] rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-[#00d2be] font-semibold text-xs">
                    <Wifi size={14} />
                    <span>Local Home Wi-Fi Only</span>
                  </div>
                  <p className="text-[11px] text-[#8e9fb5]">
                    When connecting your phone or tablet, communication stays strictly inside your home Wi-Fi subnet (e.g. 192.168.x.x). No external relay is used.
                  </p>
                </div>

                <div className="p-3 bg-[#0b1018] border border-[#233144] rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-[#00d2be] font-semibold text-xs">
                    <Lock size={14} />
                    <span>No Account or Sign-In Needed</span>
                  </div>
                  <p className="text-[11px] text-[#8e9fb5]">
                    You will never be asked for an email, password, or subscription. The software launches immediately without cloud authentication.
                  </p>
                </div>

                <div className="p-3 bg-[#0b1018] border border-[#233144] rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-[#00d2be] font-semibold text-xs">
                    <CloudOff size={14} />
                    <span>Zero Cloud Storage Dependency</span>
                  </div>
                  <p className="text-[11px] text-[#8e9fb5]">
                    Your images, notes, and records are saved directly to your local hard drive. You maintain 100% digital sovereignty over your aquarium data.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI FEATURES */}
          {activeTab === "ai" && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="p-3 bg-[#0b1018] border border-[#233144] rounded-xl">
                <div className="flex items-center gap-2 text-[#00d2be] font-bold text-sm mb-1.5">
                  <Bot size={17} />
                  <span>How Artificial Intelligence is Used in Aquarium Studio</span>
                </div>
                <p className="text-[#8e9fb5] text-xs leading-relaxed">
                  AI features in Aquarium Studio are entirely <strong className="text-[#f0f4f8]">optional and user-triggered</strong>. AI never runs autonomously or silently in the background. Here is a comprehensive overview of all features powered by AI:
                </p>
              </div>

              <div className="space-y-2.5">
                {/* AI Feature 1: Livestock Identification */}
                <div className="p-3 bg-[#0b1018] border border-[#233144] rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-[#f0f4f8] text-xs flex items-center gap-2">
                      <Camera size={14} className="text-[#00d2be]" />
                      <span>1. Livestock Species Identification (Fish & Coral Vaults)</span>
                    </h5>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00d2be]/10 text-[#00d2be] font-medium border border-[#00d2be]/20">
                      Vision AI
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8e9fb5] leading-relaxed">
                    When you upload a photo or video clip of a fish, coral, invertebrate, or freshwater plant and click <strong className="text-[#f0f4f8]">“Identify with AI”</strong>, the AI analyzes the visual morphology to determine:
                  </p>
                  <ul className="text-[11px] text-[#cad5e2] space-y-1 list-disc list-inside pl-1">
                    <li><strong className="text-[#f0f4f8]">Species & Taxonomy:</strong> Scientific name, common varieties, and color morphs.</li>
                    <li><strong className="text-[#f0f4f8]">Care Requirements:</strong> Difficulty level, minimum tank size, temperament, and reef-safe rating.</li>
                    <li><strong className="text-[#f0f4f8]">Environmental Needs:</strong> Target lighting (PAR), water flow, diet, and coral placement guidelines.</li>
                  </ul>
                </div>

                {/* AI Feature 2: Health & Disease Diagnostics */}
                <div className="p-3 bg-[#0b1018] border border-[#233144] rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-[#f0f4f8] text-xs flex items-center gap-2">
                      <Activity size={14} className="text-rose-400" />
                      <span>2. Visual Health & Pest Diagnostics</span>
                    </h5>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 font-medium border border-rose-500/20">
                      Diagnostic
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8e9fb5] leading-relaxed">
                    Alongside species ID, the vision model inspects the specimen for visual distress indicators:
                  </p>
                  <ul className="text-[11px] text-[#cad5e2] space-y-1 list-disc list-inside pl-1">
                    <li><strong className="text-[#f0f4f8]">Fish Diseases:</strong> Early visual signs of Marine Ich (Cryptocaryon), Marine Velvet, Fin Rot, or sunken belly.</li>
                    <li><strong className="text-[#f0f4f8]">Coral Distress:</strong> Rapid or Slow Tissue Necrosis (RTN/STN), bleaching, polyp retraction, or brown jelly.</li>
                    <li><strong className="text-[#f0f4f8]">Pest Hitchhikers:</strong> Flags nuisance pests like Aiptasia, vermetid snails, or flatworms.</li>
                  </ul>
                </div>

                {/* AI Feature 3: Parameter Trend Analysis */}
                <div className="p-3 bg-[#0b1018] border border-[#233144] rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-[#f0f4f8] text-xs flex items-center gap-2">
                      <LineChart size={14} className="text-amber-400" />
                      <span>3. Water Parameter Trend & Stability Analysis</span>
                    </h5>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-medium border border-amber-500/20">
                      Analytics
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8e9fb5] leading-relaxed">
                    In the Water Parameters Chart view, pressing <strong className="text-[#f0f4f8]">“Analyze Trends with AI”</strong> feeds your logged test history (Salinity, Alkalinity, Calcium, Magnesium, Nitrate, Phosphate, pH) into the AI model:
                  </p>
                  <ul className="text-[11px] text-[#cad5e2] space-y-1 list-disc list-inside pl-1">
                    <li><strong className="text-[#f0f4f8]">Stability Index:</strong> Evaluates standard deviation and stability curves over time.</li>
                    <li><strong className="text-[#f0f4f8]">Consumption Rates:</strong> Estimates daily Alkalinity (dKH) and Calcium uptake.</li>
                    <li><strong className="text-[#f0f4f8]">Preventative Warnings:</strong> Highlights rapid parameter swings before they cause coral stress or RTN.</li>
                  </ul>
                </div>

                {/* AI Feature 4: Product Bottle Scanner */}
                <div className="p-3 bg-[#0b1018] border border-[#233144] rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-[#f0f4f8] text-xs flex items-center gap-2">
                      <FlaskConical size={14} className="text-cyan-400" />
                      <span>4. Dosing Product & Supplement Bottle Scanner</span>
                    </h5>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-medium border border-cyan-500/20">
                      Calculator AI
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8e9fb5] leading-relaxed">
                    In the Dosing Calculators, you can photograph or upload an image of a chemical supplement bottle (e.g. Red Sea Foundation, Seachem Prime, Brightwell, Fritz, Tropic Marin, ESV). The AI reads the label, extracts the active ingredients and concentration ratios, and automatically prefills the dosing calculator.
                  </p>
                </div>

                {/* AI Providers & Keys Disclosure */}
                <div className="p-3 bg-[#141d2b] border border-[#28394e] rounded-xl space-y-1.5">
                  <h5 className="text-xs font-bold text-[#f0f4f8] flex items-center gap-1.5">
                    <Lock size={13} className="text-[#00d2be]" />
                    <span>Supported AI Providers & API Key Safety</span>
                  </h5>
                  <p className="text-[11px] text-[#8e9fb5] leading-relaxed">
                    You can bring your own API key for <strong className="text-[#f0f4f8]">Google Gemini</strong> (Gemini 2.5/3.7/3.8 Flash), <strong className="text-[#f0f4f8]">OpenAI</strong> (GPT-4o), <strong className="text-[#f0f4f8]">Anthropic</strong> (Claude 3.5 Sonnet), or <strong className="text-[#f0f4f8]">OpenRouter</strong>. Keys are stored solely on your machine in SQLite / browser storage. Requests are dispatched directly to the official provider endpoints with zero intermediate logging.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INTERNET & DATA FETCHING */}
          {activeTab === "internet" && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="p-3 bg-[#0b1018] border border-[#233144] rounded-xl">
                <div className="flex items-center gap-2 text-[#00d2be] font-bold text-sm mb-1.5">
                  <Globe size={17} />
                  <span>External Internet Requests & Data Fetching Disclosure</span>
                </div>
                <p className="text-[#8e9fb5] text-xs leading-relaxed">
                  Aquarium Studio is built on a <strong className="text-[#f0f4f8]">local-first principle</strong>. By default, the application runs entirely offline. The internet is accessed solely for two specific, user-driven capabilities:
                </p>
              </div>

              <div className="space-y-2.5">
                {/* 1. Wikipedia & iNaturalist for Sprites */}
                <div className="p-3 bg-[#0b1018] border border-[#233144] rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-[#f0f4f8] text-xs flex items-center gap-2">
                      <Search size={14} className="text-[#00d2be]" />
                      <span>1. Virtual Tank Specimen Photos (Wikipedia & iNaturalist APIs)</span>
                    </h5>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00d2be]/10 text-[#00d2be] font-medium border border-[#00d2be]/20">
                      Taxonomy
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8e9fb5] leading-relaxed">
                    When you add a fish or coral to your Virtual Tank and choose to generate an animated transparent sprite without uploading your own custom cutout:
                  </p>
                  <div className="space-y-1.5 pl-2 border-l-2 border-[#233144]">
                    <p className="text-[11px] text-[#cad5e2]">
                      <strong className="text-[#00d2be]">Local Library Check:</strong> The app first looks up its built-in pristine studio cutout library on your PC.
                    </p>
                    <p className="text-[11px] text-[#cad5e2]">
                      <strong className="text-[#00d2be]">Wikipedia MediaWiki API:</strong> If not found locally, the app queries <code className="text-[#00d2be] bg-[#141d2b] px-1 py-0.5 rounded text-[10px]">en.wikipedia.org/w/api.php</code> for high-resolution Creative Commons / public domain specimen imagery.
                    </p>
                    <p className="text-[11px] text-[#cad5e2]">
                      <strong className="text-[#00d2be]">iNaturalist Taxa API:</strong> If Wikipedia has no suitable photo, it queries open scientific observations via <code className="text-[#00d2be] bg-[#141d2b] px-1 py-0.5 rounded text-[10px]">api.inaturalist.org/v1/taxa</code>.
                    </p>
                    <p className="text-[11px] text-[#cad5e2]">
                      <strong className="text-[#00d2be]">Local Neural Cutout & Caching:</strong> The downloaded image is converted to a transparent sprite using an on-device Python background-removal model (<code className="text-[#00d2be] bg-[#141d2b] px-1 py-0.5 rounded text-[10px]">rembg</code>) and permanently saved into <code className="text-[#00d2be] bg-[#141d2b] px-1 py-0.5 rounded text-[10px]">public/aquariums/sprites/</code>. Once generated, all subsequent views load <strong className="text-[#f0f4f8]">100% offline from your local disk</strong>.
                    </p>
                  </div>
                </div>

                {/* 2. Direct AI Provider Endpoints */}
                <div className="p-3 bg-[#0b1018] border border-[#233144] rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-[#f0f4f8] text-xs flex items-center gap-2">
                      <Server size={14} className="text-[#00d2be]" />
                      <span>2. Direct AI Provider API Calls (User-Triggered Only)</span>
                    </h5>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00d2be]/10 text-[#00d2be] font-medium border border-[#00d2be]/20">
                      Direct HTTPS
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8e9fb5] leading-relaxed">
                    When you explicitly click an AI identification, trend diagnosis, or product scanner button, your local server establishes a direct, encrypted HTTPS connection to:
                  </p>
                  <ul className="text-[11px] text-[#cad5e2] space-y-1 list-disc list-inside pl-1">
                    <li><code className="text-[#00d2be]">generativelanguage.googleapis.com</code> (Google Gemini API)</li>
                    <li><code className="text-[#00d2be]">api.openai.com</code> (OpenAI GPT-4o)</li>
                    <li><code className="text-[#00d2be]">api.anthropic.com</code> (Anthropic Claude 3.5)</li>
                    <li><code className="text-[#00d2be]">openrouter.ai</code> (OpenRouter)</li>
                  </ul>
                  <p className="text-[11px] text-[#8e9fb5]">
                    No intermediate application server or third-party proxy ever intercepts your data or prompts.
                  </p>
                </div>

                {/* 3. Phone Connect is NOT Internet */}
                <div className="p-3 bg-[#0b1018] border border-[#233144] rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-[#f0f4f8] text-xs flex items-center gap-2">
                      <Wifi size={14} className="text-emerald-400" />
                      <span>3. Phone & Tablet Connection (Local Wi-Fi Only)</span>
                    </h5>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/20">
                      No Internet
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8e9fb5] leading-relaxed">
                    Connecting your smartphone via the QR code or LAN address (e.g. <code className="text-[#00d2be] bg-[#141d2b] px-1 py-0.5 rounded text-[10px]">http://192.168.1.xxx:3000</code>) transmits data solely within your home router. Your network traffic never leaves your local Wi-Fi and does not require an active internet connection.
                  </p>
                </div>

                {/* What we never fetch */}
                <div className="p-3 bg-[#141d2b] border border-[#28394e] rounded-xl space-y-1.5">
                  <h5 className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                    <CloudOff size={14} />
                    <span>What We NEVER Fetch, Track, or Transmit</span>
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#8e9fb5]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-rose-400 font-bold">✕</span>
                      <span>No telemetry or analytics pings</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-rose-400 font-bold">✕</span>
                      <span>No automatic cloud data sync</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-rose-400 font-bold">✕</span>
                      <span>No cookies or advertising pixels</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-rose-400 font-bold">✕</span>
                      <span>No background phone-home scripts</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WHAT IT DOES */}
          {activeTab === "features" && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="p-3 bg-[#0b1018] border border-[#233144] rounded-xl">
                <h4 className="text-sm font-bold text-[#f0f4f8] mb-1.5 flex items-center gap-2">
                  <Layers size={16} className="text-[#00d2be]" />
                  <span>Aquarium Studio Feature Suite</span>
                </h4>
                <p className="text-[#8e9fb5] text-xs">
                  Aquarium Studio provides a comprehensive, privacy-first management suite for reef and freshwater aquarists:
                </p>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 bg-[#0b1018] border border-[#233144] rounded-xl flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded bg-[#00d2be]/10 text-[#00d2be] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    1
                  </div>
                  <div>
                    <span className="font-semibold text-[#f0f4f8] block">Water Parameter Logging & AI Advisory</span>
                    <span className="text-[11px] text-[#8e9fb5]">
                      Log water parameters, generate interactive charts, and receive optional AI-assisted stability insights and consumption curves.
                    </span>
                  </div>
                </div>

                <div className="p-2.5 bg-[#0b1018] border border-[#233144] rounded-xl flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded bg-[#00d2be]/10 text-[#00d2be] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    2
                  </div>
                  <div>
                    <span className="font-semibold text-[#f0f4f8] block">Livestock Vaults & Growth Timelines</span>
                    <span className="text-[11px] text-[#8e9fb5]">
                      Manage corals, fish, inverts, and plants with photo timelines, care parameters, and optional AI species identification.
                    </span>
                  </div>
                </div>

                <div className="p-2.5 bg-[#0b1018] border border-[#233144] rounded-xl flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded bg-[#00d2be]/10 text-[#00d2be] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    3
                  </div>
                  <div>
                    <span className="font-semibold text-[#f0f4f8] block">Interactive Virtual Tank Simulator</span>
                    <span className="text-[11px] text-[#8e9fb5]">
                      Experience preset freshwater & marine virtual tanks with animated swimming livestock, drag-and-place sessile corals, and caustics.
                    </span>
                  </div>
                </div>

                <div className="p-2.5 bg-[#0b1018] border border-[#233144] rounded-xl flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded bg-[#00d2be]/10 text-[#00d2be] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    4
                  </div>
                  <div>
                    <span className="font-semibold text-[#f0f4f8] block">Aquarium Calculators (Reference Only)</span>
                    <span className="text-[11px] text-[#8e9fb5]">
                      Calculators for reference only to assist in salt mixing, dosing adjustments, net water volume estimation, and chemical balancing.
                    </span>
                  </div>
                </div>

                <div className="p-2.5 bg-[#0b1018] border border-[#233144] rounded-xl flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded bg-[#00d2be]/10 text-[#00d2be] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    5
                  </div>
                  <div>
                    <span className="font-semibold text-[#f0f4f8] block">Maintenance Tasks & Upkeep Tracking</span>
                    <span className="text-[11px] text-[#8e9fb5]">
                      Setup maintenance tasks to let the user keep track of recurring upkeep duties, media replacements, and equipment service alerts.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: LIMITS & SAFETY */}
          {activeTab === "limits" && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1">
                  <AlertTriangle size={16} />
                  <span>Important Operational Boundaries & Safety Limits</span>
                </div>
                <p className="text-amber-200/80 text-[11px] leading-relaxed">
                  Please review the limits of Aquarium Studio to ensure safe and healthy aquarium management.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 bg-[#0b1018] border border-[#233144] rounded-xl space-y-1">
                  <h5 className="font-bold text-[#f0f4f8] text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                    <span>Not an Automated Hardware Controller or Physical Doser</span>
                  </h5>
                  <p className="text-[11px] text-[#8e9fb5] leading-relaxed">
                    Aquarium Studio is a planning, visualization, and calculation tool. It does <strong>not</strong> physically interface with physical dosing pumps, power relays, or smart controllers (such as Neptune Apex, Hydros, or GHL Profilux). It will not dose chemicals automatically into your aquarium.
                  </p>
                </div>

                <div className="p-3 bg-[#0b1018] border border-[#233144] rounded-xl space-y-1">
                  <h5 className="font-bold text-[#f0f4f8] text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span>Always Verify Chemistry With Physical Test Kits</span>
                  </h5>
                  <p className="text-[11px] text-[#8e9fb5] leading-relaxed">
                    Calculated chemical dosages (Buffer, Calcium, Magnesium, Nitrate/Phosphate) are based on standard reef chemistry formulas and nominal water volume. Because rocks, sand, and equipment displace water, <strong>always start with a conservative dose</strong> and cross-check actual water parameters with calibrated test kits (Hanna, Salifert, Red Sea) before and after dosing.
                  </p>
                </div>

                <div className="p-3 bg-[#0b1018] border border-[#233144] rounded-xl space-y-1">
                  <h5 className="font-bold text-[#f0f4f8] text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                    <span>No Automatic Cloud Backup</span>
                  </h5>
                  <p className="text-[11px] text-[#8e9fb5] leading-relaxed">
                    Because Aquarium Studio never sends your data to external servers, there is no automatic cloud sync. You are in complete control of your data backups by copying your local database file.
                  </p>
                </div>

                <div className="p-3 bg-[#0b1018] border border-amber-500/30 rounded-xl space-y-1">
                  <h5 className="font-bold text-[#f0f4f8] text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span>Hitchhiker & Disease Diagnostic Suite Is Purely For Reference & Education</span>
                  </h5>
                  <p className="text-[11px] text-[#8e9fb5] leading-relaxed">
                    Identifications, symptom profiles, and treatment suggestions in the Hitchhiker & Disease Diagnostic Suite are provided strictly for educational and reference purposes. Biological organisms, pests, and aquatic illnesses often display overlapping signs. You must always conduct your own thorough research, consult trusted reference material or a certified aquatic veterinary professional, and verify species tolerances (e.g. copper toxicity in invertebrates) before administering any treatments or medications.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: BACKUP & DATA */}
          {activeTab === "backup" && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="p-3 bg-[#0b1018] border border-[#233144] rounded-xl">
                <h4 className="text-sm font-bold text-[#f0f4f8] mb-1 flex items-center gap-2">
                  <Database size={16} className="text-[#00d2be]" />
                  <span>Single-File Database Architecture</span>
                </h4>
                <p className="text-[#8e9fb5] text-[11px] leading-relaxed">
                  Your complete aquarium studio setup is preserved inside a single standard SQLite database file. No hidden cloud locks, no proprietary export formats.
                </p>
              </div>

              <div className="p-3 bg-[#141d2b] border border-[#28394e] rounded-xl space-y-2">
                <span className="text-[11px] font-semibold text-[#f0f4f8] block">
                  📁 Database File Location:
                </span>
                <div className="p-2 bg-[#0b1018] border border-[#233144] rounded-lg font-mono text-[11px] text-[#00d2be] select-all break-all">
                  Aquarium Studio/prisma/dev.db
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 bg-[#0b1018] border border-[#233144] rounded-xl space-y-1.5">
                  <h5 className="text-xs font-bold text-[#f0f4f8] flex items-center gap-1.5">
                    <span className="text-[#00d2be]">📦</span> How to Back Up:
                  </h5>
                  <p className="text-[11px] text-[#8e9fb5]">
                    Simply make a copy of the <code className="text-[#00d2be]">prisma/dev.db</code> file and save it to your USB drive, Google Drive, or another folder. That&apos;s all!
                  </p>
                </div>

                <div className="p-3 bg-[#0b1018] border border-[#233144] rounded-xl space-y-1.5">
                  <h5 className="text-xs font-bold text-[#f0f4f8] flex items-center gap-1.5">
                    <span className="text-[#00d2be]">🔄</span> How to Restore / Migrate:
                  </h5>
                  <p className="text-[11px] text-[#8e9fb5]">
                    If you get a new computer or want to restore a backup, place your saved <code className="text-[#00d2be]">dev.db</code> into the <code className="text-[#00d2be]">prisma/</code> folder before launching.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-[#233144] flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-[#8e9fb5]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Local SQLite active • Direct client calls only</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-1.5 rounded-lg bg-[#00d2be] hover:bg-[#14ebd7] text-[#0b0f17] font-semibold text-xs transition-all shadow-md cursor-pointer text-center"
          >
            Understood & Close
          </button>
        </div>
      </div>
    </div>
  );
}
