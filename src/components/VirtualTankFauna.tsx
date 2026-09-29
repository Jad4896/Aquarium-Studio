"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Livestock } from "@/types";
import {
  X,
  Trash2,
  Plus,
  Sparkles,
  Info,
  Waves,
  Loader2,
  Fish,
  AlertCircle,
  Camera,
  Upload,
  EyeOff,
} from "lucide-react";

import {
  toggleLivestockInVirtualTank,
  removeLivestockFromVirtualTank,
  getCachedSpriteUrl,
  setCachedSpriteUrl,
  clearCachedSpriteUrl,
  requestFishSprite,
  getSessilePosition,
  setSessilePosition,
  SessilePosition,
} from "@/lib/virtualFaunaStorage";


/* ========================================================================= */
/* BIOLOGICAL ARCHETYPE & RESIDENCE ZONE CLASSIFIER                          */
/* ========================================================================= */

export type FaunaArchetype =
  | "sessile"
  | "goby"
  | "urchin"
  | "hermit_crab"
  | "snail"
  | "shrimp"
  | "clownfish"
  | "tang"
  | "tetra"
  | "corydoras"
  | "swimmer";

export interface ResolvedFaunaData {
  archetype: FaunaArchetype;
  residenceLabel: string;
  behaviorNote: string;
  topPct: string;
  leftPct: string;
  scale: number;
  animClass: string;
  flipClass: string;
  delaySec: string;
}

