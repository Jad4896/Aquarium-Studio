import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { searchHitchhikerCatalog, HITCHHIKER_DATABASE } from "@/lib/hitchhikerCatalog";
import { searchDiseaseCatalog, DISEASE_DATABASE } from "@/lib/diseaseCatalog";

function cleanBase64Payload(
  rawInput: string | undefined | null,
  fallbackMime: string = "image/jpeg"
): { base64: string; mime: string } {
  if (!rawInput || typeof rawInput !== "string") {
    return { base64: "", mime: fallbackMime };
  }
  let str = rawInput.trim();
  let mime = fallbackMime;

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

async function callGemini(apiKey: string, prompt: string, base64Data?: string, resolvedMimeType?: string) {
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

  const candidateModels = ["gemini-3.8-flash", "gemini-3.7-flash", "gemini-2.5-flash"];
  const timeoutMs = base64Data && base64Data.trim().length > 0 ? 24000 : 12000;
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const generatePromise = ai.models.generateContent({
        model,
        contents: [{ role: "user", parts }],
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
      console.warn(`Gemini model ${model} failed, trying next:`, err.message?.slice(0, 100));
    }
  }

  throw lastError || new Error("All Gemini models were unavailable");
}

async function callOpenAI(apiKey: string, prompt: string, base64Data?: string, mimeType?: string) {
  let content: any = prompt;
  if (base64Data && base64Data.trim().length > 0) {
    const imageMime = mimeType?.startsWith("video/") ? "image/jpeg" : mimeType || "image/jpeg";
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
      messages: [{ role: "user", content }],
      response_format: { type: "json_object" },
      temperature: 0.2,
    }),
    signal: AbortSignal.timeout(16000),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenAI returned status ${res.status}`);
  }
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || "{}";
  return parseJsonSafely(text);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      tab, // "hitchhiker" | "disease"
      mode, // "local" | "ai"
      description,
      imageBase64,
      mimeType,
      tankType,
      isFreshwater,
      provider,
      apiKey,
    } = body;

    const isFreshwaterEnv = tankType === "FRESHWATER" || Boolean(isFreshwater);
    const envKey: "marine" | "freshwater" = isFreshwaterEnv ? "freshwater" : "marine";
    const textQuery = (description || "").trim();

    // ─────────────────────────────────────────────────────────────
    // 1. LOCAL DATABASE MATCHING
    // ─────────────────────────────────────────────────────────────
    if (mode === "local" || !mode) {
      if (tab === "hitchhiker") {
        const matches = searchHitchhikerCatalog(textQuery, envKey);
        if (matches.length > 0) {
          return NextResponse.json({
            success: true,
            source: "local-database",
            matchType: "hitchhiker",
            count: matches.length,
            results: matches,
          });
        }

        // Return top common examples for this environment if no direct keyword match
        const defaultPool = HITCHHIKER_DATABASE.filter(
          (h) => h.environment === "both" || h.environment === envKey
        ).slice(0, 4);

        return NextResponse.json({
          success: true,
          source: "local-database-suggested",
          matchType: "hitchhiker",
          count: defaultPool.length,
          results: defaultPool,
          note: textQuery
            ? `No exact local match for "${textQuery}". Here are the most common ${isFreshwaterEnv ? "freshwater" : "reef"} hitchhikers, or click "Identify with AI" for deep photo analysis.`
            : `Showing common ${isFreshwaterEnv ? "freshwater" : "reef"} hitchhikers. Describe the organism or use AI for deep analysis.`,
        });
      } else {
        // tab === "disease"
        const matches = searchDiseaseCatalog(textQuery, envKey);
        if (matches.length > 0) {
          return NextResponse.json({
            success: true,
            source: "local-database",
            matchType: "disease",
            count: matches.length,
            results: matches,
          });
        }

        const defaultPool = DISEASE_DATABASE.filter(
          (d) => d.environment === "both" || d.environment === envKey
        ).slice(0, 4);

        return NextResponse.json({
          success: true,
          source: "local-database-suggested",
          matchType: "disease",
          count: defaultPool.length,
          results: defaultPool,
          note: textQuery
            ? `No exact local match for "${textQuery}". Showing common ${isFreshwaterEnv ? "freshwater" : "marine"} illnesses. Click "Identify with AI" for visual symptom and photo inspection.`
            : `Showing common ${isFreshwaterEnv ? "freshwater" : "marine"} illnesses. Enter symptoms or use AI for deep photo diagnosis.`,
        });
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 2. AI DIAGNOSTIC IDENTIFICATION
    // ─────────────────────────────────────────────────────────────
    let base64Data = "";
    let resolvedMime = mimeType || "image/jpeg";
    if (imageBase64 && typeof imageBase64 === "string" && imageBase64.trim().length > 0) {
      const cleaned = cleanBase64Payload(imageBase64, resolvedMime);
      base64Data = cleaned.base64;
      resolvedMime = cleaned.mime;
    }

    const geminiKey =
      (apiKey && (provider === "gemini" || (!provider && apiKey.startsWith("AIzaSy"))) ? apiKey.trim() : "") ||
      process.env.GEMINI_API_KEY ||
      "";
    const openAiKey =
      (apiKey && (provider === "openai" || (!provider && apiKey.startsWith("sk-"))) ? apiKey.trim() : "") ||
      process.env.OPENAI_API_KEY ||
      "";

    const chosenKey = geminiKey || openAiKey || apiKey;
    const chosenProvider = (openAiKey && !geminiKey) ? "openai" : "gemini";

    if (!chosenKey) {
      return NextResponse.json(
        {
          success: false,
          error: "No AI API key found. Please configure a Google Gemini or OpenAI API key in AI Settings to use AI Identification.",
          needsApiKey: true,
        },
        { status: 400 }
      );
    }

    let aiPrompt = "";

    if (tab === "hitchhiker") {
      aiPrompt = `You are a master marine and freshwater aquatic invertebrate taxonomist, coral reef biologist, and pest management authority.
A hobbyist is seeking identification of an unknown aquatic hitchhiker, critter, or nuisance pest found in their ${isFreshwaterEnv ? "FRESHWATER" : "SALTWATER REEF"} aquarium.

USER'S WRITTEN DESCRIPTION OF THE ORGANISM:
"${textQuery || "No written description provided - inspect attached photo/video in detail."}"

Analyze the attached media and user's description. Inspect morphology, body segmentation, tentacles, color, movement, and location.
Determine whether this organism is Beneficial, Harmless, a Nuisance, or a Harmful Pest/Parasite.

Return ONLY a valid JSON object without markdown formatting or codeblocks with these exact keys:
{
  "name": "Common Trade / Hitchhiker Name (e.g. 'Aiptasia (Glass Anemone)', 'Bristleworm', 'Red Planaria Flatworm', 'Asterina Starfish', 'Vermetid Snail', 'Stomatella Snail', 'Hydra', 'Planaria')",
  "scientificName": "Latin genus / species (or sp. / family if unconfirmed)",
  "category": "One of ['Beneficial', 'Harmless', 'Nuisance', 'Pest', 'Parasite']",
  "riskLevel": "One of ['Low', 'Moderate', 'High', 'Critical']",
  "confidence": "e.g. '95% High Confidence'",
  "visualTraits": [
    "3-4 bullet points detailing specific morphological traits observed in the photo/description"
  ],
  "summary": "Detailed, friendly 2-3 sentence overview explaining what this critter is and its ecological role in the aquarium.",
  "managementGuide": [
    "Step-by-step actionable advice on how to eradicate or control this organism (or reasons to leave it alone if beneficial)."
  ],
  "naturalPredators": [
    "List of biological fish, inverts, or predators that naturally consume this pest"
  ],
  "reefSafeStatus": "Explanation of whether it poses any threat to corals, fish, dwarf shrimp, or clean-up crew."
}`;
    } else {
      // tab === "disease"
      aiPrompt = `You are a certified aquatic veterinarian, fish pathologist, and master coral disease specialist.
A hobbyist is requesting a medical diagnosis for an affected fish or coral in their ${isFreshwaterEnv ? "FRESHWATER" : "SALTWATER REEF"} aquarium.

USER'S WRITTEN SYMPTOM DESCRIPTION:
"${textQuery || "No written description provided - inspect attached photo/video in detail."}"

Carefully inspect the visual symptoms shown in the photo/video (such as white salt spots, velvet dusty sheen, peeling slime coat, red bloody ulcers, frayed fins, coral tissue recession RTN/STN, brown jelly, or bleaching) and evaluate against the user's description.

Return ONLY a valid JSON object without markdown formatting or codeblocks with these exact keys:
{
  "name": "Primary Probable Disease or Condition Name (e.g. 'Marine Ich (Cryptocaryon)', 'Marine Velvet (Amyloodinium)', 'Brooklynella', 'Coral Rapid Tissue Necrosis (RTN)', 'Brown Jelly Disease', 'Freshwater Ich', 'Columnaris', 'Fin Rot')",
  "pathogenType": "One of ['Parasitic Protozoan', 'Bacterial', 'Fungal', 'Viral', 'Environmental / Nutritional', 'Coral Tissue Necrosis']",
  "riskLevel": "One of ['Low', 'Moderate', 'High', 'Critical']",
  "confidence": "e.g. '90% High Confidence'",
  "progressionSpeed": "One of ['Slow (Weeks)', 'Moderate (Days)', 'Rapid (24-48 Hours)', 'Emergency']",
  "observedSymptoms": [
    "3-4 bullet points describing the clinical signs and visual markers observed"
  ],
  "differentialDiagnoses": [
    "2-3 alternative conditions to rule out (e.g. 'Distinguish from Epistylis: Epistylis spots are raised and protrude...')"
  ],
  "treatmentProtocol": [
    "Step-by-step veterinary treatment protocol including specific medications (Copper, Praziquantel, Formalin, Kanaplex, Ciprofloxacin, Hydrogen Peroxide, or Freshwater Dip), dosage instructions, and hospital tank instructions."
  ],
  "quarantineRequired": true,
  "reefSafeWarning": "Crucial warning explaining whether medications are lethal to corals/inverts or must be administered strictly in a hospital quarantine tank.",
  "preventionTips": [
    "Key measures to prevent recurrence (quarantine protocol, water parameter stability, UV sterilization, nutrition)."
  ]
}`;
    }

    let parsedResult: any = null;
    if (chosenProvider === "openai") {
      parsedResult = await callOpenAI(chosenKey, aiPrompt, base64Data, resolvedMime);
    } else {
      parsedResult = await callGemini(chosenKey, aiPrompt, base64Data, resolvedMime);
    }

    return NextResponse.json({
      success: true,
      source: "ai-vision-diagnostic",
      provider: chosenProvider,
      matchType: tab,
      result: parsedResult,
    });
  } catch (err: any) {
    console.error("Health & Hitchhiker Diagnostic Error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to process diagnostic request. Please check API key and try again.",
      },
      { status: 500 }
    );
  }
}
