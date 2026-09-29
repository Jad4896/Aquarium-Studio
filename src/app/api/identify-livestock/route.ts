import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { GoogleGenAI } from "@google/genai";
import { findMatchingSpecimen } from "@/lib/marineCatalog";

function cleanBase64Payload(
  rawInput: string | undefined | null,
  fallbackMime: string = "image/jpeg"
): { base64: string; mime: string } {
  if (!rawInput || typeof rawInput !== "string") {
    return { base64: "", mime: fallbackMime };
  }
  let str = rawInput.trim();
  let mime = fallbackMime;

  // Handle data: URIs e.g. "data:image/jpeg;base64,/9j/4AAQ..." or "data:video/mp4;base64,AAAA..."
  if (str.startsWith("data:")) {
    const commaIndex = str.indexOf(",");
    if (commaIndex !== -1) {
      const header = str.substring(5, commaIndex);
      const mimePart = header.split(";")[0]?.trim();
      if (mimePart) {
        mime = mimePart;
      }
      str = str.substring(commaIndex + 1);
    }
  }

  // Remove any whitespace, newlines, carriage returns, or lingering quotes
  const cleanBase64 = str.replace(/[\s\r\n"']/g, "");
  return { base64: cleanBase64, mime };
}

function parseJsonSafely(text: string): any {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const jsonSub = cleaned.substring(firstBrace, lastBrace + 1);
      return JSON.parse(jsonSub);
    }
    throw new Error("Could not parse AI response as valid JSON");
  }
}

function isCoralSpecimen(item: { name?: string; species?: string; category?: string } | null | undefined): boolean {
  if (!item) return false;
  const cat = (item.category || "").toLowerCase();
  const name = (item.name || "").toLowerCase();
  const species = (item.species || "").toLowerCase();

  if (
    cat.includes("coral") ||
    cat.includes("lps") ||
    cat.includes("sps") ||
    cat.includes("soft") ||
    cat.includes("gorgonian") ||
    cat.includes("zoanthid") ||
    cat.includes("mushroom")
  ) {
    return true;
  }

  const coralKeywords = [
    "coral", "toadstool", "leather", "zoanthid", "zoa", "paly", "palythoa",
    "acropora", "montipora", "monti", "euphyllia", "fimbriaphyllia", "torch",
    "hammer", "frogspawn", "octospawn", "ricordea", "discosoma", "rhodactis",
    "goniopora", "alveopora", "acan", "micromussa", "duncan", "duncanopsammia",
    "blastomussa", "chalice", "echinophyllia", "seriatopora", "stylophora",
    "pocillopora", "caulastraea", "candy cane", "brain coral", "trachyphyllia",
    "favia", "favites", "cyphastrea", "leptoseris", "sarcophyton",
    "sinularia", "capnella", "kenya tree", "xenia", "clavularia", "gsp", "green star polyp"
  ];

  return coralKeywords.some((kw) => name.includes(kw) || species.includes(kw));
}

function isFishOrInvertSpecimen(item: { name?: string; species?: string; category?: string } | null | undefined): boolean {
  if (!item) return false;
  const cat = (item.category || "").toLowerCase();
  const name = (item.name || "").toLowerCase();
  const species = (item.species || "").toLowerCase();

  if (cat === "fish" || cat === "invertebrate" || cat === "invertebrates" || cat === "echinoderm" || cat === "crustacean" || cat === "mollusk") {
    return true;
  }

  const faunaKeywords = [
    "fish", "urchin", "shrimp", "snail", "crab", "goby", "blenny", "wrasse",
    "tang", "assessor", "basslet", "clownfish", "cardinalfish", "angelfish",
    "damselfish", "chromis", "anthias", "hawkfish", "pseudochromis", "dottyback",
    "dragonet", "mandarin", "rabbitfish", "foxface", "puffer", "filefish",
    "triggerfish", "starfish", "clam", "hermit", "slug", "nudibranch",
    "cucumber", "conch", "cowrie", "lobster", "anemone",
    // Freshwater fauna keywords
    "tetra", "rasbora", "corydoras", "cory", "otocinclus", "oto", "pleco",
    "betta", "gourami", "guppy", "endler", "discus", "cichlid", "danio",
    "loach", "barb", "caridina", "neocaridina"
  ];

  return faunaKeywords.some((kw) => name.includes(kw) || species.includes(kw));
}

function isMarineOrganism(item: { name?: string; species?: string; category?: string } | null | undefined): boolean {
  if (!item) return false;
  const name = (item.name || "").toLowerCase();
  const species = (item.species || "").toLowerCase();
  const notes = ((item as any).notes || "").toLowerCase();

  if (isCoralSpecimen(item)) return true;

  const marineKeywords = [
    "clownfish", "ocellaris", "percula", "tang", "acanthurus", "zebrasoma", "paracanthurus",
    "assessor", "royal gramma", "gramma", "basslet", "pseudochromis", "dottyback",
    "wrasse", "halichoeres", "macropharyngodon", "pseudocheilinus",
    "damselfish", "chromis", "anthias", "pseudanthias",
    "hawkfish", "cirrhitichthys", "oxycirrhites",
    "blenny", "ecsenius", "salarias",
    "dragonet", "mandarin", "synchiropus",
    "rabbitfish", "siganus", "foxface",
    "puffer", "canthigaster", "filefish", "acanthaluteres", "acreichthys",
    "triggerfish", "balistoides",
    "cleaner shrimp", "lysmata", "peppermint shrimp", "fire shrimp", "debelius", "pistol shrimp", "alpheus",
    "tuxedo urchin", "mespilia", "pincushion urchin", "lytechinus", "diadema", "pencil urchin",
    "hermit crab", "clibanarius", "calcinus", "emerald crab", "mithraculus",
    "trochus", "turbo snail", "nassarius", "cerith", "fighting conch"
  ];

  return marineKeywords.some((kw) => name.includes(kw) || species.includes(kw) || notes.includes(kw));
}

function isFreshwaterOrganism(item: { name?: string; species?: string; category?: string } | null | undefined): boolean {
  if (!item) return false;
  const name = (item.name || "").toLowerCase();
  const species = (item.species || "").toLowerCase();
  const notes = ((item as any).notes || "").toLowerCase();

  const fwKeywords = [
    "tetra", "paracheirodon", "hyphessobrycon", "hemigrammus",
    "rasbora", "boraras", "trigonostigma",
    "corydoras", "cory", "otocinclus", "oto", "pleco", "ancistrus",
    "betta", "gourami", "trichogaster", "colisa", "badis", "dario",
    "guppy", "poecilia", "endler", "molly", "platy", "xiphophorus",
    "cichlid", "discus", "symphysodon", "angelfish", "pterophyllum", "apistogramma", "ramirezi",
    "danio", "margaritatus", "barb", "puntius", "loach", "kuhli", "pangio",
    "caridina", "neocaridina", "cherry shrimp", "crystal red", "taiwan bee", "blue dream", "amano shrimp",
    "mystery snail", "pomacea", "nerite", "neritina", "vittina", "ramshorn", "assassin snail"
  ];

  return fwKeywords.some((kw) => name.includes(kw) || species.includes(kw) || notes.includes(kw));
}

