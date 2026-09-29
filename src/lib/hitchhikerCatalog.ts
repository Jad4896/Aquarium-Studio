export interface HitchhikerEntry {
  id: string;
  name: string;
  scientificName?: string;
  category: "Pest" | "Beneficial" | "Harmless" | "Nuisance" | "Parasite" | "Harmful";
  environment: "marine" | "freshwater" | "both";
  riskLevel: "Low" | "Moderate" | "High" | "Critical";
  commonLocations: string;
  visualTraits: string[];
  description: string;
  managementGuide: string[];
  naturalPredators: string[];
  keywords: string[];
}

export const HITCHHIKER_DATABASE: HitchhikerEntry[] = [
  // MARINE HITCHHIKERS & PESTS
  {
    id: "aiptasia",
    name: "Aiptasia (Glass Anemone)",
    scientificName: "Aiptasia pulchella / Exaiptasia diaphana",
    category: "Pest",
    environment: "marine",
    riskLevel: "High",
    commonLocations: "Live rock crevices, powerheads, coral frags, sump chambers",
    visualTraits: [
      "Translucent brown or beige polyp with long slender stinging tentacles",
      "Central oral disc with oral cone",
      "Retracts instantly into rock crevices when touched or shaded",
      "Ranges from a few millimeters to 5+ cm in diameter"
    ],
    description:
      "A fast-multiplying pest anemone that possesses potent stinging nematocysts. Rapidly outcompetes corals, stinging delicate SPS/LPS tissue and causing polyp recession or bacterial infection.",
    managementGuide: [
      "DO NOT pull or scrape off with tweezers: torn tissue fragments regenerate into dozens of new polyps.",
      "Spot treatment: Inject with concentrated Calcium Hydroxide (Kalkwasser paste), Lemon juice, or commercial Aiptasia-X directly into the oral disc before it retracts.",
      "Covering: Seal the crevice opening with coral epoxy or cyanoacrylate super glue gel.",
      "Biological control: Add Peppermint Shrimp (Lysmata wurdemanni), Berghia Nudibranchs (obligate Aiptasia feeders), or Filefish (Acreichthys tomentosus)."
    ],
    naturalPredators: ["Berghia nudibranchs", "Peppermint shrimp (Lysmata wurdemanni)", "Bristletail filefish", "Copperband butterflyfish"],
    keywords: ["aiptasia", "glass anemone", "pest anemone", "translucent polyp", "stinging tentacle", "brown anemone", "rock anemone", "flower-like polyp"]
  },
  {
    id: "majano",
    name: "Majano Anemone",
    scientificName: "Anemonia majano",
    category: "Pest",
    environment: "marine",
    riskLevel: "High",
    commonLocations: "Upper live rock in high light, between coral colonies",
    visualTraits: [
      "Small bulbous anemone with stubby, clubbed, or bubble-tipped tentacles",
      "Green, brown, or fluorescent greenish-copper coloration",
      "Typically 1 - 3 cm across, forms dense colonies"
    ],
    description:
      "A decorative-looking but highly invasive pest anemone. Stings neighbouring corals aggressively and multiplies through pedal laceration and budding under standard reef lighting.",
    managementGuide: [
      "Manual removal outside the tank: Chip away the underlying rock with a chisel.",
      "Laser or wand burning (specialized reef tools).",
      "Chemical injection: Spot dose with concentrated kalkwasser slurry or Aiptasia-X directly into the mouth.",
      "Encapsulate entirely with two-part epoxy putty."
    ],
    naturalPredators: ["Bristletail filefish", "Certain butterflyfish species (Chaetodon spp.)"],
    keywords: ["majano", "manjano", "pest anemone", "green bubble anemone", "clubbed tentacles", "small anemone"]
  },
  {
    id: "bristleworm",
    name: "Common Bristleworm",
    scientificName: "Eurythoe complanata (Polychaete)",
    category: "Beneficial",
    environment: "marine",
    riskLevel: "Low",
    commonLocations: "Under live rock, deep in sand bed, nocturnal scavenger",
    visualTraits: [
      "Segmented pinkish-red or grey body with tufts of white fiberglass-like bristles (chaetae) along flanks",
      "Moves with undulating worm-like motion across substrate at night",
      "Hides rapidly when a flashlight is turned on"
    ],
    description:
      "Valuable cleanup crew member that consumes uneaten fish food, decaying matter, and detritus deep in rockwork. However, DO NOT touch with bare hands as the microscopic bristles embed into skin causing painful itching.",
    managementGuide: [
      "No removal necessary in most cases: population self-regulates according to tank feeding amounts.",
      "If overpopulated, reduce fish feeding frequency and siphon uneaten food.",
      "To remove large specimens: use plastic tweezers or a DIY bottle worm trap baited with mysis shrimp at lights-out.",
      "Never grab with bare fingers: if stung, apply household vinegar or adhesive tape to pull out bristles."
    ],
    naturalPredators: ["Six-line wrasse", "Melanurus wrasse", "Arrow crab (Stenorhynchus seticornis)", "Banded coral shrimp (Stenopus hispidus)"],
    keywords: ["bristleworm", "bristle worm", "polychaete", "fireworm", "segmented worm", "pink worm", "hairy worm", "white bristles"]
  },
  {
    id: "fireworm-harmful",
    name: "Bearded Fireworm (Corallivore)",
    scientificName: "Hermodice carunculata",
    category: "Harmful",
    environment: "marine",
    riskLevel: "Critical",
    commonLocations: "Perched directly on Gorgonians, Acropora, and soft coral colonies",
    visualTraits: [
      "Heavy flattened body with pronounced bright red/orange caruncle (sensory head crest)",
      "Dense, prominent white bristle tufts along both sides",
      "Often seen actively chewing on coral branches leaving bleached bare patches"
    ],
    description:
      "Unlike common scavenger bristleworms, this predatory fireworm actively feeds on living coral flesh, anemones, and gorgonians. Highly destructive if left in a reef aquarium.",
    managementGuide: [
      "Immediate physical extraction using sturdy plastic forceps or tweezers.",
      "Inspect coral bases at night with a red light for lurking specimens.",
      "Quarantine new live rock and dip incoming corals."
    ],
    naturalPredators: ["Large triggerfish", "Large wrasses (not always reef safe)"],
    keywords: ["bearded fireworm", "hermodice", "coral-eating worm", "caruncle", "red head worm", "eating coral worm"]
  },
  {
    id: "red-flatworms",
    name: "Red Planaria (Rust Flatworms)",
    scientificName: "Convolutriloba retrogemma",
    category: "Nuisance",
    environment: "marine",
    riskLevel: "Moderate",
    commonLocations: "Lower rocks, sandbed, shading Mushroom and Leather corals",
    visualTraits: [
      "Tiny flat oval or shield-shaped reddish-brown or rust-orange discs (1 - 3 mm)",
      "Three-lobed posterior tail visible under magnifying glass",
      "Forms dense reddish carpets smothering rock and coral surfaces"
    ],
    description:
      "Photosynthetic acoel flatworms that reproduce explosively in moderate flow. While they don't eat coral tissue, their dense mats smother corals from receiving light. Warning: when large populations die simultaneously, they release toxic chemical compounds into the water.",
    managementGuide: [
      "Siphon out as many flatworms as possible using airline tubing fitted with a rigid tube tip before chemical treatment.",
      "Chemical treatment: Flatworm eXit (Salifert). Always run heavy Activated Carbon and prepare a 30% water change immediately after dosing to bind released toxins.",
      "Biological control: Six-line wrasse, Yellow coris wrasse (Halichoeres chrysus), or Blue Velvet Nudibranch (Chelidonura varians)."
    ],
    naturalPredators: ["Yellow coris wrasse (Halichoeres chrysus)", "Melanurus wrasse", "Six-line wrasse", "Blue velvet nudibranch"],
    keywords: ["flatworm", "red planaria", "rust flatworm", "red bugs on rock", "brown disc", "convolutriloba", "red carpet on sand"]
  },
  {
    id: "aefw",
    name: "Acropora-Eating Flatworm (AEFW)",
    scientificName: "Prosthiostomum acroporae",
    category: "Parasite",
    environment: "marine",
    riskLevel: "Critical",
    commonLocations: "Underside and shaded base of Acropora coral branches",
    visualTraits: [
      "Nearly invisible translucent camouflage matching Acropora tissue color",
      "Circular or irregular bite marks on Acropora branches leaving white skeleton patches",
      "Small clusters of brown circular egg capsules glued to dead coral skeleton bases"
    ],
    description:
      "Devastating parasite of SPS corals. Consumes Acropora tissue, leaving bite marks and triggering Rapid Tissue Necrosis (RTN). Very difficult to detect without coral dipping.",
    managementGuide: [
      "Dip all affected Acropora in Coral Rx, Potassium Chloride (KCl), or Revive weekly for 4-6 weeks to kill hatched flatworms.",
      "Scrape off all visible egg clusters with a razor blade or dental pick outside the tank (dips do NOT kill eggs).",
      "Introduce pest-hunting wrasses (Halichoeres chrysus, Halichoeres melanurus).",
      "Maintain a 6-week fish-only quarantine for all new Acropora frags."
    ],
    naturalPredators: ["Halichoeres wrasses (Melanurus, Yellow Coris)", "Springeri dottyback"],
    keywords: ["aefw", "acropora flatworm", "coral eating flatworm", "acro bite marks", "acropora dying from base", "acropora white spots"]
  },
  {
    id: "asterina",
    name: "Asterina Starfish",
    scientificName: "Asterina sp.",
    category: "Nuisance",
    environment: "marine",
    riskLevel: "Low",
    commonLocations: "Aquarium glass, live rock, coral bases",
    visualTraits: [
      "Small asymmetrical starfish (0.5 - 1.5 cm) with 4 - 7 uneven arms",
      "Mottled greyish-white, beige, or sometimes greenish-brown body",
      "Multiplies rapidly via fissiparous asexual division (splitting in half)"
    ],
    description:
      "The vast majority are harmless film algae and biofilm grazers. However, a small minority of morphs have been observed irritating or grazing upon Zoanthid polyps and SPS tissue.",
    managementGuide: [
      "Manual removal: Pluck them off the glass during morning hours when lights turn on.",
      "Biological control: Harlequin Shrimp (Hymenocera picta) are obligate starfish eaters and will eradicate Asterina populations completely (note: Harlequin shrimp must be fed starfish once Asterina are gone)."
    ],
    naturalPredators: ["Harlequin shrimp (Hymenocera picta)"],
    keywords: ["asterina", "small starfish", "tiny sea star", "uneven star", "white star on glass", "dividing starfish"]
  },
  {
    id: "vermetid",
    name: "Vermetid Snail",
    scientificName: "Dendropoma / Vermetidae",
    category: "Pest",
    environment: "marine",
    riskLevel: "Moderate",
    commonLocations: "Hard calcareous rockwork, coral skeleton bases, frag plugs",
    visualTraits: [
      "Hard, sharp, tubular calcified snail shell permanently cemented to rock",
      "Casts thin, web-like mucus feeding nets into the water column when water is stirred or coral food is added",
      "Mucus nets irritate nearby coral polyps causing them to retract and slowly starve"
    ],
    description:
      "Sessile snails that build irregular coiled calcium tubes and filter feed by casting sticky mucus nets. High numbers can severely stress Acropora, Montipora, and Euphyllia colonies.",
    managementGuide: [
      "Super glue capping: Cover the tube opening with a thick dab of cyanoacrylate gel or coral epoxy to starve the snail.",
      "Bone cutters: Crush the tube flat down to its basal attachment point on the rock.",
      "Biological control: Bumblebee Snails (Engina mendicaria) can prey on small vermetids.",
      "Reduce broadcast coral feeding containing fine particulate matter that nourishes them."
    ],
    naturalPredators: ["Bumblebee snails (Engina mendicaria)"],
    keywords: ["vermetid", "tube snail", "mucus web", "spider web on coral", "sharp rock tube", "cemented tube snail"]
  },
  {
    id: "bubble-algae",
    name: "Bubble Algae",
    scientificName: "Valonia ventricosa / Dictyosphaeria",
    category: "Nuisance",
    environment: "marine",
    riskLevel: "Moderate",
    commonLocations: "Live rock crevices, between coral heads, overflow boxes",
    visualTraits: [
      "Shiny, dark emerald-green or silver-green fluid-filled spheres or grape-like clusters",
      "Firm, rubbery texture when touched",
      "Single vesicle can reach size of marble, often growing in tight clumps"
    ],
    description:
      "A fast-spreading macroalga. Inside each vesicle are millions of spores and fluid. If popped inside the aquarium, spores can disperse and seed new colonies throughout rockwork.",
    managementGuide: [
      "Manual siphoning: Gently twist and dislodge intact bubbles using a blunt dental pick while running a siphon hose directly next to it to catch escaping spores.",
      "Biological control: Emerald Crabs (Mithraculus sculptus) eagerly pop and consume bubble algae.",
      "Herbivorous fish: Foxface Rabbitfish (Siganus vulpinus) and Desjardini Sailfin Tangs."
    ],
    naturalPredators: ["Emerald crab (Mithraculus sculptus)", "Foxface rabbitfish (Siganus vulpinus)", "Sailfin tang"],
    keywords: ["bubble algae", "valonia", "green bubble", "shiny green ball", "emerald sphere", "grape algae"]
  },
  {
    id: "bryopsis",
    name: "Bryopsis Algae",
    scientificName: "Bryopsis pennata",
    category: "Nuisance",
    environment: "marine",
    riskLevel: "High",
    commonLocations: "Live rock crests, powerhead nozzles, overflow teeth",
    visualTraits: [
      "Dark green fern-like, feather-like, or frond-like branching filaments",
      "Distinct feather foliage structure under magnifying glass",
      "Soft and slippery, resistant to standard clean-up crew grazing due to chemical deterrents"
    ],
    description:
      "A notoriously persistent invasive macroalga containing chemical compounds that make it unpalatable to most clean-up crew snails and hermits. Can rapidly overgrow SPS and LPS colonies.",
    managementGuide: [
      "Medical treatment: Dose Fluconazole (Reef Flux) at 20 mg/gallon. Kills Bryopsis within 10-14 days without harming corals, invertebrates, or biological nitrifying bacteria.",
      "Manual removal: Scrape outside the tank; do not pull by hand inside the water column as fragments spread.",
      "Elevate Magnesium levels with Kent Tech-M (historical method, fluconazole is preferred today)."
    ],
    naturalPredators: ["Elysia crispata (Lettuce Sea Slug)"],
    keywords: ["bryopsis", "feather algae", "fern algae", "hair algae with branches", "green fern on rock"]
  },
  {
    id: "copepod-amphipod",
    name: "Beneficial Copepods & Amphipods",
    scientificName: "Tisbe, Tigriopus, Gammarus spp.",
    category: "Beneficial",
    environment: "marine",
    riskLevel: "Low",
    commonLocations: "Glass at night, refugium chaetomorpha, porous rock cavities",
    visualTraits: [
      "Tiny white specks skittering on glass (copepods, 0.5 - 1 mm)",
      "Curved shrimp-like micro-crustaceans scurrying in rock crevices (amphipods, 2 - 6 mm)",
      "Move very fast when light hits them"
    ],
    description:
      "The pinnacle of a healthy reef ecosystem! They graze on microalgae and detritus, aerate substrate, and serve as the primary natural food source for Mandarin Dragonets, Wrasses, and Anthias.",
    managementGuide: [
      "Protect and encourage population! No removal needed whatsoever.",
      "Provide a refugium with Chaetomorpha algae to sustain breeding colonies.",
      "Dose live phytoplankton weekly to feed copepod nauplii."
    ],
    naturalPredators: ["Mandarin dragonet", "Six-line wrasse", "Small reef fish", "Coral polyps"],
    keywords: ["copepod", "amphipod", "pod", "tiny white bug on glass", "micro shrimp", "white speck moving", "crustacean"]
  },
  {
    id: "stomatella",
    name: "Stomatella Snail",
    scientificName: "Stomatella varia",
    category: "Beneficial",
    environment: "marine",
    riskLevel: "Low",
    commonLocations: "Live rock, aquarium glass at night, powerhead bodies",
    visualTraits: [
      "Resembles a fast-moving slug with a small, flat, ear-shaped half shell on its back",
      "Two long antennae and soft fleshy foot",
      "Can autotomize (shed) the rear part of its foot to escape predators like crabs"
    ],
    description:
      "One of the single best hitchhikers in the hobby! An voracious herbivore that devours diatoms, film algae, and hair algae. Readily reproduces in captivity without any harm to corals.",
    managementGuide: [
      "Celebrate and protect this hitchhiker!",
      "Ensure powerhead intakes have guards so they are not pulled into impellers.",
      "No eradication needed."
    ],
    naturalPredators: ["Hermit crabs", "Wrasses", "Peppermint shrimp"],
    keywords: ["stomatella", "fast slug with shell", "ear snail", "flat shell snail", "slug with half shell"]
  },

  // FRESHWATER HITCHHIKERS & PESTS
  {
    id: "fw-hydra",
    name: "Hydra",
    scientificName: "Hydra vulgaris / Hydra viridissima",
    category: "Harmful",
    environment: "freshwater",
    riskLevel: "High",
    commonLocations: "Aquarium glass, plant leaves, hardscape in planted shrimp tanks",
    visualTraits: [
      "Tiny translucent white or bright green polyp attached to glass by a basal foot",
      "5 to 12 long stinging tentacles radiating from a central body column",
      "Contracts into a tiny ball when touched or disturbed"
    ],
    description:
      "A freshwater cnidarian related to marine anemones. Possesses stinging nematocysts that paralyze newborn baby dwarf shrimp (shrimplets) and newly hatched fish fry. Can rapidly multiply in high-nutrient planted tanks.",
    managementGuide: [
      "DO NOT crush or scrape off glass: each severed cell cluster can regenerate into a full hydra.",
      "Medication: Treat with Fenbendazole (Panacur C) or Flubendazole ('No Planaria'). Note: Kills Nerite and Mystery snails; remove ornamental snails before treatment.",
      "Biological control: Spixi snails (Asolene spixi), juvenile Three-Spot Gouramis, or Guppy fry (will peck at hydra if food is restricted)."
    ],
    naturalPredators: ["Spixi snail", "Three-spot gourami", "Mollies"],
    keywords: ["hydra", "freshwater anemone", "tentacles on glass", "tiny green polyp", "shrimplet killer", "white polyp on glass"]
  },
  {
    id: "fw-planaria",
    name: "Planaria Flatworm (Arrowhead)",
    scientificName: "Dugesia sp.",
    category: "Harmful",
    environment: "freshwater",
    riskLevel: "High",
    commonLocations: "Planted substrate, crawling on glass, attacking molting shrimp",
    visualTraits: [
      "Distinct triangular, arrow-shaped head with two prominent crossed eyespots",
      "Smooth gliding locomotion (not looping or wriggling)",
      "Enters shrimp shells during vulnerable post-molt stages"
    ],
    description:
      "A predatory carnivorous flatworm capable of overpowering molting dwarf shrimp, snails, and fish eggs. Produces a paralyzing slime and secretes toxic defensive secretions.",
    managementGuide: [
      "Medication: Dose 'No Planaria' (Betel nut palm extract) or Fenbendazole (0.1g per 10 gallons). Remove ornamental snails before dosing.",
      "Planaria glass traps: Glass pipe baited with raw beef liver or bloodworms overnight.",
      "Avoid overfeeding protein-heavy commercial shrimp food."
    ],
    naturalPredators: ["Guppies", "Betta (occasionally)", "Paradise fish"],
    keywords: ["planaria", "arrowhead worm", "triangular head", "two eyespots", "flatworm in shrimp tank", "shrimp killer worm"]
  },
  {
    id: "fw-rhabdocoela",
    name: "Rhabdocoela (Harmless Flatworm)",
    scientificName: "Rhabdocoela sp.",
    category: "Beneficial",
    environment: "freshwater",
    riskLevel: "Low",
    commonLocations: "Crawling along glass near substrate line, inside filter media",
    visualTraits: [
      "Small rounded, oblong white or translucent body (1 - 2 mm)",
      "NO triangular head and NO visible crossed eyespots (rounded head)",
      "Glides smoothly across glass consuming biofilm and detritus"
    ],
    description:
      "A 100% harmless detritivore frequently mistaken for dangerous Planaria. It cannot harm adult shrimp, shrimplets, snails, or fish. Population expands when excessive food settles in the substrate.",
    managementGuide: [
      "No medication required!",
      "Simply reduce feeding portions and gravel-vacuum substrate to reduce detritus.",
      "Small community fish (microrasboras, tetras, guppies) will readily eat them as live snacks."
    ],
    naturalPredators: ["Chili rasboras", "Neon tetras", "Guppies", "Endlers"],
    keywords: ["rhabdocoela", "harmless white worm", "rounded head worm", "white worm on glass", "not planaria"]
  },
  {
    id: "fw-bba",
    name: "Black Beard Algae (BBA)",
    scientificName: "Audouinella / Rhodochorton",
    category: "Nuisance",
    environment: "freshwater",
    riskLevel: "Moderate",
    commonLocations: "Plant leaf edges (Anubias), driftwood tips, filter return pipes",
    visualTraits: [
      "Dense, bushy black, dark grey, or purple tufts clinging tenaciously to hardscape",
      "Difficult to scrape or pull off without tearing plant leaves",
      "Thrives in unstable CO2 conditions and high organic waste"
    ],
    description:
      "A notoriously stubborn red alga (appears black/grey) that infests slow-growing plants and hardscape in high-light or fluctuating-CO2 environments. Rarely eaten by standard algae eaters.",
    managementGuide: [
      "Spot treatment: Turn off filter flow, use a syringe to spot-dose Hydrogen Peroxide (3% H2O2 at 1ml/gal) or Liquid Carbon (Seachem Flourish Excel / Glutaraldehyde) directly onto the tufts. BBA turns red/white and dies within 48h.",
      "Stabilize CO2 delivery and maintain consistent lighting photoperiods (6-8 hours).",
      "Biological control: True Siamese Algae Eaters (Crossocheilus oblongus) and Amano Shrimp (Caridina multidentata)."
    ],
    naturalPredators: ["Siamese algae eater (Crossocheilus oblongus)", "Amano shrimp (Caridina multidentata)"],
    keywords: ["black beard algae", "bba", "black tufts", "brush algae", "black fur on plant", "grey fuzz on wood"]
  }
];

export function searchHitchhikerCatalog(query: string, environment?: "marine" | "freshwater"): HitchhikerEntry[] {
  if (!query || !query.trim()) return [];
  const q = query.toLowerCase().trim();
  const words = q.split(/[\s,.-]+/).filter((w) => w.length > 2);

  return HITCHHIKER_DATABASE.filter((item) => {
    if (environment && item.environment !== "both" && item.environment !== environment) {
      return false;
    }

    // Direct match
    if (item.name.toLowerCase().includes(q) || (item.scientificName && item.scientificName.toLowerCase().includes(q))) {
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
        item.description.toLowerCase().includes(w) ||
        item.visualTraits.some((vt) => vt.toLowerCase().includes(w)) ||
        item.keywords.some((k) => k.includes(w))
      ) {
        matchCount++;
      }
    }

    return matchCount >= Math.min(2, words.length);
  });
}
