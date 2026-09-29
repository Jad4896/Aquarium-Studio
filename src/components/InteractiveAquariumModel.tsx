"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Tank, WaterParameter, UnitSystem, SalinityUnit } from "@/types";
import { formatTemp, formatSalinity, formatVolume, galToL } from "@/lib/units";
import { generateProceduralAquarium } from "@/lib/proceduralTank";
import SumpConfigModal from "@/components/SumpConfigModal";
import {
  getVirtualTankLivestockIds,
  removeLivestockFromVirtualTank,
  toggleLivestockInVirtualTank,
} from "@/lib/virtualFaunaStorage";
import {
  VirtualLivestockItem,
  VirtualTankInhabitantsModal,
} from "@/components/VirtualTankFauna";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Maximize2,
  Minimize2,
  Sparkles,
  Fish,
  Sprout,
  Compass,
  Search,
  X,
  ShieldCheck,
  Activity,
  Edit3,
  Layers,
  Calendar,
  Cpu,
  Sun,
  Loader2,
  Check,
  Sliders,
  Trash2,
  Waves,
  Box,
} from "lucide-react";

interface Props {
  tank: Tank;
  allTanks?: Tank[];
  latestParam?: WaterParameter;
  coralCount: number;
  fishCount: number;
  isFocused: boolean;
  totalTanks?: number;
  currentTankIndex?: number;
  onTankClick: () => void;
  onOpenCorals: () => void;
  onOpenFish: () => void;
  onPrevTank?: () => void;
  onNextTank?: () => void;
  onSelectTank?: (tankId: string) => void;
  onUpdateTank?: (data: Partial<Tank>) => Promise<void>;
  onDeleteTank?: (id: string, name: string) => Promise<void> | void;
  onDeleteLivestock?: (id: string) => Promise<void> | void;
  unitSystem?: UnitSystem;
  salinityUnit?: SalinityUnit;
  onFaunaModalChange?: (isOpen: boolean) => void;
  onEditSpecsModalChange?: (isOpen: boolean) => void;
  onSumpModalChange?: (isOpen: boolean) => void;
  onOpenHealthDiagnostics?: () => void;
}