export function getLivestockArchetype(
  item: { name?: string; species?: string; category?: string; zone?: string },
  index: number = 0,
  formFactor: string = "standard"
): ResolvedFaunaData {
  const name = (item.name || "").toLowerCase();
  const species = (item.species || "").toLowerCase();

  const isNano = formFactor === "nano_cube";
  const slotOffset = (index * 23) % 60;

  // 0. Stationary / Sessile Organisms (Clams, Feather Duster Worms, Tube Worms, Sponges)
  const isClam =
    name.includes("clam") ||
    species.includes("tridacna") ||
    species.includes("hippopus") ||
    name.includes("derasa") ||
    name.includes("maxima") ||
    name.includes("crocea") ||
    name.includes("squamosa") ||
    name.includes("gigas") ||
    name.includes("scallop") ||
    name.includes("bivalve");

  const isTubeWorm =
    name.includes("feather duster") ||
    name.includes("feather-duster") ||
    name.includes("duster") ||
    name.includes("tube worm") ||
    name.includes("tubeworm") ||
    name.includes("fan worm") ||
    name.includes("coco worm") ||
    name.includes("christmas tree worm") ||
    species.includes("sabellastarte") ||
    species.includes("bispira") ||
    species.includes("protula") ||
    species.includes("serpula") ||
    species.includes("spirobranchus");

  const isStationary =
    isClam ||
    isTubeWorm ||
    name.includes("sponge") ||
    species.includes("porifera") ||
    name.includes("sessile") ||
    name.includes("stationary");

  if (isStationary) {
    const isWorm = isTubeWorm;
    return {
      archetype: "sessile",
      residenceLabel: isWorm ? "Live Rock Crevice (Anchored)" : "Sandbed / Rock Base (Stationary)",
      behaviorNote: isWorm
        ? "Stationary filter feeder anchored in rock crevice, gently rhythmically expanding feather crown."
        : "Stationary bivalve anchored to substrate or rockwork, gently siphoning and basking in reef lighting.",
      topPct: isWorm ? (isNano ? "72%" : "75%") : (isNano ? "81%" : "84%"),
      leftPct: `${14 + slotOffset * 0.7}%`,
      scale: isWorm ? 0.9 : 0.95,
      animClass: "anim-zone-sessile",
      flipClass: "",
      delaySec: `${(index * 1.8).toFixed(1)}s`,
    };
  }

  if (
    name.includes("urchin") ||
    species.includes("mespilia") ||
    species.includes("lytechinus") ||
    species.includes("diadema") ||
    species.includes("echinometra")
  ) {
    return {
      archetype: "urchin",
      residenceLabel: "Sandbed & Lower Glass Surface",
      behaviorNote: "Creeps very slowly across the substrate and climbs the glass/rock surface grazing on microalgae.",
      topPct: isNano ? "81%" : "83%",
      leftPct: `${12 + slotOffset * 0.7}%`,
      scale: 0.95,
      animClass: "anim-zone-urchin",
      flipClass: "anim-flip-urchin",
      delaySec: `${(index * 4.5).toFixed(1)}s`,
    };
  }

  if (
    name.includes("hermit") ||
    name.includes("crab") ||
    species.includes("clibanarius") ||
    species.includes("calcinus") ||
    species.includes("mithraculus")
  ) {
    return {
      archetype: "hermit_crab",
      residenceLabel: "Sandbed Substrate",
      behaviorNote: "Scuttles across the bottom sandbed, occasionally pausing to pick at detritus.",
      topPct: isNano ? "84%" : "86%",
      leftPct: `${15 + slotOffset * 0.65}%`,
      scale: 0.9,
      animClass: "anim-zone-hermit",
      flipClass: "anim-flip-hermit",
      delaySec: `${(index * 3.2).toFixed(1)}s`,
    };
  }

  if (
    name.includes("snail") ||
    name.includes("trochus") ||
    name.includes("turbo") ||
    name.includes("nerite") ||
    name.includes("nassarius") ||
    name.includes("cerith") ||
    name.includes("conch") ||
    species.includes("trochus") ||
    species.includes("turbo") ||
    species.includes("neritina")
  ) {
    return {
      archetype: "snail",
      residenceLabel: "Substrate & Glass Seam",
      behaviorNote: "Glides at an ultra-slow, peaceful pace along the sandbed and glass.",
      topPct: isNano ? "83%" : "85%",
      leftPct: `${10 + slotOffset * 0.75}%`,
      scale: 0.85,
      animClass: "anim-zone-snail",
      flipClass: "anim-flip-snail",
      delaySec: `${(index * 5.0).toFixed(1)}s`,
    };
  }

  if (
    name.includes("goby") ||
    name.includes("blenny") ||
    name.includes("dartfish") ||
    name.includes("jawfish") ||
    species.includes("gobiodon") ||
    species.includes("cryptocentrus") ||
    species.includes("ecsenius")
  ) {
    return {
      archetype: "goby",
      residenceLabel: "Sandbed / Lower Rock Shelf",
      behaviorNote: "Perches on the rockwork or sandbed, making sudden quick hops.",
      topPct: isNano ? "72%" : "76%",
      leftPct: `${8 + slotOffset * 0.8}%`,
      scale: 0.92,
      animClass: "anim-zone-goby",
      flipClass: "anim-flip-goby",
      delaySec: `${(index * 2.8).toFixed(1)}s`,
    };
  }

  if (
    name.includes("shrimp") ||
    species.includes("lysmata") ||
    species.includes("alpheus") ||
    species.includes("caridina") ||
    species.includes("neocaridina")
  ) {
    return {
      archetype: "shrimp",
      residenceLabel: "Rock Crevice Shelter",
      behaviorNote: "Stations itself near lower rock crevices with rhythmically swaying antennae.",
      topPct: isNano ? "74%" : "78%",
      leftPct: `${5 + slotOffset * 0.6}%`,
      scale: 0.88,
      animClass: "anim-zone-shrimp",
      flipClass: "anim-flip-shrimp",
      delaySec: `${(index * 3.6).toFixed(1)}s`,
    };
  }

  if (
    name.includes("clown") ||
    name.includes("ocellaris") ||
    name.includes("percula") ||
    species.includes("amphiprion") ||
    species.includes("premnas")
  ) {
    return {
      archetype: "clownfish",
      residenceLabel: "Mid-to-Lower Column / Anemone",
      behaviorNote: "Waddles with a distinctive undulating pattern, staying close to its host anemone.",
      topPct: isNano ? "40%" : "44%",
      leftPct: `${20 + slotOffset * 0.5}%`,
      scale: 1.0,
      animClass: "anim-zone-clownfish",
      flipClass: "anim-flip-clownfish",
      delaySec: `${(index * 2.0).toFixed(1)}s`,
    };
  }

  if (
    name.includes("tang") ||
    name.includes("surgeonfish") ||
    name.includes("angel") ||
    name.includes("chromis") ||
    species.includes("zebrasoma") ||
    species.includes("acanthurus") ||
    species.includes("paracanthurus")
  ) {
    return {
      archetype: "tang",
      residenceLabel: "Open Water Column",
      behaviorNote: "Cruises actively across the open water in fluid, sweeping movements.",
      topPct: isNano ? "30%" : "35%",
      leftPct: `${25 + slotOffset * 0.45}%`,
      scale: 1.05,
      animClass: "anim-zone-tang",
      flipClass: "anim-flip-tang",
      delaySec: `${(index * 1.8).toFixed(1)}s`,
    };
  }

  if (
    name.includes("tetra") ||
    name.includes("rasbora") ||
    name.includes("danio") ||
    name.includes("barb") ||
    species.includes("paracheirodon") ||
    species.includes("hyphessobrycon")
  ) {
    return {
      archetype: "tetra",
      residenceLabel: "Open Mid-Water Column",
      behaviorNote: "Moves in tight, synchronized schooling formations through mid-water.",
      topPct: `${35 + (index % 3) * 8}%`,
      leftPct: `${15 + slotOffset * 0.5}%`,
      scale: 0.85,
      animClass: "anim-zone-schooling",
      flipClass: "anim-flip-schooling",
      delaySec: `${(index * 1.5).toFixed(1)}s`,
    };
  }

  if (
    name.includes("cory") ||
    name.includes("corydoras") ||
    name.includes("otocinclus") ||
    name.includes("pleco") ||
    name.includes("loach")
  ) {
    return {
      archetype: "corydoras",
      residenceLabel: "Substrate Bottom",
      behaviorNote: "Forages methodically along the substrate.",
      topPct: isNano ? "80%" : "82%",
      leftPct: `${10 + slotOffset * 0.7}%`,
      scale: 0.9,
      animClass: "anim-zone-bottom",
      flipClass: "anim-flip-bottom",
      delaySec: `${(index * 3.0).toFixed(1)}s`,
    };
  }

  return {
    archetype: "swimmer",
    residenceLabel: "Mid-Water Column",
    behaviorNote: "Swims gracefully through the mid-water column.",
    topPct: `${38 + (index % 4) * 7}%`,
    leftPct: `${20 + slotOffset * 0.5}%`,
    scale: 0.95,
    animClass: "anim-zone-clownfish",
    flipClass: "anim-flip-clownfish",
    delaySec: `${(index * 2.2).toFixed(1)}s`,
  };
}

