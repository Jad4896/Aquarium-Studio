export interface DiseaseEntry {
  id: string;
  name: string;
  pathogenType: "Parasitic Protozoan" | "Bacterial" | "Fungal" | "Viral" | "Environmental / Nutritional" | "Coral Tissue Necrosis";
  environment: "marine" | "freshwater" | "both";
  riskLevel: "Low" | "Moderate" | "High" | "Critical";
  affectedHosts: string;
  primarySymptoms: string[];
  progressionSpeed: "Slow (Weeks)" | "Moderate (Days)" | "Rapid (24-48 Hours)" | "Immediate";
  treatmentProtocol: string[];
  reefSafeWarning: string;
  quarantineRequired: boolean;
  preventionTips: string[];
  keywords: string[];
}

export const DISEASE_DATABASE: DiseaseEntry[] = [
  // MARINE DISEASES
  {
    id: "marine-ich",
    name: "Marine Ich (White Spot Disease)",
    pathogenType: "Parasitic Protozoan",
    environment: "marine",
    riskLevel: "High",
    affectedHosts: "Marine teleost fish (Tangs, Angels, Clownfish, Wrasses)",
    primarySymptoms: [
      "Distinct white specks resembling table salt crystals sprinkled across body, fins, and gills",
      "Flashing / scratching body against rocks or sandbed",
      "Twitching and head shaking",
      "Rapid gill opercular movement and heavy breathing",
      "Spots disappear for several days (tomont cyst stage) then return exponentially heavier"
    ],
    progressionSpeed: "Moderate (Days)",
    treatmentProtocol: [
      "Quarantine Tank Treatment: Transfer all fish to a dedicated hospital tank without corals or inverts.",
      "Copper Treatment: Chelated Copper (Copper Power) or Ionic Copper (Cupramine) maintained at therapeutic levels (2.0 - 2.5 ppm for Copper Power; 0.5 ppm for Cupramine) for 30 consecutive days. Test copper daily with a Hanna High Range Copper Checker.",
      "Tank Transfer Method (TTM): Move fish between two sterile tanks every 72 hours for 12 days to outrun the parasite life cycle.",
      "Fallow Period for Display Tank: Keep main display tank strictly fishless for 76 days (at 25-27°C) to allow all encysted tomonts to hatch and starve without a fish host."
    ],
    reefSafeWarning:
      "⚠️ COPPER IS HIGHLY LETHAL TO CORALS, SHRIMPS, SNAILS, AND INVERTEBRATES. NEVER DOSE COPPER INTO A DISPLAY REEF TANK.",
    quarantineRequired: true,
    preventionTips: [
      "Quarantine all new fish for 30 days before adding to the display.",
      "Run a high-wattage UV sterilizer (slow flow rate) to kill free-swimming theronts in the water column.",
      "Soak food in garlic and vitamin C/Selcon to support immune function."
    ],
    keywords: ["ich", "white spot", "cryptocaryon", "salt grains", "scratching rocks", "flashing", "spots on tang", "white dots"]
  },
  {
    id: "marine-velvet",
    name: "Marine Velvet (Amyloodinium)",
    pathogenType: "Parasitic Protozoan",
    environment: "marine",
    riskLevel: "Critical",
    affectedHosts: "All saltwater fish species (Clownfish, Tangs, Damselfish, Gobies)",
    primarySymptoms: [
      "Extremely fine, dusty gold or yellowish sheen resembling velvet or powdered sugar",
      "Extreme rapid breathing and gasping at water surface",
      "Swimming directly into high powerhead current or filter outflows",
      "Severe lethargy, clouding of eyes, refusal to eat",
      "Catastrophic sudden mortality within 24 to 48 hours of visible symptoms"
    ],
    progressionSpeed: "Rapid (24-48 Hours)",
    treatmentProtocol: [
      "EMERGENCY ACTION REQUIRED: Velvet kills extremely rapidly.",
      "Immediate 5-minute Freshwater Dip: Prepare RO/DI or dechlorinated freshwater matched to aquarium temperature and pH (using buffer). Submerge fish for 3-5 minutes with aeration to dislodge trophonts and provide temporary respiratory relief.",
      "Hospital Tank Medication: Chloroquine Phosphate (40 - 60 mg per gallon single dose, protected from UV and light) OR Copper Power (dosed immediately to 2.5 ppm).",
      "Fallow Period: Display tank must remain completely fishless for 6 weeks (at 26-28°C)."
    ],
    reefSafeWarning:
      "⚠️ CHLOROQUINE PHOSPHATE AND COPPER ARE FATAL TO CORALS AND ALGAE. TREAT ONLY IN A BARE-BOTTOM HOSPITAL TANK.",
    quarantineRequired: true,
    preventionTips: [
      "Always quarantine incoming fish in therapeutic copper or chloroquine.",
      "Inspect fish with a focused flashlight in a dark room: velvet sheen reflects golden-yellow light."
    ],
    keywords: ["velvet", "amyloodinium", "gold dust", "powdered sugar", "swimming into flow", "rapid breathing", "gasping at surface", "fish dying fast"]
  },
  {
    id: "brooklynella",
    name: "Brooklynella (Clownfish Disease)",
    pathogenType: "Parasitic Protozoan",
    environment: "marine",
    riskLevel: "Critical",
    affectedHosts: "Wild-caught and newly introduced Clownfish, occasionally Angelfish and Tangs",
    primarySymptoms: [
      "Heavy sloughing of milky white mucus / peeling slime coat",
      "Faded, cloudy, or blotchy skin patches",
      "Severe respiratory distress, gasping at surface",
      "Lethargy, staying motionless at bottom of tank",
      "Rapid progression causing death within 12 - 36 hours"
    ],
    progressionSpeed: "Rapid (24-48 Hours)",
    treatmentProtocol: [
      "Formalin Bath (Most effective): 37% Formaldehyde solution at 0.9 ml per gallon of saltwater for 45 minutes with vigorous aeration. Repeat every other day for 3 treatments.",
      "Alternative Bath: Ruby Reef Rally Pro bath (contains Acriflavine + Aminoacridine) for 60-90 minutes in separate aerated container.",
      "Post-Bath Care: Transfer fish to a clean quarantine tank; dose Metronidazole (Metroplex) in water and food daily for 10 days."
    ],
    reefSafeWarning:
      "⚠️ FORMALIN IS A TOXIC CARCINOGEN AND STRIPS OXYGEN. NEVER DOSE INTO MAIN REEF. USE ONLY WITH ACTIVE VENTILATION AND AERATION.",
    quarantineRequired: true,
    preventionTips: [
      "Acclimate and prophylactic dip all new clownfish in Acriflavine or Ruby Reef Rally.",
      "Purchase captive-bred clownfish which carry drastically lower risk of wild Brooklynella."
    ],
    keywords: ["brooklynella", "clownfish disease", "peeling slime coat", "white slime", "sloughing skin", "cloudy clownfish", "mucus shedding"]
  },
  {
    id: "uronema",
    name: "Uronema marinum",
    pathogenType: "Parasitic Protozoan",
    environment: "marine",
    riskLevel: "Critical",
    affectedHosts: "Chromis (Blue Green Chromis), Anthias, Dwarf Angelfish",
    primarySymptoms: [
      "Prominent red, raw, ulcerated lesions or open bloody sores on flanks",
      "Rapid loss of scales and muscle tissue necrosis",
      "Refusal to eat and rapid wasting",
      "DOES NOT require a fish host: can survive indefinitely on detritus and bacteria in the tank"
    ],
    progressionSpeed: "Rapid (24-48 Hours)",
    treatmentProtocol: [
      "Immediate isolation in hospital tank.",
      "Formalin dips (45 minutes at 0.9 ml/gal) combined with Metronidazole in water and food.",
      "Antibiotic therapy: Dose Kanaplex or Furan-2 concurrently to prevent secondary opportunistic bacterial septicemia.",
      "Note: Because Uronema lives without a host, fallow periods do NOT eliminate it from a display tank. Avoid reintroducing susceptible chromis."
    ],
    reefSafeWarning:
      "⚠️ Uronema treatments must be administered in quarantine. Do not dose formalin or antibiotics in display reefs.",
    quarantineRequired: true,
    preventionTips: [
      "Quarantine and pre-treat Chromis and Anthias with Metronidazole and formalin dips upon arrival.",
      "Reject fish showing even minute red bruising or scale anomalies at the fish store."
    ],
    keywords: ["uronema", "red sore", "bloody ulcer", "chromis ulcer", "red patch on flank", "bleeding scales"]
  },
  {
    id: "flukes",
    name: "Marine Flukes (Skin & Gill Trematodes)",
    pathogenType: "Parasitic Protozoan",
    environment: "marine",
    riskLevel: "Moderate",
    affectedHosts: "Angelfish, Tangs, Butterflies, Wrasses, Clownfish",
    primarySymptoms: [
      "Cloudy, hazy eyes without obvious external spots",
      "Twitching, jerky swimming, head shaking, yawning",
      "Clamped fins and scratching against substrate",
      "Confirmation: In a 5-minute freshwater dip, flukes turn opaque white and dislodge like sesame seeds to bottom of container"
    ],
    progressionSpeed: "Slow (Weeks)",
    treatmentProtocol: [
      "Praziquantel Treatment (PraziPro): Dose 2.5 mg/L into the quarantine tank (or display tank if feather dusters are removed).",
      "Crucial Repeat Dose: Praziquantel kills adult flukes but does NOT kill eggs. Must dose a second time 5 - 7 days later (depending on temperature) to eradicate newly hatched larvae before they lay eggs.",
      "Freshwater dip (5 min) provides immediate relief for heavily infested specimens."
    ],
    reefSafeWarning:
      "⚠️ Praziquantel is generally safe for corals and shrimp, but WILL KILL ornamental feather dusters, coco worms, and bristleworms. Turn off protein skimmer (it will overflow wildly).",
    quarantineRequired: false,
    preventionTips: [
      "Routinely treat all incoming fish with 2 rounds of Praziquantel in quarantine.",
      "Perform a 5-minute freshwater diagnostic dip on any fish with cloudy eyes or head twitching."
    ],
    keywords: ["flukes", "prazipro", "cloudy eyes", "head shaking", "twitching fish", "scratching gills", "yawning fish", "neobenedenia"]
  },
  {
    id: "coral-rtn-stn",
    name: "Coral Tissue Necrosis (RTN / STN)",
    pathogenType: "Coral Tissue Necrosis",
    environment: "marine",
    riskLevel: "Critical",
    affectedHosts: "SPS Corals (Acropora, Montipora, Stylophora, Seriatopora)",
    primarySymptoms: [
      "Coral tissue sloughing or peeling away leaving pure white, stark calcium skeleton exposed",
      "RTN (Rapid Tissue Necrosis): Colony strips completely within 6 - 24 hours.",
      "STN (Slow Tissue Necrosis): Slow recession line creeping up from the shaded base or tips over days or weeks.",
      "Often triggered by Alkalinity instability, sudden temperature shock, or bacterial pathogens (Vibrio)"
    ],
    progressionSpeed: "Rapid (24-48 Hours)",
    treatmentProtocol: [
      "Emergency Fragging: Cut healthy branches 1/2 inch (1-2 cm) ABOVE the dying white margin using clean bone cutters. Save the healthy frags; discard the dying necrotic base.",
      "Glue Barrier: Cover the fresh cut margin with thick cyanoacrylate gel to seal the wound.",
      "Antiseptic / Antibiotic Dip: Dip affected frags in Lugol's Iodine (3-5 drops per liter of tank water for 10 min) or Ciprofloxacin bath (20 mg/L in separate aerated container for 2-4 hours).",
      "Water Stability: Test Alkalinity immediately. Ensure dKH swings are kept under 0.5 dKH per 24-hour period."
    ],
    reefSafeWarning:
      "⚠️ Perform all fragging and dipping outside the display tank. Do not dump antibiotic dip water back into the aquarium.",
    quarantineRequired: false,
    preventionTips: [
      "Maintain rock-solid Alkalinity stability with automated daily dosing.",
      "Ensure strong indirect turbulent flow to prevent detritus accumulation around coral bases."
    ],
    keywords: ["rtn", "stn", "tissue necrosis", "coral skeleton peeling", "acropora white skeleton", "coral dying from base", "white band"]
  },
  {
    id: "brown-jelly",
    name: "Brown Jelly Disease (BJD)",
    pathogenType: "Bacterial",
    environment: "marine",
    riskLevel: "Critical",
    affectedHosts: "LPS Corals (Euphyllia: Torches, Hammers, Frogspawn; Duncan, Acan lords)",
    primarySymptoms: [
      "Dense, foul-smelling, brown or reddish gelatinous slime smothering the coral polyps",
      "Polyp liquefies and disintegrates rapidly underneath the slime layer",
      "Spreads rapidly to adjacent coral heads through water current",
      "Entire coral head lost within 12 - 24 hours"
    ],
    progressionSpeed: "Rapid (24-48 Hours)",
    treatmentProtocol: [
      "TURN OFF ALL FLOW immediately to prevent brown jelly from blowing onto nearby corals.",
      "Careful Siphoning: Use rigid tubing to siphon off the brown slime layer and remove the infected coral head from the tank.",
      "Amputation: Frag and cut off the rotting coral branch well below the dead head.",
      "Medical Bath: Dip in Ciprofloxacin (250 mg dissolved in 1 gallon of tank water for 2-4 hours) OR Nitrofurazone bath with aeration daily for 3 days.",
      "Spot peroxide dip: Briefly submerge skeleton base (not live tissue) in diluted 3% H2O2."
    ],
    reefSafeWarning:
      "⚠️ Brown jelly is caused by a virulent mix of ciliated protozoans (Philaster guamense) and Vibrio bacteria. Treat strictly in a hospital bucket.",
    quarantineRequired: false,
    preventionTips: [
      "Avoid mechanical damage to Euphyllia fleshy polyps against sharp skeleton during transport.",
      "Maintain adequate indirect flow so waste does not stagnate in coral cups."
    ],
    keywords: ["brown jelly", "bjd", "brown slime on torch", "euphyllia dying", "hammer coral rotting", "foul smelling slime", "jelly on coral"]
  },
  {
    id: "coral-bleaching",
    name: "Coral Bleaching",
    pathogenType: "Environmental / Nutritional",
    environment: "marine",
    riskLevel: "Moderate",
    affectedHosts: "All photosynthetic corals (SPS, LPS, Zoanthids, Soft Corals)",
    primarySymptoms: [
      "Coral tissue turns pale, translucent, or bright ghostly white",
      "CRITICAL DIFFERENCE FROM RTN: The living tissue and polyps are still intact and extend, but have lost their brown zooxanthellae pigments (not bare bone skeleton).",
      "Polyps may still respond to touch, but appear translucent."
    ],
    progressionSpeed: "Slow (Weeks)",
    treatmentProtocol: [
      "Reduce Lighting: Lower lighting intensity by 30-50% or relocate coral to lower rockwork/shade.",
      "Verify Temperature: Check heater and chiller calibration. High temperatures (>28°C / 82°F) trigger zooxanthellae expulsion.",
      "Check Nutrients: Test Nitrate and Phosphate. Severe nutrient starvation (NO3: 0.00 ppm, PO4: 0.00 ppm) causes rapid bleaching.",
      "Dose amino acids and target-feed micro-plankton at night to nourish the host coral while it recovers photosynthetic symbionts."
    ],
    reefSafeWarning:
      "Reversible if caught early! Provide shaded gentle conditions and stable water chemistry.",
    quarantineRequired: false,
    preventionTips: [
      "Acclimate new corals slowly using PAR meters or progressive light ramp-up.",
      "Never allow nutrients to bottom out to absolute zero."
    ],
    keywords: ["bleaching", "pale coral", "white coral with polyps", "translucent coral", "coral lost color", "light shock"]
  },

  // FRESHWATER DISEASES
  {
    id: "fw-ich",
    name: "Freshwater Ich (Ichthyophthirius)",
    pathogenType: "Parasitic Protozoan",
    environment: "freshwater",
    riskLevel: "High",
    affectedHosts: "Freshwater fish (Tetras, Bettas, Cichlids, Livebearers, Catfish)",
    primarySymptoms: [
      "Small defined white salt-like spots scattered over body, fins, and tail",
      "Flicking, scratching, and rubbing against gravel or decorations",
      "Clamped fins and heavy opercular movement",
      "Loss of appetite and lethargy"
    ],
    progressionSpeed: "Moderate (Days)",
    treatmentProtocol: [
      "Heat Treatment: Gradually raise temperature to 30°C (86°F) over 24-48 hours. Maintain for 10 days to disrupt the parasite life cycle (ensure high aeration via air stone).",
      "Aquarium Salt: Add 1 tablespoon of aquarium salt per 3-5 gallons (note: use caution with salt-sensitive catfish or scaleless fish).",
      "Medication: Treat with Ich-X (Formalin + Malachite Green) or Seachem ParaGuard according to bottle instructions.",
      "Perform a 30% gravel vacuum before each dose to pull unattached tomonts from the substrate."
    ],
    reefSafeWarning:
      "⚠️ Malachite green can stain silicone and may harm delicate invertebrates (dwarf shrimp/snails). Verify shrimp-safe medication like Ich-X at half dose if shrimp are present.",
    quarantineRequired: false,
    preventionTips: [
      "Quarantine new fish for 2 weeks.",
      "Avoid sudden temperature drops during water changes."
    ],
    keywords: ["freshwater ich", "white spots on tetra", "ich-x", "salt grains on betta", "flicking on gravel"]
  },
  {
    id: "epistylis",
    name: "Epistylis (Protruding White Tufts)",
    pathogenType: "Bacterial",
    environment: "freshwater",
    riskLevel: "Critical",
    affectedHosts: "Freshwater fish (often confused with Ich)",
    primarySymptoms: [
      "Elevated, protruding, fluffy or scabby white growths of irregular sizes",
      "Spots appear on the eyes and extend outward from the skin surface",
      "Fish acts severely ill early in the infection",
      "CRITICAL: Raising tank temperature makes Epistylis WORSE and causes rapid mortality (unlike Ich)."
    ],
    progressionSpeed: "Rapid (24-48 Hours)",
    treatmentProtocol: [
      "DO NOT RAISE THE TEMPERATURE! Lower temperature to 22-24°C (72-75°F) to slow bacterial division.",
      "Antibiotic Medicated Food: Feed Seachem Kanaplex + Focus (or Maracyn 2) soaked into pellets.",
      "Water Column Treatment: Treat water with Ich-X or Maracyn 2 concurrent with antibacterial food.",
      "Increase water aeration and perform 40% water changes to reduce organic bacterial count in the water."
    ],
    reefSafeWarning:
      "Epistylis is a protozoan colonized by virulent bacteria. Treating with heat as if it were Ich is fatal.",
    quarantineRequired: false,
    preventionTips: [
      "Distinguish from Ich: Epistylis spots are uneven in size, stick outward from scales, and frequently cover the eye cornea.",
      "Maintain clean filters and avoid overstocked dirty water conditions."
    ],
    keywords: ["epistylis", "raised white spots", "spots on eyes", "fluffy white dots", "not ich", "uneven white spots"]
  },
  {
    id: "columnaris",
    name: "Columnaris (Cotton Mouth / Saddleback)",
    pathogenType: "Bacterial",
    environment: "freshwater",
    riskLevel: "Critical",
    affectedHosts: "Livebearers (Guppies, Mollies), Bettas, Tetras, Catfish",
    primarySymptoms: [
      "Cottony white or grey-yellowish patches around mouth, lips, or gills",
      "Saddleback lesion: White band or discoloration draped over the top of the fish's back beneath the dorsal fin",
      "Rapid fraying and rotting of fin margins with red inflamed edges",
      "Extremely fast mortality within 24 to 72 hours"
    ],
    progressionSpeed: "Rapid (24-48 Hours)",
    treatmentProtocol: [
      "Lower water temperature to 23°C (73°F): Flavobacterium columnare thrives and accelerates in warm water.",
      "Combination Antibiotics: Dose Kanamycin (Seachem Kanaplex) AND Nitrofurazone (Furan-2) together. This combination is synergistic and the gold standard for Columnaris.",
      "Add 1 tsp aquarium salt per gallon to reduce osmotic stress.",
      "Increase surface agitation to maintain maximum dissolved oxygen."
    ],
    reefSafeWarning:
      "Antibiotics can impact beneficial biological filter bacteria in unestablished tanks. Monitor ammonia/nitrite closely.",
    quarantineRequired: true,
    preventionTips: [
      "Maintain pristine water quality with zero detectable ammonia and nitrite.",
      "Quarantine new livebearers and bettas."
    ],
    keywords: ["columnaris", "cotton mouth", "saddleback", "white mouth", "fuzzy lips", "rotting back", "guppy mouth rot"]
  },
  {
    id: "fin-rot",
    name: "Fin & Tail Rot",
    pathogenType: "Bacterial",
    environment: "both",
    riskLevel: "Moderate",
    affectedHosts: "All freshwater and marine fish (Bettas, Guppies, Tangs, Clownfish)",
    primarySymptoms: [
      "Frayed, jagged, torn, or disintegrating fin and tail edges",
      "White, milky, or bloody red margins along fin tips",
      "Holes or melting appearance on delicate caudal fin rays",
      "Lethargy and staying near bottom or surface"
    ],
    progressionSpeed: "Slow (Weeks)",
    treatmentProtocol: [
      "Water Quality Optimization: Perform 30% clean water change immediately. High nitrates and dirty substrate are the primary triggers.",
      "Mild cases: Aquarium salt (1 tbsp per 3-5 gal) and Indian Almond leaves (Catappa) for natural antibacterial tannins.",
      "Advanced cases with bloody margins: Treat with broad-spectrum antibiotic (Kanaplex, Sulfaplex, or Maracyn).",
      "Ensure fin rays regenerate by adding vitamins and high-protein nutrition."
    ],
    reefSafeWarning:
      "For marine tanks, treat bacterial fin rot in quarantine with Kanaplex/Furan-2. In freshwater, salt and clean water resolve most early cases.",
    quarantineRequired: false,
    preventionTips: [
      "Check for fin-nipping tankmates (Tiger barbs, aggressive damselfish).",
      "Keep nitrates below 20 ppm."
    ],
    keywords: ["fin rot", "tail rot", "frayed fins", "torn tail", "melting fins", "blood on fins", "ragged fins"]
  },
  {
    id: "dropsy",
    name: "Dropsy (Pineconing & Fluid Retention)",
    pathogenType: "Bacterial",
    environment: "freshwater",
    riskLevel: "Critical",
    affectedHosts: "Bettas, Goldfish, Dwarf Gouramis, Cichlids",
    primarySymptoms: [
      "Pineconing: Scales protrude outward like a pinecone when viewed from directly above",
      "Severe abdominal bloat and fluid accumulation in the coelomic cavity",
      "Protruding bulging eyes (Popeye) and clamped fins",
      "Internal organ failure (kidney/liver breakdown)"
    ],
    progressionSpeed: "Moderate (Days)",
    treatmentProtocol: [
      "Isolate immediately in a hospital tank with shallow water (for easy breathing access).",
      "Epsom Salt Bath: Pure Magnesium Sulfate (Epsom salt) at 1 to 2 teaspoons per gallon in hospital tank. Draws excess accumulated fluid out of the body cavity via osmotic gradient.",
      "Antibiotic Therapy: Kanamycin (Kanaplex) soaked into food with Focus and garlic, plus dosed in the water column.",
      "Maintain pristine, oxygenated water. Prognosis is guarded if pineconing is widespread."
    ],
    reefSafeWarning:
      "Use pure Epsom salt (Magnesium Sulfate) with NO added fragrances or oils. Do NOT use standard sodium chloride salt for dropsy.",
    quarantineRequired: true,
    preventionTips: [
      "Avoid feeding expired low-quality dry food.",
      "Prevent chronic stress, dirty substrate, and ammonia spikes."
    ],
    keywords: ["dropsy", "pineconing", "scales sticking out", "bloated fish", "bloat", "fluid retention", "pinecone betta"]
  }
];

export function searchDiseaseCatalog(query: string, environment?: "marine" | "freshwater"): DiseaseEntry[] {
  if (!query || !query.trim()) return [];
  const q = query.toLowerCase().trim();
  const words = q.split(/[\s,.-]+/).filter((w) => w.length > 2);

  return DISEASE_DATABASE.filter((item) => {
    if (environment && item.environment !== "both" && item.environment !== environment) {
      return false;
    }

    // Direct match
    if (item.name.toLowerCase().includes(q)) {
      return true;
    }

    // Keyword match
    if (item.keywords.some((k) => q.includes(k) || k.includes(q))) {
      return true;
    }

    // Multi-word partial match
    let matchCount = 0;
    for (const w of words) {
      if (
        item.name.toLowerCase().includes(w) ||
        item.primarySymptoms.some((s) => s.toLowerCase().includes(w)) ||
        item.affectedHosts.toLowerCase().includes(w) ||
        item.keywords.some((k) => k.includes(w))
      ) {
        matchCount++;
      }
    }

    return matchCount >= Math.min(2, words.length);
  });
}
