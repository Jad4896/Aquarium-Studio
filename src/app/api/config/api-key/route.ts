import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET() {
  const gemini = Boolean(process.env.GEMINI_API_KEY);
  const openai = Boolean(process.env.OPENAI_API_KEY);
  const anthropic = Boolean(process.env.ANTHROPIC_API_KEY);
  const openrouter = Boolean(process.env.OPENROUTER_API_KEY);

  const defaultProvider =
    process.env.DEFAULT_AI_PROVIDER ||
    (gemini ? "gemini" : openai ? "openai" : anthropic ? "anthropic" : openrouter ? "openrouter" : "gemini");

  const hasKey = Boolean(gemini || openai || anthropic || openrouter);

  return NextResponse.json({
    hasKey,
    defaultProvider,
    providers: {
      gemini,
      openai,
      anthropic,
      openrouter,
    },
  });
}

function updateEnvVariable(content: string, keyName: string, value: string): string {
  const regex = new RegExp(`${keyName}=.*(\\r?\\n|$)`, "g");
  if (content.includes(`${keyName}=`)) {
    return content.replace(regex, `${keyName}="${value}"\n`);
  }
  return content.trimEnd() + `\n${keyName}="${value}"\n`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      apiKey,
      provider = "gemini",
      geminiKey,
      openaiKey,
      anthropicKey,
      openrouterKey,
      defaultProvider,
    } = body;

    const envPath = path.join(process.cwd(), ".env");
    let envContent = "";
    try {
      envContent = await fs.readFile(envPath, "utf-8");
    } catch {
      envContent = "";
    }

    const updates: Record<string, string> = {};

    // Single key update
    if (apiKey && typeof apiKey === "string") {
      const trimmed = apiKey.trim();
      if (provider === "openai" || trimmed.startsWith("sk-") && !trimmed.startsWith("sk-ant") && !trimmed.startsWith("sk-or")) {
        updates["OPENAI_API_KEY"] = trimmed;
      } else if (provider === "anthropic" || trimmed.startsWith("sk-ant")) {
        updates["ANTHROPIC_API_KEY"] = trimmed;
      } else if (provider === "openrouter" || trimmed.startsWith("sk-or")) {
        updates["OPENROUTER_API_KEY"] = trimmed;
      } else {
        updates["GEMINI_API_KEY"] = trimmed;
      }
    }

    // Bulk keys update
    if (geminiKey !== undefined) updates["GEMINI_API_KEY"] = geminiKey.trim();
    if (openaiKey !== undefined) updates["OPENAI_API_KEY"] = openaiKey.trim();
    if (anthropicKey !== undefined) updates["ANTHROPIC_API_KEY"] = anthropicKey.trim();
    if (openrouterKey !== undefined) updates["OPENROUTER_API_KEY"] = openrouterKey.trim();
    if (defaultProvider) updates["DEFAULT_AI_PROVIDER"] = defaultProvider.trim();

    // Apply to process.env and file
    for (const [k, v] of Object.entries(updates)) {
      if (v) {
        process.env[k] = v;
        envContent = updateEnvVariable(envContent, k, v);
      }
    }

    await fs.writeFile(envPath, envContent, "utf-8");

    return NextResponse.json({
      success: true,
      message: "API keys updated successfully",
      savedKeys: Object.keys(updates),
    });
  } catch (error: any) {
    console.error("Failed to save API keys:", error);
    return NextResponse.json({ error: "Failed to persist API keys" }, { status: 500 });
  }
}
