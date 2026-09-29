"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Key,
  Check,
  ExternalLink,
  ShieldCheck,
  Bot,
  Zap,
  Globe,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onKeysUpdated?: () => void;
}

export default function AiSettingsModal({ isOpen, onClose, onKeysUpdated }: Props) {
  const [geminiKey, setGeminiKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [openrouterKey, setOpenrouterKey] = useState("");
  const [defaultProvider, setDefaultProvider] = useState("gemini");

  const [serverStatus, setServerStatus] = useState({
    gemini: false,
    openai: false,
    anthropic: false,
    openrouter: false,
  });

  const [showKeys, setShowKeys] = useState<{ [k: string]: boolean }>({});
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Load from localStorage
    if (typeof window !== "undefined") {
      setGeminiKey(localStorage.getItem("reef_gemini_api_key") || "");
      setOpenaiKey(localStorage.getItem("reef_openai_api_key") || "");
      setAnthropicKey(localStorage.getItem("reef_anthropic_api_key") || "");
      setOpenrouterKey(localStorage.getItem("reef_openrouter_api_key") || "");
      setDefaultProvider(localStorage.getItem("reef_default_ai_provider") || "gemini");
    }

    // Check server status
    fetch("/api/config/api-key")
      .then((r) => r.json())
      .then((data) => {
        if (data.providers) {
          setServerStatus(data.providers);
        }
        if (data.defaultProvider && !localStorage.getItem("reef_default_ai_provider")) {
          setDefaultProvider(data.defaultProvider);
        }
      })
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleShowKey = (id: string) => {
    setShowKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      // Save to localStorage
      if (typeof window !== "undefined") {
        if (geminiKey) localStorage.setItem("reef_gemini_api_key", geminiKey.trim());
        else localStorage.removeItem("reef_gemini_api_key");

        if (openaiKey) localStorage.setItem("reef_openai_api_key", openaiKey.trim());
        else localStorage.removeItem("reef_openai_api_key");

        if (anthropicKey) localStorage.setItem("reef_anthropic_api_key", anthropicKey.trim());
        else localStorage.removeItem("reef_anthropic_api_key");

        if (openrouterKey) localStorage.setItem("reef_openrouter_api_key", openrouterKey.trim());
        else localStorage.removeItem("reef_openrouter_api_key");

        localStorage.setItem("reef_default_ai_provider", defaultProvider);
      }

      // Persist to server
      const res = await fetch("/api/config/api-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          geminiKey: geminiKey || undefined,
          openaiKey: openaiKey || undefined,
          anthropicKey: anthropicKey || undefined,
          openrouterKey: openrouterKey || undefined,
          defaultProvider,
        }),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setServerStatus({
          gemini: Boolean(geminiKey) || serverStatus.gemini,
          openai: Boolean(openaiKey) || serverStatus.openai,
          anthropic: Boolean(anthropicKey) || serverStatus.anthropic,
          openrouter: Boolean(openrouterKey) || serverStatus.openrouter,
        });
        if (onKeysUpdated) onKeysUpdated();
        setTimeout(() => setSavedSuccess(false), 4000);
      }
    } catch (err) {
      console.error("Failed to save API keys:", err);
    } finally {
      setSaving(false);
    }
  };

  const providers = [
    {
      id: "gemini",
      name: "Google Gemini",
      tagline: "Free Multimodal Vision & Video AI (Gemini 3.8 / 2.5 Flash)",
      icon: Sparkles,
      iconColor: "text-[#00d2be]",
      value: geminiKey,
      setValue: setGeminiKey,
      placeholder: "AIzaSy...",
      isConfigured: serverStatus.gemini || Boolean(geminiKey),
      keyUrl: "https://aistudio.google.com/app/apikey",
      keyLabel: "Get Free Google Key ↗",
    },
    {
      id: "openai",
      name: "OpenAI",
      tagline: "Industry-standard Vision intelligence (GPT-4o & GPT-4o-mini)",
      icon: Bot,
      iconColor: "text-emerald-400",
      value: openaiKey,
      setValue: setOpenaiKey,
      placeholder: "sk-proj-...",
      isConfigured: serverStatus.openai || Boolean(openaiKey),
      keyUrl: "https://platform.openai.com/api-keys",
      keyLabel: "Get OpenAI Key ↗",
    },
    {
      id: "anthropic",
      name: "Anthropic Claude",
      tagline: "Detailed biological reasoning (Claude 3.5 Sonnet & Haiku)",
      icon: Zap,
      iconColor: "text-amber-400",
      value: anthropicKey,
      setValue: setAnthropicKey,
      placeholder: "sk-ant-api03-...",
      isConfigured: serverStatus.anthropic || Boolean(anthropicKey),
      keyUrl: "https://console.anthropic.com/settings/keys",
      keyLabel: "Get Anthropic Key ↗",
    },
    {
      id: "openrouter",
      name: "OpenRouter",
      tagline: "Universal routing to 100+ open & proprietary models",
      icon: Globe,
      iconColor: "text-indigo-400",
      value: openrouterKey,
      setValue: setOpenrouterKey,
      placeholder: "sk-or-v1-...",
      isConfigured: serverStatus.openrouter || Boolean(openrouterKey),
      keyUrl: "https://openrouter.ai/keys",
      keyLabel: "Get OpenRouter Key ↗",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#161e2b] border border-[#28364a] rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#28364a] pb-3.5">
          <div>
            <h3 className="text-base font-bold text-[#f0f4f8] flex items-center gap-2">
              <Key size={18} className="text-[#00d2be]" />
              AI Intelligence & Multi-Provider API Keys
            </h3>
            <p className="text-xs text-[#8e9fb5] mt-0.5">
              Connect your own API keys for species identification, live vision, and care automation.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#8e9fb5] hover:text-[#f0f4f8] hover:bg-[#0f1520] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Security & Offline Notice */}
        <div className="bg-[#0f1520] border border-[#28364a] rounded-xl p-3 flex items-start gap-2.5 text-xs text-[#8e9fb5]">
          <ShieldCheck size={16} className="text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[#f0f4f8]">Private & Secure Storage: </span>
            Keys are saved directly in your local environment (<code className="text-[#00d2be]">.env</code>) and your browser session. If no key is provided, the app seamlessly falls back to the built-in offline marine biology catalog.
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Default Active Provider Selector */}
          <div className="bg-[#0f1520] border border-[#28364a] rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <label className="text-xs font-bold text-[#f0f4f8] block">
                Primary Active AI Provider
              </label>
              <span className="text-[11px] text-[#8e9fb5]">
                Default model engine used when auto-identifying corals, fish, and invertebrates.
              </span>
            </div>
            <select
              value={defaultProvider}
              onChange={(e) => setDefaultProvider(e.target.value)}
              className="bg-[#161e2b] border border-[#28364a] text-xs text-[#f0f4f8] rounded-lg px-3 py-1.5 focus:border-[#00d2be] outline-none shrink-0"
            >
              <option value="gemini">Google Gemini (Recommended, Fast & Free Tier)</option>
              <option value="openai">OpenAI (GPT-4o Vision)</option>
              <option value="anthropic">Anthropic (Claude 3.5 Sonnet)</option>
              <option value="openrouter">OpenRouter (Universal Model Gateway)</option>
            </select>
          </div>

          {/* Providers List */}
          <div className="space-y-3">
            {providers.map((p) => {
              const Icon = p.icon;
              const isVisible = showKeys[p.id];
              return (
                <div
                  key={p.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    defaultProvider === p.id
                      ? "bg-[#0f1520] border-[#00d2be]/50 shadow-sm"
                      : "bg-[#0f1520]/60 border-[#28364a]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon size={16} className={p.iconColor} />
                      <span className="text-xs font-bold text-[#f0f4f8]">{p.name}</span>
                      {defaultProvider === p.id && (
                        <span className="text-[10px] bg-[#00d2be]/20 text-[#00d2be] border border-[#00d2be]/30 px-1.5 py-0.2 rounded font-bold">
                          Primary
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {p.isConfigured ? (
                        <span className="text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                          <Check size={11} /> Configured
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#8e9fb5] bg-[#161e2b] px-2 py-0.5 rounded border border-[#28364a]">
                          Not set
                        </span>
                      )}
                      <a
                        href={p.keyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-[#00d2be] hover:underline flex items-center gap-1 ml-1"
                      >
                        {p.keyLabel}
                      </a>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#8e9fb5] mb-2">{p.tagline}</p>

                  <div className="relative flex items-center">
                    <input
                      type={isVisible ? "text" : "password"}
                      placeholder={`Enter ${p.name} API Key (${p.placeholder})`}
                      value={p.value}
                      onChange={(e) => p.setValue(e.target.value)}
                      className="w-full bg-[#161e2b] border border-[#28364a] rounded-lg pl-3 pr-10 py-1.5 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey(p.id)}
                      className="absolute right-2 text-[#8e9fb5] hover:text-[#f0f4f8] p-1"
                      title={isVisible ? "Hide Key" : "Show Key"}
                    >
                      {isVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {savedSuccess && (
            <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <Check size={14} className="text-emerald-400" />
              API keys and preferences saved successfully! Active across all vaults.
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#28364a]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#0f1520] text-[#8e9fb5] hover:text-[#f0f4f8] border border-[#28364a]"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-bold rounded-lg bg-[#00d2be] text-[#0d121a] hover:bg-[#14ebd7] flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-md"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              {saving ? "Saving Keys..." : "Save All API Keys"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
