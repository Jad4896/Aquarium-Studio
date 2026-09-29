"use client";

import React, { useState, useEffect } from "react";
import { SaltFormula, Tank, UnitSystem, DosingElement, CustomDosingFormula } from "@/types";
import {
  Calculator,
  Scale,
  FlaskConical,
  Pin,
  CheckCircle,
  AlertTriangle,
  PlusCircle,
  X,
  Sparkles,
  Search,
  Upload,
  Camera,
  Info,
  ArrowRight,
  Droplets,
  Check,
  Loader2,
  Key,
  Settings,
  HelpCircle,
  Edit3,
  Trash2,
  Plus,
  Sprout,
  Leaf,
} from "lucide-react";
import { IdentifiedProduct } from "@/lib/productCatalog";
import AiSettingsModal from "./AiSettingsModal";

interface Props {
  tank: Tank;
  saltFormulas: SaltFormula[];
  unitSystem?: UnitSystem;
  onPinRecipeToNotes: (
    recipe: string,
    customTitle?: string,
    customTag?: string
  ) => Promise<void>;
  onAddSaltFormula: (formula: {
    name: string;
    gramsPerLiter: number;
  }) => Promise<any>;
  onUpdateSaltFormula?: (
    id: string,
    formula: { name?: string; gramsPerLiter?: number; isDefault?: boolean }
  ) => Promise<any>;
  onDeleteSaltFormula?: (id: string) => Promise<void>;
}

// Fallback salt formulas if none exist in DB
const DEFAULT_SALT_FALLBACKS: SaltFormula[] = [
  { id: "rs_blue", name: "Red Sea Blue Bucket", gramsPerLiter: 38.0, isDefault: true },
  { id: "rs_coral_pro", name: "Red Sea Coral Pro", gramsPerLiter: 38.2, isDefault: false },
  { id: "tm_pro", name: "Tropic Marin Pro-Reef", gramsPerLiter: 37.8, isDefault: false },
  { id: "af_reef", name: "Aquaforest Reef Salt", gramsPerLiter: 39.0, isDefault: false },
  { id: "io_crystals", name: "Instant Ocean Reef Crystals", gramsPerLiter: 36.5, isDefault: false },
];

export function isSaltProduct(prod: IdentifiedProduct): boolean {
  const cat = (prod.category || "").toLowerCase();
  const name = (prod.productName || "").toLowerCase();
  const summary = (prod.summary || "").toLowerCase();
  if (
    cat.includes("salt") ||
    cat.includes("remineralizer") ||
    name.includes("salt") ||
    name.includes("remineral") ||
    name.includes("crystals") ||
    name.includes("bucket") ||
    summary.includes("sea salt") ||
    summary.includes("salt mix") ||
    summary.includes("synthetic sea salt") ||
    summary.includes("remineraliz")
  ) {
    return true;
  }
  if (typeof prod.gramsPerLiter === "number" && prod.gramsPerLiter > 0.05) {
    return true;
  }
  return false;
}

export function detectProductElement(prod: IdentifiedProduct): DosingElement {
  const text = `${prod.productName} ${prod.category} ${prod.summary} ${prod.targetParameters || ""} ${(prod.compatibleCalculators || []).join(" ")}`.toLowerCase();

  if (text.includes("nitrate") || text.includes("neo-nitro") || text.includes("neonitro") || text.includes("no3")) {
    return "no3";
  }
  if (text.includes("phosphate") || text.includes("neo-phos") || text.includes("neophos") || text.includes("po4") || text.includes("phosphor")) {
    return "po4";
  }
  if (text.includes("potassium") || text.includes("potassion") || text.includes("k+")) {
    return "k";
  }
  if (text.includes("iron") || text.includes("ferrion") || text.includes("trace-colors c") || text.includes("chelated fe")) {
    return "fe";
  }
  if (text.includes("iodine") || text.includes("iodion") || text.includes("lugol") || text.includes("halogen") || text.includes("trace-colors a")) {
    return "i";
  }
  if (text.includes("strontium") || text.includes("strontion")) {
    return "sr";
  }
  if (text.includes("alkalin") || text.includes("dkh") || text.includes("carbonate") || text.includes("bicarbonate") || text.includes("soda ash") || text.includes("buffer")) {
    return "alk";
  }
  if (text.includes("calcium") || text.includes("cacl2")) {
    return "ca";
  }
  if (text.includes("magnesium") || text.includes("epsom") || text.includes("mgcl2")) {
    return "mg";
  }
  return "all_in_one";
}

export function parseDosingDefaults(prod: IdentifiedProduct): {
  unit: "mL" | "g" | "drops";
  doseMode: "rate" | "ppm_delta";
  doseRatePer100L: number;
  ppmPerMlPer100L?: number;
} {
  const directions = `${prod.recommendedDoseRule || ""} ${prod.dosingDirections || ""}`.toLowerCase();
  let unit: "mL" | "g" | "drops" = "mL";
  if (directions.includes("drop")) unit = "drops";
  else if (directions.includes("gram") || directions.includes(" g ")) unit = "g";

  let doseMode: "rate" | "ppm_delta" = "rate";
  let doseRatePer100L = 1.0;
  let ppmPerMlPer100L: number | undefined = undefined;

  // Check for ppm boost patterns e.g. "increases nitrate by ~0.15 ppm" or "raises NO3 by 1 ppm"
  const ppmMatch = directions.match(/(?:increase|raise|boost|by)\s*(?:~|\+)?\s*(\d+(?:\.\d+)?)\s*(?:ppm|dkh)/i);
  if (ppmMatch && (directions.includes("1 ml") || directions.includes("1ml"))) {
    doseMode = "ppm_delta";
    ppmPerMlPer100L = parseFloat(ppmMatch[1]);
  } else if (directions.includes("neophos")) {
    doseMode = "ppm_delta";
    ppmPerMlPer100L = 0.02;
  } else if (directions.includes("neonitro")) {
    doseMode = "ppm_delta";
    ppmPerMlPer100L = 0.15;
  } else if (directions.includes("potassion")) {
    doseMode = "ppm_delta";
    ppmPerMlPer100L = 2.0;
  } else if (directions.includes("strontion")) {
    doseMode = "ppm_delta";
    ppmPerMlPer100L = 0.4;
  }

  // Parse rate per 100L
  const rateMatch = directions.match(/(\d+(?:\.\d+)?)\s*(?:ml|drops?|g)\s*(?:per|\/)\s*(\d+)\s*(?:l|liters|gal)/i);
  if (rateMatch) {
    const rawAmount = parseFloat(rateMatch[1]);
    const rawVol = parseFloat(rateMatch[2]);
    const isGallons = directions.includes("gal");
    const volLiters = isGallons ? rawVol * 3.78541 : rawVol;
    if (volLiters > 0) {
      doseRatePer100L = parseFloat(((rawAmount / volLiters) * 100).toFixed(1));
    }
  }

  return { unit, doseMode, doseRatePer100L, ppmPerMlPer100L };
}

function getDefaultFormulationForElement(elem: DosingElement): string {
  switch (elem) {
    case "alk": return "sodaAsh";
    case "ca": return "cacl2_dihydrate";
    case "mg": return "diy_balanced";
    case "no3": return "nano3";
    case "po4": return "na3po4";
    case "k": return "kcl";
    case "fe": return "liquid";
    case "i": return "lugols";
    case "sr": return "srcl2";
    case "all_in_one": return "all_for_reef";
  }
}

export type CalcTab = "salt" | "dosing" | "fert" | "remin" | "aiAdvisor";

