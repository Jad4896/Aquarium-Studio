export interface IdentifiedSpecimen {
  name: string;
  species: string;
  category: string;
  growthType?: string;
  zone: string;
  lighting?: string;
  aggressiveness?: string;
  diet?: string;
  temperament?: string;
  interestingFact?: string;
  notes: string;
  aliases?: string[];
}

export const CORAL_CATALOG: IdentifiedSpecimen[] = [
  // --- ZOANTHIDS & PALYTHOAS (SOFT CORALS) ---
  {
    name: "Gobstopper Zoanthid",
    aliases: ["gobstopper", "gobstopper zoa", "gobstopper zoanthid", "gobstoppers", "gob stopper"],
    species: "Zoanthus gigantus",
    category: "Soft Coral",
    growthType: "Runners / Stolons (Mat-forming connective tissue)",
    zone: "Lower to mid rockwork or isolated coral bommie with moderate indirect flow",
    lighting: "PAR 80 - 180 (Low to Moderate Lighting)",
    aggressiveness: "Encroaching / Chemical: Can encrust neighboring rockwork rapidly; contains palytoxin (wear gloves and eye protection when handling or fragging).",
    diet: "Photosynthetic zooxanthellae; absorbs dissolved organics, micronutrients, phytoplankton, and amino acids.",
    notes: "Iconic high-contrast collector zoanthid featuring ruby-red oral centers speckled with radioactive neon green dots and green skirts. Very hardy and rapid grower."
  },
  {
    name: "Rasta Zoanthid",
    aliases: ["rasta", "rasta zoa", "rastas"],
    species: "Zoanthus gigantus",
    category: "Soft Coral",
    growthType: "Runners / Stolons (Mat-forming connective tissue)",
    zone: "Lower rockwork or isolated coral bommie with moderate indirect flow",
    lighting: "PAR 100 - 200 (Moderate Lighting)",
    aggressiveness: "Encroaching / Chemical: Can overgrow and encrust adjacent slower-growing corals; contains palytoxin (wear gloves and eye protection when fragging).",
    diet: "Photosynthetic; absorbs dissolved organics, micronutrients, and phytoplankton.",
    notes: "Best placed on an isolated 'Zoa garden' island rock to prevent it from overtaking main SPS rockwork."
  },
  {
    name: "Utter Chaos Zoanthid",
    aliases: ["utter chaos", "utter chaos paly", "utter chaos zoa"],
    species: "Zoanthus gigantus",
    category: "Soft Coral",
    growthType: "Runners / Stolons (Mat-forming connective tissue)",
    zone: "Lower rockwork or sandbed frag rack with gentle to moderate flow",
    lighting: "PAR 100 - 180 (Moderate Lighting)",
    aggressiveness: "Encroaching / Chemical: Rapid mat growth; polyps contain palytoxin. Maintain clearance from delicate SPS.",
    diet: "Photosynthetic; readily takes broadcast micro-mysis, coral snow, and phytoplankton.",
    notes: "Large fleshy polyps featuring bright orange, red, and blue speckled disc patterns. High grower in established reef tanks."
  },
  {
    name: "Sunny D Zoanthid",
    aliases: ["sunny d", "sunny d zoa", "sunny d's", "sunny delite"],
    species: "Zoanthus gigantus",
    category: "Soft Coral",
    growthType: "Runners / Stolons (Mat-forming connective tissue)",
    zone: "Lower to mid reef structure with moderate flow",
    lighting: "PAR 90 - 175 (Low to Moderate Lighting)",
    aggressiveness: "Encroaching: Forms dense connected mats across rock surfaces; handle with safety gloves.",
    diet: "Photosynthetic; benefits from amino acids and micro-particulate coral feeds.",
    notes: "Vibrant orange mouth with sparkling turquoise body ring and neon green tentacles."
  },
  {
    name: "Fruit Loops Zoanthid",
    aliases: ["fruit loops", "fruit loops zoa", "fruit loop"],
    species: "Zoanthus sp.",
    category: "Soft Coral",
    growthType: "Runners / Stolons (Mat-forming connective tissue)",
    zone: "Lower rockscape with gentle to moderate indirect flow",
    lighting: "PAR 75 - 150 (Low to Moderate Lighting)",
    aggressiveness: "Peaceful / Encroaching: Safe near other Zoanthids; handle with caution due to palytoxin.",
    diet: "Photosynthetic; absorbs dissolved nutrients and coral broadcast foods.",
    notes: "Striking multicolour concentric rings in neon blue, yellow, and orange."
  },
  {
    name: "Green Button Polyp (Palythoa)",
    aliases: ["palythoa", "green button polyp", "button polyp", "grandis paly", "paly"],
    species: "Palythoa mutuki",
    category: "Soft Coral",
    growthType: "Runners / Stolons (Mat-forming connective tissue)",
    zone: "Bottom sandbed or lower rockwork with low to moderate flow",
    lighting: "PAR 60 - 150 (Low to Moderate Lighting)",
    aggressiveness: "Chemical Warfare: High concentration of palytoxin. Never boil or scrub live rock with palythoas.",
    diet: "Greedy direct feeder; captures mysis shrimp, chopped seafood, and reef pellets.",
    notes: "Very hardy and fast multiplying; caution required when propagating."
  },

  // --- LPS (LARGE POLYP STONY) ---
  {
    name: "Dragon Soul Torch Coral",
    aliases: ["dragon soul", "dragon soul torch", "torch coral", "torch"],
    species: "Euphyllia glabrescens",
    category: "LPS",
    growthType: "Calcium carbonate skeleton building (Branching Euphyllia corallites)",
    zone: "Mid-to-low rockwork with moderate, indirect oscillating flow",
    lighting: "PAR 150 - 250 (Moderate Lighting)",
    aggressiveness: "High Aggressiveness: Extends long sweeper tentacles (3-5 inches) at night with potent stinging nematocysts; maintain at least 4 inches clearance from other non-torch corals.",
    diet: "Photosynthetic zooxanthellae; benefits from broadcast amino acids and target feeding micro-mysis / reef roids once weekly.",
    notes: "Requires stable alkalinity (8.0-9.0 dKH) and magnesium (>1350 ppm) to prevent polyp bail-out or brown jelly syndrome."
  },
  {
    name: "Hammer Coral",
    aliases: ["hammer coral", "branching hammer", "wall hammer", "hammer", "euphyllia ancora"],
    species: "Fimbriaphyllia ancora",
    category: "LPS",
    growthType: "Calcium carbonate skeleton building (Wall / Branching corallite)",
    zone: "Lower to mid-level reef with gentle to moderate turbulent flow",
    lighting: "PAR 120 - 200 (Low to Moderate Lighting)",
    aggressiveness: "Moderate-to-High: Has sweeper tentacles that can sting nearby SPS and soft corals, but can usually touch other hammers and frogspawns peacefully.",
    diet: "Photosynthetic; appreciates target feeding of chopped mysis shrimp, brine, or coral liquid amino acids 1-2x per week.",
    notes: "Avoid direct laminar powerhead flow which can tear fleshy polyps against the skeletal septa."
  },
  {
    name: "Frogspawn Coral",
    aliases: ["frogspawn", "frogspawn coral", "fimbriaphyllia divisa"],
    species: "Fimbriaphyllia divisa",
    category: "LPS",
    growthType: "Calcium carbonate skeleton building (Branching corallite structure)",
    zone: "Low to mid-reef placement with moderate indirect swaying flow",
    lighting: "PAR 130 - 220 (Moderate Lighting)",
    aggressiveness: "Moderate: Capable of stinging neighboring corals; can be grouped adjacent to other Fimbriaphyllia hammers.",
    diet: "Photosynthetic; target feed small meaty seafood chunks or particulate coral food every 7-10 days.",
    notes: "Look for distinct branched tips with bulbous nodules; very hardy once established in mature water chemistry."
  },
  {
    name: "Duncan Coral",
    aliases: ["duncan", "duncan coral", "whisker coral", "duncanopsammia"],
    species: "Duncanopsammia axifuga",
    category: "LPS",
    growthType: "Calcium carbonate skeleton building (Branching tubular heads)",
    zone: "Lower to mid tank with low to moderate indirect flow",
    lighting: "PAR 100 - 180 (Low to Moderate Lighting)",
    aggressiveness: "Peaceful: Very mild sting; easily stung and damaged by aggressive Euphyllia or Galaxea corals.",
    diet: "Enthusiastic feeder: open polyps gladly accept mysis shrimp, pellets, and chopped seafood twice weekly for rapid head multiplication.",
    notes: "Superb beginner LPS coral; hardy and adapts to a wide range of lighting spectrums."
  },
  {
    name: "Acan Lord / Micromussa",
    aliases: ["acan", "acan lord", "micromussa", "micromussa lordhowensis", "acan echinata"],
    species: "Micromussa lordhowensis",
    category: "LPS",
    growthType: "Encrusting & submassive calcium carbonate corallites",
    zone: "Bottom sandbed or lower rockscape with low to gentle flow",
    lighting: "PAR 80 - 150 (Low to Moderate Lighting)",
    aggressiveness: "Semi-Aggressive: Extends short sweeper tentacles and mesenterial filaments at night; can digest corals placed within 1-2 inches.",
    diet: "Greedy direct feeder: readily consumes mysis shrimp, calanus, and LPS pellets when polyps are open.",
    notes: "Thrives in slightly nutrient-rich water (NO3: 5-15 ppm, PO4: 0.04-0.08 ppm). Intense light causes bleaching."
  },
  {
    name: "Candy Cane Coral",
    aliases: ["candy cane", "candy cane coral", "trumpet coral", "caulastraea"],
    species: "Caulastraea furcata",
    category: "LPS",
    growthType: "Calcium carbonate skeleton building (Branching corallites)",
    zone: "Mid rockwork with low to moderate oscillating water movement",
    lighting: "PAR 100 - 180 (Moderate Lighting)",
    aggressiveness: "Peaceful: Extends short feeding tentacles at night; very low sting capability.",
    diet: "Photosynthetic; target feed mysis or micro-pellets when tentacles extend.",
    notes: "Puffing up during daytime indicates good health; requires stable calcium (>420 ppm)."
  },
  {
    name: "Bubble Coral",
    aliases: ["bubble coral", "plerogyra", "plerogyra sinuosa"],
    species: "Plerogyra sinuosa",
    category: "LPS",
    growthType: "Calcium carbonate skeleton building (Foliose / Wall corallite)",
    zone: "Bottom sandbed or sheltered lower rock ledge with gentle flow",
    lighting: "PAR 80 - 150 (Low to Moderate Lighting)",
    aggressiveness: "High: Extends formidable sweeper tentacles at night that pack a potent sting.",
    diet: "Photosynthetic; target feed small pieces of mysis or krill 1x weekly.",
    notes: "Vulnerable to polyp perforation if placed in high water flow or dropped on sharp rocks."
  },
  {
    name: "Goniopora (Flowerpot Coral)",
    aliases: ["goniopora", "flowerpot", "flowerpot coral", "goni"],
    species: "Goniopora sp.",
    category: "LPS",
    growthType: "Calcium carbonate skeleton building (Columnar / Encrusting with 24-tentacle polyps)",
    zone: "Lower to mid rockwork with moderate turbulent, non-laminar flow",
    lighting: "PAR 100 - 200 (Moderate Lighting)",
    aggressiveness: "Semi-Aggressive: Extended polyps can sway into nearby corals; keep 3 inches clearance.",
    diet: "Obligate feeder: requires active broadcast feeding of micro-zooplankton, oyster eggs, and amino acids.",
    notes: "Benefited by trace dosing of manganese and iron; watch for clownfish irritating polyps."
  },
  {
    name: "Elegance Coral",
    aliases: ["elegance coral", "catalaphyllia", "catalaphyllia jardinei"],
    species: "Catalaphyllia jardinei",
    category: "LPS",
    growthType: "Calcium carbonate skeleton building (Flabello-meandroid cone skeleton)",
    zone: "Bottom sandbed substrate with gentle swaying flow",
    lighting: "PAR 80 - 160 (Low to Moderate Lighting)",
    aggressiveness: "High: Potent nematocysts on tentacles; will sting any coral or fish that touches it.",
    diet: "Greedy carnivore; consumes mysis shrimp, diced table shrimp, and pellets weekly.",
    notes: "Place skeleton gently in sandbed with fleshy mantle opening upward; avoid placing on rough live rock."
  },

  // --- SPS (SMALL POLYP STONY) ---
  {
    name: "Green Slimer Acropora",
    aliases: ["green slimer", "green slimer acropora", "acropora yongei", "acropora", "slimer"],
    species: "Acropora yongei",
    category: "SPS",
    growthType: "Calcium carbonate skeleton building (Arborescent branching & encrusting base)",
    zone: "Upper reef crest / top third with strong turbulent, random water motion",
    lighting: "PAR 280 - 450 (High Lighting Spectrum)",
    aggressiveness: "Peaceful / Vulnerable: No stinging sweeper tentacles; vulnerable to stings from LPS and soft corals. Grows over rocks rapidly via encrusting base.",
    diet: "Photosynthetic; captures micro-zooplankton, rotifers, and dissolved organics. Supplement with coral amino acids.",
    notes: "Very fast-growing staghorn SPS; produces heavy protective slime when handled out of water. Requires pristine nitrate (<10 ppm) and phosphate (<0.08 ppm)."
  },
  {
    name: "Montipora Cap (Plating Monti)",
    aliases: ["montipora cap", "plating monti", "monti cap", "montipora capricornis", "montipora"],
    species: "Montipora capricornis",
    category: "SPS",
    growthType: "Calcium carbonate skeleton building (Foliose / Plating whorls)",
    zone: "Mid to upper rockwork with moderate to high water flow to prevent detritus settling",
    lighting: "PAR 200 - 350 (Moderate to High Lighting)",
    aggressiveness: "Passive: Non-stinging, but aggressively shades corals beneath it as it plates outward. Sensitive to sweeper stings from LPS.",
    diet: "Primarily photosynthetic; absorbs dissolved nutrients and small organic particulates.",
    notes: "One of the easiest and fastest-growing plating SPS corals; watch for Montipora-eating nudibranchs."
  },
  {
    name: "Bird's Nest Coral",
    aliases: ["birds nest", "bird's nest", "birdsnest", "seriatopora", "seriatopora hystrix"],
    species: "Seriatopora hystrix",
    category: "SPS",
    growthType: "Calcium carbonate skeleton building (Thin needle-branched interlocking thicket)",
    zone: "Upper mid-level reef with strong alternating flow through branches",
    lighting: "PAR 220 - 380 (Moderate to High Lighting)",
    aggressiveness: "Peaceful: Non-aggressive; easily stung by neighboring corals.",
    diet: "Photosynthetic; absorbs coral amino acids and micro-zooplankton.",
    notes: "Requires strong internal water movement to prevent detritus buildup deep within inner branch core."
  },
  {
    name: "Stylophora (Milka)",
    aliases: ["stylophora", "milka stylophora", "cats paw", "cat's paw", "stylophora pistillata"],
    species: "Stylophora pistillata",
    category: "SPS",
    growthType: "Calcium carbonate skeleton building (Club-shaped blunt branches)",
    zone: "Upper rockwork with high turbulent water flow",
    lighting: "PAR 250 - 400 (High Lighting)",
    aggressiveness: "Peaceful: Low defense capability; keep away from LPS sweepers.",
    diet: "Photosynthetic; benefits from reef roids and liquid amino acids.",
    notes: "Very hardy SPS with intense purple or green blunt-tipped branches and furry polyp extension."
  },

  // --- SOFT CORALS & MUSHROOMS ---
  {
    name: "Ricordea Florida Mushroom",
    aliases: ["ricordea florida", "ricordea", "florida ricordea", "ricordea yuma"],
    species: "Ricordea florida",
    category: "Soft Coral",
    growthType: "Root / Basal Foot (Fleshy expanding corallimorph)",
    zone: "Bottom rockwork or sandbed substrate with low to gentle flow",
    lighting: "PAR 50 - 120 (Low Lighting)",
    aggressiveness: "Mild: Can cause minor localized irritation to SPS corals that touch it; generally peaceful.",
    diet: "Photosynthetic; will occasionally capture small pellets or brine shrimp falling onto oral disc.",
    notes: "Excessive water flow causes polyps to detach and drift. Prefers shaded or lower PAR zones."
  },
  {
    name: "Discosoma Mushroom",
    aliases: ["discosoma", "mushroom coral", "bounce mushroom", "jawbreaker", "jawbreaker mushroom"],
    species: "Discosoma sp.",
    category: "Soft Coral",
    growthType: "Root / Basal Foot (Fleshy disc expanding corallimorph)",
    zone: "Low rockwork or bottom substrate in shaded or gentle flow areas",
    lighting: "PAR 40 - 100 (Low Lighting)",
    aggressiveness: "Peaceful / Mild: Can slowly multiply and encroach on SPS rock; harmless to fish.",
    diet: "Photosynthetic; absorbs dissolved nutrients and organic compounds.",
    notes: "Hardy corallimorph that excels in low-light niches; will shrivel if exposed to intense high PAR."
  },
  {
    name: "Toadstool Leather Coral",
    aliases: ["toadstool", "toadstool leather", "leather coral", "sarcophyton", "sarcophyton glaucum"],
    species: "Sarcophyton glaucum",
    category: "Soft Coral",
    growthType: "Root / Basal Foot (Stalked columnar fleshy crown)",
    zone: "Mid-level reef with moderate to strong flow to assist periodic shedding",
    lighting: "PAR 120 - 250 (Moderate Lighting)",
    aggressiveness: "Chemical Warfare (Allelopathy): Releases terpenes and organic toxins into water column that inhibit SPS growth. Run activated carbon.",
    diet: "Photosynthetic; filters dissolved nutrients and organic compounds.",
    notes: "Periodically closes polyps and sheds a waxy outer mucus film to slough off algae and detritus."
  },
  {
    name: "Green Star Polyps (GSP)",
    aliases: ["gsp", "green star polyps", "star polyps", "pachyclavularia violacea", "clavularia"],
    species: "Pachyclavularia violacea",
    category: "Soft Coral",
    growthType: "Runners / Stolons (Dense purple encrusting mat)",
    zone: "Isolated bommie rock or tank back glass with moderate to high flow",
    lighting: "PAR 80 - 220 (Low to Moderate Lighting)",
    aggressiveness: "Highly Encroaching: Encrusts over rocks and will smother any coral in its path. Keep on an isolated island!",
    diet: "Photosynthetic; flourishes on dissolved organics and nitrates.",
    notes: "Fluorescent green grass-like polyps; one of the most indestructible reef corals in the hobby."
  },
  {
    name: "Pulsing Xenia",
    aliases: ["xenia", "pulsing xenia", "xenia elongata"],
    species: "Xenia elongata",
    category: "Soft Coral",
    growthType: "Root / Basal Foot (Creeping stalked colonies)",
    zone: "Upper-to-mid tank with gentle to moderate oscillating flow",
    lighting: "PAR 100 - 200 (Moderate Lighting)",
    aggressiveness: "Encroaching: Rapidly splits and creeps across rockscapes; keep contained on isolated rock.",
    diet: "Photosynthetic; absorbs organic compounds directly from water.",
    notes: "Mesmerizing rhythmic pulsing polyps; sensitive to sudden iodine deficiency or pH dips."
  }
];

