export interface IdentifiedProduct {
  brand: string;
  productName: string;
  category: "Salt Mix" | "Trace Element" | "Major Buffer (Ca/Alk/Mg)" | "Nutrient Supplement (NO3/PO4)" | "All-In-One Reef Additive" | "Plant Fertilizer" | "RO/DI Remineralizer" | "Other";
  summary: string;
  targetParameters: string;
  gramsPerLiter?: number;
  mixingDirections?: string;
  dosingDirections?: string;
  safetyAndStorage: string;
  compatibleCalculators?: string[];
  recommendedDoseRule?: string;
}

export const PRODUCT_CATALOG: IdentifiedProduct[] = [
  // --- SALTS ---
  {
    brand: "Red Sea",
    productName: "Red Sea Salt (Blue Bucket)",
    category: "Salt Mix",
    summary: "Formulated for natural seawater balance, ideal for mixed reefs and SPS-dominant systems with accelerated coral growth and controlled nutrient regimes.",
    targetParameters: "Salinity 35.0 ppt / 1.026 SG | Alkalinity 7.8 - 8.2 dKH | Calcium 420 - 440 ppm | Magnesium 1280 - 1340 ppm",
    gramsPerLiter: 38.0,
    mixingDirections: "Dissolve 38.0 grams of salt per liter (approx. 1/2 cup per gallon) of pure RO/DI water at 20-25°C (68-77°F). Mix vigorously for no longer than 2 hours. Prolonged mixing causes calcium carbonate precipitation and cloudiness.",
    dosingDirections: "Prepare as fresh saltwater for routine 10-20% weekly or bi-weekly water changes. Check salinity with a calibrated refractometer before adding to tank.",
    safetyAndStorage: "Store bucket tightly sealed in a dry, cool area. Reseal internal plastic liner immediately after each use to prevent atmospheric moisture from causing clumping.",
    compatibleCalculators: ["salt"],
  },
  {
    brand: "Red Sea",
    productName: "Red Sea Coral Pro Salt (Black Bucket)",
    category: "Salt Mix",
    summary: "High-parameter salt mix formulated with elevated foundation elements specifically engineered to promote accelerated coral growth in frags and fast-growing SPS/LPS.",
    targetParameters: "Salinity 35.0 ppt / 1.026 SG | Alkalinity 11.5 - 12.2 dKH | Calcium 450 - 480 ppm | Magnesium 1350 - 1420 ppm",
    gramsPerLiter: 38.2,
    mixingDirections: "Mix 38.2 grams per liter of ambient RO/DI water (20°C / 68°F). Aerate for max 20-30 minutes until crystal clear. NEVER heat water above 25°C before salt has completely dissolved to avoid rapid alkalinity precipitation.",
    dosingDirections: "Ideal for systems running high lighting (PAR 250-450) and elevated nutrient levels (NO3 10-20 ppm). Not recommended for ultra-low nutrient systems (ULNS) due to risk of burnt SPS tips.",
    safetyAndStorage: "Keep lid securely locked. High calcium and carbonate levels make this salt exceptionally hygroscopic; exposure to air will cause solid cake formation.",
    compatibleCalculators: ["salt"],
  },
  {
    brand: "Tropic Marin",
    productName: "Tropic Marin Pro-Reef Salt",
    category: "Salt Mix",
    summary: "Pharmaceutical-grade synthetic sea salt designed for modern reef aquariums. Provides pristine purity, near-zero contaminants, and exact natural coral reef ratios.",
    targetParameters: "Salinity 35.0 ppt / 1.026 SG | Alkalinity 7.0 - 8.0 dKH | Calcium 430 - 450 ppm | Magnesium 1320 - 1380 ppm",
    gramsPerLiter: 37.8,
    mixingDirections: "Dissolve 37.8 g of Pro-Reef salt per liter of RO/DI water. Stir continuously with a powerhead. Dissolves within minutes into crystal-clear water with no residue or precipitate.",
    dosingDirections: "Can be mixed and used within 30 minutes. Excellent for sensitive Acropora tanks and automated water change systems.",
    safetyAndStorage: "Store in a dry room. Pharmaceutical-grade salt has minimal anti-caking agents, so seal bag tightly.",
    compatibleCalculators: ["salt"],
  },
  {
    brand: "Aquaforest",
    productName: "Aquaforest Reef Salt",
    category: "Salt Mix",
    summary: "Marine salt designed for SPS, LPS, and soft coral aquariums. Enriched with amino acids and essential micronutrients for enhanced polyp expansion and coloration.",
    targetParameters: "Salinity 35.0 ppt / 1.026 SG | Alkalinity 7.4 - 8.2 dKH | Calcium 430 - 450 ppm | Magnesium 1300 - 1360 ppm",
    gramsPerLiter: 39.0,
    mixingDirections: "Dissolve 39.0 grams of salt per liter of RO/DI water at 24°C (75°F). Mix for 15 to 45 minutes with a circulation pump.",
    dosingDirections: "Prepare for 10% weekly water changes. Water is ready to use once clear and salinity reaches 35 ppt (1.026 SG).",
    safetyAndStorage: "Store in dark, dry place at room temperature. Keep out of reach of children.",
    compatibleCalculators: ["salt"],
  },
  {
    brand: "Instant Ocean",
    productName: "Reef Crystals Reef Salt",
    category: "Salt Mix",
    summary: "Enriched sea salt formula containing extra calcium, vitamins, and trace elements to stimulate growth of large and small polyp stony corals and coralline algae.",
    targetParameters: "Salinity 35.0 ppt / 1.026 SG | Alkalinity 11.0 - 12.5 dKH | Calcium 460 - 490 ppm | Magnesium 1350 - 1450 ppm",
    gramsPerLiter: 36.5,
    mixingDirections: "Stir 1/2 cup (approx. 36.5 grams) per 1 gallon of RO/DI water. Aerate for 1-2 hours until dissolved.",
    dosingDirections: "Perform standard 10-20% monthly water changes. Due to elevated alkalinity, match salinity and check dKH before adding large volumes.",
    safetyAndStorage: "Keep bucket lid snapped shut to prevent moisture hardening.",
    compatibleCalculators: ["salt"],
  },

  // --- TRACE ELEMENTS & SUPPLEMENTS ---
  {
    brand: "Red Sea",
    productName: "Trace-Colors A (Iodine / Halogens)",
    category: "Trace Element",
    summary: "Iodine, Bromine, and Fluorine supplement promoting vibrant pink and purple chromoproteins in soft and stony corals, and aiding crustacean molting.",
    targetParameters: "Natural seawater Iodine baseline: 0.06 ppm (I- / IO3-)",
    dosingDirections: "Standard dose: 1 mL per 100 Liters (25 gal) of aquarium volume for every 20 ppm of Calcium consumed by your tank, or dose based on weekly Iodine test kit (target 0.04-0.08 ppm).",
    safetyAndStorage: "Never overdose Iodine. Excessive iodine can burn coral tips and stimulate brown dinoflagellates. Store in a dark cabinet away from direct sunlight.",
    compatibleCalculators: ["iodine"],
    recommendedDoseRule: "1 mL per 100L based on 20 ppm Ca consumption",
  },
  {
    brand: "Red Sea",
    productName: "Trace-Colors B (Potassium)",
    category: "Trace Element",
    summary: "Potassium and Boron complex promoting vivid red and pink pigmentation in SPS corals and maintaining proper cellular fluid balance in aragonite matrices.",
    targetParameters: "Target Potassium level: 390 - 420 ppm (ideal 400-410 ppm)",
    dosingDirections: "Standard dose: 1 mL per 100 Liters (25 gal) for every 20 ppm Calcium uptake. Can also be dosed via dedicated Potassium test kit to correct low K+.",
    safetyAndStorage: "Keep tightly capped. Do not raise potassium by more than 15 ppm per 24 hours.",
    compatibleCalculators: ["potassium"],
    recommendedDoseRule: "1 mL per 100L based on 20 ppm Ca consumption",
  },
  {
    brand: "Red Sea",
    productName: "Trace-Colors C (Iron & Trace Metals)",
    category: "Trace Element",
    summary: "Iron, Manganese, Cobalt, Copper, Zinc, and Chromium complex promoting deep green and yellow fluorescent proteins (GFP) and fueling chaetomorpha refugiums.",
    targetParameters: "Target Iron level: 0.002 - 0.005 ppm (~0.15 mg/L in refugium)",
    dosingDirections: "Standard dose: 1 mL per 100 Liters (25 gal) for every 20 ppm Calcium consumption. For dedicated refugium growth, micro-dose 0.5 mL per 100L twice weekly.",
    safetyAndStorage: "Dose into high-flow sump area. Overdosing iron can fuel bryopsis or hair algae.",
    compatibleCalculators: ["iron"],
    recommendedDoseRule: "1 mL per 100L based on 20 ppm Ca consumption",
  },
  {
    brand: "Red Sea",
    productName: "Trace-Colors D (Bioactive 18 Elements)",
    category: "Trace Element",
    summary: "Complex of 18 bioactive trace elements including Nickel, Vanadium, Selenium, and Molybdenum promoting purple and blue chromoproteins and enzyme metabolism.",
    targetParameters: "Trace metal natural seawater concentration ratios",
    dosingDirections: "Dose 1 mL per 100 Liters (25 gal) per 20 ppm Calcium uptake alongside Trace-Colors A, B, and C.",
    safetyAndStorage: "Shake well before use. Store at room temperature.",
    compatibleCalculators: ["dosing"],
    recommendedDoseRule: "1 mL per 100L based on 20 ppm Ca consumption",
  },
  {
    brand: "Brightwell Aquatics",
    productName: "NeoNitro (Nitrate Supplement)",
    category: "Nutrient Supplement (NO3/PO4)",
    summary: "Precision nitrate source designed to increase nitrate levels safely in nutrient-depleted, ultra-low nutrient (ULNS) reef tanks to prevent coral starvation and dinoflagellates.",
    targetParameters: "Target NO3: 3.0 - 10.0 ppm for mixed reef / SPS",
    dosingDirections: "1 mL per 100 Liters (approx 26 US gal) increases nitrate concentration by ~0.15 ppm. To raise NO3 by 1.0 ppm, dose ~6.7 mL per 100L. Maximum daily increase: +1.0 - 2.0 ppm per day.",
    safetyAndStorage: "Always test nitrate with a reliable test kit (e.g. Salifert, Nyos, Hanna Checker) before dosing. Avoid raising NO3 too quickly.",
    compatibleCalculators: ["nitrate"],
    recommendedDoseRule: "6.7 mL per 100L raises NO3 by 1.0 ppm",
  },
  {
    brand: "Brightwell Aquatics",
    productName: "NeoPhos (Phosphate Supplement)",
    category: "Nutrient Supplement (NO3/PO4)",
    summary: "Highly concentrated phosphate solution formulated to safely restore detectable phosphate in coral aquariums that have bottomed out at 0.00 ppm PO4.",
    targetParameters: "Target PO4: 0.03 - 0.08 ppm",
    dosingDirections: "1 mL per 100 Liters increases phosphate by ~0.02 ppm. Dose slowly into high flow area of the sump. Do not increase PO4 by more than 0.02 ppm in a 24-hour period.",
    safetyAndStorage: "Store at room temperature. Overdosing can cause rapid algae outbreaks or coral darkening.",
    compatibleCalculators: ["phosphate"],
    recommendedDoseRule: "1 mL per 100L raises PO4 by 0.02 ppm",
  },
  {
    brand: "Brightwell Aquatics",
    productName: "Ferrion (Liquid Iron)",
    category: "Trace Element",
    summary: "Highly-concentrated, bioavailable chelated iron supplement for reef aquaria, supporting macroalgal growth in refugiums and green coloration in corals.",
    targetParameters: "Target Iron: 0.002 - 0.005 ppm",
    dosingDirections: "Dose 5 mL per 200 Liters (50 gal) once or twice weekly, or 1 drop per 40 Liters daily for continuous refugium growth.",
    safetyAndStorage: "Avoid overdosing which can stimulate cyanobacteria or film algae.",
    compatibleCalculators: ["iron"],
  },
  {
    brand: "Brightwell Aquatics",
    productName: "Iodion (Liquid Iodine)",
    category: "Trace Element",
    summary: "Stabilized iodide and iodine solution to replenish depleted iodine consumed by corals, macroalgae, and inverts during molting.",
    targetParameters: "Target Iodine: 0.04 - 0.08 ppm (ideal 0.06 ppm)",
    dosingDirections: "Dose 1 drop per 40 Liters (approx 10 gal) daily, or 5 mL per 400 Liters weekly. Test regularly.",
    safetyAndStorage: "Keep out of reach of children. Store in dark cool area.",
    compatibleCalculators: ["iodine"],
  },
  {
    brand: "Brightwell Aquatics",
    productName: "Potassion (Potassium Supplement)",
    category: "Trace Element",
    summary: "High-purity potassium solution designed to restore and maintain natural potassium levels in SPS-heavy systems.",
    targetParameters: "Target Potassium: 390 - 420 ppm",
    dosingDirections: "5 mL per 100 Liters (26 gal) increases potassium by ~10 ppm. Do not increase by more than 15 ppm per day.",
    safetyAndStorage: "Keep cap sealed tightly.",
    compatibleCalculators: ["potassium"],
    recommendedDoseRule: "5 mL per 100L raises K by 10 ppm",
  },
  {
    brand: "Brightwell Aquatics",
    productName: "Strontion (Strontium Supplement)",
    category: "Trace Element",
    summary: "Ionic strontium solution to promote dense aragonite skeleton building and encrusting coralline algae growth.",
    targetParameters: "Target Strontium: 8.0 - 10.0 ppm",
    dosingDirections: "5 mL per 100 Liters increases strontium by ~2.0 ppm. Max daily increase: +2.0 ppm.",
    safetyAndStorage: "Store at room temperature. Keep away from children.",
    compatibleCalculators: ["strontium"],
  },
  {
    brand: "Fauna Marin",
    productName: "Balling Light Trace 1, 2, 3",
    category: "Trace Element",
    summary: "Micro-element system formulated to be mixed directly into the Balling Light canisters (Trace 1: Metallic Color, Trace 2: Metallic Metabolic, Trace 3: Health Effect).",
    targetParameters: "Comprehensive trace balance matching calcium and carbonate consumption",
    dosingDirections: "Mix 25 mL of Trace 1 (Color Effect) + 25 mL of Trace 2 (Metabolic Effect) into 2 Liters of Calcium solution. Mix 25 mL of Trace 3 (Health Effect) into 2 Liters of Carbonate solution.",
    safetyAndStorage: "Do not dose pure trace concentrates directly to the tank. Always dilute into the designated Balling Light container.",
    compatibleCalculators: ["dosing", "ca", "alk"],
  },
  {
    brand: "Triton",
    productName: "Triton Core7 Base Elements",
    category: "All-In-One Reef Additive",
    summary: "Next-generation 7x concentrated 4-part macro and microelement dosing solution designed for the Triton Method without routine water changes.",
    targetParameters: "Balanced Alk (7.5-8.0 dKH), Ca (430-450 ppm), Mg (1350 ppm) + all 30+ trace elements",
    dosingDirections: "Dose equal amounts of bottles 1, 2, 3a, 3b into high flow area of the sump. Standard initial dose: 2 mL per 100 Liters daily. Adjust dose to maintain stable alkalinity at 8.0 dKH.",
    safetyAndStorage: "Never mix bottle concentrates together before dosing. Store above 15°C to avoid crystallization.",
    compatibleCalculators: ["dosing", "alk", "ca"],
  },
  {
    brand: "Tropic Marin",
    productName: "All-For-Reef",
    category: "All-In-One Reef Additive",
    summary: "Ultra-concentrated single-solution organic calcium formate supply with integrated alkalinity, magnesium, strontium, and full trace element spectrum.",
    targetParameters: "Maintains balanced Alkalinity, Calcium, and Trace Elements without altering ionic chloride/sulfate balance.",
    dosingDirections: "Start with 5 mL per 100 Liters daily. Monitor alkalinity every 3 days and adjust daily dose by 2.5 mL until dKH stabilizes between 7.5 and 8.5 dKH. Max dose: 25 mL per 100L daily.",
    safetyAndStorage: "Store at room temperature. Because calcium is bound organically to formate, bacteria metabolize it into bicarbonate—dKH rise is gradual over 24 hours.",
    compatibleCalculators: ["dosing", "alk", "ca"],
  },
  {
    brand: "Generic / DIY",
    productName: "Lugol's Solution (Potassium Iodide & Iodine)",
    category: "Trace Element",
    summary: "Strong concentrated solution of elemental iodine (5%) and potassium iodide (10%) used for antiseptic coral dipping and micro-dosing iodine.",
    targetParameters: "Natural seawater: ~0.06 ppm Iodine",
    dosingDirections: "Tank dosing: Extreme caution—1 single drop per 200 Liters (50 gal) once or twice weekly. Coral dip: 10-20 drops per Liter of tank water for 5-10 minutes.",
    safetyAndStorage: "POISON / TOXIC if swallowed. Can stain skin and surfaces. Keep locked away from children and pets.",
    compatibleCalculators: ["iodine"],
  },

  // --- FRESHWATER PLANT FERTILIZERS & REMINERALIZERS ---
  {
    brand: "NilocG",
    productName: "Thrive Complete Plant Fertilizer",
    category: "Plant Fertilizer",
    summary: "Concentrated all-in-one liquid fertilizer providing balanced macro and micronutrients for high-tech and medium-light planted tanks.",
    targetParameters: "Dose delivers ~7 ppm NO3, 1.3 ppm PO4, 5 ppm K, 0.25 ppm Fe",
    dosingDirections: "Dose 1 pump (2 mL) per 10 gallons (38 Liters) 1-3 times weekly depending on plant mass and CO2 levels. 50% weekly water change recommended.",
    safetyAndStorage: "Shake well before using. Store at room temperature away from direct sunlight.",
    compatibleCalculators: ["fert"],
    recommendedDoseRule: "1 pump (2 mL) per 10 gallons",
  },
  {
    brand: "2Hr Aquarist",
    productName: "APT Complete (The 2Hr Aquarist)",
    category: "Plant Fertilizer",
    summary: "Comprehensive all-in-one formula delivering maximum coloration and rapid stem growth with high bio-availability.",
    targetParameters: "Supplies complete NPK, Iron, Magnesium, and essential trace minerals.",
    dosingDirections: "Dose 1 pump (2 mL) per 20 Liters (5 gal) 4 times weekly, or 1 pump per 10 Liters (2.5 gal) 3 times weekly. Reset weekly with 50% water change.",
    safetyAndStorage: "Store tightly sealed. Avoid contact with eyes.",
    compatibleCalculators: ["fert"],
    recommendedDoseRule: "1 pump (2 mL) per 20L 4x weekly",
  },
  {
    brand: "2Hr Aquarist",
    productName: "APT 1 Zero (Nitrate & Phosphate Free)",
    category: "Plant Fertilizer",
    summary: "Lean fertilizing formula with zero nitrates and phosphates, designed for aquascapes with nutrient-rich aquasoil or sensitive Caridina dwarf shrimp.",
    targetParameters: "Supplies Potassium, Magnesium, Iron, and chelated trace elements without accumulating NO3 or PO4.",
    dosingDirections: "Dose 1 pump (2 mL) per 20 Liters 4 times weekly. Ideal for newly set up tanks and tanks prone to green dust algae.",
    safetyAndStorage: "Store in cool, shaded area.",
    compatibleCalculators: ["fert"],
    recommendedDoseRule: "1 pump (2 mL) per 20L 4x weekly",
  },
  {
    brand: "Aquarium Co-Op",
    productName: "Easy Green All-in-One Fertilizer",
    category: "Plant Fertilizer",
    summary: "Simple, highly accessible planted tank fertilizer optimized for low-tech and community planted aquariums.",
    targetParameters: "1 pump per 10 gallons raises NO3 by ~3 ppm",
    dosingDirections: "Dose 1 pump (2 mL) per 10 gallons once a week for low-light tanks, or 2-3 times a week for high-light/CO2 aquariums.",
    safetyAndStorage: "Safe for fish, snails, and shrimp when used as directed.",
    compatibleCalculators: ["fert"],
    recommendedDoseRule: "1 pump per 10 gallons weekly",
  },
  {
    brand: "Seachem",
    productName: "Flourish Comprehensive",
    category: "Plant Fertilizer",
    summary: "Broad-spectrum micro and trace element liquid supplement with low levels of macro elements, ideal for standard planted tanks.",
    targetParameters: "Supplies bio-available Iron, Calcium, Magnesium, Potassium, and trace elements.",
    dosingDirections: "Use 1 capful (5 mL) for each 250 Liters (60 gallons) once or twice a week.",
    safetyAndStorage: "Refrigeration after opening is recommended but not required.",
    compatibleCalculators: ["fert"],
    recommendedDoseRule: "5 mL per 250L once weekly",
  },
  {
    brand: "SaltyShrimp",
    productName: "Shrimp Mineral GH/KH+",
    category: "RO/DI Remineralizer",
    summary: "Specifically designed for Neocaridina (cherry shrimp) and community fish, establishing an optimal GH to KH ratio of approx. 2:1.",
    targetParameters: "Target 6 dGH and 3 dKH at approx. 300 +/- 50 µS/cm (TDS ~190 ppm)",
    gramsPerLiter: 0.20,
    mixingDirections: "Dissolve 1 even measuring spoon (approx. 2g) per 10 Liters of pure RO/DI water. Stir for 1-2 minutes until clear.",
    dosingDirections: "Add to freshly prepared RO/DI water for routine water changes. Dissolves almost completely in seconds.",
    safetyAndStorage: "Close container airtight after each use. Highly hygroscopic.",
    compatibleCalculators: ["remin"],
    recommendedDoseRule: "2g per 10 Liters to reach 6 dGH / 3 dKH",
  },
  {
    brand: "SaltyShrimp",
    productName: "Bee Shrimp Mineral GH+",
    category: "RO/DI Remineralizer",
    summary: "Pure GH booster designed for Bee and Taiwan Bee shrimp (Caridina cf. cantonensis) with zero KH to maintain active soil buffering and low pH.",
    targetParameters: "Target 5-6 dGH and 0-0.5 dKH at approx. 200 +/- 50 µS/cm (TDS ~110-130 ppm)",
    gramsPerLiter: 0.15,
    mixingDirections: "Dissolve 1 even measuring spoon (approx. 3g) per 20 Liters of RO/DI water. Reaches ~6 dGH and ~120 ppm TDS.",
    dosingDirections: "Prepare replacement water for weekly Caridina shrimp water changes. Does not raise carbonate hardness.",
    safetyAndStorage: "Store dry. Re-close lid firmly.",
    compatibleCalculators: ["remin"],
    recommendedDoseRule: "3g per 20 Liters to reach 6 dGH",
  },
  {
    brand: "Seachem",
    productName: "Equilibrium",
    category: "RO/DI Remineralizer",
    summary: "Specialized mineral blend designed to establish ideal General Hardness (GH) mineral balance in RO/DI or deionized water for planted aquariums.",
    targetParameters: "Supplies essential Calcium, Magnesium, Potassium, Iron, and Manganese without sodium or chloride.",
    gramsPerLiter: 0.40,
    mixingDirections: "To raise mineral content / general hardness by 1 meq/L (2.8 dGH), add 16 g (1 tablespoon) per 80 Liters (20 gallons) of pure water.",
    dosingDirections: "Dissolve thoroughly in water change water before adding to tank.",
    safetyAndStorage: "Store in a cool dry place.",
    compatibleCalculators: ["remin"],
    recommendedDoseRule: "16g per 80L to raise 2.8 dGH",
  },
  {
    brand: "Seachem",
    productName: "Alkaline Buffer",
    category: "RO/DI Remineralizer",
    summary: "Non-phosphate carbonate buffer designed to raise and hold KH and pH in planted or freshwater aquariums without fueling algae.",
    targetParameters: "Raises KH and buffers pH between 7.2 and 8.5.",
    gramsPerLiter: 0.15,
    mixingDirections: "To increase alkalinity by 1 meq/L (2.8 dKH), add 7 g (1 tsp) per 40 Liters (10 gallons) of water.",
    dosingDirections: "Combine with Seachem Equilibrium for complete GH/KH reconstitution from 0 TDS pure water.",
    safetyAndStorage: "Store dry.",
    compatibleCalculators: ["remin"],
  },
];

export function findMatchingProduct(query: string): IdentifiedProduct | null {
  if (!query || typeof query !== "string") return null;
  const q = query.toLowerCase().trim();
  if (q.length < 2) return null;

  // Exact or contains match on name or brand
  for (const item of PRODUCT_CATALOG) {
    const full = `${item.brand} ${item.productName}`.toLowerCase();
    if (full.includes(q) || q.includes(item.productName.toLowerCase())) {
      return item;
    }
  }

  // Keywords search
  const keywords = q.split(/\s+/).filter((w) => w.length > 2);
  for (const item of PRODUCT_CATALOG) {
    const full = `${item.brand} ${item.productName} ${item.category}`.toLowerCase();
    const matchesAll = keywords.every((kw) => full.includes(kw));
    if (matchesAll) {
      return item;
    }
  }

  return null;
}
