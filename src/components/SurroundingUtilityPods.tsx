"use client";

import React from "react";
import { Tank, WaterParameter } from "@/types";
import {
  Droplet,
  LineChart,
  Calculator,
  StickyNote,
  CheckSquare,
  History,
  Printer,
  ArrowUpRight,
  Sparkles,
  Clock,
  FlaskConical,
  FileText,
} from "lucide-react";

interface Props {
  tank: Tank;
  latestParam?: WaterParameter;
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  onOpenCharts?: () => void;
}

export default function SurroundingUtilityPods({
  tank,
  latestParam,
  activeTab,
  onSelectTab,
  onOpenCharts,
}: Props) {
  const isFreshwater = tank.tankType === "FRESHWATER";
  const now = Date.now();
  const dueTasks = (tank.tasks || []).filter((t) => {
    const last = new Date(t.lastCompleted).getTime();
    const intervalMs = t.intervalDays * 24 * 60 * 60 * 1000;
    return now >= last + intervalMs;
  }).length;
  const totalTasks = (tank.tasks || []).length;
  const pinnedNotesCount = (tank.notes || []).filter((n) => n.isPinned).length;
  const totalNotesCount = (tank.notes || []).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 my-4">
      {/* ========================================================= */}
      {/* POD 1: TEST TUBES & WATER CHEMISTRY SUITE */}
      {/* ========================================================= */}
      <div
        onClick={() => onSelectTab("params")}
        className={`group relative p-4 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-xl ${
          activeTab === "params" || activeTab === "charts"
            ? "bg-[#162030]/90 border-[#00d2be] shadow-[0_0_25px_rgba(0,210,190,0.25)] ring-1 ring-[#00d2be]/40"
            : "bg-[#121824]/80 border-[#28364a] hover:border-[#00d2be]/60 hover:bg-[#162232]/80 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
        }`}
      >
        {/* Glow Accent Top Rim */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00d2be] to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            {/* Stylized Test Tube Rack Visual */}
            <div className="relative w-10 h-10 rounded-xl bg-[#0b1019] border border-[#28364a] flex items-center justify-center p-1.5 shrink-0 group-hover:border-[#00d2be]/50 transition-colors shadow-inner">
              {/* Test Tube Rack Graphic */}
              <div className="flex items-end justify-center gap-1 w-full h-full pb-0.5">
                <div className="w-1.5 h-6 rounded-t-sm bg-gradient-to-t from-teal-400 to-teal-200/50 border border-teal-300/40 animate-pulse" />
                <div className="w-1.5 h-7 rounded-t-sm bg-gradient-to-t from-amber-400 to-amber-200/50 border border-amber-300/40" />
                <div className="w-1.5 h-5 rounded-t-sm bg-gradient-to-t from-purple-400 to-purple-200/50 border border-purple-300/40" />
                <div className="w-1.5 h-6.5 rounded-t-sm bg-gradient-to-t from-rose-400 to-rose-200/50 border border-rose-300/40" />
              </div>
            </div>

            <div>
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#00d2be] block font-bold">
                DIAGNOSTIC SUITE
              </span>
              <h3 className="text-sm font-bold text-[#f0f4f8] group-hover:text-[#00d2be] transition-colors leading-tight">
                Water Parameters
              </h3>
            </div>
          </div>

          <ArrowUpRight
            size={14}
            className="text-[#8e9fb5] group-hover:text-[#00d2be] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0"
          />
        </div>

        {/* Telemetry Snapshot */}
        <p className="text-xs text-[#8e9fb5] font-mono leading-relaxed line-clamp-2">
          {latestParam ? (
            <>
              Latest test: <strong className="text-[#f0f4f8]">{new Date(latestParam.date).toLocaleDateString()}</strong> • pH:{" "}
              <strong className="text-[#00d2be]">{latestParam.ph?.toFixed(2) || "N/A"}</strong> • {isFreshwater ? "TDS" : "Sal"}:{" "}
              <strong className="text-[#00d2be]">
                {isFreshwater ? `${Math.round(latestParam.tds ?? 0)} ppm` : `${latestParam.salinity ?? "1.025"} SG`}
              </strong>
            </>
          ) : (
            "No tests recorded yet. Click to log first test parameters."
          )}
        </p>

        {/* Action Pills: Log vs Charts */}
        <div className="mt-3.5 pt-2.5 border-t border-[#28364a]/60 flex items-center justify-between text-[10px] font-mono">
          <span className="text-[#8e9fb5] flex items-center gap-1 font-semibold">
            <Droplet size={11} className="text-[#00d2be]" /> {tank.parameters?.length || 0} Test Logs
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenCharts) onOpenCharts();
              else onSelectTab("charts");
            }}
            className="px-2 py-0.5 rounded bg-[#0b1019] hover:bg-[#00d2be]/20 text-[#00d2be] border border-[#00d2be]/40 font-bold transition-all flex items-center gap-1"
            title="Open Historical Trends & AI Analysis"
          >
            <LineChart size={10} /> Charts & Trends
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* POD 2: CALCULATOR WIDGET (Dosing & Water Chemistry Engine) */}
      {/* ========================================================= */}
      <div
        onClick={() => onSelectTab("calc")}
        className={`group relative p-4 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-xl ${
          activeTab === "calc"
            ? "bg-[#162030]/90 border-[#00d2be] shadow-[0_0_25px_rgba(0,210,190,0.25)] ring-1 ring-[#00d2be]/40"
            : "bg-[#121824]/80 border-[#28364a] hover:border-[#00d2be]/60 hover:bg-[#162232]/80 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
        }`}
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff6b35] to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            {/* Stylized Calculator Terminal Graphic */}
            <div className="w-10 h-10 rounded-xl bg-[#0b1019] border border-[#28364a] flex flex-col items-center justify-center p-1 shrink-0 group-hover:border-[#ff6b35]/60 transition-colors shadow-inner">
              <div className="w-7 h-2 rounded bg-black border border-emerald-500/40 flex items-center justify-end px-1 mb-1">
                <span className="font-mono text-[7px] text-emerald-400 font-bold">12.5mL</span>
              </div>
              <div className="grid grid-cols-3 gap-0.5 w-6">
                <div className="w-1.5 h-1 rounded-[1px] bg-[#28364a]" />
                <div className="w-1.5 h-1 rounded-[1px] bg-[#28364a]" />
                <div className="w-1.5 h-1 rounded-[1px] bg-[#ff6b35]" />
                <div className="w-1.5 h-1 rounded-[1px] bg-[#28364a]" />
                <div className="w-1.5 h-1 rounded-[1px] bg-[#28364a]" />
                <div className="w-1.5 h-1 rounded-[1px] bg-[#00d2be]" />
              </div>
            </div>

            <div>
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#ff6b35] block font-bold">
                COMPUTATION TERMINAL
              </span>
              <h3 className="text-sm font-bold text-[#f0f4f8] group-hover:text-[#ff6b35] transition-colors leading-tight">
                Calculators & Dosing
              </h3>
            </div>
          </div>

          <ArrowUpRight
            size={14}
            className="text-[#8e9fb5] group-hover:text-[#ff6b35] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0"
          />
        </div>

        <p className="text-xs text-[#8e9fb5] font-mono leading-relaxed line-clamp-2">
          {isFreshwater
            ? "Estimative Index (EI), All-In-One liquid ferts, RO/DI remineralizing formulas, & AI product scanner."
            : "Salt mix batch ratios, Tropic Marin All-For-Reef, trace element dosing, & AI reagent advisor."}
        </p>

        <div className="mt-3.5 pt-2.5 border-t border-[#28364a]/60 flex items-center justify-between text-[10px] font-mono">
          <span className="text-[#8e9fb5] flex items-center gap-1 font-semibold">
            <Calculator size={11} className="text-[#ff6b35]" /> Precision Chemical Math
          </span>
          <span className="px-1.5 py-0.5 rounded bg-[#ff6b35]/15 text-[#ff6b35] font-bold">
            {isFreshwater ? "PLANTED" : "REEF"} MODE
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* POD 3: CHECKLIST / CLIPBOARD (Maintenance Protocols) */}
      {/* ========================================================= */}
      <div
        onClick={() => onSelectTab("tasks")}
        className={`group relative p-4 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-xl ${
          activeTab === "tasks"
            ? "bg-[#162030]/90 border-[#00d2be] shadow-[0_0_25px_rgba(0,210,190,0.25)] ring-1 ring-[#00d2be]/40"
            : "bg-[#121824]/80 border-[#28364a] hover:border-[#00d2be]/60 hover:bg-[#162232]/80 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
        }`}
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            {/* Stylized Clipboard Terminal Graphic */}
            <div className="relative w-10 h-10 rounded-xl bg-[#0b1019] border border-[#28364a] flex flex-col items-center justify-center p-1.5 shrink-0 group-hover:border-emerald-400/50 transition-colors shadow-inner">
              {/* Clipboard top clamp */}
              <div className="w-4 h-1.5 rounded-t-sm bg-gradient-to-b from-[#8e9fb5] to-[#28364a] -mt-1 mb-1 border-t border-white/40" />
              {/* Checklist lines */}
              <div className="w-full space-y-1 px-1">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <div className="h-1 bg-[#28364a] rounded w-full" />
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <div className="h-1 bg-[#28364a] rounded w-3/4" />
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#8e9fb5]/40 shrink-0" />
                  <div className="h-1 bg-[#28364a] rounded w-2/3" />
                </div>
              </div>
            </div>

            <div>
              <span className="font-mono text-[9px] uppercase tracking-widest text-emerald-400 block font-bold">
                OPERATIONS LOG
              </span>
              <h3 className="text-sm font-bold text-[#f0f4f8] group-hover:text-emerald-400 transition-colors leading-tight">
                Maintenance Tasks
              </h3>
            </div>
          </div>

          <ArrowUpRight
            size={14}
            className="text-[#8e9fb5] group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0"
          />
        </div>

        <p className="text-xs text-[#8e9fb5] font-mono leading-relaxed line-clamp-2">
          {totalTasks > 0 ? (
            <>
              Status: <strong className="text-[#f0f4f8]">{dueTasks > 0 ? `${dueTasks} tasks currently due` : "All maintenance up to date"}</strong>.
              Automated reminders for water changes & filter media.
            </>
          ) : (
            "Scheduled system protocols, water change recurring cycles, & hardware maintenance checklist."
          )}
        </p>

        <div className="mt-3.5 pt-2.5 border-t border-[#28364a]/60 flex items-center justify-between text-[10px] font-mono">
          <span className="text-[#8e9fb5] flex items-center gap-1 font-semibold">
            <CheckSquare size={11} className="text-emerald-400" /> {totalTasks} Tasks Tracked
          </span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-400/15 text-emerald-400 font-bold">
            {dueTasks === 0 ? "100% NOMINAL" : `${dueTasks} DUE NOW`}
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* POD 4: STICKY NOTE WIDGET (Lab Memos & Field Recipes) */}
      {/* ========================================================= */}
      <div
        onClick={() => onSelectTab("notes")}
        className={`group relative p-4 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-xl ${
          activeTab === "notes"
            ? "bg-[#162030]/90 border-[#00d2be] shadow-[0_0_25px_rgba(0,210,190,0.25)] ring-1 ring-[#00d2be]/40"
            : "bg-[#121824]/80 border-[#28364a] hover:border-[#00d2be]/60 hover:bg-[#162232]/80 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
        }`}
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            {/* Stylized Sticky Note Graphic with Pin */}
            <div className="relative w-10 h-10 rounded-xl bg-[#0b1019] border border-[#28364a] flex items-center justify-center p-1.5 shrink-0 group-hover:border-amber-400/50 transition-colors shadow-inner">
              {/* Sticky note card shape */}
              <div className="w-7 h-7 rounded bg-amber-400/20 border border-amber-400/50 shadow-sm relative flex flex-col justify-between p-1">
                {/* Pin head */}
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute -top-1 -right-0.5 shadow-sm" />
                <div className="h-0.5 bg-amber-300/60 rounded w-full" />
                <div className="h-0.5 bg-amber-300/60 rounded w-4/5" />
                <div className="h-0.5 bg-amber-300/60 rounded w-3/5" />
              </div>
            </div>

            <div>
              <span className="font-mono text-[9px] uppercase tracking-widest text-amber-400 block font-bold">
                FIELD LOG & PROTOCOLS
              </span>
              <h3 className="text-sm font-bold text-[#f0f4f8] group-hover:text-amber-400 transition-colors leading-tight">
                Sticky Notes
              </h3>
            </div>
          </div>

          <ArrowUpRight
            size={14}
            className="text-[#8e9fb5] group-hover:text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0"
          />
        </div>

        <p className="text-xs text-[#8e9fb5] font-mono leading-relaxed line-clamp-2">
          {totalNotesCount > 0 ? (
            <>
              {pinnedNotesCount > 0 && <strong className="text-amber-300">📌 {pinnedNotesCount} pinned • </strong>}
              {totalNotesCount} notes recorded: dosing formulas, water change dates & AI summaries.
            </>
          ) : (
            "Lab field memos, pinned AI recommendations, emergency recipes, & customized reminders."
          )}
        </p>

        <div className="mt-3.5 pt-2.5 border-t border-[#28364a]/60 flex items-center justify-between text-[10px] font-mono">
          <span className="text-[#8e9fb5] flex items-center gap-1 font-semibold">
            <StickyNote size={11} className="text-amber-400" /> {totalNotesCount} Notes Saved
          </span>
          <span className="px-1.5 py-0.5 rounded bg-amber-400/15 text-amber-400 font-bold">
            {pinnedNotesCount} PINNED
          </span>
        </div>
      </div>
    </div>
  );
}