export default function InteractiveAquariumModel({
  tank,
  allTanks = [],
  latestParam,
  coralCount,
  fishCount,
  isFocused,
  totalTanks = 1,
  currentTankIndex = 0,
  onTankClick,
  onOpenCorals,
  onOpenFish,
  onPrevTank,
  onNextTank,
  onSelectTank,
  onUpdateTank,
  onDeleteTank,
  onDeleteLivestock,
  unitSystem = "metric",
  salinityUnit = "sg",
  onFaunaModalChange,
  onEditSpecsModalChange,
  onSumpModalChange,
  onOpenHealthDiagnostics,
}: Props) {
  const isFreshwater = tank.tankType === "FRESHWATER";

  // Client mounted state for safe portal mounting
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Edit Tank Specs Modal State
  const [isEditSpecsOpen, setIsEditSpecsOpen] = useState(false);
  const [isSavingSpecs, setIsSavingSpecs] = useState(false);

  // Sump & Refugium Config Modal State
  const [isSumpModalOpen, setIsSumpModalOpen] = useState(false);

  // Virtual Tank Fauna / Animated Inhabitants State
  const [isFaunaModalOpen, setIsFaunaModalOpen] = useState(false);

  useEffect(() => {
    onFaunaModalChange?.(isFaunaModalOpen);
    return () => {
      onFaunaModalChange?.(false);
    };
  }, [isFaunaModalOpen, onFaunaModalChange]);

  useEffect(() => {
    onEditSpecsModalChange?.(isEditSpecsOpen);
    return () => {
      onEditSpecsModalChange?.(false);
    };
  }, [isEditSpecsOpen, onEditSpecsModalChange]);

  useEffect(() => {
    onSumpModalChange?.(isSumpModalOpen);
    return () => {
      onSumpModalChange?.(false);
    };
  }, [isSumpModalOpen, onSumpModalChange]);

  const [activeFaunaIds, setActiveFaunaIds] = useState<string[]>(() =>
    getVirtualTankLivestockIds(tank.id)
  );

  useEffect(() => {
    setActiveFaunaIds(getVirtualTankLivestockIds(tank.id));
  }, [tank.id]);

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const custom = e as CustomEvent<{ tankId: string; ids: string[] }>;
      if (custom.detail?.tankId === tank.id) {
        setActiveFaunaIds(custom.detail.ids || []);
      }
    };
    window.addEventListener("virtual-tank-livestock-updated", handleUpdate);
    return () => {
      window.removeEventListener("virtual-tank-livestock-updated", handleUpdate);
    };
  }, [tank.id]);

  const activeVirtualLivestock = useMemo(() => {
    const list = tank.livestock || [];
    return list.filter((item) => activeFaunaIds.includes(item.id));
  }, [tank.livestock, activeFaunaIds]);

  const initDisplayVol =
    typeof tank.displayVolumeLiters === "number" && tank.displayVolumeLiters > 0
      ? tank.displayVolumeLiters
      : tank.volumeLiters || (isFreshwater ? 40 : 80);
  const initSumpVol = tank.sumpVolumeLiters || 0;

  const [specForm, setSpecForm] = useState({
    name: tank.name || "",
    hasSump: Boolean(tank.hasSump),
    displayVolume:
      unitSystem === "imperial"
        ? (initDisplayVol * 0.264172).toFixed(1)
        : initDisplayVol.toString(),
    sumpVolume:
      unitSystem === "imperial"
        ? (initSumpVol * 0.264172).toFixed(1)
        : initSumpVol.toString(),
    formFactor: (tank.formFactor && tank.formFactor !== "auto") ? tank.formFactor : "standard",
    purpose: tank.purpose || "",
    aquascapeStyle: tank.aquascapeStyle || (isFreshwater ? "nature" : "mixed"),
    setupDate: tank.setupDate || new Date().toISOString().slice(0, 10),
    cycle: tank.cycle || "",
    equipment: tank.equipment || "",
    lighting: tank.lighting || "",
    tempTarget: tank.tempTarget || "25.0 - 26.0",
    phTarget: tank.phTarget || (isFreshwater ? "6.4 - 7.2" : "8.1 - 8.4"),
    salinityTarget: tank.salinityTarget || "1.025 - 1.026",
    tdsTarget: tank.tdsTarget || "120 - 180 ppm",
    dkhTarget: tank.dkhTarget || "8.0 - 9.0",
    caTarget: tank.caTarget || "400 - 450",
    mgTarget: tank.mgTarget || "1300 - 1400",
    no3Target: tank.no3Target || "5.0 - 15.0",
    po4Target: tank.po4Target || "0.03 - 0.08",
    ghTarget: tank.ghTarget || "4.0 - 8.0 dGH",
    khTarget: tank.khTarget || "1.0 - 4.0 dKH",
  });

  useEffect(() => {
    const disp =
      typeof tank.displayVolumeLiters === "number" && tank.displayVolumeLiters > 0
        ? tank.displayVolumeLiters
        : tank.volumeLiters || (isFreshwater ? 40 : 80);
    const smp = tank.sumpVolumeLiters || 0;

    setSpecForm({
      name: tank.name || "",
      hasSump: Boolean(tank.hasSump),
      displayVolume:
        unitSystem === "imperial"
          ? (disp * 0.264172).toFixed(1)
          : disp.toString(),
      sumpVolume:
        unitSystem === "imperial"
          ? (smp * 0.264172).toFixed(1)
          : smp.toString(),
      formFactor: (tank.formFactor && tank.formFactor !== "auto") ? tank.formFactor : "standard",
      purpose: tank.purpose || "",
      aquascapeStyle: tank.aquascapeStyle || (isFreshwater ? "nature" : "mixed"),
      setupDate: tank.setupDate || new Date().toISOString().slice(0, 10),
      cycle: tank.cycle || "",
      equipment: tank.equipment || "",
      lighting: tank.lighting || "",
      tempTarget: tank.tempTarget || "25.0 - 26.0",
      phTarget: tank.phTarget || (isFreshwater ? "6.4 - 7.2" : "8.1 - 8.4"),
      salinityTarget: tank.salinityTarget || "1.025 - 1.026",
      tdsTarget: tank.tdsTarget || "120 - 180 ppm",
      dkhTarget: tank.dkhTarget || "8.0 - 9.0",
      caTarget: tank.caTarget || "400 - 450",
      mgTarget: tank.mgTarget || "1300 - 1400",
      no3Target: tank.no3Target || "5.0 - 15.0",
      po4Target: tank.po4Target || "0.03 - 0.08",
      ghTarget: tank.ghTarget || "4.0 - 8.0 dGH",
      khTarget: tank.khTarget || "1.0 - 4.0 dKH",
    });
  }, [tank, unitSystem, isFreshwater]);

  const handleSaveSpecs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateTank) return;
    setIsSavingSpecs(true);
    try {
      const dispNum = parseFloat(specForm.displayVolume) || (isFreshwater ? 40 : 80);
      const displayVolumeLiters = unitSystem === "imperial" ? galToL(dispNum) : dispNum;
      const sumpNum = specForm.hasSump ? parseFloat(specForm.sumpVolume) || 0 : 0;
      const sumpVolumeLiters = specForm.hasSump
        ? (unitSystem === "imperial" ? galToL(sumpNum) : sumpNum)
        : 0;
      const refVol = tank.hasRefugium ? (tank.refugiumVolumeLiters || 0) : 0;
      const volumeLiters = displayVolumeLiters + sumpVolumeLiters + refVol;

      await onUpdateTank({
        name: specForm.name,
        hasSump: specForm.hasSump,
        displayVolumeLiters,
        sumpVolumeLiters,
        volumeLiters,
        formFactor: specForm.formFactor,
        purpose: specForm.purpose,
        aquascapeStyle: specForm.aquascapeStyle,
        setupDate: specForm.setupDate,
        cycle: specForm.cycle,
        equipment: specForm.equipment,
        lighting: specForm.lighting,
        tempTarget: specForm.tempTarget,
        phTarget: specForm.phTarget,
        salinityTarget: specForm.salinityTarget,
        tdsTarget: specForm.tdsTarget,
        dkhTarget: specForm.dkhTarget,
        caTarget: specForm.caTarget,
        mgTarget: specForm.mgTarget,
        no3Target: specForm.no3Target,
        po4Target: specForm.po4Target,
        ghTarget: specForm.ghTarget,
        khTarget: specForm.khTarget,
      });
      setIsEditSpecsOpen(false);
    } catch (err) {
      console.error("Failed to update tank specifications:", err);
    } finally {
      setIsSavingSpecs(false);
    }
  };

  // Procedural Configuration derived deterministically from tank
  const procedural = useMemo(() => generateProceduralAquarium(tank), [tank]);

  // Dynamic Sump & Refugium summary description
  const sumpSummaryText = useMemo(() => {
    const parts: string[] = [];
    if (tank.hasSump) {
      parts.push(`${tank.sumpChambers || 3} Chambers`);
      if (tank.sumpEquipment) {
        parts.push(tank.sumpEquipment);
      } else {
        parts.push("Skimmer, Return Pump & Heater");
      }
      if (tank.sumpMedia) {
        parts.push(`Media: ${tank.sumpMedia}`);
      }
    }
    if (tank.hasRefugium) {
      const fugeDetails = [
        tank.refugiumType || "Macroalgae",
        tank.refugiumLighting ? `${tank.refugiumLighting} Light` : "",
      ]
        .filter(Boolean)
        .join(", ");
      parts.push(`Refugium (${fugeDetails})`);
    }
    return parts.length > 0
      ? parts.join(" • ")
      : "Configure chambers, media, equipment & refugium";
  }, [
    tank.hasSump,
    tank.sumpChambers,
    tank.sumpEquipment,
    tank.sumpMedia,
    tank.hasRefugium,
    tank.refugiumType,
    tank.refugiumLighting,
  ]);

  // Anti-Nausea Motion Control: Default to locked/steady view
  const [isMotionLocked, setIsMotionLocked] = useState<boolean>(true);
  useEffect(() => {
    const saved = localStorage.getItem("aquarium_motion_locked");
    if (saved !== null) {
      setIsMotionLocked(saved === "true");
    }
  }, []);

  const toggleMotionLock = () => {
    const next = !isMotionLocked;
    setIsMotionLocked(next);
    localStorage.setItem("aquarium_motion_locked", String(next));
    if (next) {
      setTilt({ rotateX: 0, rotateY: 0, posX: 0, posY: 0 });
    }
  };

  // 3D Micro-tilt physics (kept to absolute minimum to eliminate nausea)
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, posX: 0, posY: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const tankVesselAreaRef = useRef<HTMLDivElement>(null);

  // Wheel listener on the virtual tank: strictly prevent webpage scrolling and cycle tanks smoothly
  useEffect(() => {
    const el = tankVesselAreaRef.current;
    if (!el) return;

    let lastScrollTime = 0;

    const onWheel = (e: WheelEvent) => {
      // Don't intercept if inside any modal, dropdown, or text input
      const target = e.target as HTMLElement | null;
      if (
        target?.closest(
          '[data-no-carousel-scroll], .overflow-y-auto, .overflow-auto, [role="listbox"], input, textarea, select'
        )
      ) {
        return;
      }

      // CRITICAL: Prevent the webpage from scrolling when the mouse is over the virtual tank
      e.preventDefault();
      e.stopPropagation();

      if (totalTanks <= 1) return;

      const now = Date.now();
      if (now - lastScrollTime < 380) return; // Debounce 380ms for crisp, responsive tank switching

      if (Math.abs(e.deltaX) > 15 || Math.abs(e.deltaY) > 15) {
        if (e.deltaX > 15 || e.deltaY > 15) {
          if (onNextTank) onNextTank();
          lastScrollTime = now;
        } else if (e.deltaX < -15 || e.deltaY < -15) {
          if (onPrevTank) onPrevTank();
          lastScrollTime = now;
        }
      }
    };

    let touchStartX: number | null = null;
    const onTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (touchStartX === null || totalTanks <= 1) return;
      const diff = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) {
          if (onPrevTank) onPrevTank();
        } else {
          if (onNextTank) onNextTank();
        }
      }
      touchStartX = null;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [totalTanks, onPrevTank, onNextTank]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMotionLocked || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to +0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to +0.5

    // Minimalist micro-tilt (max 0.4 - 0.5 degrees, max 1.5px shift)
    setTilt({
      rotateX: -y * 0.8,
      rotateY: x * 1.0,
      posX: x * 1.5,
      posY: y * 1.5,
    });
  };

  const handleMouseEnter = () => {
    if (!isMotionLocked) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ rotateX: 0, rotateY: 0, posX: 0, posY: 0 });
  };

  // Quick Tank Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);

  // Non-passive wheel listener on dropdown to strictly prevent webpage/carousel scrolling
  useEffect(() => {
    const el = searchDropdownRef.current;
    if (!el || !isSearchOpen) return;

    const onWheel = (e: WheelEvent) => {
      // Stop propagation so carousel wheel listeners never fire
      e.stopPropagation();

      const { scrollTop, scrollHeight, clientHeight } = el;
      const isScrollUp = e.deltaY < 0;
      const isScrollDown = e.deltaY > 0;

      // If list doesn't overflow, prevent page scrolling completely
      if (scrollHeight <= clientHeight) {
        e.preventDefault();
        return;
      }

      // If at top or bottom boundary, prevent scroll chaining to the webpage
      if (
        (isScrollUp && scrollTop <= 0) ||
        (isScrollDown && scrollTop + clientHeight >= scrollHeight - 1)
      ) {
        e.preventDefault();
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
    };
  }, [isSearchOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredTanks = useMemo(() => {
    if (!searchQuery.trim()) return allTanks;
    const q = searchQuery.toLowerCase().trim();
    return allTanks.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.tankType.toLowerCase().includes(q) ||
        (t.purpose && t.purpose.toLowerCase().includes(q))
    );
  }, [allTanks, searchQuery]);

  const handleSelectSearchResult = (tankId: string) => {
    if (onSelectTank) onSelectTank(tankId);
    setSearchQuery("");
    setIsSearchOpen(false);
  };

  // Live telemetry formats
  const tempStr =
    latestParam?.temp !== undefined && latestParam?.temp !== null
      ? formatTemp(latestParam.temp, unitSystem)
      : tank.tempTarget
      ? `${tank.tempTarget}°C`
      : "25.0°C";

  const phStr =
    latestParam?.ph !== undefined && latestParam?.ph !== null
      ? latestParam.ph.toFixed(2)
      : tank.phTarget || (isFreshwater ? "6.80" : "8.25");

  const salinityOrTdsStr = isFreshwater
    ? latestParam?.tds !== undefined && latestParam?.tds !== null
      ? `${Math.round(latestParam.tds)} ppm`
      : tank.tdsTarget || "140 ppm"
    : latestParam?.salinity !== undefined && latestParam?.salinity !== null
    ? formatSalinity(latestParam.salinity, salinityUnit)
    : tank.salinityTarget || "1.025 SG";

  return (
    <div className="relative w-full max-w-7xl 2xl:max-w-[1440px] mx-auto flex flex-col items-center select-none">
      {/* 1. TANK IDENTIFICATION & CONTROL HEADER (Responsive for Mobile & Desktop) */}
      <div className="w-full max-w-[850px] flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 sm:px-2 mb-3.5 z-20">
        {/* Left Side on Desktop / Two Rows on Mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto min-w-0">
          {/* Mobile Row 1: Tank Badge + Quick Controls */}
          <div className="flex items-center justify-between gap-1.5 w-full sm:w-auto">
            {/* Main Tank Badge - Clickable to Edit Tank Specs */}
            <button
              type="button"
              onClick={() => setIsEditSpecsOpen(true)}
              className="group/badge flex items-center gap-1.5 sm:gap-2 bg-[#121824]/80 hover:bg-[#182335] backdrop-blur-md border border-[#28364a]/60 hover:border-[#00d2be]/70 px-2.5 sm:px-3.5 py-1.5 rounded-full shadow-sm transition-all cursor-pointer min-w-0 shrink"
              title="Click to edit aquarium specifications, volume, and sump setup"
            >
              <span className="w-2 h-2 rounded-full bg-[#00d2be] animate-pulse group-hover/badge:scale-125 transition-transform shrink-0" />
              
              {/* TANK NAME: Prioritized, Never Collapses to 0 */}
              <div className="flex items-center gap-1 min-w-0">
                <span className="text-xs sm:text-sm font-bold tracking-wide text-[#f0f4f8] group-hover/badge:text-[#00d2be] transition-colors max-w-[110px] xs:max-w-[140px] sm:max-w-[170px] truncate">
                  {tank.name || "Main Aquarium"}
                </span>
                <Edit3 size={11} className="text-[#8e9fb5] group-hover/badge:text-[#00d2be] transition-colors shrink-0" />
              </div>

              <span className="hidden xs:inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#8e9fb5] shrink-0">
                {isFreshwater ? "Freshwater" : "Saltwater"}
              </span>

              {/* Sump breakdown / Total Water volume (compact, elegant, never overflows) */}
              {tank.hasSump ? (
                <span className="text-[10px] font-semibold text-[#00d2be] bg-[#00d2be]/15 border border-[#00d2be]/40 px-1.5 sm:px-2 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0">
                  <span>🌊</span>
                  <span title="Total Water Volume" className="text-[#f0f4f8] font-bold">
                    {formatVolume(procedural.totalVolumeLiters, unitSystem)}
                  </span>
                </span>
              ) : (
                <span className="text-[10px] sm:text-[11px] text-[#8e9fb5] inline-flex items-center shrink-0">
                  • {formatVolume(procedural.displayVolumeLiters, unitSystem)}
                </span>
              )}
            </button>

            {/* Quick Controls on Mobile ONLY */}
            <div className="flex sm:hidden items-center gap-1 shrink-0">
              {/* Virtual Inhabitants Manager Toggle */}
              <button
                type="button"
                onClick={() => setIsFaunaModalOpen(true)}
                className="flex items-center justify-center gap-1 px-2 py-1 rounded-full bg-[#121824]/75 hover:bg-[#162030] text-[#00d2be] border border-[#00d2be]/40 text-xs font-medium transition-all shadow-sm cursor-pointer"
                title="Manage active livestock inhabitants"
              >
                <Sparkles size={11} className="shrink-0 text-[#00d2be]" />
                <span className="text-[9px] font-mono px-1 rounded-full bg-[#00d2be]/20 text-[#00d2be] font-bold">
                  {activeVirtualLivestock.length}
                </span>
              </button>

              {/* Motion Stability Toggle (Anti-Nausea) */}
              <button
                onClick={toggleMotionLock}
                className={`flex items-center justify-center p-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer shadow-sm w-7 h-7 ${
                  isMotionLocked
                    ? "bg-[#00d2be]/10 border-[#00d2be]/40 text-[#00d2be]"
                    : "bg-[#121824]/75 border-[#28364a]/60 text-[#8e9fb5] hover:text-[#f0f4f8]"
                }`}
                title={isMotionLocked ? "Camera locked. Tap to enable tilt." : "Camera tilt active. Tap to lock steady."}
              >
                {isMotionLocked ? <ShieldCheck size={12} className="shrink-0" /> : <Activity size={12} className="shrink-0" />}
              </button>

              {/* Carousel Dots */}
              {totalTanks > 1 && (
                <div className="flex items-center gap-1 bg-[#121824]/60 backdrop-blur-md px-1.5 py-1 rounded-full border border-[#28364a]/50 shrink-0">
                  {Array.from({ length: totalTanks }).map((_, idx) => (
                    <span
                      key={idx}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                        idx === currentTankIndex ? "bg-[#00d2be] w-2" : "bg-[#8e9fb5]/30"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Search & Select Dropdown for Tanks */}
          <div ref={searchContainerRef} className="relative w-full sm:w-auto shrink-0">
            <div
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-1.5 bg-[#121824]/80 hover:bg-[#182335] backdrop-blur-md border border-[#28364a]/60 hover:border-[#00d2be]/60 px-2.5 py-1 rounded-full text-xs transition-all focus-within:border-[#00d2be]/80 focus-within:ring-1 focus-within:ring-[#00d2be]/40 shadow-sm cursor-pointer"
            >
              <Search size={12} className="text-[#8e9fb5] shrink-0" />
              <input
                type="text"
                placeholder="Search tanks..."
                value={searchQuery}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSearchOpen(true);
                }}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setIsSearchOpen(false);
                    setSearchQuery("");
                  } else if (e.key === "Enter" && filteredTanks.length > 0) {
                    handleSelectSearchResult(filteredTanks[0].id);
                  }
                }}
                className="bg-transparent text-xs text-[#f0f4f8] placeholder-[#8e9fb5]/60 outline-none flex-1 sm:w-24 md:w-28 transition-all cursor-text"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchQuery("");
                  }}
                  className="text-[#8e9fb5] hover:text-[#f0f4f8] p-0.5 cursor-pointer"
                  title="Clear search"
                >
                  <X size={10} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSearchOpen((prev) => !prev);
                  }}
                  className="text-[#8e9fb5] hover:text-[#00d2be] p-0.5 cursor-pointer transition-colors"
                  title={isSearchOpen ? "Close tank list" : "Show all tanks"}
                >
                  <ChevronDown
                    size={12}
                    className={`transition-transform duration-200 ${isSearchOpen ? "rotate-180 text-[#00d2be]" : ""}`}
                  />
                </button>
              )}
            </div>

            {/* Autocomplete & Scrollable Tank List Dropdown */}
            {isSearchOpen && (
              <div
                ref={searchDropdownRef}
                data-no-carousel-scroll="true"
                style={{ overscrollBehavior: "contain" }}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                className="absolute top-full left-0 mt-2 w-full sm:w-80 max-h-64 sm:max-h-72 overflow-y-auto overscroll-contain bg-[#101622]/98 backdrop-blur-2xl border border-[#28364a] hover:border-[#00d2be]/40 rounded-xl shadow-2xl z-50 py-1.5 divide-y divide-white/5"
              >
                <div className="px-3 py-1.5 text-[10px] font-semibold text-[#8e9fb5] uppercase tracking-wider flex items-center justify-between">
                  <span>Existing Tanks ({filteredTanks.length})</span>
                  {searchQuery && (
                    <span className="text-[#00d2be] font-mono lowercase">
                      filtered
                    </span>
                  )}
                </div>
                {filteredTanks.length > 0 ? (
                  filteredTanks.map((t) => {
                    const isFw = t.tankType === "FRESHWATER";
                    const isSelected = t.id === tank.id;
                    return (
                      <div
                        key={t.id}
                        className={`group/item w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors hover:bg-white/[0.08] ${
                          isSelected ? "bg-[#00d2be]/15 text-[#00d2be]" : "text-[#f0f4f8]"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleSelectSearchResult(t.id)}
                          className="flex items-center gap-2 truncate pr-2 flex-1 text-left cursor-pointer"
                        >
                          <span className="text-base shrink-0">{isFw ? "🌿" : "🐠"}</span>
                          <div className="truncate min-w-0">
                            <p className={`font-bold truncate text-xs ${isSelected ? "text-[#00d2be]" : "text-[#f0f4f8]"}`}>
                              {t.name}
                            </p>
                            <p className="text-[10px] text-[#8e9fb5] truncate">
                              {isFw ? "Freshwater" : "Saltwater"} • {formatVolume(t.displayVolumeLiters || t.volumeLiters, unitSystem)}
                              {t.hasSump ? ` (+${formatVolume(t.sumpVolumeLiters || 0, unitSystem)} sump)` : ""}
                            </p>
                          </div>
                        </button>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {isSelected && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#00d2be]/20 text-[#00d2be] font-bold">
                              Active
                            </span>
                          )}
                          {onDeleteTank && allTanks.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteTank(t.id, t.name);
                              }}
                              className="p-1 rounded text-[#8e9fb5] hover:text-rose-400 hover:bg-rose-500/20 transition-all opacity-0 group-hover/item:opacity-100 cursor-pointer"
                              title={`Delete "${t.name}" Profile`}
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="px-3 py-4 text-xs text-[#8e9fb5] text-center">
                    No matching tanks found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Controls on Desktop ONLY */}
        <div className="hidden sm:flex items-center gap-1 sm:gap-1.5 shrink-0 sm:ml-auto">
          {/* Virtual Inhabitants Manager Toggle */}
          <button
            type="button"
            onClick={() => setIsFaunaModalOpen(true)}
            className="flex items-center justify-center gap-1 p-1.5 sm:px-2.5 sm:py-1 rounded-full bg-[#121824]/75 hover:bg-[#162030] text-[#00d2be] border border-[#00d2be]/40 hover:border-[#00d2be] text-xs font-medium transition-all shadow-sm cursor-pointer"
            title="Manage active 2D animated livestock inhabitants in virtual aquarium"
          >
            <Sparkles size={13} className="shrink-0 text-[#00d2be]" />
            <span className="text-[10px] hidden sm:inline">Fauna</span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-[#00d2be]/20 text-[#00d2be] font-bold">
              {activeVirtualLivestock.length}
            </span>
          </button>

          {/* Motion Stability Toggle (Anti-Nausea) */}
          <button
            onClick={toggleMotionLock}
            className={`flex items-center justify-center gap-1 p-1.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-medium border transition-all cursor-pointer shadow-sm w-7 h-7 sm:w-[76px] sm:h-auto ${
              isMotionLocked
                ? "bg-[#00d2be]/10 border-[#00d2be]/40 text-[#00d2be]"
                : "bg-[#121824]/75 border-[#28364a]/60 text-[#8e9fb5] hover:text-[#f0f4f8]"
            }`}
            title={
              isMotionLocked
                ? "Camera motion is locked (nausea-safe). Click to enable micro-tilt."
                : "Camera micro-tilt active. Click to lock stationary."
            }
          >
            {isMotionLocked ? <ShieldCheck size={13} className="shrink-0" /> : <Activity size={13} className="shrink-0" />}
            <span className="text-[10px] hidden sm:inline">
              {isMotionLocked ? "Steady" : "Tilt"}
            </span>
          </button>

          {/* Carousel Dots */}
          {totalTanks > 1 && (
            <div className="flex items-center gap-1 sm:gap-1.5 bg-[#121824]/60 backdrop-blur-md px-1.5 sm:px-2.5 py-1 rounded-full border border-[#28364a]/50 shrink-0">
              {Array.from({ length: totalTanks }).map((_, idx) => (
                <span
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentTankIndex
                      ? "bg-[#00d2be] w-2.5 sm:w-3"
                      : "bg-[#8e9fb5]/30"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. TANK VIEWPORT & RIGHT-SIDE VAULTS DOCK ROW */}
      <div className="w-full flex flex-col lg:flex-row items-center lg:items-start justify-center gap-4 xl:gap-6 2xl:gap-8">
        {/* Left Balancing Spacer: Keeps the Center Tank Chassis mathematically dead-center on large 2xl+ monitors without squishing smaller screens */}
        <div className="hidden 2xl:block 2xl:w-40 shrink-0 pointer-events-none" aria-hidden="true" />

        {/* Center Column: Fluidly adapts down on smaller screens, capped at max-w-4xl */}
        <div className="flex-1 min-w-0 max-w-4xl w-full flex flex-col items-center">
          <div className={`w-full ${procedural.containerMaxWidth} flex flex-col items-center`}>
            <div
              ref={tankVesselAreaRef}
            className="relative w-full flex items-center justify-center [perspective:1400px] transition-all duration-700 ease-out"
        style={{ overscrollBehavior: "contain" }}
      >
        {/* Minimalistic Left Arrow (Safe Mobile Margins) */}
        {totalTanks > 1 && onPrevTank && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrevTank();
            }}
            className="absolute left-1 sm:-left-4 xl:-left-5 z-30 p-1.5 sm:p-2.5 rounded-full bg-[#121824]/85 hover:bg-[#162232]/95 border border-white/10 hover:border-[#00d2be]/50 text-white/60 hover:text-[#00d2be] backdrop-blur-md transition-all duration-200 cursor-pointer shadow-lg hover:scale-105"
            title="Previous Tank (or scroll left/up)"
          >
            <ChevronLeft size={16} className="sm:w-5 sm:h-5" />
          </button>
        )}

        {/* Minimalistic Right Arrow (Safe Mobile Margins) */}
        {totalTanks > 1 && onNextTank && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNextTank();
            }}
            className="absolute right-1 sm:-right-4 xl:-right-5 z-30 p-1.5 sm:p-2.5 rounded-full bg-[#121824]/85 hover:bg-[#162232]/95 border border-white/10 hover:border-[#00d2be]/50 text-white/60 hover:text-[#00d2be] backdrop-blur-md transition-all duration-200 cursor-pointer shadow-lg hover:scale-105"
            title="Next Tank (or scroll right/down)"
          >
            <ChevronRight size={16} className="sm:w-5 sm:h-5" />
          </button>
        )}

        {/* Main 3D Rimless Tank Chassis */}
        <div
          ref={containerRef}
          onClick={onTankClick}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`group relative w-full rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 ease-out border ${
            isFocused
              ? "border-[#00d2be]/80 shadow-[0_25px_70px_rgba(0,210,190,0.25)] scale-[1.03] ring-1 ring-[#00d2be]/40"
              : "border-white/15 hover:border-[#00d2be]/60 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] hover:shadow-[0_25px_60px_rgba(0,210,190,0.18)] scale-100"
          }`}
          style={{
            transform: isMotionLocked
              ? "none"
              : `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
            transformStyle: "preserve-3d",
            transition: isHovered
              ? "transform 0.2s ease-out, border-color 0.3s ease, box-shadow 0.3s ease"
              : "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease, box-shadow 0.3s ease",
            backgroundColor: "#080c14",
            overscrollBehavior: "contain",
          }}
        >
          {/* Top Hanging Fixture & Telemetry Bar */}
          <div className="h-5 bg-gradient-to-r from-[#111722] via-[#1a2332] to-[#111722] border-b border-white/10 flex items-center justify-between px-3 sm:px-5 relative z-20">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsFaunaModalOpen(true);
              }}
              className="flex items-center gap-1.5 text-[9px] text-[#8e9fb5] hover:text-[#00d2be] font-medium transition-colors cursor-pointer group/inhab"
              title="Click to view and customize 2D animated livestock in virtual aquarium"
            >
              <Sparkles size={10} className="text-[#00d2be] group-hover/inhab:scale-125 transition-transform" />
              <span className="hidden xs:inline">Inhabitants:</span>
              <span className="text-[#00d2be] font-bold">{activeVirtualLivestock.length} Active</span>
            </button>
            <div className="flex items-center gap-2 text-[9px] text-[#8e9fb5] font-medium shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00d2be] animate-pulse shrink-0" />
              <span className="hidden sm:inline">{tempStr}</span>
              <span className="text-white/20 hidden sm:inline">•</span>
              <span className="text-[#00d2be] font-semibold">{salinityOrTdsStr}</span>
            </div>
          </div>


          {/* Aquarium Interior Viewport (Aspect fitted to volume / formFactor) */}
          <div className={`relative w-full ${procedural.viewportHeightClass} ${procedural.aspectRatioClass} overflow-hidden select-none`}>
            {/* ========================================================= */}
            {/* DEPTH LAYER -1: PROCEDURAL 3D TANK RENDER INTERIOR */}
            {/* ========================================================= */}
            <div
              className="absolute -inset-1 transition-transform duration-300 ease-out"
              style={{
                transform: isMotionLocked
                  ? "none"
                  : `translate3d(${-tilt.posX * 0.4}px, ${-tilt.posY * 0.4}px, -15px) scale(1.02)`,
                filter: procedural.waterFilter,
              }}
            >
              <Image
                src={procedural.bgImage}
                alt={procedural.archetypeName}
                fill
                priority
                className="object-cover object-center"
                sizes="(max-width: 896px) 100vw, 896px"
              />
            </div>

            {/* Ambient Water Depth Vignette & Glow */}
            <div
              className={`absolute inset-0 pointer-events-none transition-colors duration-500 ${procedural.waterTintGradient}`}
            />

            {/* Shimmering Dynamic Caustics Layer */}
            <div
              className="absolute inset-0 pointer-events-none aquarium-caustics-layer mix-blend-screen"
              style={{ opacity: procedural.causticsOpacity }}
            />

            {/* Animated Rising Micro-Bubbles */}
            {procedural.bubbles.position === "left" ? (
              <div
                className="absolute bottom-10 left-12 pointer-events-none flex flex-col items-center"
                style={{ opacity: procedural.bubbles.opacity, transform: `scale(${procedural.bubbles.scale})` }}
              >
                <div className="w-1.5 h-1.5 rounded-full border border-teal-200/50 bg-teal-100/30 animate-bubble-1 mb-1.5 shadow-[0_0_4px_rgba(20,235,215,0.6)]" />
                <div className="w-1 h-1 rounded-full border border-teal-200/60 bg-teal-100/40 animate-bubble-2 mb-2 shadow-[0_0_3px_rgba(20,235,215,0.6)]" />
                <div className="w-2 h-2 rounded-full border border-teal-200/40 bg-teal-100/20 animate-bubble-3 mb-1 shadow-[0_0_4px_rgba(20,235,215,0.5)]" />
              </div>
            ) : procedural.bubbles.position === "right" ? (
              <div
                className="absolute bottom-12 right-20 pointer-events-none flex flex-col items-center"
                style={{ opacity: procedural.bubbles.opacity, transform: `scale(${procedural.bubbles.scale})` }}
              >
                <div className="w-1 h-1 rounded-full border border-cyan-200/50 bg-cyan-100/30 animate-bubble-2 mb-2" />
                <div className="w-1.5 h-1.5 rounded-full border border-cyan-200/60 bg-cyan-100/40 animate-bubble-1 mb-1.5" />
                <div className="w-1 h-1 rounded-full border border-cyan-200/40 bg-cyan-100/20 animate-bubble-3 mb-1" />
              </div>
            ) : (
              <div
                className="absolute bottom-11 right-1/3 pointer-events-none flex flex-col items-center"
                style={{ opacity: procedural.bubbles.opacity, transform: `scale(${procedural.bubbles.scale})` }}
              >
                <div className="w-1.5 h-1.5 rounded-full border border-teal-200/50 bg-teal-100/30 animate-bubble-1 mb-1.5" />
                <div className="w-1 h-1 rounded-full border border-teal-200/60 bg-teal-100/40 animate-bubble-2 mb-2" />
              </div>
            )}

            {/* Top Waterline Meniscus Refraction */}
            <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-b from-white/20 via-[#00d2be]/10 to-transparent pointer-events-none border-t border-white/25" />


            {/* ========================================================= */}
            {/* DEPTH LAYER +1.5: LOGGED ANIMATED VIRTUAL LIVESTOCK       */}
            {/* ========================================================= */}
            <div
              className="absolute inset-0 pointer-events-none overflow-hidden"
              style={{
                transform: isMotionLocked
                  ? "none"
                  : `translate3d(${tilt.posX * 0.9}px, ${tilt.posY * 0.9}px, 12px)`,
              }}
            >
              {activeVirtualLivestock.map((item, idx) => (
                <VirtualLivestockItem
                  key={item.id}
                  item={item}
                  index={idx}
                  formFactor={tank.formFactor || "standard"}
                  tankId={tank.id}
                  onRemove={(id) => {
                    removeLivestockFromVirtualTank(tank.id, id);
                  }}
                />
              ))}
            </div>

            {/* ========================================================= */}
            {/* DEPTH LAYER +2: ULTRA-CLEAR RIMLESS GLASS FRONT REFLECTION */}
            {/* ========================================================= */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-white/[0.07] pointer-events-none" />
            <div className="absolute inset-0 ring-1 ring-inset ring-white/10 pointer-events-none rounded-2xl" />

            {/* Bottom Glass Seam Bevel */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-teal-500/20 via-cyan-400/30 to-teal-500/20 pointer-events-none" />

            {/* Cinematic Center Focus Prompt */}
            {!isFocused && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
                <span className="text-[11px] font-medium tracking-wide text-white/90 bg-black/60 px-3.5 py-1.5 rounded-full border border-white/15 backdrop-blur-md shadow-lg flex items-center gap-1.5">
                  <Compass size={12} className="text-[#00d2be]" />
                  Click glass to inspect tank profile
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SUB-CHASSIS: SUMP & REFUGIUM FILTRATION SYSTEM */}
      {/* ========================================================= */}
      {(procedural.hasSump || tank.hasRefugium) ? (
        <div className="w-full mt-3 px-1 transition-all duration-700 ease-out">
          <div
            onClick={() => setIsSumpModalOpen(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setIsSumpModalOpen(true);
              }
            }}
            title="Click to edit sump & refugium setup"
            className="group/sump bg-[#0b1019]/90 border border-[#233144] hover:border-[#00d2be]/60 hover:bg-[#0e1624] rounded-xl p-3 backdrop-blur-md transition-all shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 cursor-pointer select-none"
          >
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-9 h-9 rounded-lg bg-[#00d2be]/10 border border-[#00d2be]/30 flex items-center justify-center text-[#00d2be] shrink-0 shadow-inner group-hover/sump:scale-105 group-hover/sump:border-[#00d2be] transition-all">
                <Waves size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-[#f0f4f8] flex items-center gap-1.5">
                    <span>
                      {tank.hasSump && tank.hasRefugium
                        ? "Under-Cabinet Sump & Refugium"
                        : tank.hasRefugium
                        ? "Refugium Filtration System"
                        : "Under-Cabinet Sump Filtration"}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#00d2be] opacity-80 group-hover/sump:opacity-100 transition-opacity bg-[#00d2be]/10 px-1.5 py-0.5 rounded border border-[#00d2be]/20">
                    <Edit3 size={10} />
                    <span>Edit Setup</span>
                  </span>
                </div>
                <p className="text-[10px] text-[#8e9fb5] mt-0.5 truncate max-w-[280px] sm:max-w-md group-hover/sump:text-[#b4c3d6] transition-colors">
                  {sumpSummaryText}
                </p>
              </div>
            </div>

            {/* Volume Metrics Tri-Pill */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-[#080d14] border border-[#1e2a3a] px-2.5 sm:px-3 py-1.5 rounded-lg text-xs shrink-0 shadow-inner">
              <div className="text-center px-1 sm:px-1.5">
                <span className="text-[9px] uppercase tracking-wider text-[#8e9fb5] block font-semibold">
                  Display
                </span>
                <span className="text-xs font-bold text-[#f0f4f8]">
                  {formatVolume(procedural.displayVolumeLiters, unitSystem)}
                </span>
              </div>
              {procedural.hasSump && (
                <>
                  <span className="text-[#8e9fb5]/40 font-bold">+</span>
                  <div className="text-center px-1 sm:px-1.5">
                    <span className="text-[9px] uppercase tracking-wider text-[#00d2be] block font-semibold">
                      Sump
                    </span>
                    <span className="text-xs font-bold text-[#00d2be]">
                      {formatVolume(procedural.sumpVolumeLiters, unitSystem)}
                    </span>
                  </div>
                </>
              )}
              {tank.hasRefugium && (tank.refugiumVolumeLiters || 0) > 0 && (
                <>
                  <span className="text-[#8e9fb5]/40 font-bold">+</span>
                  <div className="text-center px-1 sm:px-1.5">
                    <span className="text-[9px] uppercase tracking-wider text-[#22c55e] block font-semibold">
                      Refugium
                    </span>
                    <span className="text-xs font-bold text-[#22c55e]">
                      {formatVolume(tank.refugiumVolumeLiters || 0, unitSystem)}
                    </span>
                  </div>
                </>
              )}
              <span className="text-[#8e9fb5]/40 font-bold">=</span>
              <div className="text-center px-1.5 sm:px-2 bg-[#00d2be]/10 border border-[#00d2be]/20 rounded py-0.5">
                <span className="text-[9px] uppercase tracking-wider text-[#8e9fb5] block font-semibold">
                  Total Water
                </span>
                <span className="text-xs font-extrabold text-[#f0f4f8]">
                  {formatVolume(procedural.totalVolumeLiters, unitSystem)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full mt-2 px-1">
          <button
            type="button"
            onClick={() => setIsSumpModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-dashed border-[#233144] hover:border-[#00d2be]/50 hover:bg-[#00d2be]/5 text-[#8e9fb5] hover:text-[#00d2be] text-xs font-medium transition-all cursor-pointer"
          >
            <Waves size={14} />
            <span>+ Add Sump or Refugium Filtration</span>
          </button>
        </div>
      )}
          </div>
        </div>

        {/* Right Dock: Coral, Fish & Diagnostic Buttons - Static Position Anchored to the Right Side */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch justify-end gap-2.5 sm:gap-3 w-full sm:w-auto lg:w-36 xl:w-40 shrink-0 lg:mt-0">
          {/* Button 1: Coral Vault (Saltwater) or Flora & Plant Vault (Freshwater) */}
          <div
            onClick={onOpenCorals}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onOpenCorals();
              }
            }}
            className={`group/vault relative p-2.5 xl:p-3 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-xl select-none shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-[0.99] flex flex-col justify-between flex-1 sm:flex-none ${
              isFreshwater
                ? "bg-[#0b131a]/85 hover:bg-[#0f1c24]/95 border-emerald-500/20 hover:border-emerald-500/70 hover:shadow-[0_8px_20px_rgba(16,185,129,0.2)]"
                : "bg-[#0c1422]/85 hover:bg-[#101b2e]/95 border-[#00d2be]/20 hover:border-[#00d2be]/70 hover:shadow-[0_8px_20px_rgba(0,210,190,0.2)]"
            }`}
            title={`Click to open ${isFreshwater ? "Flora & Plant Vault" : "Coral Vault"}`}
          >
            {/* Ambient Corner Glow */}
            <div
              className={`absolute -top-8 -right-8 w-20 h-20 rounded-full blur-xl pointer-events-none transition-all duration-500 ${
                isFreshwater
                  ? "bg-emerald-500/10 group-hover/vault:bg-emerald-500/25"
                  : "bg-[#00d2be]/10 group-hover/vault:bg-[#00d2be]/25"
              }`}
            />

            <div>
              {/* Header: Icon + Live Count Badge */}
              <div className="flex items-center justify-between gap-1.5 mb-1.5">
                <div
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center border transition-all duration-300 group-hover/vault:scale-105 shadow-sm ${
                    isFreshwater
                      ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 group-hover/vault:shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                      : "bg-[#00d2be]/15 border-[#00d2be]/40 text-[#00d2be] group-hover/vault:shadow-[0_0_10px_rgba(0,210,190,0.4)]"
                  }`}
                >
                  {isFreshwater ? <Sprout size={13} /> : <Sparkles size={13} />}
                </div>

                <span
                  className={`px-1.5 py-0.2 rounded-full text-[8.5px] font-mono font-bold border flex items-center gap-1 shrink-0 ${
                    isFreshwater
                      ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400"
                      : "bg-[#00d2be]/10 border-[#00d2be]/30 text-[#00d2be]"
                  }`}
                >
                  <span
                    className={`w-1 h-1 rounded-full animate-pulse ${
                      isFreshwater ? "bg-emerald-400" : "bg-[#00d2be]"
                    }`}
                  />
                  <span>
                    {coralCount} {isFreshwater ? (coralCount === 1 ? "Plant" : "Plants") : (coralCount === 1 ? "Coral" : "Corals")}
                  </span>
                </span>
              </div>

              {/* Title & Description */}
              <div className="flex items-center justify-between">
                <h4
                  className={`text-[11px] xl:text-xs font-bold text-[#f0f4f8] transition-colors truncate ${
                    isFreshwater
                      ? "group-hover/vault:text-emerald-400"
                      : "group-hover/vault:text-[#00d2be]"
                  }`}
                >
                  {isFreshwater ? "Flora & Plants" : "Coral Vault"}
                </h4>
                <ChevronRight
                  size={12}
                  className={`text-[#8e9fb5]/50 transition-all duration-200 group-hover/vault:translate-x-0.5 shrink-0 ${
                    isFreshwater
                      ? "group-hover/vault:text-emerald-400"
                      : "group-hover/vault:text-[#00d2be]"
                  }`}
                />
              </div>
              <p className="text-[9px] text-[#8e9fb5] mt-0.5 line-clamp-1">
                {isFreshwater
                  ? "Aquatic plants & moss"
                  : "SPS, LPS, soft corals"}
              </p>
            </div>

            {/* Micro Quick-Action Footer */}
            <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between text-[8.5px]">
              <span
                className={`font-semibold transition-colors flex items-center gap-0.5 ${
                  isFreshwater
                    ? "text-emerald-400/90 group-hover/vault:text-emerald-300"
                    : "text-[#00d2be]/90 group-hover/vault:text-[#14ebd7]"
                }`}
              >
                <span>Browse</span>
                <span className="text-[10px] leading-none">→</span>
              </span>
              <span className="text-[7.5px] font-mono text-white/30 uppercase tracking-wider">
                Vault 01
              </span>
            </div>
          </div>

          {/* Button 2: Fish Vault (Saltwater) or Fish & Invert Vault (Freshwater) */}
          <div
            onClick={onOpenFish}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onOpenFish();
              }
            }}
            className={`group/vault relative p-2.5 xl:p-3 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-xl select-none shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-[0.99] flex flex-col justify-between flex-1 sm:flex-none ${
              isFreshwater
                ? "bg-[#0c1420]/85 hover:bg-[#101b2a]/95 border-cyan-500/20 hover:border-cyan-500/70 hover:shadow-[0_8px_20px_rgba(6,182,212,0.2)]"
                : "bg-[#18111a]/85 hover:bg-[#201422]/95 border-[#ff6b35]/20 hover:border-[#ff6b35]/70 hover:shadow-[0_8px_20px_rgba(255,107,53,0.2)]"
            }`}
            title={`Click to open ${isFreshwater ? "Fish & Invert Vault" : "Fish Vault"}`}
          >
            {/* Ambient Corner Glow */}
            <div
              className={`absolute -top-8 -right-8 w-20 h-20 rounded-full blur-xl pointer-events-none transition-all duration-500 ${
                isFreshwater
                  ? "bg-cyan-500/10 group-hover/vault:bg-cyan-500/25"
                  : "bg-[#ff6b35]/10 group-hover/vault:bg-[#ff6b35]/25"
              }`}
            />

            <div>
              {/* Header: Icon + Live Count Badge */}
              <div className="flex items-center justify-between gap-1.5 mb-1.5">
                <div
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center border transition-all duration-300 group-hover/vault:scale-105 shadow-sm ${
                    isFreshwater
                      ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-400 group-hover/vault:shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                      : "bg-[#ff6b35]/15 border-[#ff6b35]/40 text-[#ff6b35] group-hover/vault:shadow-[0_0_10px_rgba(255,107,53,0.4)]"
                  }`}
                >
                  <Fish size={13} />
                </div>

                <span
                  className={`px-1.5 py-0.2 rounded-full text-[8.5px] font-mono font-bold border flex items-center gap-1 shrink-0 ${
                    isFreshwater
                      ? "bg-cyan-950/40 border-cyan-500/30 text-cyan-400"
                      : "bg-[#ff6b35]/10 border-[#ff6b35]/30 text-[#ff6b35]"
                  }`}
                >
                  <span
                    className={`w-1 h-1 rounded-full animate-pulse ${
                      isFreshwater ? "bg-cyan-400" : "bg-[#ff6b35]"
                    }`}
                  />
                  <span>
                    {fishCount} {isFreshwater ? (fishCount === 1 ? "Swimmer" : "Swimmers") : (fishCount === 1 ? "Livestock" : "Livestock")}
                  </span>
                </span>
              </div>

              {/* Title & Description */}
              <div className="flex items-center justify-between">
                <h4
                  className={`text-[11px] xl:text-xs font-bold text-[#f0f4f8] transition-colors truncate ${
                    isFreshwater
                      ? "group-hover/vault:text-cyan-400"
                      : "group-hover/vault:text-[#ff6b35]"
                  }`}
                >
                  {isFreshwater ? "Fish & Inverts" : "Fish Vault"}
                </h4>
                <ChevronRight
                  size={12}
                  className={`text-[#8e9fb5]/50 transition-all duration-200 group-hover/vault:translate-x-0.5 shrink-0 ${
                    isFreshwater
                      ? "group-hover/vault:text-cyan-400"
                      : "group-hover/vault:text-[#ff6b35]"
                  }`}
                />
              </div>
              <p className="text-[9px] text-[#8e9fb5] mt-0.5 line-clamp-1">
                {isFreshwater
                  ? "Community fish, shrimp & snails"
                  : "Fish, inverts & cleaners"}
              </p>
            </div>

            {/* Micro Quick-Action Footer */}
            <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between text-[8.5px]">
              <span
                className={`font-semibold transition-colors flex items-center gap-0.5 ${
                  isFreshwater
                    ? "text-cyan-400/90 group-hover/vault:text-cyan-300"
                    : "text-[#ff6b35]/90 group-hover/vault:text-[#ff8a5c]"
                }`}
              >
                <span>Browse</span>
                <span className="text-[10px] leading-none">→</span>
              </span>
              <span className="text-[7.5px] font-mono text-white/30 uppercase tracking-wider">
                Vault 02
              </span>
            </div>
          </div>

          {/* Button 3: Hitchhiker & Disease ID */}
          {onOpenHealthDiagnostics && (
            <div
              onClick={onOpenHealthDiagnostics}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onOpenHealthDiagnostics();
                }
              }}
              className="group/vault relative p-2.5 xl:p-3 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-xl select-none shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-[0.99] flex flex-col justify-between flex-1 sm:flex-none bg-[#180f15]/85 hover:bg-[#22141e]/95 border-rose-500/20 hover:border-rose-500/70 hover:shadow-[0_8px_20px_rgba(244,63,94,0.2)]"
              title="Click to open Hitchhiker & Disease Diagnostic Suite"
            >
              {/* Ambient Corner Glow */}
              <div
                className="absolute -top-8 -right-8 w-20 h-20 rounded-full blur-xl pointer-events-none transition-all duration-500 bg-rose-500/10 group-hover/vault:bg-rose-500/25"
              />

              <div>
                {/* Header: Icon + Live Diagnostic Badge */}
                <div className="flex items-center justify-between gap-1.5 mb-1.5">
                  <div
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center border transition-all duration-300 group-hover/vault:scale-105 shadow-sm bg-rose-500/15 border-rose-500/40 text-rose-400 group-hover/vault:shadow-[0_0_10px_rgba(244,63,94,0.4)]"
                  >
                    <Activity size={13} />
                  </div>

                  <span
                    className="px-1.5 py-0.2 rounded-full text-[8.5px] font-mono font-bold border flex items-center gap-1 shrink-0 bg-rose-950/40 border-rose-500/30 text-rose-400"
                  >
                    <span className="w-1 h-1 rounded-full animate-pulse bg-rose-400" />
                    <span>AI & Local</span>
                  </span>
                </div>

                {/* Title & Description */}
                <div className="flex items-center justify-between">
                  <h4
                    className="text-[11px] xl:text-xs font-bold text-[#f0f4f8] transition-colors truncate group-hover/vault:text-rose-400"
                  >
                    Hitchhiker & Disease
                  </h4>
                  <ChevronRight
                    size={12}
                    className="text-[#8e9fb5]/50 transition-all duration-200 group-hover/vault:translate-x-0.5 shrink-0 group-hover/vault:text-rose-400"
                  />
                </div>
                <p className="text-[9px] text-[#8e9fb5] mt-0.5 line-clamp-1">
                  Pests, illnesses & symptoms
                </p>
              </div>

              {/* Micro Quick-Action Footer */}
              <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between text-[8.5px]">
                <span
                  className="font-semibold transition-colors flex items-center gap-0.5 text-rose-400/90 group-hover/vault:text-rose-300"
                >
                  <span>Diagnose</span>
                  <span className="text-[10px] leading-none">→</span>
                </span>
                <span className="text-[7.5px] font-mono text-white/30 uppercase tracking-wider">
                  Suite 03
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* EDIT TANK SPECIFICATIONS MODAL */}
      {/* ========================================================= */}
      {mounted && isEditSpecsOpen && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setIsEditSpecsOpen(false)}
        >
          <div 
            className="bg-[#141b27] border border-[#28364a] rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#28364a] pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#00d2be]/15 border border-[#00d2be]/30 flex items-center justify-center text-[#00d2be]">
                  <Sliders size={16} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#f0f4f8]">
                    Edit Aquarium Specifications
                  </h3>
                  <p className="text-[11px] text-[#8e9fb5]">
                    {tank.name} • {isFreshwater ? "Freshwater Planted" : "Saltwater Reef"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditSpecsOpen(false)}
                className="p-1 rounded-lg text-[#8e9fb5] hover:text-[#f0f4f8] hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSpecs} className="space-y-4">
              {/* Row 1: Tank Name */}
              <div>
                <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                  Aquarium Name *
                </label>
                <input
                  type="text"
                  value={specForm.name}
                  onChange={(e) => setSpecForm({ ...specForm, name: e.target.value })}
                  className="w-full bg-[#0d131d] border border-[#28364a] rounded-lg px-3 py-2 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                  required
                />
              </div>

              {/* Form Factor / Sizing Profile */}
              <div>
                <label className="block text-xs font-semibold text-[#8e9fb5] mb-1.5 flex items-center justify-between">
                  <span>Tank Size & Visual Proportions</span>
                  <span className="text-[10px] text-[#00d2be] font-medium">Distinct Visual 3D Scapes</span>
                </label>
                <div className={`grid gap-2 ${specForm.aquascapeStyle === "lagoon" ? "grid-cols-2" : "grid-cols-3"}`}>
                  {specForm.aquascapeStyle !== "lagoon" && (
                    <button
                      type="button"
                      onClick={() => setSpecForm({ ...specForm, formFactor: "nano_cube" })}
                      className={`py-2 px-2.5 rounded-lg border text-left text-[11px] transition-all cursor-pointer ${
                        specForm.formFactor === "nano_cube"
                          ? "bg-[#00d2be]/15 border-[#00d2be] text-[#00d2be] font-bold ring-1 ring-[#00d2be]"
                          : "bg-[#0d131d] border-[#28364a] text-[#8e9fb5] hover:text-[#f0f4f8]"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>🧊</span>
                        <span className="font-semibold">Nano Cube</span>
                      </div>
                      <p className="text-[9px] text-[#8e9fb5] mt-0.5 opacity-80">1:1 Square (~30–40L)</p>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setSpecForm({ ...specForm, formFactor: "standard" })}
                    className={`py-2 px-2.5 rounded-lg border text-left text-[11px] transition-all cursor-pointer ${
                      specForm.formFactor === "standard" || specForm.formFactor === "nano_rectangular"
                        ? "bg-[#00d2be]/15 border-[#00d2be] text-[#00d2be] font-bold ring-1 ring-[#00d2be]"
                        : "bg-[#0d131d] border-[#28364a] text-[#8e9fb5] hover:text-[#f0f4f8]"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>📐</span>
                      <span className="font-semibold">Rectangular</span>
                    </div>
                    <p className="text-[9px] text-[#8e9fb5] mt-0.5 opacity-80">Standard Rimless (~60–120L)</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSpecForm({ ...specForm, formFactor: "panoramic" })}
                    className={`py-2 px-2.5 rounded-lg border text-left text-[11px] transition-all cursor-pointer ${
                      specForm.formFactor === "panoramic"
                        ? "bg-[#00d2be]/15 border-[#00d2be] text-[#00d2be] font-bold ring-1 ring-[#00d2be]"
                        : "bg-[#0d131d] border-[#28364a] text-[#8e9fb5] hover:text-[#f0f4f8]"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>🌅</span>
                      <span className="font-semibold">Wide Peninsula</span>
                    </div>
                    <p className="text-[9px] text-[#8e9fb5] mt-0.5 opacity-80">Panoramic Display (~180–300L)</p>
                  </button>
                </div>
              </div>

              {/* Sump Filtration & Water Volumes Section */}
              <div className="bg-[#0b1018] border border-[#233144] rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🌊</span>
                    <div>
                      <span className="text-xs font-bold text-[#f0f4f8] block">
                        Sump Filtration System
                      </span>
                      <span className="text-[10px] text-[#8e9fb5]">
                        Does this aquarium use an external sump or rear chamber?
                      </span>
                    </div>
                  </div>

                  {/* Sump Toggle Switch */}
                  <div className="flex items-center gap-1.5 bg-[#070b12] p-1 rounded-lg border border-[#233144]">
                    <button
                      type="button"
                      onClick={() => setSpecForm({ ...specForm, hasSump: false })}
                      className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                        !specForm.hasSump
                          ? "bg-white/10 text-[#f0f4f8] shadow-sm"
                          : "text-[#8e9fb5] hover:text-[#f0f4f8]"
                      }`}
                    >
                      No Sump
                    </button>
                    <button
                      type="button"
                      onClick={() => setSpecForm({ ...specForm, hasSump: true })}
                      className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                        specForm.hasSump
                          ? "bg-[#00d2be] text-[#080d14] shadow-sm"
                          : "text-[#8e9fb5] hover:text-[#00d2be]"
                      }`}
                    >
                      Has Sump
                    </button>
                  </div>
                </div>

                {/* Dynamic Volume Inputs */}
                {specForm.hasSump ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-[#1e2a3a]">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#8e9fb5] mb-1">
                        Display Tank Volume ({unitSystem === "imperial" ? "Gal" : "L"}) *
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="1"
                        value={specForm.displayVolume}
                        onChange={(e) => setSpecForm({ ...specForm, displayVolume: e.target.value })}
                        className="w-full bg-[#0d131d] border border-[#28364a] rounded-lg px-3 py-1.5 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                        required
                      />
                      <span className="text-[9px] text-[#8e9fb5] mt-0.5 block">
                        Visual vessel dimensions
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
                        value={specForm.sumpVolume}
                        onChange={(e) => setSpecForm({ ...specForm, sumpVolume: e.target.value })}
                        className="w-full bg-[#0d131d] border border-[#00d2be]/50 focus:border-[#00d2be] rounded-lg px-3 py-1.5 text-xs text-[#f0f4f8] outline-none"
                        required
                      />
                      <span className="text-[9px] text-[#8e9fb5] mt-0.5 block">
                        Operating sump water
                      </span>
                    </div>

                    <div className="bg-[#0e1622] border border-[#00d2be]/40 rounded-lg p-2.5 flex flex-col justify-center">
                      <span className="text-[10px] font-bold text-[#8e9fb5] uppercase tracking-wider block">
                        Total Water Volume
                      </span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-base font-extrabold text-[#00d2be]">
                          {((parseFloat(specForm.displayVolume) || 0) + (parseFloat(specForm.sumpVolume) || 0)).toFixed(1)}
                        </span>
                        <span className="text-xs text-[#8e9fb5] font-semibold">
                          {unitSystem === "imperial" ? "Gallons" : "Liters"}
                        </span>
                      </div>
                      <span className="text-[9px] text-emerald-400 mt-0.5 block font-medium">
                        ✓ Used for dosing & calculators
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-[#1e2a3a]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#8e9fb5] mb-1">
                          Display & Total Volume ({unitSystem === "imperial" ? "Gallons" : "Liters"}) *
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          min="1"
                          value={specForm.displayVolume}
                          onChange={(e) => setSpecForm({ ...specForm, displayVolume: e.target.value })}
                          className="w-full bg-[#0d131d] border border-[#28364a] rounded-lg px-3 py-1.5 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                          required
                        />
                      </div>
                      <div className="flex items-center text-[10px] text-[#8e9fb5] leading-relaxed pt-2">
                        Total volume equals display volume because no external sump is connected. Visual vessel fits the amount of litres.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Row 2: Purpose & Setup Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                    Aquarium Purpose / Biotope
                  </label>
                  <input
                    type="text"
                    value={specForm.purpose}
                    onChange={(e) => setSpecForm({ ...specForm, purpose: e.target.value })}
                    placeholder="e.g. Mixed Reef, High-Tech Planted, Iwagumi"
                    className="w-full bg-[#0d131d] border border-[#28364a] rounded-lg px-3 py-2 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                    Setup / Inception Date
                  </label>
                  <input
                    type="date"
                    value={specForm.setupDate}
                    onChange={(e) => setSpecForm({ ...specForm, setupDate: e.target.value })}
                    className="w-full bg-[#0d131d] border border-[#28364a] rounded-lg px-3 py-2 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                  />
                </div>
              </div>

              {/* Visual 3D Aquascape Style Presets */}
              <div>
                <label className="block text-xs font-semibold text-[#8e9fb5] mb-1.5 flex items-center justify-between">
                  <span>Aquarium Style Preset</span>
                  <span className="text-[10px] text-[#00d2be] font-medium">Updates 3D Viewport Theme</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {isFreshwater ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setSpecForm({ ...specForm, aquascapeStyle: "nature" })}
                        className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                          specForm.aquascapeStyle === "nature"
                            ? "bg-emerald-500/15 border-emerald-400 text-emerald-400 font-bold ring-1 ring-emerald-400"
                            : "bg-[#0d131d] border-[#28364a] text-[#8e9fb5] hover:text-[#f0f4f8]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">🪵</span>
                            <span className="font-bold text-[#f0f4f8]">Nature Driftwood</span>
                          </div>
                          {specForm.aquascapeStyle === "nature" && (
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          )}
                        </div>
                        <p className="text-[10px] text-[#8e9fb5] font-normal leading-tight">Spiderwood, river driftwood &amp; epiphytes</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSpecForm({ ...specForm, aquascapeStyle: "iwagumi" })}
                        className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                          specForm.aquascapeStyle === "iwagumi"
                            ? "bg-emerald-500/15 border-emerald-400 text-emerald-400 font-bold ring-1 ring-emerald-400"
                            : "bg-[#0d131d] border-[#28364a] text-[#8e9fb5] hover:text-[#f0f4f8]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">⛰️</span>
                            <span className="font-bold text-[#f0f4f8]">Iwagumi Stones</span>
                          </div>
                          {specForm.aquascapeStyle === "iwagumi" && (
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          )}
                        </div>
                        <p className="text-[10px] text-[#8e9fb5] font-normal leading-tight">Dragon stones &amp; Monte Carlo carpet</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSpecForm({ ...specForm, aquascapeStyle: "zen" })}
                        className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                          specForm.aquascapeStyle === "zen"
                            ? "bg-emerald-500/15 border-emerald-400 text-emerald-400 font-bold ring-1 ring-emerald-400"
                            : "bg-[#0d131d] border-[#28364a] text-[#8e9fb5] hover:text-[#f0f4f8]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">🌳</span>
                            <span className="font-bold text-[#f0f4f8]">Zen Bonsai Tree</span>
                          </div>
                          {specForm.aquascapeStyle === "zen" && (
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          )}
                        </div>
                        <p className="text-[10px] text-[#8e9fb5] font-normal leading-tight">Sculpted bonsai moss tree centerpiece</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSpecForm({ ...specForm, aquascapeStyle: "emerald" })}
                        className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                          specForm.aquascapeStyle === "emerald"
                            ? "bg-emerald-500/15 border-emerald-400 text-emerald-400 font-bold ring-1 ring-emerald-400"
                            : "bg-[#0d131d] border-[#28364a] text-[#8e9fb5] hover:text-[#f0f4f8]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">🌿</span>
                            <span className="font-bold text-[#f0f4f8]">Stem Garden</span>
                          </div>
                          {specForm.aquascapeStyle === "emerald" && (
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          )}
                        </div>
                        <p className="text-[10px] text-[#8e9fb5] font-normal leading-tight">Dutch planted high-tech vibrant stems</p>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setSpecForm({ ...specForm, aquascapeStyle: "mixed" })}
                        className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                          specForm.aquascapeStyle === "mixed"
                            ? "bg-[#00d2be]/15 border-[#00d2be] text-[#00d2be] font-bold ring-1 ring-[#00d2be]"
                            : "bg-[#0d131d] border-[#28364a] text-[#8e9fb5] hover:text-[#f0f4f8]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">🪸</span>
                            <span className="font-bold text-[#f0f4f8]">Mixed Reef</span>
                          </div>
                          {specForm.aquascapeStyle === "mixed" && (
                            <span className="w-2 h-2 rounded-full bg-[#00d2be]" />
                          )}
                        </div>
                        <p className="text-[10px] text-[#8e9fb5] font-normal leading-tight">Frogspawn, Montipora plates & softies</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const newFactor = specForm.formFactor === "nano_cube" ? "standard" : specForm.formFactor;
                          setSpecForm({ ...specForm, aquascapeStyle: "lagoon", formFactor: newFactor });
                        }}
                        className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                          specForm.aquascapeStyle === "lagoon"
                            ? "bg-[#00d2be]/15 border-[#00d2be] text-[#00d2be] font-bold ring-1 ring-[#00d2be]"
                            : "bg-[#0d131d] border-[#28364a] text-[#8e9fb5] hover:text-[#f0f4f8]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">🏝️</span>
                            <span className="font-bold text-[#f0f4f8]">Lagoon Reef</span>
                          </div>
                          {specForm.aquascapeStyle === "lagoon" && (
                            <span className="w-2 h-2 rounded-full bg-[#00d2be]" />
                          )}
                        </div>
                        <p className="text-[10px] text-[#8e9fb5] font-normal leading-tight">Shallow turquoise reef with corals & clean sandbed</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSpecForm({ ...specForm, aquascapeStyle: "sps" })}
                        className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                          specForm.aquascapeStyle === "sps"
                            ? "bg-[#00d2be]/15 border-[#00d2be] text-[#00d2be] font-bold ring-1 ring-[#00d2be]"
                            : "bg-[#0d131d] border-[#28364a] text-[#8e9fb5] hover:text-[#f0f4f8]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">🔮</span>
                            <span className="font-bold text-[#f0f4f8]">Actinic SPS</span>
                          </div>
                          {specForm.aquascapeStyle === "sps" && (
                            <span className="w-2 h-2 rounded-full bg-[#00d2be]" />
                          )}
                        </div>
                        <p className="text-[10px] text-[#8e9fb5] font-normal leading-tight">Deep actinic violet & Acropora pinnacles</p>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Hardware Stack & Lighting */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                    Equipment & Hardware Stack
                  </label>
                  <textarea
                    rows={2}
                    value={specForm.equipment}
                    onChange={(e) => setSpecForm({ ...specForm, equipment: e.target.value })}
                    placeholder="Filtration, heaters, pumps, skimmer..."
                    className="w-full bg-[#0d131d] border border-[#28364a] rounded-lg px-3 py-2 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                    Lighting & Photoperiod Schedule
                  </label>
                  <textarea
                    rows={2}
                    value={specForm.lighting}
                    onChange={(e) => setSpecForm({ ...specForm, lighting: e.target.value })}
                    placeholder="Spectrum, peak hours, ramp schedules..."
                    className="w-full bg-[#0d131d] border border-[#28364a] rounded-lg px-3 py-2 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                  />
                </div>
              </div>

              {/* Target Chemistry Parameters */}
              <div className="border-t border-[#28364a] pt-3">
                <span className="text-xs font-semibold text-[#8e9fb5] block mb-2">
                  Target Water Chemistry Ranges
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] text-[#8e9fb5] mb-0.5">Temp Target (°C)</label>
                    <input
                      type="text"
                      value={specForm.tempTarget}
                      onChange={(e) => setSpecForm({ ...specForm, tempTarget: e.target.value })}
                      className="w-full bg-[#0d131d] border border-[#28364a] rounded px-2.5 py-1 text-xs text-[#f0f4f8] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#8e9fb5] mb-0.5">pH Target</label>
                    <input
                      type="text"
                      value={specForm.phTarget}
                      onChange={(e) => setSpecForm({ ...specForm, phTarget: e.target.value })}
                      className="w-full bg-[#0d131d] border border-[#28364a] rounded px-2.5 py-1 text-xs text-[#f0f4f8] outline-none"
                    />
                  </div>
                  {isFreshwater ? (
                    <>
                      <div>
                        <label className="block text-[10px] text-[#8e9fb5] mb-0.5">TDS Target</label>
                        <input
                          type="text"
                          value={specForm.tdsTarget}
                          onChange={(e) => setSpecForm({ ...specForm, tdsTarget: e.target.value })}
                          className="w-full bg-[#0d131d] border border-[#28364a] rounded px-2.5 py-1 text-xs text-[#f0f4f8] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-[#8e9fb5] mb-0.5">GH Target</label>
                        <input
                          type="text"
                          value={specForm.ghTarget}
                          onChange={(e) => setSpecForm({ ...specForm, ghTarget: e.target.value })}
                          className="w-full bg-[#0d131d] border border-[#28364a] rounded px-2.5 py-1 text-xs text-[#f0f4f8] outline-none"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-[10px] text-[#8e9fb5] mb-0.5">Salinity Target</label>
                        <input
                          type="text"
                          value={specForm.salinityTarget}
                          onChange={(e) => setSpecForm({ ...specForm, salinityTarget: e.target.value })}
                          className="w-full bg-[#0d131d] border border-[#28364a] rounded px-2.5 py-1 text-xs text-[#f0f4f8] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-[#8e9fb5] mb-0.5">dKH Target</label>
                        <input
                          type="text"
                          value={specForm.dkhTarget}
                          onChange={(e) => setSpecForm({ ...specForm, dkhTarget: e.target.value })}
                          className="w-full bg-[#0d131d] border border-[#28364a] rounded px-2.5 py-1 text-xs text-[#f0f4f8] outline-none"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Actions (Responsive for Mobile Screens) */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#28364a]">
                {onDeleteTank && allTanks.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditSpecsOpen(false);
                      onDeleteTank(tank.id, tank.name);
                    }}
                    className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                    title={`Delete "${tank.name}" Profile`}
                  >
                    <Trash2 size={13} className="shrink-0" />
                    <span className="sm:hidden">Delete</span>
                    <span className="hidden sm:inline">Delete Tank Profile</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsEditSpecsOpen(false)}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold rounded-xl bg-[#0f1520] hover:bg-[#182335] text-[#8e9fb5] hover:text-[#f0f4f8] border border-[#28364a] transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingSpecs}
                    className="px-3.5 sm:px-5 py-1.5 sm:py-2 text-xs font-bold rounded-xl bg-[#00d2be] text-[#0d121a] hover:bg-[#14ebd7] flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-md"
                  >
                    {isSavingSpecs ? <Loader2 size={13} className="animate-spin shrink-0" /> : <Check size={13} className="shrink-0" />}
                    <span>{isSavingSpecs ? "Saving..." : "Save Specs"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Sump & Refugium Configuration Modal */}
      <SumpConfigModal
        isOpen={isSumpModalOpen}
        onClose={() => setIsSumpModalOpen(false)}
        tank={tank}
        unitSystem={unitSystem}
        onUpdateTank={onUpdateTank}
      />

      {/* Virtual Tank Inhabitants Modal */}
      <VirtualTankInhabitantsModal
        isOpen={isFaunaModalOpen}
        onClose={() => setIsFaunaModalOpen(false)}
        tankId={tank.id}
        formFactor={tank.formFactor || "standard"}
        allLivestock={tank.livestock || []}
        activeIds={activeFaunaIds}
        onToggleInhabitant={(id) => {
          toggleLivestockInVirtualTank(tank.id, id);
        }}
        onDeleteInhabitant={async (id) => {
          removeLivestockFromVirtualTank(tank.id, id);
          if (onDeleteLivestock) {
            await onDeleteLivestock(id);
          } else {
            await fetch(`/api/livestock/${id}`, { method: "DELETE" });
          }
        }}
        onOpenVault={onOpenFish}
      />
    </div>
  );
}
