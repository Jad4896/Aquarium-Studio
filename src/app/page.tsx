"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Tank,
  WaterParameter,
  Livestock,
  MaintenanceTask,
  StickyNote,
  SaltFormula,
  TimelineEvent,
  UnitSystem,
  SalinityUnit,
  ThemeColors,
} from "@/types";
import { formatVolume, formatTemp, formatSalinity } from "@/lib/units";
import StickyBanner from "@/components/StickyBanner";
import InteractiveAquariumModel from "@/components/InteractiveAquariumModel";
import SpatialUtilityWidgets from "@/components/SpatialUtilityWidgets";
import TankProfileView from "@/components/TankProfileView";
import WaterParametersView from "@/components/WaterParametersView";
import ParameterChartsView from "@/components/ParameterChartsView";
import CoralVaultView from "@/components/CoralVaultView";
import FishVaultView from "@/components/FishVaultView";
import MaintenanceTasksView from "@/components/MaintenanceTasksView";
import CalculatorsView from "@/components/CalculatorsView";
import PrintableSitterSheetView from "@/components/PrintableSitterSheetView";
import StickyNotesView from "@/components/StickyNotesView";
import StockingTimelineView from "@/components/StockingTimelineView";
import ThemeCustomizerModal, {
  THEME_PRESETS,
  applyThemeToDom,
} from "@/components/ThemeCustomizerModal";
import NewTankModal from "@/components/NewTankModal";
import AiSettingsModal from "@/components/AiSettingsModal";
import PhoneConnectModal from "@/components/PhoneConnectModal";
import PrivacyFaqModal from "@/components/PrivacyFaqModal";
import HealthDiagnosticsModal from "@/components/HealthDiagnosticsModal";
import {
  Waves,
  Droplet,
  LineChart,
  Sparkles,
  Fish,
  Clock,
  Calculator,
  Printer,
  StickyNote as StickyIcon,
  RefreshCw,
  Plus,
  Palette,
  ChevronDown,
  History,
  Trash2,
  Check,
  PlusCircle,
  Key,
  Sprout,
  Compass,
  ArrowLeft,
  X,
  Maximize2,
  Minimize2,
  Thermometer,
  Layers,
  Smartphone,
  ShieldCheck,
  Type,
  Activity,
} from "lucide-react";

export type TabId =
  | "deck"
  | "profile"
  | "params"
  | "charts"
  | "corals"
  | "fish"
  | "timeline"
  | "tasks"
  | "calc"
  | "sitter"
  | "notes";