/* ========================================================================= */
/* SPRITE STATE HOOK — handles loading, success, and failure                  */
/* ========================================================================= */

type SpriteStatus = "loading" | "ready" | "failed";

export function useFishSprite(item: Livestock): {
  url: string | null;
  status: SpriteStatus;
  isVerified: boolean;
} {
  const initUrl = getCachedSpriteUrl(item.id) || null;
  const [url, setUrl] = useState<string | null>(initUrl);
  const [status, setStatus] = useState<SpriteStatus>(initUrl ? "ready" : "loading");

  useEffect(() => {
    // Listen for async resolution events from the storage layer
    const handleReady = (e: Event) => {
      const ce = e as CustomEvent<{ livestockId: string; url: string }>;
      if (ce.detail?.livestockId === item.id) {
        setUrl(ce.detail.url);
        setStatus("ready");
      }
    };
    const handleFailed = (e: Event) => {
      const ce = e as CustomEvent<{ livestockId: string }>;
      if (ce.detail?.livestockId === item.id) {
        setStatus("failed");
      }
    };
    window.addEventListener("virtual-tank-sprite-ready", handleReady);
    window.addEventListener("virtual-tank-sprite-failed", handleFailed);
    return () => {
      window.removeEventListener("virtual-tank-sprite-ready", handleReady);
      window.removeEventListener("virtual-tank-sprite-failed", handleFailed);
    };
  }, [item.id]);

  useEffect(() => {
    // Kick off generation if we don't already have a URL
    if (!url) {
      setStatus("loading");
      requestFishSprite({
        id: item.id,
        name: item.name,
        species: item.species,
        category: item.category,
        primaryPhotoUrl: item.primaryPhotoUrl,
      }).then((resolved) => {
        if (resolved) {
          setUrl(resolved);
          setStatus("ready");
        } else {
          setStatus("failed");
        }
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);

  return { url, status, isVerified: status === "ready" && Boolean(url) };
}


/* ========================================================================= */
/* FISH SPRITE IMAGE (used in modal preview)                                  */
/* ========================================================================= */

function FishSpritePhoto({ item, size = 80 }: { item: Livestock; size?: number }) {
  const { url, status } = useFishSprite(item);

  if (status === "loading") {
    return (
      <div
        style={{ width: size, height: size * 0.65 }}
        className="flex items-center justify-center rounded-lg animate-pulse bg-white/5"
      >
        <Loader2 size={size * 0.25} className="text-[#00d2be]/50 animate-spin" />
      </div>
    );
  }

  if (status === "failed" || !url) {
    return (
      <div
        style={{ width: size, height: size * 0.65, fontSize: size * 0.4 }}
        className="flex items-center justify-center opacity-50"
        title="No image found for this species"
      >
        <Fish size={size * 0.4} className="text-[#8e9fb5]" />
      </div>
    );
  }

  return (
    <div style={{ width: size, height: size * 0.65, position: "relative" }}>
      <Image
        src={url}
        alt={item.name}
        fill
        sizes={`${size}px`}
        className="object-contain"
        style={{ filter: "drop-shadow(0 3px 8px rgba(0,0,0,0.6))" }}
      />
    </div>
  );
}

/* ========================================================================= */
/* VIRTUAL LIVESTOCK ITEM (rendered inside the 3D tank viewport)             */
/* ========================================================================= */

interface VirtualLivestockItemProps {
  item: Livestock;
  index: number;
  formFactor: string;
  tankId?: string;
  onRemove: (id: string) => void;
}

export function VirtualLivestockItem({
  item,
  index,
  formFactor,
  tankId,
  onRemove,
}: VirtualLivestockItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { url: spriteUrl, status } = useFishSprite(item);
  const data = getLivestockArchetype(item, index, formFactor);
  const spriteW = formFactor === "nano_cube" ? 72 : 100;
  const isSessile = data.archetype === "sessile";

  // Stored custom position for sessile / stationary organisms (persists per tank & specimen)
  const [customPos, setCustomPos] = useState<SessilePosition | null>(() => {
    if (!tankId || !isSessile) return null;
    return getSessilePosition(tankId, item.id);
  });

  useEffect(() => {
    if (tankId && isSessile) {
      setCustomPos(getSessilePosition(tankId, item.id));
    }
  }, [tankId, item.id, isSessile]);

  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const hasMovedRef = useRef(false);
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isSessile) return;
    if (e.button !== 0) return; // Only primary mouse click
    e.stopPropagation();

    const parent = containerRef.current?.parentElement;
    if (!parent) return;

    const pointerId = e.pointerId;
    startPosRef.current = { x: e.clientX, y: e.clientY };
    hasMovedRef.current = false;
    isDraggingRef.current = false;

    // Use pointer capture so all moves and release belong to this element
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(pointerId);
    } catch {}

    const handlePointerMove = (moveEv: PointerEvent) => {
      if (moveEv.pointerId !== pointerId) return;
      const dx = moveEv.clientX - startPosRef.current.x;
      const dy = moveEv.clientY - startPosRef.current.y;

      // Click-and-hold threshold: only activate drag mode when cursor moves 5+ px
      if (!hasMovedRef.current && Math.hypot(dx, dy) >= 5) {
        hasMovedRef.current = true;
        isDraggingRef.current = true;
        setIsDragging(true);
      }

      if (hasMovedRef.current) {
        const rect = parent.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const rawLeft = ((moveEv.clientX - rect.left) / rect.width) * 100;
          const rawTop = ((moveEv.clientY - rect.top) / rect.height) * 100;
          const clampedLeft = Math.max(2, Math.min(94, rawLeft));
          const clampedTop = Math.max(6, Math.min(92, rawTop));
          setCustomPos({ leftPct: clampedLeft, topPct: clampedTop });
        }
      }
    };

    const handlePointerUp = (upEv: PointerEvent) => {
      if (upEv.pointerId !== pointerId) return;

      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);

      try {
        if (containerRef.current?.hasPointerCapture(pointerId)) {
          containerRef.current.releasePointerCapture(pointerId);
        }
      } catch {}

      // UNCONDITIONALLY exit dragging state on mouse release
      setIsDragging(false);
      isDraggingRef.current = false;

      // If user dragged, fix and persist final position where mouse was released
      if (hasMovedRef.current) {
        const rect = parent.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const rawLeft = ((upEv.clientX - rect.left) / rect.width) * 100;
          const rawTop = ((upEv.clientY - rect.top) / rect.height) * 100;
          const clampedLeft = Math.max(2, Math.min(94, rawLeft));
          const clampedTop = Math.max(6, Math.min(92, rawTop));
          const finalPos: SessilePosition = { leftPct: clampedLeft, topPct: clampedTop };
          setCustomPos(finalPos);
          if (tankId) {
            setSessilePosition(tankId, item.id, finalPos);
          }
        }
      }

      // Reset moved ref after micro-delay so handleClick doesn't trigger pinned toggle
      setTimeout(() => {
        hasMovedRef.current = false;
      }, 80);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasMovedRef.current || isDraggingRef.current) return;
    setIsPinned((prev) => !prev);
  };

  const topPct = customPos ? `${customPos.topPct.toFixed(2)}%` : data.topPct;
  const leftPct = customPos ? `${customPos.leftPct.toFixed(2)}%` : data.leftPct;
  const showTag = isHovered || isPinned || isDragging;

  return (
    // Outer container: For sessile organisms, supports click-and-hold drag-and-place with persistence.
    // For swimming organisms, smoothly translated across the tank via data.animClass.
    <div
      ref={containerRef}
      draggable={false}
      onDragStart={(e) => e.preventDefault()}
      className={`absolute select-none pointer-events-auto ${
        isDragging ? "" : data.animClass
      } group/creature transition-[z-index] ${
        isDragging
          ? "z-[80] cursor-grabbing"
          : isSessile
          ? "cursor-grab active:cursor-grabbing"
          : "cursor-pointer"
      } ${
        isDragging
          ? "z-[80]"
          : isHovered
          ? "z-[60]"
          : isPinned
          ? "z-50"
          : "z-20"
      }`}
      style={{
        top: topPct,
        left: leftPct,
        animationDelay: data.delaySec,
        touchAction: isSessile ? "none" : "auto",
        userSelect: "none",
      }}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        if (!isDragging) setIsHovered(false);
      }}
    >
      {/* Visual Placement Target Ring while dragging */}
      {isDragging && (
        <div className="absolute -inset-3 rounded-full border-2 border-dashed border-[#00d2be] animate-pulse pointer-events-none shadow-[0_0_20px_rgba(0,210,190,0.7)] bg-[#00d2be]/10 -z-10" />
      )}

      {/* Centered Name Tag directly on top of the sprite — moves with the creature, never flips */}
      <div
        className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 transition-all duration-200 pointer-events-none ${
          showTag
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-1 pointer-events-none"
        }`}
      >
        <div className="bg-[#0b1019]/98 border border-[#00d2be]/70 px-3 py-1.5 rounded-xl shadow-[0_10px_35px_rgba(0,0,0,0.9)] backdrop-blur-xl whitespace-nowrap flex items-center gap-2">
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#f0f4f8]">{item.name}</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#00d2be]/15 text-[#00d2be] font-bold uppercase tracking-wider border border-[#00d2be]/30">
                {data.archetype.replace("_", " ")}
              </span>
              {isSessile && (
                <span
                  className={`text-[8px] px-1.5 py-0.2 rounded-full font-bold border transition-all ${
                    isDragging
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse"
                      : "bg-white/10 text-[#00d2be] border-[#00d2be]/30"
                  }`}
                >
                  {isDragging ? "📍 Dragging... (release to place)" : "✋ Click & Hold to Drag"}
                </span>
              )}
            </div>
            <span className="text-[10px] text-[#8e9fb5] italic">
              {item.species || data.residenceLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Sprite Scale & Flip Wrapper: ONLY the sprite image is flipped when turning direction */}
      <div
        style={{
          transform: `scale(${data.scale})`,
        }}
      >
        <div
          className={`${data.flipClass} flex items-center justify-center`}
          style={{
            animationDelay: data.delaySec,
          }}
        >
          {status === "loading" ? (
            <div
              style={{ width: spriteW, height: spriteW * 0.65 }}
              className="flex items-center justify-center animate-pulse"
            >
              <Loader2 size={18} className="text-[#00d2be]/60 animate-spin" />
            </div>
          ) : spriteUrl ? (
            <div
              style={{ width: spriteW, height: spriteW * 0.65, position: "relative" }}
              className="drop-shadow-[0_5px_16px_rgba(0,0,0,0.7)]"
            >
              <Image
                src={spriteUrl}
                alt={item.name}
                fill
                draggable={false}
                sizes={`${spriteW}px`}
                className="object-contain pointer-events-none select-none"
                style={{ filter: "drop-shadow(0 2px 6px rgba(0,210,190,0.25))" }}
              />
            </div>
          ) : (
            <div
              style={{ width: spriteW, height: spriteW * 0.65, fontSize: spriteW * 0.45 }}
              className="flex items-center justify-center opacity-40"
            >
              🐠
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


/* ========================================================================= */
/* SPRITE BADGE — reactive badge shown in modal rows                          */
/* ========================================================================= */

function SpriteBadge({ livestockId }: { livestockId: string }) {
  const [state, setState] = useState<"loading" | "ready" | "failed">(() => {
    const cached = getCachedSpriteUrl(livestockId);
    return cached ? "ready" : "loading";
  });

  useEffect(() => {
    const handleReady = (e: Event) => {
      const ce = e as CustomEvent<{ livestockId: string }>;
      if (ce.detail?.livestockId === livestockId) setState("ready");
    };
    const handleFailed = (e: Event) => {
      const ce = e as CustomEvent<{ livestockId: string }>;
      if (ce.detail?.livestockId === livestockId) setState("failed");
    };
    window.addEventListener("virtual-tank-sprite-ready", handleReady);
    window.addEventListener("virtual-tank-sprite-failed", handleFailed);
    return () => {
      window.removeEventListener("virtual-tank-sprite-ready", handleReady);
      window.removeEventListener("virtual-tank-sprite-failed", handleFailed);
    };
  }, [livestockId]);

  if (state === "ready") {
    return (
      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 shrink-0 flex items-center gap-1 font-semibold">
        <Sparkles size={8} /> Verified Intact
      </span>
    );
  }
  if (state === "failed") {
    return (
      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-rose-950/40 text-rose-400/90 border border-rose-900/40 shrink-0 flex items-center gap-1">
        <AlertCircle size={8} /> Unverified / Needs Photo
      </span>
    );
  }
  return (
    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-950/40 text-amber-400 border border-amber-500/30 shrink-0 flex items-center gap-1">
      <Loader2 size={8} className="animate-spin" /> Cross-referencing & Verifying…
    </span>
  );
}

/* Row component for inhabitants in modal with real-time verification gating */
function InhabitantRow({
  item,
  index,
  formFactor,
  isActive,
  onToggle,
  onDelete,
}: {
  item: Livestock;
  index: number;
  formFactor: string;
  isActive: boolean;
  onToggle: (id: string) => void;
  onDelete?: (id: string) => Promise<void> | void;
}) {
  const { status, isVerified } = useFishSprite(item);
  const data = getLivestockArchetype(item, index, formFactor);
  const [isUploading, setIsUploading] = useState(false);

  const handleCustomPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const upRes = await fetch("/api/upload", { method: "POST", body: fd });
      const upData = await upRes.json();
      if (upData?.url) {
        // Save as primary photo for this specimen in the database
        await fetch(`/api/livestock/${item.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "set_primary_media",
            url: upData.url,
            mediaType: "image",
          }),
        });
        // Clear previous sprite cache for this specimen
        clearCachedSpriteUrl(item.id);
        // Kick off background-removed sprite generation with the user's photo
        requestFishSprite({
          id: item.id,
          name: item.name,
          species: item.species,
          category: item.category,
          primaryPhotoUrl: upData.url,
        });
      }
    } catch (err) {
      console.error("Direct photo upload failed:", err);
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl border transition-all ${
        isActive
          ? "bg-[#141e2d] border-[#00d2be]/50 shadow-md"
          : "bg-[#0f1520] border-[#28364a] hover:border-[#3a4c66]"
      }`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Sprite Preview */}
        <div className="w-20 h-14 rounded-xl bg-[#090d14] border border-[#28364a] flex items-center justify-center p-1.5 shrink-0 overflow-hidden shadow-inner">
          <FishSpritePhoto item={item} size={68} />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold text-sm text-[#f0f4f8] truncate">{item.name}</h4>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00d2be]/15 text-[#00d2be] border border-[#00d2be]/30 uppercase shrink-0">
              {data.archetype.replace("_", " ")}
            </span>
            {/* Reactive badge */}
            <SpriteBadge livestockId={item.id} />
          </div>
          <p className="text-xs text-[#8e9fb5] truncate italic">
            {item.species || "Species recorded"}
          </p>
          <div className="flex items-center gap-2 mt-1 text-[10px] text-[#8e9fb5]">
            <span className="text-[#00d2be] font-semibold">📍 {data.residenceLabel}</span>
            <span className="text-white/20">•</span>
            <span className="truncate max-w-[280px]">{data.behaviorNote}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto w-full sm:w-auto justify-end flex-wrap">
        {/* Direct Upload Custom Photo Button */}
        <label
          className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
            isUploading
              ? "bg-[#161e2b] text-[#8e9fb5] border-[#28364a] opacity-60 cursor-wait"
              : "bg-[#161e2b] hover:bg-[#202b3d] text-[#8e9fb5] hover:text-[#00d2be] border-[#28364a] hover:border-[#00d2be]/40 cursor-pointer"
          }`}
          title="Upload your own photo of this specimen to create its sprite"
        >
          {isUploading ? (
            <Loader2 size={13} className="animate-spin text-[#00d2be]" />
          ) : (
            <Camera size={13} />
          )}
          <span>{isUploading ? "Processing…" : "Upload Photo"}</span>
          <input
            type="file"
            accept="image/*"
            disabled={isUploading}
            className="hidden"
            onChange={handleCustomPhotoUpload}
          />
        </label>

        {/* Action Button: GATED — user can only add once sprite is verified intact! */}
        {isActive ? (
          <button
            type="button"
            onClick={() => onToggle(item.id)}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            title="Hide specimen from 3D Virtual Tank view (moves to Available list)"
          >
            <EyeOff size={13} /> Remove from 3D
          </button>
        ) : isVerified ? (
          <button
            type="button"
            onClick={() => onToggle(item.id)}
            className="px-3.5 py-1.5 rounded-xl bg-[#00d2be]/15 hover:bg-[#00d2be] text-[#00d2be] hover:text-[#0d121a] border border-[#00d2be]/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            title="Sprite verified intact! Click to add specimen to the Virtual Tank."
          >
            <Plus size={13} /> Add to Virtual Tank
          </button>
        ) : status === "loading" ? (
          <button
            type="button"
            disabled
            className="px-3.5 py-1.5 rounded-xl bg-[#161e2b] text-[#8e9fb5] border border-[#28364a] text-xs font-semibold flex items-center gap-1.5 cursor-not-allowed opacity-75 shadow-sm"
            title="Cross-referencing and verifying sprite quality before enabling addition"
          >
            <Loader2 size={13} className="animate-spin text-[#00d2be]" />
            <span>Verifying Sprite...</span>
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="px-3.5 py-1.5 rounded-xl bg-[#161e2b] text-rose-300/60 border border-rose-900/30 text-xs font-semibold flex items-center gap-1.5 cursor-not-allowed opacity-70 shadow-sm"
            title="Sprite could not be confirmed intact. Use 'Upload Photo' to provide a clear photo."
          >
            <AlertCircle size={13} />
            <span>Sprite Unverified</span>
          </button>
        )}

        {/* Permanent Delete Button: completely removes from database & list */}
        {onDelete && (
          <button
            type="button"
            onClick={async (e) => {
              e.stopPropagation();
              if (
                window.confirm(
                  `Permanently delete "${item.name}" from your aquarium records? This will delete the specimen completely from the virtual tank and livestock vault.`
                )
              ) {
                await onDelete(item.id);
              }
            }}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 hover:border-rose-500/60 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-sm shrink-0"
            title={`Permanently delete "${item.name}" from aquarium records completely`}
          >
            <Trash2 size={13} />
            <span className="hidden sm:inline">Delete</span>
          </button>
        )}
      </div>
    </div>
  );
}



