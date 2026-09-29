/**
 * Procedural Aquarium Generator Engine
 * Generates deterministic 3D aquarium visuals, lighting profiles,
 * and distinct representations for every style and size tier.
 */

import { Tank } from "@/types";

export type FormFactorType = "nano_cube" | "standard" | "panoramic" | "nano_rectangular";
export type TankStyleKey =
  | "mixed"
  | "lagoon"
  | "sps"
  | "nature"
  | "iwagumi"
  | "emerald"
  | "zen";

export interface FaunaItem {
  id: string;
  type: "clownfish" | "blue_tang" | "neon_tetra" | "cherry_shrimp";
  src: string;
  alt: string;
  animClass: string;
  bodyAnimClass: string;
  top: string;
  left?: string;
  right?: string;
  bottom?: string;
  scale: number;
  opacity: number;
  styleOverrides?: React.CSSProperties;
}

export interface BubbleStream {
  position: "left" | "right" | "center-right";
  opacity: number;
  scale: number;
}

export interface ProceduralAquarium {
  archetypeId: string;
  archetypeName: string;
  bgImage: string;
  lightingLabel: string;
  waterFilter: string;
  waterTintGradient: string;
  causticsOpacity: number;
  fauna: FaunaItem[];
  bubbles: BubbleStream;
  coralHotspot: { top?: string; bottom?: string; left?: string; right?: string };
  fishHotspot: { top?: string; bottom?: string; left?: string; right?: string };
  formFactor: FormFactorType;
  formFactorLabel: string;
  displayVolumeLiters: number;
  sumpVolumeLiters: number;
  totalVolumeLiters: number;
  hasSump: boolean;
  sumpChambers: number;
  sumpEquipment: string;
  sumpMedia: string;
  hasRefugium: boolean;
  refugiumVolumeLiters: number;
  refugiumType: string;
  refugiumLighting: string;
  containerMaxWidth: string;
  viewportHeightClass: string;
  aspectRatioClass: string;
  fixtureType: "single_pendant" | "dual_puck" | "full_rail" | "multi_cluster";
}

// Deterministic string hash algorithm
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(hash);
}

export interface TankArchetypeDef {
  id: string;
  name: string;
  bgImage: string;
  coralHotspot: { top?: string; bottom?: string; left?: string; right?: string };
  fishHotspot: { top?: string; bottom?: string; left?: string; right?: string };
  lightingOptions: string[];
}

/**
 * Matrix of distinct presets for every style and size tier.
 * Saltwater:
 *  - Mixed Reef: Nano Cube, Rectangular, Wide Peninsula
 *  - Lagoon Tank: Rectangular, Wide Peninsula
 *  - Actinic SPS: Nano Cube, Rectangular, Wide Peninsula
 * Freshwater:
 *  - Driftwood Nature: Nano Cube, Rectangular, Wide Peninsula
 *  - Iwagumi Stones: Nano Cube, Rectangular, Wide Peninsula
 *  - Dutch Stem Garden: Nano Cube, Rectangular, Wide Peninsula
 */