export default function SinglePageAquariumDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("deck");
  const [isTankFocused, setIsTankFocused] = useState(false);
  const [tank, setTank] = useState<Tank | null>(null);
  const [allTanks, setAllTanks] = useState<Tank[]>([]);
  const [activeTankId, setActiveTankId] = useState<string | null>(null);
  const [saltFormulas, setSaltFormulas] = useState<SaltFormula[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals & Dropdowns
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isNewTankOpen, setIsNewTankOpen] = useState(false);
  const [isAiSettingsOpen, setIsAiSettingsOpen] = useState(false);
  const [isPhoneConnectOpen, setIsPhoneConnectOpen] = useState(false);
  const [isPrivacyFaqOpen, setIsPrivacyFaqOpen] = useState(false);
  const [isHealthDiagnosticsOpen, setIsHealthDiagnosticsOpen] = useState(false);
  const [isFaunaModalOpen, setIsFaunaModalOpen] = useState(false);
  const [isEditSpecsOpen, setIsEditSpecsOpen] = useState(false);
  const [isSumpModalOpen, setIsSumpModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isTankDropdownOpen, setIsTankDropdownOpen] = useState(false);
  const tankDropdownRef = useRef<HTMLDivElement>(null);

  // Global Unit System, Accessible Font Scale & Theme
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");
  const [salinityUnit, setSalinityUnit] = useState<SalinityUnit>("sg");
  const [fontSizeLevel, setFontSizeLevel] = useState<"normal" | "large" | "xlarge">("normal");
  const [currentTheme, setCurrentTheme] = useState<ThemeColors>(
    THEME_PRESETS.space.colors
  );

  // Initialize and persist accessible font scaling
  useEffect(() => {
    try {
      const saved = localStorage.getItem("reef_studio_font_scale") as "normal" | "large" | "xlarge" | null;
      if (saved && (saved === "normal" || saved === "large" || saved === "xlarge")) {
        setFontSizeLevel(saved);
        document.documentElement.setAttribute("data-font-scale", saved);
      } else {
        document.documentElement.setAttribute("data-font-scale", "normal");
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleCycleFontSize = () => {
    setFontSizeLevel((prev) => {
      const next = prev === "normal" ? "large" : prev === "large" ? "xlarge" : "normal";
      try {
        localStorage.setItem("reef_studio_font_scale", next);
      } catch (e) {
        console.error(e);
      }
      document.documentElement.setAttribute("data-font-scale", next);
      return next;
    });
  };

  // Close tank dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        tankDropdownRef.current &&
        !tankDropdownRef.current.contains(event.target as Node)
      ) {
        setIsTankDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut: Esc to close any open tab and return to spatial view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeTab !== "deck") {
        setActiveTab("deck");
        setIsTankFocused(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab]);

  // Fetch all tanks
  const fetchTanksList = async () => {
    try {
      const res = await fetch("/api/tanks");
      if (!res.ok) throw new Error("Failed to load tanks list");
      const data = await res.json();
      setAllTanks(data.tanks || []);
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch specific tank data
  const fetchTankData = async (id?: string) => {
    try {
      const url = id ? `/api/tank?id=${id}` : "/api/tank";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load tank data");
      const data = await res.json();
      setTank(data.tank);
      setActiveTankId(data.tank.id);
      setSaltFormulas(data.saltFormulas || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load: restore settings from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUnit = localStorage.getItem("reef_unit_system") as UnitSystem | null;
      if (savedUnit === "metric" || savedUnit === "imperial") {
        setUnitSystem(savedUnit);
      }

      const savedSal = localStorage.getItem("reef_salinity_unit") as SalinityUnit | null;
      if (savedSal === "sg" || savedSal === "ppt") {
        setSalinityUnit(savedSal);
      }

      const savedTheme = localStorage.getItem("reef_studio_theme");
      if (savedTheme) {
        try {
          const parsed = JSON.parse(savedTheme);
          setCurrentTheme(parsed);
          applyThemeToDom(parsed);
        } catch (e) {
          console.error("Failed to parse saved theme", e);
        }
      }

      const savedTankId = localStorage.getItem("reef_active_tank_id");
      if (savedTankId) {
        setActiveTankId(savedTankId);
        fetchTankData(savedTankId);
      } else {
        fetchTankData();
      }
    } else {
      fetchTankData();
    }
    fetchTanksList();
  }, []);

  // Tank Carousel Navigation & Dynamic Data Binding
  const currentTankIndex = allTanks.findIndex((t) => t.id === tank?.id);

  const handleSelectTank = async (id: string) => {
    if (id === tank?.id) return;
    setActiveTankId(id);
    setIsTankDropdownOpen(false);
    setRefreshing(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("reef_active_tank_id", id);
    }
    await fetchTankData(id);
  };

  const handleNextTank = () => {
    if (allTanks.length <= 1) return;
    const nextIndex = (currentTankIndex + 1) % allTanks.length;
    handleSelectTank(allTanks[nextIndex].id);
  };

  const handlePrevTank = () => {
    if (allTanks.length <= 1) return;
    const prevIndex = (currentTankIndex - 1 + allTanks.length) % allTanks.length;
    handleSelectTank(allTanks[prevIndex].id);
  };

  // Tank creation
  const handleCreateTank = async (data: any) => {
    try {
      const res = await fetch("/api/tanks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const result = await res.json();
        await fetchTanksList();
        await handleSelectTank(result.tank.id);
      }
    } catch (err) {
      console.error("Failed to create tank:", err);
    }
  };

  // Tank deletion
  const handleDeleteTank = async (id: string, tankName: string) => {
    if (allTanks.length <= 1) {
      alert("Cannot delete the only remaining aquarium.");
      return;
    }
    if (
      !confirm(
        `Are you sure you want to permanently delete '${tankName}' and all associated test parameters, livestock, timeline, and tasks?`
      )
    ) {
      return;
    }
    try {
      const res = await fetch(`/api/tanks/${id}`, { method: "DELETE" });
      if (res.ok) {
        const remaining = allTanks.filter((t) => t.id !== id);
        setAllTanks(remaining);
        if (tank?.id === id && remaining.length > 0) {
          await handleSelectTank(remaining[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to delete tank:", err);
    }
  };

  // Unit toggles
  const handleToggleUnitSystem = () => {
    const next: UnitSystem = unitSystem === "metric" ? "imperial" : "metric";
    setUnitSystem(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("reef_unit_system", next);
    }
  };

  const handleToggleSalinityUnit = () => {
    const next: SalinityUnit = salinityUnit === "sg" ? "ppt" : "sg";
    setSalinityUnit(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("reef_salinity_unit", next);
    }
  };

  // Theme change
  const handleThemeChange = (colors: ThemeColors) => {
    setCurrentTheme(colors);
    applyThemeToDom(colors);
    if (typeof window !== "undefined") {
      localStorage.setItem("reef_studio_theme", JSON.stringify(colors));
    }
  };

  // Tank Profile update
  const handleUpdateTank = async (updatedData: Partial<Tank>) => {
    if (!tank) return;
    try {
      const res = await fetch("/api/tank", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: tank.id, ...updatedData }),
      });
      if (res.ok) {
        setTank((prev) => (prev ? { ...prev, ...updatedData } : prev));
        setAllTanks((prev) =>
          prev.map((t) => (t.id === tank.id ? { ...t, ...updatedData } : t))
        );
      }
    } catch (err) {
      console.error("Failed to update tank:", err);
    }
  };

  // Milestones CRUD
  const handleAddMilestone = async (data: any) => {
    if (!tank) return;
    try {
      const res = await fetch("/api/milestones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, tankId: tank.id }),
      });
      if (res.ok) {
        const result = await res.json();
        setTank((prev) =>
          prev
            ? { ...prev, milestones: [result.milestone, ...(prev.milestones || [])] }
            : prev
        );
      }
    } catch (err) {
      console.error("Failed to add milestone:", err);
    }
  };

  const handleUpdateMilestone = async (id: string, data: any) => {
    try {
      const res = await fetch(`/api/milestones/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const result = await res.json();
        setTank((prev) =>
          prev
            ? {
                ...prev,
                milestones: (prev.milestones || []).map((m) =>
                  m.id === id ? result.milestone : m
                ),
              }
            : prev
        );
      }
    } catch (err) {
      console.error("Failed to update milestone:", err);
    }
  };

  const handleDeleteMilestone = async (id: string) => {
    try {
      const res = await fetch(`/api/milestones/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTank((prev) =>
          prev
            ? {
                ...prev,
                milestones: (prev.milestones || []).filter((m) => m.id !== id),
              }
            : prev
        );
      }
    } catch (err) {
      console.error("Failed to delete milestone:", err);
    }
  };

  // Water Parameters CRUD
  const handleAddParameter = async (param: any) => {
    if (!tank) return;
    try {
      const res = await fetch("/api/parameters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...param, tankId: tank.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setTank((prev) =>
          prev
            ? {
                ...prev,
                parameters: [data.parameter, ...(prev.parameters || [])],
              }
            : prev
        );
      }
    } catch (err) {
      console.error("Failed to add parameter:", err);
    }
  };

  const handleDeleteParameter = async (id: string) => {
    try {
      const res = await fetch(`/api/parameters/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTank((prev) =>
          prev
            ? {
                ...prev,
                parameters: (prev.parameters || []).filter((p) => p.id !== id),
              }
            : prev
        );
      }
    } catch (err) {
      console.error("Failed to delete parameter:", err);
    }
  };

  // Livestock CRUD
  const handleAddLivestock = async (data: any) => {
    if (!tank) return;
    try {
      const res = await fetch("/api/livestock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, tankId: tank.id }),
      });
      if (res.ok) {
        const result = await res.json();
        setTank((prev) =>
          prev
            ? {
                ...prev,
                livestock: [result.livestock, ...(prev.livestock || [])],
              }
            : prev
        );
      }
    } catch (err) {
      console.error("Failed to add livestock:", err);
    }
  };

  const handleUpdateLivestock = async (id: string, data: any) => {
    try {
      const res = await fetch(`/api/livestock/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const result = await res.json();
        setTank((prev) =>
          prev
            ? {
                ...prev,
                livestock: (prev.livestock || []).map((l) =>
                  l.id === id ? result.livestock : l
                ),
              }
            : prev
        );
      }
    } catch (err) {
      console.error("Failed to update livestock:", err);
    }
  };

  const handleDeleteLivestock = async (id: string) => {
    try {
      const res = await fetch(`/api/livestock/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTank((prev) =>
          prev
            ? {
                ...prev,
                livestock: (prev.livestock || []).filter((l) => l.id !== id),
              }
            : prev
        );
      }
    } catch (err) {
      console.error("Failed to delete livestock:", err);
    }
  };

  // Stocking Timeline CRUD
  const handleAddTimelineEvent = async (event: any) => {
    if (!tank) return;
    try {
      const res = await fetch("/api/timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...event, tankId: tank.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setTank((prev) =>
          prev
            ? { ...prev, timeline: [data.event, ...(prev.timeline || [])] }
            : prev
        );
      }
    } catch (err) {
      console.error("Failed to add timeline event:", err);
    }
  };

  const handleDeleteTimelineEvent = async (id: string) => {
    try {
      const res = await fetch(`/api/timeline/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTank((prev) =>
          prev
            ? {
                ...prev,
                timeline: (prev.timeline || []).filter((e) => e.id !== id),
              }
            : prev
        );
      }
    } catch (err) {
      console.error("Failed to delete timeline event:", err);
    }
  };

  // Maintenance Tasks CRUD
  const handleAddTask = async (taskData: any) => {
    if (!tank) return;
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...taskData, tankId: tank.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setTank((prev) =>
          prev ? { ...prev, tasks: [...(prev.tasks || []), data.task] } : prev
        );
      }
    } catch (err) {
      console.error("Failed to add task:", err);
    }
  };

  const handleUpdateTask = async (id: string, data: any) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const result = await res.json();
        setTank((prev) =>
          prev
            ? {
                ...prev,
                tasks: (prev.tasks || []).map((t) =>
                  t.id === id ? result.task : t
                ),
              }
            : prev
        );
      }
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  };

  const handleCompleteTask = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completed: true,
          lastCompleted: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        const result = await res.json();
        setTank((prev) =>
          prev
            ? {
                ...prev,
                tasks: (prev.tasks || []).map((t) =>
                  t.id === id ? result.task : t
                ),
              }
            : prev
        );
      }
    } catch (err) {
      console.error("Failed to complete task:", err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTank((prev) =>
          prev
            ? { ...prev, tasks: (prev.tasks || []).filter((t) => t.id !== id) }
            : prev
        );
      }
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  // Salt Formulas CRUD
  const handleAddSaltFormula = async (data: any) => {
    try {
      const res = await fetch("/api/salt-formulas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const result = await res.json();
        setSaltFormulas((prev) => [...prev, result.formula]);
      }
    } catch (err) {
      console.error("Failed to add salt formula:", err);
    }
  };

  const handleUpdateSaltFormula = async (id: string, data: any) => {
    try {
      const res = await fetch(`/api/salt-formulas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const result = await res.json();
        setSaltFormulas((prev) =>
          prev.map((f) => (f.id === id ? result.formula : f))
        );
      }
    } catch (err) {
      console.error("Failed to update salt formula:", err);
    }
  };

  const handleDeleteSaltFormula = async (id: string) => {
    try {
      const res = await fetch(`/api/salt-formulas/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSaltFormulas((prev) => prev.filter((f) => f.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete salt formula:", err);
    }
  };

  // Sticky Notes CRUD
  const handleAddNote = async (data: any) => {
    if (!tank) return;
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, tankId: tank.id }),
      });
      if (res.ok) {
        const result = await res.json();
        setTank((prev) =>
          prev
            ? { ...prev, notes: [result.note, ...(prev.notes || [])] }
            : prev
        );
      }
    } catch (err) {
      console.error("Failed to add note:", err);
    }
  };

  const handleUpdateNote = async (id: string, data: any) => {
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const result = await res.json();
        setTank((prev) =>
          prev
            ? {
                ...prev,
                notes: (prev.notes || []).map((n) =>
                  n.id === id ? result.note : n
                ),
              }
            : prev
        );
      }
    } catch (err) {
      console.error("Failed to update note:", err);
    }
  };

  const handleToggleNotePin = async (id: string, pinned: boolean) => {
    await handleUpdateNote(id, { isPinned: pinned });
  };

  const handleDeleteNote = async (id: string) => {
    try {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTank((prev) =>
          prev
            ? { ...prev, notes: (prev.notes || []).filter((n) => n.id !== id) }
            : prev
        );
      }
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  };

  const handlePinRecipeToNotes = async (
    content: string,
    customTitle?: string,
    customTag?: string
  ) => {
    if (!tank) return;
    const title = customTitle || "Calculated Dosing Recipe";
    const tag = customTag || "calculator";
    await handleAddNote({
      title,
      body: content,
      tag,
      isPinned: true,
      tagColor: "#00d2be",
    });
  };

  // State-driven interaction triggers
  const handleTankClick = () => {
    if (isTankFocused && activeTab === "profile") {
      setIsTankFocused(false);
      setActiveTab("deck");
    } else {
      setIsTankFocused(true);
      setActiveTab("profile");
    }
  };

  const handleCloseOverlay = () => {
    setIsTankFocused(false);
    setActiveTab("deck");
  };

  if (loading || !tank) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300"
        style={{ backgroundColor: "var(--bg-main, #0b0f17)" }}
      >
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl animate-pulse mb-3 shadow-lg">
          🌊
        </div>
        <h2 className="text-sm font-semibold tracking-wider text-[#f0f4f8]">
          Aquarium Studio
        </h2>
        <p className="text-xs text-[#8e9fb5] mt-1 animate-pulse">
          Loading aquarium environment...
        </p>
      </div>
    );
  }

  const isFreshwater = tank.tankType === "FRESHWATER";
  const latestParam =
    tank.parameters && tank.parameters.length > 0
      ? tank.parameters[0]
      : undefined;
  const corals = (tank.livestock || []).filter(
    (l) => l.type === "CORAL" || l.type === "PLANT"
  );
  const fishInverts = (tank.livestock || []).filter(
    (l) => l.type === "FISH_INVERT"
  );

  return (
    <div
      className="min-h-screen text-[#f0f4f8] flex flex-col font-sans antialiased selection:bg-[#00d2be]/25 selection:text-[#00d2be] relative overflow-x-hidden transition-colors duration-300"
      style={{ backgroundColor: "var(--bg-main, #0b0f17)" }}
    >
      {/* ========================================================= */}
      {/* MINIMALIST SPATIAL TOP BAR (Clean, Unobtrusive) */}
      {/* ========================================================= */}
      <header className="no-print w-full px-2.5 sm:px-6 py-2.5 sm:py-4 flex items-center justify-between gap-1.5 sm:gap-2 z-30">
        {/* Brand & Phone Connection Column (Adequately spaced) */}
        <div className="flex flex-col items-start gap-1 sm:gap-1.5 shrink-0">
          {/* Brand / Home Anchor Button */}
          <button
            type="button"
            onClick={handleCloseOverlay}
            className="flex items-center gap-1.5 sm:gap-2 group cursor-pointer text-left py-0.5 rounded-lg transition-all"
            title="Return to Aquarium Home"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-xs sm:text-sm shadow-sm group-hover:border-[#00d2be]/60 group-hover:shadow-[0_0_10px_rgba(0,210,190,0.3)] transition-all">
              {isFreshwater ? "🌿" : "🐠"}
            </div>
            <h1 className="text-xs sm:text-sm font-bold tracking-wide text-[#f0f4f8] group-hover:text-[#00d2be] transition-colors leading-tight">
              Aquarium Studio
            </h1>
          </button>

          {/* Privacy & Safety FAQ Button (Text-based, one look clarity) */}
          <button
            type="button"
            onClick={() => setIsPrivacyFaqOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-[#00d2be]/15 border border-white/10 hover:border-[#00d2be]/50 text-[#8e9fb5] hover:text-[#00d2be] text-[10px] sm:text-[11px] font-medium transition-all shadow-sm hover:shadow-[0_0_10px_rgba(0,210,190,0.25)] cursor-pointer select-none group/faq"
            title="Privacy, Safety & App FAQ (100% Local PC)"
          >
            <span>Privacy & Safety FAQ</span>
          </button>

          {/* Phone Connection Instructions Button */}
          <button
            type="button"
            onClick={() => setIsPhoneConnectOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-[#00d2be]/15 border border-white/10 hover:border-[#00d2be]/50 text-[#8e9fb5] hover:text-[#00d2be] text-[10px] sm:text-[11px] font-medium transition-all shadow-sm hover:shadow-[0_0_10px_rgba(0,210,190,0.25)] cursor-pointer select-none group/phone"
            title="Instructions to connect via your phone browser"
          >
            <Smartphone size={11} className="text-[#00d2be] group-hover/phone:scale-110 transition-transform shrink-0" />
            <span>Connect Phone</span>
          </button>
        </div>

        {/* Minimalist Controls Array */}
        {!isFaunaModalOpen && !isEditSpecsOpen && !isSumpModalOpen && !isProfileModalOpen && (
          <div className="flex items-center justify-end gap-1 sm:gap-1.5 flex-wrap shrink-0 max-w-full">
            {/* Active Overlay Close Button */}
            {activeTab !== "deck" && (
              <button
                onClick={handleCloseOverlay}
                className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-[#00d2be] text-[#0b0f17] hover:bg-[#14ebd7] text-xs font-semibold transition-all shadow-md cursor-pointer shrink-0"
                title="Return to spatial tank view (Esc)"
              >
                <ArrowLeft size={12} className="shrink-0" />
                <span>Back</span>
                <span className="text-[10px] px-1 rounded bg-black/20 text-[#0b0f17] hidden sm:inline">
                  Esc
                </span>
              </button>
            )}

            {/* Add Tank Button */}
            <button
              onClick={() => setIsNewTankOpen(true)}
              className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-[#00d2be]/15 hover:bg-[#00d2be]/25 border border-[#00d2be]/40 hover:border-[#00d2be]/70 text-[#00d2be] hover:text-[#14ebd7] text-xs font-semibold transition-all shadow-sm cursor-pointer shrink-0"
              title="Create New Aquarium Profile"
            >
              <span className="sm:hidden font-bold">+ Tank</span>
              <span className="hidden sm:inline">+ Add Tank</span>
            </button>

            {/* Delete Tank Button */}
            {tank && (
              <button
                onClick={() => handleDeleteTank(tank.id, tank.name)}
                disabled={allTanks.length <= 1}
                className={`flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border text-xs font-semibold transition-all shadow-sm shrink-0 ${
                  allTanks.length <= 1
                    ? "bg-rose-500/5 border-rose-500/10 text-rose-400/40 cursor-not-allowed opacity-50"
                    : "bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 hover:border-rose-500/60 text-rose-400 hover:text-rose-300 cursor-pointer"
                }`}
                title={
                  allTanks.length <= 1
                    ? "Cannot delete the only aquarium profile"
                    : `Delete "${tank.name}" Aquarium Profile`
                }
              >
                <Trash2 size={12} className="shrink-0" />
                <span className="hidden md:inline">Delete Tank</span>
              </button>
            )}

            {/* Unit Toggle */}
            <button
              onClick={handleToggleUnitSystem}
              className="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 text-xs font-medium text-[#8e9fb5] hover:text-[#f0f4f8] transition-all cursor-pointer shrink-0"
              title={`Switch to ${unitSystem === "metric" ? "Imperial (Gal, °F)" : "Metric (L, °C)"}`}
            >
              <span className={unitSystem === "metric" ? "text-[#00d2be] font-bold" : ""}>M</span>
              <span className="text-white/20 mx-0.5">/</span>
              <span className={unitSystem === "imperial" ? "text-[#00d2be] font-bold" : ""}>I</span>
            </button>

            {/* Salinity Unit (Saltwater only, static placeholder on freshwater) */}
            <button
              onClick={!isFreshwater ? handleToggleSalinityUnit : undefined}
              disabled={isFreshwater}
              className={`hidden md:inline-block px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full border text-xs font-medium transition-all shrink-0 ${
                isFreshwater
                  ? "bg-white/[0.01] border-white/5 text-[#8e9fb5]/30 cursor-not-allowed opacity-50"
                  : "bg-white/[0.04] hover:bg-white/[0.08] border-white/5 text-[#8e9fb5] hover:text-[#f0f4f8] cursor-pointer"
              }`}
              title={
                isFreshwater
                  ? "Salinity unit not applicable to Freshwater tanks"
                  : `Switch Salinity unit to ${salinityUnit === "sg" ? "PPT" : "SG"}`
              }
            >
              <span className={!isFreshwater && salinityUnit === "sg" ? "text-[#00d2be] font-bold" : ""}>SG</span>
              <span className="text-white/20 mx-0.5">/</span>
              <span className={!isFreshwater && salinityUnit === "ppt" ? "text-[#00d2be] font-bold" : ""}>PPT</span>
            </button>

            {/* Theme Customizer */}
            <button
              onClick={() => setIsThemeOpen(true)}
              className="p-1.5 sm:p-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 text-[#8e9fb5] hover:text-[#ff6b35] transition-all cursor-pointer shrink-0"
              title="Change Color Theme"
            >
              <Palette size={13} className="text-[#ff6b35] sm:w-3.5 sm:h-3.5" />
            </button>

            {/* AI Settings */}
            <button
              onClick={() => setIsAiSettingsOpen(true)}
              className="p-1.5 sm:p-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 text-[#8e9fb5] hover:text-[#00d2be] transition-all cursor-pointer shrink-0"
              title="Configure AI Vision & Trends Provider"
            >
              <Key size={13} className="sm:w-3.5 sm:h-3.5" />
            </button>

            {/* Accessible Font Size Scaling Toggle */}
            <button
              onClick={handleCycleFontSize}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full bg-white/[0.04] hover:bg-[#00d2be]/15 border border-white/5 hover:border-[#00d2be]/40 text-xs font-semibold text-[#8e9fb5] hover:text-[#00d2be] transition-all cursor-pointer shrink-0 select-none shadow-sm"
              title={`Font Size: ${
                fontSizeLevel === "normal"
                  ? "Standard (100%)"
                  : fontSizeLevel === "large"
                  ? "Large (112%)"
                  : "Extra Large (125%)"
              } - Click to adjust text size`}
            >
              <Type size={12} className="text-[#00d2be] shrink-0" />
              <span className="text-[11px] font-bold">
                {fontSizeLevel === "normal" ? "A" : fontSizeLevel === "large" ? "A+" : "A++"}
              </span>
            </button>

            {/* Refresh */}
            <button
              onClick={() => {
                setRefreshing(true);
                fetchTanksList();
                if (tank) fetchTankData(tank.id);
              }}
              className="p-1.5 sm:p-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 text-[#8e9fb5] hover:text-[#00d2be] transition-all cursor-pointer shrink-0"
              title="Refresh Data"
            >
              <RefreshCw
                size={13}
                className={`sm:w-3.5 sm:h-3.5 ${refreshing ? "animate-spin text-[#00d2be]" : ""}`}
              />
            </button>
          </div>
        )}
      </header>

      {/* ========================================================= */}
      {/* SPATIAL OBJECT-DRIVEN CANVAS (The Stable Central Anchor) */}
      {/* ========================================================= */}
      <main className={`flex-1 w-full max-w-7xl 2xl:max-w-[1500px] mx-auto px-3 sm:px-6 py-2 flex flex-col items-center justify-start relative ${isFaunaModalOpen ? "z-50" : "z-10"}`}>
        {/* CENTERPIECE: 3D / Vector Model of Aquarium with Carousel */}
        <div className="w-full flex flex-col items-center">
          <InteractiveAquariumModel
            tank={tank}
            allTanks={allTanks}
            latestParam={latestParam}
            coralCount={corals.length}
            fishCount={fishInverts.length}
            isFocused={isTankFocused}
            totalTanks={allTanks.length}
            currentTankIndex={currentTankIndex}
            onTankClick={handleTankClick}
            onOpenCorals={() => {
              setIsTankFocused(false);
              setActiveTab("corals");
            }}
            onOpenFish={() => {
              setIsTankFocused(false);
              setActiveTab("fish");
            }}
            onPrevTank={handlePrevTank}
            onNextTank={handleNextTank}
            onSelectTank={handleSelectTank}
            onUpdateTank={handleUpdateTank}
            onDeleteTank={handleDeleteTank}
            onDeleteLivestock={handleDeleteLivestock}
            unitSystem={unitSystem}
            salinityUnit={salinityUnit}
            onFaunaModalChange={setIsFaunaModalOpen}
            onEditSpecsModalChange={setIsEditSpecsOpen}
            onSumpModalChange={setIsSumpModalOpen}
            onOpenHealthDiagnostics={() => setIsHealthDiagnosticsOpen(true)}
          />
        </div>

        {/* SPATIAL UTILITY WIDGETS ORGANIZED AROUND PERIMETER */}
        {activeTab !== "profile" && (
          <SpatialUtilityWidgets
            tank={tank}
            latestParam={latestParam}
            activeTab={activeTab}
            onSelectTab={(tabId) => {
              setActiveTab(tabId as TabId);
              setIsTankFocused(false);
            }}
            onOpenCharts={() => {
              setActiveTab("charts");
              setIsTankFocused(false);
            }}
          />
        )}

        {/* FOCUS MODE: DYNAMIC SLIDE-IN OF TANK PROFILE UNDERNEATH */}
        {activeTab === "profile" && (
          <div className="w-full max-w-4xl mx-auto mt-6 animate-in fade-in slide-in-from-top-6 duration-500">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/5">
              <div>
                <h3 className="text-base font-semibold text-[#f0f4f8]">
                  {tank.name} • System Profile & Specs
                </h3>
                <p className="text-xs text-[#8e9fb5] mt-0.5">
                  Hardware stack, photoperiod schedule, volume metrics, and milestone history.
                </p>
              </div>
              <button
                onClick={handleCloseOverlay}
                className="flex items-center gap-1 text-xs text-[#8e9fb5] hover:text-[#00d2be] px-3 py-1 rounded-full border border-white/10 hover:border-[#00d2be]/40 transition-all cursor-pointer"
              >
                <Minimize2 size={12} /> Exit Focus
              </button>
            </div>

            <TankProfileView
              tank={tank}
              unitSystem={unitSystem}
              onUpdateTank={handleUpdateTank}
              onAddMilestone={handleAddMilestone}
              onUpdateMilestone={handleUpdateMilestone}
              onDeleteMilestone={handleDeleteMilestone}
              onModalChange={setIsProfileModalOpen}
            />
          </div>
        )}

        {/* Minimalist Secondary Actions Footer (Timeline & Sitter Sheet) */}
        {activeTab === "deck" && (
          <div className="w-full max-w-4xl mx-auto mt-4 pt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-[#8e9fb5]">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab("timeline")}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-white/15 transition-all text-[#8e9fb5] hover:text-[#f0f4f8] cursor-pointer"
              >
                <History size={12} /> Stocking Timeline ({tank.timeline?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab("sitter")}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-white/15 transition-all text-[#8e9fb5] hover:text-[#f0f4f8] cursor-pointer"
              >
                <Printer size={12} /> Sitter Sheet Protocol
              </button>
            </div>

            <span className="text-[11px] text-[#8e9fb5]/50">
              Scroll or swipe horizontally to cycle tanks
            </span>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* SLIDE-OVER REVEAL OVERLAYS (Vaults, Charts, Logs, Tasks, etc.) */}
      {/* ========================================================= */}
      {activeTab !== "deck" && activeTab !== "profile" && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="w-full max-w-5xl h-[92vh] sm:h-[88vh] bg-[#101622] border border-[#28364a] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-300"
          >
            {/* Drawer Header (Responsive for Mobile & Desktop) */}
            <div className="px-3 sm:px-6 py-2.5 sm:py-4 border-b border-[#28364a] flex items-center justify-between gap-2 bg-[#0e1420]">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 overflow-hidden">
                <span className="text-xs sm:text-sm font-semibold text-[#f0f4f8] capitalize truncate">
                  {activeTab === "params" && "Water Parameters Log"}
                  {activeTab === "charts" && "Parameter Trends & AI Analysis"}
                  {activeTab === "corals" && (isFreshwater ? "Flora & Plant Vault" : "Coral Vault")}
                  {activeTab === "fish" && (isFreshwater ? "Fish and Invert Vault" : "Fish Vault")}
                  {activeTab === "calc" && "Calculators & Dosing Studio"}
                  {activeTab === "tasks" && "Maintenance Tasks Checklist"}
                  {activeTab === "notes" && "Sticky Notes & Field Recipes"}
                  {activeTab === "timeline" && "Stocking Timeline"}
                  {activeTab === "sitter" && "Printable Sitter Sheet"}
                </span>

                {/* Sub-toggle for Water Parameters <-> Charts */}
                {(activeTab === "params" || activeTab === "charts") && (
                  <div className="flex items-center gap-1 bg-[#141b27] p-0.5 rounded-lg border border-[#28364a] shrink-0">
                    <button
                      onClick={() => setActiveTab("params")}
                      className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-[11px] sm:text-xs font-medium transition-all ${
                        activeTab === "params"
                          ? "bg-[#00d2be] text-[#0b0f17] font-semibold"
                          : "text-[#8e9fb5] hover:text-[#f0f4f8]"
                      }`}
                    >
                      <span className="sm:hidden">Logs</span>
                      <span className="hidden sm:inline">Parameters Log</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("charts")}
                      className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-[11px] sm:text-xs font-medium transition-all ${
                        activeTab === "charts"
                          ? "bg-[#00d2be] text-[#0b0f17] font-semibold"
                          : "text-[#8e9fb5] hover:text-[#f0f4f8]"
                      }`}
                    >
                      <span className="sm:hidden">Charts</span>
                      <span className="hidden sm:inline">Charts & AI Analysis</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Close Button - Always visible and accessible on mobile */}
              <button
                onClick={handleCloseOverlay}
                className="p-1.5 sm:p-2 rounded-lg bg-[#141b27] hover:bg-[#1a2333] border border-[#28364a] text-[#8e9fb5] hover:text-[#f0f4f8] transition-all cursor-pointer shrink-0"
                title="Close overlay (Esc)"
              >
                <X size={16} />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {activeTab === "params" && (
                <WaterParametersView
                  parameters={tank.parameters || []}
                  tank={tank}
                  unitSystem={unitSystem}
                  salinityUnit={salinityUnit}
                  onAddParameter={handleAddParameter}
                  onDeleteParameter={handleDeleteParameter}
                  onPinRecipeToNotes={handlePinRecipeToNotes}
                />
              )}

              {activeTab === "charts" && (
                <ParameterChartsView
                  parameters={tank.parameters || []}
                  tank={tank}
                  unitSystem={unitSystem}
                  salinityUnit={salinityUnit}
                  onPinRecipeToNotes={handlePinRecipeToNotes}
                />
              )}

              {activeTab === "corals" && (
                <CoralVaultView
                  corals={corals}
                  tankId={tank.id}
                  tank={tank}
                  onAddCoral={handleAddLivestock}
                  onUpdateCoral={handleUpdateLivestock}
                  onDeleteCoral={handleDeleteLivestock}
                  onOpenHealthDiagnostics={() => setIsHealthDiagnosticsOpen(true)}
                />
              )}

              {activeTab === "fish" && (
                <FishVaultView
                  fish={fishInverts}
                  tankId={tank.id}
                  tank={tank}
                  onAddFish={handleAddLivestock}
                  onUpdateFish={handleUpdateLivestock}
                  onDeleteFish={handleDeleteLivestock}
                  onOpenHealthDiagnostics={() => setIsHealthDiagnosticsOpen(true)}
                />
              )}

              {activeTab === "calc" && (
                <CalculatorsView
                  tank={tank}
                  saltFormulas={saltFormulas}
                  unitSystem={unitSystem}
                  onPinRecipeToNotes={handlePinRecipeToNotes}
                  onAddSaltFormula={handleAddSaltFormula}
                  onUpdateSaltFormula={handleUpdateSaltFormula}
                  onDeleteSaltFormula={handleDeleteSaltFormula}
                />
              )}

              {activeTab === "tasks" && (
                <MaintenanceTasksView
                  tasks={tank.tasks || []}
                  tankId={tank.id}
                  onAddTask={handleAddTask}
                  onUpdateTask={handleUpdateTask}
                  onCompleteTask={handleCompleteTask}
                  onDeleteTask={handleDeleteTask}
                />
              )}

              {activeTab === "notes" && (
                <StickyNotesView
                  notes={tank.notes || []}
                  tankId={tank.id}
                  onAddNote={handleAddNote}
                  onUpdateNote={handleUpdateNote}
                  onTogglePin={handleToggleNotePin}
                  onDeleteNote={handleDeleteNote}
                />
              )}

              {activeTab === "timeline" && (
                <StockingTimelineView
                  events={tank.timeline || []}
                  tankId={tank.id}
                  onAddEvent={handleAddTimelineEvent}
                  onDeleteEvent={handleDeleteTimelineEvent}
                />
              )}

              {activeTab === "sitter" && (
                <PrintableSitterSheetView
                  tank={tank}
                  onUpdateTank={handleUpdateTank}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* GLOBAL MODALS */}
      {/* ========================================================= */}
      <ThemeCustomizerModal
        isOpen={isThemeOpen}
        onClose={() => setIsThemeOpen(false)}
        currentTheme={currentTheme}
        onThemeChange={handleThemeChange}
      />

      <NewTankModal
        isOpen={isNewTankOpen}
        onClose={() => setIsNewTankOpen(false)}
        unitSystem={unitSystem}
        onCreateTank={handleCreateTank}
      />

      <AiSettingsModal
        isOpen={isAiSettingsOpen}
        onClose={() => setIsAiSettingsOpen(false)}
      />

      <PhoneConnectModal
        isOpen={isPhoneConnectOpen}
        onClose={() => setIsPhoneConnectOpen(false)}
      />

      <PrivacyFaqModal
        isOpen={isPrivacyFaqOpen}
        onClose={() => setIsPrivacyFaqOpen(false)}
      />

      <HealthDiagnosticsModal
        isOpen={isHealthDiagnosticsOpen}
        onClose={() => setIsHealthDiagnosticsOpen(false)}
        tank={tank}
      />
    </div>
  );
}