export const FISH_INVERT_CATALOG: IdentifiedSpecimen[] = [
  // --- INVERTEBRATES / CLEAN-UP CREW ---
  {
    name: "Tuxedo Urchin",
    aliases: ["tuxedo urchin", "blue tuxedo urchin", "mespilia globulus", "urchin tuxedo", "tuxedo"],
    species: "Mespilia globulus",
    category: "Invertebrate",
    diet: "Herbivore: Grazes voraciously on nuisance filamentous hair algae, film algae, and coralline algae.",
    zone: "Travels across rockwork and glass surfaces constantly searching for nuisance algae.",
    temperament: "Peaceful reef grazer; 100% reef safe.",
    interestingFact: "Famous for 'carrying' camouflage: uses small tube feet to pick up loose shells, snail shells, and tiny coral frags and wear them like a decorative hat.",
    notes: "Ensure all loose frag plugs are glued down, as the urchin's bulldozing habit can dislodge unattached coral frags. Sensitive to copper."
  },
  {
    name: "Pincushion Urchin",
    aliases: ["pincushion urchin", "pincushion", "lytechinus variegatus", "variable urchin"],
    species: "Lytechinus variegatus",
    category: "Invertebrate",
    diet: "Herbivore: Grazes voraciously on film algae, diatoms, and macroalgae from rocks and glass.",
    zone: "Bottom dweller / rock and substrate grazer; active day and night roaming rockwork and glass eating nuisance algae.",
    temperament: "Peaceful reef grazer; generally considered reef safe.",
    interestingFact: "Uses specialized tube feet to hold onto pieces of shell, rubble, and macroalgae as camouflage and protection from UV light.",
    notes: "Ensure all rockwork and coral frags are securely placed. Sensitive to rapid changes in salinity, temperature, and copper."
  },
  {
    name: "Longspine Urchin",
    aliases: ["longspine urchin", "long spine urchin", "diadema", "diadema setosum"],
    species: "Diadema setosum",
    category: "Invertebrate",
    diet: "Herbivore: Excellent grazer of hair algae, turf algae, and macroalgae.",
    zone: "Hides within deep rock crevices during day; ventures out across open rockwork at night.",
    temperament: "Peaceful grazer; sharp brittle spines can easily puncture skin or pop rubber gloves.",
    interestingFact: "Spines can sense shadow changes via photoreceptors across their epidermis, instantly pointing all spines in unison toward an approaching threat.",
    notes: "Requires a spacious aquarium due to spine spread (can exceed 8-10 inches diameter)."
  },
  {
    name: "Skunk Cleaner Shrimp",
    aliases: ["skunk cleaner shrimp", "cleaner shrimp", "lysmata amboinensis", "scarlet cleaner shrimp"],
    species: "Lysmata amboinensis",
    category: "Invertebrate",
    diet: "Scavenger / Carnivore: Consumes leftover fish food, mysis, pellets, and dead organic matter.",
    zone: "Prominent live rock shelf or archway; establishes an unmistakable cleaning station.",
    temperament: "Very peaceful and bold; will readily jump onto the aquarist's hand during routine tank maintenance.",
    interestingFact: "Sets up a recognized reef cleaning station: fish will line up, open their gills and mouths, and allow the shrimp to gently pick off ectoparasites and dead tissue.",
    notes: "Requires iodine for successful exoskeleton molting; sensitive to sudden salinity shocks and copper treatments."
  },
  {
    name: "Blood Red Fire Shrimp",
    aliases: ["fire shrimp", "blood shrimp", "blood red fire shrimp", "lysmata debelius"],
    species: "Lysmata debelius",
    category: "Invertebrate",
    diet: "Scavenger / Carnivore: Enriched mysis shrimp, sinking pellets, and brine shrimp.",
    zone: "Shaded caves and rock overhangs; somewhat reclusive during high daytime lighting.",
    temperament: "Peaceful with all fish and corals; may establish quiet cleaning stations.",
    interestingFact: "Boasts a brilliant blood-red lacquer body with contrasting bright white legs and long white antennae.",
    notes: "Very long lived for a marine shrimp; avoid sharp temperature or specific gravity fluctuations."
  },
  {
    name: "Banded Coral Shrimp",
    aliases: ["banded coral shrimp", "coral banded shrimp", "stenopus hispidus"],
    species: "Stenopus hispidus",
    category: "Invertebrate",
    diet: "Carnivore / Scavenger: Sinking pellets, mysis shrimp, and detritus.",
    zone: "Cave dweller / hangs upside down under rock overhangs with long white antennae visible.",
    temperament: "Territorial with other stenopodid shrimps; peaceful with fish and corals, but may capture very small nano fish if cornered.",
    interestingFact: "Has elongated third walking legs equipped with large chelae (pincers) that it waves rhythmically to establish territory and deter intruders.",
    notes: "Hardy invertebrate with striking red-and-white barber pole stripes; molts regularly."
  },
  {
    name: "Pistol Shrimp (Tiger)",
    aliases: ["pistol shrimp", "tiger pistol shrimp", "alpheus bellulus", "candy pistol shrimp"],
    species: "Alpheus bellulus",
    category: "Invertebrate",
    diet: "Carnivore / Scavenger: Finely minced seafood, frozen mysis, and sinking pellets delivered to burrow.",
    zone: "Subterranean sandbed burrows excavated beneath live rock foundations.",
    temperament: "Peaceful with reef inhabitants; pairs bonded with Watchman Gobies (Cryptocentrus, Stonogobiops).",
    interestingFact: "Snaps its specialized claw at sonic speeds, creating a cavitation bubble reaching over 4,000°C and producing a loud audible 'pop' heard outside the tank.",
    notes: "Provide at least 2-3 inches of mixed grain aragonite sand and rubble for burrow construction."
  },
  {
    name: "Turbo Snail",
    aliases: ["turbo snail", "mexican turbo", "turbo fluctuosus", "mexican turbo snail"],
    species: "Turbo fluctuosus",
    category: "Invertebrate",
    diet: "Herbivore: Voracious consumer of hair algae, film algae, and diatoms from rocks and glass.",
    zone: "Glass walls, wavemaker surfaces, and live rockscape.",
    temperament: "100% Peaceful; non-stinging, safe with all corals and fish.",
    interestingFact: "Possesses a heavy calcareous operculum (trapdoor) that seals its shell tight against predators like hermits and wrasses.",
    notes: "Ensure snails are righted if they tumble upside down onto the sandbed, as Mexican Turbos can struggle to flip themselves over."
  },
  {
    name: "Trochus Snail",
    aliases: ["trochus snail", "banded trochus", "trochus", "trochus niloticus"],
    species: "Trochus niloticus",
    category: "Invertebrate",
    diet: "Herbivore: Film algae, diatoms, cyanobacteria, and turf algae.",
    zone: "Live rock and glass walls; highly agile clean-up crew member.",
    temperament: "Peaceful; completely reef safe.",
    interestingFact: "Unlike Astraea snails, Trochus snails can readily right themselves if knocked upside down using their muscular foot.",
    notes: "One of the best utility snails in reef keeping; long-lived and will spawn in aquariums."
  },
  {
    name: "Nassarius Snail",
    aliases: ["nassarius snail", "nassarius", "nassarius vibex", "zombie snail"],
    species: "Nassarius vibex",
    category: "Invertebrate",
    diet: "Carnivore / Detritivore: Uneaten frozen fish food, sinking pellets, and decaying organic matter.",
    zone: "Buried completely within sandbed with only their snorkel (siphon) protruding.",
    temperament: "Peaceful; excellent sand aerator.",
    interestingFact: "Known as 'Zombie Snails': upon detecting fish food in the water, hundreds will instantly erupt out of the sandbed and race toward the scent.",
    notes: "Keep adequate sand depth (1-3 inches) for them to burrow and keep sandbed sifted."
  },
  {
    name: "Emerald Crab",
    aliases: ["emerald crab", "mithrax crab", "mithraculus sculptus", "green emerald crab"],
    species: "Mithraculus sculptus",
    category: "Invertebrate",
    diet: "Herbivore / Scavenger: Famous consumer of bubble algae (Valonia), hair algae, and leftover meaty food.",
    zone: "Rockwork crevices and shaded caves.",
    temperament: "Generally peaceful reef safe grazer; may pick at polyps if severely starved.",
    interestingFact: "Equipped with spoon-shaped claw tips specially adapted to pop and scrape bubble algae off rocks without bursting the inner spores.",
    notes: "Supplement with dried nori seaweed if bubble algae is depleted."
  },
  {
    name: "Blue Leg Hermit Crab",
    aliases: ["blue leg hermit", "blue leg hermit crab", "clibanarius tricolor"],
    species: "Clibanarius tricolor",
    category: "Invertebrate",
    diet: "Detritivore / Herbivore: Scavenges detritus, hair algae, and uneaten fish food from rock and sand.",
    zone: "Roams all rockwork and sandbed surfaces.",
    temperament: "Peaceful; provide spare empty shells to prevent them evicting snails.",
    interestingFact: "Has vivid royal blue bands on its walking legs with bright orange antennae.",
    notes: "Provide extra shells of varying apertures (1/2 to 1 inch) to facilitate painless molting and shell upgrades."
  },
  {
    name: "Bubble Tip Anemone (BTA)",
    aliases: ["bta", "bubble tip anemone", "rose bubble tip anemone", "rbta", "entacmaea quadricolor"],
    species: "Entacmaea quadricolor",
    category: "Invertebrate",
    diet: "Photosynthetic; target feed small pieces of mysis shrimp or silversides every 2-3 weeks.",
    zone: "Rock crevice where its basal foot can anchor deep in shade while tentacles bask in light.",
    temperament: "Semi-Aggressive: Can wander and sting sessile corals if lighting or water flow changes.",
    interestingFact: "Natural symbiotic host anemone for Clownfish (Amphiprion spp.); polyps swell into bulbous tips under moderate PAR.",
    notes: "Cover powerhead intakes with mesh guards to prevent tragic anemone shredding accidents."
  },

  // --- FISH ---
  {
    name: "Ocellaris Clownfish",
    aliases: ["ocellaris clownfish", "clownfish", "false percula", "amphiprion ocellaris", "nemo"],
    species: "Amphiprion ocellaris",
    category: "Fish",
    diet: "Omnivore: High-grade marine pellets, enriched frozen mysis, spirulina, and brine shrimp 1-2 times daily.",
    zone: "Mid-to-lower water column / hosts in Entacmaea quadricolor (BTA) or quiet rock crevice; establishes a small home territory.",
    temperament: "Peaceful to semi-aggressive when defending host anemone; completely reef-safe with all corals and invertebrates.",
    interestingFact: "Sequential protandric hermaphrodite: all clownfish are born male, and the largest, most dominant fish in a group undergoes a hormonal shift to become the breeding female.",
    notes: "Very hardy and iconic reef fish; pair bonded couples will spawn sticky clutches of adhesive eggs on smooth rock surfaces."
  },
  {
    name: "Percula Clownfish",
    aliases: ["percula clownfish", "true percula", "amphiprion percula", "onyx percula"],
    species: "Amphiprion percula",
    category: "Fish",
    diet: "Omnivore: Marine flakes, pellets, frozen mysis, and cyclops.",
    zone: "Water column and host anemone territory.",
    temperament: "Semi-aggressive once paired; peaceful with non-clownfish reef tankmates.",
    interestingFact: "Has 10 dorsal spines (vs 11 on Ocellaris) and thicker black margins separating its vivid orange and white bars.",
    notes: "Acclimates readily to captive diets; pair with a smaller individual to avoid territorial sparring."
  },
  {
    name: "Yellow Watchman Goby",
    aliases: ["yellow watchman goby", "watchman goby", "cryptocentrus cinctus", "yellow prawn goby"],
    species: "Cryptocentrus cinctus",
    category: "Fish",
    diet: "Carnivore: Sinking marine pellets, frozen mysis shrimp, and finely minced seafood delivered near bottom substrate.",
    zone: "Bottom sandbed substrate; claims a cave burrow entrance and stays within inches of shelter.",
    temperament: "Peaceful sand dweller; territorial only toward other benthic bottom-dwelling gobies in small nano tanks.",
    interestingFact: "Forms an obligate symbiotic partnership with Pistol Shrimp (Alpheus spp.): the nearly blind shrimp excavates and maintains the underground burrow while the goby stands watch at the entrance, signaling danger with tail twitches.",
    notes: "Ensure aquarium has a tight-fitting jump guard net; gobies can jump if startled during lights-out."
  },
  {
    name: "Diamond Watchman Goby",
    aliases: ["diamond goby", "diamond watchman goby", "valenciennea puellaris", "sand sifter goby"],
    species: "Valenciennea puellaris",
    category: "Fish",
    diet: "Carnivore / Sand Sifter: Scoops mouthfuls of sand to filter out micro-crustaceans, worms, and sinking pellets.",
    zone: "Bottom sandbed substrate throughout the entire aquarium floor.",
    temperament: "Peaceful; tireless worker that keeps sand sparkling white.",
    interestingFact: "Continuously takes huge mouthfuls of sand, filters edible fauna through its gills, and expels pristine clean sand out behind it.",
    notes: "Jump risk: requires tight screen top. Requires an established mature sandbed to avoid gradual starvation."
  },
  {
    name: "Firefish Goby",
    aliases: ["firefish", "firefish goby", "nemateleotris magnifica", "red firefish"],
    species: "Nemateleotris magnifica",
    category: "Fish",
    diet: "Carnivore / Planktivore: Frozen copepods, cyclops, calanus, and small marine pellets in the water current.",
    zone: "Hovers in open water near its preferred bolt-hole rock crevice.",
    temperament: "Very timid and peaceful; never harasses tankmates.",
    interestingFact: "Flicks its elongated dorsal spine rhythmically while swimming; uses the spine to lock itself securely inside rock crevices when sleeping.",
    notes: "Notorious jumper: tight mesh lid is mandatory. Best kept singly or as a true mated bonded pair."
  },
  {
    name: "Tailspot Blenny",
    aliases: ["tailspot blenny", "tail spot blenny", "ecsenius stigmatura"],
    species: "Ecsenius stigmatura",
    category: "Fish",
    diet: "Herbivore: Grazes microalgae and film from rocks; accepts spirulina flakes and herbivore pellets.",
    zone: "Perches on rock ledges and periscopes from small holes throughout the middle reef scape.",
    temperament: "Peaceful, comical, and inquisitive; full of character.",
    interestingFact: "Has comb-like teeth used to scrape microalgae from rockwork, and will retreat backward into tiny holes with only its head peering out.",
    notes: "Exceptional nano reef candidate; harmless to corals and very entertaining personality."
  },
  {
    name: "Lawnmower Blenny",
    aliases: ["lawnmower blenny", "algae blenny", "salarias fasciatus"],
    species: "Salarias fasciatus",
    category: "Fish",
    diet: "Herbivore: Voracious consumer of film algae, hair algae, and diatoms off glass and rock.",
    zone: "Hops from rock to rock grazing; rests on pectoral fins on sand and shelves.",
    temperament: "Peaceful towards other fish; territorial towards similar benthic blennies.",
    interestingFact: "Leaves comical lip-shaped kiss marks on algae-covered tank glass while grazing.",
    notes: "Requires an aquarium with abundant natural algae growth or regular supplementation with dried nori."
  },
  {
    name: "Royal Gramma",
    aliases: ["royal gramma", "gramma loreto", "fairy basslet"],
    species: "Gramma loreto",
    category: "Fish",
    diet: "Carnivore: Zooplankton feeder that eagerly takes frozen mysis, enriched brine, and small marine pellets.",
    zone: "Lower to mid reef overhangs and caves; often swims vertically or upside down along shaded rock ceilings.",
    temperament: "Peaceful community reef inhabitant; opens mouth in territorial threat display if another fish approaches its cave, but rarely causes harm.",
    interestingFact: "Demonstrates positive geotropism: will orient its belly toward any solid rock surface regardless of orientation, swimming sideways or completely upside-down under ledges.",
    notes: "Vibrant bicolored purple and canary yellow; non-destructive to corals and clean-up crew."
  },
  {
    name: "Six Line Wrasse",
    aliases: ["six line wrasse", "sixline wrasse", "sixline", "pseudocheilinus hexataenia"],
    species: "Pseudocheilinus hexataenia",
    category: "Fish",
    diet: "Carnivore / Pest Hunter: Actively hunts micro-fauna, copepods, amphipods, pyramidellid snails, and flatworms.",
    zone: "Weaves through labyrinthine rock crevices and caves throughout entire reef structure.",
    temperament: "Active and curious; can turn feisty and territorial toward other wrasses or timid fish once established.",
    interestingFact: "Spins a protective mucus cocoon every night before sleeping inside rockwork crevices to mask its scent from nocturnal reef predators.",
    notes: "Outstanding biological utility fish for consuming reef aquarium pests including Montipora-eating flatworms and bristle worms."
  },
  {
    name: "Yellow Coris Wrasse",
    aliases: ["yellow coris wrasse", "yellow wrasse", "halichoeres chrysus", "golden wrasse"],
    species: "Halichoeres chrysus",
    category: "Fish",
    diet: "Carnivore: Hunts flatworms, fireworms, pyramidellid snails, and accepts frozen mysis and pellets.",
    zone: "Swims throughout open reef and dives into sandbed at lights-out.",
    temperament: "Very peaceful and reef safe; beneficial pest hunter.",
    interestingFact: "Sleeps buried completely beneath 2 inches of sand every night; will dive into the sandbed instantly if frightened.",
    notes: "Requires a fine sandbed (at least 1.5 - 2 inches deep) to dive into for sleep and safety."
  },
  {
    name: "Blue Tang (Hippo Tang)",
    aliases: ["blue tang", "hippo tang", "regal tang", "paracanthurus hepatus", "dory"],
    species: "Paracanthurus hepatus",
    category: "Fish",
    diet: "Omnivore / Herbivore: Macroalgae, nori sheets, mysis shrimp, and marine pellets high in spirulina.",
    zone: "Open water column; weaves between Acropora branches and rock crevices when startled.",
    temperament: "Active and peaceful; prone to ich (Cryptocaryon irritans) when stressed.",
    interestingFact: "Has a venomous caudal spine (scalpel) on the base of its tail fin used for defense, and wedges itself flat between tight rocks to sleep.",
    notes: "Requires a minimum 6-foot aquarium (125+ gallons) when adult. Needs pristine water quality."
  },
  {
    name: "Yellow Tang",
    aliases: ["yellow tang", "zebrasoma flavescens", "hawaiian yellow tang"],
    species: "Zebrasoma flavescens",
    category: "Fish",
    diet: "Herbivore: Daily nori seaweed sheets, filamentous algae, and herbivore spirulina pellets.",
    zone: "Active swimmer patrolling all levels of the reef rockscape.",
    temperament: "Peaceful to semi-aggressive with other Zebrasoma tangs; reef safe with all corals.",
    interestingFact: "Possesses a razor-sharp white defensive scalpel at the caudal peduncle that stands out against its bright yellow body.",
    notes: "Iconic and hardy saltwater fish; feeding nori soaked in vitamin C / garlic promotes disease resistance."
  },
  {
    name: "Flame Angelfish",
    aliases: ["flame angel", "flame angelfish", "centropyge loricula"],
    species: "Centropyge loricula",
    category: "Fish",
    diet: "Omnivore: Grazes microalgae, sponge matter, frozen mysis, enriched brine, and angel formula.",
    zone: "Weaves constantly in and out of live rockwork caves and tunnels.",
    temperament: "Semi-aggressive; 'with caution' reef safe (may nip at fleshy LPS like Trachyphyllia or Acan polyps).",
    interestingFact: "One of the most intensely colored saltwater fish, glowing in fiery crimson-orange with deep blue vertical bars.",
    notes: "Keep well fed with varied nutrient-dense foods to deter coral nipping."
  },
  {
    name: "Yellow Assessor",
    aliases: ["yellow assessor", "assessor flavissimus", "yellow assessor basslet", "assessor", "yellow assessor fish"],
    species: "Assessor flavissimus",
    category: "Fish",
    diet: "Carnivore: Nutrient-rich meaty foods including frozen mysis shrimp, enriched brine shrimp, cyclop-eeze, and high-quality pellets.",
    zone: "Mid to bottom water column; inhabits caves, ledges, and overhangs, frequently swimming in an inverted position near rock ceilings.",
    temperament: "Peaceful and shy; highly reef safe. May squabble with other cave-dwelling basslets if aquarium is too small.",
    interestingFact: "Paternal mouthbrooder where the male guards fertilized eggs in his mouth until they hatch; famous for inverted swimming posture along overhangs.",
    notes: "Requires a well-established aquarium of at least 30 gallons with plenty of live rock caves and dim overhangs to feel secure."
  },
  {
    name: "Blue Assessor",
    aliases: ["blue assessor", "assessor macneilli", "blue assessor basslet"],
    species: "Assessor macneilli",
    category: "Fish",
    diet: "Carnivore: Finely chopped frozen mysis, brine shrimp, copepods, and small marine pellets.",
    zone: "Shaded rock caves, ledges, and caverns; swims upside down against rock ceilings.",
    temperament: "Peaceful community nano fish; safe with all corals and delicate invertebrates.",
    interestingFact: "Exhibits negative geotaxis: regularly swims completely upside-down under horizontal rock ledges and cave roofs.",
    notes: "Vibrant midnight-blue with neon sapphire fin fringes; very peaceful and long-lived."
  },
  {
    name: "Foxface Rabbitfish",
    aliases: ["foxface", "foxface rabbitfish", "one spot foxface", "siganus vulpinus"],
    species: "Siganus vulpinus",
    category: "Fish",
    diet: "Herbivore: Unrivaled consumer of nuisance Bryopsis algae, bubble algae, hair algae, and nori sheets.",
    zone: "Cruises open mid-water column and picks across rock structures.",
    temperament: "Peaceful and docile, though easily startled.",
    interestingFact: "Has venomous dorsal spines; when sleeping or frightened, it instantly camouflages into a mottled brownish-grey pattern.",
    notes: "Handle with extreme care during maintenance; painful sting from dorsal spines."
  }
];

