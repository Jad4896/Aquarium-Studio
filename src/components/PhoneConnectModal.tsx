"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Smartphone,
  Wifi,
  Copy,
  Check,
  QrCode,
  ShieldAlert,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Share,
  Sparkles,
  RefreshCw,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface NetworkInfo {
  primaryIp: string;
  port: number | string;
  fullUrl: string;
  allAddresses?: { name: string; ip: string }[];
}

export default function PhoneConnectModal({ isOpen, onClose }: Props) {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
    primaryIp: "localhost",
    port: 3000,
    fullUrl: "Detecting your PC address...",
  });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);
  const [qrError, setQrError] = useState(false);

  const fetchNetworkInfo = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/network-info");
      if (res.ok) {
        const data = await res.json();
        if (data.fullUrl) {
          setNetworkInfo(data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch network info:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNetworkInfo();
    }
  }, [isOpen]);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(networkInfo.fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isReady = !loading && Boolean(networkInfo?.fullUrl && networkInfo.fullUrl.startsWith("http"));
  const displayUrl = isReady ? networkInfo.fullUrl : "Detecting local address...";
  const qrUrl = isReady
    ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
        displayUrl
      )}&bgcolor=14-22-34&color=00-d2-be`
    : "";

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="bg-[#101622] border border-[#233144] hover:border-[#00d2be]/40 rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto overscroll-contain transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#233144] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#00d2be]/15 border border-[#00d2be]/30 flex items-center justify-center text-[#00d2be] shrink-0 shadow-[0_0_12px_rgba(0,210,190,0.25)]">
              <Smartphone size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#f0f4f8] flex items-center gap-2">
                <span>Connect Phone to Aquarium Studio</span>
              </h3>
              <p className="text-[11px] text-[#8e9fb5]">
                Control and monitor your tank anywhere on your local Wi-Fi
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8e9fb5] hover:text-[#f0f4f8] hover:bg-white/5 transition-colors cursor-pointer"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Hero Connection Card */}
        <div className="bg-[#0b1018] border border-[#233144] rounded-xl p-3.5 sm:p-4 mb-4 shadow-inner">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#00d2be] flex items-center gap-1.5">
              <Wifi size={12} className="animate-pulse" />
              <span>Your Local PC Webapp URL</span>
            </span>
            <button
              type="button"
              onClick={fetchNetworkInfo}
              className="text-[10px] text-[#8e9fb5] hover:text-[#00d2be] flex items-center gap-1 transition-colors cursor-pointer"
              title="Refresh IP detection"
            >
              <RefreshCw size={10} className={loading ? "animate-spin" : ""} />
              <span>Detect</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 bg-[#141d2b] border border-[#28394e] p-2.5 rounded-lg">
            {/* Direct URL field */}
            <div className="flex-1 w-full min-w-0">
              <span className="text-[10px] text-[#8e9fb5] block mb-0.5">
                Type this into your phone&apos;s browser:
              </span>
              <div className="font-mono text-sm sm:text-base font-bold text-[#f0f4f8] truncate select-all">
                {displayUrl}
              </div>
            </div>

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopyUrl}
              disabled={loading || !isReady}
              className={`w-full sm:w-auto px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-sm disabled:opacity-50 ${
                copied
                  ? "bg-emerald-500 text-[#070d14] shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                  : "bg-[#00d2be] hover:bg-[#14ebd7] text-[#070d14] shadow-[0_0_12px_rgba(0,210,190,0.35)] hover:shadow-[0_0_18px_rgba(0,210,190,0.55)]"
              }`}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? "Copied!" : "Copy Link"}</span>
            </button>
          </div>

          {/* QR Code Quick Scan Option */}
          <div className="mt-3 pt-3 border-t border-[#1c293a] flex flex-col sm:flex-row items-center gap-3">
            <div className="w-24 h-24 rounded-lg bg-[#142234] border border-[#283c55] flex items-center justify-center overflow-hidden shrink-0 shadow-sm relative">
              {loading ? (
                <div className="flex flex-col items-center justify-center gap-1 text-[#8e9fb5] text-[9px]">
                  <RefreshCw size={18} className="animate-spin text-[#00d2be]" />
                  <span>Detecting...</span>
                </div>
              ) : isReady && !qrError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrUrl}
                  alt="QR Code for phone connection"
                  width={96}
                  height={96}
                  onError={() => setQrError(true)}
                  className="rounded"
                />
              ) : (
                <div className="text-center p-1 text-[#8e9fb5] text-[9px]">
                  <QrCode size={24} className="mx-auto mb-1 text-[#00d2be]" />
                  <span>Type link manually</span>
                </div>
              )}
            </div>
            <div className="text-left flex-1 min-w-0">
              <span className="text-xs font-semibold text-[#f0f4f8] flex items-center gap-1.5">
                <QrCode size={13} className="text-[#00d2be]" />
                <span>Instant Camera Scan</span>
              </span>
              <p className="text-[11px] text-[#8e9fb5] mt-1 leading-relaxed">
                Open your phone's default <strong>Camera app</strong>, point it at this QR code, and tap the prompt to open Aquarium Studio instantly.
              </p>
            </div>
          </div>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="space-y-3 mb-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#8e9fb5]">
            Quick 3-Step Setup
          </h4>

          {/* Step 1 */}
          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#0f1622] border border-[#1e2a3c]">
            <div className="w-6 h-6 rounded-lg bg-[#00d2be]/20 text-[#00d2be] font-bold text-xs flex items-center justify-center shrink-0">
              1
            </div>
            <div>
              <span className="text-xs font-bold text-[#f0f4f8] block">
                Connect Phone to Same Wi-Fi
              </span>
              <p className="text-[11px] text-[#8e9fb5] mt-0.5 leading-relaxed">
                Make sure your phone or tablet is connected to the same Wi-Fi router as this computer (not mobile data).
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#0f1622] border border-[#1e2a3c]">
            <div className="w-6 h-6 rounded-lg bg-[#00d2be]/20 text-[#00d2be] font-bold text-xs flex items-center justify-center shrink-0">
              2
            </div>
            <div>
              <span className="text-xs font-bold text-[#f0f4f8] block">
                Open in Safari or Chrome
              </span>
              <p className="text-[11px] text-[#8e9fb5] mt-0.5 leading-relaxed">
                Open Safari on iPhone or Chrome on Android and enter{" "}
                <span className="text-[#00d2be] font-mono font-semibold">
                  {displayUrl}
                </span>
                .
              </p>
            </div>
          </div>

          {/* Step 3: Add to Home Screen (PWA App Mode) */}
          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#0f1622] border border-[#1e2a3c]">
            <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 font-bold text-xs flex items-center justify-center shrink-0">
              3
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#f0f4f8]">
                  Install as App (Full-Screen Mode)
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-semibold">
                  Recommended
                </span>
              </div>
              <p className="text-[11px] text-[#8e9fb5] mt-0.5 leading-relaxed">
                <strong>iPhone (Safari):</strong> Tap the <strong>Share button</strong>, scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong>.
                <br />
                <strong>Android (Chrome):</strong> Tap the <strong>three dots (⋮)</strong> menu and tap <strong>&quot;Add to Home screen&quot;</strong> or <strong>&quot;Install app&quot;</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Troubleshooting Collapsible */}
        <div className="border border-[#233144] rounded-xl overflow-hidden mb-4 bg-[#0a0f16]">
          <button
            type="button"
            onClick={() => setShowTroubleshoot(!showTroubleshoot)}
            className="w-full flex items-center justify-between p-3 text-xs font-semibold text-[#8e9fb5] hover:text-[#f0f4f8] transition-colors cursor-pointer select-none"
          >
            <span className="flex items-center gap-1.5 text-[#e5a93c]">
              <ShieldAlert size={14} />
              <span>Cannot connect or phone says &quot;Site can&apos;t be reached&quot;?</span>
            </span>
            {showTroubleshoot ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showTroubleshoot && (
            <div className="p-3 pt-0 text-[11px] text-[#8e9fb5] space-y-2 border-t border-[#1c2838] bg-[#0c121c]">
              <div>
                <strong className="text-[#f0f4f8] block">1. Windows Firewall Access:</strong>
                Windows Firewall may block inbound traffic to port 3000 by default. Make sure Node.js is allowed on &quot;Private Networks&quot; in Windows Security, or run this in an Administrator command prompt:
                <code className="block bg-[#05080e] border border-[#1b2533] p-1.5 rounded text-[10px] font-mono text-cyan-300 mt-1 select-all">
                  netsh advfirewall firewall add rule name=&quot;AquariumStudio&quot; dir=in action=allow protocol=TCP localport=3000
                </code>
              </div>
              <div>
                <strong className="text-[#f0f4f8] block">2. PC Sleep Mode:</strong>
                The webapp runs directly on your computer. If your PC goes to sleep, your phone won&apos;t be able to connect until it wakes up.
              </div>
              <div>
                <strong className="text-[#f0f4f8] block">3. Wi-Fi Isolation / Guest Network:</strong>
                Ensure both your PC and phone are on your standard home network, not a Guest Wi-Fi with client isolation enabled.
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 text-xs font-bold rounded-xl bg-[#00d2be] hover:bg-[#14ebd7] text-[#080d14] shadow-md hover:shadow-[0_0_15px_rgba(0,210,190,0.45)] transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
