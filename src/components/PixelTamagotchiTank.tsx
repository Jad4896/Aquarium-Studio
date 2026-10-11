"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Tank, Livestock } from "@/types";
import {
  Sparkles,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Brush,
  Heart,
  RotateCcw,
} from "lucide-react";

interface Props {
  tank: Tank;
  activeLivestock: Livestock[];
  onOpenFaunaModal?: () => void;
  className?: string;
}

interface FoodPellet {
  id: number;
  x: number;
  y: number;
  vy: number;
  vx: number;
  color: string;
  eaten: boolean;
}

interface FloatingParticle {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
  vx: number;
}

interface Bubble {
  x: number;
  y: number;
  radius: number;
  vy: number;
  wobbleSpeed: number;
  wobbleAmp: number;
  time: number;
}

interface FishEntity {
  id: string;
  name: string;
  spriteUrl: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  vx: number;
  vy: number;
  facing: number; // 1 = right, -1 = left
  tailWiggle: number;
  width: number;
  height: number;
  isBottomDweller: boolean;
  hunger: number;
  happiness: number;
  celebrating: number; // frames left of happy dance
}

// Map species or names to curated transparent pixel art sprites
function getPixelSpriteForLivestock(item: Livestock, isFreshwater: boolean): string {
  const name = (item.name || "").toLowerCase();
  const species = (item.species || "").toLowerCase();
  const combined = `${name} ${species}`;

  if (combined.includes("clownfish") || combined.includes("ocellaris") || combined.includes("percula")) {
    return "/aquariums/clownfish_pixel.png";
  }
  if (combined.includes("blue tang") || combined.includes("hippo tang") || combined.includes("regal tang") || combined.includes("hepatus")) {
    return "/aquariums/blue_tang_pixel.png";
  }
  if (combined.includes("yellow tang") || combined.includes("flavescens")) {
    return "/aquariums/yellow_tang_pixel.png";
  }
  if (combined.includes("royal gramma") || combined.includes("gramma loreto")) {
    return "/aquariums/royal_gramma_pixel.png";
  }
  if (combined.includes("flame angel") || combined.includes("loriculus")) {
    return "/aquariums/flame_angel_pixel.png";
  }
  if (combined.includes("cherry shrimp") || combined.includes("neocaridina") || (isFreshwater && combined.includes("shrimp"))) {
    return "/aquariums/cherry_shrimp_pixel.png";
  }
  if (combined.includes("shrimp") || combined.includes("cleaner") || combined.includes("amboinensis")) {
    return "/aquariums/cleaner_shrimp_pixel.png";
  }
  if (combined.includes("snail") || combined.includes("turbo") || combined.includes("trochus") || combined.includes("nerite") || combined.includes("urchin")) {
    return "/aquariums/turbo_snail_pixel.png";
  }
  if (combined.includes("tetra") || combined.includes("neon") || combined.includes("cardinal") || combined.includes("paracheirodon")) {
    return "/aquariums/neon_tetra_pixel.png";
  }

  // Fallback defaults
  if (isFreshwater) {
    return "/aquariums/neon_tetra_pixel.png";
  }
  return "/aquariums/clownfish_pixel.png";
}

// Synthesize pleasant 8-bit retro sound chimes with Web Audio API (zero audio files needed)
function playRetroChime(type: "eat" | "happy" | "feed" | "clean") {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === "eat") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else if (type === "happy") {
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C E G C
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.06);
        gain.gain.setValueAtTime(0.07, ctx.currentTime + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.06);
        osc.stop(ctx.currentTime + i * 0.06 + 0.15);
      });
    } else if (type === "feed") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(480, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    }
  } catch {
    // Audio context suppressed by browser policy
  }
}

