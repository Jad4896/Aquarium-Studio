"use client";

import React, { useState, useEffect } from "react";
import { ThemeColors } from "@/types";
import { Palette, RotateCcw, Check, Sparkles, X, Paintbrush } from "lucide-react";

export const BG_COLOR_PRESETS = [
  { name: "Deep Navy", hex: "#0d121a" },
  { name: "Abyss Blue", hex: "#06101e" },
  { name: "Obsidian Black", hex: "#000000" },
  { name: "Charcoal", hex: "#121212" },
  { name: "Slate Midnight", hex: "#0f172a" },
  { name: "Deep Emerald", hex: "#081a15" },
  { name: "Coral Plum", hex: "#180f14" },
  { name: "Light Pearl", hex: "#f4f6f9" },
  { name: "Pure White", hex: "#ffffff" },
];

export const THEME_PRESETS: Record<string, { name: string; icon: string; colors: ThemeColors }> = {
  space: {
    name: "Deep Space Navy",
    icon: "🌌",
    colors: {
      bgMain: "#0d121a",
      bgCard: "#161e2b",
      bgCardHover: "#1e293b",
      bgInput: "#0f1520",
      border: "#28364a",
      accent: "#ff6b35",
      teal: "#00d2be",
      textMain: "#f0f4f8",
      textMuted: "#8e9fb5",
    },
  },
  abyss: {
    name: "Abyss Cyan",
    icon: "🌊",
    colors: {
      bgMain: "#06101e",
      bgCard: "#0b1d36",
      bgCardHover: "#132c52",
      bgInput: "#071529",
      border: "#1b3860",
      accent: "#00d2be",
      teal: "#00ffff",
      textMain: "#e2f3fc",
      textMuted: "#7fa3be",
    },
  },
  darkslate: {
    name: "Dark Slate Minimal",
    icon: "🪨",
    colors: {
      bgMain: "#121212",
      bgCard: "#1e1e1e",
      bgCardHover: "#282828",
      bgInput: "#181818",
      border: "#333333",
      accent: "#3498db",
      teal: "#00d2be",
      textMain: "#ffffff",
      textMuted: "#999999",
    },
  },
  coral: {
    name: "Coral Glow",
    icon: "🪸",
    colors: {
      bgMain: "#180f14",
      bgCard: "#261620",
      bgCardHover: "#381e2f",
      bgInput: "#1c1018",
      border: "#472238",
      accent: "#ff3366",
      teal: "#ff99bb",
      textMain: "#fdedf2",
      textMuted: "#b3889c",
    },
  },
  emerald: {
    name: "Emerald Reef",
    icon: "🌿",
    colors: {
      bgMain: "#081a15",
      bgCard: "#0f2b23",
      bgCardHover: "#173e33",
      bgInput: "#092019",
      border: "#1e4a3c",
      accent: "#2ecc71",
      teal: "#00d2be",
      textMain: "#e8f8f2",
      textMuted: "#83ab9d",
    },
  },
  light: {
    name: "Clean Marine (Light)",
    icon: "☀️",
    colors: {
      bgMain: "#f4f6f9",
      bgCard: "#ffffff",
      bgCardHover: "#f0f4f8",
      bgInput: "#e9edf2",
      border: "#cbd5e1",
      accent: "#ff6b35",
      teal: "#00a896",
      textMain: "#1e293b",
      textMuted: "#64748b",
    },
  },
};

export const applyThemeToDom = (colors: ThemeColors) => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.setProperty("--bg-main", colors.bgMain);
  root.style.setProperty("--bg-card", colors.bgCard);
  root.style.setProperty("--bg-card-hover", colors.bgCardHover);
  root.style.setProperty("--bg-input", colors.bgInput);
  root.style.setProperty("--border", colors.border);
  root.style.setProperty("--accent", colors.accent);
  root.style.setProperty("--teal", colors.teal);
  root.style.setProperty("--text-main", colors.textMain);
  root.style.setProperty("--text-muted", colors.textMuted);

  // Directly update background color on document root and body
  root.style.backgroundColor = colors.bgMain;
  if (document.body) {
    document.body.style.backgroundColor = colors.bgMain;
  }
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeColors;
  onThemeChange: (colors: ThemeColors) => void;
}