/* ========================================================================= */
/* VIRTUAL TANK INHABITANTS MANAGER MODAL                                    */
/* ========================================================================= */

interface InhabitantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tankId: string;
  formFactor: string;
  allLivestock: Livestock[];
  activeIds: string[];
  onToggleInhabitant: (id: string) => void;
  onDeleteInhabitant?: (id: string) => Promise<void> | void;
  onOpenVault?: () => void;
}

export function VirtualTankInhabitantsModal({
  isOpen,
  onClose,
  tankId,
  formFactor,
  allLivestock,
  activeIds,
  onToggleInhabitant,
  onDeleteInhabitant,
  onOpenVault,
}: InhabitantsModalProps) {
  const [filter, setFilter] = useState<"all" | "active" | "available">("all");

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const eligibleLivestock = allLivestock.filter((l) => l.type === "FISH_INVERT" || !l.type);
  const filteredList = eligibleLivestock.filter((item) => {
    const isActive = activeIds.includes(item.id);
    if (filter === "active") return isActive;
    if (filter === "available") return !isActive;
    return true;
  });

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-[#121824] border border-[#28364a] rounded-2xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#28364a] bg-[#0d121a]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#00d2be]/15 border border-[#00d2be]/40 flex items-center justify-center text-[#00d2be] shadow-inner">
              <Waves size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#f0f4f8] flex items-center gap-2">
                Virtual Tank Inhabitants
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-[#00d2be]/15 text-[#00d2be] border border-[#00d2be]/30">
                  {activeIds.length} Active
                </span>
              </h3>
              <p className="text-xs text-[#8e9fb5] mt-0.5">
                Photos sourced from Wikipedia &amp; iNaturalist. Your uploaded photos are used when available.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8e9fb5] hover:text-[#f0f4f8] hover:bg-[#1a2332] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-between gap-2 px-4 sm:px-5 py-2.5 border-b border-[#28364a]/60 bg-[#0f1520]">
          <div className="flex items-center gap-1.5">
            {(["all", "active", "available"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer capitalize ${
                  filter === f
                    ? "bg-[#00d2be] text-[#0d121a]"
                    : "bg-[#161e2b] text-[#8e9fb5] hover:text-[#f0f4f8]"
                }`}
              >
                {f === "all" && `All (${eligibleLivestock.length})`}
                {f === "active" && `Active (${activeIds.length})`}
                {f === "available" && `Available (${eligibleLivestock.length - activeIds.length})`}
              </button>
            ))}
          </div>
          {onOpenVault && (
            <button
              onClick={() => { onClose(); onOpenVault(); }}
              className="text-xs text-[#00d2be] hover:underline font-semibold cursor-pointer shrink-0"
            >
              + Log New Livestock
            </button>
          )}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {filteredList.length === 0 ? (
            <div className="text-center py-12 px-4 bg-[#0d121a] border border-dashed border-[#28364a] rounded-xl">
              <Waves size={32} className="mx-auto text-[#8e9fb5]/40 mb-2" />
              <p className="text-sm font-semibold text-[#f0f4f8]">No livestock found</p>
              <p className="text-xs text-[#8e9fb5] mt-1 max-w-sm mx-auto">
                {eligibleLivestock.length === 0
                  ? "Add fish & invertebrates in the Fish Vault to populate your virtual tank."
                  : "No livestock matching the selected filter."}
              </p>
              {onOpenVault && eligibleLivestock.length === 0 && (
                <button
                  onClick={() => { onClose(); onOpenVault(); }}
                  className="mt-3.5 px-4 py-2 rounded-xl bg-[#00d2be] text-[#0d121a] font-bold text-xs hover:bg-[#14ebd7] transition-all cursor-pointer shadow-md inline-flex items-center gap-1.5"
                >
                  <Plus size={14} /> Go to Fish Vault
                </button>
              )}
            </div>
          ) : (
            filteredList.map((item, idx) => (
              <InhabitantRow
                key={item.id}
                item={item}
                index={idx}
                formFactor={formFactor}
                isActive={activeIds.includes(item.id)}
                onToggle={onToggleInhabitant}
                onDelete={onDeleteInhabitant}
              />
            ))
          )}

        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-[#28364a] bg-[#0d121a] flex items-center justify-between">
          <span className="text-[11px] text-[#8e9fb5] flex items-center gap-1.5">
            <Info size={12} className="text-[#00d2be]" />
            Photos sourced from Wikipedia &amp; iNaturalist. Upload your own photo in the Fish Vault for best results.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#161e2b] hover:bg-[#202b3d] text-[#f0f4f8] text-xs font-semibold border border-[#28364a] transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