export const ARCHETYPE_CATALOG: Record<string, TankArchetypeDef> = {
  // --- SALTWATER: MIXED REEF ---
  "mixed_nano_cube": {
    id: "mixed_nano_cube",
    name: "Nano Cube Mixed Reef",
    bgImage: "/aquariums/nano_cube_reef.jpg",
    coralHotspot: { bottom: "24%", left: "32%" },
    fishHotspot: { top: "28%", right: "26%" },
    lightingOptions: [
      "AI Prime 16HD Gooseneck Spotlight (18,000K)",
      "Kessil A80 Tuna Blue Micro Pendant",
      "Aqua Illumination Blade Coral Glow",
    ],
  },
  "mixed_standard": {
    id: "mixed_standard",
    name: "Rectangular Rimless Mixed Reef",
    bgImage: "/aquariums/reef_tank_clean_v2.jpg",
    coralHotspot: { bottom: "30%", left: "28%" },
    fishHotspot: { top: "36%", right: "28%" },
    lightingOptions: [
      "Radion G6 Pro Actinic Spectrum (18,000K)",
      "EcoTech XR15 Blue Coralline Photoperiod",
      "Kessil A360X Deep Sea Blue Penetration",
    ],
  },
  "mixed_panoramic": {
    id: "mixed_panoramic",
    name: "Wide Peninsula Mixed Reef",
    bgImage: "/aquariums/peninsula_reef.jpg",
    coralHotspot: { bottom: "26%", left: "34%" },
    fishHotspot: { top: "34%", right: "22%" },
    lightingOptions: [
      "Triple Radion G6 XR30 High-Intensity Linear Array",
      "Orphek Atlantik iCon Linear Suspended Rail",
      "ATI Straton Pro Triple Multi-Matrix",
    ],
  },

  // --- SALTWATER: LAGOON REEF (Rectangular and Wide Peninsula) ---
  "lagoon_standard": {
    id: "lagoon_standard",
    name: "Rectangular Shallow Lagoon",
    bgImage: "/aquariums/lagoon_reef_clean_v2.jpg",
    coralHotspot: { bottom: "28%", left: "32%" },
    fishHotspot: { top: "38%", right: "32%" },
    lightingOptions: [
      "AI Prime 16HD Shallow Lagoon (14,000K)",
      "Kessil Tuna Blue Crisp Turquoise Reef",
      "Giesemann Aurora Actinic Hybrid",
    ],
  },
  "lagoon_panoramic": {
    id: "lagoon_panoramic",
    name: "Wide Peninsula Shallow Lagoon",
    bgImage: "/aquariums/peninsula_lagoon.jpg",
    coralHotspot: { bottom: "28%", left: "34%" },
    fishHotspot: { top: "32%", right: "26%" },
    lightingOptions: [
      "Dual Kessil A360X Shallow Shimmer (14,000K)",
      "Radion XR30 Wide Lagoon Photoperiod",
      "Orphek OR3 Reef Day Plus Linear Bar",
    ],
  },
  // Lagoon fallback for cube if chosen
  "lagoon_nano_cube": {
    id: "lagoon_nano_cube",
    name: "Nano Cube Lagoon Reef",
    bgImage: "/aquariums/lagoon_reef_clean_v2.jpg",
    coralHotspot: { bottom: "28%", left: "32%" },
    fishHotspot: { top: "38%", right: "32%" },
    lightingOptions: ["AI Prime 16HD Shallow Lagoon (14,000K)"],
  },

  // --- SALTWATER: ACTINIC SPS ---
  "sps_nano_cube": {
    id: "sps_nano_cube",
    name: "Nano Cube Actinic SPS",
    bgImage: "/aquariums/nano_cube_sps.jpg",
    coralHotspot: { bottom: "24%", left: "32%" },
    fishHotspot: { top: "28%", right: "24%" },
    lightingOptions: [
      "AI Prime 16HD Actinic SPS (20,000K)",
      "Kessil A160WE Deep Ocean Blue",
      "Radion XR15 Pro High-PAR",
    ],
  },
  "sps_standard": {
    id: "sps_standard",
    name: "Rectangular Deep Actinic SPS",
    bgImage: "/aquariums/sps_reef_clean_v2.jpg",
    coralHotspot: { bottom: "32%", left: "34%" },
    fishHotspot: { top: "42%", right: "26%" },
    lightingOptions: [
      "ATI Straton Pro High-PAR SPS Matrix (20,000K)",
      "Radion G6 XR30 Deep Actinic Violet",
      "Orphek Atlantik V4 Ultra Violet Coralline",
    ],
  },
  "sps_panoramic": {
    id: "sps_panoramic",
    name: "Wide Peninsula Actinic SPS",
    bgImage: "/aquariums/peninsula_sps.jpg",
    coralHotspot: { bottom: "28%", left: "32%" },
    fishHotspot: { top: "34%", right: "22%" },
    lightingOptions: [
      "Quad Radion G6 XR30 Deep SPS Array",
      "ATI Sunpower T5 / LED Actinic Hybrid",
      "Orphek Atlantik iCon Duo High-PAR",
    ],
  },

  // --- FRESHWATER: DRIFTWOOD NATURE ---
  "nature_nano_cube": {
    id: "nature_nano_cube",
    name: "Nano Cube Nature Driftwood",
    bgImage: "/aquariums/nano_cube_driftwood.jpg",
    coralHotspot: { bottom: "26%", left: "30%" },
    fishHotspot: { top: "30%", right: "26%" },
    lightingOptions: [
      "Chihiros C2 RGB Nano Gooseneck",
      "ONF Flat Nano Full-Spectrum",
      "Twinstar B-Line Nano",
    ],
  },
  "nature_standard": {
    id: "nature_standard",
    name: "Rectangular Nature Driftwood",
    bgImage: "/aquariums/planted_tank_clean_v2.jpg",
    coralHotspot: { bottom: "32%", left: "30%" },
    fishHotspot: { top: "42%", right: "28%" },
    lightingOptions: [
      "ADA Solar RGB Full-Spectrum WRGB (8,000K)",
      "Chihiros Vivid II High-PAR Aquascape",
      "Twinstar S-Line High-Tech Planted",
    ],
  },
  "nature_panoramic": {
    id: "nature_panoramic",
    name: "Wide Peninsula Nature Driftwood",
    bgImage: "/aquariums/peninsula_planted.jpg",
    coralHotspot: { bottom: "26%", left: "34%" },
    fishHotspot: { top: "34%", right: "22%" },
    lightingOptions: [
      "Twin ADA Solar RGB Hanging Rails (8,500K)",
      "Chihiros WRGB II Pro Dual Linear System",
      "Twinstar 1200S High-Tech Suspended Matrix",
    ],
  },

  // --- FRESHWATER: IWAGUMI STONES ---
  "iwagumi_nano_cube": {
    id: "iwagumi_nano_cube",
    name: "Nano Cube Iwagumi Stones",
    bgImage: "/aquariums/nano_cube_iwagumi.jpg",
    coralHotspot: { bottom: "24%", left: "30%" },
    fishHotspot: { top: "30%", right: "28%" },
    lightingOptions: [
      "ADA Aquasky G Crisp White Sunlight (7,000K)",
      "Chihiros C2 RGB Nano",
      "Twinstar C-Line 300C",
    ],
  },
  "iwagumi_standard": {
    id: "iwagumi_standard",
    name: "Rectangular Iwagumi Stones",
    bgImage: "/aquariums/iwagumi_tank_clean_v2.jpg",
    coralHotspot: { bottom: "28%", left: "26%" },
    fishHotspot: { top: "36%", right: "36%" },
    lightingOptions: [
      "ADA Aquasky RGB Nature (7,500K)",
      "Chihiros WRGB II Slim Nature Sunrise/Sunset",
      "Fluval Plant 3.0 Alpine Mountain",
    ],
  },
  "iwagumi_panoramic": {
    id: "iwagumi_panoramic",
    name: "Wide Peninsula Iwagumi Stones",
    bgImage: "/aquariums/peninsula_iwagumi.jpg",
    coralHotspot: { bottom: "28%", left: "30%" },
    fishHotspot: { top: "32%", right: "25%" },
    lightingOptions: [
      "Dual ADA Solar RGB Pendants (7,500K)",
      "Chihiros WRGB II Pro 120cm",
      "Twinstar 900SA High-PAR Mountain Sunlight",
    ],
  },

  // --- FRESHWATER: DUTCH STEM GARDEN ---
  "emerald_nano_cube": {
    id: "emerald_nano_cube",
    name: "Nano Cube Dutch Stem Garden",
    bgImage: "/aquariums/nano_cube_dutch.jpg",
    coralHotspot: { bottom: "26%", left: "30%" },
    fishHotspot: { top: "30%", right: "26%" },
    lightingOptions: [
      "Chihiros WRGB II Nano Vivid Red",
      "Week Aqua Pandora RGB Nano",
      "Twinstar 300SM Vivid Planted",
    ],
  },
  "emerald_standard": {
    id: "emerald_standard",
    name: "Rectangular Dutch Stem Garden",
    bgImage: "/aquariums/dutch_garden_clean.jpg",
    coralHotspot: { bottom: "34%", left: "28%" },
    fishHotspot: { top: "46%", right: "24%" },
    lightingOptions: [
      "ADA Solar RGB Full-Spectrum WRGB (8,000K)",
      "Chihiros Universal WRGB Deep Emerald",
      "Week Aqua T90 Pro Vivid Planted",
    ],
  },
  "emerald_panoramic": {
    id: "emerald_panoramic",
    name: "Wide Peninsula Dutch Stem Garden",
    bgImage: "/aquariums/peninsula_dutch.jpg",
    coralHotspot: { bottom: "26%", left: "32%" },
    fishHotspot: { top: "32%", right: "22%" },
    lightingOptions: [
      "Dual Week Aqua L-Series High-Tech WRGB",
      "Chihiros WRGB II Pro Dual System",
      "ADA Solar RGB Twin Hanging Grid",
    ],
  },

  // --- FRESHWATER: ZEN BONSAI (Special Centerpiece) ---
  "zen_nano_cube": {
    id: "zen_nano_cube",
    name: "Zen Bonsai Moss Tree Centerpiece",
    bgImage: "/aquariums/nano_cube_planted.jpg",
    coralHotspot: { bottom: "24%", left: "32%" },
    fishHotspot: { top: "28%", right: "26%" },
    lightingOptions: [
      "Chihiros C2 RGB Nano Gooseneck Spotlight",
      "ONF Flat Nano Full-Spectrum Pendant",
      "Twinstar B-Line Nano Clamp Light",
    ],
  },
  "zen_standard": {
    id: "zen_standard",
    name: "Rectangular Zen Bonsai Aquascape",
    bgImage: "/aquariums/planted_tank_clean_v2.jpg",
    coralHotspot: { bottom: "32%", left: "30%" },
    fishHotspot: { top: "42%", right: "28%" },
    lightingOptions: ["ADA Solar RGB Full-Spectrum WRGB (8,000K)"],
  },
  "zen_panoramic": {
    id: "zen_panoramic",
    name: "Wide Peninsula Zen Driftwood",
    bgImage: "/aquariums/peninsula_planted.jpg",
    coralHotspot: { bottom: "26%", left: "34%" },
    fishHotspot: { top: "34%", right: "22%" },
    lightingOptions: ["Twin ADA Solar RGB Hanging Rails (8,500K)"],
  },
};