export const FRESHWATER_FAUNA_CATALOG: IdentifiedSpecimen[] = [
  // --- FRESHWATER INVERTEBRATES ---
  {
    name: "Red Cherry Shrimp",
    aliases: ["red cherry shrimp", "cherry shrimp", "rcs", "neocaridina davidi", "neocaridina", "sakura shrimp", "fire red shrimp"],
    species: "Neocaridina davidi",
    category: "Invertebrates",
    diet: "Grazer / Biofilm: Green microalgae, biofilm, bacter AE, sinking shrimp micro-wafers, and blanched spinach/zucchini.",
    zone: "Substrate, driftwood, and plant foliage; active 24/7 constantly grazing biofilm.",
    temperament: "100% Peaceful dwarf shrimp; safe with all nano tankmates.",
    interestingFact: "Females develop visible 'saddles' of unfertilized eggs behind their carapace before transferring fertilized clutches under their swimmerets (pleopods) for 3-4 weeks until miniature shrimplets hatch.",
    notes: "Very hardy planted aquarium inhabitant. Water parameters: pH 6.8-7.8, GH 6-10, KH 2-5, TDS 150-250 ppm. Drip-acclimate slowly."
  },
  {
    name: "Crystal Red Shrimp",
    aliases: ["crystal red shrimp", "crs", "caridina logemanni", "crystal black shrimp", "taiwan bee", "bee shrimp"],
    species: "Caridina logemanni",
    category: "Invertebrates",
    diet: "Grazer / Biofilm: Specialized shrimp mineral sticks, snowflake soy hull food, biofilm, and blanched nettle leaves.",
    zone: "Lower plant canopy, moss cushions, and active buffering aquasoil substrate.",
    temperament: "Extremely peaceful dwarf shrimp; sensitive to sudden water changes.",
    interestingFact: "Selectively bred from the wild bee shrimp in Japan; high grades showcase deep opaque snow-white porcelain banding against intense red ruby bars.",
    notes: "Requires soft, acidic water maintained with active buffering substrate: pH 5.8-6.5, GH 4-6, KH 0-1, TDS 100-140 ppm. Use pure RO/DI water remineralized with GH+ only."
  },
  {
    name: "Amano Shrimp",
    aliases: ["amano shrimp", "yamato shrimp", "caridina multidentata", "japanese algae shrimp", "amano"],
    species: "Caridina multidentata",
    category: "Invertebrates",
    diet: "Detritivore / Herbivore: Filamentous hair algae, black beard algae (BBA), surface biofilm, and sinking bottom wafers.",
    zone: "All zones; relentlessly crawls across driftwood, aquascaping stones, and plant stems.",
    temperament: "Peaceful yet robust grazer; holds its own and readily grabs sinking pellets.",
    interestingFact: "Popularized worldwide by maestro Takashi Amano as the ultimate natural algae cleanup crew for nature planted aquascapes.",
    notes: "Exceptionally hardy in pH 6.5-7.5, GH 6-10; cannot reproduce in pure freshwater as their larvae require a brackish water phase to develop."
  },
  {
    name: "Zebra Nerite Snail",
    aliases: ["zebra nerite snail", "nerite snail", "nerite", "neritina natalensis", "tiger nerite", "horned nerite", "track nerite"],
    species: "Neritina natalensis",
    category: "Invertebrates",
    diet: "Strict herbivore: Green spot algae, diatoms (brown algae), and glass biofilm.",
    zone: "Glass aquarium walls, hardscape rocks, and smooth driftwood.",
    temperament: "100% Peaceful; never consumes or damages live plants.",
    interestingFact: "Cannot reproduce in freshwater (their eggs require brackish/marine conditions to hatch), meaning they will never overrun or overpopulate your tank.",
    notes: "Requires pH >7.0 and adequate calcium/KH for sturdy, healthy shell calcification. Keep a tight lid as they can occasionally venture above the waterline."
  },
  {
    name: "Mystery Snail",
    aliases: ["mystery snail", "apple snail", "pomacea diffusa", "pomacea bridgesii", "golden mystery snail", "ivory mystery snail"],
    species: "Pomacea diffusa",
    category: "Invertebrates",
    diet: "Omnivore / Detritivore: Sinking algae wafers, blanched vegetables (kale, zucchini, spinach), and calcium snail treats.",
    zone: "All tank levels; climbs vertical glass surfaces and gracefully floats downward using its foot as a parachute.",
    temperament: "Peaceful and active; safe with live plants as this species lacks the rasping teeth of pest apple snails.",
    interestingFact: "Possesses both a gill and a long siphon tube they extend upward to the water surface like a snorkel to breathe atmospheric air.",
    notes: "Deposits conspicuous pink calcified egg clutches above the waterline, making population management effortless."
  },

  // --- FRESHWATER FISH ---
  {
    name: "Neon Tetra",
    aliases: ["neon tetra", "neon tetras", "paracheirodon innesi", "neons"],
    species: "Paracheirodon innesi",
    category: "Fish",
    diet: "Omnivore: High-grade micro-pellets, spirulina flakes, and frozen baby brine shrimp or daphnia.",
    zone: "Mid-water column schooling fish; best kept in groups of 8-12+ individuals.",
    temperament: "Peaceful community nano schooling fish.",
    interestingFact: "Features an iridescent horizontal turquoise-blue stripe composed of guanine crystal cells that reflect ambient light in shaded blackwater streams.",
    notes: "Prefers soft, slightly acidic water (pH 6.0-7.0, GH 3-8, temp 22-26°C) with dense plant cover and subdued lighting."
  },
  {
    name: "Cardinal Tetra",
    aliases: ["cardinal tetra", "cardinals", "paracheirodon axelrodi", "cardinal tetras"],
    species: "Paracheirodon axelrodi",
    category: "Fish",
    diet: "Omnivore: Micro-flakes, micro-pellets, and live or frozen cyclops and daphnia.",
    zone: "Mid-to-lower water column schooling fish.",
    temperament: "Very peaceful; tight schooling behavior when kept in large shoals.",
    interestingFact: "Distinguished from the neon tetra by its unbroken, full-length crimson red belly stripe extending from snout to tail base.",
    notes: "Thrives in warm, soft, acidic water (pH 5.5-6.8, temp 25-28°C); perfect tankmate for discus and planted biotope aquariums."
  },
  {
    name: "Chili Rasbora",
    aliases: ["chili rasbora", "mosquito rasbora", "boraras brigittae", "chilli rasbora"],
    species: "Boraras brigittae",
    category: "Fish",
    diet: "Micropredator: Crushed nano flakes, infusoria, baby brine shrimp, and micro-pellets.",
    zone: "Mid-to-upper water column darting through fine-leaved stem plant canopies.",
    temperament: "Extremely peaceful nano schooler; 100% safe with newborn dwarf shrimp shrimplets.",
    interestingFact: "Reaches a maximum adult size of only 1.5–2 cm, making them one of the smallest vertebrate fish species on the planet.",
    notes: "Requires a low-stress environment with gentle filtration flow, tannin-stained acidic water (pH 5.5-6.8), and dim lighting."
  },
  {
    name: "Harlequin Rasbora",
    aliases: ["harlequin rasbora", "harlequin", "trigonostigma heteromorpha", "harlequins"],
    species: "Trigonostigma heteromorpha",
    category: "Fish",
    diet: "Omnivore: High-quality tropical flakes, micropellets, and frozen daphnia.",
    zone: "Mid-to-top water column active schooler.",
    temperament: "Extremely peaceful and hardy community schooler.",
    interestingFact: "Spawns upside-down on the undersides of broad water plant leaves such as Cryptocoryne and Anubias.",
    notes: "Very hardy and adaptable; vibrant copper-orange hue with iconic black triangular patch."
  },
  {
    name: "Otocinclus Catfish",
    aliases: ["otocinclus", "oto cat", "otocinclus catfish", "oto", "otocinclus macrospilus", "otos"],
    species: "Otocinclus macrospilus",
    category: "Fish",
    diet: "Aufwuchs grazer: Diatoms (brown algae), soft green algae, biofilm, and supplemented with spirulina wafers and blanched zucchini.",
    zone: "Glass walls, broad plant foliage (Anubias, Echinodorus), and smooth river stones.",
    temperament: "Peaceful nano schooling herbivore; 100% plant and shrimp safe.",
    interestingFact: "Consistently cleans green dust algae and diatoms without damaging the most delicate plant leaf blades or carpeting foliage.",
    notes: "Introduce only into mature, established planted tanks with ample biofilm and diatoms. Keep in shoals of 6+."
  },
  {
    name: "Pygmy Corydoras",
    aliases: ["pygmy cory", "pygmy corydoras", "corydoras pygmaeus", "pygmaeus"],
    species: "Corydoras pygmaeus",
    category: "Fish",
    diet: "Omnivore: Sinking micro-wafers, crushed pellets, and baby brine shrimp.",
    zone: "Bottom substrate as well as mid-water hovering groups.",
    temperament: "Peaceful and social; thrives in groups of 6-10+.",
    interestingFact: "Unlike most bottom-dwelling corydoras, Pygmy corys frequently hover mid-water like miniature hummingbirds in synchronized groups.",
    notes: "Requires soft sand or smooth aquasoil to protect delicate sensory barbels."
  },
  {
    name: "Panda Corydoras",
    aliases: ["panda cory", "panda corydoras", "corydoras panda"],
    species: "Corydoras panda",
    category: "Fish",
    diet: "Omnivore: Sinking bottom wafers, bug bites, and frozen bloodworms.",
    zone: "Bottom substrate active sifter.",
    temperament: "Peaceful community bottom dweller; must be kept in groups of 5+.",
    interestingFact: "Named for its distinctive black eye-mask and dorsal/tail patches resembling a giant panda.",
    notes: "Requires clean water with low nitrates and fine sand substrate."
  },
  {
    name: "Betta Fish",
    aliases: ["betta", "siamese fighting fish", "betta fish", "betta splendens"],
    species: "Betta splendens",
    category: "Fish",
    diet: "Carnivore: High-protein floating betta pellets, frozen bloodworms, and daphnia.",
    zone: "Top to mid water column; rests on broad plant leaves near surface.",
    temperament: "Solitary male; aggressive towards other bettas; peaceful with snails and shrimp in well-planted 20L+ aquariums.",
    interestingFact: "Possesses a labyrinth organ enabling them to breathe atmospheric air directly from the water surface.",
    notes: "Requires gentle flow, warm water (25-28°C), and a secure tank lid."
  },
  {
    name: "German Blue Ram",
    aliases: ["german blue ram", "blue ram", "ramirezi", "mikrogeophagus ramirezi"],
    species: "Mikrogeophagus ramirezi",
    category: "Fish",
    diet: "Micro-carnivore: Sinking cichlid micro-pellets, frozen bloodworms, and enriched brine shrimp.",
    zone: "Bottom to mid water column around caves, driftwood, and shaded foliage.",
    temperament: "Peaceful dwarf cichlid; forms monogamous pairs and defends small nesting territory during spawning.",
    interestingFact: "Both parents participate in excavating shallow pits in the substrate to herd and guard their free-swimming fry.",
    notes: "Demands warm water (27-30°C), low nitrates (<10 ppm), and soft, acidic water."
  },
  {
    name: "Bristlenose Pleco",
    aliases: ["bristlenose pleco", "bushynose pleco", "ancistrus", "bristlenose"],
    species: "Ancistrus sp.",
    category: "Fish",
    diet: "Herbivore / Wood grazer: Sinking spirulina wafers, blanched zucchini, and bogwood lignin.",
    zone: "Bottom substrate, driftwood caves, and rock undersides.",
    temperament: "Peaceful bottom dweller; nocturnal.",
    interestingFact: "Mature males develop elaborate fleshy tentacle-like bristles across their snout used to signal fitness and aerate egg clutches.",
    notes: "Must have real natural driftwood in the aquarium as dietary lignin is essential for their digestive tract."
  },
  {
    name: "Celestial Pearl Danio",
    aliases: ["celestial pearl danio", "cpd", "galaxy rasbora", "danio margaritatus"],
    species: "Danio margaritatus",
    category: "Fish",
    diet: "Omnivore: Micro-pellets, crushed spirulina flakes, and live baby brine shrimp.",
    zone: "Lower to mid water column among dense plant stems.",
    temperament: "Peaceful nano fish; males exhibit harmless sparring displays with flared fins.",
    interestingFact: "Discovered in 2006 in shallow, heavily vegetated wetland pools in Myanmar and rapidly became an aquascaping sensation.",
    notes: "Thrives in cooler water (20-24°C) with dense plant cover to reduce shyness."
  },
  {
    name: "Kuhli Loach",
    aliases: ["kuhli loach", "coolie loach", "pangio kuhlii"],
    species: "Pangio kuhlii",
    category: "Fish",
    diet: "Scavenger: Sinking carnivore pellets, micro-worms, and fallen detritus.",
    zone: "Bottom substrate; burrows into fine sand and squeezes under driftwood crevices.",
    temperament: "Extremely peaceful nocturnal social species; best kept in groups of 5+.",
    interestingFact: "Eel-like body with tiny subocular spines beneath the eyes that can erect defensively if grabbed by predators.",
    notes: "Fine sand substrate is mandatory to prevent skin abrasions."
  },
  {
    name: "Honey Gourami",
    aliases: ["honey gourami", "trichogaster chuna", "colisa chuna"],
    species: "Trichogaster chuna",
    category: "Fish",
    diet: "Omnivore: Quality flake food, micro-granules, live daphnia, and mosquito larvae.",
    zone: "Top to mid water column among floating plants.",
    temperament: "One of the most peaceful and gentle gourami species available.",
    interestingFact: "Modified pelvic fins resemble delicate feelers equipped with sensory taste cells used to explore surroundings and greet tankmates.",
    notes: "Requires gentle surface agitation so as not to disrupt potential bubble nests."
  }
];

