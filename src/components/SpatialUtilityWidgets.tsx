"use client";

import React from "react";
import { Tank, WaterParameter } from "@/types";
import {
  LineChart,
  Droplet,
  Calculator,
  StickyNote,
  CheckSquare,
  History,
  Printer,
  ChevronRight,
  FlaskConical,
} from "lucide-react";

interface Props {
  tank: Tank;
  latestParam?: WaterParameter;
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  onOpenCharts?: () => void;
}

export default function SpatialUtilityWidgets({
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
    <div className="w-full max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 mt-4 sm:mt-6 mb-2">
      {/* ========================================================= */}
      {/* 1. TESTING STATION: Minimalist Test Tubes & Reagents */}
      {/* ========================================================= */}
      <div
        onClick={() => onSelectTab("params")}
        className={`group relative p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-xl ${
          activeTab === "params" || activeTab === "charts"
            ? "bg-[#141b27] border-[#00d2be]/80 shadow-[0_10px_30px_rgba(0,210,190,0.18)]"
            : "bg-[#121824]/60 hover:bg-[#151e2b]/90 border-white/5 hover:border-[#00d2be]/40 shadow-[0_8px_25px_rgba(0,0,0,0.25)] hover:shadow-[0_12px_35px_rgba(0,210,190,0.1)]"
        }`}
      >
        <div className="flex flex-col h-full justify-between">
          <div className="flex items-start justify-between">
            {/* Minimalist Vector Test Tube Cluster */}
            <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-center p-2 group-hover:scale-105 transition-transform">
              <div className="flex items-end justify-center gap-1 h-full w-full">
                <div className="w-1.5 h-6 rounded-t-sm bg-[#00d2be]/80 border border-[#00d2be]" />
                <div className="w-1.5 h-7 rounded-t-sm bg-[#ff6b35]/80 border border-[#ff6b35]" />
                <div className="w-1.5 h-5 rounded-t-sm bg-purple-400/80 border border-purple-400" />
              </div>
            </div>

            <ChevronRight
              size={15}
              className="text-[#8e9fb5]/50 group-hover:text-[#00d2be] group-hover:translate-x-0.5 transition-all mt-1"
            />
          </div>

          <div className="mt-3.5">
            <span className="text-[10px] uppercase tracking-wider text-[#00d2be] font-semibold block">
              Testing Station
            </span>
            <h3 className="text-sm font-semibold text-[#f0f4f8] group-hover:text-[#00d2be] transition-colors">
              Water Parameters
            </h3>
            <p className="text-xs text-[#8e9fb5] mt-1 line-clamp-1">
              {latestParam ? (
                <>pH {latestParam.ph?.toFixed(2) || "N/A"} • {isFreshwater ? `${Math.round(latestParam.tds ?? 0)} ppm` : `${latestParam.salinity ?? "1.025"} SG`}</>
              ) : (
                "Log water chemistry"
              )}
            </p>
          </div>

          <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-[#8e9fb5]">
            <span className="flex items-center gap-1">
              <Droplet size={11} className="text-[#00d2be]" /> {tank.parameters?.length || 0} logs
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenCharts) onOpenCharts();
                else onSelectTab("charts");
              }}
              className="text-[10px] text-[#00d2be] hover:underline flex items-center gap-0.5 font-medium cursor-pointer"
            >
              <LineChart size={10} /> Charts
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. OPERATIONS CLIPBOARD: Minimalist Checklist */}
      {/* ========================================================= */}
      <div
        onClick={() => onSelectTab("tasks")}
        className={`group relative p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-xl ${
          activeTab === "tasks"
            ? "bg-[#141b27] border-[#00d2be]/80 shadow-[0_10px_30px_rgba(0,210,190,0.18)]"
            : "bg-[#121824]/60 hover:bg-[#151e2b]/90 border-white/5 hover:border-[#00d2be]/40 shadow-[0_8px_25px_rgba(0,0,0,0.25)] hover:shadow-[0_12px_35px_rgba(0,210,190,0.1)]"
        }`}
      >
        <div className="flex flex-col h-full justify-between">
          <div className="flex items-start justify-between">
            {/* Minimalist Clipboard Graphic */}
            <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/5 flex flex-col items-center justify-center p-2 group-hover:scale-105 transition-transform">
              <div className="w-4 h-1 rounded-t-sm bg-[#8e9fb5]/50 -mt-0.5 mb-1" />
              <div className="w-full space-y-1 px-0.5">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <div className="h-0.5 bg-white/20 rounded w-full" />
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <div className="h-0.5 bg-white/20 rounded w-3/4" />
                </div>
              </div>
            </div>

            <ChevronRight
              size={15}
              className="text-[#8e9fb5]/50 group-hover:text-[#00d2be] group-hover:translate-x-0.5 transition-all mt-1"
            />
          </div>

          <div className="mt-3.5">
            <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-semibold block">
              Operations Clipboard
            </span>
            <h3 className="text-sm font-semibold text-[#f0f4f8] group-hover:text-emerald-400 transition-colors">
              Maintenance Tasks
            </h3>
            <p className="text-xs text-[#8e9fb5] mt-1 line-clamp-1">
              {dueTasks > 0 ? `${dueTasks} tasks due` : "All tasks up to date"}
            </p>
          </div>

          <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-[#8e9fb5]">
            <span className="flex items-center gap-1">
              <CheckSquare size={11} className="text-emerald-400" /> {totalTasks} tracked
            </span>
            <span className="text-[10px] font-medium text-emerald-400">
              {dueTasks === 0 ? "Nominal" : `${dueTasks} due`}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. NOTES STATION: Flat-Design Sticky Note */}
      {/* ========================================================= */}
      <div
        onClick={() => onSelectTab("notes")}
        className={`group relative p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-xl ${
          activeTab === "notes"
            ? "bg-[#141b27] border-[#00d2be]/80 shadow-[0_10px_30px_rgba(0,210,190,0.18)]"
            : "bg-[#121824]/60 hover:bg-[#151e2b]/90 border-white/5 hover:border-[#00d2be]/40 shadow-[0_8px_25px_rgba(0,0,0,0.25)] hover:shadow-[0_12px_35px_rgba(0,210,190,0.1)]"
        }`}
      >
        <div className="flex flex-col h-full justify-between">
          <div className="flex items-start justify-between">
            {/* Flat-Design Sticky Note with Pin Graphic */}
            <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-center p-2 group-hover:scale-105 transition-transform">
              <div className="w-6 h-6 rounded bg-amber-400/20 border border-amber-400/40 relative flex flex-col justify-between p-1 shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute -top-1 -right-0.5 shadow-sm" />
                <div className="h-0.5 bg-amber-300/60 rounded w-full" />
                <div className="h-0.5 bg-amber-300/60 rounded w-2/3" />
              </div>
            </div>

            <ChevronRight
              size={15}
              className="text-[#8e9fb5]/50 group-hover:text-[#00d2be] group-hover:translate-x-0.5 transition-all mt-1"
            />
          </div>

          <div className="mt-3.5">
            <span className="text-[10px] uppercase tracking-wider text-amber-400 font-semibold block">
              Notes Station
            </span>
            <h3 className="text-sm font-semibold text-[#f0f4f8] group-hover:text-amber-400 transition-colors">
              Sticky Notes
            </h3>
            <p className="text-xs text-[#8e9fb5] mt-1 line-clamp-1">
              {pinnedNotesCount > 0 ? `${pinnedNotesCount} pinned recipes` : `${totalNotesCount} notes stored`}
            </p>
          </div>

          <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-[#8e9fb5]">
            <span className="flex items-center gap-1">
              <StickyNote size={11} className="text-amber-400" /> {totalNotesCount} notes
            </span>
            <span className="text-[10px] font-medium text-amber-400">
              {pinnedNotesCount} pinned
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. HARDWARE POD: Sleek Simplified Calculator Widget */}
      {/* ========================================================= */}
      <div
        onClick={() => onSelectTab("calc")}
        className={`group relative p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-xl ${
          activeTab === "calc"
            ? "bg-[#141b27] border-[#00d2be]/80 shadow-[0_10px_30px_rgba(0,210,190,0.18)]"
            : "bg-[#121824]/60 hover:bg-[#151e2b]/90 border-white/5 hover:border-[#00d2be]/40 shadow-[0_8px_25px_rgba(0,0,0,0.25)] hover:shadow-[0_12px_35px_rgba(0,210,190,0.1)]"
        }`}
      >
        <div className="flex flex-col h-full justify-between">
          <div className="flex items-start justify-between">
            {/* Sleek Calculator Terminal Graphic */}
            <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/5 flex flex-col items-center justify-center p-1.5 group-hover:scale-105 transition-transform">
              <div className="w-6 h-1.5 rounded-sm bg-black/60 border border-teal-400/40 mb-1 flex items-center justify-end px-0.5">
                <div className="w-2 h-0.5 bg-[#00d2be] rounded-full" />
              </div>
              <div className="grid grid-cols-3 gap-0.5 w-5">
                <div className="w-1 h-1 rounded-[1px] bg-white/20" />
                <div className="w-1 h-1 rounded-[1px] bg-white/20" />
                <div className="w-1 h-1 rounded-[1px] bg-[#ff6b35]" />
                <div className="w-1 h-1 rounded-[1px] bg-white/20" />
                <div className="w-1 h-1 rounded-[1px] bg-white/20" />
                <div className="w-1 h-1 rounded-[1px] bg-[#00d2be]" />
              </div>
            </div>

            <ChevronRight
              size={15}
              className="text-[#8e9fb5]/50 group-hover:text-[#00d2be] group-hover:translate-x-0.5 transition-all mt-1"
            />
          </div>

          <div className="mt-3.5">
            <span className="text-[10px] uppercase tracking-wider text-[#ff6b35] font-semibold block">
              Hardware Pod
            </span>
            <h3 className="text-sm font-semibold text-[#f0f4f8] group-hover:text-[#ff6b35] transition-colors">
              Calculators & Dosing
            </h3>
            <p className="text-xs text-[#8e9fb5] mt-1 line-clamp-1">
              {isFreshwater ? "EI / AIO ferts & remineralizer" : "Salt mix & trace dosing math"}
            </p>
          </div>

          <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-[#8e9fb5]">
            <span className="flex items-center gap-1">
              <Calculator size={11} className="text-[#ff6b35]" /> Precision dosing
            </span>
            <span className="text-[10px] font-medium text-[#ff6b35]">
              {isFreshwater ? "Planted" : "Reef"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