/**
 * Generate deterministic aquarium visual representation from a Tank entity.
 * Directly maps (aquascapeStyle + formFactor) to its exact dedicated 3D render.
 */
export function generateProceduralAquarium(tank: Tank): ProceduralAquarium {
  const isFreshwater = tank.tankType === "FRESHWATER";

  // Volume & Sump resolution
  const hasSump = Boolean(tank.hasSump);
  const totalVol = Number(tank.volumeLiters) || (isFreshwater ? 60 : 90);
  const displayVol =
    Number(tank.displayVolumeLiters) ||
    (hasSump ? Math.max(15, totalVol - (Number(tank.sumpVolumeLiters) || 0)) : totalVol);
  const sumpVol = hasSump ? Number(tank.sumpVolumeLiters) || Math.max(0, totalVol - displayVol) : 0;

  // 1. Resolve Style
  const rawStyle = (tank.aquascapeStyle || "").toLowerCase().trim();
  const rawName = (tank.name || "").toLowerCase().trim();
  const rawPurpose = (tank.purpose || "").toLowerCase().trim();

  let resolvedStyle: TankStyleKey = isFreshwater ? "nature" : "mixed";

  if (isFreshwater) {
    if (
      rawStyle === "zen" ||
      rawStyle === "bonsai" ||
      rawName.includes("zen") ||
      rawName.includes("bonsai") ||
      rawPurpose.includes("zen") ||
      rawPurpose.includes("bonsai")
    ) {
      resolvedStyle = "zen";
    } else if (
      rawStyle === "iwagumi" ||
      rawName.includes("iwagumi") ||
      rawPurpose.includes("iwagumi") ||
      rawName.includes("stone")
    ) {
      resolvedStyle = "iwagumi";
    } else if (
      rawStyle === "emerald" ||
      rawStyle === "dutch" ||
      rawName.includes("dutch") ||
      rawName.includes("emerald") ||
      rawName.includes("garden") ||
      rawName.includes("stem")
    ) {
      resolvedStyle = "emerald";
    } else if (
      rawStyle === "nature" ||
      rawStyle === "driftwood" ||
      rawName.includes("driftwood") ||
      rawName.includes("wood") ||
      rawPurpose.includes("driftwood")
    ) {
      resolvedStyle = "nature";
    }
  } else {
    if (rawStyle === "lagoon" || rawName.includes("lagoon") || rawPurpose.includes("lagoon")) {
      resolvedStyle = "lagoon";
    } else if (
      rawStyle === "sps" ||
      rawStyle === "actinic" ||
      rawName.includes("sps") ||
      rawName.includes("actinic") ||
      rawPurpose.includes("sps")
    ) {
      resolvedStyle = "sps";
    } else {
      resolvedStyle = "mixed";
    }
  }

  // 2. Resolve Form Factor (Explicit distinct sizes: nano_cube, standard, panoramic)
  let resolvedFormFactor: "nano_cube" | "standard" | "panoramic" = "standard";

  const rawForm = (tank.formFactor || "").toLowerCase().trim();
  if (rawForm === "nano_cube" || rawForm === "cube" || rawName.includes("cube") || resolvedStyle === "zen") {
    // Lagoon style specifically does not use cube (per user specification: Rectangular & Wide Peninsula)
    if (resolvedStyle === "lagoon") {
      resolvedFormFactor = "standard";
    } else {
      resolvedFormFactor = "nano_cube";
    }
  } else if (
    rawForm === "panoramic" ||
    rawForm === "peninsula" ||
    rawName.includes("peninsula") ||
    rawName.includes("panorama")
  ) {
    resolvedFormFactor = "panoramic";
  } else {
    // Default to standard rectangular
    resolvedFormFactor = "standard";
  }

  // Dimension styling tokens based on formFactor
  let formFactorLabel = `Rectangular Rimless (${Math.round(displayVol)}L)`;
  let containerMaxWidth = "max-w-[760px] sm:max-w-[820px]";
  let viewportHeightClass = "h-[320px] sm:h-[390px]";
  let aspectRatioClass = "aspect-[16/10]";
  let fixtureType: "single_pendant" | "dual_puck" | "full_rail" | "multi_cluster" = "dual_puck";

  if (resolvedFormFactor === "nano_cube") {
    formFactorLabel = `Nano Cube (${Math.round(displayVol)}L)`;
    containerMaxWidth = "max-w-[480px] sm:max-w-[520px]";
    viewportHeightClass = "h-[360px] sm:h-[440px]";
    aspectRatioClass = "aspect-square";
    fixtureType = "single_pendant";
  } else if (resolvedFormFactor === "panoramic") {
    formFactorLabel = `Wide Peninsula (${Math.round(displayVol)}L)`;
    containerMaxWidth = "max-w-4xl xl:max-w-5xl";
    viewportHeightClass = "h-[300px] sm:h-[380px]";
    aspectRatioClass = "aspect-[16/9]";
    fixtureType = "multi_cluster";
  }

  // 3. Lookup exact dedicated archetype
  const lookupKey = `${resolvedStyle}_${resolvedFormFactor}`;
  const archetype =
    ARCHETYPE_CATALOG[lookupKey] ||
    ARCHETYPE_CATALOG[`${resolvedStyle}_standard`] ||
    ARCHETYPE_CATALOG[isFreshwater ? "nature_standard" : "mixed_standard"];

  // 4. Deterministic lighting label & water tuning based on tank ID
  const seed = hashString(tank.id || tank.name || "reef-tank-seed");
  const lightIdx = (seed >> 2) % archetype.lightingOptions.length;
  const lightingLabel = archetype.lightingOptions[lightIdx] || archetype.lightingOptions[0];

  const waterFilter = "none";
  const waterTintGradient = isFreshwater
    ? "linear-gradient(180deg, rgba(16, 185, 129, 0.03) 0%, rgba(5, 150, 105, 0.06) 100%)"
    : "linear-gradient(180deg, rgba(6, 182, 212, 0.03) 0%, rgba(14, 116, 144, 0.07) 100%)";
  const causticsOpacity = isFreshwater ? 0.35 : 0.48;

  // 5. Fauna Generation
  const fauna: FaunaItem[] = [];
  if (isFreshwater) {
    fauna.push({
      id: "tetra_1",
      type: "neon_tetra",
      src: "/aquariums/neon_tetra.png",
      alt: "Neon Tetra (Paracheirodon innesi)",
      animClass: "animate-fish-swim-1",
      bodyAnimClass: "animate-fish-propel",
      top: "34%",
      left: "18%",
      scale: 0.95,
      opacity: 0.95,
    });
    fauna.push({
      id: "shrimp_1",
      type: "cherry_shrimp",
      src: "/aquariums/cherry_shrimp.png",
      alt: "Red Cherry Shrimp (Neocaridina davidi)",
      animClass: "animate-fish-swim-3",
      bodyAnimClass: "animate-fish-undulate",
      top: "68%",
      left: "38%",
      scale: 0.75,
      opacity: 0.92,
    });
  } else {
    fauna.push({
      id: "clown_1",
      type: "clownfish",
      src: "/aquariums/clownfish.png",
      alt: "Ocellaris Clownfish (Amphiprion ocellaris)",
      animClass: "animate-fish-swim-1",
      bodyAnimClass: "animate-fish-propel",
      top: "32%",
      left: "22%",
      scale: 1.0,
      opacity: 0.95,
    });
    fauna.push({
      id: "tang_1",
      type: "blue_tang",
      src: "/aquariums/blue_tang.png",
      alt: "Pacific Blue Tang (Paracanthurus hepatus)",
      animClass: "animate-fish-swim-2",
      bodyAnimClass: "animate-fish-undulate",
      top: "40%",
      right: "24%",
      scale: 0.88,
      opacity: 0.92,
    });
  }

  // 6. Bubble streams
  const bubbles: BubbleStream = {
    position: (seed % 3 === 0 ? "left" : seed % 3 === 1 ? "right" : "center-right") as any,
    opacity: isFreshwater ? 0.25 : 0.38,
    scale: 1.0,
  };

  return {
    archetypeId: archetype.id,
    archetypeName: archetype.name,
    bgImage: archetype.bgImage,
    lightingLabel,
    waterFilter,
    waterTintGradient,
    causticsOpacity,
    fauna,
    bubbles,
    coralHotspot: archetype.coralHotspot,
    fishHotspot: archetype.fishHotspot,
    formFactor: resolvedFormFactor,
    formFactorLabel,
    displayVolumeLiters: displayVol,
    sumpVolumeLiters: sumpVol,
    totalVolumeLiters: totalVol,
    hasSump,
    sumpChambers: Number(tank.sumpChambers) || 3,
    sumpEquipment: tank.sumpEquipment || "Mechanical fleece, Skimmer, Return pump",
    sumpMedia: tank.sumpMedia || "Activated carbon & bio-rings",
    hasRefugium: Boolean(tank.hasRefugium),
    refugiumVolumeLiters: Number(tank.refugiumVolumeLiters) || 0,
    refugiumType: tank.refugiumType || "Chaetomorpha Algae",
    refugiumLighting: tank.refugiumLighting || "Reverse Photoperiod Grow LED",
    containerMaxWidth,
    viewportHeightClass,
    aspectRatioClass,
    fixtureType,
  };
}