async function callGemini(apiKey: string, prompt: string, base64Data: string, resolvedMimeType: string) {
  const ai = new GoogleGenAI({ apiKey });
  const parts: any[] = [{ text: prompt }];
  if (base64Data && base64Data.trim().length > 0) {
    parts.push({
      inlineData: {
        mimeType: resolvedMimeType || "image/jpeg",
        data: base64Data,
      },
    });
  }

  // Official Gemini models: gemini-3.8-flash is the primary current model
  const candidateModels = ["gemini-3.8-flash", "gemini-3.7-flash", "gemini-2.5-flash"];
  const timeoutMs = (base64Data && base64Data.trim().length > 0) ? 24000 : 10000;
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const generatePromise = ai.models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts,
          },
        ],
        config: {
          responseMimeType: "application/json",
        },
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout after ${timeoutMs / 1000}s on ${model}`)), timeoutMs)
      );

      const response: any = await Promise.race([generatePromise, timeoutPromise]);
      const textOutput = response.text || "{}";
      return parseJsonSafely(textOutput);
    } catch (err: any) {
      lastError = err;
      console.warn(`Gemini model ${model} failed, trying next fallback:`, err.message?.slice(0, 120));
    }
  }

  throw lastError || new Error("All Gemini models were unavailable");
}

async function callOpenAI(apiKey: string, prompt: string, base64Data: string, mimeType: string) {
  let content: any = prompt;
  if (base64Data && base64Data.trim().length > 0) {
    const imageMime = mimeType.startsWith("video/") ? "image/jpeg" : mimeType;
    content = [
      { type: "text", text: prompt },
      {
        type: "image_url",
        image_url: {
          url: `data:${imageMime};base64,${base64Data}`,
        },
      },
    ];
  }
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    }),
    signal: AbortSignal.timeout(9000),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenAI API returned status ${res.status}`);
  }
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || "{}";
  return parseJsonSafely(text);
}

async function callAnthropic(apiKey: string, prompt: string, base64Data: string, mimeType: string) {
  let content: any = prompt;
  if (base64Data && base64Data.trim().length > 0) {
    const imageMime = mimeType.startsWith("video/") ? "image/jpeg" : mimeType;
    content = [
      {
        type: "image",
        source: {
          type: "base64",
          media_type: imageMime,
          data: base64Data,
        },
      },
      { type: "text", text: prompt },
    ];
  }
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content,
        },
      ],
    }),
    signal: AbortSignal.timeout(9000),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Anthropic API returned status ${res.status}`);
  }
  const data = await res.json();
  const text = data.content?.[0]?.text || "{}";
  return parseJsonSafely(text);
}

async function callOpenRouter(apiKey: string, prompt: string, base64Data: string, mimeType: string) {
  let content: any = prompt;
  if (base64Data && base64Data.trim().length > 0) {
    const imageMime = mimeType.startsWith("video/") ? "image/jpeg" : mimeType;
    content = [
      { type: "text", text: prompt },
      {
        type: "image_url",
        image_url: {
          url: `data:${imageMime};base64,${base64Data}`,
        },
      },
    ];
  }
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "Aquarium Studio",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "user",
          content,
        },
      ],
      response_format: { type: "json_object" },
    }),
    signal: AbortSignal.timeout(9000),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenRouter API returned status ${res.status}`);
  }
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || "{}";
  return parseJsonSafely(text);
}