export default function ThemeCustomizerModal({
  isOpen,
  onClose,
  currentTheme,
  onThemeChange,
}: Props) {
  const [colors, setColors] = useState<ThemeColors>(currentTheme);
  const [activePreset, setActivePreset] = useState<string>("space");
  const [bgHexInput, setBgHexInput] = useState<string>(currentTheme.bgMain || "#0d121a");

  useEffect(() => {
    if (isOpen) {
      setColors(currentTheme);
      setBgHexInput(currentTheme.bgMain || "#0d121a");
    }
  }, [isOpen, currentTheme]);

  if (!isOpen) return null;

  const handleApplyPreset = (presetKey: string) => {
    setActivePreset(presetKey);
    const selected = THEME_PRESETS[presetKey].colors;
    setColors(selected);
    setBgHexInput(selected.bgMain);
    applyThemeToDom(selected);
    onThemeChange(selected);
  };

  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    const updated = { ...colors, [key]: value };
    setColors(updated);
    if (key === "bgMain") {
      setBgHexInput(value);
    }
    applyThemeToDom(updated);
    onThemeChange(updated);
    setActivePreset("custom");
  };

  const handleBgHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value;
    if (!raw.startsWith("#")) raw = "#" + raw;
    raw = "#" + raw.slice(1).replace(/[^0-9A-Fa-f]/g, "").slice(0, 6);
    setBgHexInput(raw);
    if (/^#[0-9A-Fa-f]{6}$/i.test(raw)) {
      const updated = { ...colors, bgMain: raw };
      setColors(updated);
      applyThemeToDom(updated);
      onThemeChange(updated);
      setActivePreset("custom");
    }
  };

  const handleReset = () => {
    handleApplyPreset("space");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-[#161e2b] border border-[#28364a] rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#28364a] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Palette className="text-[#00d2be]" size={20} />
            <h3 className="text-base font-bold text-[#f0f4f8]">
              Theme & Color Customizer
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#8e9fb5] hover:text-[#f0f4f8]"
          >
            <X size={18} />
          </button>
        </div>

        {/* ========================================================= */}
        {/* Dedicated Webapp Background Color Section */}
        {/* ========================================================= */}
        <div className="mb-6 p-4 rounded-xl bg-[#0f1520] border border-[#28364a]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#f0f4f8] flex items-center gap-2">
              <Paintbrush size={15} className="text-[#00d2be]" />
              Webapp Background Color
            </span>
            <div className="flex items-center gap-2">
              <span
                className="w-4 h-4 rounded-full border border-[#28364a] shadow-inner"
                style={{ backgroundColor: colors.bgMain }}
              />
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#161e2b] border border-[#28364a] text-[#00d2be] font-bold">
                {colors.bgMain.toUpperCase()}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-[#8e9fb5] mb-3">
            Change the web application background tone in real-time. Pick from curated presets or dial in a custom hex code.
          </p>

          {/* Background Preset Chips */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
            {BG_COLOR_PRESETS.map((bg) => {
              const isSelected = colors.bgMain.toLowerCase() === bg.hex.toLowerCase();
              return (
                <button
                  key={bg.name}
                  type="button"
                  onClick={() => handleColorChange("bgMain", bg.hex)}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-left transition-all ${
                    isSelected
                      ? "border-[#00d2be] bg-[#161e2b] ring-1 ring-[#00d2be] text-[#f0f4f8]"
                      : "border-[#28364a] bg-[#161e2b]/60 hover:border-[#8e9fb5] text-[#8e9fb5]"
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/40 shrink-0"
                    style={{ backgroundColor: bg.hex }}
                  />
                  <span className="text-[10px] font-semibold truncate">{bg.name}</span>
                </button>
              );
            })}
          </div>

          {/* Custom Color Wheel & Hex Input */}
          <div className="flex flex-wrap items-center gap-3 bg-[#161e2b] border border-[#28364a] p-2.5 rounded-lg">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colors.bgMain.length === 7 ? colors.bgMain : "#0d121a"}
                onChange={(e) => handleColorChange("bgMain", e.target.value)}
                className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                title="Open color picker"
              />
              <span className="text-xs text-[#8e9fb5] font-medium">Custom Swatch:</span>
            </div>

            <div className="flex items-center gap-1.5 bg-[#0f1520] px-2.5 py-1 rounded-md border border-[#28364a]">
              <span className="text-xs text-[#8e9fb5] font-mono">#</span>
              <input
                type="text"
                value={bgHexInput.replace(/^#/, "")}
                onChange={handleBgHexInputChange}
                className="w-20 bg-transparent text-xs font-mono text-[#f0f4f8] focus:outline-none uppercase"
                placeholder="0D121A"
                maxLength={6}
              />
            </div>

            <span className="text-[10px] text-[#8e9fb5] ml-auto">
              Live updates across all views
            </span>
          </div>
        </div>

        {/* Presets Section */}
        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8e9fb5] block mb-3 flex items-center gap-1.5">
            <Sparkles size={14} className="text-[#00d2be]" />
            Color Theme Presets
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {Object.keys(THEME_PRESETS).map((key) => {
              const preset = THEME_PRESETS[key];
              const isSelected = activePreset === key;
              return (
                <button
                  key={key}
                  onClick={() => handleApplyPreset(key)}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    isSelected
                      ? "border-[#00d2be] bg-[#0f1520] shadow-md ring-1 ring-[#00d2be]"
                      : "border-[#28364a] bg-[#0f1520]/60 hover:border-[#8e9fb5]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-base">{preset.icon}</span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-[#00d2be]" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-[#f0f4f8] block">
                    {preset.name}
                  </span>
                  {/* Swatches */}
                  <div className="flex items-center gap-1 mt-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/40"
                      style={{ backgroundColor: preset.colors.bgMain }}
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/40"
                      style={{ backgroundColor: preset.colors.bgCard }}
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/40"
                      style={{ backgroundColor: preset.colors.teal }}
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/40"
                      style={{ backgroundColor: preset.colors.accent }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Controls */}
        <div className="mb-6 pt-4 border-t border-[#28364a]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8e9fb5] block mb-3">
            Fine-Tune Custom Palette
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Background Main */}
            <div className="bg-[#0f1520] border border-[#28364a] p-2.5 rounded-lg flex items-center justify-between">
              <span className="text-[#8e9fb5] font-semibold">Background Color</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colors.bgMain}
                  onChange={(e) => handleColorChange("bgMain", e.target.value)}
                  className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                />
                <span className="font-mono text-[11px] text-[#f0f4f8] uppercase">
                  {colors.bgMain}
                </span>
              </div>
            </div>

            {/* Card Background */}
            <div className="bg-[#0f1520] border border-[#28364a] p-2.5 rounded-lg flex items-center justify-between">
              <span className="text-[#8e9fb5] font-semibold">Card Panels</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colors.bgCard}
                  onChange={(e) => handleColorChange("bgCard", e.target.value)}
                  className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                />
                <span className="font-mono text-[11px] text-[#f0f4f8] uppercase">
                  {colors.bgCard}
                </span>
              </div>
            </div>

            {/* Input Background */}
            <div className="bg-[#0f1520] border border-[#28364a] p-2.5 rounded-lg flex items-center justify-between">
              <span className="text-[#8e9fb5] font-semibold">Input Background</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colors.bgInput}
                  onChange={(e) => handleColorChange("bgInput", e.target.value)}
                  className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                />
                <span className="font-mono text-[11px] text-[#f0f4f8] uppercase">
                  {colors.bgInput}
                </span>
              </div>
            </div>

            {/* Border Color */}
            <div className="bg-[#0f1520] border border-[#28364a] p-2.5 rounded-lg flex items-center justify-between">
              <span className="text-[#8e9fb5] font-semibold">Border Color</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colors.border}
                  onChange={(e) => handleColorChange("border", e.target.value)}
                  className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                />
                <span className="font-mono text-[11px] text-[#f0f4f8] uppercase">
                  {colors.border}
                </span>
              </div>
            </div>

            {/* Accent Color */}
            <div className="bg-[#0f1520] border border-[#28364a] p-2.5 rounded-lg flex items-center justify-between">
              <span className="text-[#8e9fb5] font-semibold">Primary Accent</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colors.accent}
                  onChange={(e) => handleColorChange("accent", e.target.value)}
                  className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                />
                <span className="font-mono text-[11px] text-[#f0f4f8] uppercase">
                  {colors.accent}
                </span>
              </div>
            </div>

            {/* Teal / Secondary */}
            <div className="bg-[#0f1520] border border-[#28364a] p-2.5 rounded-lg flex items-center justify-between">
              <span className="text-[#8e9fb5] font-semibold">Secondary / Cyan</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colors.teal}
                  onChange={(e) => handleColorChange("teal", e.target.value)}
                  className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                />
                <span className="font-mono text-[11px] text-[#f0f4f8] uppercase">
                  {colors.teal}
                </span>
              </div>
            </div>

            {/* Text Main */}
            <div className="bg-[#0f1520] border border-[#28364a] p-2.5 rounded-lg flex items-center justify-between">
              <span className="text-[#8e9fb5] font-semibold">Font / Main Text</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colors.textMain}
                  onChange={(e) => handleColorChange("textMain", e.target.value)}
                  className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                />
                <span className="font-mono text-[11px] text-[#f0f4f8] uppercase">
                  {colors.textMain}
                </span>
              </div>
            </div>

            {/* Text Muted */}
            <div className="bg-[#0f1520] border border-[#28364a] p-2.5 rounded-lg flex items-center justify-between">
              <span className="text-[#8e9fb5] font-semibold">Muted Text</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colors.textMuted}
                  onChange={(e) => handleColorChange("textMuted", e.target.value)}
                  className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                />
                <span className="font-mono text-[11px] text-[#f0f4f8] uppercase">
                  {colors.textMuted}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[#28364a]">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f1520] border border-[#28364a] text-xs font-semibold text-[#8e9fb5] hover:text-[#f0f4f8]"
          >
            <RotateCcw size={13} />
            Reset to Default
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#00d2be] text-[#0d121a] hover:bg-[#14ebd7] text-xs font-bold transition-all shadow-md"
          >
            Save & Done
          </button>
        </div>
      </div>
    </div>
  );
}