// Helper: title case words
function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Robust matching engine that:
 * 1. Checks exact name or aliases
 * 2. Checks distinctive phrase containment
 * 3. Never clobbers the user's morph name with an unrelated morph!
 * 4. Strictly separates freshwater and saltwater livestock.
 */
export function findMatchingSpecimen(
  query: string,
  type: "CORAL" | "FISH_INVERT",
  isFreshwater: boolean = false
): IdentifiedSpecimen | null {
  const catalog =
    type === "CORAL"
      ? CORAL_CATALOG
      : isFreshwater
      ? FRESHWATER_FAUNA_CATALOG
      : FISH_INVERT_CATALOG;
  const rawQ = query.trim();
  const q = rawQ.toLowerCase();
  if (!q) return null;

  // 1. Direct exact name or alias match
  for (const item of catalog) {
    if (item.name.toLowerCase() === q) return item;
    if (item.aliases && item.aliases.some((a) => a.toLowerCase() === q)) {
      return item;
    }
  }

  // 2. Check for distinctive alias containment
  // e.g. query "gobstopper" matches alias "gobstopper", query "super rasta zoa" contains alias "rasta zoa"
  const familyStopWords = new Set([
    "zoa", "zoas", "zoanthid", "zoanthids", "paly", "palythoa", "coral", "corals",
    "soft", "lps", "sps", "fish", "invert", "invertebrate", "marine", "saltwater",
    "reef", "tank", "aquarium", "urchin", "shrimp", "snail", "crab", "goby",
    "wrasse", "tang", "blenny", "clownfish", "angelfish", "mushroom", "torch", "hammer"
  ]);

  let bestItem: IdentifiedSpecimen | null = null;
  let bestScore = 0;

  for (const item of catalog) {
    if (!item.aliases) continue;
    for (const alias of item.aliases) {
      const aLower = alias.toLowerCase();
      // If query exactly equals alias
      if (q === aLower) {
        return item;
      }

      // Check if alias is multi-word or distinct
      const aliasWords = aLower.split(/\s+/);
      const isDistinctiveAlias = !familyStopWords.has(aLower) && aLower.length >= 4;

      // Query contains the full alias (e.g. "my gobstopper zoanthid" contains "gobstopper zoanthid")
      if (q.includes(aLower) && isDistinctiveAlias) {
        const score = 100 + aLower.length;
        if (score > bestScore) {
          bestScore = score;
          bestItem = item;
        }
      }

      // Alias contains the query (e.g. alias "gobstopper zoanthid" contains query "gobstopper")
      // Only valid if query is NOT just a generic family word like "zoa", "torch", "urchin"
      if (aLower.includes(q) && !familyStopWords.has(q) && q.length >= 4) {
        const score = 80 + q.length;
        if (score > bestScore) {
          bestScore = score;
          bestItem = item;
        }
      }
    }
  }

  if (bestItem) {
    return bestItem;
  }

  // 3. Family Template Heuristic with User Name Preservation:
  // If the query contains a known genus/family keyword (e.g. "zoanthid", "torch", "acropora", "urchin"),
  // return a specialized specimen USING THE USER'S QUERY NAME (so it NEVER returns an unrelated morph like "Rasta Zoanthid"!).
  const isZoa = q.includes("zoanthid") || q.includes("zoa") || q.includes("paly") || q.includes("palythoa");
  if (isZoa && type === "CORAL") {
    return {
      name: titleCase(rawQ),
      species: "Zoanthus gigantus",
      category: "Soft Coral",
      growthType: "Runners / Stolons (Mat-forming connective tissue)",
      zone: "Lower to mid rockwork or isolated coral bommie with moderate indirect flow",
      lighting: "PAR 80 - 180 (Low to Moderate Lighting)",
      aggressiveness: "Encroaching / Chemical: Can encrust neighboring rockwork rapidly; contains palytoxin (wear gloves and eye protection when handling or fragging).",
      diet: "Photosynthetic zooxanthellae; absorbs dissolved organics, micronutrients, and phytoplankton.",
      notes: `Vibrant ${titleCase(rawQ)} zoanthid polyps. Place on an isolated rock to manage mat expansion and avoid shadowing adjacent SPS.`
    };
  }

  const isTorch = q.includes("torch");
  if (isTorch && type === "CORAL") {
    return {
      name: titleCase(rawQ),
      species: "Euphyllia glabrescens",
      category: "LPS",
      growthType: "Calcium carbonate skeleton building (Branching Euphyllia corallites)",
      zone: "Mid-to-low rockwork with moderate, indirect oscillating flow",
      lighting: "PAR 150 - 250 (Moderate Lighting)",
      aggressiveness: "High Aggressiveness: Extends long sweeper tentacles (3-5 inches) at night with potent stinging nematocysts; maintain at least 4 inches clearance from other non-torch corals.",
      diet: "Photosynthetic zooxanthellae; benefits from broadcast amino acids and target feeding micro-mysis / reef roids once weekly.",
      notes: "Requires stable alkalinity (8.0-9.0 dKH) and magnesium (>1350 ppm) to prevent polyp bail-out or brown jelly syndrome."
    };
  }

  const isHammer = q.includes("hammer") || q.includes("frogspawn") || q.includes("octospawn");
  if (isHammer && type === "CORAL") {
    return {
      name: titleCase(rawQ),
      species: "Fimbriaphyllia ancora",
      category: "LPS",
      growthType: "Calcium carbonate skeleton building (Branching / Wall corallites)",
      zone: "Lower to mid-level reef with gentle to moderate turbulent flow",
      lighting: "PAR 120 - 200 (Low to Moderate Lighting)",
      aggressiveness: "Moderate-to-High: Has sweeper tentacles that can sting nearby SPS and soft corals.",
      diet: "Photosynthetic; appreciates target feeding of chopped mysis shrimp or coral liquid amino acids 1-2x per week.",
      notes: "Avoid direct laminar powerhead flow which can tear fleshy polyps against skeletal septa."
    };
  }

  const isAcro = q.includes("acropora") || q.includes("acro") || q.includes("millepora") || q.includes("tenuis") || q.includes("staghorn");
  if (isAcro && type === "CORAL") {
    return {
      name: titleCase(rawQ),
      species: "Acropora sp.",
      category: "SPS",
      growthType: "Calcium carbonate skeleton building (Arborescent branching & encrusting base)",
      zone: "Upper reef crest / top third with strong turbulent, random water motion",
      lighting: "PAR 280 - 450 (High Lighting Spectrum)",
      aggressiveness: "Peaceful / Vulnerable: No stinging sweeper tentacles; vulnerable to stings from LPS and soft corals.",
      diet: "Photosynthetic; captures micro-zooplankton, rotifers, and dissolved organics.",
      notes: "Requires pristine water quality (nitrate <10 ppm, phosphate <0.05 ppm) and rock-solid alkalinity."
    };
  }

  const isMonti = q.includes("montipora") || q.includes("monti");
  if (isMonti && type === "CORAL") {
    return {
      name: titleCase(rawQ),
      species: "Montipora sp.",
      category: "SPS",
      growthType: "Calcium carbonate skeleton building (Foliose / Plating / Encrusting whorls)",
      zone: "Mid to upper rockwork with moderate to high water flow",
      lighting: "PAR 180 - 320 (Moderate to High Lighting)",
      aggressiveness: "Passive: Non-stinging; can shade corals beneath it as it plates outward.",
      diet: "Primarily photosynthetic; absorbs dissolved nutrients and small organic particulates.",
      notes: "Hardy, fast-growing SPS; watch for Montipora-eating nudibranchs."
    };
  }

  const isMushroom = q.includes("mushroom") || q.includes("discosoma") || q.includes("rhodactis") || q.includes("ricordea");
  if (isMushroom && type === "CORAL") {
    return {
      name: titleCase(rawQ),
      species: "Discosoma sp.",
      category: "Soft Coral",
      growthType: "Root / Basal Foot (Fleshy expanding corallimorph)",
      zone: "Bottom rockwork or sandbed substrate with low to gentle flow",
      lighting: "PAR 50 - 120 (Low Lighting)",
      aggressiveness: "Mild: Generally peaceful; harmless to fish.",
      diet: "Photosynthetic; absorbs dissolved nutrients and organic compounds.",
      notes: "Hardy corallimorph that excels in low-light niches; will shrivel if exposed to intense high PAR."
    };
  }

  // 3. Fauna Template Heuristics strictly separated by environment (Freshwater vs Saltwater)
  if (type === "FISH_INVERT") {
    if (isFreshwater) {
      // --- FRESHWATER HEURISTICS ---
      const isShrimp = q.includes("shrimp");
      if (isShrimp) {
        return {
          name: titleCase(rawQ),
          species: "Neocaridina / Caridina sp.",
          category: "Invertebrates",
          diet: "Grazer / Biofilm: Sinking shrimp pellets, biofilm, bacter AE, spirulina, and blanched spinach.",
          zone: "Substrate, plant foliage, and moss cushions; active 24/7 constantly grazing biofilm.",
          temperament: "100% Peaceful dwarf shrimp; safe with all nano freshwater tankmates.",
          interestingFact: "Regularly molts its chitinous exoskeleton as it grows; requires adequate calcium and magnesium (GH 4-8) for smooth molting without 'white ring of death'.",
          notes: "Thrives in established planted aquariums. Keep parameters stable: pH 6.4-7.5, TDS 120-220 ppm. Sensitive to copper-based treatments."
        };
      }

      const isSnail = q.includes("snail");
      if (isSnail) {
        return {
          name: titleCase(rawQ),
          species: "Neritina / Gastropoda sp.",
          category: "Invertebrates",
          diet: "Herbivore / Detritivore: Green spot algae, diatoms, decaying plant matter, and sinking algae wafers.",
          zone: "Aquarium glass panes, hardscape stones, and plant stems.",
          temperament: "100% Peaceful; non-stinging, safe with all plants, fish, and dwarf shrimp.",
          interestingFact: "Possesses a specialized rasping tongue called a radula used to scrape microalgae and diatoms off hard surfaces.",
          notes: "Crucial member of the planted tank clean-up crew. Requires alkaline/neutral pH (>7.0) to prevent shell erosion. Sensitive to copper."
        };
      }

      const isCrab = q.includes("crab");
      if (isCrab) {
        return {
          name: titleCase(rawQ),
          species: "Limnopilos naiyanetri",
          category: "Invertebrates",
          diet: "Omnivore: Fine sinking pellets, microscopic biofilm, and decaying plant matter.",
          zone: "Moss clumps, plant roots, and substrate crevices.",
          temperament: "Extremely peaceful nano invertebrate; 100% plant and shrimp safe.",
          interestingFact: "Miniature freshwater crab originating from Thailand; fully aquatic and does not require land access.",
          notes: "Keep with peaceful nano tankmates; avoid large or aggressive predatory fish."
        };
      }

      const isTetra = q.includes("tetra");
      if (isTetra) {
        return {
          name: titleCase(rawQ),
          species: "Characidae sp.",
          category: "Fish",
          diet: "Omnivore: High-grade micro-pellets, spirulina flakes, and frozen baby brine shrimp or daphnia.",
          zone: "Mid-water column schooling fish; thrives in groups of 8-12+ individuals.",
          temperament: "Peaceful community nano schooling fish; plant and shrimp safe.",
          interestingFact: "Features an iridescent stripe that refracts ambient light in shaded blackwater river tributaries.",
          notes: "Prefers soft, slightly acidic water (pH 6.0-7.0, temp 22-26°C); provide gentle flow and dense background planting."
        };
      }

      const isRasbora = q.includes("rasbora");
      if (isRasbora) {
        return {
          name: titleCase(rawQ),
          species: "Cyprinidae sp.",
          category: "Fish",
          diet: "Micropredator: Crushed nano flakes, infusoria, baby brine shrimp, and micro-pellets.",
          zone: "Mid-to-upper water column darting through fine-leaved stem plant canopies.",
          temperament: "Extremely peaceful nano schooler; 100% safe with newborn dwarf shrimp shrimplets.",
          interestingFact: "Stays under 2–3 cm in adult size; schooling display enhances coloration in planted aquascapes.",
          notes: "Requires gentle filtration flow, stable acidic water (pH 5.5-6.8), and dim lighting with floating plants."
        };
      }

      const isCory = q.includes("cory") || q.includes("corydoras");
      if (isCory) {
        return {
          name: titleCase(rawQ),
          species: "Corydoras sp.",
          category: "Fish",
          diet: "Omnivore: Sinking bottom pellets, micro-wafers, bug bites, and frozen daphnia.",
          zone: "Bottom substrate; constantly sifts sand and bottom foliage.",
          temperament: "Extremely peaceful and social; must be kept in groups of 6+ individuals.",
          interestingFact: "Can swallow air bubbles at the surface and absorb oxygen through their specialized vascularized intestine.",
          notes: "Smooth sand substrate is essential to avoid wearing down or injuring their delicate sensory barbels."
        };
      }

      const isPleco = q.includes("pleco") || q.includes("ancistrus");
      if (isPleco) {
        return {
          name: titleCase(rawQ),
          species: "Ancistrus sp.",
          category: "Fish",
          diet: "Herbivore / Wood grazer: Sinking spirulina wafers, blanched zucchini, and bogwood lignin.",
          zone: "Bottom substrate, driftwood caves, and rock undersides.",
          temperament: "Peaceful bottom dweller; nocturnal.",
          interestingFact: "Possesses a specialized sucker mouth and raspy odontodes enabling them to adhere to surfaces in high flow.",
          notes: "Natural bogwood/driftwood is mandatory in their aquarium diet for proper digestive tract health."
        };
      }

      const isBetta = q.includes("betta");
      if (isBetta) {
        return {
          name: titleCase(rawQ),
          species: "Betta splendens",
          category: "Fish",
          diet: "Carnivore: High-protein floating betta pellets, frozen bloodworms, and daphnia.",
          zone: "Top to mid water column; rests on broad plant leaves near surface.",
          temperament: "Solitary male; aggressive towards other bettas; peaceful with snails and dwarf shrimp in well-planted setups.",
          interestingFact: "Possesses a labyrinth organ enabling them to breathe atmospheric oxygen directly from the water surface.",
          notes: "Requires gentle flow, warm water (25-28°C), and a secure tank lid."
        };
      }

      const isCichlid = q.includes("cichlid") || q.includes("ram") || q.includes("apisto") || q.includes("discus");
      if (isCichlid) {
        return {
          name: titleCase(rawQ),
          species: "Cichlidae sp.",
          category: "Fish",
          diet: "Omnivore / Micro-carnivore: Sinking cichlid micro-pellets, frozen bloodworms, and enriched brine shrimp.",
          zone: "Bottom to mid water column around caves, driftwood, and shaded foliage.",
          temperament: "Semi-aggressive / territorial during breeding; peaceful community dwarf cichlid outside spawning.",
          interestingFact: "Highly intelligent cichlid displaying advanced parental brood care and fry herding.",
          notes: "Demands stable parameters, clean water with low nitrates (<10 ppm), and soft, acidic water."
        };
      }

      const isLoach = q.includes("loach") || q.includes("kuhli");
      if (isLoach) {
        return {
          name: titleCase(rawQ),
          species: "Cobitidae sp.",
          category: "Fish",
          diet: "Scavenger: Sinking carnivore pellets, micro-worms, and fallen detritus.",
          zone: "Bottom substrate; burrows into fine sand and squeezes under driftwood crevices.",
          temperament: "Extremely peaceful nocturnal social species; best kept in groups of 5+.",
          interestingFact: "Eel-like body with tiny subocular spines beneath the eyes that can erect defensively if grabbed by predators.",
          notes: "Fine sand substrate is mandatory to prevent skin abrasions."
        };
      }

      const isDanio = q.includes("danio");
      if (isDanio) {
        return {
          name: titleCase(rawQ),
          species: "Danio sp.",
          category: "Fish",
          diet: "Omnivore: Micro-pellets, crushed spirulina flakes, and live baby brine shrimp.",
          zone: "Lower to mid water column among dense plant stems.",
          temperament: "Peaceful nano fish; males exhibit harmless sparring displays with flared fins.",
          interestingFact: "Extremely active nano fish adapted to clear, vegetated streams and pools.",
          notes: "Thrives with dense plant cover, clean well-oxygenated water, and stable temperatures."
        };
      }

      // Default freshwater template
      return {
        name: titleCase(rawQ),
        species: "Pisces sp.",
        category: "Fish",
        diet: "Omnivore: High-grade freshwater micro-pellets, tropical flakes, and frozen daphnia.",
        zone: "Mid-water column and planted aquascape foliage.",
        temperament: "Peaceful community planted aquarium inhabitant; plant safe.",
        interestingFact: "Thrives in balanced nature aquariums with natural biological filtration and live plants.",
        notes: "Maintain stable freshwater parameters: pH 6.5-7.4, GH 4-10, temp 23-26°C."
      };
    } else {
      // --- SALTWATER / REEF HEURISTICS ---
      const isUrchin = q.includes("urchin");
      if (isUrchin) {
        return {
          name: titleCase(rawQ),
          species: "Echinoidea sp.",
          category: "Invertebrates",
          diet: "Herbivore: Grazes voraciously on film algae, hair algae, and coralline algae from rocks and glass.",
          zone: "Bottom dweller / rock and substrate grazer; roams entire aquarium searching for nuisance algae.",
          temperament: "Peaceful reef grazer; completely reef safe.",
          interestingFact: "Uses specialized tube feet to hold onto pieces of shell and rubble as camouflage and sunshade.",
          notes: "Ensure all loose frag plugs are glued down, as the urchin's bulldozing habit can dislodge unattached coral frags. Sensitive to copper."
        };
      }

      const isShrimp = q.includes("shrimp");
      if (isShrimp) {
        return {
          name: titleCase(rawQ),
          species: "Caridea sp.",
          category: "Invertebrates",
          diet: "Carnivore / Scavenger: Uneaten fish food, frozen mysis, sinking pellets, and detritus.",
          zone: "Rockwork crevices, caves, and overhangs.",
          temperament: "Peaceful community reef inhabitant.",
          interestingFact: "Molts its chitinous exoskeleton regularly as it grows; requires adequate dissolved iodine.",
          notes: "Sensitive to rapid salinity fluctuations, sudden temperature swings, and any copper medications."
        };
      }

      const isSnail = q.includes("snail") || q.includes("conch");
      if (isSnail) {
        return {
          name: titleCase(rawQ),
          species: "Gastropoda sp.",
          category: "Invertebrates",
          diet: "Herbivore / Detritivore: Film algae, diatoms, hair algae, and organic debris.",
          zone: "Glass walls, substrate, and rock surfaces.",
          temperament: "100% Peaceful; non-stinging, safe with all corals and fish.",
          interestingFact: "Possesses a specialized raspy tongue called a radula used to scrape microalgae off hard surfaces.",
          notes: "Crucial member of the reef clean-up crew; sensitive to high nitrates and copper."
        };
      }

      const isCrab = q.includes("crab");
      if (isCrab) {
        return {
          name: titleCase(rawQ),
          species: "Decapoda sp.",
          category: "Invertebrates",
          diet: "Detritivore / Herbivore: Nuisance hair algae, bubble algae, uneaten fish food, and detritus.",
          zone: "Rockwork crevices and sandbed substrate.",
          temperament: "Peaceful reef cleanup crew member; keep extra shells for hermits to avoid snail predation.",
          interestingFact: "Regularly molts as it grows, seeking out larger empty gastropod shells to protect its soft abdomen.",
          notes: "Reef-safe detritivore; sensitive to copper treatments and sudden salinity drops."
        };
      }

      const isGoby = q.includes("goby");
      if (isGoby) {
        return {
          name: titleCase(rawQ),
          species: "Gobiidae sp.",
          category: "Fish",
          diet: "Carnivore: Frozen mysis shrimp, cyclops, and sinking marine pellets.",
          zone: "Bottom substrate / cave burrow entrance.",
          temperament: "Peaceful sand dweller; territorial only toward other benthic gobies.",
          interestingFact: "Many goby species form obligate symbiotic partnerships with burrowing pistol shrimp.",
          notes: "Tight-fitting jump guard net is required; gobies can jump if startled during lights-out."
        };
      }

      const isWrasse = q.includes("wrasse");
      if (isWrasse) {
        return {
          name: titleCase(rawQ),
          species: "Labridae sp.",
          category: "Fish",
          diet: "Carnivore: Frozen mysis, enriched brine, and actively hunts micro-fauna and reef pests.",
          zone: "Active swimmer patrolling rockwork crevices and caves.",
          temperament: "Active and curious; excellent pest hunter.",
          interestingFact: "Most wrasses either spin a protective mucus cocoon or dive into sandbeds to sleep safely at night.",
          notes: "High jump risk: secure mesh screen top is mandatory."
        };
      }

      const isTang = q.includes("tang");
      if (isTang) {
        return {
          name: titleCase(rawQ),
          species: "Acanthuridae sp.",
          category: "Fish",
          diet: "Herbivore: Daily nori seaweed sheets, macroalgae, and spirulina pellets.",
          zone: "Open water column and active rock grazer.",
          temperament: "Active swimmer; can be territorial toward similar tang species.",
          interestingFact: "Possesses sharp defensive scalpel spines at the base of the caudal peduncle.",
          notes: "Requires a spacious tank with high water flow and oxygenation."
        };
      }

      const isClownfish = q.includes("clown") || q.includes("ocellaris") || q.includes("percula");
      if (isClownfish) {
        return {
          name: titleCase(rawQ),
          species: "Amphiprion ocellaris",
          category: "Fish",
          diet: "Omnivore: Frozen mysis, enriched brine shrimp, marine pellets, and spirulina.",
          zone: "Hosts in bubble-tip anemone, torch corals, or hovers in corner territory.",
          temperament: "Semi-aggressive; fiercely defends its host anemone or nesting territory.",
          interestingFact: "Sequential hermaphrodites: all clownfish hatch as gender-neutral, develop into males, and the largest dominant fish transforms into the alpha female.",
          notes: "Extremely hardy and iconic marine reef inhabitant. Acclimates readily to community reef environments."
        };
      }

      // Default saltwater template
      return {
        name: titleCase(rawQ),
        species: "Pisces sp.",
        category: "Fish",
        diet: "Carnivore / Omnivore: High-grade marine pellets, frozen mysis shrimp, and marine nori.",
        zone: "Mid-to-lower reef rockwork and open water column.",
        temperament: "Reef-safe community marine inhabitant.",
        interestingFact: "Adapted to stable tropical marine reef ecosystems with rich biodiversity.",
        notes: "Maintain stable saltwater parameters: Salinity 1.025 SG, Alk 8.0-9.0 dKH, temp 24-26°C."
      };
    }
  }

  return null;
}