function createSmartFallbackSpecimen(queryName: string, type: string, isFreshwater: boolean) {
  const q = queryName.toLowerCase();
  const title = queryName.trim().replace(/\b\w/g, (c) => c.toUpperCase());

  if (type === "PLANT") {
    const isMoss = q.includes("moss") || q.includes("fissidens") || q.includes("riccardia");
    const isCarpet = q.includes("carpet") || q.includes("monte carlo") || q.includes("cuba") || q.includes("hairgrass") || q.includes("glossostigma");
    const isEpiphyte = q.includes("anubias") || q.includes("bucephalandra") || q.includes("buce") || q.includes("fern") || q.includes("microsorum");
    const isFloating = q.includes("float") || q.includes("salvinia") || q.includes("frogbit") || q.includes("phyllanthus") || q.includes("pistia");
    const isRosette = q.includes("sword") || q.includes("echinodorus") || q.includes("crypt") || q.includes("cryptocoryne");

    const category = isMoss ? "Moss" : isCarpet ? "Carpeting" : isEpiphyte ? "Epiphyte" : isFloating ? "Floating" : isRosette ? "Rosette" : "Stem";

    return {
      name: title,
      species: `${title} sp.`,
      category,
      growthType: isCarpet
        ? "Runners / Stolons (Horizontal carpeting spreading)"
        : isEpiphyte
        ? "Rhizome division (Slow epiphytic wood/rock attachment)"
        : isMoss
        ? "Branching thalli / Spores (Moss cushions)"
        : isFloating
        ? "Surface runners / Vegetative budding"
        : isRosette
        ? "Crown division / Offshoots (Rosette root feeders)"
        : "Stem Nodes / Cuttings (Vertical columnar propagation)",
      zone: isCarpet
        ? "Foreground carpeting zone"
        : isEpiphyte
        ? "Midground hardscape accent attached to driftwood or stone"
        : isFloating
        ? "Water surface foliage cover"
        : "Background tall stem canopy",
      lighting: isCarpet ? "PAR 60 - 100 (Medium to High Lighting)" : "PAR 30 - 70 (Low to Medium Lighting)",
      aggressiveness: "Moderate growth rate; responds well to liquid macro/micro fertilizers.",
      diet: "Substrate root tabs & column liquid fertilizer with balanced potassium and iron.",
      notes: `Healthy ${title} specimen. Prefers clean water, steady temperature (22-26°C), and regular nutrient balance.`
    };
  }

  if (type === "CORAL") {
    const isSps = q.includes("sps") || q.includes("acro") || q.includes("monti") || q.includes("pocillopora") || q.includes("stylophora") || q.includes("seriatopora") || q.includes("birdsnest") || q.includes("millepora") || q.includes("staghorn");
    const isSoft = q.includes("soft") || q.includes("zoa") || q.includes("paly") || q.includes("mushroom") || q.includes("leather") || q.includes("toadstool") || q.includes("sinularia") || q.includes("kenya") || q.includes("gsp") || q.includes("star polyp") || q.includes("xenia");

    const category = isSps ? "SPS" : isSoft ? "Soft Coral" : "LPS";

    return {
      name: title,
      species: `${title} sp.`,
      category,
      growthType: isSps
        ? "Calcium carbonate skeleton building (Branching / Plating)"
        : isSoft
        ? "Soft tissue spreading / Basal foot attachment"
        : "Calcium carbonate skeleton building (Branching)",
      zone: isSps
        ? "Upper reef crest with high random turbulent flow"
        : isSoft
        ? "Lower rockwork or substrate with gentle to moderate indirect flow"
        : "Mid-level reef with moderate indirect flow",
      lighting: isSps
        ? "PAR 250 - 400 (High Lighting Spectrum)"
        : isSoft
        ? "PAR 75 - 150 (Low to Moderate Lighting)"
        : "PAR 150 - 250 (Moderate Lighting)",
      aggressiveness: isSps
        ? "Passive / Peaceful: No sweeper tentacles; vulnerable to stinging corals."
        : isSoft
        ? "Semi-peaceful: Produces mild terpenes; maintain 2-3 inch clearance."
        : "Moderate: Extends nocturnal sweeper tentacles; maintain 3-4 inch clearance.",
      diet: "Photosynthetic zooxanthellae; benefits from broadcast coral aminos and micro-plankton weekly.",
      notes: `Reef aquarium ${title} specimen. Requires stable alkalinity (8.0-9.0 dKH), calcium (420-450 ppm), and magnesium (1300-1400 ppm).`
    };
  }

  // FISH_INVERT
  if (isFreshwater) {
    const isInvert = q.includes("shrimp") || q.includes("snail") || q.includes("crab") || q.includes("clam") || q.includes("crayfish");
    return {
      name: title,
      species: `${title} sp.`,
      category: isInvert ? "Invertebrates" : "Fish",
      diet: isInvert
        ? "Grazer / Detritivore: Sinking micro-wafers, biofilm, and blanched vegetables."
        : "Omnivore: High-grade micro-pellets, spirulina flakes, and frozen baby brine shrimp.",
      zone: isInvert ? "Substrate, plant foliage, and hardscape biofilm" : "Mid-water community swimmer",
      temperament: "Peaceful freshwater community inhabitant; safe with compatible tankmates.",
      interestingFact: "Thrives in established planted aquariums with natural biofilm and stable biological filtration.",
      notes: "Maintain stable water parameters: temp 23-26°C, pH 6.5-7.5, low ammonia and nitrite."
    };
  } else {
    const isInvert = q.includes("shrimp") || q.includes("snail") || q.includes("crab") || q.includes("urchin") || q.includes("star") || q.includes("clam") || q.includes("anemone");
    return {
      name: title,
      species: `${title} sp.`,
      category: isInvert ? "Invertebrates" : "Fish",
      diet: isInvert
        ? "Detritivore / Grazer: Nori algae, sinking pellets, and organic film."
        : "Carnivore / Omnivore: High-grade marine pellets, frozen mysis shrimp, and enriched brine.",
      zone: isInvert ? "Reef rockwork, crevices, and sandbed substrate" : "Mid-to-lower reef column and cave shelters",
      temperament: "Reef-safe and peaceful; adapts well to established marine systems.",
      interestingFact: "Essential biological component of a balanced marine reef ecosystem.",
      notes: "Requires standard reef parameters: Salinity 1.025-1.026 SG, Alk 8-9 dKH, Temp 24-26°C."
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      photoUrl,
      videoUrl,
      imageBase64,
      mimeType,
      type,
      apiKey,
      provider,
      hint,
      name,
      commonName,
      tankType,
      isFreshwater,
      environment
    } = body;
    const queryName = (commonName || name || hint || "").trim();
    const isFreshwaterEnv =
      tankType === "FRESHWATER" ||
      Boolean(isFreshwater) ||
      environment === "freshwater" ||
      environment === "FRESHWATER";

    let base64Data = "";
    let resolvedMimeType = mimeType || "image/jpeg";

    // 1. Check if direct imageBase64 was provided (e.g. from canvas extracted video frame or photo data URL)
    if (imageBase64 && typeof imageBase64 === "string" && imageBase64.trim().length > 0) {
      const cleaned = cleanBase64Payload(imageBase64, resolvedMimeType);
      base64Data = cleaned.base64;
      resolvedMimeType = cleaned.mime;
    }

    // 2. If no base64Data, check photoUrl
    if (!base64Data && photoUrl && typeof photoUrl === "string" && photoUrl.trim().length > 0) {
      if (photoUrl.startsWith("data:")) {
        const cleaned = cleanBase64Payload(photoUrl, resolvedMimeType);
        base64Data = cleaned.base64;
        resolvedMimeType = cleaned.mime;
      } else {
        try {
          const cleanPath = photoUrl.replace(/^\//, "");
          const filePath = path.join(process.cwd(), "public", cleanPath);
          const fileBuffer = await fs.readFile(filePath);
          base64Data = fileBuffer.toString("base64");
          const ext = path.extname(cleanPath).toLowerCase();
          if (ext === ".png") resolvedMimeType = "image/png";
          else if (ext === ".webp") resolvedMimeType = "image/webp";
          else resolvedMimeType = "image/jpeg";
        } catch (err) {
          console.warn("Could not read local photo file:", err);
        }
      }
    }

    // 3. If still no base64Data, check videoUrl
    if (!base64Data && videoUrl && typeof videoUrl === "string" && videoUrl.trim().length > 0) {
      if (videoUrl.startsWith("data:")) {
        const cleaned = cleanBase64Payload(videoUrl, "video/mp4");
        base64Data = cleaned.base64;
        resolvedMimeType = cleaned.mime;
      } else {
        try {
          const cleanPath = videoUrl.replace(/^\//, "");
          const filePath = path.join(process.cwd(), "public", cleanPath);
          const fileBuffer = await fs.readFile(filePath);
          base64Data = fileBuffer.toString("base64");
          const ext = path.extname(cleanPath).toLowerCase();
          if (ext === ".webm") resolvedMimeType = "video/webm";
          else if (ext === ".mov" || ext === ".quicktime") resolvedMimeType = "video/quicktime";
          else if (ext === ".m4v") resolvedMimeType = "video/x-m4v";
          else resolvedMimeType = "video/mp4";
        } catch (err) {
          console.warn("Could not read local video file:", err);
        }
      }
    }

    // Final sanitization of base64Data
    if (base64Data) {
      const cleaned = cleanBase64Payload(base64Data, resolvedMimeType);
      base64Data = cleaned.base64;
      resolvedMimeType = cleaned.mime;
    }

    // Determine Provider and Key
    const geminiKey =
      (apiKey && (provider === "gemini" || (!provider && apiKey.startsWith("AIzaSy"))) ? apiKey.trim() : "") ||
      process.env.GEMINI_API_KEY ||
      "";
    const openAiKey =
      (apiKey &&
      (provider === "openai" ||
        (!provider && apiKey.startsWith("sk-") && !apiKey.startsWith("sk-ant") && !apiKey.startsWith("sk-or")))
        ? apiKey.trim()
        : "") ||
      process.env.OPENAI_API_KEY ||
      "";
    const anthropicKey =
      (apiKey && (provider === "anthropic" || (!provider && apiKey.startsWith("sk-ant"))) ? apiKey.trim() : "") ||
      process.env.ANTHROPIC_API_KEY ||
      "";
    const openRouterKey =
      (apiKey && (provider === "openrouter" || (!provider && apiKey.startsWith("sk-or"))) ? apiKey.trim() : "") ||
      process.env.OPENROUTER_API_KEY ||
      "";

    let chosenProvider = provider || "gemini";
    let chosenKey = "";

    if (chosenProvider === "openai" && openAiKey) chosenKey = openAiKey;
    else if (chosenProvider === "anthropic" && anthropicKey) chosenKey = anthropicKey;
    else if (chosenProvider === "openrouter" && openRouterKey) chosenKey = openRouterKey;
    else if (chosenProvider === "gemini" && geminiKey) chosenKey = geminiKey;
    else {
      // Auto-detect based on available keys
      if (geminiKey) {
        chosenProvider = "gemini";
        chosenKey = geminiKey;
      } else if (openAiKey) {
        chosenProvider = "openai";
        chosenKey = openAiKey;
      } else if (anthropicKey) {
        chosenProvider = "anthropic";
        chosenKey = anthropicKey;
      } else if (openRouterKey) {
        chosenProvider = "openrouter";
        chosenKey = openRouterKey;
      }
    }

    // Name-Based Identification (Fast Text-Only LLM generation & Catalog Fallback)
    const isNameLookup = (!base64Data || (!photoUrl && !videoUrl && !imageBase64)) && Boolean(queryName);
    if (isNameLookup) {
      let namePrompt = "";
      if (type === "PLANT") {
        namePrompt = `You are an expert aquatic botanist and planted tank aquascaping specialist.
The user provides the common or trade name of an aquatic plant: "${queryName}".
Identify this exact plant and generate comprehensive biological, botanical, CO2, lighting, and aquascaping care data.
CRITICAL: Maintain the exact specimen name "${queryName}". Do NOT change or substitute this plant with a different variety.
Return ONLY a valid JSON object without markdown formatting or codeblocks with these exact keys:
{
  "name": "${queryName}",
  "species": "Scientific species name in Latin (e.g. 'Micranthemum tweediei', 'Rotala rotundifolia', 'Bucephalandra sp.', 'Vesicularia montagnei', 'Anubias barteri var. nana')",
  "category": "One of ['Carpeting', 'Stem', 'Epiphyte', 'Moss', 'Rosette', 'Floating']",
  "growthType": "Biological growth and propagation form (e.g. 'Runners / Stolons (Horizontal carpeting spreading)', 'Stem Nodes / Cuttings (Vertical columnar propagation)', 'Rhizome division (Slow epiphytic wood/rock attachment)', 'Branching thalli / Spores (Moss cushions)', 'Crown division / Offshoots (Rosette root feeders)')",
  "zone": "Aquascape placement zone (e.g. 'Foreground carpeting plant', 'Midground hardscape accent attached to driftwood', 'Background tall stem canopy')",
  "lighting": "Recommended lighting PAR level and spectrum (e.g. 'PAR 50 - 100 (Medium to High Lighting)')",
  "aggressiveness": "CO2 demand and growth rate (e.g. 'High CO2 demand (20-30 ppm); rapid growth rate requiring regular trimming.')",
  "diet": "Fertilization and substrate requirements (e.g. 'Heavy root feeder: Requires nutrient-rich aquasoil and iron-rich root tabs. Water column macro/micro dosing.')",
  "notes": "Care observations, water hardness (GH/KH) preference, trimming advice, and algae sensitivity"
}`;
      } else if (type === "CORAL") {
        namePrompt = `You are an expert marine biologist, reef taxonomist, and master reef aquarium keeper.
The user provides the common or trade name of a coral: "${queryName}".
Identify this exact coral and generate comprehensive biological and husbandry profile data.
CRITICAL: Maintain the exact specimen morph or trade name "${queryName}". Do NOT change or substitute this morph with a different variety.
Return ONLY a valid JSON object without markdown formatting or codeblocks with these exact keys:
{
  "name": "${queryName}",
  "species": "Scientific species name in Latin (e.g. 'Zoanthus gigantus', 'Euphyllia glabrescens', 'Micromussa lordhowensis', 'Acropora millepora', 'Discosoma sp.')",
  "category": "One of ['LPS', 'SPS', 'Soft Coral', 'Gorgonian', 'Other'] (CRITICAL: Classify all Zoanthids, Palythoas, Mushrooms, Ricordeas, and Leathers strictly as 'Soft Coral')",
  "growthType": "Biological growth type and skeletal architecture (e.g. 'Encrusting', 'Calcium carbonate skeleton building (Branching)', 'Calcium carbonate skeleton building (Plating / Foliose)', 'Runners / Stolons (Mat-forming connective tissue)', 'Root / Basal Foot / Soft Stalk', 'Fleshy polyp expanding')",
  "zone": "Recommended placement zone in tank and flow requirements (e.g. 'Lower-to-mid rockwork with moderate indirect oscillating flow')",
  "lighting": "Recommended lighting PAR level and spectrum (e.g. 'PAR 75 - 150 (Low to Moderate Lighting)')",
  "aggressiveness": "Detailed aggressiveness type (sting/chemical warfare/growing over other corals/peaceful) and clearance advice (e.g. 'Semi-aggressive: Extends sweeper tentacles; maintain 2-3 inches clearance.')",
  "diet": "Diet & feeding regimen (e.g. 'Photosynthetic zooxanthellae; accepts micro-mysis, coral amino acids, and rotifers 1-2x weekly')",
  "notes": "Care observations, sensitivity, and water parameter advice"
}`;
      } else {
        // type === "FISH_INVERT"
        if (isFreshwaterEnv) {
          namePrompt = `You are an expert freshwater ichthyologist, freshwater invertebrate biologist, and planted aquarium specialist.
CRITICAL MANDATE: This is strictly for a FRESHWATER AQUARIUM setting.
Identify ONLY FRESHWATER livestock (Freshwater Fish or Freshwater Invertebrates like Neocaridina/Caridina dwarf shrimp, nerite snails, mystery snails, mini crabs).
DO NOT IDENTIFY OR RETURN SALTWATER / MARINE ORGANISMS (such as clownfish, yellow assessor, tangs, marine wrasses, marine gobies, marine cleaner shrimp, corals, or marine urchins).
The user provides the common or trade name of a freshwater fish or invertebrate: "${queryName}".
Identify this exact freshwater specimen and generate comprehensive biological, ecological, and husbandry profile data strictly for a freshwater environment.
CRITICAL: Maintain the exact common name "${queryName}". Do NOT change or substitute this specimen with a different variety.
Return ONLY a valid JSON object without markdown formatting or codeblocks with these exact keys:
{
  "name": "${queryName}",
  "species": "Scientific species name in Latin (e.g. 'Paracheirodon innesi', 'Caridina logemanni', 'Neocaridina davidi', 'Otocinclus macrospilus', 'Boraras brigittae', 'Betta splendens', 'Corydoras pygmaeus', 'Pomacea diffusa')",
  "category": "One of ['Fish', 'Invertebrates'] (CRITICAL: Classify all non-fish such as dwarf shrimp, snails, crabs, clams strictly as 'Invertebrates')",
  "diet": "Freshwater diet and feeding regimen (e.g. 'Omnivore / Grazer: Biofilm, spirulina micro-pellets, blanched vegetables, and specialized shrimp mineral sticks.')",
  "zone": "Aquarium niche and zone in planted tank (e.g. 'Substrate and lower foliage grazer; constantly forages on biofilm across plants and driftwood.')",
  "temperament": "Care observations and temperament notes (e.g. 'Extremely peaceful community inhabitant; 100% plant and nano tankmate safe.')",
  "interestingFact": "Fascinating biological fact or distinctive interesting behaviors",
  "notes": "Freshwater care advice, water parameters (ideal GH, KH, TDS, pH 6.0-7.4, temp 22-26°C), acclimation, or tank requirements"
}`;
        } else {
          namePrompt = `You are an expert marine biologist, reef fish taxonomist, and saltwater aquarium specialist.
CRITICAL MANDATE: This is strictly for a SALTWATER / REEF AQUARIUM setting.
Identify ONLY SALTWATER / MARINE livestock (Marine Fish or Marine Invertebrates like clownfish, assessors, gobies, wrasses, tangs, cleaner shrimp, hermits, urchins, marine snails).
DO NOT IDENTIFY OR RETURN FRESHWATER ORGANISMS (such as neon tetras, bettas, goldfish, cichlids, or freshwater dwarf shrimp).
The user provides the common or trade name of a marine fish, marine shrimp, invertebrate, or clean-up crew specimen: "${queryName}".
Identify this exact marine specimen and generate comprehensive biological, ecological, and husbandry profile data strictly for a saltwater reef environment.
CRITICAL: Maintain the exact common name "${queryName}". Do NOT change or substitute this specimen with a different variety.
Return ONLY a valid JSON object without markdown formatting or codeblocks with these exact keys:
{
  "name": "${queryName}",
  "species": "Scientific species name in Latin (e.g. 'Assessor flavissimus', 'Amphiprion ocellaris', 'Lysmata amboinensis', 'Mespilia globulus', 'Cryptocentrus cinctus')",
  "category": "One of ['Fish', 'Invertebrates'] (CRITICAL: Classify all non-fish such as marine shrimps, urchins, crabs, snails, starfish, clams strictly as 'Invertebrates')",
  "diet": "Marine diet and feeding regimen (e.g. 'Carnivore: Enriched frozen mysis shrimp, marine pellets, and copepods 1-2x daily.')",
  "zone": "Marine reef niche and territorial behaviour (e.g. 'Mid-to-lower water column / reef cave shelter; perches upside-down under ledges.')",
  "temperament": "Care observations and temperament notes (e.g. 'Peaceful reef dweller; completely coral reef safe.')",
  "interestingFact": "Fascinating biological fact or distinctive interesting behaviors",
  "notes": "Marine care advice, saltwater parameters (Salinity 1.025-1.026 SG, Alk 8-9 dKH, pH 8.1-8.4), acclimation, or tank requirements"
}`;
        }
      }

      if (chosenKey) {
        try {
          let parsed: any = null;
          if (chosenProvider === "openai") {
            parsed = await callOpenAI(chosenKey, namePrompt, "", "");
          } else if (chosenProvider === "anthropic") {
            parsed = await callAnthropic(chosenKey, namePrompt, "", "");
          } else if (chosenProvider === "openrouter") {
            parsed = await callOpenRouter(chosenKey, namePrompt, "", "");
          } else {
            parsed = await callGemini(chosenKey, namePrompt, "", "");
          }

          if (parsed) {
            if (!parsed.name || parsed.name.toLowerCase().includes("standardized")) {
              parsed.name = queryName;
            }
            if (parsed.category === "Zoanthid" || parsed.category === "Mushroom") {
              parsed.category = "Soft Coral";
            }
            if (type === "FISH_INVERT") {
              if (parsed.category === "Fish") {
                parsed.category = "Fish";
              } else {
                parsed.category = "Invertebrates";
              }

              // Guardrails: Check for cross-environment mismatches
              if (isFreshwaterEnv && isMarineOrganism(parsed)) {
                return NextResponse.json(
                  {
                    success: false,
                    error: `'${parsed.name}' is a saltwater marine species. This tank is configured as a Freshwater Aquarium. Please switch to a Saltwater/Reef tank to add marine livestock.`,
                  },
                  { status: 400 }
                );
              }

              if (!isFreshwaterEnv && isFreshwaterOrganism(parsed)) {
                return NextResponse.json(
                  {
                    success: false,
                    error: `'${parsed.name}' is a freshwater species. This tank is configured as a Saltwater Reef Aquarium. Please switch to a Freshwater tank to add freshwater livestock.`,
                  },
                  { status: 400 }
                );
              }
            }

            return NextResponse.json({
              success: true,
              identified: parsed,
              source:
                chosenProvider === "gemini"
                  ? "gemini-3.8-flash"
                  : chosenProvider === "openai"
                  ? "openai-gpt-4o"
                  : chosenProvider === "anthropic"
                  ? "claude-3-5-sonnet"
                  : "openrouter",
              provider: chosenProvider,
              hasApiKey: true,
            });
          }
        } catch (err: any) {
          console.warn("AI name lookup failed, attempting catalog fallback:", err);
        }
      }

      // Check catalog fallback for name query
      const matched = findMatchingSpecimen(queryName, type === "CORAL" ? "CORAL" : "FISH_INVERT", isFreshwaterEnv);
      if (matched) {
        const normalized = { ...matched };
        if (normalized.category === "Zoanthid" || normalized.category === "Mushroom") {
          normalized.category = "Soft Coral";
        }
        if (type === "FISH_INVERT") {
          normalized.category = normalized.category === "Fish" ? "Fish" : "Invertebrates";
        }
        return NextResponse.json({
          success: true,
          identified: normalized,
          source: isFreshwaterEnv ? "freshwater-catalog" : "marine-catalog",
          hasApiKey: Boolean(chosenKey),
        });
      }

      // Universal smart fallback generator: guarantees auto-fill ALWAYS succeeds instantly
      const smartFallback = createSmartFallbackSpecimen(queryName, type, isFreshwaterEnv);
      return NextResponse.json({
        success: true,
        identified: smartFallback,
        source: "species-engine",
        hasApiKey: Boolean(chosenKey),
      });
    }

    const isVideo = resolvedMimeType.startsWith("video/");

    // Check video compatibility with non-Gemini providers
    if (isVideo && chosenProvider !== "gemini") {
      return NextResponse.json(
        {
          success: false,
          error: `${chosenProvider.toUpperCase()} Vision models currently only support images (JPEG, PNG, WEBP). Please switch to Google Gemini for direct video analysis, or upload a photo of the specimen.`,
          needsApiKey: true,
        },
        { status: 400 }
      );
    }

    let prompt = "";
    if (type === "PLANT") {
      prompt = `You are an expert aquatic botanist, planted tank aquascaper, and master freshwater specialist.
CRITICAL MANDATE FOR AQUATIC FLORA & PLANT VAULT:
You are inspecting media strictly for the AQUATIC FLORA & PLANT VAULT.
Identify ONLY AQUATIC PLANTS, MOSSES, STEM PLANTS, CARPETING PLANTS, EPIPHYTES, OR FLOATING PLANTS.
DO NOT IDENTIFY FISH, SHRIMP, HARDSCAPE, OR ROCKS.
Analyze this aquatic plant ${isVideo ? "video recording" : "photograph"} in detail. Inspect leaf blade shape, venation, leaf nodes, stem structure, runners, growth form, coloration, and submerged foliage.${queryName ? ` Note: User tentative name is '${queryName}'.` : ""}
Identify the exact plant specimen and return ONLY a valid JSON object without markdown formatting or codeblocks with these exact keys:
{
  "name": "Specific Trade / Common Name (e.g. 'Micranthemum Monte Carlo', 'Rotala rotundifolia H'ra', 'Bucephalandra Godzilla', 'Christmas Moss', 'Anubias Nana Petite', 'Staurogyne repens', 'Ludwigia Super Red')",
  "species": "Scientific species name in Latin (e.g. 'Micranthemum tweediei', 'Rotala rotundifolia', 'Bucephalandra sp.', 'Vesicularia montagnei', 'Anubias barteri var. nana')",
  "category": "One of ['Carpeting', 'Stem', 'Epiphyte', 'Moss', 'Rosette', 'Floating']",
  "growthType": "Biological growth and propagation form (e.g. 'Runners / Stolons (Horizontal carpeting spreading)', 'Stem Nodes / Cuttings (Vertical columnar propagation)', 'Rhizome division (Slow epiphytic wood/rock attachment)', 'Branching thalli / Spores (Moss cushions)', 'Crown division / Offshoots')",
  "zone": "Aquascape placement zone (e.g. 'Foreground carpeting plant', 'Midground hardscape accent attached to driftwood', 'Background tall stem canopy')",
  "lighting": "Recommended lighting PAR level and spectrum (e.g. 'PAR 50 - 100 (Medium to High Lighting)')",
  "aggressiveness": "CO2 demand and growth rate (e.g. 'High CO2 demand (20-30 ppm); rapid growth rate requiring regular trimming.')",
  "diet": "Fertilization and substrate requirements (e.g. 'Heavy root feeder: Requires nutrient-rich aquasoil and iron-rich root tabs. Water column macro/micro dosing.')",
  "notes": "Care observations, water hardness (GH/KH) preference, trimming advice, and algae sensitivity"
}`;
    } else if (type === "CORAL") {
      prompt = `You are an expert marine biologist, reef taxonomist, and master reef aquarium keeper.
CRITICAL MANDATE FOR CORAL VAULT:
You are inspecting media strictly for the CORAL VAULT.
Identify ONLY CORAL SPECIMENS (SPS, LPS, Soft Coral, Zoanthids, Mushrooms, Ricordeas, Gorgonians, Leather Corals).
DO NOT IDENTIFY FISH OR MOTILE INVERTEBRATES (such as swimming fish, gobies, wrasses, urchins, shrimps, crabs, or snails).
Even if fish or other motile animals appear in the frame, YOU MUST COMPLETELY IGNORE THEM and focus solely on the primary coral colony or polyp morphology!
Analyze this coral ${isVideo ? "video recording" : "photograph"} in detail. Inspect polyp morphology, tentacle shape, oral disc, corallite structure, motion, and coloration.${queryName ? ` Note: User tentative name is '${queryName}'.` : ""}
Identify the exact specimen and return ONLY a valid JSON object without markdown formatting or codeblocks with these exact keys:
{
  "name": "Specific Trade / Common Name (e.g. 'Toadstool Leather Coral', 'Green Button Polyp / Palythoa', 'Rainbow Acan Lord', 'Rasta Zoanthid', 'Dragon Soul Torch Coral', 'Duncan Coral', 'Ricordea Mushroom')",
  "species": "Scientific species name in Latin (e.g. 'Sarcophyton glaucum', 'Palythoa mutuki', 'Micromussa lordhowensis', 'Zoanthus gigantus', 'Euphyllia glabrescens', 'Ricordea florida')",
  "category": "One of ['LPS', 'SPS', 'Soft Coral', 'Gorgonian', 'Other'] (CRITICAL: Classify all Zoanthids, Palythoas, Mushrooms, Ricordeas, and Leathers strictly as 'Soft Coral')",
  "growthType": "Biological growth type and skeletal architecture (e.g. 'Encrusting', 'Calcium carbonate skeleton building (Branching)', 'Calcium carbonate skeleton building (Plating / Foliose)', 'Calcium carbonate skeleton building (Massive / Brain)', 'Runners / Stolons (Mat-forming)', 'Root / Basal Foot / Soft Stalk', 'Fleshy polyp expanding')",
  "zone": "Recommended placement zone in tank and flow requirements (e.g. 'Lower-to-mid rockwork with moderate indirect oscillating flow')",
  "lighting": "Recommended lighting PAR level and spectrum (e.g. 'PAR 75 - 150 (Low to Moderate Lighting)')",
  "aggressiveness": "Detailed aggressiveness type (sting/chemical warfare/growing over other corals/peaceful) and clearance advice (e.g. 'Semi-aggressive: Extends digestive mesenterial filaments at night; maintain 2-3 inches clearance.')",
  "diet": "Diet & feeding regimen (e.g. 'Photosynthetic zooxanthellae; accepts micro-mysis, coral amino acids, and rotifers')",
  "notes": "Care observations, sensitivity, and water parameter advice"
}`;
    } else {
      // type === "FISH_INVERT"
      if (isFreshwaterEnv) {
        prompt = `You are an expert freshwater ichthyologist, freshwater invertebrate biologist, and planted aquarium specialist.
CRITICAL MANDATE FOR FRESHWATER FISH & INVERTEBRATES VAULT:
You are inspecting media strictly for a FRESHWATER AQUARIUM setting.
Identify ONLY FRESHWATER motile animal fauna: FRESHWATER FISH (such as tetras, rasboras, barbs, danios, corydoras, otos, plecos, bettas, killifish, gouramis, discus, dwarf cichlids) or FRESHWATER INVERTEBRATES (such as Neocaridina/Caridina dwarf shrimp, amano shrimp, ghost shrimp, nerite snails, mystery snails, ramshorn snails, mini crabs).
DO NOT IDENTIFY SALTWATER / MARINE ORGANISMS (such as clownfish, yellow assessor, tangs, marine wrasses, marine cleaner shrimp, corals, or marine urchins).
DO NOT IDENTIFY AQUATIC PLANTS (such as stem plants, carpeting plants, or mosses) OR HARDSCAPE/ROCKS. Focus strictly on the motile freshwater animal specimen!
Aquarium scenes often feature aquatic plants, driftwood, or aquascaping rocks.
YOU MUST COMPLETELY IGNORE ALL BACKGROUND AQUATIC PLANTS, HARDSCAPE, AND ROCKS!
Actively search the water column, plant foliage, driftwood, and substrate to find the living FRESHWATER FISH or FRESHWATER INVERTEBRATE specimen (for example: a schooling tetra, rasbora, dwarf shrimp, corydoras, or nerite snail).${queryName ? ` Note: User tentative name is '${queryName}'.` : ""}
Inspect finnage, swimming patterns, locomotion, coloration, and markings.
Identify the freshwater specimen and return ONLY a valid JSON object without markdown formatting or codeblocks with these exact keys:
{
  "name": "Freshwater Trade / Common Name (e.g. 'Neon Tetra', 'Cardinal Tetra', 'Chili Rasbora', 'Harlequin Rasbora', 'Crystal Red Shrimp', 'Red Cherry Shrimp', 'Amano Shrimp', 'Otocinclus Catfish', 'Pygmy Corydoras', 'Zebra Nerite Snail', 'German Blue Ram')",
  "species": "Scientific species name in Latin (e.g. 'Paracheirodon innesi', 'Boraras brigittae', 'Caridina logemanni', 'Neocaridina davidi', 'Otocinclus macrospilus', 'Corydoras pygmaeus', 'Vittina coromandeliana')",
  "category": "One of ['Fish', 'Invertebrates'] (CRITICAL: Classify all non-fish such as dwarf shrimps, snails, crabs, clams strictly as 'Invertebrates')",
  "diet": "Freshwater diet and feeding regimen (e.g. 'Biofilm, sinking micro-pellets, spirulina, and specialized shrimp mineral sticks.')",
  "zone": "Freshwater aquarium niche and territorial behaviour",
  "temperament": "Care observations and temperament notes (e.g. 'Peaceful nano schooling fish; 100% plant and shrimp safe.')",
  "interestingFact": "Fascinating biological fact or distinctive interesting behaviors",
  "notes": "Freshwater care advice, water parameters (GH, KH, TDS, pH), acclimation, or tank requirements"
}`;
      } else {
        prompt = `You are an expert marine biologist, reef fish taxonomist, and master reef aquarium keeper.
CRITICAL MANDATE FOR SALTWATER / REEF FISH & INVERTEBRATES VAULT:
You are inspecting media strictly for a SALTWATER / REEF AQUARIUM setting.
Identify ONLY SALTWATER / MARINE motile animal fauna: MARINE FISH (such as clownfish, yellow assessor, tangs, gobies, blennies, wrasses, basslets, angelfish, cardinalfish) or MARINE INVERTEBRATES (such as cleaner shrimp, peppermint shrimp, fire shrimp, hermit crabs, emerald crabs, sea urchins, turbo/trochus snails, starfish, clams).
DO NOT IDENTIFY FRESHWATER ORGANISMS (such as tetras, bettas, goldfish, cichlids, or freshwater dwarf shrimp).
DO NOT IDENTIFY CORALS (such as Toadstool Leather, Sarcophyton, Euphyllia, Zoanthids, Mushrooms, Acropora, etc.) OR LIVE ROCK.
Aquarium scenes often feature background corals, live rock, or reef decor.
YOU MUST COMPLETELY IGNORE ALL BACKGROUND CORALS AND LIVE ROCKS!
Actively search the water column, rock crevices, caves, and substrate to find the living MARINE FISH or INVERTEBRATE specimen (for example: a swimming fish, Yellow Assessor, Goby, Clownfish, Wrasse, Blenny, Urchin, or Cleaner Shrimp), even if it is near background coral decor!${queryName ? ` Note: User tentative name is '${queryName}'.` : ""}
Inspect finnage, swimming patterns, locomotion, spine structure, coloration, tube feet, and markings.
Identify the marine specimen and return ONLY a valid JSON object without markdown formatting or codeblocks with these exact keys:
{
  "name": "Marine Trade / Common Name (e.g. 'Yellow Assessor', 'Ocellaris Clownfish', 'Yellow Watchman Goby', 'Royal Gramma', 'Tuxedo Urchin', 'Skunk Cleaner Shrimp', 'Flame Hawkfish')",
  "species": "Scientific species name in Latin (e.g. 'Assessor flavissimus', 'Amphiprion ocellaris', 'Cryptocentrus cinctus', 'Gramma loreto', 'Mespilia globulus', 'Lysmata amboinensis')",
  "category": "One of ['Fish', 'Invertebrates'] (CRITICAL: Classify all non-fish such as marine shrimps, urchins, crabs, snails, starfish, clams strictly as 'Invertebrates')",
  "diet": "Marine diet and feeding regimen (e.g. 'Carnivore: Nutrient-rich enriched frozen mysis, brine shrimp, and marine pellets.')",
  "zone": "Marine aquarium niche and territorial behaviour",
  "temperament": "Care observations and temperament notes",
  "interestingFact": "Fascinating biological fact or distinctive interesting behaviors",
  "notes": "Marine care advice, saltwater parameters (Salinity 1.025 SG, Alk 8-9 dKH), acclimation, or tank requirements"
}`;
      }
    }

    // Execute through chosen provider
    if (chosenKey && base64Data) {
      try {
        let parsed: any = null;

        if (chosenProvider === "openai") {
          parsed = await callOpenAI(chosenKey, prompt, base64Data, resolvedMimeType);
        } else if (chosenProvider === "anthropic") {
          parsed = await callAnthropic(chosenKey, prompt, base64Data, resolvedMimeType);
        } else if (chosenProvider === "openrouter") {
          parsed = await callOpenRouter(chosenKey, prompt, base64Data, resolvedMimeType);
        } else {
          // Default to Gemini
          parsed = await callGemini(chosenKey, prompt, base64Data, resolvedMimeType);
        }

        // Vault & Environment Separation Guardrails:
        if (type === "FISH_INVERT") {
          if (isFreshwaterEnv) {
            // In freshwater vault, if AI mistakenly identified coral or marine organism:
            if (isCoralSpecimen(parsed) || isMarineOrganism(parsed)) {
              console.warn(`Freshwater Vault AI mistakenly identified marine organism (${parsed.name}). Retrying with focused freshwater fauna instruction...`);
              const retryPrompt = `CRITICAL CORRECTION: You previously identified a marine/saltwater organism (${parsed.name}), but this is strictly a FRESHWATER AQUARIUM setting.
COMPLETELY IGNORE all marine organisms and corals.
Search the water column, plant foliage, and substrate to find the living FRESHWATER FISH or FRESHWATER INVERTEBRATE specimen (such as tetras, rasboras, corydoras, bettas, otos, dwarf shrimp, nerite snails).
Identify that freshwater specimen and return ONLY the JSON with keys: name, species, category ('Fish' or 'Invertebrates'), diet, zone, temperament, interestingFact, notes.`;

              try {
                let recheck: any = null;
                if (chosenProvider === "openai") {
                  recheck = await callOpenAI(chosenKey, retryPrompt, base64Data, resolvedMimeType);
                } else if (chosenProvider === "anthropic") {
                  recheck = await callAnthropic(chosenKey, retryPrompt, base64Data, resolvedMimeType);
                } else if (chosenProvider === "openrouter") {
                  recheck = await callOpenRouter(chosenKey, retryPrompt, base64Data, resolvedMimeType);
                } else {
                  recheck = await callGemini(chosenKey, retryPrompt, base64Data, resolvedMimeType);
                }

                if (recheck && !isCoralSpecimen(recheck) && !isMarineOrganism(recheck)) {
                  parsed = recheck;
                } else {
                  return NextResponse.json(
                    {
                      success: false,
                      error: `A saltwater marine species was detected (${parsed.name}). The Freshwater Vault is strictly for freshwater fish and invertebrates. Please switch to a Saltwater / Reef tank to add marine livestock, or enter the specimen name manually.`,
                    },
                    { status: 400 }
                  );
                }
              } catch {
                return NextResponse.json(
                  {
                    success: false,
                    error: `A saltwater marine species was detected (${parsed.name}). The Freshwater Vault is strictly for freshwater fish and invertebrates.`,
                  },
                  { status: 400 }
                );
              }
            }
          } else {
            // In saltwater reef vault:
            if (isCoralSpecimen(parsed)) {
              console.warn(`Fish Vault AI mistakenly identified background coral (${parsed.name}). Retrying with focused fauna instruction...`);
              const retryPrompt = `CRITICAL CORRECTION: You previously identified a coral (${parsed.name}), but this is strictly the FISH & INVERTEBRATES VAULT in a SALTWATER REEF.
COMPLETELY IGNORE all background corals, toadstool leathers, polyps, and live rocks in this video/photo.
Search the water column, swimming animals, rock crevices, or substrate to find the living MARINE FISH or INVERTEBRATE specimen (such as a swimming fish, Yellow Assessor, Goby, Clownfish, Wrasse, Basslet, Urchin, Shrimp, Crab, or Snail).
Identify that marine specimen and return ONLY the JSON with keys: name, species, category ('Fish' or 'Invertebrates'), diet, zone, temperament, interestingFact, notes.`;

              try {
                let recheck: any = null;
                if (chosenProvider === "openai") {
                  recheck = await callOpenAI(chosenKey, retryPrompt, base64Data, resolvedMimeType);
                } else if (chosenProvider === "anthropic") {
                  recheck = await callAnthropic(chosenKey, retryPrompt, base64Data, resolvedMimeType);
                } else if (chosenProvider === "openrouter") {
                  recheck = await callOpenRouter(chosenKey, retryPrompt, base64Data, resolvedMimeType);
                } else {
                  recheck = await callGemini(chosenKey, retryPrompt, base64Data, resolvedMimeType);
                }

                if (recheck && !isCoralSpecimen(recheck)) {
                  parsed = recheck;
                } else {
                  return NextResponse.json(
                    {
                      success: false,
                      error: `Only corals were detected in this media (${parsed.name}). The Fish Vault is strictly for fish and invertebrates. Please upload this specimen to the Coral Vault tab instead, or enter the fish name to auto-fill by name.`,
                    },
                    { status: 400 }
                  );
                }
              } catch {
                return NextResponse.json(
                  {
                    success: false,
                    error: `Only corals were detected in this media (${parsed.name}). The Fish Vault is strictly for fish and invertebrates. Please upload this specimen to the Coral Vault tab instead.`,
                  },
                  { status: 400 }
                );
              }
            } else if (isFreshwaterOrganism(parsed)) {
              console.warn(`Saltwater Vault AI mistakenly identified freshwater organism (${parsed.name}). Retrying with focused marine fauna instruction...`);
              const retryPrompt = `CRITICAL CORRECTION: You previously identified a freshwater organism (${parsed.name}), but this is strictly a SALTWATER / REEF AQUARIUM setting.
COMPLETELY IGNORE all freshwater species.
Search the water column, rock crevices, caves, or substrate to find the living MARINE FISH or INVERTEBRATE specimen (such as clownfish, tangs, wrasses, gobies, blennies, cleaner shrimp, hermits, urchins).
Identify that marine specimen and return ONLY the JSON with keys: name, species, category ('Fish' or 'Invertebrates'), diet, zone, temperament, interestingFact, notes.`;

              try {
                let recheck: any = null;
                if (chosenProvider === "openai") {
                  recheck = await callOpenAI(chosenKey, retryPrompt, base64Data, resolvedMimeType);
                } else if (chosenProvider === "anthropic") {
                  recheck = await callAnthropic(chosenKey, retryPrompt, base64Data, resolvedMimeType);
                } else if (chosenProvider === "openrouter") {
                  recheck = await callOpenRouter(chosenKey, retryPrompt, base64Data, resolvedMimeType);
                } else {
                  recheck = await callGemini(chosenKey, retryPrompt, base64Data, resolvedMimeType);
                }

                if (recheck && !isFreshwaterOrganism(recheck)) {
                  parsed = recheck;
                } else {
                  return NextResponse.json(
                    {
                      success: false,
                      error: `A freshwater species was detected (${parsed.name}). This tank is configured as a Saltwater Reef Aquarium. Please switch to a Freshwater tank to add freshwater livestock.`,
                    },
                    { status: 400 }
                  );
                }
              } catch {
                return NextResponse.json(
                  {
                    success: false,
                    error: `A freshwater species was detected (${parsed.name}). This tank is configured as a Saltwater Reef Aquarium.`,
                  },
                  { status: 400 }
                );
              }
            }
          }
        }

        // 2. In Coral Vault, if AI mistakenly identified a fish/invert:
        if (type === "CORAL" && isFishOrInvertSpecimen(parsed) && !isCoralSpecimen(parsed)) {
          console.warn(`Coral Vault AI mistakenly identified fish/invert (${parsed.name}). Retrying with focused coral instruction...`);
          const retryPrompt = `CRITICAL CORRECTION: You previously identified a fish/invertebrate (${parsed.name}), but this is strictly the CORAL VAULT.
COMPLETELY IGNORE all swimming fish, crabs, shrimps, and snails in this video/photo.
Focus strictly on the primary CORAL specimen (polyps, corallite skeleton, tentacles, fleshy disc, or leather colony).
Identify that coral specimen and return ONLY the JSON with keys: name, species, category ('LPS', 'SPS', 'Soft Coral', 'Gorgonian', 'Other'), growthType, zone, lighting, aggressiveness, diet, notes.`;

          try {
            let recheck: any = null;
            if (chosenProvider === "openai") {
              recheck = await callOpenAI(chosenKey, retryPrompt, base64Data, resolvedMimeType);
            } else if (chosenProvider === "anthropic") {
              recheck = await callAnthropic(chosenKey, retryPrompt, base64Data, resolvedMimeType);
            } else if (chosenProvider === "openrouter") {
              recheck = await callOpenRouter(chosenKey, retryPrompt, base64Data, resolvedMimeType);
            } else {
              recheck = await callGemini(chosenKey, retryPrompt, base64Data, resolvedMimeType);
            }

            if (recheck && isCoralSpecimen(recheck)) {
              parsed = recheck;
            } else {
              return NextResponse.json(
                {
                  success: false,
                  error: `Only fish or motile invertebrates were detected in this media (${parsed.name}). The Coral Vault is strictly for corals. Please upload this specimen to the Fish Vault tab instead.`,
                },
                { status: 400 }
              );
            }
          } catch {
            return NextResponse.json(
              {
                success: false,
                error: `Only fish or motile invertebrates were detected in this media (${parsed.name}). The Coral Vault is strictly for corals. Please upload this specimen to the Fish Vault tab instead.`,
              },
              { status: 400 }
            );
          }
        }

        // Strict category normalization per vault type
        if (type === "CORAL") {
          if (parsed && (parsed.category === "Zoanthid" || parsed.category === "Mushroom")) {
            parsed.category = "Soft Coral";
          }
          if (parsed && !["LPS", "SPS", "Soft Coral", "Gorgonian"].includes(parsed.category)) {
            parsed.category = "Soft Coral";
          }
        } else if (type === "FISH_INVERT") {
          if (parsed) {
            parsed.category = parsed.category === "Fish" ? "Fish" : "Invertebrates";
          }
        }

        return NextResponse.json({
          success: true,
          identified: parsed,
          source:
            chosenProvider === "gemini"
              ? "gemini-3.8-flash"
              : chosenProvider === "openai"
              ? "openai-gpt-4o"
              : chosenProvider === "anthropic"
              ? "claude-3-5-sonnet"
              : "openrouter",
          provider: chosenProvider,
          hasApiKey: true,
        });
      } catch (aiErr: any) {
        console.error(`${chosenProvider} Vision AI call error:`, aiErr);
        let errorMsg = aiErr.message || "Failed to process media with Vision AI. Please check your API key.";
        try {
          const parsedErr = JSON.parse(errorMsg);
          if (parsedErr.error?.message) {
            errorMsg = parsedErr.error.message;
          }
        } catch {}

        // Friendly translation for free-tier rate limits so user knows they NEVER have to pay
        if (errorMsg.includes("quota") || errorMsg.includes("billing") || errorMsg.includes("RESOURCE_EXHAUSTED")) {
          errorMsg = "Free tier rate limit reached. Google Gemini is 100% FREE and requires no payment. Please wait a few seconds and try again, or create another free key at aistudio.google.com without adding any billing.";
        }

        // Automatic fallback: if user provided a text hint or specimen name, fall back to local database or smart fallback
        const searchHint = hint || queryName || "";
        if (searchHint.trim()) {
          const matched = findMatchingSpecimen(searchHint, type === "CORAL" ? "CORAL" : "FISH_INVERT", isFreshwaterEnv);
          if (matched) {
            const normalized = { ...matched };
            if (normalized.category === "Zoanthid" || normalized.category === "Mushroom") {
              normalized.category = "Soft Coral";
            }
            if (type === "FISH_INVERT") {
              normalized.category = normalized.category === "Fish" ? "Fish" : "Invertebrates";
            }
            return NextResponse.json({
              success: true,
              identified: normalized,
              source: isFreshwaterEnv ? "freshwater-catalog" : "marine-catalog",
              hasApiKey: true,
              notice: `Vision AI rate limit reached; identified via local ${isFreshwaterEnv ? "Freshwater" : "Marine"} Species Engine.`,
            });
          }

          const smartFallback = createSmartFallbackSpecimen(searchHint, type, isFreshwaterEnv);
          return NextResponse.json({
            success: true,
            identified: smartFallback,
            source: "species-engine",
            hasApiKey: true,
          });
        }

        return NextResponse.json(
          {
            success: false,
            error: `${chosenProvider.toUpperCase()}: ${errorMsg}`,
            needsApiKey: false,
          },
          { status: 400 }
        );
      }
    }

    // Fallback: If no API key, check if user provided a text hint that matches our catalog
    const searchHint = hint || queryName || "";
    if (searchHint.trim()) {
      const matched = findMatchingSpecimen(searchHint, type === "CORAL" ? "CORAL" : "FISH_INVERT", isFreshwaterEnv);
      if (matched) {
        const normalized = { ...matched };
        if (normalized.category === "Zoanthid" || normalized.category === "Mushroom") {
          normalized.category = "Soft Coral";
        }
        if (type === "FISH_INVERT") {
          normalized.category = normalized.category === "Fish" ? "Fish" : "Invertebrates";
        }
        return NextResponse.json({
          success: true,
          identified: normalized,
          source: isFreshwaterEnv ? "freshwater-catalog" : "marine-catalog",
          hasApiKey: false,
        });
      }
    }

    // No API key provided
    return NextResponse.json({
      success: false,
      needsApiKey: true,
      error: "Identification requires an AI API Key or a recognized common name. Please provide an API key in settings.",
    });
  } catch (error: any) {
    console.error("Identification error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to identify specimen" },
      { status: 500 }
    );
  }
}