export default function PixelTamagotchiTank({
  tank,
  activeLivestock = [],
  onOpenFaunaModal,
  className = "",
}: Props) {
  const isFreshwater = tank.tankType === "FRESHWATER";
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mini-game state
  const [actinicMode, setActinicMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [tankMood, setTankMood] = useState<"Thriving & Happy" | "Hungry" | "Playful">("Thriving & Happy");
  const [hungerLevel, setHungerLevel] = useState(30); // 0 (full) to 100 (starving)
  const [algaeLevel, setAlgaeLevel] = useState(15); // 0 (spotless) to 100 (needs cleaning)
  const [isCleaning, setIsCleaning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Entities & Animation Refs
  const fishEntitiesRef = useRef<FishEntity[]>([]);
  const foodPelletsRef = useRef<FoodPellet[]>([]);
  const particlesRef = useRef<FloatingParticle[]>([]);
  const bubblesRef = useRef<Bubble[]>([]);
  const loadedSpritesRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const bgImageRef = useRef<HTMLImageElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const nextPelletIdRef = useRef<number>(1);
  const nextParticleIdRef = useRef<number>(1);

  // Preload Background Image
  useEffect(() => {
    const bg = new Image();
    bg.src = isFreshwater
      ? "/aquariums/pixel_planted_tank.jpg"
      : "/aquariums/pixel_reef_tank.jpg";
    bg.onload = () => {
      bgImageRef.current = bg;
    };
  }, [isFreshwater]);

  // Sync Fish Entities with active livestock
  useEffect(() => {
    // If no livestock assigned yet, populate with friendly default pixel starters
    const sourceLivestock: Array<Partial<Livestock>> =
      activeLivestock.length > 0
        ? activeLivestock
        : isFreshwater
        ? [
            { id: "starter_fw_1", name: "Neon Tetra", species: "Paracheirodon innesi" },
            { id: "starter_fw_2", name: "Cardinal Tetra", species: "Paracheirodon axelrodi" },
            { id: "starter_fw_3", name: "Cherry Shrimp", species: "Neocaridina davidi" },
          ]
        : [
            { id: "starter_sw_1", name: "Ocellaris Clownfish", species: "Amphiprion ocellaris" },
            { id: "starter_sw_2", name: "Royal Blue Tang", species: "Paracanthurus hepatus" },
            { id: "starter_sw_3", name: "Yellow Tang", species: "Zebrasoma flavescens" },
            { id: "starter_sw_4", name: "Royal Gramma", species: "Gramma loreto" },
          ];

    const existingMap = new Map(fishEntitiesRef.current.map((f) => [f.id, f]));
    const newEntities: FishEntity[] = [];

    sourceLivestock.forEach((item, idx) => {
      const id = item.id || `fish_${idx}`;
      const spriteUrl = getPixelSpriteForLivestock(item as Livestock, isFreshwater);

      // Preload sprite image
      if (!loadedSpritesRef.current.has(spriteUrl)) {
        const img = new Image();
        img.src = spriteUrl;
        img.onload = () => {
          loadedSpritesRef.current.set(spriteUrl, img);
        };
      }

      const isBottom =
        (item.name || "").toLowerCase().includes("shrimp") ||
        (item.name || "").toLowerCase().includes("snail") ||
        (item.name || "").toLowerCase().includes("crab");

      if (existingMap.has(id)) {
        const prev = existingMap.get(id)!;
        newEntities.push({
          ...prev,
          name: item.name || "Aquatic Pet",
          spriteUrl,
          isBottomDweller: isBottom,
        });
      } else {
        const startX = 100 + (idx * 160) % 650;
        const startY = isBottom ? 360 + (idx % 3) * 20 : 120 + (idx * 70) % 240;

        newEntities.push({
          id,
          name: item.name || "Aquatic Pet",
          spriteUrl,
          x: startX,
          y: startY,
          targetX: startX,
          targetY: startY,
          speed: 0.55 + Math.random() * 0.35,
          vx: (Math.random() > 0.5 ? 1 : -1) * (0.45 + Math.random() * 0.3),
          vy: (Math.random() - 0.5) * 0.2,
          facing: Math.random() > 0.5 ? 1 : -1,
          tailWiggle: Math.random() * 10,
          width: isBottom ? 42 : 58,
          height: isBottom ? 34 : 40,
          isBottomDweller: isBottom,
          hunger: 30,
          happiness: 95,
          celebrating: 0,
        });
      }
    });

    fishEntitiesRef.current = newEntities;
  }, [activeLivestock, isFreshwater]);

  // Initialize rising ambient air bubbles
  useEffect(() => {
    const bubbles: Bubble[] = [];
    const count = 18;
    for (let i = 0; i < count; i++) {
      bubbles.push({
        x: 80 + Math.random() * 740,
        y: Math.random() * 450,
        radius: 1.5 + Math.random() * 2.5,
        vy: 0.8 + Math.random() * 1.2,
        wobbleSpeed: 2 + Math.random() * 3,
        wobbleAmp: 0.6 + Math.random() * 1.2,
        time: Math.random() * 10,
      });
    }
    bubblesRef.current = bubbles;
  }, []);

  // Drop food pellets
  const dropFood = useCallback(
    (originX?: number, originY?: number) => {
      const dropX = originX ?? 200 + Math.random() * 450;
      const dropY = originY ?? 60;

      const colors = ["#f59e0b", "#f97316", "#ef4444", "#fbbf24"];
      const newPellets: FoodPellet[] = [
        {
          id: nextPelletIdRef.current++,
          x: dropX - 10 + Math.random() * 20,
          y: dropY,
          vy: 0.28 + Math.random() * 0.18, // Slow, realistic gentle floating drift
          vx: (Math.random() - 0.5) * 0.15,
          color: colors[Math.floor(Math.random() * colors.length)],
          eaten: false,
        },
        {
          id: nextPelletIdRef.current++,
          x: dropX - 25 + Math.random() * 50,
          y: dropY + 5,
          vy: 0.24 + Math.random() * 0.15, // Slow, realistic gentle floating drift
          vx: (Math.random() - 0.5) * 0.15,
          color: colors[Math.floor(Math.random() * colors.length)],
          eaten: false,
        },
      ];

      foodPelletsRef.current.push(...newPellets);
      if (soundEnabled) playRetroChime("feed");

      // Spawn food splash particle
      particlesRef.current.push({
        id: nextParticleIdRef.current++,
        x: dropX,
        y: dropY + 10,
        text: "🍖 Flakes!",
        color: "#fbbf24",
        alpha: 1.0,
        vy: -1.0,
        vx: 0,
      });

      // Boost hunger status
      setHungerLevel((prev) => Math.max(0, prev - 15));
      setTankMood("Playful");
    },
    [soundEnabled]
  );

  // Track currently hovered fish for pausing & persistent inspection tag
  const [hoveredFishId, setHoveredFishId] = useState<string | null>(null);
  const hoveredFishIdRef = useRef<string | null>(null);

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    let targetFish: FishEntity | null = null;
    for (const fish of fishEntitiesRef.current) {
      const dx = Math.abs(fish.x - mouseX);
      const dy = Math.abs(fish.y - mouseY);
      // Comfortable hover inspection hit-box
      if (dx < fish.width * 0.9 && dy < fish.height * 0.9) {
        targetFish = fish;
        break;
      }
    }

    const nextId = targetFish ? targetFish.id : null;
    if (nextId !== hoveredFishIdRef.current) {
      hoveredFishIdRef.current = nextId;
      setHoveredFishId(nextId);
    }
  };

  const handleCanvasMouseLeave = () => {
    hoveredFishIdRef.current = null;
    setHoveredFishId(null);
  };

  // Tap fish to interact & pet
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Check if clicked directly on a fish
    let clickedFish: FishEntity | null = null;
    for (const fish of fishEntitiesRef.current) {
      const dx = Math.abs(fish.x - clickX);
      const dy = Math.abs(fish.y - clickY);
      if (dx < fish.width * 0.9 && dy < fish.height * 0.9) {
        clickedFish = fish;
        break;
      }
    }

    if (clickedFish) {
      // Petting / interacting with fish
      clickedFish.celebrating = 30; // gentle happy wiggle
      clickedFish.vy = -0.5; // gentle, relaxed upward nudge
      clickedFish.happiness = Math.min(100, clickedFish.happiness + 10);

      particlesRef.current.push({
        id: nextParticleIdRef.current++,
        x: clickedFish.x,
        y: clickedFish.y - 20,
        text: "❤️ Loving!",
        color: "#f43f5e",
        alpha: 1.0,
        vy: -1.4,
        vx: (Math.random() - 0.5) * 0.6,
      });

      if (soundEnabled) playRetroChime("happy");
      setTankMood("Thriving & Happy");
    } else {
      // Clicked on water -> Drop food at coordinates!
      dropFood(clickX, clickY);
    }
  };

  // Glass Cleaning tool
  const handleCleanGlass = () => {
    setIsCleaning(true);
    setAlgaeLevel(0);
    if (soundEnabled) playRetroChime("clean");

    particlesRef.current.push({
      id: nextParticleIdRef.current++,
      x: 440,
      y: 200,
      text: "✨ 100% Spotless Glass!",
      color: "#00d2be",
      alpha: 1.0,
      vy: -1.2,
      vx: 0,
    });

    setTimeout(() => {
      setIsCleaning(false);
    }, 1200);
  };

  // Keyboard shortcut: Press 'F' to feed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "f" || e.key === "F") {
        dropFood();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dropFood]);

  // Main 60FPS Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fixed internal pixel resolution for crisp 16:9 pixel scaling
    const W = 880;
    const H = 495;
    canvas.width = W;
    canvas.height = H;

    let frameCount = 0;

    const render = () => {
      frameCount++;
      ctx.clearRect(0, 0, W, H);

      // ── 1. DRAW PIXEL BACKGROUND ──────────────────────────────────────────
      if (bgImageRef.current && bgImageRef.current.complete) {
        ctx.drawImage(bgImageRef.current, 0, 0, W, H);
      } else {
        // Fallback procedural retro gradient
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, "#0369a1");
        grad.addColorStop(0.7, "#0c4a6e");
        grad.addColorStop(1, "#082f49");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
      }

      // ── 2. ACTINIC NIGHT / DAY SHADER WITH CORAL GLOW ─────────────────────
      if (actinicMode) {
        ctx.save();
        // Deep mysterious moonlight oceanic wash
        ctx.fillStyle = "rgba(8, 14, 52, 0.52)";
        ctx.fillRect(0, 0, W, H);

        // Bioluminescent blue/violet actinic wash
        ctx.fillStyle = "rgba(30, 64, 175, 0.18)";
        ctx.fillRect(0, 0, W, H);

        // Soft, faint bioluminescent coral glowing clusters at bottom reef structure
        const coralGlows = [
          { x: 190, y: 340, radius: 95, color: "rgba(0, 245, 196, 0.16)" }, // Glowing turquoise SPS / Acropora
          { x: 340, y: 375, radius: 85, color: "rgba(168, 85, 247, 0.16)" }, // Glowing neon purple / Zoanthids
          { x: 460, y: 350, radius: 100, color: "rgba(236, 72, 153, 0.15)" }, // Glowing vibrant pink Chalice / Euphyllia
          { x: 620, y: 330, radius: 90, color: "rgba(56, 189, 248, 0.16)" }, // Glowing electric blue Torch / Goniopora
          { x: 730, y: 380, radius: 80, color: "rgba(74, 222, 128, 0.14)" }, // Glowing radioactive green GSP / Brain coral
        ];

        // Soft pulsating shimmer using sine cycle
        const glowPulse = 0.85 + Math.sin(frameCount * 0.04) * 0.15;

        for (const g of coralGlows) {
          const radial = ctx.createRadialGradient(g.x, g.y, 8, g.x, g.y, g.radius * glowPulse);
          radial.addColorStop(0, g.color);
          radial.addColorStop(0.5, g.color.replace(/[\d\.]+\)$/, "0.08)"));
          radial.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = radial;
          ctx.beginPath();
          ctx.arc(g.x, g.y, g.radius * glowPulse, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      // ── 3. DRAW RISING PIXEL BUBBLES ──────────────────────────────────────
      ctx.save();
      ctx.fillStyle = actinicMode ? "rgba(0, 210, 255, 0.45)" : "rgba(255, 255, 255, 0.55)";
      for (const b of bubblesRef.current) {
        b.time += 0.05;
        b.y -= b.vy;
        b.x += Math.sin(b.time * b.wobbleSpeed) * (b.wobbleAmp * 0.4);

        if (b.y < 45) {
          b.y = H - 50;
          b.x = 80 + Math.random() * 720;
        }

        // Draw crisp pixel bubble
        const bx = Math.round(b.x);
        const by = Math.round(b.y);
        ctx.fillRect(bx, by, Math.round(b.radius * 2), Math.round(b.radius * 2));
      }
      ctx.restore();

      // ── 4. UPDATE & DRAW FOOD PELLETS ─────────────────────────────────────
      const activeFood = foodPelletsRef.current.filter((p) => !p.eaten && p.y < H - 55);
      ctx.save();
      for (const pellet of activeFood) {
        pellet.y += pellet.vy;
        pellet.x += pellet.vx;

        // Draw cute square pixel pellet
        const px = Math.round(pellet.x);
        const py = Math.round(pellet.y);
        ctx.fillStyle = pellet.color;
        ctx.fillRect(px, py, 4, 4);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(px, py, 1, 1);
      }
      foodPelletsRef.current = activeFood;
      ctx.restore();

      // ── 5. UPDATE & DRAW FISH ENTITIES ────────────────────────────────────
      const fishes = fishEntitiesRef.current;
      for (const fish of fishes) {
        fish.tailWiggle += 0.15;

        // Hunt closest food pellet if hungry
        let nearestFood: FoodPellet | null = null;
        let minDist = 350;

        for (const pellet of activeFood) {
          const dist = Math.hypot(pellet.x - fish.x, pellet.y - fish.y);
          if (dist < minDist) {
            minDist = dist;
            nearestFood = pellet;
          }
        }

        // Check if currently hovered by mouse for inspection
        const isHovered = hoveredFishIdRef.current === fish.id;

        if (isHovered) {
          // PAUSE IN THEIR TRACKS FOR INSPECTION
          // Very gentle micro-hover in place, no translational movement
          fish.vx = 0;
          fish.vy = 0;
          fish.tailWiggle += 0.05; // Gentle fin flutter while paused
        } else if (nearestFood) {
          // Gently drift toward food
          const angle = Math.atan2(nearestFood.y - fish.y, nearestFood.x - fish.x);
          const chaseSpeed = fish.speed * 1.15; // Smooth relaxed glide toward food
          fish.vx = Math.cos(angle) * chaseSpeed;
          fish.vy = Math.sin(angle) * chaseSpeed;
          fish.facing = fish.vx >= 0 ? 1 : -1;

          // Eat food collision
          if (minDist < 18) {
            nearestFood.eaten = true;
            fish.hunger = Math.max(0, fish.hunger - 25);
            fish.happiness = Math.min(100, fish.happiness + 8);
            fish.celebrating = 20;
            // No vertical jump - maintain gentle swimming momentum
            fish.vy = (Math.random() - 0.5) * 0.2;

            if (soundEnabled) playRetroChime("eat");

            particlesRef.current.push({
              id: nextParticleIdRef.current++,
              x: fish.x,
              y: fish.y - 15,
              text: "❤️ Yum!",
              color: "#fbbf24",
              alpha: 1.0,
              vy: -0.8,
              vx: (Math.random() - 0.5) * 0.3,
            });
          }
        } else {
          // Normal ambient wandering behavior
          if (fish.celebrating > 0) {
            fish.celebrating--;
            // Subtle tail wiggle, no crazy gravity leaps
          } else {
            // Smooth occasional gentle direction change
            if (frameCount % 120 === 0 && Math.random() < 0.35) {
              fish.vx = (Math.random() > 0.5 ? 1 : -1) * (0.35 + Math.random() * 0.35);
              fish.vy = (Math.random() - 0.5) * 0.2;
            }
          }

          fish.facing = fish.vx >= 0 ? 1 : -1;

          // Tank bounds collision bouncing
          const leftBound = 90;
          const rightBound = W - 110;
          const topBound = fish.isBottomDweller ? 340 : 80;
          const bottomBound = H - 70;

          if (fish.x < leftBound) {
            fish.x = leftBound;
            fish.vx = Math.abs(fish.vx);
          } else if (fish.x > rightBound) {
            fish.x = rightBound;
            fish.vx = -Math.abs(fish.vx);
          }

          if (fish.y < topBound) {
            fish.y = topBound;
            fish.vy = Math.abs(fish.vy);
          } else if (fish.y > bottomBound) {
            fish.y = bottomBound;
            fish.vy = -Math.abs(fish.vy);
          }

          // Enforce facing matches horizontal travel direction
          if (Math.abs(fish.vx) > 0.01) {
            fish.facing = fish.vx >= 0 ? 1 : -1;
          }
        }

        if (!isHovered) {
          fish.x += fish.vx;
          fish.y += fish.vy;
        }

        // ── RENDER FISH SPRITE ───────────────────────────────────────────────
        ctx.save();
        const drawX = Math.round(fish.x);
        const drawY = Math.round(fish.y + Math.sin(fish.tailWiggle) * (isHovered ? 1.0 : 2.2));

        ctx.translate(drawX, drawY);

        // Flip horizontally based on facing direction
        if (fish.facing === -1) {
          ctx.scale(-1, 1);
        }

        // Slight playful wiggle rotation
        const wiggleAngle = Math.sin(fish.tailWiggle) * (isHovered ? 0.03 : 0.06);
        ctx.rotate(wiggleAngle);

        const spriteImg = loadedSpritesRef.current.get(fish.spriteUrl);
        if (spriteImg && spriteImg.complete) {
          // Nearest neighbor pixel art rendering
          ctx.imageSmoothingEnabled = false;

          // Glowing aura under sprite if inspected
          if (isHovered) {
            ctx.shadowColor = "#00d2be";
            ctx.shadowBlur = 12;
          }

          ctx.drawImage(
            spriteImg,
            -fish.width / 2,
            -fish.height / 2,
            fish.width,
            fish.height
          );
        } else {
          // Fallback cute pixel fish geometry
          ctx.fillStyle = fish.isBottomDweller ? "#e11d48" : "#f97316";
          ctx.fillRect(-fish.width / 2, -fish.height / 2, fish.width, fish.height);
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(fish.width / 4, -fish.height / 4, 4, 4);
          ctx.fillStyle = "#000000";
          ctx.fillRect(fish.width / 4 + 1, -fish.height / 4 + 1, 2, 2);
        }

        ctx.restore();

        // ── PERSISTENT INSPECTION BADGE ON HOVER (Doesn't flash away) ─────────
        if (isHovered) {
          ctx.save();
          const badgeY = Math.max(35, drawY - 32);
          ctx.font = "bold 11px monospace";
          const nameMetrics = ctx.measureText(fish.name);
          const badgeWidth = Math.max(90, nameMetrics.width + 20);
          const badgeHeight = 22;
          const badgeX = drawX - badgeWidth / 2;

          // Rounded retro pixel pill badge
          ctx.fillStyle = "rgba(11, 16, 25, 0.92)";
          ctx.strokeStyle = "#00d2be";
          ctx.lineWidth = 1.5;
          ctx.shadowColor = "rgba(0, 210, 190, 0.5)";
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.roundRect(badgeX, badgeY - 14, badgeWidth, badgeHeight, 6);
          ctx.fill();
          ctx.stroke();

          // Sub-indicator caret pointing to fish
          ctx.fillStyle = "#00d2be";
          ctx.beginPath();
          ctx.moveTo(drawX - 5, badgeY + 8);
          ctx.lineTo(drawX + 5, badgeY + 8);
          ctx.lineTo(drawX, badgeY + 13);
          ctx.closePath();
          ctx.fill();

          // Title text
          ctx.shadowBlur = 0;
          ctx.fillStyle = "#ffffff";
          ctx.textAlign = "center";
          ctx.fillText(`🔍 ${fish.name}`, drawX, badgeY + 1);

          ctx.restore();
        } else if (fish.celebrating > 0) {
          // Little floating name tag on celebration
          ctx.save();
          ctx.font = "bold 9px monospace";
          ctx.fillStyle = "#00d2be";
          ctx.textAlign = "center";
          ctx.fillText(fish.name, drawX, drawY - 26);
          ctx.restore();
        }
      }

      // ── 6. DRAW FLOATING PARTICLES (HEARTS, TEXT) ─────────────────────────
      ctx.save();
      const nextParticles: FloatingParticle[] = [];
      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.022;

        if (p.alpha > 0.05) {
          ctx.font = "bold 12px monospace";
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.textAlign = "center";
          ctx.fillText(p.text, Math.round(p.x), Math.round(p.y));
          nextParticles.push(p);
        }
      }
      particlesRef.current = nextParticles;
      ctx.restore();

      // ── 7. ALGAE GLASS TINT OVERLAY ───────────────────────────────────────
      if (algaeLevel > 0) {
        ctx.save();
        ctx.fillStyle = `rgba(34, 197, 94, ${(algaeLevel / 100) * 0.18})`;
        ctx.fillRect(60, 50, W - 120, H - 100);
        ctx.restore();
      }

      // ── 8. RETRO PIXEL GLASS FRAME SHINE ──────────────────────────────────
      ctx.save();
      // Glass edge highlights
      ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
      ctx.lineWidth = 2;
      ctx.strokeRect(60, 45, W - 120, H - 90);

      // Angled surface reflection sheen
      const sheenGrad = ctx.createLinearGradient(60, 45, W - 60, H - 45);
      sheenGrad.addColorStop(0, "rgba(255, 255, 255, 0.08)");
      sheenGrad.addColorStop(0.3, "rgba(255, 255, 255, 0.0)");
      sheenGrad.addColorStop(0.7, "rgba(255, 255, 255, 0.04)");
      sheenGrad.addColorStop(1, "rgba(255, 255, 255, 0.0)");
      ctx.fillStyle = sheenGrad;
      ctx.fillRect(60, 45, W - 120, H - 90);
      ctx.restore();

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [actinicMode, algaeLevel, soundEnabled]);

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden bg-[#0a0f18] border border-[#28364a] shadow-2xl flex flex-col ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none border-none" : ""
      } ${className}`}
    >
      {/* ── TOP HUD / TAMAGOTCHI CONTROLS ───────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-[#0f1520]/90 backdrop-blur-md border-b border-[#28364a] text-xs z-10">
        {/* Left: Mood & Hunger status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#00d2be]/10 border border-[#00d2be]/30 text-[#00d2be] font-bold">
            <Heart size={13} className="fill-[#00d2be] animate-pulse" />
            <span>Vibe: {100 - hungerLevel}%</span>
          </div>

          <span className="hidden sm:inline-block text-[#8e9fb5] text-[11px]">
            Mood: <strong className="text-[#f0f4f8]">{tankMood}</strong>
          </span>

          {algaeLevel > 30 && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-bounce">
              Algae on Glass!
            </span>
          )}
        </div>

        {/* Right: Interactive Tools (Feed, Clean, Day/Night, Sound, Fauna) */}
        <div className="flex items-center gap-1.5">
          {/* Feed Button */}
          <button
            onClick={() => dropFood()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer text-xs"
            title="Drop food flakes into the tank (or press 'F')"
          >
            <span>🍖</span>
            <span>Feed [F]</span>
          </button>

          {/* Clean Glass Button */}
          <button
            onClick={handleCleanGlass}
            disabled={isCleaning}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
              isCleaning
                ? "bg-[#00d2be]/20 text-[#00d2be] border-[#00d2be]"
                : "bg-[#161e2b] text-[#8e9fb5] border-[#28364a] hover:text-[#00d2be] hover:border-[#00d2be]/40"
            }`}
            title="Wipe down the tank glass with a sponge"
          >
            <Brush size={13} />
            <span className="hidden sm:inline">Clean Glass</span>
          </button>

          {/* Actinic / Daylight Lighting Mode */}
          <button
            onClick={() => setActinicMode((prev) => !prev)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
              actinicMode
                ? "bg-indigo-600/30 text-indigo-300 border-indigo-500/50 shadow-[0_0_12px_rgba(99,102,241,0.3)]"
                : "bg-[#161e2b] text-amber-300 border-[#28364a] hover:border-amber-400/40"
            }`}
            title={actinicMode ? "Switch to Daytime Sunlight" : "Switch to Actinic Night Glow"}
          >
            {actinicMode ? <Moon size={13} /> : <Sun size={13} />}
            <span className="hidden md:inline">{actinicMode ? "Actinic Glow" : "Daylight"}</span>
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={() => setSoundEnabled((prev) => !prev)}
            className="p-1.5 rounded-lg bg-[#161e2b] border border-[#28364a] text-[#8e9fb5] hover:text-[#00d2be] transition-all cursor-pointer"
            title={soundEnabled ? "Mute Retro Chimes" : "Enable Retro Chimes"}
          >
            {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen((prev) => !prev)}
            className="p-1.5 rounded-lg bg-[#161e2b] border border-[#28364a] text-[#8e9fb5] hover:text-[#00d2be] transition-all cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Pixel Aquarium"}
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>
      </div>

      {/* ── CANVAS SIMULATION VIEWPORT ──────────────────────────────────── */}
      <div className="relative w-full aspect-[16/9] flex items-center justify-center bg-black overflow-hidden select-none">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={handleCanvasMouseLeave}
          className="w-full h-full object-contain cursor-crosshair [image-rendering:pixelated] [image-rendering:crisp-edges]"
          title="Click to drop flakes, or hover a fish to inspect and pause it!"
        />

        {/* Feeding Hint Pill */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[11px] text-[#8e9fb5] flex items-center gap-1.5 shadow-lg">
          <Sparkles size={11} className="text-[#00d2be]" />
          <span>Click anywhere to drop food • Tap a fish to pet</span>
        </div>
      </div>
    </div>
  );
}