export default function CalculatorsView({
  tank,
  saltFormulas = [],
  unitSystem = "metric",
  onPinRecipeToNotes,
  onAddSaltFormula,
  onUpdateSaltFormula,
  onDeleteSaltFormula,
}: Props) {
  const isFreshwater = tank.tankType === "FRESHWATER";
  const [activeTab, setActiveTab] = useState<CalcTab>(isFreshwater ? "fert" : "salt");

  useEffect(() => {
    if (isFreshwater && (activeTab === "salt" || activeTab === "dosing")) {
      setActiveTab("fert");
    } else if (!isFreshwater && (activeTab === "fert" || activeTab === "remin")) {
      setActiveTab("salt");
    }
  }, [isFreshwater]);

  // Combine parent salt formulas with fallbacks if empty
  const allSaltFormulas = saltFormulas && saltFormulas.length > 0 ? saltFormulas : DEFAULT_SALT_FALLBACKS;

  // --- Salt Calculator State ---
  const [isMetric, setIsMetric] = useState(unitSystem === "metric");
  const [saltVolume, setSaltVolume] = useState<number>(unitSystem === "imperial" ? 5 : 10);

  useEffect(() => {
    if (unitSystem) {
      const nextIsMetric = unitSystem === "metric";
      setIsMetric(nextIsMetric);
      setSaltVolume((prev) => {
        if (nextIsMetric) {
          return prev <= 5 ? 10 : parseFloat((prev * 3.78541).toFixed(1));
        } else {
          return prev >= 10 ? 5 : parseFloat((prev * 0.264172).toFixed(1));
        }
      });
    }
  }, [unitSystem]);

  // Selected Salt Formula by ID
  const [selectedSaltFormulaId, setSelectedSaltFormulaId] = useState<string>(
    allSaltFormulas[0]?.id || "rs_blue"
  );
  const [selectedFormulaGrams, setSelectedFormulaGrams] = useState<number>(
    allSaltFormulas[0]?.gramsPerLiter || 38.0
  );
  const [isPinnedSuccess, setIsPinnedSuccess] = useState(false);

  // --- Freshwater Fertilizer Calculator State ---
  const [fertMethod, setFertMethod] = useState<"ei" | "all_in_one">("ei");
  const [fertVolume, setFertVolume] = useState<number>(() => {
    const l = tank.volumeLiters || 40;
    return unitSystem === "imperial" ? parseFloat((l * 0.264172).toFixed(1)) : l;
  });
  const [fertIsMetric, setFertIsMetric] = useState(unitSystem === "metric");
  const [eiTechLevel, setEiTechLevel] = useState<"high_tech" | "low_tech">("high_tech");
  const [selectedAioBrand, setSelectedAioBrand] = useState<string>("thrive");
  const [fertPinnedSuccess, setFertPinnedSuccess] = useState(false);

  useEffect(() => {
    const l = tank.volumeLiters || 40;
    if (unitSystem === "imperial") {
      setFertIsMetric(false);
      setFertVolume(parseFloat((l * 0.264172).toFixed(1)));
    } else {
      setFertIsMetric(true);
      setFertVolume(l);
    }
  }, [unitSystem, tank.volumeLiters]);

  // --- RO/DI Remineralizer State ---
  const [reminWaterVol, setReminWaterVol] = useState<number>(() => (unitSystem === "imperial" ? 5 : 20));
  const [reminIsMetric, setReminIsMetric] = useState(unitSystem === "metric");
  const [reminTargetPreset, setReminTargetPreset] = useState<string>("caridina");
  const [reminTargetDgh, setReminTargetDgh] = useState<number>(5.0);
  const [reminTargetDkh, setReminTargetDkh] = useState<number>(0.0);
  const [reminProduct, setReminProduct] = useState<string>("salty_gh");
  const [reminPinnedSuccess, setReminPinnedSuccess] = useState(false);

  useEffect(() => {
    if (unitSystem === "imperial") {
      setReminIsMetric(false);
      setReminWaterVol(5);
    } else {
      setReminIsMetric(true);
      setReminWaterVol(20);
    }
  }, [unitSystem]);

  // Sync selected formula grams when selectedSaltFormulaId or allSaltFormulas changes
  useEffect(() => {
    const found = allSaltFormulas.find((f) => f.id === selectedSaltFormulaId);
    if (found) {
      setSelectedFormulaGrams(found.gramsPerLiter);
    } else if (allSaltFormulas.length > 0) {
      setSelectedSaltFormulaId(allSaltFormulas[0].id);
      setSelectedFormulaGrams(allSaltFormulas[0].gramsPerLiter);
    }
  }, [allSaltFormulas, selectedSaltFormulaId]);

  // Bucket Calibrator State
  const [showCalibrator, setShowCalibrator] = useState(false);
  const [calibWaterVol, setCalibWaterVol] = useState(10);
  const [calibSaltWeighed, setCalibSaltWeighed] = useState(380);
  const [calibMeasuredSal, setCalibMeasuredSal] = useState(34.0);

  // Add / Edit Salt Formula Modal State
  const [showSaltModal, setShowSaltModal] = useState(false);
  const [saltModalMode, setSaltModalMode] = useState<"add" | "edit">("add");
  const [saltModalId, setSaltModalId] = useState("");
  const [saltModalName, setSaltModalName] = useState("");
  const [saltModalGrams, setSaltModalGrams] = useState("38.0");

  // --- Dosing Calculator State ---
  const [dosingTab, setDosingTab] = useState<DosingElement>("alk");

  const getInitialDoseVol = () => {
    const l = tank.volumeLiters || 80;
    return unitSystem === "imperial" ? parseFloat((l * 0.264172).toFixed(1)) : l;
  };
  const [doseTankVol, setDoseTankVol] = useState<number>(getInitialDoseVol);

  useEffect(() => {
    const l = tank.volumeLiters || 80;
    if (unitSystem === "imperial") {
      setDoseTankVol(parseFloat((l * 0.264172).toFixed(1)));
    } else {
      setDoseTankVol(l);
    }
  }, [unitSystem, tank.volumeLiters]);

  // Alk state
  const [currentDkh, setCurrentDkh] = useState<string>("7.8");
  const [targetDkh, setTargetDkh] = useState<string>("8.4");
  const [alkBufferType, setAlkBufferType] = useState<"sodaAsh" | "bicarb" | "liquid">("sodaAsh");

  // Ca state
  const [currentCa, setCurrentCa] = useState<string>("410");
  const [targetCa, setTargetCa] = useState<string>("440");
  const [caBufferType, setCaBufferType] = useState<"cacl2_dihydrate" | "cacl2_anhydrous" | "liquid">("cacl2_dihydrate");

  // Mg state
  const [currentMg, setCurrentMg] = useState<string>("1280");
  const [targetMg, setTargetMg] = useState<string>("1350");
  const [mgBufferType, setMgBufferType] = useState<"diy_balanced" | "mgcl2" | "mgso4" | "liquid">("diy_balanced");

  // Nitrate NO3 state
  const [currentNo3, setCurrentNo3] = useState<string>("1.0");
  const [targetNo3, setTargetNo3] = useState<string>("5.0");
  const [no3BufferType, setNo3BufferType] = useState<"nano3" | "kno3" | "neonitro">("nano3");

  // Phosphate PO4 state
  const [currentPo4, setCurrentPo4] = useState<string>("0.01");
  const [targetPo4, setTargetPo4] = useState<string>("0.05");
  const [po4BufferType, setPo4BufferType] = useState<"na3po4" | "kh2po4" | "neophos">("na3po4");

  // Potassium K state
  const [currentK, setCurrentK] = useState<string>("380");
  const [targetK, setTargetK] = useState<string>("410");
  const [kBufferType, setKBufferType] = useState<"kcl" | "liquid">("kcl");

  // Iron Fe state
  const [currentFe, setCurrentFe] = useState<string>("0.000");
  const [targetFe, setTargetFe] = useState<string>("0.003");
  const [feBufferType, setFeBufferType] = useState<"chelated" | "liquid">("liquid");

  // Iodine I state
  const [currentI, setCurrentI] = useState<string>("0.03");
  const [targetI, setTargetI] = useState<string>("0.06");
  const [iBufferType, setIBufferType] = useState<"lugols" | "ki" | "liquid">("lugols");

  // Strontium Sr state
  const [currentSr, setCurrentSr] = useState<string>("6.0");
  const [targetSr, setTargetSr] = useState<string>("9.0");
  const [srBufferType, setSrBufferType] = useState<"srcl2" | "liquid">("srcl2");

  // All-in-One state
  const [allInOneType, setAllInOneType] = useState<"all_for_reef" | "core7" | "balling_trace">("all_for_reef");

  // Custom Dosing Formulas State
  const [customDosingFormulas, setCustomDosingFormulas] = useState<CustomDosingFormula[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("reef_custom_dosing_formulas");
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse custom dosing formulas:", e);
      }
    }
    return [];
  });

  const saveCustomDosingFormulas = (formulas: CustomDosingFormula[]) => {
    setCustomDosingFormulas(formulas);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("reef_custom_dosing_formulas", JSON.stringify(formulas));
      } catch (e) {
        console.error("Failed to save custom dosing formulas:", e);
      }
    }
  };

  // Active formulation selection mapping for each element tab
  const [selectedFormulation, setSelectedFormulation] = useState<Record<DosingElement, string>>({
    alk: "sodaAsh",
    ca: "cacl2_dihydrate",
    mg: "diy_balanced",
    no3: "nano3",
    po4: "na3po4",
    k: "kcl",
    fe: "liquid",
    i: "lugols",
    sr: "srcl2",
    all_in_one: "all_for_reef",
  });

  // Add / Edit Custom Dosing Formula Modal State
  const [showDosingModal, setShowDosingModal] = useState(false);
  const [dosingModalMode, setDosingModalMode] = useState<"add" | "edit">("add");
  const [dosingFormState, setDosingFormState] = useState<{
    id: string;
    name: string;
    brand: string;
    element: DosingElement;
    unit: "mL" | "g" | "drops";
    doseMode: "rate" | "ppm_delta";
    doseRatePer100L: string;
    ppmPerMlPer100L: string;
    frequency: string;
    instructions: string;
    targetParameters: string;
  }>({
    id: "",
    name: "",
    brand: "",
    element: "alk",
    unit: "mL",
    doseMode: "rate",
    doseRatePer100L: "1.0",
    ppmPerMlPer100L: "0.1",
    frequency: "Daily",
    instructions: "",
    targetParameters: "",
  });

  // --- AI Product Advisor State ---
  const [aiProvider, setAiProvider] = useState("gemini");
  const [activeApiKey, setActiveApiKey] = useState("");
  const [showAiModal, setShowAiModal] = useState(false);
  const [productQuery, setProductQuery] = useState("");
  const [productImageBase64, setProductImageBase64] = useState("");
  const [productImageName, setProductImageName] = useState("");
  const [identifyingProduct, setIdentifyingProduct] = useState(false);
  const [productStatus, setProductStatus] = useState<string | null>(null);
  const [identifiedProduct, setIdentifiedProduct] = useState<IdentifiedProduct | null>(null);
  const [advisorPinnedSuccess, setAdvisorPinnedSuccess] = useState(false);

  // Sync AI Keys & Provider from localStorage and server
  const syncAiKeysAndProvider = () => {
    if (typeof window !== "undefined") {
      const savedProvider = localStorage.getItem("reef_default_ai_provider") || "gemini";
      setAiProvider(savedProvider);

      let key = "";
      if (savedProvider === "openai") key = localStorage.getItem("reef_openai_api_key") || "";
      else if (savedProvider === "anthropic") key = localStorage.getItem("reef_anthropic_api_key") || "";
      else if (savedProvider === "openrouter") key = localStorage.getItem("reef_openrouter_api_key") || "";
      else key = localStorage.getItem("reef_gemini_api_key") || "";

      if (key) {
        setActiveApiKey(key);
      } else {
        fetch("/api/config/api-key")
          .then((r) => r.json())
          .then((d) => {
            if (d.providers?.[savedProvider] || d.hasKey) {
              setActiveApiKey("env_configured");
            } else {
              setActiveApiKey("");
            }
          })
          .catch(() => {});
      }
    }
  };

  useEffect(() => {
    syncAiKeysAndProvider();
  }, []);

  const handleProviderChange = (provider: string) => {
    setAiProvider(provider);
    if (typeof window !== "undefined") {
      localStorage.setItem("reef_default_ai_provider", provider);
      let key = "";
      if (provider === "openai") key = localStorage.getItem("reef_openai_api_key") || "";
      else if (provider === "anthropic") key = localStorage.getItem("reef_anthropic_api_key") || "";
      else if (provider === "openrouter") key = localStorage.getItem("reef_openrouter_api_key") || "";
      else key = localStorage.getItem("reef_gemini_api_key") || "";

      if (key) {
        setActiveApiKey(key);
      } else {
        fetch("/api/config/api-key")
          .then((r) => r.json())
          .then((d) => {
            if (d.providers?.[provider]) {
              setActiveApiKey("env_configured");
            } else {
              setActiveApiKey("");
            }
          })
          .catch(() => {});
      }
    }
  };

  const handleSaveApiKey = async (key: string, providerToSave?: string) => {
    const targetProvider = providerToSave || aiProvider;
    const trimmed = key.trim();
    setActiveApiKey(trimmed);
    if (typeof window !== "undefined") {
      if (targetProvider === "openai") localStorage.setItem("reef_openai_api_key", trimmed);
      else if (targetProvider === "anthropic") localStorage.setItem("reef_anthropic_api_key", trimmed);
      else if (targetProvider === "openrouter") localStorage.setItem("reef_openrouter_api_key", trimmed);
      else localStorage.setItem("reef_gemini_api_key", trimmed);
    }
    if (trimmed && trimmed !== "env_configured") {
      try {
        await fetch("/api/config/api-key", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ provider: targetProvider, apiKey: trimmed }),
        });
      } catch (e) {
        console.warn("Could not save API key to server", e);
      }
    }
  };

  // --- Salt Math ---
  const volumeInLiters = isMetric ? saltVolume : saltVolume * 3.78541;
  const exactSaltGrams = parseFloat((volumeInLiters * selectedFormulaGrams).toFixed(1));
  const exactSaltKg = (exactSaltGrams / 1000).toFixed(2);
  const exactSaltOz = (exactSaltGrams * 0.035274).toFixed(1);
  const exactSaltLbs = (parseFloat(exactSaltOz) / 16).toFixed(2);

  // Kitchen measurement estimation
  const gramsToKitchen = (grams: number) => {
    let rem = grams;
    const cups = Math.floor(rem / 240);
    rem %= 240;
    const tbsp = Math.floor(rem / 15);
    rem %= 15;
    const tsp = (rem / 5).toFixed(1);

    const parts = [];
    if (cups > 0) parts.push(`${cups} Cup${cups > 1 ? "s" : ""}`);
    if (tbsp > 0) parts.push(`${tbsp} Tbsp`);
    if (parseFloat(tsp) > 0) parts.push(`${tsp} tsp`);
    return parts.length > 0 ? parts.join(", ") : "0 tsp";
  };

  // Live bucket calibration math
  const getCalibratedGramsPerLiter = () => {
    let measuredPpt = calibMeasuredSal;
    if (measuredPpt < 2.0) {
      measuredPpt = (calibMeasuredSal - 1.0) * 1350;
    }
    if (calibWaterVol > 0 && calibSaltWeighed > 0 && measuredPpt > 0) {
      const currentGramsPerL = calibSaltWeighed / calibWaterVol;
      return (currentGramsPerL * (35.0 / measuredPpt)).toFixed(1);
    }
    return "38.0";
  };

  // Pin salt recipe handler
  const handlePinSaltRecipe = async () => {
    const selectedObj = allSaltFormulas.find((f) => f.id === selectedSaltFormulaId);
    const text = `Mix ${exactSaltGrams} grams (~ ${gramsToKitchen(exactSaltGrams)}) of ${
      selectedObj ? selectedObj.name : "salt"
    } into ${saltVolume} ${isMetric ? "Liters" : "Gallons"} of RODI water for exactly 35 ppt / 1.026 SG. (Formula calibrated at ${selectedFormulaGrams} g/L).`;
    await onPinRecipeToNotes(text, "🌊 35 ppt Salt Mix Recipe", "recipe");
    setIsPinnedSuccess(true);
    setTimeout(() => setIsPinnedSuccess(false), 3000);
  };

  // --- Freshwater Math & Handlers ---
  const fertVolLiters = fertIsMetric ? fertVolume : fertVolume * 3.78541;
  const isHighTech = eiTechLevel === "high_tech";
  const eiMult = isHighTech ? 1.0 : 0.333;

  const kno3DoseGrams = parseFloat((fertVolLiters * 0.0122 * eiMult).toFixed(2));
  const kh2po4DoseGrams = parseFloat((fertVolLiters * 0.00186 * eiMult).toFixed(3));
  const k2so4DoseGrams = parseFloat((fertVolLiters * 0.0078 * eiMult).toFixed(2));
  const mgso4DoseGrams = parseFloat((fertVolLiters * 0.0152 * eiMult).toFixed(2));
  const csmDoseGrams = parseFloat((fertVolLiters * 0.0028 * eiMult).toFixed(3));

  const gramsToDrySpoon = (grams: number) => {
    if (grams >= 5.0) return `~ ${(grams / 5.0).toFixed(1)} tsp`;
    if (grams >= 2.5) return `~ 1/2 tsp (${grams}g)`;
    if (grams >= 1.2) return `~ 1/4 tsp (${grams}g)`;
    if (grams >= 0.6) return `~ 1/8 tsp (${grams}g)`;
    if (grams >= 0.3) return `~ 1/16 tsp / pinch (${grams}g)`;
    if (grams >= 0.15) return `~ 1/32 tsp (${grams}g)`;
    return `< 1/32 tsp (${grams}g)`;
  };

  const AIO_BRANDS: Record<string, { name: string; doseMlPer100L: number; frequency: string; notes: string }> = {
    thrive: {
      name: "NilocG Thrive All-In-One",
      doseMlPer100L: 5.26,
      frequency: "1-3x weekly (High Tech) or 1x weekly (Low Tech)",
      notes: "Comprehensive NPK + Fe and essential plant micronutrients. (1 pump = 2 mL)",
    },
    apt_complete: {
      name: "2Hr Aquarist APT Complete",
      doseMlPer100L: 3.0,
      frequency: "4x weekly (or 5 mL/100L 3x weekly)",
      notes: "Tailored for demanding stem & red plants with calibrated phosphates and chelated iron.",
    },
    apt_zero: {
      name: "2Hr Aquarist APT 1 (Zero N/P)",
      doseMlPer100L: 3.0,
      frequency: "4x weekly",
      notes: "Nitrate & phosphate-free formula for tanks with high fish or shrimp population.",
    },
    easy_green: {
      name: "Aquarium Co-Op Easy Green",
      doseMlPer100L: 2.63,
      frequency: "1x weekly (Low Tech) or 2x weekly (High Tech)",
      notes: "User-friendly liquid fertilizer with generous potassium and magnesium.",
    },
    flourish: {
      name: "Seachem Flourish Comprehensive",
      doseMlPer100L: 2.0,
      frequency: "1-2x weekly",
      notes: "Micro & trace element formula (Fe, B, Zn, Cu). Low N/P ratio.",
    },
    ada: {
      name: "ADA Green Brighty Mineral & Neutral K",
      doseMlPer100L: 5.0,
      frequency: "Daily at lights-on (1 pump = 1.2 mL)",
      notes: "Nature Aquarium daily routine for lush foliage and strong root growth.",
    },
    tropica: {
      name: "Tropica Specialised Nutrition",
      doseMlPer100L: 2.0,
      frequency: "Daily (2 mL/100L) or 14 mL/100L weekly after water change",
      notes: "Complete formula with nitrogen, phosphorus, and micro nutrients.",
    },
  };

  const currentAio = AIO_BRANDS[selectedAioBrand] || AIO_BRANDS.thrive;
  const aioDoseMl = parseFloat(((fertVolLiters * currentAio.doseMlPer100L) / 100).toFixed(1));
  const aioPumps = Math.max(1, Math.round(aioDoseMl / 2.0));

  // --- RO/DI Remineralizer Math ---
  const reminVolLiters = reminIsMetric ? reminWaterVol : reminWaterVol * 3.78541;

  let reminGrams = 0;
  let reminCalculatedDkh = reminTargetDkh;
  let reminEstTds = 0;
  let reminScoopDesc = "";

  if (reminProduct === "salty_gh") {
    reminGrams = parseFloat((reminVolLiters * reminTargetDgh * 0.025).toFixed(2));
    reminCalculatedDkh = 0.0;
    reminEstTds = Math.round(reminTargetDgh * 24);
    const scoops = (reminGrams / 3.0).toFixed(1);
    reminScoopDesc = `~ ${scoops} level scoops (3g scoop)`;
  } else if (reminProduct === "salty_gh_kh") {
    reminGrams = parseFloat((reminVolLiters * reminTargetDgh * 0.0333).toFixed(2));
    reminCalculatedDkh = parseFloat((reminTargetDgh * 0.5).toFixed(1));
    reminEstTds = Math.round(reminTargetDgh * 34);
    const scoops = (reminGrams / 2.0).toFixed(1);
    reminScoopDesc = `~ ${scoops} level scoops (2g scoop)`;
  } else if (reminProduct === "seachem_eq") {
    reminGrams = parseFloat((reminVolLiters * reminTargetDgh * 0.0667).toFixed(2));
    reminCalculatedDkh = 0.0;
    reminEstTds = Math.round(reminTargetDgh * 28);
    const tsp = (reminGrams / 5.0).toFixed(1);
    reminScoopDesc = `~ ${tsp} tsp (~5g per tsp)`;
  } else if (reminProduct === "seachem_combo") {
    const eqG = parseFloat((reminVolLiters * reminTargetDgh * 0.0667).toFixed(2));
    const alkG = parseFloat((reminVolLiters * reminTargetDkh * 0.03125).toFixed(2));
    reminGrams = parseFloat((eqG + alkG).toFixed(2));
    reminEstTds = Math.round(reminTargetDgh * 28 + reminTargetDkh * 25);
    reminScoopDesc = `${eqG}g Equilibrium + ${alkG}g Alkaline Buffer`;
  } else if (reminProduct === "dennerle") {
    reminGrams = parseFloat((reminVolLiters * reminTargetDgh * 0.0272).toFixed(2));
    reminCalculatedDkh = 0.0;
    reminEstTds = Math.round(reminTargetDgh * 25);
    const spoons = (reminGrams / 1.5).toFixed(1);
    reminScoopDesc = `~ ${spoons} measuring spoons (1.5g spoon)`;
  }

  const handleSelectReminPreset = (preset: string) => {
    setReminTargetPreset(preset);
    if (preset === "caridina") {
      setReminTargetDgh(5.0);
      setReminTargetDkh(0.0);
      setReminProduct("salty_gh");
    } else if (preset === "neocaridina") {
      setReminTargetDgh(7.0);
      setReminTargetDkh(3.5);
      setReminProduct("salty_gh_kh");
    } else if (preset === "planted") {
      setReminTargetDgh(4.0);
      setReminTargetDkh(1.5);
      setReminProduct("seachem_combo");
    } else if (preset === "community") {
      setReminTargetDgh(6.0);
      setReminTargetDkh(2.5);
      setReminProduct("salty_gh_kh");
    } else if (preset === "cichlid") {
      setReminTargetDgh(14.0);
      setReminTargetDkh(10.0);
      setReminProduct("seachem_combo");
    }
  };

  const handlePinEiFertSchedule = async () => {
    const text = `🌱 ESTIMATIVE INDEX (EI) DOSING SCHEDULE
Tank Volume: ${fertVolume} ${fertIsMetric ? "Liters" : "Gallons"} (${isHighTech ? "High-Tech with CO2" : "Low-Tech Non-CO2"})

MACRO DOSE (Mon / Wed / Fri):
• KNO3 (Potassium Nitrate): ${kno3DoseGrams} g (${gramsToDrySpoon(kno3DoseGrams)}) -> yields +7.5 ppm NO3
• KH2PO4 (Monopotassium Phosphate): ${kh2po4DoseGrams} g (${gramsToDrySpoon(kh2po4DoseGrams)}) -> yields +1.3 ppm PO4
• K2SO4 (Potassium Sulfate): ${k2so4DoseGrams} g (${gramsToDrySpoon(k2so4DoseGrams)}) -> yields +3.5 ppm K
• MgSO4 (Epsom Salt): ${mgso4DoseGrams} g (${gramsToDrySpoon(mgso4DoseGrams)}) -> yields +1.5 ppm Mg

MICRO DOSE (Tue / Thu / Sat):
• CSM+B / Chelated Trace Mix: ${csmDoseGrams} g (${gramsToDrySpoon(csmDoseGrams)}) -> yields +0.2 ppm Fe

WEEKLY RESET (Sunday):
• 50% Water Change to reset accumulation and keep plants thriving.`;

    await onPinRecipeToNotes(text, "🌱 Estimative Index (EI) Fertilizer Schedule", "fertilizer");
    setFertPinnedSuccess(true);
    setTimeout(() => setFertPinnedSuccess(false), 3000);
  };

  const handlePinAioFertSchedule = async () => {
    const text = `🌱 ALL-IN-ONE LIQUID FERTILIZER ROUTINE
Product: ${currentAio.name}
Tank Volume: ${fertVolume} ${fertIsMetric ? "Liters" : "Gallons"}
Recommended Dose: ${aioDoseMl} mL (${aioPumps} pump${aioPumps > 1 ? "s" : ""})
Frequency: ${currentAio.frequency}
Directions: ${currentAio.notes}`;

    await onPinRecipeToNotes(text, `🌱 ${currentAio.name} Routine`, "fertilizer");
    setFertPinnedSuccess(true);
    setTimeout(() => setFertPinnedSuccess(false), 3000);
  };

  const handlePinReminRecipe = async () => {
    const text = `💧 RO/DI REMINERALIZING RECIPE
Target Volume: ${reminWaterVol} ${reminIsMetric ? "Liters" : "Gallons"} of 0 TDS pure RO/DI water
Product: ${
  reminProduct === "salty_gh"
    ? "SaltyShrimp Bee Shrimp Mineral GH+"
    : reminProduct === "salty_gh_kh"
    ? "SaltyShrimp Shrimp Mineral GH/KH+"
    : reminProduct === "seachem_combo"
    ? "Seachem Equilibrium + Alkaline Buffer"
    : reminProduct === "seachem_eq"
    ? "Seachem Equilibrium"
    : "Dennerle Shrimp King Mineral"
}
Total Weighed: ${reminGrams} grams (${reminScoopDesc})
Target Hardness: ${reminTargetDgh} dGH • ${reminCalculatedDkh} dKH
Projected TDS: ~ ${reminEstTds} ppm (~ ${(reminEstTds * 1.56).toFixed(0)} µS/cm)
Directions: Dissolve fully into aerated RO/DI water before water change. Verify temperature and TDS before adding to aquarium.`;

    await onPinRecipeToNotes(text, "💧 RO/DI Remineralizing Recipe", "remineralizer");
    setReminPinnedSuccess(true);
    setTimeout(() => setReminPinnedSuccess(false), 3000);
  };

  // Salt Formula CRUD Handlers
  const handleOpenAddSaltFormula = () => {
    setSaltModalMode("add");
    setSaltModalId("");
    setSaltModalName("");
    setSaltModalGrams("38.0");
    setShowSaltModal(true);
  };

  const handleOpenEditSaltFormula = (f: SaltFormula) => {
    setSaltModalMode("edit");
    setSaltModalId(f.id);
    setSaltModalName(f.name);
    setSaltModalGrams(f.gramsPerLiter.toString());
    setShowSaltModal(true);
  };

  const handleSaveSaltFormula = async () => {
    const name = saltModalName.trim();
    const gpl = parseFloat(saltModalGrams) || 38.0;
    if (!name) return;

    if (saltModalMode === "edit" && saltModalId) {
      if (onUpdateSaltFormula) {
        await onUpdateSaltFormula(saltModalId, { name, gramsPerLiter: gpl });
      } else {
        try {
          await fetch(`/api/salt-formulas/${saltModalId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, gramsPerLiter: gpl }),
          });
        } catch (e) {
          console.error(e);
        }
      }
      setSelectedFormulaGrams(gpl);
      setProductStatus(`✓ Salt formula "${name}" updated successfully.`);
    } else {
      const added = await onAddSaltFormula({ name, gramsPerLiter: gpl });
      if (added && added.id) {
        setSelectedSaltFormulaId(added.id);
      }
      setSelectedFormulaGrams(gpl);
      setActiveTab("salt");
      setProductStatus(`✓ Salt formula "${name}" added to Salt Mixer!`);
    }

    setShowSaltModal(false);
    setTimeout(() => setProductStatus(null), 4000);
  };

  const handleDeleteSaltFormulaClick = async (id: string) => {
    const f = allSaltFormulas.find((x) => x.id === id);
    const name = f?.name || "this salt formula";
    if (allSaltFormulas.length <= 1) {
      alert("At least one salt formula must remain in your list.");
      return;
    }
    if (!window.confirm(`Are you sure you want to delete salt formula "${name}"?`)) {
      return;
    }

    if (onDeleteSaltFormula) {
      await onDeleteSaltFormula(id);
    } else {
      try {
        await fetch(`/api/salt-formulas/${id}`, { method: "DELETE" });
      } catch (e) {
        console.error(e);
      }
    }

    const remaining = allSaltFormulas.filter((x) => x.id !== id);
    if (remaining.length > 0) {
      setSelectedSaltFormulaId(remaining[0].id);
      setSelectedFormulaGrams(remaining[0].gramsPerLiter);
    }
    setProductStatus(`✓ Salt formula "${name}" deleted.`);
    setTimeout(() => setProductStatus(null), 3500);
  };

  // --- Dosing Calculations Math ---
  const doseTankVolLiters = isMetric ? doseTankVol : doseTankVol * 3.78541;

  // 1. Alk Math
  const curD = parseFloat(currentDkh);
  const tarD = parseFloat(targetDkh);
  const alkDiff = !isNaN(curD) && !isNaN(tarD) ? tarD - curD : 0;

  const calculateAlkResult = () => {
    if (isNaN(curD) || isNaN(tarD)) return "Please enter valid current and target dKH values.";
    if (alkDiff <= 0) return "Target dKH is already lower or equal to current level. No dosing needed.";

    if (alkBufferType === "sodaAsh") {
      const g = (alkDiff * doseTankVolLiters * 0.038).toFixed(2);
      const oz = (parseFloat(g) * 0.035274).toFixed(2);
      const tsp = (parseFloat(g) / 5.5).toFixed(1);
      return !isMetric
        ? `Dose ${oz} oz (~${tsp} tsp / ${g} g) of dry Soda Ash (Sodium Carbonate) dissolved in RODI water.`
        : `Dose ${g} grams (~${tsp} tsp) of dry Soda Ash (Sodium Carbonate) dissolved in RODI water.`;
    } else if (alkBufferType === "bicarb") {
      const g = (alkDiff * doseTankVolLiters * 0.030).toFixed(2);
      const oz = (parseFloat(g) * 0.035274).toFixed(2);
      const tsp = (parseFloat(g) / 4.8).toFixed(1);
      return !isMetric
        ? `Dose ${oz} oz (~${tsp} tsp / ${g} g) of Sodium Bicarbonate (Baking Soda) dissolved in RODI water.`
        : `Dose ${g} grams (~${tsp} tsp) of Sodium Bicarbonate (Baking Soda) dissolved in RODI water.`;
    } else {
      const ml = (alkDiff * (doseTankVolLiters / 10)).toFixed(1);
      const flOz = (parseFloat(ml) * 0.033814).toFixed(2);
      return !isMetric
        ? `Dose ~${flOz} fl oz (${ml} mL) of standard liquid 2-Part Alkalinity Buffer.`
        : `Dose ~${ml} mL of standard liquid 2-Part Alkalinity Buffer.`;
    }
  };

  // 2. Ca Math
  const curC = parseFloat(currentCa);
  const tarC = parseFloat(targetCa);
  const caDiff = !isNaN(curC) && !isNaN(tarC) ? tarC - curC : 0;

  const calculateCaResult = () => {
    if (isNaN(curC) || isNaN(tarC)) return "Please enter valid current and target Calcium values.";
    if (caDiff <= 0) return "Target Calcium is already lower or equal to current level. No dosing needed.";

    if (caBufferType === "cacl2_anhydrous") {
      const g = (caDiff * doseTankVolLiters * 0.00278).toFixed(2);
      const oz = (parseFloat(g) * 0.035274).toFixed(2);
      const tsp = (parseFloat(g) / 5.0).toFixed(1);
      return !isMetric
        ? `Dose ${oz} oz (~${tsp} tsp / ${g} g) of dry Calcium Chloride Anhydrous dissolved in RODI water.`
        : `Dose ${g} grams (~${tsp} tsp) of dry Calcium Chloride Anhydrous dissolved in RODI water.`;
    } else if (caBufferType === "cacl2_dihydrate") {
      const g = (caDiff * doseTankVolLiters * 0.00367).toFixed(2);
      const oz = (parseFloat(g) * 0.035274).toFixed(2);
      const tsp = (parseFloat(g) / 4.5).toFixed(1);
      return !isMetric
        ? `Dose ${oz} oz (~${tsp} tsp / ${g} g) of Calcium Chloride Dihydrate dissolved in RODI water.`
        : `Dose ${g} grams (~${tsp} tsp) of Calcium Chloride Dihydrate dissolved in RODI water.`;
    } else {
      const ml = ((caDiff / 10) * (doseTankVolLiters / 10)).toFixed(1);
      const flOz = (parseFloat(ml) * 0.033814).toFixed(2);
      return !isMetric
        ? `Dose ~${flOz} fl oz (${ml} mL) of standard liquid 2-Part Calcium Solution.`
        : `Dose ~${ml} mL of standard liquid 2-Part Calcium Solution.`;
    }
  };

  // 3. Mg Math
  const curMgVal = parseFloat(currentMg);
  const tarMgVal = parseFloat(targetMg);
  const mgDiff = !isNaN(curMgVal) && !isNaN(tarMgVal) ? tarMgVal - curMgVal : 0;

  const calculateMgResult = () => {
    if (isNaN(curMgVal) || isNaN(tarMgVal)) return "Please enter valid current and target Magnesium values.";
    if (mgDiff <= 0) return "Target Magnesium is already lower or equal to current level. No dosing needed.";

    if (mgBufferType === "diy_balanced") {
      const totalG = mgDiff * doseTankVolLiters * 0.00903;
      const mgcl2G = (totalG * 0.56).toFixed(1);
      const mgso4G = (totalG * 0.44).toFixed(1);
      return `Dose balanced DIY mix: ${mgcl2G} g Magnesium Chloride Hexahydrate + ${mgso4G} g Epsom Salt (MgSO4·7H2O) dissolved in RODI water.`;
    } else if (mgBufferType === "mgcl2") {
      const g = (mgDiff * doseTankVolLiters * 0.00836).toFixed(1);
      return `Dose ${g} grams of Magnesium Chloride Hexahydrate (MgCl2·6H2O) dissolved in RODI water.`;
    } else if (mgBufferType === "mgso4") {
      const g = (mgDiff * doseTankVolLiters * 0.01014).toFixed(1);
      return `Dose ${g} grams of Epsom Salt (Magnesium Sulfate Heptahydrate MgSO4·7H2O) dissolved in RODI water.`;
    } else {
      const ml = ((mgDiff / 10) * (doseTankVolLiters / 10)).toFixed(1);
      return `Dose ~${ml} mL of commercial liquid Magnesium supplement (e.g. Red Sea Foundation C or Brightwell Magnesion).`;
    }
  };

  // 4. Nitrate NO3 Math
  const curNo3Val = parseFloat(currentNo3);
  const tarNo3Val = parseFloat(targetNo3);
  const no3Diff = !isNaN(curNo3Val) && !isNaN(tarNo3Val) ? tarNo3Val - curNo3Val : 0;

  const calculateNo3Result = () => {
    if (isNaN(curNo3Val) || isNaN(tarNo3Val)) return "Please enter valid Nitrate values.";
    if (no3Diff <= 0) return "Target Nitrate is already met. No dosing required.";

    if (no3BufferType === "nano3") {
      const g = (no3Diff * doseTankVolLiters * 0.00137).toFixed(3);
      return `Dose ${g} grams of dry Sodium Nitrate (NaNO3) dissolved in a cup of RODI water.`;
    } else if (no3BufferType === "kno3") {
      const g = (no3Diff * doseTankVolLiters * 0.00163).toFixed(3);
      const kAdded = (no3Diff * 0.63).toFixed(2);
      return `Dose ${g} grams of Potassium Nitrate (KNO3). Note: this also increases Potassium by +${kAdded} ppm K.`;
    } else {
      const ml = ((no3Diff / 0.15) * (doseTankVolLiters / 100)).toFixed(1);
      return `Dose ~${ml} mL of commercial liquid Nitrate (e.g. Brightwell NeoNitro or ME Corals Nitrate).`;
    }
  };

  // 5. Phosphate PO4 Math
  const curPo4Val = parseFloat(currentPo4);
  const tarPo4Val = parseFloat(targetPo4);
  const po4Diff = !isNaN(curPo4Val) && !isNaN(tarPo4Val) ? tarPo4Val - curPo4Val : 0;

  const calculatePo4Result = () => {
    if (isNaN(curPo4Val) || isNaN(tarPo4Val)) return "Please enter valid Phosphate values.";
    if (po4Diff <= 0) return "Target Phosphate is already met. No dosing required.";

    if (po4BufferType === "na3po4") {
      const mg = (po4Diff * doseTankVolLiters * 1.73).toFixed(1);
      return `Dose ${mg} mg (approx ${(parseFloat(mg) / 1000).toFixed(4)} grams) of Trisodium Phosphate (Na3PO4) dissolved in RODI water.`;
    } else if (po4BufferType === "kh2po4") {
      const mg = (po4Diff * doseTankVolLiters * 1.43).toFixed(1);
      return `Dose ${mg} mg (approx ${(parseFloat(mg) / 1000).toFixed(4)} grams) of Monopotassium Phosphate (KH2PO4).`;
    } else {
      const ml = ((po4Diff / 0.02) * (doseTankVolLiters / 100)).toFixed(2);
      return `Dose ~${ml} mL of commercial liquid Phosphate (e.g. Brightwell NeoPhos or Seachem Phosphorus).`;
    }
  };

  // 6. Potassium K Math
  const curKVal = parseFloat(currentK);
  const tarKVal = parseFloat(targetK);
  const kDiff = !isNaN(curKVal) && !isNaN(tarKVal) ? tarKVal - curKVal : 0;

  const calculateKResult = () => {
    if (isNaN(curKVal) || isNaN(tarKVal)) return "Please enter valid Potassium values.";
    if (kDiff <= 0) return "Target Potassium is already met. No dosing needed.";

    if (kBufferType === "kcl") {
      const g = (kDiff * doseTankVolLiters * 0.00191).toFixed(2);
      return `Dose ${g} grams of dry Potassium Chloride (KCl) dissolved in RODI water.`;
    } else {
      const ml = (kDiff * 0.5 * (doseTankVolLiters / 100)).toFixed(1);
      return `Dose ~${ml} mL of commercial Potassium supplement (e.g. Brightwell Potassion or Red Sea Trace-Colors B).`;
    }
  };

  // 7. Iron Fe Math
  const curFeVal = parseFloat(currentFe);
  const tarFeVal = parseFloat(targetFe);
  const feDiff = !isNaN(curFeVal) && !isNaN(tarFeVal) ? tarFeVal - curFeVal : 0;

  const calculateFeResult = () => {
    if (isNaN(curFeVal) || isNaN(tarFeVal)) return "Please enter valid Iron values.";
    if (feDiff <= 0) return "Target Iron is already met.";

    if (feBufferType === "chelated") {
      const mg = (feDiff * doseTankVolLiters * 7.69).toFixed(1);
      return `Dose ${mg} mg of Chelated Iron (Iron-EDTA 13% Fe) dissolved in RODI water.`;
    } else {
      const ml = ((doseTankVolLiters / 100) * 1.0).toFixed(1);
      return `Dose ~${ml} mL of commercial liquid Iron (e.g. Red Sea Trace-Colors C or Brightwell Ferrion) once or twice weekly.`;
    }
  };

  // 8. Iodine I Math
  const curIVal = parseFloat(currentI);
  const tarIVal = parseFloat(targetI);
  const iDiff = !isNaN(curIVal) && !isNaN(tarIVal) ? tarIVal - curIVal : 0;

  const calculateIResult = () => {
    if (isNaN(curIVal) || isNaN(tarIVal)) return "Please enter valid Iodine values.";
    if (iDiff <= 0) return "Target Iodine is already met.";

    if (iBufferType === "lugols") {
      const drops = Math.max(1, Math.round(doseTankVolLiters / 200));
      return `Dose exactly ${drops} drop${drops > 1 ? "s" : ""} of Lugol's Solution into high-flow sump area once weekly. Caution: Extremely concentrated.`;
    } else if (iBufferType === "ki") {
      const mg = (iDiff * doseTankVolLiters * 1.31).toFixed(1);
      return `Dose ${mg} mg of Potassium Iodide (KI) dissolved in RODI water.`;
    } else {
      const ml = ((doseTankVolLiters / 100) * 1.0).toFixed(1);
      return `Dose ~${ml} mL of commercial liquid Iodine supplement (e.g. Red Sea Trace-Colors A or Brightwell Iodion) weekly.`;
    }
  };

  // 9. Strontium Sr Math
  const curSrVal = parseFloat(currentSr);
  const tarSrVal = parseFloat(targetSr);
  const srDiff = !isNaN(curSrVal) && !isNaN(tarSrVal) ? tarSrVal - curSrVal : 0;

  const calculateSrResult = () => {
    if (isNaN(curSrVal) || isNaN(tarSrVal)) return "Please enter valid Strontium values.";
    if (srDiff <= 0) return "Target Strontium is already met.";

    if (srBufferType === "srcl2") {
      const g = (srDiff * doseTankVolLiters * 0.00304).toFixed(2);
      return `Dose ${g} grams of Strontium Chloride Hexahydrate (SrCl2·6H2O) dissolved in RODI water.`;
    } else {
      const ml = ((srDiff / 2.0) * 5 * (doseTankVolLiters / 100)).toFixed(1);
      return `Dose ~${ml} mL of commercial Strontium solution (e.g. Brightwell Strontion).`;
    }
  };

  // 10. All-in-One & Multi-Trace Math
  const calculateAllInOneResult = () => {
    if (allInOneType === "all_for_reef") {
      const ml = ((doseTankVolLiters / 100) * 5.0).toFixed(1);
      const flOz = (parseFloat(ml) * 0.033814).toFixed(2);
      return !isMetric
        ? `Daily dose ~${flOz} fl oz (${ml} mL) of Tropic Marin All-For-Reef. Adjust by ±2.5 mL per 100L based on 3-day dKH tests.`
        : `Daily dose ~${ml} mL of Tropic Marin All-For-Reef. Adjust by ±2.5 mL per 100L every 3-4 days based on alkalinity stability.`;
    } else if (allInOneType === "core7") {
      const ml = ((doseTankVolLiters / 100) * 2.0).toFixed(1);
      return `Daily dose ~${ml} mL of EACH Triton Core7 bottle (1, 2, 3a, 3b) into separate high-flow zones of the sump.`;
    } else {
      return `Mix 25 mL of Trace 1 & 2 into 2L Calcium canister, and 25 mL of Trace 3 into 2L Carbonate canister according to Balling Light regimen.`;
    }
  };

  // Generic Custom Formulation Calculator
  const calculateCustomFormulaResult = (
    formula: CustomDosingFormula,
    elementDelta: number,
    elementTitle: string,
    elementUnit: string
  ): string => {
    const volL = doseTankVolLiters;
    if (formula.doseMode === "ppm_delta" && formula.ppmPerMlPer100L && formula.ppmPerMlPer100L > 0) {
      if (elementDelta <= 0) {
        return `Target ${elementTitle} is already met. No corrective dose required.`;
      }
      const needed = ((elementDelta / formula.ppmPerMlPer100L) * (volL / 100)).toFixed(1);
      const flOz = (parseFloat(needed) * 0.033814).toFixed(2);
      return !isMetric && formula.unit === "mL"
        ? `Dose ~${flOz} fl oz (${needed} mL) of ${formula.name} into high-flow sump to raise ${elementTitle} by +${elementDelta.toFixed(2)} ${elementUnit}.`
        : `Dose ~${needed} ${formula.unit} of ${formula.name} into high-flow sump to raise ${elementTitle} by +${elementDelta.toFixed(2)} ${elementUnit}.`;
    } else {
      const rate = formula.doseRatePer100L || 1.0;
      const dose = ((volL / 100) * rate).toFixed(1);
      const flOz = (parseFloat(dose) * 0.033814).toFixed(2);
      return !isMetric && formula.unit === "mL"
        ? `Recommended dose: ~${flOz} fl oz (${dose} mL) of ${formula.name} for your ${doseTankVol} Gallon system (${formula.frequency || "Routine maintenance"}).`
        : `Recommended dose: ~${dose} ${formula.unit} of ${formula.name} for your ${doseTankVol} ${isMetric ? "L" : "Gal"} system (${formula.frequency || "Routine maintenance"}).`;
    }
  };

  // Determine active formulation and if it's custom
  const activeFormKey = selectedFormulation[dosingTab] || getDefaultFormulationForElement(dosingTab);
  const activeCustomFormula = activeFormKey.startsWith("custom_")
    ? customDosingFormulas.find((f) => `custom_${f.id}` === activeFormKey)
    : null;

  // Active Dosing Tab Details
  const getActiveDoseDetails = () => {
    let title = "";
    let unit = "";
    let color = "";
    let borderColor = "";
    let bgColor = "";
    let delta = 0;
    let isHighDelta = false;
    let splitDays = 1;
    let warning = "";
    let resultText = "";

    switch (dosingTab) {
      case "alk":
        title = "Alkalinity (dKH)";
        unit = "dKH";
        color = "text-[#3498db]";
        borderColor = "border-[#3498db]";
        bgColor = "bg-[#3498db]";
        delta = alkDiff;
        isHighDelta = alkDiff > 1.0;
        splitDays = Math.ceil(alkDiff / 1.0);
        warning = "Never adjust Alkalinity by more than +1.0 dKH per 24 hours. Rapid swings trigger coral tissue necrosis (RTN).";
        resultText = activeCustomFormula
          ? calculateCustomFormulaResult(activeCustomFormula, delta, title, unit)
          : calculateAlkResult();
        break;
      case "ca":
        title = "Calcium (Ca)";
        unit = "ppm";
        color = "text-[#2ecc71]";
        borderColor = "border-[#2ecc71]";
        bgColor = "bg-[#2ecc71]";
        delta = caDiff;
        isHighDelta = caDiff > 50;
        splitDays = Math.ceil(caDiff / 50);
        warning = "Max recommended daily Calcium increase is +50 ppm. Dose over multiple days to prevent carbonate precipitation.";
        resultText = activeCustomFormula
          ? calculateCustomFormulaResult(activeCustomFormula, delta, title, unit)
          : calculateCaResult();
        break;
      case "mg":
        title = "Magnesium (Mg)";
        unit = "ppm";
        color = "text-purple-400";
        borderColor = "border-purple-500";
        bgColor = "bg-purple-600";
        delta = mgDiff;
        isHighDelta = mgDiff > 100;
        splitDays = Math.ceil(mgDiff / 100);
        warning = "Max recommended daily Magnesium increase is +100 ppm. Ensure slow addition to prevent shock.";
        resultText = activeCustomFormula
          ? calculateCustomFormulaResult(activeCustomFormula, delta, title, unit)
          : calculateMgResult();
        break;
      case "no3":
        title = "Nitrate (NO3)";
        unit = "ppm";
        color = "text-amber-400";
        borderColor = "border-amber-500";
        bgColor = "bg-amber-600";
        delta = no3Diff;
        isHighDelta = no3Diff > 1.5;
        splitDays = Math.ceil(no3Diff / 1.0);
        warning = "Do not increase Nitrate by more than +1.0 to 1.5 ppm per 24 hours to prevent algae blooms.";
        resultText = activeCustomFormula
          ? calculateCustomFormulaResult(activeCustomFormula, delta, title, unit)
          : calculateNo3Result();
        break;
      case "po4":
        title = "Phosphate (PO4)";
        unit = "ppm";
        color = "text-emerald-400";
        borderColor = "border-emerald-500";
        bgColor = "bg-emerald-600";
        delta = po4Diff;
        isHighDelta = po4Diff > 0.02;
        splitDays = Math.ceil(po4Diff / 0.02);
        warning = "Never increase Phosphate by more than +0.02 ppm in 24 hours. Rapid spikes cause severe algae outbreaks and coral stress.";
        resultText = activeCustomFormula
          ? calculateCustomFormulaResult(activeCustomFormula, delta, title, unit)
          : calculatePo4Result();
        break;
      case "k":
        title = "Potassium (K+)";
        unit = "ppm";
        color = "text-indigo-400";
        borderColor = "border-indigo-500";
        bgColor = "bg-indigo-600";
        delta = kDiff;
        isHighDelta = kDiff > 15;
        splitDays = Math.ceil(kDiff / 15);
        warning = "Do not increase Potassium by more than +15 ppm per 24 hours.";
        resultText = activeCustomFormula
          ? calculateCustomFormulaResult(activeCustomFormula, delta, title, unit)
          : calculateKResult();
        break;
      case "fe":
        title = "Iron & Macroalgae (Fe)";
        unit = "ppm";
        color = "text-lime-400";
        borderColor = "border-lime-500";
        bgColor = "bg-lime-600";
        delta = feDiff;
        isHighDelta = false;
        splitDays = 1;
        warning = "Iron is a micro-trace nutrient. Overdosing fuels hair algae and cyanobacteria. Micro-dose only.";
        resultText = activeCustomFormula
          ? calculateCustomFormulaResult(activeCustomFormula, delta, title, unit)
          : calculateFeResult();
        break;
      case "i":
        title = "Iodine / Halogens (I2 / I-)";
        unit = "ppm";
        color = "text-orange-400";
        borderColor = "border-orange-500";
        bgColor = "bg-orange-600";
        delta = iDiff;
        isHighDelta = iDiff > 0.04;
        splitDays = 2;
        warning = "Elemental iodine is toxic in excess. Dose dropwise and never exceed recommended guidelines.";
        resultText = activeCustomFormula
          ? calculateCustomFormulaResult(activeCustomFormula, delta, title, unit)
          : calculateIResult();
        break;
      case "sr":
        title = "Strontium (Sr)";
        unit = "ppm";
        color = "text-cyan-400";
        borderColor = "border-cyan-500";
        bgColor = "bg-cyan-600";
        delta = srDiff;
        isHighDelta = srDiff > 2.0;
        splitDays = Math.ceil(srDiff / 2.0);
        warning = "Max recommended daily Strontium increase is +2.0 ppm. Incorporates into aragonite skeleton alongside calcium.";
        resultText = activeCustomFormula
          ? calculateCustomFormulaResult(activeCustomFormula, delta, title, unit)
          : calculateSrResult();
        break;
      case "all_in_one":
        title = "All-in-One & Multi-Trace";
        unit = "mL";
        color = "text-teal-400";
        borderColor = "border-teal-500";
        bgColor = "bg-teal-600";
        delta = alkDiff;
        isHighDelta = false;
        splitDays = 1;
        warning = "All-in-one products provide balanced calcium and alkalinity. Dose steadily every morning.";
        resultText = activeCustomFormula
          ? calculateCustomFormulaResult(activeCustomFormula, delta, title, unit)
          : calculateAllInOneResult();
        break;
    }

    return {
      title,
      unit,
      color,
      borderColor,
      bgColor,
      delta,
      isHighDelta,
      splitDays,
      warning,
      resultText,
    };
  };

  const activeDetails = getActiveDoseDetails();

  const handlePinDoseToNotes = async () => {
    const formulaName = activeCustomFormula ? activeCustomFormula.name : "Formulation";
    const text = `${activeDetails.title} Dose (${formulaName}): ${activeDetails.resultText} (System: ${doseTankVol} ${
      isMetric ? "L" : "Gal"
    }, Delta: +${activeDetails.delta.toFixed(2)} ${activeDetails.unit})`;
    await onPinRecipeToNotes(
      text,
      `💊 ${activeDetails.title} Dosing Recipe`,
      "recipe"
    );
    setIsPinnedSuccess(true);
    setTimeout(() => setIsPinnedSuccess(false), 3000);
  };

  // Custom Dosing Formula Handlers
  const handleOpenAddDosingFormula = (forElement: DosingElement = dosingTab) => {
    setDosingModalMode("add");
    setDosingFormState({
      id: "",
      name: "",
      brand: "",
      element: forElement,
      unit: "mL",
      doseMode: "rate",
      doseRatePer100L: "1.0",
      ppmPerMlPer100L: "0.1",
      frequency: "Daily",
      instructions: "",
      targetParameters: "",
    });
    setShowDosingModal(true);
  };

  const handleOpenEditDosingFormula = (f: CustomDosingFormula) => {
    setDosingModalMode("edit");
    setDosingFormState({
      id: f.id,
      name: f.name,
      brand: f.brand || "",
      element: f.element,
      unit: f.unit,
      doseMode: f.doseMode,
      doseRatePer100L: f.doseRatePer100L?.toString() || "1.0",
      ppmPerMlPer100L: f.ppmPerMlPer100L?.toString() || "0.1",
      frequency: f.frequency || "Daily",
      instructions: f.instructions || "",
      targetParameters: f.targetParameters || "",
    });
    setShowDosingModal(true);
  };

  const handleSaveDosingFormula = () => {
    const name = dosingFormState.name.trim();
    if (!name) return;

    const newFormula: CustomDosingFormula = {
      id: dosingModalMode === "edit" && dosingFormState.id ? dosingFormState.id : `dose_${Date.now()}`,
      name,
      brand: dosingFormState.brand.trim() || undefined,
      element: dosingFormState.element,
      unit: dosingFormState.unit,
      doseMode: dosingFormState.doseMode,
      doseRatePer100L: parseFloat(dosingFormState.doseRatePer100L) || 1.0,
      ppmPerMlPer100L: parseFloat(dosingFormState.ppmPerMlPer100L) || 0.1,
      frequency: dosingFormState.frequency || "Routine maintenance",
      instructions: dosingFormState.instructions.trim() || undefined,
      targetParameters: dosingFormState.targetParameters.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    let nextList: CustomDosingFormula[];
    if (dosingModalMode === "edit") {
      nextList = customDosingFormulas.map((f) => (f.id === newFormula.id ? newFormula : f));
    } else {
      nextList = [newFormula, ...customDosingFormulas];
    }
    saveCustomDosingFormulas(nextList);

    // Auto-select this custom formula for its element
    setSelectedFormulation((prev) => ({
      ...prev,
      [newFormula.element]: `custom_${newFormula.id}`,
    }));

    // Switch to dosing tab & element
    setDosingTab(newFormula.element);
    setActiveTab("dosing");
    setShowDosingModal(false);
    setProductStatus(`✨ Formulation "${newFormula.name}" saved and selected!`);
    setTimeout(() => setProductStatus(null), 4000);
  };

  const handleDeleteCustomDosingFormula = (id: string) => {
    const f = customDosingFormulas.find((x) => x.id === id);
    const name = f?.name || "this formulation";
    if (!window.confirm(`Are you sure you want to delete formulation "${name}"?`)) {
      return;
    }

    const nextList = customDosingFormulas.filter((x) => x.id !== id);
    saveCustomDosingFormulas(nextList);

    // Reset dropdown for this element to default
    const def = getDefaultFormulationForElement(f?.element || dosingTab);
    setSelectedFormulation((prev) => ({
      ...prev,
      [f?.element || dosingTab]: def,
    }));
    setProductStatus(`✓ Formulation "${name}" deleted.`);
    setTimeout(() => setProductStatus(null), 3500);
  };

  // --- AI Product Identifier Handler ---
  const handleIdentifyProduct = async (queryToUse?: string) => {
    const query = queryToUse !== undefined ? queryToUse : productQuery;
    if (!query.trim() && !productImageBase64) {
      setProductStatus("⚠️ Please enter a brand/model or upload a product photo.");
      setTimeout(() => setProductStatus(null), 4000);
      return;
    }

    setIdentifyingProduct(true);
    setProductStatus(`Analyzing product with ${aiProvider.toUpperCase()} AI & ${isFreshwater ? "Aquarium" : "Reef"} Catalog...`);
    try {
      const res = await fetch("/api/identify-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productQuery: query,
          imageBase64: productImageBase64 || undefined,
          provider: aiProvider,
          apiKey: activeApiKey === "env_configured" ? undefined : activeApiKey,
          tankType: tank.tankType || "SALTWATER",
        }),
      });
      const data = await res.json();
      if (data.product) {
        setIdentifiedProduct(data.product);
        setProductStatus(`✨ Successfully identified: ${data.product.brand} ${data.product.productName}`);
      } else {
        setProductStatus(data.error || "Could not identify product. Check product name or API key.");
      }
    } catch (err) {
      console.error("Product identify error:", err);
      setProductStatus("Failed to analyze product. Please check your network connection.");
    } finally {
      setIdentifyingProduct(false);
      setTimeout(() => setProductStatus(null), 6000);
    }
  };

  // Handlers for dynamic AI buttons
  const handleOpenAddSaltFromAI = (prod: IdentifiedProduct) => {
    setSaltModalMode("add");
    setSaltModalId("");
    setSaltModalName(prod.productName || `${prod.brand} Salt`);
    setSaltModalGrams(prod.gramsPerLiter ? prod.gramsPerLiter.toString() : "38.0");
    setShowSaltModal(true);
  };

  const handleOpenAddDosingFromAI = (prod: IdentifiedProduct) => {
    const detectedElement = detectProductElement(prod);
    const defaults = parseDosingDefaults(prod);

    setDosingModalMode("add");
    setDosingFormState({
      id: "",
      name: prod.productName ? `${prod.brand} ${prod.productName}`.trim() : "Custom Additive",
      brand: prod.brand || "",
      element: detectedElement,
      unit: defaults.unit,
      doseMode: defaults.doseMode,
      doseRatePer100L: defaults.doseRatePer100L.toString(),
      ppmPerMlPer100L: defaults.ppmPerMlPer100L ? defaults.ppmPerMlPer100L.toString() : "0.1",
      frequency: "Routine maintenance",
      instructions: prod.dosingDirections || prod.summary || "",
      targetParameters: prod.targetParameters || "",
    });
    setShowDosingModal(true);
  };

  const handlePinProductDirections = async (prod: IdentifiedProduct) => {
    const text = `Brand: ${prod.brand} | ${prod.productName}
Category: ${prod.category}
Target Parameters: ${prod.targetParameters}
${prod.mixingDirections ? `\nUsage & Mixing Directions:\n${prod.mixingDirections}` : ""}
${prod.dosingDirections ? `\nDosing Directions:\n${prod.dosingDirections}` : ""}
${prod.safetyAndStorage ? `\nStorage & Safety:\n${prod.safetyAndStorage}` : ""}`;

    await onPinRecipeToNotes(
      text,
      `📘 ${prod.brand} ${prod.productName} Directions`,
      "general"
    );
    setAdvisorPinnedSuccess(true);
    setTimeout(() => setAdvisorPinnedSuccess(false), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Main Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#161e2b] border border-[#28364a] p-4 rounded-xl shadow-lg">
        <div>
          <h2 className="text-lg font-bold text-[#f0f4f8] flex items-center gap-2">
            <Calculator className="text-[#00d2be]" size={20} />
            {isFreshwater
              ? "Freshwater Plant Fertilization & Water Prep Studio"
              : "Reef Chemistry Calculators & Trace Dosing Studio"}
          </h2>
          <p className="text-xs text-[#8e9fb5] mt-0.5">
            {isFreshwater
              ? "Calculate Estimative Index & All-in-One plant fertilizer doses, remineralize pure RO/DI water, and identify formulas."
              : "Calibrate salt mixes to exact 35 ppt, calculate safe trace element doses, and identify formulas with AI."}
          </p>
        </div>

        <div className="flex items-center gap-1 bg-[#0f1520] p-1 border border-[#28364a] rounded-lg">
          {isFreshwater ? (
            <>
              <button
                onClick={() => setActiveTab("fert")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  activeTab === "fert"
                    ? "bg-[#00d2be] text-[#0d121a] shadow-sm"
                    : "text-[#8e9fb5] hover:text-[#f0f4f8]"
                }`}
              >
                <Sprout size={14} />
                Plant Fertilizer Dosing
              </button>

              <button
                onClick={() => setActiveTab("remin")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  activeTab === "remin"
                    ? "bg-[#00d2be] text-[#0d121a] shadow-sm"
                    : "text-[#8e9fb5] hover:text-[#f0f4f8]"
                }`}
              >
                <Droplets size={14} />
                RO/DI Remineralizer
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab("salt")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  activeTab === "salt"
                    ? "bg-[#00d2be] text-[#0d121a] shadow-sm"
                    : "text-[#8e9fb5] hover:text-[#f0f4f8]"
                }`}
              >
                <Scale size={14} />
                35 ppt Salt Mixer
              </button>

              <button
                onClick={() => setActiveTab("dosing")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  activeTab === "dosing"
                    ? "bg-[#00d2be] text-[#0d121a] shadow-sm"
                    : "text-[#8e9fb5] hover:text-[#f0f4f8]"
                }`}
              >
                <FlaskConical size={14} />
                Major & Trace Dosing
              </button>
            </>
          )}

          <button
            onClick={() => setActiveTab("aiAdvisor")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === "aiAdvisor"
                ? "bg-gradient-to-r from-[#00d2be] to-emerald-400 text-[#0d121a] shadow-sm"
                : "text-[#00d2be] hover:text-white"
            }`}
          >
            <Sparkles size={14} />
            AI Product Advisor
          </button>
        </div>
      </div>

      {/* Safety & Chemical Advisory Banner */}
      <div className="bg-amber-950/40 border-2 border-amber-500/60 rounded-xl p-4 shadow-lg flex items-start gap-3.5 text-amber-200">
        <AlertTriangle size={22} className="text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
              ⚠️ Critical Safety & Dosing Advisory
            </span>
            <span className="text-xs font-bold text-amber-300">
              Informational Reference Only — Extra Caution Required
            </span>
          </div>
          <p className="text-xs leading-relaxed text-amber-200/90">
            All calculations, {isFreshwater ? "fertilizer ratios, remineralizing mineral doses," : "salt ratios, dosing volumes,"} and product guidelines in this studio are provided <strong>strictly for referencing and estimation purposes</strong>. Exact tank water volume (accounting for rock and sand displacement), test kit variations, and chemical consumption rates differ in every aquarium.
          </p>
          <p className="text-xs leading-relaxed text-amber-300 font-semibold">
            You must be <strong>extra cautious</strong> when {isFreshwater ? "remineralizing pure water or dosing plant fertilizers" : "mixing salt batches or dosing chemical formulas"}: incorrect dosing, rapid parameter swings, or mixing errors <strong>may cause severe osmotic shock and catastrophic tank crashes</strong>. Always verify water parameters with calibrated test kits, start with conservative partial doses, and observe livestock closely.
          </p>
        </div>
      </div>

      {/* Global Status Banner */}
      {productStatus && (
        <div
          className={`text-xs p-3 rounded-xl border flex items-center justify-between ${
            productStatus.includes("⚠️") || productStatus.includes("Failed") || productStatus.includes("Check")
              ? "bg-rose-950/40 text-rose-300 border-rose-500/40"
              : "bg-emerald-950/40 text-emerald-300 border-emerald-500/40 font-medium"
          }`}
        >
          <span>{productStatus}</span>
          <button
            onClick={() => setProductStatus(null)}
            className="text-xs opacity-70 hover:opacity-100 cursor-pointer ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* FRESHWATER VIEW 1: PLANT FERTILIZER DOSING CALCULATOR */}
      {isFreshwater && activeTab === "fert" && (
        <div className="space-y-6">
          <div className="bg-[#161e2b] border border-[#28364a] rounded-xl p-6 shadow-xl space-y-6">
            {/* Header & Sub-Method Selector */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#28364a] pb-4">
              <div>
                <h3 className="font-bold text-base text-[#f0f4f8] flex items-center gap-2">
                  <Sprout className="text-[#00d2be]" size={18} />
                  Aquatic Plant Fertilizer Dosing Studio
                </h3>
                <p className="text-xs text-[#8e9fb5] mt-0.5">
                  Calculate target macro & micro nutrient dosing regimens for lush planted aquariums and Dutch aquascapes.
                </p>
              </div>

              {/* Method Switcher: EI Dry Salts vs All-In-One Commercial Liquid */}
              <div className="flex items-center gap-1 bg-[#0f1520] p-1 border border-[#28364a] rounded-lg">
                <button
                  type="button"
                  onClick={() => setFertMethod("ei")}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    fertMethod === "ei"
                      ? "bg-[#00d2be] text-[#0d121a] shadow-sm"
                      : "text-[#8e9fb5] hover:text-[#f0f4f8]"
                  }`}
                >
                  Estimative Index (EI) Dry Salts
                </button>
                <button
                  type="button"
                  onClick={() => setFertMethod("all_in_one")}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    fertMethod === "all_in_one"
                      ? "bg-[#00d2be] text-[#0d121a] shadow-sm"
                      : "text-[#8e9fb5] hover:text-[#f0f4f8]"
                  }`}
                >
                  Commercial All-In-One Liquids
                </button>
              </div>
            </div>

            {/* Common Tank Volume Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-[#0f1520] p-4 rounded-xl border border-[#28364a]">
              <div>
                <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                  Net Aquarium Water Volume
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={fertVolume}
                    onChange={(e) => setFertVolume(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full bg-[#161e2b] border border-[#28364a] rounded-lg px-3 py-2 text-sm text-[#f0f4f8] focus:border-[#00d2be] outline-none font-bold"
                  />
                  <div className="flex rounded-lg border border-[#28364a] bg-[#161e2b] p-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        if (!fertIsMetric) {
                          setFertIsMetric(true);
                          setFertVolume(parseFloat((fertVolume * 3.78541).toFixed(1)));
                        }
                      }}
                      className={`px-2.5 py-1 text-xs font-bold rounded ${
                        fertIsMetric ? "bg-[#00d2be] text-[#0d121a]" : "text-[#8e9fb5]"
                      }`}
                    >
                      L
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (fertIsMetric) {
                          setFertIsMetric(false);
                          setFertVolume(parseFloat((fertVolume * 0.264172).toFixed(1)));
                        }
                      }}
                      className={`px-2.5 py-1 text-xs font-bold rounded ${
                        !fertIsMetric ? "bg-[#00d2be] text-[#0d121a]" : "text-[#8e9fb5]"
                      }`}
                    >
                      Gal
                    </button>
                  </div>
                </div>
              </div>

              {fertMethod === "ei" ? (
                <div>
                  <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                    Aquarium Lighting & CO2 Level
                  </label>
                  <select
                    value={eiTechLevel}
                    onChange={(e) => setEiTechLevel(e.target.value as any)}
                    className="w-full bg-[#161e2b] border border-[#28364a] rounded-lg px-3 py-2 text-xs text-[#00d2be] font-bold outline-none cursor-pointer"
                  >
                    <option value="high_tech">High-Tech (Pressurized CO2 + High Light)</option>
                    <option value="low_tech">Low-Tech (No CO2 / Low-to-Med Light)</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                    Select All-In-One Liquid Formula
                  </label>
                  <select
                    value={selectedAioBrand}
                    onChange={(e) => setSelectedAioBrand(e.target.value)}
                    className="w-full bg-[#161e2b] border border-[#28364a] rounded-lg px-3 py-2 text-xs text-[#00d2be] font-bold outline-none cursor-pointer"
                  >
                    {Object.entries(AIO_BRANDS).map(([id, b]) => (
                      <option key={id} value={id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex flex-col justify-end">
                <button
                  type="button"
                  onClick={fertMethod === "ei" ? handlePinEiFertSchedule : handlePinAioFertSchedule}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#161e2b] border border-[#28364a] hover:border-[#00d2be] text-xs font-bold text-[#f0f4f8] transition-all cursor-pointer shadow-md"
                >
                  <Pin size={14} className="text-[#00d2be]" />
                  {fertPinnedSuccess ? "✓ Pinned to Sticky Notes!" : "Pin Fertilizer Schedule to Notes"}
                </button>
              </div>
            </div>

            {/* METHOD 1: ESTIMATIVE INDEX DRY SALTS */}
            {fertMethod === "ei" && (
              <div className="space-y-4">
                <div className="bg-[#0f1520] border border-[#28364a] p-4 rounded-xl">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#00d2be] flex items-center gap-1.5">
                      <Scale size={14} /> Tom Barr's Estimative Index (EI) Target Schedule
                    </span>
                    <span className="text-[11px] text-[#8e9fb5] bg-[#161e2b] px-2.5 py-1 rounded-md border border-[#28364a]">
                      {isHighTech ? "Dose 3x Weekly + 50% Sunday Reset" : "Dose 1x Weekly + 25-50% Bi-Weekly Reset"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Macro Nutrients Card */}
                    <div className="bg-[#161e2b] border border-[#28364a] rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-[#28364a] pb-2">
                        <span className="text-xs font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                          🟡 Macro Day Dose ({isHighTech ? "Mon / Wed / Fri" : "Once Weekly"})
                        </span>
                        <span className="text-[10px] text-[#8e9fb5]">Dry powder into tank</span>
                      </div>

                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-xs bg-[#0f1520] p-2.5 rounded-lg border border-[#28364a]/50">
                          <div>
                            <span className="font-bold text-[#f0f4f8]">KNO3 (Potassium Nitrate)</span>
                            <p className="text-[10px] text-[#8e9fb5]">Supplies Nitrate (NO3) & Potassium</p>
                          </div>
                          <div className="text-right">
                            <span className="font-extrabold text-[#00d2be] text-sm">{kno3DoseGrams} g</span>
                            <p className="text-[10px] text-amber-200/80">{gramsToDrySpoon(kno3DoseGrams)}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs bg-[#0f1520] p-2.5 rounded-lg border border-[#28364a]/50">
                          <div>
                            <span className="font-bold text-[#f0f4f8]">KH2PO4 (Monopotassium Phosphate)</span>
                            <p className="text-[10px] text-[#8e9fb5]">Supplies Phosphate (PO4) & Potassium</p>
                          </div>
                          <div className="text-right">
                            <span className="font-extrabold text-[#00d2be] text-sm">{kh2po4DoseGrams} g</span>
                            <p className="text-[10px] text-amber-200/80">{gramsToDrySpoon(kh2po4DoseGrams)}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs bg-[#0f1520] p-2.5 rounded-lg border border-[#28364a]/50">
                          <div>
                            <span className="font-bold text-[#f0f4f8]">K2SO4 (Potassium Sulfate)</span>
                            <p className="text-[10px] text-[#8e9fb5]">Supplies Extra Potassium (K)</p>
                          </div>
                          <div className="text-right">
                            <span className="font-extrabold text-[#00d2be] text-sm">{k2so4DoseGrams} g</span>
                            <p className="text-[10px] text-amber-200/80">{gramsToDrySpoon(k2so4DoseGrams)}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs bg-[#0f1520] p-2.5 rounded-lg border border-[#28364a]/50">
                          <div>
                            <span className="font-bold text-[#f0f4f8]">MgSO4·7H2O (Epsom Salt)</span>
                            <p className="text-[10px] text-[#8e9fb5]">Supplies Magnesium & Sulfur</p>
                          </div>
                          <div className="text-right">
                            <span className="font-extrabold text-[#00d2be] text-sm">{mgso4DoseGrams} g</span>
                            <p className="text-[10px] text-amber-200/80">{gramsToDrySpoon(mgso4DoseGrams)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Micro Nutrients & Reset Card */}
                    <div className="space-y-4">
                      <div className="bg-[#161e2b] border border-[#28364a] rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between border-b border-[#28364a] pb-2">
                          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                            🟢 Micro Day Dose ({isHighTech ? "Tue / Thu / Sat" : "Once Weekly Alternate"})
                          </span>
                          <span className="text-[10px] text-[#8e9fb5]">Never mix with Phosphate</span>
                        </div>

                        <div className="flex items-center justify-between text-xs bg-[#0f1520] p-2.5 rounded-lg border border-[#28364a]/50">
                          <div>
                            <span className="font-bold text-[#f0f4f8]">Plantex CSM+B / Chelated Trace Mix</span>
                            <p className="text-[10px] text-[#8e9fb5]">Supplies Iron (Fe), Mn, Zn, Cu, B, Mo</p>
                          </div>
                          <div className="text-right">
                            <span className="font-extrabold text-[#00d2be] text-sm">{csmDoseGrams} g</span>
                            <p className="text-[10px] text-emerald-200/80">{gramsToDrySpoon(csmDoseGrams)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Sunday Reset Card */}
                      <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-xl p-4 text-xs space-y-2">
                        <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                          💧 Weekly Water Change Reset ({isHighTech ? "50%" : "30-50%"})
                        </span>
                        <p className="text-[#8e9fb5] text-[11px] leading-relaxed">
                          The Estimative Index works by saturating plant uptake needs without testing. The weekly 50% water change mathematically caps maximum nutrient accumulation so levels never build up to toxic thresholds.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Target Element Concentration Benchmarks */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-center">
                  <div className="bg-[#0f1520] border border-[#28364a] p-2.5 rounded-lg">
                    <span className="text-[10px] uppercase font-bold text-[#8e9fb5] block">Target NO3</span>
                    <span className="text-sm font-extrabold text-[#f0f4f8]">15 - 30 ppm</span>
                  </div>
                  <div className="bg-[#0f1520] border border-[#28364a] p-2.5 rounded-lg">
                    <span className="text-[10px] uppercase font-bold text-[#8e9fb5] block">Target PO4</span>
                    <span className="text-sm font-extrabold text-[#f0f4f8]">1.0 - 3.0 ppm</span>
                  </div>
                  <div className="bg-[#0f1520] border border-[#28364a] p-2.5 rounded-lg">
                    <span className="text-[10px] uppercase font-bold text-[#8e9fb5] block">Target K</span>
                    <span className="text-sm font-extrabold text-[#f0f4f8]">10 - 25 ppm</span>
                  </div>
                  <div className="bg-[#0f1520] border border-[#28364a] p-2.5 rounded-lg">
                    <span className="text-[10px] uppercase font-bold text-[#8e9fb5] block">Target Fe</span>
                    <span className="text-sm font-extrabold text-[#f0f4f8]">0.2 - 0.5 ppm</span>
                  </div>
                  <div className="bg-[#0f1520] border border-[#28364a] p-2.5 rounded-lg">
                    <span className="text-[10px] uppercase font-bold text-[#8e9fb5] block">Target Mg</span>
                    <span className="text-sm font-extrabold text-[#f0f4f8]">5 - 10 ppm</span>
                  </div>
                </div>
              </div>
            )}

            {/* METHOD 2: COMMERCIAL ALL-IN-ONE LIQUIDS */}
            {fertMethod === "all_in_one" && (
              <div className="bg-[#0f1520] border border-[#28364a] rounded-xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#28364a] pb-3">
                  <div>
                    <h4 className="text-sm font-extrabold text-[#f0f4f8]">{currentAio.name}</h4>
                    <p className="text-xs text-[#8e9fb5] mt-0.5">{currentAio.notes}</p>
                  </div>
                  <span className="text-xs font-bold text-[#00d2be] bg-[#161e2b] px-3 py-1.5 rounded-lg border border-[#28364a]">
                    Frequency: {currentAio.frequency}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[#161e2b] border border-[#28364a] p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#8e9fb5] block uppercase">Recommended Single Dose</span>
                      <p className="text-2xl font-extrabold text-[#00d2be] mt-1">{aioDoseMl} mL</p>
                      <p className="text-[11px] text-[#8e9fb5] mt-0.5">
                        ≈ {aioPumps} dispenser pump{aioPumps > 1 ? "s" : ""} (standard 2mL pump)
                      </p>
                    </div>
                    <FlaskConical size={32} className="text-[#00d2be]/30" />
                  </div>

                  <div className="bg-[#161e2b] border border-[#28364a] p-4 rounded-xl space-y-1.5">
                    <span className="text-xs font-bold text-[#8e9fb5] block uppercase">Weekly Dosing Protocol</span>
                    <p className="text-xs text-[#f0f4f8] leading-relaxed">
                      Dose <strong className="text-[#00d2be]">{aioDoseMl} mL</strong> at the interval of <strong className="text-emerald-400">{currentAio.frequency}</strong>. Perform a 30% to 50% weekly water change to prevent unconsumed nutrient accumulation and suppress nuisance algae.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FRESHWATER VIEW 2: RO/DI REMINERALIZER CALCULATOR */}
      {isFreshwater && activeTab === "remin" && (
        <div className="space-y-6">
          <div className="bg-[#161e2b] border border-[#28364a] rounded-xl p-6 shadow-xl space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#28364a] pb-4">
              <div>
                <h3 className="font-bold text-base text-[#f0f4f8] flex items-center gap-2">
                  <Droplets className="text-[#00d2be]" size={18} />
                  RO/DI Water Remineralizer & Hardness Calibrator
                </h3>
                <p className="text-xs text-[#8e9fb5] mt-0.5">
                  Weigh precise mineral salts to remineralize 0 TDS pure RO/DI water to exact target dGH, dKH, and TDS for delicate shrimp and planted aquascapes.
                </p>
              </div>

              <button
                type="button"
                onClick={handlePinReminRecipe}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#0f1520] border border-[#28364a] hover:border-[#00d2be] text-xs font-bold text-[#f0f4f8] transition-all cursor-pointer shadow-md"
              >
                <Pin size={14} className="text-[#00d2be]" />
                {reminPinnedSuccess ? "✓ Recipe Pinned!" : "Pin Remineralizer Recipe to Notes"}
              </button>
            </div>

            {/* Target Presets */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#8e9fb5] block mb-2">
                Quick Parameter Presets:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {[
                  { id: "caridina", label: "Caridina Shrimp", sub: "GH 5 • KH 0 • ~110 TDS" },
                  { id: "neocaridina", label: "Neocaridina (Cherry)", sub: "GH 7 • KH 3.5 • ~200 TDS" },
                  { id: "planted", label: "High-Tech Aquascape", sub: "GH 4 • KH 1.5 • ~140 TDS" },
                  { id: "community", label: "Tropical Community", sub: "GH 6 • KH 2.5 • ~180 TDS" },
                  { id: "cichlid", label: "African Cichlid", sub: "GH 14 • KH 10 • ~450 TDS" },
                ].map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectReminPreset(preset.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      reminTargetPreset === preset.id
                        ? "bg-[#00d2be]/10 border-[#00d2be] text-[#00d2be] shadow-sm"
                        : "bg-[#0f1520] border-[#28364a] text-[#8e9fb5] hover:border-[#8e9fb5]"
                    }`}
                  >
                    <span className="block text-xs font-bold text-[#f0f4f8]">{preset.label}</span>
                    <span className="block text-[10px] mt-0.5 opacity-80">{preset.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs: Product & Batch Volume */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-[#0f1520] p-4 rounded-xl border border-[#28364a]">
              <div>
                <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                  Remineralizer Mineral Product
                </label>
                <select
                  value={reminProduct}
                  onChange={(e) => setReminProduct(e.target.value)}
                  className="w-full bg-[#161e2b] border border-[#28364a] rounded-lg px-3 py-2 text-xs text-[#00d2be] font-bold outline-none cursor-pointer"
                >
                  <option value="salty_gh">SaltyShrimp Bee Shrimp Mineral GH+ (0 KH)</option>
                  <option value="salty_gh_kh">SaltyShrimp Shrimp Mineral GH/KH+</option>
                  <option value="seachem_combo">Seachem Equilibrium + Alkaline Buffer Combo</option>
                  <option value="seachem_eq">Seachem Equilibrium (Pure GH booster)</option>
                  <option value="dennerle">Dennerle Shrimp King Mineral</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                  RO/DI Water Volume to Prepare
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={reminWaterVol}
                    onChange={(e) => setReminWaterVol(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full bg-[#161e2b] border border-[#28364a] rounded-lg px-3 py-2 text-sm text-[#f0f4f8] focus:border-[#00d2be] outline-none font-bold"
                  />
                  <div className="flex rounded-lg border border-[#28364a] bg-[#161e2b] p-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        if (!reminIsMetric) {
                          setReminIsMetric(true);
                          setReminWaterVol(parseFloat((reminWaterVol * 3.78541).toFixed(1)));
                        }
                      }}
                      className={`px-2.5 py-1 text-xs font-bold rounded ${
                        reminIsMetric ? "bg-[#00d2be] text-[#0d121a]" : "text-[#8e9fb5]"
                      }`}
                    >
                      L
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (reminIsMetric) {
                          setReminIsMetric(false);
                          setReminWaterVol(parseFloat((reminWaterVol * 0.264172).toFixed(1)));
                        }
                      }}
                      className={`px-2.5 py-1 text-xs font-bold rounded ${
                        !reminIsMetric ? "bg-[#00d2be] text-[#0d121a]" : "text-[#8e9fb5]"
                      }`}
                    >
                      Gal
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                  Target General Hardness (dGH)
                </label>
                <input
                  type="number"
                  min="1"
                  max="25"
                  step="0.5"
                  value={reminTargetDgh}
                  onChange={(e) => setReminTargetDgh(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#161e2b] border border-[#28364a] rounded-lg px-3 py-2 text-sm text-[#f0f4f8] focus:border-[#00d2be] outline-none font-bold"
                />
              </div>
            </div>

            {/* Calculated Output Card */}
            <div className="bg-gradient-to-br from-[#161e2b] to-[#121822] border-2 border-[#00d2be]/40 rounded-xl p-6 shadow-xl space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#00d2be] block mb-1">
                    Required Mineral Dose
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-[#f0f4f8] tracking-tight">
                      {reminGrams}
                    </span>
                    <span className="text-base font-bold text-[#00d2be]">grams</span>
                  </div>
                  <p className="text-xs text-amber-300 font-semibold mt-1">
                    {reminScoopDesc}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-[#0f1520] p-3 rounded-lg border border-[#28364a]">
                    <span className="text-[10px] uppercase font-bold text-[#8e9fb5] block">Resulting GH</span>
                    <span className="text-base font-extrabold text-[#f0f4f8]">{reminTargetDgh} dGH</span>
                  </div>
                  <div className="bg-[#0f1520] p-3 rounded-lg border border-[#28364a]">
                    <span className="text-[10px] uppercase font-bold text-[#8e9fb5] block">Resulting KH</span>
                    <span className="text-base font-extrabold text-[#f0f4f8]">{reminCalculatedDkh} dKH</span>
                  </div>
                  <div className="bg-[#0f1520] p-3 rounded-lg border border-[#28364a]">
                    <span className="text-[10px] uppercase font-bold text-[#8e9fb5] block">Projected TDS</span>
                    <span className="text-base font-extrabold text-[#00d2be]">~{reminEstTds} ppm</span>
                  </div>
                </div>
              </div>

              {/* Mixing Directions Tip */}
              <div className="bg-[#0f1520]/80 p-3.5 rounded-lg border border-[#28364a] text-xs space-y-1 text-[#8e9fb5]">
                <strong className="text-cyan-300 block">💡 Water Preparation Best Practice:</strong>
                <span>
                  Dissolve powder into a bucket of aerated RO/DI water. Stir thoroughly for 2-3 minutes. SaltyShrimp and Equilibrium dissolve rapidly at room temperature. Verify temperature and TDS with a calibrated pen before gently siphoning into your aquarium.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 1: 35 PPT SALT MIXING CALCULATOR (SALTWATER) */}
      {!isFreshwater && activeTab === "salt" && (
        <div className="space-y-6">
          <div className="bg-[#161e2b] border border-[#28364a] rounded-xl p-6 shadow-xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#28364a] pb-4">
              <div>
                <h3 className="font-bold text-base text-[#f0f4f8] flex items-center gap-2">
                  <Scale className="text-[#00d2be]" size={18} />
                  35 ppt Salt Mixing Calculator & Bucket Calibrator
                </h3>
                <p className="text-xs text-[#8e9fb5] mt-0.5">
                  Current calibration: <strong>{selectedFormulaGrams} g/L</strong> for exactly 35.0 ppt / 1.026 SG.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCalibrator(!showCalibrator)}
                  className="px-3 py-1.5 rounded-lg bg-[#0f1520] border border-[#00d2be]/40 text-[#00d2be] hover:bg-[#00d2be] hover:text-[#0d121a] text-xs font-bold transition-all cursor-pointer"
                >
                  ⚖️ Calibrate Bucket
                </button>
                <button
                  onClick={handleOpenAddSaltFormula}
                  className="px-3 py-1.5 rounded-lg bg-[#0f1520] border border-[#28364a] text-[#8e9fb5] hover:text-[#00d2be] hover:border-[#00d2be] text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
                >
                  <PlusCircle size={13} /> Add Salt Formula
                </button>
                <button
                  onClick={() => setActiveTab("aiAdvisor")}
                  className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500 hover:text-[#0d121a] text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles size={12} />
                  AI Salt Lookup
                </button>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#8e9fb5]">
                    RODI Water Volume
                  </label>
                  <div className="flex items-center gap-1 text-[11px] bg-[#0f1520] border border-[#28364a] rounded px-1.5 py-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (!isMetric) {
                          setIsMetric(true);
                          setSaltVolume((prev) => parseFloat((prev * 3.78541).toFixed(1)));
                        }
                      }}
                      className={`font-bold ${isMetric ? "text-[#00d2be]" : "text-[#8e9fb5]"}`}
                    >
                      Liters
                    </button>
                    <span className="text-[#8e9fb5]">/</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (isMetric) {
                          setIsMetric(false);
                          setSaltVolume((prev) => parseFloat((prev * 0.264172).toFixed(1)));
                        }
                      }}
                      className={`font-bold ${!isMetric ? "text-[#00d2be]" : "text-[#8e9fb5]"}`}
                    >
                      Gal
                    </button>
                  </div>
                </div>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={saltVolume}
                  onChange={(e) => setSaltVolume(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-3 py-2 text-sm font-bold text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-[#8e9fb5]">
                    Salt Brand / Formula (35 ppt calibration)
                  </label>
                  {/* Edit / Delete actions for selected formula */}
                  <div className="flex items-center gap-2">
                    {allSaltFormulas.find((f) => f.id === selectedSaltFormulaId) && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            const found = allSaltFormulas.find((f) => f.id === selectedSaltFormulaId);
                            if (found) handleOpenEditSaltFormula(found);
                          }}
                          className="flex items-center gap-1 text-[11px] text-[#8e9fb5] hover:text-[#00d2be] transition-colors cursor-pointer"
                          title="Edit this salt formula"
                        >
                          <Edit3 size={11} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSaltFormulaClick(selectedSaltFormulaId)}
                          className="flex items-center gap-1 text-[11px] text-[#8e9fb5] hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete this salt formula"
                        >
                          <Trash2 size={11} />
                          <span>Delete</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <select
                  value={selectedSaltFormulaId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedSaltFormulaId(id);
                    const found = allSaltFormulas.find((f) => f.id === id);
                    if (found) setSelectedFormulaGrams(found.gramsPerLiter);
                  }}
                  className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-3 py-2 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                >
                  {allSaltFormulas.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.gramsPerLiter} g/L){f.isDefault ? " [Default]" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results Box */}
            <div className="bg-[#0f1520] border-2 border-[#00d2be]/50 rounded-xl p-5 shadow-inner">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8e9fb5]">
                    Exact Required Salt Weight:
                  </span>
                  <div className="text-3xl font-extrabold text-[#00d2be] mt-1 flex items-baseline gap-2">
                    {isMetric ? (
                      <>
                        <span>{exactSaltGrams} grams</span>
                        <span className="text-sm font-semibold text-[#8e9fb5]">
                          (~{exactSaltKg} kg / {exactSaltOz} oz / {exactSaltLbs} lbs)
                        </span>
                      </>
                    ) : (
                      <>
                        <span>{exactSaltOz} oz / {exactSaltLbs} lbs</span>
                        <span className="text-sm font-semibold text-[#8e9fb5]">
                          (~{exactSaltGrams} grams / {exactSaltKg} kg)
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  onClick={handlePinSaltRecipe}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#00d2be] text-[#0d121a] hover:bg-[#14ebd7] text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  <Pin size={13} />
                  {isPinnedSuccess ? "✓ Recipe Pinned!" : "📋 Pin Recipe to Sticky Notes"}
                </button>
              </div>

              {/* Kitchen Volumetric Approximation */}
              <div className="mt-4 pt-4 border-t border-[#28364a]/80">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8e9fb5]">
                  Estimated Kitchen Volumetric Measurement:
                </span>
                <p className="text-lg font-bold text-[#f0f4f8] mt-1">
                  ~ {gramsToKitchen(exactSaltGrams)}
                </p>

                <div className="mt-3 bg-amber-950/40 border border-amber-500/40 rounded-lg p-3 text-[11px] text-amber-200 leading-relaxed flex items-start gap-2.5">
                  <AlertTriangle size={15} className="shrink-0 mt-0.5 text-amber-400" />
                  <div>
                    <strong className="text-amber-300 block mb-0.5">⚠️ Salt Mixing Caution & Reference Advisory:</strong>
                    <span>
                      These measurements are for <strong>referencing only</strong>. Be extra cautious when mixing salt batches—mixing incorrectly, failing to dissolve completely, or rapid salinity shocks <strong>can cause catastrophic tank crashes</strong>. Always verify the prepared water with a calibrated refractometer (target 35.0 ppt / 1.026 SG) and ensure matching water temperature before adding to your aquarium.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Bucket Calibrator Drawer */}
            {showCalibrator && (
              <div className="bg-[#161e2b] border border-[#00d2be] rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#00d2be] flex items-center gap-1.5">
                    <Sparkles size={14} />
                    Live Bucket Calibrator (Refractometer Offset)
                  </h4>
                  <button
                    onClick={() => setShowCalibrator(false)}
                    className="text-xs text-[#8e9fb5] hover:text-[#f0f4f8] cursor-pointer"
                  >
                    ✕ Close
                  </button>
                </div>
                <p className="text-xs text-[#8e9fb5]">
                  Mixed a batch and measured slightly off 35 ppt? Enter your batch readings below to compute this bucket's true grams per liter.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#8e9fb5] mb-1">
                      Water Mixed (Liters)
                    </label>
                    <input
                      type="number"
                      value={calibWaterVol}
                      onChange={(e) => setCalibWaterVol(parseFloat(e.target.value) || 0)}
                      className="w-full bg-[#0f1520] border border-[#28364a] rounded px-3 py-1.5 text-xs text-[#f0f4f8] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#8e9fb5] mb-1">
                      Salt Weighed (Grams)
                    </label>
                    <input
                      type="number"
                      value={calibSaltWeighed}
                      onChange={(e) => setCalibSaltWeighed(parseFloat(e.target.value) || 0)}
                      className="w-full bg-[#0f1520] border border-[#28364a] rounded px-3 py-1.5 text-xs text-[#f0f4f8] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#8e9fb5] mb-1">
                      Measured Refractometer (PPT or SG)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={calibMeasuredSal}
                      onChange={(e) => setCalibMeasuredSal(parseFloat(e.target.value) || 0)}
                      className="w-full bg-[#0f1520] border border-[#28364a] rounded px-3 py-1.5 text-xs text-[#f0f4f8] outline-none"
                    />
                  </div>
                </div>

                <div className="bg-[#0f1520] p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-[#8e9fb5]">True Calibrated Rate:</span>
                    <p className="text-base font-bold text-[#00d2be]">
                      {getCalibratedGramsPerLiter()} g/L for exact 35.0 ppt
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFormulaGrams(parseFloat(getCalibratedGramsPerLiter()));
                      setShowCalibrator(false);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#00d2be] text-[#0d121a] text-xs font-bold cursor-pointer"
                  >
                    Apply Calibrated Rate
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: COMPREHENSIVE MAJOR & TRACE DOSING CALCULATORS (SALTWATER) */}
      {!isFreshwater && activeTab === "dosing" && (
        <div className="space-y-6">
          <div className="bg-[#161e2b] border border-[#28364a] rounded-xl p-6 shadow-xl space-y-5">
            {/* Header & Element Selection */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#28364a] pb-4">
              <div>
                <h3 className="font-bold text-base text-[#f0f4f8] flex items-center gap-2">
                  <FlaskConical className="text-[#00d2be]" size={18} />
                  Elemental & Trace Dosing Calculator
                </h3>
                <p className="text-xs text-[#8e9fb5] mt-0.5">
                  Precision corrective dosing for active system ({doseTankVol} {isMetric ? "Liters" : "Gallons"}).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenAddDosingFormula(dosingTab)}
                  className="px-3 py-1.5 rounded-lg bg-[#0f1520] border border-[#28364a] text-[#8e9fb5] hover:text-[#00d2be] hover:border-[#00d2be] text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
                >
                  <PlusCircle size={13} />
                  Add Dosing Formula
                </button>
                <button
                  onClick={() => setActiveTab("aiAdvisor")}
                  className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500 hover:text-[#0d121a] text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles size={12} />
                  AI Trace Lookup
                </button>
              </div>
            </div>

            {/* Element Sub-Tabs Selector */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#8e9fb5]">
                Select Parameter to Calculate:
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: "alk", label: "Alkalinity (dKH)", color: "border-[#3498db] text-[#3498db]" },
                  { id: "ca", label: "Calcium (Ca)", color: "border-[#2ecc71] text-[#2ecc71]" },
                  { id: "mg", label: "Magnesium (Mg)", color: "border-purple-400 text-purple-400" },
                  { id: "no3", label: "Nitrate (NO3)", color: "border-amber-400 text-amber-400" },
                  { id: "po4", label: "Phosphate (PO4)", color: "border-emerald-400 text-emerald-400" },
                  { id: "k", label: "Potassium (K)", color: "border-indigo-400 text-indigo-400" },
                  { id: "fe", label: "Iron (Fe)", color: "border-lime-400 text-lime-400" },
                  { id: "i", label: "Iodine (I)", color: "border-orange-400 text-orange-400" },
                  { id: "sr", label: "Strontium (Sr)", color: "border-cyan-400 text-cyan-400" },
                  { id: "all_in_one", label: "All-in-One & Multi-Trace", color: "border-teal-400 text-teal-400" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setDosingTab(item.id as DosingElement)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      dosingTab === item.id
                        ? "bg-[#0f1520] border-[#00d2be] text-[#00d2be] shadow-sm ring-1 ring-[#00d2be]/40"
                        : "bg-[#161e2b] border-[#28364a] text-[#8e9fb5] hover:text-[#f0f4f8] hover:border-[#8e9fb5]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Inputs Form */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
              {/* Current Value (Hide for All-in-One routine) */}
              {dosingTab !== "all_in_one" ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                      Current {activeDetails.title}
                    </label>
                    <input
                      type="number"
                      step={dosingTab === "po4" || dosingTab === "fe" || dosingTab === "i" ? "0.001" : "0.1"}
                      value={
                        dosingTab === "alk"
                          ? currentDkh
                          : dosingTab === "ca"
                          ? currentCa
                          : dosingTab === "mg"
                          ? currentMg
                          : dosingTab === "no3"
                          ? currentNo3
                          : dosingTab === "po4"
                          ? currentPo4
                          : dosingTab === "k"
                          ? currentK
                          : dosingTab === "fe"
                          ? currentFe
                          : dosingTab === "i"
                          ? currentI
                          : currentSr
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (dosingTab === "alk") setCurrentDkh(val);
                        else if (dosingTab === "ca") setCurrentCa(val);
                        else if (dosingTab === "mg") setCurrentMg(val);
                        else if (dosingTab === "no3") setCurrentNo3(val);
                        else if (dosingTab === "po4") setCurrentPo4(val);
                        else if (dosingTab === "k") setCurrentK(val);
                        else if (dosingTab === "fe") setCurrentFe(val);
                        else if (dosingTab === "i") setCurrentI(val);
                        else setCurrentSr(val);
                      }}
                      className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-3 py-2 text-xs font-bold text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                      Target {activeDetails.title}
                    </label>
                    <input
                      type="number"
                      step={dosingTab === "po4" || dosingTab === "fe" || dosingTab === "i" ? "0.001" : "0.1"}
                      value={
                        dosingTab === "alk"
                          ? targetDkh
                          : dosingTab === "ca"
                          ? targetCa
                          : dosingTab === "mg"
                          ? targetMg
                          : dosingTab === "no3"
                          ? targetNo3
                          : dosingTab === "po4"
                          ? targetPo4
                          : dosingTab === "k"
                          ? targetK
                          : dosingTab === "fe"
                          ? targetFe
                          : dosingTab === "i"
                          ? targetI
                          : targetSr
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (dosingTab === "alk") setTargetDkh(val);
                        else if (dosingTab === "ca") setTargetCa(val);
                        else if (dosingTab === "mg") setTargetMg(val);
                        else if (dosingTab === "no3") setTargetNo3(val);
                        else if (dosingTab === "po4") setTargetPo4(val);
                        else if (dosingTab === "k") setTargetK(val);
                        else if (dosingTab === "fe") setTargetFe(val);
                        else if (dosingTab === "i") setTargetI(val);
                        else setTargetSr(val);
                      }}
                      className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-3 py-2 text-xs font-bold text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                    />
                  </div>
                </>
              ) : (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                    System Mode
                  </label>
                  <div className="bg-[#0f1520] border border-[#28364a] rounded-lg px-3 py-2 text-xs text-[#00d2be] font-bold">
                    Daily Maintenance & Trace Replenishment Regimen
                  </div>
                </div>
              )}

              {/* System Volume */}
              <div>
                <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                  System Volume ({isMetric ? "Liters" : "Gallons"})
                </label>
                <input
                  type="number"
                  value={doseTankVol}
                  onChange={(e) => setDoseTankVol(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-3 py-2 text-xs font-bold text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                />
              </div>

              {/* Dosing Formulation Dropdown */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#8e9fb5]">
                    Dosing Formulation
                  </label>
                  {/* Action buttons for custom formulation */}
                  {activeCustomFormula && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditDosingFormula(activeCustomFormula)}
                        className="text-[11px] text-[#8e9fb5] hover:text-[#00d2be] flex items-center gap-0.5 cursor-pointer"
                        title="Edit this custom formulation"
                      >
                        <Edit3 size={11} />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCustomDosingFormula(activeCustomFormula.id)}
                        className="text-[11px] text-[#8e9fb5] hover:text-rose-400 flex items-center gap-0.5 cursor-pointer"
                        title="Delete this custom formulation"
                      >
                        <Trash2 size={11} />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>

                <select
                  value={activeFormKey}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedFormulation((prev) => ({ ...prev, [dosingTab]: val }));
                    if (!val.startsWith("custom_")) {
                      if (dosingTab === "alk") setAlkBufferType(val as any);
                      else if (dosingTab === "ca") setCaBufferType(val as any);
                      else if (dosingTab === "mg") setMgBufferType(val as any);
                      else if (dosingTab === "no3") setNo3BufferType(val as any);
                      else if (dosingTab === "po4") setPo4BufferType(val as any);
                      else if (dosingTab === "k") setKBufferType(val as any);
                      else if (dosingTab === "fe") setFeBufferType(val as any);
                      else if (dosingTab === "i") setIBufferType(val as any);
                      else if (dosingTab === "sr") setSrBufferType(val as any);
                      else if (dosingTab === "all_in_one") setAllInOneType(val as any);
                    }
                  }}
                  className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-3 py-2 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                >
                  <optgroup label="Standard Formulations">
                    {dosingTab === "alk" && (
                      <>
                        <option value="sodaAsh">Soda Ash (Sodium Carbonate Na2CO3)</option>
                        <option value="bicarb">Baking Soda (Sodium Bicarbonate NaHCO3)</option>
                        <option value="liquid">Commercial 2-Part Liquid Buffer</option>
                      </>
                    )}
                    {dosingTab === "ca" && (
                      <>
                        <option value="cacl2_dihydrate">Calcium Chloride Dihydrate (CaCl2·2H2O)</option>
                        <option value="cacl2_anhydrous">Calcium Chloride Anhydrous (CaCl2)</option>
                        <option value="liquid">Commercial Liquid 2-Part Calcium</option>
                      </>
                    )}
                    {dosingTab === "mg" && (
                      <>
                        <option value="diy_balanced">Balanced 5:3 DIY (MgCl2 + Epsom Salt)</option>
                        <option value="mgcl2">Magnesium Chloride Hexahydrate (MgCl2·6H2O)</option>
                        <option value="mgso4">Epsom Salt (MgSO4·7H2O)</option>
                        <option value="liquid">Commercial Liquid Magnesium (Red Sea / Brightwell)</option>
                      </>
                    )}
                    {dosingTab === "no3" && (
                      <>
                        <option value="nano3">Sodium Nitrate (NaNO3 dry powder)</option>
                        <option value="kno3">Potassium Nitrate (KNO3 dry powder)</option>
                        <option value="neonitro">Commercial Liquid Nitrate (e.g. NeoNitro)</option>
                      </>
                    )}
                    {dosingTab === "po4" && (
                      <>
                        <option value="na3po4">Trisodium Phosphate (Na3PO4 dry)</option>
                        <option value="kh2po4">Monopotassium Phosphate (KH2PO4)</option>
                        <option value="neophos">Commercial Liquid Phosphate (e.g. NeoPhos)</option>
                      </>
                    )}
                    {dosingTab === "k" && (
                      <>
                        <option value="kcl">Potassium Chloride (KCl dry powder)</option>
                        <option value="liquid">Commercial Liquid Potassium (Trace-Colors B / Potassion)</option>
                      </>
                    )}
                    {dosingTab === "fe" && (
                      <>
                        <option value="liquid">Commercial Liquid Iron (Trace-Colors C / Ferrion)</option>
                        <option value="chelated">Chelated Iron (Iron-EDTA 13% Fe)</option>
                      </>
                    )}
                    {dosingTab === "i" && (
                      <>
                        <option value="lugols">Lugol's Solution (Concentrated Drops)</option>
                        <option value="ki">Potassium Iodide (KI powder)</option>
                        <option value="liquid">Commercial Liquid Iodine (Trace-Colors A / Iodion)</option>
                      </>
                    )}
                    {dosingTab === "sr" && (
                      <>
                        <option value="srcl2">Strontium Chloride (SrCl2·6H2O)</option>
                        <option value="liquid">Commercial Liquid Strontium (Strontion)</option>
                      </>
                    )}
                    {dosingTab === "all_in_one" && (
                      <>
                        <option value="all_for_reef">Tropic Marin All-For-Reef (5 mL / 100L daily)</option>
                        <option value="core7">Triton Core7 Base Elements (2 mL / 100L daily)</option>
                        <option value="balling_trace">Fauna Marin Balling Light Trace System</option>
                      </>
                    )}
                  </optgroup>

                  {/* Custom Formulations for this element */}
                  {customDosingFormulas.filter((f) => f.element === dosingTab).length > 0 && (
                    <optgroup label="Custom Added Formulations">
                      {customDosingFormulas
                        .filter((f) => f.element === dosingTab)
                        .map((f) => (
                          <option key={f.id} value={`custom_${f.id}`}>
                            {f.name} (
                            {f.doseMode === "ppm_delta"
                              ? `+${f.ppmPerMlPer100L} ppm per mL/100L`
                              : `${f.doseRatePer100L} ${f.unit}/100L`}
                            )
                          </option>
                        ))}
                    </optgroup>
                  )}
                </select>
              </div>
            </div>

            {/* High Delta Warning */}
            {activeDetails.isHighDelta && (
              <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-3 text-xs text-rose-300 flex items-start gap-2.5">
                <AlertTriangle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold mb-0.5">
                    ⚠️ High Swing Warning: Delta is +{activeDetails.delta.toFixed(2)} {activeDetails.unit}!
                  </strong>
                  <span>
                    {activeDetails.warning} Dose this safely over at least {activeDetails.splitDays} separate consecutive days.
                  </span>
                </div>
              </div>
            )}

            {/* Dosing Calculation Result Display */}
            <div className="bg-[#0f1520] border-2 border-[#00d2be]/50 rounded-xl p-5 shadow-inner space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8e9fb5]">
                    Recommended Safe Dose for {activeDetails.title}:
                  </span>
                  <div className="text-xl font-bold text-[#00d2be] leading-relaxed">
                    {activeDetails.resultText}
                  </div>
                  {activeDetails.delta > 0 && dosingTab !== "all_in_one" && (
                    <p className="text-xs text-[#8e9fb5]">
                      Net correction: +{activeDetails.delta.toFixed(2)} {activeDetails.unit} in {doseTankVol}{" "}
                      {isMetric ? "L" : "Gal"}
                    </p>
                  )}
                </div>

                <button
                  onClick={handlePinDoseToNotes}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#00d2be] text-[#0d121a] hover:bg-[#14ebd7] text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  <Pin size={13} />
                  {isPinnedSuccess ? "✓ Dose Pinned!" : "📋 Pin Dose to Sticky Notes"}
                </button>
              </div>

              {/* Custom Formula Instructions Banner if applicable */}
              {activeCustomFormula && activeCustomFormula.instructions && (
                <div className="pt-2 border-t border-[#28364a]/80 text-xs text-[#8e9fb5] leading-relaxed flex items-start gap-2">
                  <Info size={14} className="text-[#00d2be] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#f0f4f8] block">Product Directions:</strong>
                    <span>{activeCustomFormula.instructions}</span>
                  </div>
                </div>
              )}

              {/* Chemical Dosing Caution Advisory */}
              <div className="pt-3 border-t border-[#28364a]/80 bg-amber-950/30 border border-amber-500/40 rounded-lg p-3 text-[11px] text-amber-200 leading-relaxed flex items-start gap-2.5">
                <AlertTriangle size={15} className="shrink-0 mt-0.5 text-amber-400" />
                <div>
                  <strong className="text-amber-300 block mb-0.5">⚠️ Dosing Caution & Reference Advisory:</strong>
                  <span>
                    Dosing calculations are strictly for <strong>referencing only</strong>. Always be <strong>extra cautious</strong> when dosing any chemical formula into your aquarium—dosing too fast, overdosing, or miscalculating net water volume <strong>can precipitate essential elements and cause catastrophic tank crashes</strong>. Always re-test baseline water parameters with accurate kits before adding any supplement, and split large adjustments over multiple days.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: AI SALT BUCKET & TRACE ELEMENTS PRODUCT ADVISOR */}
      {activeTab === "aiAdvisor" && (
        <div className="space-y-6">
          <div className="bg-[#161e2b] border border-[#28364a] rounded-xl p-6 shadow-xl space-y-5">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#28364a] pb-4">
              <div>
                <h3 className="font-bold text-base text-[#f0f4f8] flex items-center gap-2">
                  <Sparkles className="text-[#00d2be]" size={18} />
                  {isFreshwater
                    ? "AI Plant Fertilizer & Remineralizer Product Advisor"
                    : "AI Salt Bucket & Trace Elements Product Identifier"}
                </h3>
                <p className="text-xs text-[#8e9fb5] mt-0.5">
                  {isFreshwater
                    ? "Type a brand/product or upload a label photo to get instant dosing recommendations, mineral breakdown, and directions."
                    : "Type a brand/model or upload a label photo to get instant mixing directions, dosing guidelines, and target parameters."}
                </p>
              </div>

              {/* Multi-Provider Key Input */}
              <div className="flex items-center gap-2">
                <select
                  value={aiProvider}
                  onChange={(e) => handleProviderChange(e.target.value)}
                  className="bg-[#0f1520] border border-[#28364a] rounded px-2 py-1 text-xs text-[#00d2be] font-bold outline-none cursor-pointer"
                >
                  <option value="gemini">Gemini</option>
                  <option value="openai">OpenAI (GPT-4o)</option>
                  <option value="anthropic">Claude</option>
                  <option value="openrouter">OpenRouter</option>
                </select>
                <input
                  type="password"
                  placeholder={`Paste ${aiProvider.toUpperCase()} Key`}
                  value={activeApiKey === "env_configured" ? "" : activeApiKey}
                  onChange={(e) => handleSaveApiKey(e.target.value)}
                  className="w-36 bg-[#0f1520] border border-[#28364a] rounded px-2 py-1 text-xs text-[#f0f4f8] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowAiModal(true)}
                  className="text-xs text-[#8e9fb5] hover:text-[#00d2be] flex items-center gap-1 cursor-pointer font-medium"
                >
                  <Settings size={13} />
                </button>
              </div>
            </div>

            {/* Quick Suggestion Pills */}
            <div>
              <span className="text-[11px] font-semibold text-[#8e9fb5] block mb-1.5">
                {isFreshwater
                  ? "Quick-Search Popular Plant Ferts & Mineral Conditioners:"
                  : "Quick-Search Popular Salt & Trace Brands:"}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(isFreshwater
                  ? [
                      "NilocG Thrive",
                      "APT Complete (2Hr Aquarist)",
                      "APT 1 Zero",
                      "Easy Green (Aquarium Co-Op)",
                      "Seachem Flourish",
                      "SaltyShrimp GH/KH+",
                      "SaltyShrimp Bee Shrimp Mineral GH+",
                      "Seachem Equilibrium",
                      "Seachem Alkaline Buffer",
                      "ADA Brighty K",
                      "Tropica Specialised",
                    ]
                  : [
                      "Red Sea Coral Pro",
                      "Tropic Marin Pro-Reef",
                      "Aquaforest Reef Salt",
                      "Instant Ocean Reef Crystals",
                      "Red Sea Trace-Colors A",
                      "Red Sea Trace-Colors B",
                      "Brightwell NeoNitro",
                      "Brightwell NeoPhos",
                      "Fauna Marin Balling Trace",
                      "Triton Core7 Base Elements",
                      "Tropic Marin All-For-Reef",
                      "Lugol's Solution",
                    ]
                ).map((preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      setProductQuery(preset);
                      handleIdentifyProduct(preset);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-[#0f1520] border border-[#28364a] text-[#8e9fb5] hover:text-[#00d2be] hover:border-[#00d2be]/50 transition-all cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs: Text Search & Photo Upload */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Text Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#8e9fb5] flex items-center gap-1.5">
                  <Search size={13} className="text-[#00d2be]" /> Type Brand / Product Name or Model
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={
                      isFreshwater
                        ? "e.g. NilocG Thrive, APT Complete, SaltyShrimp GH/KH+, Seachem Equilibrium..."
                        : "e.g. Red Sea Coral Pro Salt, Brightwell NeoNitro, Tropic Marin Pro-Reef..."
                    }
                    value={productQuery}
                    onChange={(e) => setProductQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleIdentifyProduct();
                      }
                    }}
                    className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-3 py-2 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                  />
                </div>
                <p className="text-[10px] text-[#8e9fb5]">
                  Press Enter or click Identify below to analyze formulas and mixing ratios.
                </p>
              </div>

              {/* Photo Upload */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#8e9fb5] flex items-center gap-1.5">
                  <Camera size={13} className="text-[#00d2be]" /> {isFreshwater ? "OR Upload Fertilizer / Mineral Label Photo" : "OR Upload Salt Bucket / Bottle Label Photo"}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setProductImageName(file.name);
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                          const result = evt.target?.result as string;
                          if (result) {
                            setProductImageBase64(result);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="block w-full text-xs text-[#8e9fb5] file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#00d2be] file:text-[#0d121a] hover:file:bg-[#14ebd7] cursor-pointer"
                  />
                  {productImageBase64 && (
                    <button
                      type="button"
                      onClick={() => {
                        setProductImageBase64("");
                        setProductImageName("");
                      }}
                      className="p-1 rounded text-[#8e9fb5] hover:text-rose-400 cursor-pointer"
                      title="Clear photo"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                {productImageName && (
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <Check size={11} /> Photo ready: {productImageName}
                  </p>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div>
              <button
                type="button"
                onClick={() => handleIdentifyProduct()}
                disabled={identifyingProduct || (!productQuery.trim() && !productImageBase64)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-gradient-to-r from-[#00d2be] to-emerald-400 text-[#0d121a] font-bold text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                {identifyingProduct ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Analyzing product with AI...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    ✨ Identify Product & Generate Usage Directions
                  </>
                )}
              </button>
            </div>

            {/* Identified Product Result Card */}
            {identifiedProduct && (
              <div className="bg-[#0f1520] border-2 border-[#00d2be]/50 rounded-xl p-5 space-y-4 shadow-xl">
                {/* Header Banner */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#28364a] pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-[#00d2be] text-[#0d121a]">
                        {identifiedProduct.brand}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-[#28364a] text-[#f0f4f8]">
                        {identifiedProduct.category}
                      </span>
                    </div>
                    <h4 className="text-lg font-extrabold text-[#f0f4f8] mt-1">
                      {identifiedProduct.productName}
                    </h4>
                  </div>

                  {/* Action Buttons: Add Salt vs Add Trace Element */}
                  <div className="flex flex-wrap items-center gap-2">
                    {isSaltProduct(identifiedProduct) ? (
                      <button
                        type="button"
                        onClick={() => handleOpenAddSaltFromAI(identifiedProduct)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#00d2be] text-[#0d121a] text-xs font-bold hover:bg-[#14ebd7] transition-all cursor-pointer shadow-md"
                      >
                        <Scale size={14} />
                        {isFreshwater ? "Add remineralizer formula" : "Add salt mix formula"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenAddDosingFromAI(identifiedProduct)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#00d2be] to-emerald-400 text-[#0d121a] text-xs font-bold hover:opacity-90 transition-all cursor-pointer shadow-md"
                      >
                        <FlaskConical size={14} />
                        {isFreshwater ? "Add plant fertilizer formula" : "Add trace element dosing formula"}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handlePinProductDirections(identifiedProduct)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161e2b] text-[#f0f4f8] border border-[#28364a] hover:border-[#00d2be] text-xs font-bold transition-all cursor-pointer"
                    >
                      <Pin size={13} className="text-[#00d2be]" />
                      {advisorPinnedSuccess ? "✓ Pinned!" : "Pin to Sticky Notes"}
                    </button>
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8e9fb5] block mb-1">
                    Product Overview:
                  </span>
                  <p className="text-xs text-[#f0f4f8] leading-relaxed">
                    {identifiedProduct.summary}
                  </p>
                </div>

                {/* Target Parameters */}
                {identifiedProduct.targetParameters && (
                  <div className="bg-[#161e2b] border border-[#28364a] p-3 rounded-lg">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#00d2be] flex items-center gap-1.5 mb-1">
                      <Droplets size={13} /> Formulated Target Parameters
                    </span>
                    <p className="text-xs text-[#f0f4f8] font-mono">
                      {identifiedProduct.targetParameters}
                    </p>
                  </div>
                )}

                {/* Usage & Mixing Directions */}
                {identifiedProduct.mixingDirections && (
                  <div className="bg-[#161e2b] border border-[#28364a] p-3.5 rounded-lg space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                      <Scale size={13} /> Usage & Mixing Directions
                    </span>
                    <p className="text-xs text-[#f0f4f8] leading-relaxed whitespace-pre-line">
                      {identifiedProduct.mixingDirections}
                    </p>
                  </div>
                )}

                {/* Dosing Directions */}
                {identifiedProduct.dosingDirections && (
                  <div className="bg-[#161e2b] border border-[#28364a] p-3.5 rounded-lg space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <FlaskConical size={13} /> Dosing Directions & Regimen
                    </span>
                    <p className="text-xs text-[#f0f4f8] leading-relaxed whitespace-pre-line">
                      {identifiedProduct.dosingDirections}
                    </p>
                  </div>
                )}

                {/* Safety & Storage */}
                {identifiedProduct.safetyAndStorage && (
                  <div className="bg-[#161e2b] border border-amber-800/40 p-3 rounded-lg flex items-start gap-2 text-xs text-amber-200/90 leading-relaxed">
                    <AlertTriangle size={15} className="text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-300 block mb-0.5">Storage & Safety Advisory:</strong>
                      {identifiedProduct.safetyAndStorage}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: Add / Edit Salt Formula Modal */}
      {showSaltModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#161e2b] border border-[#28364a] rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#28364a] pb-2">
              <h3 className="text-sm font-bold text-[#f0f4f8] flex items-center gap-2">
                <Scale className="text-[#00d2be]" size={16} />
                {saltModalMode === "edit" ? "Edit Salt Formula" : "Add Salt Mix Formula"}
              </h3>
              <button
                type="button"
                onClick={() => setShowSaltModal(false)}
                className="text-xs text-[#8e9fb5] hover:text-[#f0f4f8] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-[#8e9fb5] mb-1">Formula / Brand Name</label>
                <input
                  type="text"
                  placeholder="e.g. Red Sea Coral Pro Salt"
                  value={saltModalName}
                  onChange={(e) => setSaltModalName(e.target.value)}
                  className="w-full bg-[#0f1520] border border-[#28364a] rounded px-3 py-2 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-[#8e9fb5] mb-1">
                  Grams Per Liter (for exact 35 ppt / 1.026 SG)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={saltModalGrams}
                  onChange={(e) => setSaltModalGrams(e.target.value)}
                  className="w-full bg-[#0f1520] border border-[#28364a] rounded px-3 py-2 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                />
                <p className="text-[10px] text-[#8e9fb5] mt-1">
                  Standard marine salts range between 36.5 to 39.5 g/L.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#28364a]">
                <button
                  type="button"
                  onClick={() => setShowSaltModal(false)}
                  className="px-3 py-1.5 text-xs text-[#8e9fb5] hover:text-[#f0f4f8] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveSaltFormula}
                  disabled={!saltModalName.trim()}
                  className="px-4 py-1.5 rounded-lg bg-[#00d2be] text-[#0d121a] font-bold text-xs disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {saltModalMode === "edit" ? "Save Changes" : "Save Formula"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Add / Edit Custom Dosing Formulation Modal */}
      {showDosingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#161e2b] border border-[#28364a] rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#28364a] pb-2">
              <h3 className="text-sm font-bold text-[#f0f4f8] flex items-center gap-2">
                <FlaskConical className="text-[#00d2be]" size={16} />
                {dosingModalMode === "edit" ? "Edit Dosing Formulation" : "Add Trace Element Dosing Formula"}
              </h3>
              <button
                type="button"
                onClick={() => setShowDosingModal(false)}
                className="text-xs text-[#8e9fb5] hover:text-[#f0f4f8] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#8e9fb5] mb-1">Product / Formula Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Brightwell NeoNitro"
                    value={dosingFormState.name}
                    onChange={(e) => setDosingFormState({ ...dosingFormState, name: e.target.value })}
                    className="w-full bg-[#0f1520] border border-[#28364a] rounded px-3 py-1.5 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#8e9fb5] mb-1">Brand (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Brightwell Aquatics"
                    value={dosingFormState.brand}
                    onChange={(e) => setDosingFormState({ ...dosingFormState, brand: e.target.value })}
                    className="w-full bg-[#0f1520] border border-[#28364a] rounded px-3 py-1.5 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#8e9fb5] mb-1">Target Element / Category</label>
                  <select
                    value={dosingFormState.element}
                    onChange={(e) => setDosingFormState({ ...dosingFormState, element: e.target.value as DosingElement })}
                    className="w-full bg-[#0f1520] border border-[#28364a] rounded px-3 py-1.5 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                  >
                    <option value="alk">Alkalinity (dKH)</option>
                    <option value="ca">Calcium (Ca)</option>
                    <option value="mg">Magnesium (Mg)</option>
                    <option value="no3">Nitrate (NO3)</option>
                    <option value="po4">Phosphate (PO4)</option>
                    <option value="k">Potassium (K)</option>
                    <option value="fe">Iron (Fe)</option>
                    <option value="i">Iodine (I)</option>
                    <option value="sr">Strontium (Sr)</option>
                    <option value="all_in_one">All-in-One & Multi-Trace</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-[#8e9fb5] mb-1">Dosing Mode</label>
                  <select
                    value={dosingFormState.doseMode}
                    onChange={(e) => setDosingFormState({ ...dosingFormState, doseMode: e.target.value as any })}
                    className="w-full bg-[#0f1520] border border-[#28364a] rounded px-3 py-1.5 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                  >
                    <option value="rate">Routine Maintenance Dose (per 100L)</option>
                    <option value="ppm_delta">Target Delta Correction (ppm boost per mL)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {dosingFormState.doseMode === "rate" ? (
                  <div>
                    <label className="block text-xs text-[#8e9fb5] mb-1">Dose per 100 Liters</label>
                    <input
                      type="number"
                      step="0.1"
                      value={dosingFormState.doseRatePer100L}
                      onChange={(e) => setDosingFormState({ ...dosingFormState, doseRatePer100L: e.target.value })}
                      className="w-full bg-[#0f1520] border border-[#28364a] rounded px-3 py-1.5 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs text-[#8e9fb5] mb-1">PPM Boost per 1 mL / 100L</label>
                    <input
                      type="number"
                      step="0.01"
                      value={dosingFormState.ppmPerMlPer100L}
                      onChange={(e) => setDosingFormState({ ...dosingFormState, ppmPerMlPer100L: e.target.value })}
                      className="w-full bg-[#0f1520] border border-[#28364a] rounded px-3 py-1.5 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs text-[#8e9fb5] mb-1">Measurement Unit</label>
                  <select
                    value={dosingFormState.unit}
                    onChange={(e) => setDosingFormState({ ...dosingFormState, unit: e.target.value as any })}
                    className="w-full bg-[#0f1520] border border-[#28364a] rounded px-3 py-1.5 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                  >
                    <option value="mL">mL (Liquid)</option>
                    <option value="drops">Drops (Concentrate)</option>
                    <option value="g">Grams (Dry Powder)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-[#8e9fb5] mb-1">Dosing Frequency</label>
                  <input
                    type="text"
                    placeholder="e.g. Daily or Weekly"
                    value={dosingFormState.frequency}
                    onChange={(e) => setDosingFormState({ ...dosingFormState, frequency: e.target.value })}
                    className="w-full bg-[#0f1520] border border-[#28364a] rounded px-3 py-1.5 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#8e9fb5] mb-1">Usage & Dosing Instructions</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Dose slowly into high-flow sump area. Do not raise NO3 by more than 1.5 ppm per day."
                  value={dosingFormState.instructions}
                  onChange={(e) => setDosingFormState({ ...dosingFormState, instructions: e.target.value })}
                  className="w-full bg-[#0f1520] border border-[#28364a] rounded px-3 py-1.5 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#28364a]">
                <button
                  type="button"
                  onClick={() => setShowDosingModal(false)}
                  className="px-3 py-1.5 text-xs text-[#8e9fb5] hover:text-[#f0f4f8] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveDosingFormula}
                  disabled={!dosingFormState.name.trim()}
                  className="px-4 py-1.5 rounded-lg bg-[#00d2be] text-[#0d121a] font-bold text-xs disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {dosingModalMode === "edit" ? "Save Changes" : "Save Dosing Formula"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Provider AI Settings Modal */}
      <AiSettingsModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        onKeysUpdated={syncAiKeysAndProvider}
      />
    </div>
  );
}
