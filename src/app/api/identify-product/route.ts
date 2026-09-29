import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { GoogleGenAI } from "@google/genai";
import { findMatchingProduct, IdentifiedProduct } from "@/lib/productCatalog";

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

async function callGeminiProduct(apiKey: string, prompt: string, base64Data?: string, mimeType?: string) {
  const ai = new GoogleGenAI({ apiKey });
  const parts: any[] = [{ text: prompt }];

  if (base64Data && mimeType) {
    parts.push({
      inlineData: {
        mimeType: mimeType.startsWith("image/") ? mimeType : "image/jpeg",
        data: base64Data,
      },
    });
  }

  const candidateModels = ["gemini-3.8-flash", "gemini-3.7-flash", "gemini-2.5-flash"];
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [{ role: "user", parts }],
        config: {
          responseMimeType: "application/json",
        },
      });

      const textOutput = response.text || "{}";
      return parseJsonSafely(textOutput);
    } catch (err: any) {
      lastError = err;
      console.warn(`Product identify Gemini model ${model} unavailable, trying fallback:`, err.message?.slice(0, 100));
    }
  }

  throw lastError || new Error("All Gemini free tier models were unavailable");
}

async function callOpenAIProduct(apiKey: string, prompt: string, base64Data?: string, mimeType?: string) {
  const content: any[] = [{ type: "text", text: prompt }];
  if (base64Data && mimeType) {
    const imgMime = mimeType.startsWith("image/") ? mimeType : "image/jpeg";
    content.push({
      type: "image_url",
      image_url: { url: `data:${imgMime};base64,${base64Data}` },
    });
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
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenAI API returned status ${res.status}`);
  }
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || "{}";
  return parseJsonSafely(text);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productQuery, photoUrl, imageBase64, mimeType, provider, apiKey, tankType } = body;
    const isFreshwater = tankType === "FRESHWATER";

    let base64Data = "";
    let resolvedMimeType = mimeType || "image/jpeg";

    if (imageBase64 && typeof imageBase64 === "string" && imageBase64.trim().length > 0) {
      const cleaned = cleanBase64Payload(imageBase64, resolvedMimeType);
      base64Data = cleaned.base64;
      resolvedMimeType = cleaned.mime;
    }

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
          console.warn("Could not read local product image:", err);
        }
      }
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

    const hasMedia = Boolean(base64Data && base64Data.length > 50);
    const hasQuery = Boolean(productQuery && typeof productQuery === "string" && productQuery.trim().length > 0);

    if (!hasMedia && !hasQuery) {
      return NextResponse.json(
        {
          success: false,
          error: "Please enter a product brand/model name or upload a product photo.",
        },
        { status: 400 }
      );
    }

    const prompt = isFreshwater
      ? `You are a master freshwater aquarist, planted aquarium botanist, and aquatic chemistry expert.
Your job is to identify this freshwater aquarium product (all-in-one plant fertilizer, estimative index dry salts, trace micronutrients, RO/DI remineralizing salts, GH/KH buffer, water conditioner, or biological booster) and provide comprehensive, reliable directions and parameters.

${hasQuery ? `User provided product name/brand hint: "${productQuery}"` : ""}
${hasMedia ? "Analyze the label, text, packaging, logo, and brand markings on the attached photo." : ""}

Return ONLY a valid JSON object without markdown code blocks with these exact keys:
{
  "brand": "Manufacturer / Brand Name (e.g. 'Seachem', 'ADA', 'Tropica', 'NilocG Aquatics', 'APT (2Hr Aquarist)', 'SaltyShrimp', 'Aquarium Co-Op', 'Fritz')",
  "productName": "Complete official product name (e.g. 'Thrive All-in-One Liquid Fertilizer', 'SaltyShrimp GH/KH+', 'Tropica Specialised Nutrition', 'Seachem Prime', 'ADA Brighty K')",
  "category": "One of ['All-In-One Plant Fertilizer', 'Macro / Micro Fertilizer', 'RO/DI Remineralizer', 'Water Conditioner & Buffer', 'Substrate & Root Tab', 'Other']",
  "summary": "Detailed summary describing what this product is, its active nutrient ingredients (NPK, Fe, trace), why planted tank and shrimp keepers use it, and which plants/fauna benefit most.",
  "targetParameters": "Target water chemistry specs when mixed or maintained (e.g. 'TDS 120-150 ppm, GH 4-6 dGH, KH 1-2 dKH, Nitrate 10-20 ppm, Phosphate 0.5-2.0 ppm').",
  "gramsPerLiter": "If it is a remineralizer powder, provide grams per 10 liters to achieve target GH/TDS (or null if liquid).",
  "mixingDirections": "Step-by-step usage and mixing directions for bucket water changes or tank dosing.",
  "dosingDirections": "Precise dosage instructions, standard dose per 100 Liters or 10-20 gallons, dosing frequency (daily or 1-3x weekly), and timing with lighting/photoperiod.",
  "safetyAndStorage": "Important storage advice (keep out of direct sunlight, avoid contamination) and dwarf shrimp / fauna safety considerations.",
  "compatibleCalculators": "Array of applicable calculator tags e.g. ['fert', 'remin', 'tds', 'gh', 'kh', 'nitrate', 'phosphate', 'iron']",
  "recommendedDoseRule": "Short formula or quick rule of thumb for dosing (e.g. '2 mL per 100L 3x weekly raises NO3 by 3 ppm, PO4 by 0.5 ppm')"
}`
      : `You are a master marine aquarist and saltwater reef chemistry expert.
Your job is to identify this reef aquarium product (salt mix bucket, trace element formula, balling supplement, or nutrient additive) and provide comprehensive, reliable directions and parameters.

${hasQuery ? `User provided product name/brand hint: "${productQuery}"` : ""}
${hasMedia ? "Analyze the label, text, packaging, logo, and brand markings on the attached photo." : ""}

Return ONLY a valid JSON object without markdown code blocks with these exact keys:
{
  "brand": "Manufacturer / Brand Name (e.g. 'Red Sea', 'Tropic Marin', 'Aquaforest', 'Brightwell Aquatics', 'Fauna Marin', 'Triton', 'Instant Ocean', 'ATI')",
  "productName": "Complete official product name (e.g. 'Red Sea Coral Pro Salt', 'Trace-Colors A (Iodine/Halogens)', 'NeoNitro', 'Balling Light Trace 1, 2, 3', 'Tropic Marin Pro-Reef Salt')",
  "category": "One of ['Salt Mix', 'Trace Element', 'Major Buffer (Ca/Alk/Mg)', 'Nutrient Supplement (NO3/PO4)', 'All-In-One Reef Additive', 'Other']",
  "summary": "Detailed summary describing what this product is, its active ingredients, why reefers use it, and what coral types benefit most.",
  "targetParameters": "Target water chemistry specs when mixed or maintained (e.g. for salt: 'Salinity 35.0 ppt / 1.026 SG, Alkalinity 11.5 - 12.2 dKH, Calcium 450 - 480 ppm, Magnesium 1350 - 1420 ppm'; for trace: target element ppm in tank).",
  "gramsPerLiter": "If it is a salt mix, provide the exact number of grams per liter to achieve 35.0 ppt / 1.026 SG (e.g. 38.0 or 38.2); if not a salt mix, set to null.",
  "mixingDirections": "Step-by-step usage and mixing directions. For salt: RO/DI water instructions, water temperature (20-25°C), mixing time limit to avoid calcium carbonate precipitation, aeration advice.",
  "dosingDirections": "Precise dosage instructions, standard dose per 100 Liters or 25 gallons, dosing frequency, daily max limits, and how to introduce into high-flow sump area.",
  "safetyAndStorage": "Important storage advice (keep tightly sealed, moisture/humidity sensitivity, avoiding caking) and chemical safety warnings.",
  "compatibleCalculators": "Array of applicable calculator tags e.g. ['salt', 'alk', 'ca', 'magnesium', 'nitrate', 'phosphate', 'potassium', 'iron', 'iodine', 'strontium']",
  "recommendedDoseRule": "Short formula or quick rule of thumb for dosing (e.g. '1 mL per 100L based on 20 ppm Ca uptake' or '6.7 mL per 100L raises NO3 by 1 ppm')"
}`;

    // Execute with AI if key available
    if (chosenKey) {
      try {
        let parsed: IdentifiedProduct | null = null;
        if (chosenProvider === "openai") {
          parsed = await callOpenAIProduct(chosenKey, prompt, base64Data, resolvedMimeType);
        } else {
          parsed = await callGeminiProduct(chosenKey, prompt, base64Data, resolvedMimeType);
        }

        if (parsed && parsed.productName) {
          return NextResponse.json({
            success: true,
            product: parsed,
            source: chosenProvider === "gemini" ? "gemini-2.5-flash" : "openai-gpt-4o",
            provider: chosenProvider,
            hasApiKey: true,
          });
        }
      } catch (aiErr: any) {
        console.error("Product AI identify error:", aiErr);
        // If AI fails, proceed to catalog fallback below
      }
    }

    // Catalog Fallback: match by product query
    if (hasQuery) {
      const matched = findMatchingProduct(productQuery!);
      if (matched) {
        return NextResponse.json({
          success: true,
          product: matched,
          source: "marine-product-catalog",
          hasApiKey: Boolean(chosenKey),
        });
      }
    }

    // If no key and no match
    if (!chosenKey) {
      return NextResponse.json({
        success: false,
        needsApiKey: true,
        error: "Product identification for unknown custom products requires an AI API Key. Please provide a Google Gemini or OpenAI API Key, or select a known brand like Red Sea, Tropic Marin, Aquaforest, Brightwell, or Fauna Marin.",
      });
    }

    return NextResponse.json({
      success: false,
      error: "Could not identify product from the provided text or image. Please check the name or image quality.",
    });
  } catch (error: any) {
    console.error("Product identification error:", error);
    return NextResponse.json({ error: error.message || "Failed to identify product" }, { status: 500 });
  }
}
