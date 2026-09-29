"use client";

import React, { useState, useRef, useCallback } from "react";
import { SlidersHorizontal, ZoomIn } from "lucide-react";
import { useMediaLightbox } from "@/context/MediaLightboxContext";

interface Props {
  beforeUrl: string;
  afterUrl: string;
  beforeLabel?: string;
  afterLabel?: string;
  title?: string;
  aspectRatio?: string;
}

export default function GrowthSlider({
  beforeUrl,
  afterUrl,
  beforeLabel = "Initial / Frag",
  afterLabel = "Current / Growth",
  title,
  aspectRatio = "16 / 10",
}: Props) {
  const { openMedia } = useMediaLightbox();
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let pos = (x / rect.width) * 100;
    if (pos < 0) pos = 0;
    if (pos > 100) pos = 100;
    setSliderPos(pos);
  }, []);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  return (
    <div className="w-full flex flex-col gap-2 select-none">
      <div className="flex items-center justify-between text-xs font-semibold text-[#8e9fb5]">
        <span className="flex items-center gap-1.5 text-[#f0f4f8]">
          <SlidersHorizontal size={14} className="text-[#00d2be]" />
          {title || "Growth Comparison Slider"}
        </span>
        <div className="flex items-center gap-1.5">
          {beforeUrl && (
            <button
              type="button"
              onClick={() =>
                openMedia({
                  type: "image",
                  url: beforeUrl,
                  title: `${title || "Coral"} - ${beforeLabel}`,
                  subtitle: "Frag Baseline Photo",
                })
              }
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#161e2b] hover:bg-[#28364a] text-[#8e9fb5] hover:text-[#00d2be] border border-[#28364a] text-[10px] font-bold transition-all cursor-pointer"
              title="Enlarge & Zoom Before Photo"
            >
              <ZoomIn size={11} />
              <span>Zoom {beforeLabel}</span>
            </button>
          )}
          {afterUrl && (
            <button
              type="button"
              onClick={() =>
                openMedia({
                  type: "image",
                  url: afterUrl,
                  title: `${title || "Coral"} - ${afterLabel}`,
                  subtitle: "Growth Result Photo",
                })
              }
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#161e2b] hover:bg-[#28364a] text-[#8e9fb5] hover:text-[#00d2be] border border-[#28364a] text-[10px] font-bold transition-all cursor-pointer"
              title="Enlarge & Zoom After Photo"
            >
              <ZoomIn size={11} />
              <span>Zoom {afterLabel}</span>
            </button>
          )}
        </div>
      </div>

      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchMove={handleTouchMove}
        className="relative w-full overflow-hidden rounded-xl border-2 border-[#28364a] bg-black cursor-ew-resize group shadow-lg"
        style={{ aspectRatio }}
      >
        {/* Before Image (Base) */}
        <img
          src={beforeUrl}
          alt="Before Growth"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* After Image (Clipped) */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ width: `${sliderPos}%` }}
        >
          <img
            src={afterUrl}
            alt="After Growth"
            className="absolute top-0 left-0 h-full object-cover max-w-none pointer-events-none"
            style={{
              width: containerRef.current
                ? `${containerRef.current.clientWidth}px`
                : "100%",
            }}
          />
        </div>

        {/* Divider Bar */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-[#00d2be] shadow-[0_0_12px_rgba(0,210,190,0.8)] pointer-events-none z-10"
          style={{ left: `${sliderPos}%` }}
        >
          {/* Circular Handle */}
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#0d121a] border-2 border-[#00d2be] flex items-center justify-center text-xs font-bold text-[#00d2be] shadow-xl group-hover:scale-110 transition-transform">
            <span>⇄</span>
          </div>
        </div>

        {/* Label badges */}
        <div className="absolute bottom-3 left-3 bg-[#0d121a]/85 border border-[#28364a] backdrop-blur-sm text-xs px-2.5 py-1 rounded-md text-[#00d2be] font-bold z-20 pointer-events-none">
          ◀ {afterLabel}
        </div>
        <div className="absolute bottom-3 right-3 bg-[#0d121a]/85 border border-[#28364a] backdrop-blur-sm text-xs px-2.5 py-1 rounded-md text-[#ff6b35] font-bold z-20 pointer-events-none">
          {beforeLabel} ▶
        </div>
      </div>

      {/* Accessible range slider underneath */}
      <div className="flex items-center gap-3 px-1 mt-1">
        <span className="text-[11px] font-medium text-[#8e9fb5] shrink-0">
          {afterLabel}
        </span>
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPos}
          onChange={(e) => setSliderPos(Number(e.target.value))}
          className="w-full h-1.5 bg-[#0f1520] rounded-lg appearance-none cursor-pointer accent-[#00d2be]"
        />
        <span className="text-[11px] font-medium text-[#8e9fb5] shrink-0">
          {beforeLabel}
        </span>
      </div>
    </div>
  );
}
