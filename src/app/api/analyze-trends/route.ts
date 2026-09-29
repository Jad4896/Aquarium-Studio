import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { GoogleGenAI } from "@google/genai";
import { WaterParameter, Tank } from "@/types";

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

async function callGemini(apiKey: string, prompt: string) {
  const ai = new GoogleGenAI({ apiKey });
  const candidateModels = ["gemini-3.8-flash", "gemini-3.7-flash", "gemini-2.5-flash"];
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
        },
      });
      return parseJsonSafely(response.text || "{}");
    } catch (err: any) {
      lastError = err;
      console.warn(`Analyze trends Gemini model ${model} unavailable, trying fallback:`, err.message?.slice(0, 100));
    }
  }

  throw lastError || new Error("All Gemini free tier models were unavailable");
}

async function callOpenAI(apiKey: string, prompt: string) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
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

async function callAnthropic(apiKey: string, prompt: string) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2500,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Anthropic API returned status ${res.status}`);
  }

  const data = await res.json();
  const text = data.content?.[0]?.text || "{}";
  return parseJsonSafely(text);
}

async function callOpenRouter(apiKey: string, prompt: string) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenRouter API returned status ${res.status}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || "{}";
  return parseJsonSafely(text);
}

// Generate smart offline fallback analysis based on actual parameter logs
function generateOfflineAnalysis(
  tank: Tank,
  parameters: WaterParameter[],
  selectedParam: string
) {
  const sorted = [...parameters].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const isFreshwater = tank.tankType === "FRESHWATER";
  const fluctuations: any[] = [];
  const latest = sorted[sorted.length - 1];
  const previous = sorted.length > 1 ? sorted[sorted.length - 2] : null;

  if (latest) {
    if (isFreshwater) {
      // FRESHWATER PARAMETER ANALYSIS
      // 1. Nitrogen Cycle (Ammonia & Nitrite)
      if (selectedParam === "all" || selectedParam === "ammonia" || selectedParam === "nitrite") {
        const curAmm = latest.ammonia ?? 0;
        const curNit = latest.nitrite ?? 0;
        const hasToxicity = curAmm > 0.05 || curNit > 0.05;
        fluctuations.push({
          parameter: "Biological Filter & Nitrogen Cycle (NH3 / NO2)",
          currentReading: `Ammonia: ${curAmm.toFixed(2)} ppm | Nitrite: ${curNit.toFixed(2)} ppm`,
          targetRange: "0.00 ppm (Undetectable)",
          trendDirection: hasToxicity ? "Cycle stress detected" : "Stable biological filtration",
          status: hasToxicity ? "Action Required" : "Optimal",
          potentialCauses: [
            "Immature biofilter or recent filter media cleaning killing nitrifying bacteria colonies.",
            "Overfeeding, dead livestock, or decomposing plant foliage overwhelming bacterial processing capacity.",
            "pH shifts altering free unionized ammonia (NH3) vs ammonium (NH4+) toxicity."
          ],
          howToFix: [
            "Perform an immediate 30-50% water change with dechlorinated, temperature-matched water.",
            "Dose beneficial nitrifying bacteria culture (e.g. Seachem Stability, Fritz TurboStart) directly into filter sponge.",
            "Temporarily cease feeding for 24-48 hours until ammonia and nitrite drop back to 0.00 ppm."
          ]
        });
      }

      // 2. Nitrate (Plant Nutrient & Fauna Health)
      if (selectedParam === "all" || selectedParam === "nitrate" || selectedParam === "no3") {
        const curNo3 = latest.no3 ?? 0;
        const prevNo3 = previous ? (previous.no3 ?? 0) : curNo3;
        const no3Diff = curNo3 - prevNo3;
        const trend = Math.abs(no3Diff) < 2 ? "Stable" : no3Diff > 0 ? "Upward drift" : "Downward drift";
        fluctuations.push({
          parameter: "Nitrate (NO3) & Plant Uptake",
          currentReading: `${curNo3.toFixed(1)} ppm`,
          targetRange: `${tank.no3Target || "10 - 25 ppm"}`,
          trendDirection: trend,
          status: curNo3 > 40 ? "Elevated (Algae Risk)" : curNo3 < 5 ? "Low (Plant Starvation Risk)" : "Optimal",
          potentialCauses: [
            "Heavy plant density and fast growth consuming dissolved nitrogen faster than fish bioload generates it.",
            "Infrequent water changes allowing organic nitrate accumulation above safe thresholds for dwarf shrimp.",
            "Uneven fertilizer dosing schedules."
          ],
          howToFix: [
            "For high nitrate (>40 ppm): conduct a 50% weekly water change and siphon substrate detritus.",
            "For zero/low nitrate in high-tech planted tanks: supplement with potassium nitrate (KNO3) or all-in-one liquid ferts.",
            "Calibrate test kits with known reference solution to verify accuracy."
          ]
        });
      }

      // 3. General Hardness (GH) & Total Dissolved Solids (TDS)
      if (selectedParam === "all" || selectedParam === "gh" || selectedParam === "tds") {
        const curGh = latest.gh ?? 0;
        const curTds = latest.tds ?? 0;
        fluctuations.push({
          parameter: "General Hardness (GH) & Mineral TDS",
          currentReading: `GH: ${curGh.toFixed(1)} dGH | TDS: ${Math.round(curTds)} ppm`,
          targetRange: `GH: ${tank.ghTarget || "4 - 8 dGH"} | TDS: ${tank.tdsTarget || "120 - 200 ppm"}`,
          trendDirection: "Osmotic balance",
          status: "Optimal",
          potentialCauses: [
            "Aquarium evaporation concentrating minerals if topping off with tap water rather than pure RO/DI water.",
            "Substrate or hardscape rocks (e.g. Seiryu stone) leaching calcium and magnesium into the water column.",
            "Remineralizer dosage variations during bucket water changes."
          ],
          howToFix: [
            "Always top off evaporated water with 0 TDS pure RO/DI water, not remineralized or tap water.",
            "Pre-dissolve shrimp mineral salts in a separate bucket and test TDS before adding to tank.",
            "Observe dwarf shrimp molting behavior; failed molts indicate rapid GH/TDS fluctuations."
          ]
        });
      }

      // 4. Carbonate Hardness (KH) & pH Stability
      if (selectedParam === "all" || selectedParam === "kh" || selectedParam === "ph") {
        const curKh = latest.kh ?? 0;
        const curPh = latest.ph ?? 7.0;
        fluctuations.push({
          parameter: "Carbonate Hardness (KH) & pH Buffering",
          currentReading: `KH: ${curKh.toFixed(1)} dKH | pH: ${curPh.toFixed(2)}`,
          targetRange: `KH: ${tank.khTarget || "1 - 4 dKH"} | pH: ${tank.phTarget || "6.4 - 7.2"}`,
          trendDirection: "Buffer stability",
          status: curPh < 6.0 ? "Acidic Depletion" : curPh > 7.8 ? "Alkaline Drift" : "Optimal",
          potentialCauses: [
            "Active buffering soil (e.g. ADA Amazonia) stripping carbonate hardness down to 0-1 dKH.",
            "CO2 injection timing and solenoid regulator bubble rate creating diurnal pH drops.",
            "Biological nitrification producing hydrogen ions that gradually consume carbonate alkalinity."
          ],
          howToFix: [
            "For Caridina shrimp: maintain 0-1 dKH with active soil for optimal survival and breeding.",
            "For Neocaridina and community fish: maintain 2-4 dKH to prevent sudden pH crash.",
            "Use a drop checker with 4 dKH solution to safely gauge dissolved CO2 levels."
          ]
        });
      }
    } else {
      // SALTWATER REEF PARAMETER ANALYSIS
      // 1. Alkalinity check
      if (selectedParam === "all" || selectedParam === "alk") {
        const latAlk = latest.alk ?? 8.2;
        const prevAlk = previous ? (previous.alk ?? latAlk) : latAlk;
        const alkDiff = latAlk - prevAlk;
        const alkTargetMin = 7.8;
        const alkTargetMax = 9.0;
        const isLow = latAlk < alkTargetMin;
        const isHigh = latAlk > alkTargetMax;
        const trend = Math.abs(alkDiff) < 0.1 ? "Stable" : alkDiff > 0 ? "Upward drift" : "Downward drift";

        fluctuations.push({
          parameter: "Alkalinity",
          currentReading: `${latAlk.toFixed(1)} dKH`,
          targetRange: `${tank.dkhTarget || "7.8 - 9.0"} dKH`,
          trendDirection: trend,
          status: isLow ? "Below Target" : isHigh ? "Above Target" : "Optimal",
          potentialCauses: [
            "Biological calcification consumption by growing stony corals (SPS/LPS) outstripping daily dosing replenishment.",
            "Magnesium deficiency (below 1300 ppm) destabilizing calcium carbonate saturation and causing premature abiotic precipitation.",
            "Variations in freshly mixed saltwater batch alkalinity during water changes.",
            "Auto-top-off (ATO) fluctuations altering water volume concentration."
          ],
          howToFix: [
            "Test alkalinity at the exact same time of day over 3 consecutive days to calculate true 24-hour coral consumption.",
            "Gradually adjust dosing rates. Never increase Alkalinity by more than +1.0 dKH in a 24-hour period to prevent rapid tissue necrosis (RTN).",
            "Ensure Magnesium is tested and sustained above 1350 ppm before attempting large alkalinity corrections."
          ]
        });
      }

      // 2. Calcium check
      if (selectedParam === "all" || selectedParam === "ca") {
        const latCa = latest.ca ?? 420;
        const prevCa = previous ? (previous.ca ?? latCa) : latCa;
        const caDiff = latCa - prevCa;
        const trend = Math.abs(caDiff) < 5 ? "Stable" : caDiff > 0 ? "Upward drift" : "Downward drift";

        fluctuations.push({
          parameter: "Calcium",
          currentReading: `${latCa.toFixed(0)} ppm`,
          targetRange: `${tank.caTarget || "400 - 450"} ppm`,
          trendDirection: trend,
          status: latCa < 400 ? "Below Target" : latCa > 460 ? "Above Target" : "Optimal",
          potentialCauses: [
            "Coralline algae growth and stony coral skeletal calcification consuming calcium in proportion to carbonate alkalinity.",
            "Two-part buffer dosing imbalance where Part A and Part B are dosed unevenly.",
            "Salt mix batch variance with high or low native calcium concentration."
          ],
          howToFix: [
            "Maintain balanced ionic addition. Calcium drops roughly 7 ppm for every 1.0 dKH of alkalinity consumed.",
            "Adjust daily calcium dosing in small increments, avoiding single-dose swings larger than +30 ppm per day.",
            "Inspect dosing pump heads and calibration tubes for air bubbles or salt creep."
          ]
        });
      }

      // 3. Magnesium check
      if (selectedParam === "all" || selectedParam === "mg") {
        const latMg = latest.mg ?? 1350;
        const prevMg = previous ? (previous.mg ?? latMg) : latMg;
        const mgDiff = latMg - prevMg;
        const trend = Math.abs(mgDiff) < 15 ? "Stable" : mgDiff > 0 ? "Upward drift" : "Downward drift";

        fluctuations.push({
          parameter: "Magnesium",
          currentReading: `${latMg.toFixed(0)} ppm`,
          targetRange: `${tank.mgTarget || "1300 - 1400"} ppm`,
          trendDirection: trend,
          status: latMg < 1280 ? "Below Target" : latMg > 1450 ? "Above Target" : "Optimal",
          potentialCauses: [
            "Slow incorporation into magnesium calcite coral skeleton and coralline algae crusts.",
            "Insufficient magnesium replenishment in salt mix water changes."
          ],
          howToFix: [
            "Target 1350 ppm (approx. 3x your Calcium level) to maintain strong buffering against calcium carbonate precipitation.",
            "Use a balanced 5:3 blend of Magnesium Chloride and Magnesium Sulfate (Epsom Salt) to preserve chloride/sulfate ionic ratios.",
            "Do not raise Magnesium by more than +100 ppm per 24 hours."
          ]
        });
      }

      // 4. Nitrate & Phosphate (Nutrients) check
      if (selectedParam === "all" || selectedParam === "no3" || selectedParam === "po4") {
        const latNo3 = latest.no3 ?? 5.0;
        const latPo4 = latest.po4 ?? 0.03;
        fluctuations.push({
          parameter: "Nutrient Ratio (NO3 / PO4)",
          currentReading: `NO3: ${latNo3.toFixed(1)} ppm | PO4: ${latPo4.toFixed(2)} ppm`,
          targetRange: `NO3: ${tank.no3Target || "5.0 - 15.0"} ppm | PO4: ${tank.po4Target || "0.03 - 0.08"} ppm`,
          trendDirection: "Nutrient dynamics",
          status: latNo3 < 2 || latPo4 < 0.02 ? "ULNS (Risk of Dinoflagellates)" : latNo3 > 20 || latPo4 > 0.15 ? "Elevated (Risk of Algae)" : "Optimal",
          potentialCauses: [
            "Heavy bioload or overfeeding frozen/pellet foods introducing organic phosphates and nitrogenous waste.",
            "Over-skimming, aggressive carbon dosing, or oversized refugium driving nutrients to absolute zero.",
            "Detritus accumulation in filter socks, sump baffles, or rear filtration chambers."
          ],
          howToFix: [
            "Never let PO4 or NO3 drop to unmeasurable zero; undetectable nutrients create an ecological vacuum exploited by toxic dinoflagellates.",
            "If nutrients are too high: blow detritus off rocks with a turkey baster prior to a 15% water change, and rinse filter mechanical pads frequently.",
            "If nutrients are too low: slightly increase feeding or micro-dose balanced Sodium Nitrate and Trisodium Phosphate."
          ]
        });
      }

      // 5. pH & Salinity check
      if (selectedParam === "all" || selectedParam === "ph" || selectedParam === "salinity") {
        const latSal = latest.salinity ?? 1.026;
        const latPh = latest.ph ?? 8.2;
        fluctuations.push({
          parameter: "Salinity & pH Stability",
          currentReading: `Salinity: ${latSal} SG | pH: ${latPh.toFixed(2)}`,
          targetRange: `Salinity: ${tank.salinityTarget || "1.025 - 1.026"} | pH: ${tank.phTarget || "8.1 - 8.4"}`,
          trendDirection: "Environmental equilibrium",
          status: latPh < 8.0 ? "Low pH" : "Optimal",
          potentialCauses: [
            "High indoor ambient CO2 concentrations depressing aquarium pH through carbonic acid formation.",
            "Evaporation and ATO delivery cycle timing.",
            "Salt creep or skimmate cup volume removal altering system salinity over time."
          ],
          howToFix: [
            "Calibrate your refractometer using 35 ppt calibration fluid, never pure fresh water.",
            "Run a CO2 scrubber or draw outside fresh air to the protein skimmer air intake to elevate daytime and nighttime pH above 8.15.",
            "Ensure strong surface ripple to maximize gaseous exchange and oxygen saturation."
          ]
        });
      }
    }
  }

  return {
    disclaimer: isFreshwater
      ? "⚠️ INFORMATIONAL ADVISORY NOTICE: The trend analysis and recommendations below are provided strictly for educational and informational purposes. Freshwater aquariums are sensitive, individualized closed ecosystems. These observations are NOT guaranteed prescriptions. Always conduct your own research, confirm readings with calibrated test kits, and observe your aquatic plants, fish, and inverts closely before making adjustments."
      : "⚠️ INFORMATIONAL ADVISORY NOTICE: The trend analysis and recommendations below are provided strictly for educational and informational purposes. Marine aquariums are sensitive, individualized closed ecosystems. These observations are NOT guaranteed prescriptions. Always conduct your own research, confirm readings with calibrated test kits, and observe coral polyp extension before making adjustments.",
    overallHealthStatus: "Attention Needed",
    trendSummary: `Analysis of ${sorted.length} parameter logs for ${tank.name} (${tank.volumeLiters || 80}L ${tank.purpose || (isFreshwater ? "Freshwater Planted" : "Reef")}). Parameter stability is currently exhibiting moderate shifts relative to formulated target baselines.`,
    fluctuations,
    tipsAndTricks: isFreshwater
      ? [
          "Perform regular 30-50% weekly water changes to reset mineral accumulation when dosing fertilizers.",
          "Keep pure 0 TDS RO/DI water on hand for evaporation top-offs to prevent creeping TDS.",
          "Use a calibrated digital TDS meter and drop checker to monitor water hardness and CO2 levels.",
          "Ensure healthy water circulation to prevent dead zones where debris collects and spikes ammonia."
        ]
      : [
          "Test Alkalinity at the exact same hour each testing day (ideally mid-day) to avoid diurnal photosynthetic fluctuations.",
          "Always cross-check anomalous test kit readings with a secondary test kit or multi-reference solution before dosing corrective chemicals.",
          "Stability trumps numbers: Corals tolerate a non-ideal number much better than a sudden, rapid swing intended to reach a textbook number.",
          "Check dosing pump head rollers and silicone tubing quarterly for calibration drift and pinch hardening."
        ],
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tank, parameters, selectedParam = "all", timeRange = "all", provider = "gemini", apiKey: clientApiKey } = body;

    if (!tank) {
      return NextResponse.json({ error: "Tank details required" }, { status: 400 });
    }

    const paramLogs = Array.isArray(parameters) ? parameters : [];
    if (paramLogs.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No parameter logs recorded yet. Please log at least 2 water tests to generate trend analysis.",
      }, { status: 400 });
    }

    // Determine active API key
    let activeKey = clientApiKey || "";
    let serverKeys: Record<string, string> = {};

    try {
      const keysPath = path.join(process.cwd(), "data", "serverApiKeys.json");
      const content = await fs.readFile(keysPath, "utf-8");
      serverKeys = JSON.parse(content);
    } catch {
      // file might not exist yet
    }

    if (!activeKey) {
      if (provider === "gemini") {
        activeKey = serverKeys.gemini || process.env.GEMINI_API_KEY || "";
      } else if (provider === "openai") {
        activeKey = serverKeys.openai || process.env.OPENAI_API_KEY || "";
      } else if (provider === "anthropic") {
        activeKey = serverKeys.anthropic || process.env.ANTHROPIC_API_KEY || "";
      } else if (provider === "openrouter") {
        activeKey = serverKeys.openrouter || process.env.OPENROUTER_API_KEY || "";
      }
    }

    // If no API key configured, use intelligent offline analysis
    if (!activeKey || activeKey === "env_configured") {
      const offlineResult = generateOfflineAnalysis(tank, paramLogs, selectedParam);
      return NextResponse.json({
        success: true,
        analysis: offlineResult,
        source: "offline-catalog",
        provider: "offline",
        hasApiKey: false,
      });
    }

    // Format logs for AI prompt
    const sortedLogs = [...paramLogs].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const isFreshwater = tank.tankType === "FRESHWATER";

    const logSummary = sortedLogs
      .map((p, idx) => {
        const dateStr = new Date(p.date).toLocaleDateString();
        if (isFreshwater) {
          return `Log #${idx + 1} (${dateStr}): Temp=${p.temp}°C, pH=${p.ph}, Ammonia=${p.ammonia ?? 0} ppm, Nitrite=${p.nitrite ?? 0} ppm, Nitrate=${p.no3 ?? 0} ppm, GH=${p.gh ?? "N/A"} dGH, KH=${p.kh ?? "N/A"} dKH, TDS=${p.tds ?? "N/A"} ppm`;
        }
        return `Log #${idx + 1} (${dateStr}): Salinity=${p.salinity} SG, Temp=${p.temp}°C, pH=${p.ph}, Alk=${p.alk} dKH, Ca=${p.ca} ppm, Mg=${p.mg} ppm, NO3=${p.no3} ppm, PO4=${p.po4} ppm`;
      })
      .join("\n");

    const persona = isFreshwater
      ? "You are a World-Class Aquatic Botanist, Master Planted Aquarium Specialist, Limnologist, and Freshwater Aquarium Chemist.\nAnalyze the following freshwater planted aquarium parameter trend data and generate an actionable, scientifically grounded summary."
      : "You are a World-Class Marine Biologist, Master Reef Aquarist, and Chemical Oceanographer.\nAnalyze the following reef aquarium parameter trend data and generate an actionable, scientifically grounded summary.";

    const targets = isFreshwater
      ? `  * Temperature: ${tank.tempTarget || "22.0 - 26.0°C"}
  * pH: ${tank.phTarget || "6.4 - 7.2"}
  * Ammonia (NH3/NH4+): ${tank.ammoniaTarget || "0.00 ppm"}
  * Nitrite (NO2): ${tank.nitriteTarget || "0.00 ppm"}
  * Nitrate (NO3): ${tank.no3Target || "5.0 - 20.0 ppm"}
  * General Hardness (GH): ${tank.ghTarget || "4.0 - 8.0 dGH"}
  * Carbonate Hardness (KH): ${tank.khTarget || "1.0 - 4.0 dKH"}
  * Total Dissolved Solids (TDS): ${tank.tdsTarget || "120 - 180 ppm"}`
      : `  * Salinity: ${tank.salinityTarget || "1.025 - 1.026 SG"}
  * Temperature: ${tank.tempTarget || "25.0 - 26.0°C"}
  * pH: ${tank.phTarget || "8.1 - 8.4"}
  * Alkalinity: ${tank.dkhTarget || "7.8 - 9.0 dKH"}
  * Calcium: ${tank.caTarget || "400 - 450 ppm"}
  * Magnesium: ${tank.mgTarget || "1300 - 1400 ppm"}
  * Nitrate (NO3): ${tank.no3Target || "5.0 - 15.0 ppm"}
  * Phosphate (PO4): ${tank.po4Target || "0.03 - 0.08 ppm"}`;

    const mandatoryWarning = isFreshwater
      ? "You must provide a clear, bold advisory disclaimer at the top of the output stating that these insights are purely informative and educational, and NOT a guaranteed or exact prescription. The user must conduct their own independent research, verify readings with reliable test kits, and observe their aquatic plants, fish, and inverts closely before making chemical adjustments or fertilizer changes."
      : "You must provide a clear, bold advisory disclaimer at the top of the output stating that these insights are purely informative and educational, and NOT a guaranteed or exact prescription. The user must conduct their own independent research, verify readings with reliable test kits, and observe their corals before making chemical adjustments.";

    const schemaDisclaimer = isFreshwater
      ? "⚠️ INFORMATIONAL ADVISORY NOTICE: The trend analysis and recommendations below are provided strictly for educational and informational purposes. Freshwater aquariums are sensitive, individualized closed ecosystems. These observations are NOT guaranteed prescriptions. Always conduct your own research, confirm readings with calibrated test kits, and observe your aquatic plants, fish, and inverts before making adjustments."
      : "⚠️ INFORMATIONAL ADVISORY NOTICE: The trend analysis and recommendations below are provided strictly for educational and informational purposes. Marine aquariums are sensitive, individualized closed ecosystems. These observations are NOT guaranteed prescriptions. Always conduct your own research, confirm readings with calibrated test kits, and observe coral polyp extension before making adjustments.";

    const tipsExamples = isFreshwater
      ? `    "Practical aquascaping and planted tank tip regarding CO2 injection, drop checker color, or fertilizer dosing",
    "Practical tip on remineralizing RO/DI water or managing substrate nutrients",
    "Practical tip on observing fish respiration or shrimp molting behavior"`
      : `    "Practical reefkeeping tip 1 regarding testing time, probe calibration, or coral observation",
    "Practical reefkeeping tip 2",
    "Practical reefkeeping tip 3"`;

    const prompt = `${persona}

TANK PROFILE:
- Tank Name: ${tank.name}
- System Volume: ${tank.volumeLiters || 80} Liters
- Tank Type: ${tank.tankType || "SALTWATER"}
- Purpose / Ecosystem: ${tank.purpose || (isFreshwater ? "Freshwater Planted / Aquascape" : "Mixed Reef (SPS/LPS/Soft)")}
- Setup Date: ${tank.setupDate || "N/A"}
- Cycle Status: ${tank.cycle || "Established"}
- Targets:
${targets}

SELECTED VIEW FOCUS: ${selectedParam === "all" ? "All Parameters" : selectedParam.toUpperCase()}
TIME RANGE: ${timeRange}

HISTORICAL WATER PARAMETER LOGS (Chronological):
${logSummary}

MANDATORY USER WARNING:
${mandatoryWarning}

Return a valid, raw JSON object matching this exact schema:
{
  "disclaimer": "${schemaDisclaimer}",
  "overallHealthStatus": "Stable" | "Attention Needed" | "Action Required",
  "trendSummary": "A concise, 2-3 paragraph summary of recent parameter trends, drifts, consumption patterns, and overall stability.",
  "fluctuations": [
    {
      "parameter": "Parameter Name (e.g. ${isFreshwater ? "Nitrate / TDS" : "Alkalinity / Salinity"})",
      "currentReading": "Current latest value with units",
      "targetRange": "Target range with units",
      "trendDirection": "e.g. Upward drift / Downward drift / Stable / Volatile",
      "status": "Optimal | Below Target | Above Target | Fluctuating",
      "potentialCauses": [
        "Specific biological, chemical, or equipment cause 1",
        "Specific cause 2"
      ],
      "howToFix": [
        "Step 1: safe daily adjustment limit and method",
        "Step 2: preventative dosing or equipment calibration"
      ]
    }
  ],
  "tipsAndTricks": [
${tipsExamples}
  ]
}

DO NOT wrap the response in markdown code blocks like \`\`\`json. Return raw JSON.`;

    let analysis: any;
    let source = "gemini-2.5-flash";

    try {
      if (provider === "openai") {
        analysis = await callOpenAI(activeKey, prompt);
        source = "gpt-4o";
      } else if (provider === "anthropic") {
        analysis = await callAnthropic(activeKey, prompt);
        source = "claude-3-5-sonnet";
      } else if (provider === "openrouter") {
        analysis = await callOpenRouter(activeKey, prompt);
        source = "openrouter";
      } else {
        analysis = await callGemini(activeKey, prompt);
        source = "gemini-2.5-flash";
      }
    } catch (aiErr: any) {
      console.warn("AI generation failed, falling back to offline analysis:", aiErr?.message);
      analysis = generateOfflineAnalysis(tank, paramLogs, selectedParam);
      source = "offline-fallback";
    }

    return NextResponse.json({
      success: true,
      analysis,
      source,
      provider,
      hasApiKey: true,
    });
  } catch (error: any) {
    console.error("Failed to analyze parameter trends:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to analyze parameter trends" },
      { status: 500 }
    );
  }
}
