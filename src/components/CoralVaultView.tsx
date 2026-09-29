"use client";

import React, { useState, useEffect } from "react";
import { Livestock } from "@/types";
import {
  Sparkles,
  PlusCircle,
  Search,
  SlidersHorizontal,
  Image as ImageIcon,
  Trash2,
  Upload,
  Layers,
  MapPin,
  X,
  Sun,
  ShieldAlert,
  Utensils,
  Key,
  Check,
  Loader2,
  Info,
  Edit3,
  Video,
  Settings,
  Sprout,
  Calendar,
  Clock,
  Star,
  ArrowRight,
  Activity,
} from "lucide-react";
import GrowthSlider from "./GrowthSlider";
import AiSettingsModal from "./AiSettingsModal";
import HoverVideo from "./HoverVideo";
import EnlargeableImage from "./EnlargeableImage";
import { useMediaLightbox } from "@/context/MediaLightboxContext";

export const GROWTH_TYPE_PRESETS = [
  "Encrusting",
  "Calcium carbonate skeleton building (Branching)",
  "Calcium carbonate skeleton building (Plating)",
  "Calcium carbonate skeleton building (Massive / Brain)",
  "Runners / Stolons",
  "Root / Basal Foot",
];

export const PLANT_GROWTH_PRESETS = [
  "Runners / Stolons (Horizontal carpeting)",
  "Stem Nodes / Cuttings (Vertical stems)",
  "Rhizome division (Wood / rock attachment)",
  "Branching thalli / Spores (Moss cushions)",
  "Crown division / Offshoots (Rosette)",
  "Floating surface propagation",
];

export const getCoralGrowthTypeFallback = (coral: {
  growthType?: string | null;
  category?: string;
  species?: string;
  name?: string;
}): string => {
  if (coral.growthType && coral.growthType.trim().length > 0) {
    return coral.growthType;
  }
  const cat = (coral.category || "").toLowerCase();
  const name = `${coral.name || ""} ${coral.species || ""}`.toLowerCase();
  if (cat.includes("carpet") || name.includes("monte carlo") || name.includes("cuba") || name.includes("hairgrass")) {
    return "Runners / Stolons (Horizontal carpeting spreading)";
  }
  if (cat.includes("stem") || name.includes("rotala") || name.includes("ludwigia")) {
    return "Stem Nodes / Cuttings (Vertical columnar propagation)";
  }
  if (cat.includes("epiphyte") || name.includes("buce") || name.includes("anubias") || name.includes("fern")) {
    return "Rhizome division (Slow epiphytic attachment)";
  }
  if (cat.includes("moss") || name.includes("moss")) {
    return "Branching thalli / Spores (Dense moss cushion)";
  }
  if (name.includes("montipora") || name.includes("plating") || name.includes("chalice")) {
    return "Encrusting / Calcium carbonate plating skeleton";
  }
  if (cat.includes("sps") || name.includes("acropora") || name.includes("stylophora") || name.includes("seriatopora")) {
    return "Calcium carbonate skeleton building (Branching & encrusting base)";
  }
  if (name.includes("zoanthid") || name.includes("palythoa") || name.includes("gsp") || name.includes("star polyp")) {
    return "Runners / Stolons (Mat-forming connective tissue)";
  }
  if (name.includes("mushroom") || name.includes("ricordea") || name.includes("discosoma") || name.includes("toadstool") || name.includes("leather")) {
    return "Root / Basal Foot (Fleshy expanding soft tissue)";
  }
  if (cat.includes("lps") || name.includes("torch") || name.includes("hammer") || name.includes("frogspawn") || name.includes("acan") || name.includes("duncan")) {
    return "Calcium carbonate skeleton building (Massive / Wall / Branching)";
  }
  if (cat.includes("soft")) {
    return "Runners & fleshy basal foot";
  }
  return "Encrusting & skeletal accretion";
};

const captureVideoFrame = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    try {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.muted = true;
      video.playsInline = true;
      const url = URL.createObjectURL(file);
      video.src = url;

      let resolved = false;
      const done = (result: string) => {
        if (!resolved) {
          resolved = true;
          try {
            URL.revokeObjectURL(url);
          } catch {}
          resolve(result);
        }
      };

      const timeout = setTimeout(() => done(""), 4500);

      video.onloadedmetadata = () => {
        try {
          const seekTime = video.duration && video.duration > 0.5 ? Math.min(1.0, video.duration / 2) : 0.1;
          video.currentTime = seekTime;
        } catch {
          done("");
        }
      };

      video.onseeked = () => {
        clearTimeout(timeout);
        try {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
            done(dataUrl);
            return;
          }
        } catch {
          // ignore canvas extraction error
        }
        done("");
      };

      video.onerror = () => {
        clearTimeout(timeout);
        done("");
      };
    } catch {
      resolve("");
    }
  });
};


interface Props {
  corals: Livestock[];
  tankId: string;
  tank?: any;
  onAddCoral: (data: any) => Promise<void>;
  onUpdateCoral: (id: string, data: any) => Promise<void>;
  onDeleteCoral: (id: string) => Promise<void>;
  onOpenHealthDiagnostics?: () => void;
}

export default function CoralVaultView({
  corals,
  tankId,
  tank,
  onAddCoral,
  onUpdateCoral,
  onDeleteCoral,
  onOpenHealthDiagnostics,
}: Props) {
  const isFreshwater = tank?.tankType === "FRESHWATER";
  const { openMedia } = useMediaLightbox();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [inspectCoral, setInspectCoral] = useState<Livestock | null>(null);
  const [sliderCoral, setSliderCoral] = useState<Livestock | null>(null);

  // New coral form state
  const [formData, setFormData] = useState({
    name: "",
    species: "",
    category: "LPS",
    growthType: "Calcium carbonate skeleton building (Branching)",
    zone: "Mid-level / Moderate Flow",
    lighting: "PAR 150 - 250 (Moderate Lighting)",
    aggressiveness: "Moderate: Maintain 3-4 inch clearance from adjacent corals",
    diet: "Photosynthetic zooxanthellae; broadcast coral aminos weekly",
    notes: "",
    primaryPhotoUrl: "",
    primaryVideoUrl: "",
    beforePhotoUrl: "",
    afterPhotoUrl: "",
  });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [identifying, setIdentifying] = useState(false);
  const [identifyingByName, setIdentifyingByName] = useState(false);
  // Multi-Provider AI State
  const [aiProvider, setAiProvider] = useState("gemini");
  const [activeApiKey, setActiveApiKey] = useState("");
  const [showAiModal, setShowAiModal] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [identificationStatus, setIdentificationStatus] = useState<string | null>(null);

  // Profile Edit State for Inspect Modal
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editIdentifyingByName, setEditIdentifyingByName] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    species: "",
    category: "LPS",
    growthType: "",
    zone: "",
    lighting: "",
    aggressiveness: "",
    diet: "",
    notes: "",
    primaryPhotoUrl: "",
    primaryVideoUrl: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editIdentifying, setEditIdentifying] = useState(false);
  const [editIdentificationStatus, setEditIdentificationStatus] = useState<string | null>(null);
  const [editUploading, setEditUploading] = useState(false);

  // Dedicated Milestones State
  const [milestoneCoral, setMilestoneCoral] = useState<Livestock | null>(null);

  // Gallery multi-upload state in Edit Profile
  const [galleryFiles, setGalleryFiles] = useState<FileList | null>(null);
  const [galleryCaption, setGalleryCaption] = useState("");
  const [gallerySetAsPrimary, setGallerySetAsPrimary] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [galleryStatusMsg, setGalleryStatusMsg] = useState<string | null>(null);

  // Milestone page upload & state
  const [milestoneDate, setMilestoneDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [milestoneCaption, setMilestoneCaption] = useState("");
  const [milestoneIsBefore, setMilestoneIsBefore] = useState(false);
  const [milestoneIsAfter, setMilestoneIsAfter] = useState(false);
  const [milestoneFile, setMilestoneFile] = useState<File | null>(null);
  const [uploadingMilestone, setUploadingMilestone] = useState(false);
  const [milestoneStatusMsg, setMilestoneStatusMsg] = useState<string | null>(null);

  // Sync AI Keys & Provider from localStorage and server .env
  const syncAiKeysAndProvider = () => {
    if (typeof window !== "undefined") {
      const savedProvider = localStorage.getItem("reef_default_ai_provider") || "gemini";
      setAiProvider(savedProvider);

      let key = "";
      if (savedProvider === "openai") key = localStorage.getItem("reef_openai_api_key") || "";
      else if (savedProvider === "anthropic") key = localStorage.getItem("reef_anthropic_api_key") || "";
      else if (savedProvider === "openrouter") key = localStorage.getItem("reef_openrouter_api_key") || "";
      else key = localStorage.getItem("reef_gemini_api_key") || "";

      if (key) {
        setActiveApiKey(key);
      } else {
        fetch("/api/config/api-key")
          .then((r) => r.json())
          .then((d) => {
            if (d.providers?.[savedProvider] || d.hasKey) {
              setActiveApiKey("env_configured");
            }
          })
          .catch(() => {});
      }
    }
  };

  useEffect(() => {
    syncAiKeysAndProvider();
  }, []);

  // Sync active coral modals with latest parent corals prop
  useEffect(() => {
    if (inspectCoral) {
      const fresh = corals.find((c) => c.id === inspectCoral.id);
      if (fresh) setInspectCoral(fresh);
    }
    if (milestoneCoral) {
      const fresh = corals.find((c) => c.id === milestoneCoral.id);
      if (fresh) setMilestoneCoral(fresh);
    }
    if (sliderCoral) {
      const fresh = corals.find((c) => c.id === sliderCoral.id);
      if (fresh) setSliderCoral(fresh);
    }
  }, [corals]);

  // Handle ESC key to close active modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (milestoneCoral) setMilestoneCoral(null);
        else if (sliderCoral) setSliderCoral(null);
        else if (inspectCoral) {
          setInspectCoral(null);
          setIsEditingProfile(false);
        } else if (showAddModal) setShowAddModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [milestoneCoral, sliderCoral, inspectCoral, showAddModal]);

  const handleProviderChange = (provider: string) => {
    setAiProvider(provider);
    if (typeof window !== "undefined") {
      localStorage.setItem("reef_default_ai_provider", provider);
      let key = "";
      if (provider === "openai") key = localStorage.getItem("reef_openai_api_key") || "";
      else if (provider === "anthropic") key = localStorage.getItem("reef_anthropic_api_key") || "";
      else if (provider === "openrouter") key = localStorage.getItem("reef_openrouter_api_key") || "";
      else key = localStorage.getItem("reef_gemini_api_key") || "";

      if (key) {
        setActiveApiKey(key);
      } else {
        fetch("/api/config/api-key")
          .then((r) => r.json())
          .then((d) => {
            if (d.providers?.[provider]) {
              setActiveApiKey("env_configured");
            } else {
              setActiveApiKey("");
            }
          })
          .catch(() => {});
      }
    }
  };

  const handleSaveApiKey = async (key: string, providerToSave?: string) => {
    const targetProvider = providerToSave || aiProvider;
    const trimmed = key.trim();
    setActiveApiKey(trimmed);
    if (typeof window !== "undefined") {
      if (targetProvider === "openai") localStorage.setItem("reef_openai_api_key", trimmed);
      else if (targetProvider === "anthropic") localStorage.setItem("reef_anthropic_api_key", trimmed);
      else if (targetProvider === "openrouter") localStorage.setItem("reef_openrouter_api_key", trimmed);
      else localStorage.setItem("reef_gemini_api_key", trimmed);
    }
    if (trimmed && trimmed !== "env_configured") {
      try {
        await fetch("/api/config/api-key", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ provider: targetProvider, apiKey: trimmed }),
        });
      } catch (e) {
        console.warn("Could not save API key to server", e);
      }
    }
  };

  const handleFileUpload = async (file: File): Promise<string | null> => {
    const data = new FormData();
    data.append("file", file);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });
      const result = await res.json();
      if (result.url) {
        return result.url;
      }
      return null;
    } catch (e) {
      console.error("Upload failed", e);
      return null;
    }
  };

  // Open Inspect Modal directly into Edit Mode
  const handleStartEdit = (coral: Livestock) => {
    setInspectCoral(coral);
    setIsEditingProfile(true);
    setEditFormData({
      name: coral.name || "",
      species: coral.species || "",
      category: coral.category === "Zoanthid" || coral.category === "Mushroom" ? "Soft Coral" : coral.category || "LPS",
      growthType: coral.growthType || getCoralGrowthTypeFallback(coral),
      zone: coral.zone || "",
      lighting: coral.lighting || "",
      aggressiveness: coral.aggressiveness || "",
      diet: coral.diet || "",
      notes: coral.notes || "",
      primaryPhotoUrl: coral.primaryPhotoUrl || "",
      primaryVideoUrl: coral.primaryVideoUrl || "",
    });
    setEditIdentificationStatus(null);
  };

  // Save edited profile back to DB and update inspectCoral state
  const handleSaveEdit = async () => {
    if (!inspectCoral) return;
    setSavingEdit(true);
    try {
      await onUpdateCoral(inspectCoral.id, editFormData);
      setInspectCoral((prev) => (prev ? { ...prev, ...editFormData } : null));
      setIsEditingProfile(false);
    } catch (err) {
      console.error("Failed to save edited coral profile:", err);
      setEditIdentificationStatus("Failed to save profile changes. Please try again.");
    } finally {
      setSavingEdit(false);
    }
  };

  // Upload multiple general photos / videos in Edit Profile
  const handleUploadGalleryMedia = async (coralId: string) => {
    if (!galleryFiles || galleryFiles.length === 0) return;
    setUploadingGallery(true);
    setGalleryStatusMsg(null);
    try {
      let uploadedCount = 0;
      for (let i = 0; i < galleryFiles.length; i++) {
        const file = galleryFiles[i];
        const isVideo = file.type.startsWith("video/");
        const url = await handleFileUpload(file);
        if (url) {
          await onUpdateCoral(coralId, {
            action: "add_media",
            url,
            mediaType: isVideo ? "video" : "image",
            caption: galleryCaption.trim() || (isVideo ? "Specimen Video" : "Specimen Photo"),
            isMilestone: false,
            setAsPrimary: gallerySetAsPrimary && i === 0,
          });
          uploadedCount++;
        }
      }
      setGalleryStatusMsg(`✓ Successfully added ${uploadedCount} media file(s) to specimen!`);
      setGalleryFiles(null);
      setGalleryCaption("");
      setGallerySetAsPrimary(false);
      const inputEl = document.getElementById("coral-gallery-file-input") as HTMLInputElement | null;
      if (inputEl) inputEl.value = "";
      setTimeout(() => setGalleryStatusMsg(null), 4000);
    } catch (err) {
      console.error("Gallery upload error:", err);
      setGalleryStatusMsg("Failed to upload media. Please try again.");
    } finally {
      setUploadingGallery(false);
    }
  };

  // Set media as primary cover photo or video
  const handleSetPrimaryMedia = async (coralId: string, url: string, mediaType: "image" | "video") => {
    try {
      await onUpdateCoral(coralId, {
        action: "set_primary_media",
        url,
        mediaType,
      });
      if (mediaType === "video") {
        setEditFormData((prev) => ({ ...prev, primaryVideoUrl: url }));
      } else {
        setEditFormData((prev) => ({ ...prev, primaryPhotoUrl: url }));
      }
      setGalleryStatusMsg(`✓ Set as primary cover ${mediaType}!`);
      setTimeout(() => setGalleryStatusMsg(null), 3000);
    } catch (err) {
      console.error("Failed to set cover media:", err);
    }
  };

  // Delete media item
  const handleDeleteMedia = async (coralId: string, mediaId: string) => {
    if (!confirm("Are you sure you want to delete this media item?")) return;
    try {
      await onUpdateCoral(coralId, {
        action: "delete_media",
        mediaId,
      });
      setGalleryStatusMsg("✓ Media item deleted.");
      setTimeout(() => setGalleryStatusMsg(null), 3000);
    } catch (err) {
      console.error("Failed to delete media:", err);
    }
  };

  // Set or unset Before/After growth tag on a media item
  const handleToggleGrowthTag = async (coralId: string, mediaId: string, tag: "before" | "after", currentValue: boolean) => {
    try {
      await onUpdateCoral(coralId, {
        action: "set_growth_tag",
        mediaId,
        isBefore: tag === "before" ? !currentValue : undefined,
        isAfter: tag === "after" ? !currentValue : undefined,
      });
    } catch (err) {
      console.error("Failed to update growth tag:", err);
    }
  };

  // AI Species Identification (Supports Photo or Video, in Add and Edit modes across all providers)
  const handleAutoIdentify = async (mediaUrlToUse?: string, isForEdit: boolean = false) => {
    const currentData = isForEdit ? editFormData : formData;
    const targetMedia = mediaUrlToUse || currentData.primaryPhotoUrl || currentData.primaryVideoUrl;
    const setStatus = isForEdit ? setEditIdentificationStatus : setIdentificationStatus;
    const setIdentifyingState = isForEdit ? setEditIdentifying : setIdentifying;
    const updateFormData = isForEdit ? setEditFormData : setFormData;

    if (!targetMedia) {
      setStatus("⚠️ Please choose or upload a coral photo or video first.");
      setTimeout(() => setStatus(null), 4000);
      return;
    }

    if (!activeApiKey) {
      setStatus(`⚠️ Please enter your ${aiProvider.toUpperCase()} API Key above or click 'All AI Keys' to configure.`);
      return;
    }

    setIdentifyingState(true);
    setStatus(
      isFreshwater
        ? `Analyzing aquatic plant morphology & foliage with ${aiProvider.toUpperCase()} AI...`
        : `Analyzing coral polyps, skeleton & morphology with ${aiProvider.toUpperCase()} AI...`
    );
    try {
      const isVideo = (currentData.primaryVideoUrl && targetMedia === currentData.primaryVideoUrl) ||
        targetMedia.endsWith(".mp4") || targetMedia.endsWith(".webm") || targetMedia.endsWith(".mov") || targetMedia.endsWith(".m4v");

      // Extract clean base64 image frame if available (from video canvas capture or photo upload)
      const candidateDataUrl = targetMedia.startsWith("data:")
        ? targetMedia
        : currentData.primaryPhotoUrl?.startsWith("data:")
        ? currentData.primaryPhotoUrl
        : undefined;

      const rawBase64 = candidateDataUrl
        ? candidateDataUrl.substring(candidateDataUrl.indexOf(",") + 1).trim()
        : undefined;

      const res = await fetch("/api/identify-livestock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoUrl: isVideo ? undefined : (targetMedia.startsWith("data:") ? undefined : targetMedia),
          videoUrl: currentData.primaryVideoUrl || (isVideo ? targetMedia : undefined),
          imageBase64: rawBase64,
          type: isFreshwater ? "PLANT" : "CORAL",
          provider: aiProvider,
          apiKey: activeApiKey === "env_configured" ? undefined : activeApiKey,
          hint: currentData.name || undefined,
        }),
      });
      const data = await res.json();
      if (data.identified) {
        const idData = data.identified;
        // Strictly categorize Zoanthids and Mushrooms into Soft Coral
        const normalizedCategory =
          idData.category === "Zoanthid" || idData.category === "Mushroom"
            ? "Soft Coral"
            : idData.category || prevCat(currentData.category);

        updateFormData((prev: any) => ({
          ...prev,
          name: idData.name || prev.name,
          species: idData.species || prev.species,
          category: normalizedCategory,
          growthType:
            idData.growthType ||
            prev.growthType ||
            getCoralGrowthTypeFallback({
              name: idData.name,
              category: normalizedCategory,
              species: idData.species,
            }),
          zone: idData.zone || prev.zone,
          lighting: idData.lighting || prev.lighting || "",
          aggressiveness: idData.aggressiveness || prev.aggressiveness || "",
          diet: idData.diet || prev.diet || "",
          notes: idData.notes || prev.notes || "",
        }));

        const providerLabel =
          data.source === "openai-gpt-4o"
            ? "OpenAI GPT-4o"
            : data.source === "claude-3-5-sonnet"
            ? "Claude 3.5 Sonnet"
            : data.source === "openrouter"
            ? "OpenRouter AI"
            : "Gemini AI";

        setStatus(`✨ Successfully identified by ${providerLabel}: ${idData.name}`);
      } else {
        setStatus(data.error || "Could not identify specimen. Please check your API key.");
      }
    } catch (err: any) {
      console.error("Auto identify failed", err);
      setStatus("Identification request failed. Please check network or API key.");
    } finally {
      setIdentifyingState(false);
      setTimeout(() => setStatus(null), 6000);
    }
  };

  function prevCat(existingCat: string) {
    if (existingCat === "Zoanthid" || existingCat === "Mushroom") return "Soft Coral";
    return existingCat || "LPS";
  }

  // Name-Based AI Identification & Autofill for Corals
  const handleIdentifyByName = async (isForEdit: boolean = false) => {
    const currentData = isForEdit ? editFormData : formData;
    const nameToQuery = currentData.name?.trim();
    const setStatus = isForEdit ? setEditIdentificationStatus : setIdentificationStatus;
    const setIdentifyingState = isForEdit ? setEditIdentifyingByName : setIdentifyingByName;
    const updateFormData = isForEdit ? setEditFormData : setFormData;

    if (!nameToQuery) {
      setStatus("⚠️ Please enter a coral morph / trade name first to identify.");
      setTimeout(() => setStatus(null), 4000);
      return;
    }

    setIdentifyingState(true);
    setStatus(`Looking up '${nameToQuery}' coral husbandry & profile with ${aiProvider.toUpperCase()} AI...`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const res = await fetch("/api/identify-livestock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commonName: nameToQuery,
          name: nameToQuery,
          type: isFreshwater ? "PLANT" : "CORAL",
          provider: aiProvider,
          apiKey: activeApiKey === "env_configured" ? undefined : activeApiKey,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      if (data.identified) {
        const idData = data.identified;
        const normalizedCategory =
          idData.category === "Zoanthid" || idData.category === "Mushroom"
            ? "Soft Coral"
            : idData.category || prevCat(currentData.category);

        // Standalone name-based identification:
        // 1. Strictly preserve the user's input name in the text box (e.g. "gobstopper" remains "gobstopper")
        // 2. Overwrite all profile fields cleanly without falling back to stale data from previous identifications
        updateFormData((prev: any) => ({
          ...prev,
          name: nameToQuery,
          species: idData.species || "",
          category: normalizedCategory,
          growthType:
            idData.growthType ||
            getCoralGrowthTypeFallback({
              name: nameToQuery,
              category: normalizedCategory,
              species: idData.species,
            }),
          zone: idData.zone || "",
          lighting: idData.lighting || "",
          aggressiveness: idData.aggressiveness || "",
          diet: idData.diet || "",
          notes: idData.notes || "",
        }));

        const providerLabel =
          data.source === "openai-gpt-4o"
            ? "OpenAI GPT-4o"
            : data.source === "claude-3-5-sonnet"
            ? "Claude 3.5 Sonnet"
            : data.source === "openrouter"
            ? "OpenRouter AI"
            : data.source === "marine-catalog"
            ? "Species Engine"
            : "Gemini AI";

        setStatus(`✨ Profile auto-filled for '${nameToQuery}' by ${providerLabel}!`);
      } else {
        setStatus(data.error || "Could not generate profile for this specimen. Please check your API key.");
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error("Identify by name failed", err);
      if (err.name === "AbortError") {
        setStatus("⏱️ Lookup timed out after 12s. Please check network or try again.");
      } else {
        setStatus("Specimen profile lookup request failed. Please check network or API key.");
      }
    } finally {
      setIdentifyingState(false);
      setTimeout(() => setStatus(null), 6000);
    }
  };

  const handleCreateCoral = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onAddCoral({
        tankId,
        type: isFreshwater ? "PLANT" : "CORAL",
        ...formData,
      });
      setShowAddModal(false);
      setFormData({
        name: "",
        species: "",
        category: isFreshwater ? "Carpeting" : "LPS",
        growthType: isFreshwater ? "Runners / Stolons (Horizontal carpeting)" : "Calcium carbonate skeleton building (Branching)",
        zone: isFreshwater ? "Foreground carpeting zone" : "Mid-level / Moderate Flow",
        lighting: isFreshwater ? "Medium to High Light (PAR 50 - 100)" : "PAR 150 - 250 (Moderate Lighting)",
        aggressiveness: isFreshwater ? "Moderate growth rate; requires periodic trimming" : "Moderate: Maintain 3-4 inch clearance from adjacent corals",
        diet: isFreshwater ? "Substrate root tabs & column liquid fertilizer" : "Photosynthetic zooxanthellae; broadcast coral aminos weekly",
        notes: "",
        primaryPhotoUrl: "",
        primaryVideoUrl: "",
        beforePhotoUrl: "",
        afterPhotoUrl: "",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneCoral || !milestoneFile) return;

    setUploadingMilestone(true);
    setMilestoneStatusMsg(null);
    try {
      const uploadedUrl = await handleFileUpload(milestoneFile);
      if (uploadedUrl) {
        const isVideo = milestoneFile.type.startsWith("video/");
        await onUpdateCoral(milestoneCoral.id, {
          action: "add_media",
          url: uploadedUrl,
          mediaType: isVideo ? "video" : "image",
          caption: milestoneCaption.trim() || "Growth Milestone",
          isBefore: milestoneIsBefore,
          isAfter: milestoneIsAfter,
          isMilestone: true,
          date: milestoneDate,
        });

        // Reset form
        setMilestoneCaption("");
        setMilestoneFile(null);
        setMilestoneIsBefore(false);
        setMilestoneIsAfter(false);
        const fileInput = document.getElementById("coral-milestone-file-input") as HTMLInputElement | null;
        if (fileInput) fileInput.value = "";
        setMilestoneStatusMsg("✓ Milestone recorded successfully!");
        setTimeout(() => setMilestoneStatusMsg(null), 4000);
      }
    } catch (err) {
      console.error(err);
      setMilestoneStatusMsg("Failed to upload milestone. Please try again.");
    } finally {
      setUploadingMilestone(false);
    }
  };

  const filteredCorals = corals.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.species.toLowerCase().includes(search.toLowerCase()) ||
      (c.zone || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.lighting || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.aggressiveness || "").toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      (selectedCategory === "Soft Coral"
        ? (c.category === "Soft Coral" || c.category === "Zoanthid" || c.category === "Mushroom")
        : c.category === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#161e2b] border border-[#28364a] p-4 rounded-xl shadow-lg">
        <div>
          <h2 className="text-lg font-bold text-[#f0f4f8] flex items-center gap-2">
            {isFreshwater ? (
              <Sprout className="text-emerald-400" size={20} />
            ) : (
              <Sparkles className="text-[#00d2be]" size={20} />
            )}
            {isFreshwater ? "Aquatic Flora & Plant Vault" : "Coral Identification & Growth Vault"}
          </h2>
          <p className="text-xs text-[#8e9fb5] mt-0.5">
            {isFreshwater
              ? "Aquatic plant species identification, aquascaping placement, CO2 & PAR requirements, and trimming growth milestones."
              : "AI-powered coral species identification, flow & PAR requirements, warfare aggressiveness, and growth milestones."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowApiKeyInput(!showApiKeyInput)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0f1520] hover:bg-[#1a2333] border border-[#28364a] text-xs font-medium text-[#8e9fb5] hover:text-[#f0f4f8] transition-all"
            title="Configure Vision AI Provider & API Keys"
          >
            <Key size={14} className={activeApiKey ? "text-[#00d2be]" : "text-[#8e9fb5]"} />
            {activeApiKey ? `${aiProvider.toUpperCase()} Active` : "Configure AI Keys"}
          </button>

          {onOpenHealthDiagnostics && (
            <button
              type="button"
              onClick={onOpenHealthDiagnostics}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-xs font-bold text-rose-300 hover:text-white transition-all cursor-pointer shadow-sm"
              title="Diagnose coral RTN/STN, brown jelly, bleaching, or pests"
            >
              <Activity size={14} className="text-rose-400" />
              <span>Hitchhiker & Disease ID</span>
            </button>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#00d2be] text-[#0d121a] hover:bg-[#14ebd7] text-xs font-bold transition-all shadow-md"
          >
            <PlusCircle size={15} />
            {isFreshwater ? "Add Plant Specimen" : "Add Coral Specimen"}
          </button>
        </div>
      </div>

      {/* Expandable API Key Setting Banner */}
      {showApiKeyInput && (
        <div className="bg-[#0f1520] border border-[#00d2be]/40 rounded-xl p-4 transition-all">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-[#f0f4f8] flex items-center gap-2">
                <Sparkles size={14} className="text-[#00d2be]" />
                Vision AI Model & Multi-Key Configuration
              </h4>
              <p className="text-xs text-[#8e9fb5]">
                Select your preferred vision provider (Google Gemini, OpenAI GPT-4o, Anthropic Claude 3.5 Sonnet, or OpenRouter) or manage keys across all providers.
              </p>
            </div>
            <button
              onClick={() => setShowApiKeyInput(false)}
              className="text-[#8e9fb5] hover:text-[#f0f4f8] p-1"
            >
              <X size={16} />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 items-center">
            <select
              value={aiProvider}
              onChange={(e) => handleProviderChange(e.target.value)}
              className="bg-[#161e2b] border border-[#28364a] rounded-lg px-2.5 py-1.5 text-xs text-[#00d2be] font-bold outline-none cursor-pointer"
            >
              <option value="gemini">Google Gemini (Recommended / Free)</option>
              <option value="openai">OpenAI (GPT-4o Vision)</option>
              <option value="anthropic">Anthropic (Claude 3.5 Sonnet)</option>
              <option value="openrouter">OpenRouter (Multi-Model)</option>
            </select>
            <input
              type="password"
              placeholder={`Paste ${aiProvider.toUpperCase()} API Key`}
              value={activeApiKey === "env_configured" ? "" : activeApiKey}
              onChange={(e) => handleSaveApiKey(e.target.value)}
              className="flex-1 min-w-[200px] bg-[#161e2b] border border-[#28364a] rounded-lg px-3 py-1.5 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
            />
            {activeApiKey && (
              <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-semibold">
                <Check size={14} /> Active
              </span>
            )}
            <button
              type="button"
              onClick={() => setShowAiModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#28364a] hover:bg-[#344660] text-xs font-bold text-[#f0f4f8] transition-all cursor-pointer"
            >
              <Settings size={13} />
              All AI Keys
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8e9fb5]"
          />
          <input
            type="text"
            placeholder={
              isFreshwater
                ? "Search plants by common name, scientific species, placement, or care..."
                : "Search corals by morph name, scientific species, zone, or aggressiveness..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#161e2b] border border-[#28364a] rounded-lg pl-9 pr-4 py-2 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(isFreshwater
            ? ["all", "Carpeting", "Stem", "Epiphyte", "Moss", "Rosette", "Floating"]
            : ["all", "SPS", "LPS", "Soft Coral", "Other"]
          ).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                selectedCategory === cat
                  ? "bg-[#00d2be] text-[#0d121a] border-[#00d2be]"
                  : "bg-[#161e2b] text-[#8e9fb5] border-[#28364a] hover:border-[#8e9fb5]"
              }`}
            >
              {cat === "all" ? (isFreshwater ? "All Plants" : "All Corals") : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Coral Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCorals.map((coral) => {
          const hasBeforeAfter =
            Boolean(coral.beforePhotoUrl) &&
            Boolean(coral.afterPhotoUrl) &&
            coral.beforePhotoUrl !== coral.afterPhotoUrl;

          return (
            <div
              key={coral.id}
              className="bg-[#161e2b] border border-[#28364a] rounded-xl overflow-hidden shadow-lg hover:border-[#00d2be]/50 transition-all flex flex-col group"
            >
              {/* Media Preview */}
              <div
                className="relative aspect-[16/10] bg-[#0f1520] overflow-hidden border-b border-[#28364a] cursor-pointer"
                onClick={(e) => {
                  if (coral.primaryVideoUrl) {
                    e.stopPropagation();
                    openMedia({
                      type: "video",
                      url: coral.primaryVideoUrl,
                      title: coral.name,
                      subtitle: `${coral.category} • ${coral.species || "Coral Specimen"}`,
                      caption: coral.notes || undefined,
                    });
                  } else if (coral.primaryPhotoUrl) {
                    e.stopPropagation();
                    openMedia({
                      type: "image",
                      url: coral.primaryPhotoUrl,
                      title: coral.name,
                      subtitle: `${coral.category} • ${coral.species || "Coral Specimen"}`,
                      caption: coral.notes || undefined,
                    });
                  }
                }}
              >
                {coral.primaryVideoUrl ? (
                  <HoverVideo
                    src={coral.primaryVideoUrl}
                    title={coral.name}
                    onEnlarge={() =>
                      openMedia({
                        type: "video",
                        url: coral.primaryVideoUrl!,
                        title: coral.name,
                        subtitle: `${coral.category} • ${coral.species || "Coral Specimen"}`,
                        caption: coral.notes || undefined,
                      })
                    }
                  />
                ) : coral.primaryPhotoUrl ? (
                  <EnlargeableImage
                    src={coral.primaryPhotoUrl}
                    alt={coral.name}
                    onEnlarge={() =>
                      openMedia({
                        type: "image",
                        url: coral.primaryPhotoUrl!,
                        title: coral.name,
                        subtitle: `${coral.category} • ${coral.species || "Coral Specimen"}`,
                        caption: coral.notes || undefined,
                      })
                    }
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[#8e9fb5] text-xs">
                    <ImageIcon size={32} className="mb-1 opacity-40" />
                    <span>No media attached</span>
                  </div>
                )}

                {/* Category Badge */}
                <div className="absolute top-2.5 left-2.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-md ${
                      coral.category === "SPS"
                        ? "bg-amber-500/90 text-black"
                        : coral.category === "LPS"
                        ? "bg-[#00d2be]/90 text-black"
                        : (coral.category === "Soft Coral" || coral.category === "Zoanthid" || coral.category === "Mushroom")
                        ? "bg-fuchsia-500/90 text-white"
                        : "bg-purple-500/90 text-white"
                    }`}
                  >
                    {(coral.category === "Zoanthid" || coral.category === "Mushroom") ? "Soft Coral" : coral.category}
                  </span>
                </div>

                {/* Media count indicators */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                  {coral.media && coral.media.length > 0 && (
                    <span className="bg-[#0d121a]/80 backdrop-blur-sm text-[10px] font-semibold text-[#f0f4f8] px-2 py-0.5 rounded-md border border-[#28364a] flex items-center gap-1">
                      <ImageIcon size={11} /> {coral.media.length}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div>
                    <h3 className="font-bold text-base text-[#f0f4f8] leading-snug">
                      {coral.name}
                    </h3>
                    <p className="text-xs text-[#00d2be] italic font-serif">
                      {coral.species}
                    </p>
                  </div>

                  {/* Biological Attributes */}
                  <div className="space-y-1.5 pt-1 text-[11px] text-[#8e9fb5]">
                    {/* Growth Type */}
                    <div className="flex items-start gap-1.5 bg-[#0f1520] px-2 py-1 rounded-md border border-[#28364a]/80">
                      <Sprout size={12} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-1 text-emerald-300 font-medium text-[11px]">
                        <strong className="text-[#8e9fb5] font-semibold">Growth:</strong>{" "}
                        {coral.growthType || getCoralGrowthTypeFallback(coral)}
                      </span>
                    </div>

                    {coral.zone && (
                      <div className="flex items-start gap-1.5">
                        <MapPin size={12} className="text-[#ff6b35] shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{coral.zone}</span>
                      </div>
                    )}

                    {coral.lighting && (
                      <div className="flex items-start gap-1.5">
                        <Sun size={12} className="text-amber-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1 text-amber-200/90">{coral.lighting}</span>
                      </div>
                    )}

                    {coral.aggressiveness && (
                      <div className="flex items-start gap-1.5">
                        <ShieldAlert size={12} className="text-rose-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1 text-rose-200/90">{coral.aggressiveness}</span>
                      </div>
                    )}

                    {coral.diet && (
                      <div className="flex items-start gap-1.5">
                        <Utensils size={12} className="text-[#00d2be] shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{coral.diet}</span>
                      </div>
                    )}
                  </div>

                  {coral.notes && (
                    <p className="text-xs text-[#8e9fb5] pt-1 line-clamp-2 leading-relaxed border-t border-[#28364a]/50">
                      {coral.notes}
                    </p>
                  )}
                </div>

                {/* Growth Milestones & Card Action Controls */}
                <div className="pt-2.5 border-t border-[#28364a] flex items-center justify-between gap-1.5">
                  <button
                    onClick={() => setMilestoneCoral(coral)}
                    className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg bg-[#00d2be]/15 text-[#00d2be] border border-[#00d2be]/30 hover:bg-[#00d2be] hover:text-[#0d121a] transition-all cursor-pointer shadow-sm"
                    title="Open Growth Milestones & Progression Timeline"
                  >
                    <SlidersHorizontal size={13} />
                    <span>Milestones</span>
                    {hasBeforeAfter && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Growth comparison ready" />
                    )}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setInspectCoral(coral);
                        setIsEditingProfile(false);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-[#0f1520] hover:bg-[#1e293b] text-xs font-semibold text-[#f0f4f8] border border-[#28364a] transition-all flex items-center gap-1 cursor-pointer"
                      title="View Biological Profile & Specimen Media"
                    >
                      <Info size={12} />
                      Profile
                    </button>

                    <button
                      onClick={() => handleStartEdit(coral)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#0f1520] hover:bg-[#1e293b] text-xs font-semibold text-[#00d2be] border border-[#00d2be]/30 hover:border-[#00d2be] transition-all flex items-center gap-1 cursor-pointer"
                      title="Edit Profile & Manage Photos/Videos"
                    >
                      <Edit3 size={12} />
                      Edit
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Delete ${coral.name} from vault?`)) {
                          onDeleteCoral(coral.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-[#8e9fb5] hover:text-rose-400 hover:bg-rose-950/30 transition-all cursor-pointer"
                      title="Delete coral"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCorals.length === 0 && (
        <div className="text-center py-12 bg-[#161e2b] border border-[#28364a] rounded-xl text-[#8e9fb5]">
          <Sparkles size={36} className="mx-auto mb-2 opacity-30 text-[#00d2be]" />
          <p className="text-sm font-semibold text-[#f0f4f8]">No corals found matching your filter.</p>
          <p className="text-xs text-[#8e9fb5] mt-1">Try resetting the search or category filters.</p>
        </div>
      )}

      {/* Interactive Growth Slider Modal */}
      {sliderCoral && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#161e2b] border border-[#28364a] rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#28364a] pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-[#f0f4f8] flex items-center gap-2">
                  <SlidersHorizontal size={18} className="text-[#00d2be]" />
                  Growth Maturation Slider: {sliderCoral.name}
                </h3>
                <p className="text-xs text-[#8e9fb5] italic">{sliderCoral.species}</p>
              </div>
              <button
                onClick={() => setSliderCoral(null)}
                className="p-1 rounded text-[#8e9fb5] hover:text-[#f0f4f8]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-2">
              <GrowthSlider
                beforeUrl={sliderCoral.beforePhotoUrl || sliderCoral.primaryPhotoUrl || ""}
                afterUrl={sliderCoral.afterPhotoUrl || sliderCoral.primaryPhotoUrl || ""}
                beforeLabel="Day 1 (Initial Frag)"
                afterLabel="Current (Maturation)"
                aspectRatio="16 / 10"
              />
            </div>

            <div className="mt-4 pt-3 border-t border-[#28364a] flex justify-between items-center text-xs text-[#8e9fb5]">
              <span>Interactive real-time Growth Slider</span>
              <button
                onClick={() => setSliderCoral(null)}
                className="px-4 py-1.5 rounded-lg bg-[#0f1520] border border-[#28364a] text-xs font-semibold hover:text-[#f0f4f8]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Coral Modal with AI Identification */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#161e2b] border border-[#28364a] rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#28364a] pb-3 mb-4">
              <h3 className="text-base font-bold text-[#f0f4f8] flex items-center gap-2">
                <PlusCircle size={18} className="text-[#00d2be]" />
                Add Coral Specimen to Vault
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded text-[#8e9fb5] hover:text-[#f0f4f8]"
              >
                <X size={18} />
              </button>
            </div>

            {/* AI Vision Species Identifier Banner */}
            <div className="mb-4 bg-[#0f1520] border border-[#00d2be]/30 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#00d2be] flex items-center gap-1.5">
                  <Sparkles size={14} /> AI Coral Species Identifier & Auto-Fill
                </span>
                {activeApiKey && (
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                    <Check size={11} /> {aiProvider.toUpperCase()} Vision Active
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#8e9fb5]">
                Upload your coral photo or video below and click <strong className="text-[#f0f4f8]">Auto-Identify</strong> to detect species name, lighting (PAR), water flow, aggressiveness, and diet.
              </p>

              {/* Multi-Provider Key Input */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#28364a]/50">
                <Key size={13} className={activeApiKey ? "text-emerald-400" : "text-amber-400"} />
                <select
                  value={aiProvider}
                  onChange={(e) => handleProviderChange(e.target.value)}
                  className="bg-[#161e2b] border border-[#28364a] rounded px-2 py-1 text-xs text-[#00d2be] font-bold outline-none cursor-pointer"
                >
                  <option value="gemini">Gemini</option>
                  <option value="openai">OpenAI (GPT-4o)</option>
                  <option value="anthropic">Claude</option>
                  <option value="openrouter">OpenRouter</option>
                </select>
                <input
                  type="password"
                  placeholder={`Paste ${aiProvider.toUpperCase()} API Key`}
                  value={activeApiKey === "env_configured" ? "" : activeApiKey}
                  onChange={(e) => handleSaveApiKey(e.target.value)}
                  className="flex-1 min-w-[170px] bg-[#161e2b] border border-[#28364a] rounded px-2.5 py-1 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowAiModal(true)}
                  className="text-[11px] text-[#8e9fb5] hover:text-[#00d2be] flex items-center gap-1 shrink-0 cursor-pointer font-medium"
                >
                  <Settings size={12} /> All AI Keys
                </button>
              </div>

              {identificationStatus && (
                <div
                  className={`text-xs p-2 rounded border mt-2 ${
                    identificationStatus.includes("⚠️") || identificationStatus.includes("Error")
                      ? "bg-rose-950/40 text-rose-300 border-rose-500/40"
                      : "bg-[#0d121a]/80 text-[#00d2be] border-[#00d2be]/30 font-medium"
                  }`}
                >
                  {identificationStatus}
                </div>
              )}
            </div>

            <form onSubmit={handleCreateCoral} className="space-y-3.5">
              {/* Photo Upload Area */}
              <div>
                <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                  Specimen Photo or Video (Local Storage)
                </label>
                <div className="border border-dashed border-[#28364a] hover:border-[#00d2be] rounded-lg p-3 text-center bg-[#0f1520]">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        setUploading(true);
                        const file = e.target.files[0];
                        if (file.type.startsWith("video/")) {
                          const frame = await captureVideoFrame(file);
                          if (frame) {
                            setFormData((prev) => ({
                              ...prev,
                              primaryPhotoUrl: frame,
                              beforePhotoUrl: frame,
                              afterPhotoUrl: frame,
                            }));
                          }
                        }
                        const url = await handleFileUpload(file);
                        if (url) {
                          if (file.type.startsWith("video/")) {
                            setFormData((prev) => ({
                              ...prev,
                              primaryVideoUrl: url,
                            }));
                          } else {
                            setFormData((prev) => ({
                              ...prev,
                              primaryPhotoUrl: url,
                              beforePhotoUrl: url,
                              afterPhotoUrl: url,
                            }));
                          }
                        }
                        setUploading(false);
                      }
                    }}
                    className="block w-full text-xs text-[#8e9fb5] file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#00d2be] file:text-[#0d121a] hover:file:bg-[#14ebd7] cursor-pointer"
                  />
                  {uploading && (
                    <p className="text-xs text-[#00d2be] mt-2 flex items-center justify-center gap-1">
                      <Loader2 size={13} className="animate-spin" /> Uploading media to local storage...
                    </p>
                  )}
                  {formData.primaryPhotoUrl && (
                    <div className="mt-2 text-xs text-emerald-400 flex items-center justify-center gap-1">
                      <Check size={12} /> Specimen photo frame ready
                    </div>
                  )}
                  {formData.primaryVideoUrl && (
                    <div className="mt-1 text-xs text-emerald-400 flex items-center justify-center gap-1">
                      <Video size={12} /> Specimen video ready for AI analysis
                    </div>
                  )}

                  {(formData.primaryPhotoUrl || formData.primaryVideoUrl) && (
                    <div className="aspect-[16/9] max-h-40 bg-black rounded-lg overflow-hidden border border-[#28364a] mt-2 relative">
                      {formData.primaryVideoUrl ? (
                        <HoverVideo
                          src={formData.primaryVideoUrl}
                          title={formData.name || "Specimen Video"}
                          onEnlarge={() =>
                            openMedia({
                              type: "video",
                              url: formData.primaryVideoUrl,
                              title: formData.name || "Uploaded Video",
                            })
                          }
                        />
                      ) : (
                        <EnlargeableImage
                          src={formData.primaryPhotoUrl}
                          alt={formData.name || "Uploaded Photo"}
                          onEnlarge={() =>
                            openMedia({
                              type: "image",
                              url: formData.primaryPhotoUrl,
                              title: formData.name || "Uploaded Photo",
                            })
                          }
                        />
                      )}
                    </div>
                  )}

                  {/* Single, non-redundant Auto-Identify button */}
                  <div className="mt-3 pt-2 border-t border-[#28364a]/50">
                    <button
                      type="button"
                      onClick={() => handleAutoIdentify(formData.primaryPhotoUrl || formData.primaryVideoUrl, false)}
                      disabled={identifying}
                      className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-[#00d2be] text-[#0d121a] hover:bg-[#14ebd7] font-bold text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {identifying ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Analyzing photo or video with Vision AI...
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} />
                          ✨ Auto-Identify Coral Specimen with AI (Photo or Video)
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                  Coral Morph / Trade Name *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Dragon Soul Torch Coral, Green Plating Monti"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="flex-1 bg-[#0f1520] border border-[#28364a] rounded-lg px-3 py-2 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => handleIdentifyByName(false)}
                    disabled={identifyingByName || !formData.name.trim()}
                    className="px-3 py-2 rounded-lg bg-[#00d2be]/15 border border-[#00d2be]/40 text-[#00d2be] hover:bg-[#00d2be] hover:text-[#0d121a] text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                    title="Use this trade name to identify coral morph and autofill profile data with AI"
                  >
                    {identifyingByName ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Sparkles size={13} />
                    )}
                    <span>{identifyingByName ? "Auto-Filling..." : "AI Auto-Fill by Name"}</span>
                  </button>
                </div>

                {/* Inline Status Feedback right below input */}
                {identificationStatus && (
                  <div
                    className={`text-[11px] p-2 rounded-lg border mt-2 flex items-center gap-1.5 ${
                      identificationStatus.includes("⚠️") || identificationStatus.includes("failed") || identificationStatus.includes("Error") || identificationStatus.includes("timed out")
                        ? "bg-rose-950/40 text-rose-300 border-rose-500/40"
                        : "bg-[#0d121a]/90 text-[#00d2be] border-[#00d2be]/30 font-medium"
                    }`}
                  >
                    <span>{identificationStatus}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                    Scientific Species (Latin)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Euphyllia glabrescens, Montipora capricornis"
                    value={formData.species}
                    onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                    className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-3 py-2 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-3 py-2 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                  >
                    {isFreshwater ? (
                      <>
                        <option value="Carpeting">Carpeting (Monte Carlo, Cuba, Hairgrass, Glosso)</option>
                        <option value="Stem">Stem (Rotala, Ludwigia, Bacopa, Pogostemon)</option>
                        <option value="Epiphyte">Epiphyte / Rhizome (Bucephalandra, Anubias, Java Fern)</option>
                        <option value="Moss">Moss (Christmas, Java, Flame, Phoenix)</option>
                        <option value="Rosette">Rosette / Crypts (Cryptocoryne, Amazon Sword)</option>
                        <option value="Floating">Floating (Red Root Floater, Salvinia, Frogbit)</option>
                      </>
                    ) : (
                      <>
                        <option value="LPS">LPS (Torch, Hammer, Acan, Duncan, Chalice)</option>
                        <option value="SPS">SPS (Acropora, Montipora, Stylophora, Millepora)</option>
                        <option value="Soft Coral">Soft Coral (Leathers, Zoanthids, Palythoas, Mushrooms, Polyps)</option>
                        <option value="Gorgonian">Gorgonian / Sea Fan</option>
                        <option value="Other">Other Macroalgae / Fauna</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8e9fb5] mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Sprout size={12} className="text-emerald-400" />{" "}
                    {isFreshwater ? "Growth & Propagation Habit *" : "Growth Type & Skeletal Structure *"}
                  </span>
                  <span className="text-[10px] text-[#8e9fb5]">Click preset to fill</span>
                </label>
                <input
                  type="text"
                  placeholder={
                    isFreshwater
                      ? "e.g. Runners / Stolons, Stem Nodes / Cuttings, Rhizome division, Branching thalli"
                      : "e.g. Encrusting, Calcium carbonate skeleton building (Branching), Runners / Stolons, Root / Basal Foot"
                  }
                  value={formData.growthType}
                  onChange={(e) => setFormData({ ...formData, growthType: e.target.value })}
                  className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-3 py-2 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none mb-1.5"
                />
                <div className="flex flex-wrap gap-1">
                  {(isFreshwater ? PLANT_GROWTH_PRESETS : GROWTH_TYPE_PRESETS).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFormData({ ...formData, growthType: preset })}
                      className={`text-[10px] px-2 py-0.5 rounded border transition-all ${
                        formData.growthType === preset
                          ? "bg-emerald-950/80 border-emerald-500 text-emerald-300 font-semibold"
                          : "bg-[#161e2b] border-[#28364a] text-[#8e9fb5] hover:text-emerald-400 hover:border-emerald-500/50"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#8e9fb5] mb-1 flex items-center gap-1">
                    <MapPin size={12} className="text-[#ff6b35]" />{" "}
                    {isFreshwater ? "Aquascape Placement" : "Placement Zone & Flow"}
                  </label>
                  <input
                    type="text"
                    placeholder={
                      isFreshwater
                        ? "e.g. Foreground carpeting / Midground wood attachment"
                        : "e.g. Mid-to-low rockwork with moderate indirect oscillating flow"
                    }
                    value={formData.zone}
                    onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                    className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-3 py-2 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8e9fb5] mb-1 flex items-center gap-1">
                    <Sun size={12} className="text-amber-400" />{" "}
                    {isFreshwater ? "Lighting Demand (PAR)" : "Lighting Requirement (PAR)"}
                  </label>
                  <input
                    type="text"
                    placeholder={
                      isFreshwater
                        ? "e.g. Medium to High Light (PAR 50 - 100+)"
                        : "e.g. PAR 150 - 250 (Moderate Lighting)"
                    }
                    value={formData.lighting}
                    onChange={(e) => setFormData({ ...formData, lighting: e.target.value })}
                    className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-3 py-2 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8e9fb5] mb-1 flex items-center gap-1">
                  <ShieldAlert size={12} className="text-rose-400" />{" "}
                  {isFreshwater ? "CO2 Demand & Growth / Trimming Rate" : "Type Aggressiveness & Warfare"}
                </label>
                <input
                  type="text"
                  placeholder={
                    isFreshwater
                      ? "e.g. High CO2 demand (20-30 ppm); rapid growth rate requiring bi-weekly trimming"
                      : "e.g. High: Extends 3-5 inch sweeper tentacles; potent stinging nematocysts. Maintain clearance."
                  }
                  value={formData.aggressiveness}
                  onChange={(e) => setFormData({ ...formData, aggressiveness: e.target.value })}
                  className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-3 py-2 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8e9fb5] mb-1 flex items-center gap-1">
                  <Utensils size={12} className="text-[#00d2be]" />{" "}
                  {isFreshwater ? "Fertilization & Nutrient Intake" : "Diet & Feeding Regimen"}
                </label>
                <input
                  type="text"
                  placeholder={
                    isFreshwater
                      ? "e.g. Substrate root feeder (aquasoil + root tabs) and water column liquid ferts"
                      : "e.g. Photosynthetic; broadcast coral aminos & target feed mysis weekly"
                  }
                  value={formData.diet}
                  onChange={(e) => setFormData({ ...formData, diet: e.target.value })}
                  className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-3 py-2 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                  Care Observations & Morph Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Glowing gold polyps with teal tips, sensitive to rapid alkalinity swings."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-[#0f1520] border border-[#28364a] rounded-lg px-3 py-2 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#28364a]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#0f1520] text-[#8e9fb5] hover:text-[#f0f4f8] border border-[#28364a]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploading}
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-[#00d2be] text-[#0d121a] hover:bg-[#14ebd7] disabled:opacity-50"
                >
                  {submitting ? "Saving Coral..." : "Save Coral Specimen"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Coral Media Gallery & Care Guide Modal */}
      {inspectCoral && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#161e2b] border border-[#28364a] rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-[#28364a] pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#f0f4f8] flex items-center gap-2">
                  <Layers size={18} className="text-[#00d2be]" />
                  {inspectCoral.name} - Biological Profile & Media
                </h3>
                <p className="text-xs text-[#00d2be] italic font-serif">{inspectCoral.species}</p>
              </div>
              <div className="flex items-center gap-2">
                {!isEditingProfile ? (
                  <button
                    onClick={() => handleStartEdit(inspectCoral)}
                    className="px-3 py-1.5 rounded-lg bg-[#00d2be]/10 text-[#00d2be] border border-[#00d2be]/30 hover:bg-[#00d2be]/20 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Edit3 size={13} />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditingProfile(false)}
                      className="px-3 py-1.5 rounded-lg bg-[#0f1520] text-[#8e9fb5] hover:text-[#f0f4f8] border border-[#28364a] text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      disabled={savingEdit}
                      className="px-3.5 py-1.5 rounded-lg bg-[#00d2be] text-[#0d121a] hover:bg-[#14ebd7] text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-md"
                    >
                      {savingEdit ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                      Save Changes
                    </button>
                  </div>
                )}
                <button
                  onClick={() => {
                    setInspectCoral(null);
                    setIsEditingProfile(false);
                  }}
                  className="p-1 rounded text-[#8e9fb5] hover:text-[#f0f4f8]"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Profile Content: Edit Form vs View Cards */}
            {isEditingProfile ? (
              <div className="bg-[#0f1520] border border-[#00d2be]/40 rounded-xl p-4 sm:p-5 space-y-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-[#28364a] pb-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#00d2be] flex items-center gap-1.5">
                    <Edit3 size={14} /> Edit Biological Profile & Attributes
                  </h4>
                  <span className="text-[11px] text-[#8e9fb5]">Edit fields below and click Save Changes</span>
                </div>

                {/* Specimen Media Gallery & Multi-Media Upload */}
                <div className="p-4 bg-[#161e2b] rounded-xl border border-[#28364a] space-y-4">
                  <div className="flex items-center justify-between border-b border-[#28364a] pb-2">
                    <div>
                      <h5 className="text-xs font-bold uppercase tracking-wider text-[#00d2be] flex items-center gap-1.5">
                        <ImageIcon size={14} /> Specimen Photos & Videos Gallery
                      </h5>
                      <p className="text-[11px] text-[#8e9fb5] mt-0.5">
                        Add and manage multiple photos and videos for this coral card. Set any photo or video as the primary cover.
                      </p>
                    </div>
                    {inspectCoral.media && (
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#0f1520] border border-[#28364a] text-[#f0f4f8]">
                        {inspectCoral.media.length} media item{inspectCoral.media.length === 1 ? "" : "s"}
                      </span>
                    )}
                  </div>

                  {/* Multi-File Upload Form */}
                  <div className="p-3 bg-[#0f1520] rounded-lg border border-[#28364a]/80 space-y-3">
                    <span className="text-xs font-semibold text-[#f0f4f8] flex items-center gap-1.5">
                      <Upload size={13} className="text-[#00d2be]" /> Add Photos or Videos to Gallery
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-[#8e9fb5] mb-1">
                          Select Photo(s) or Video(s) (Multiple allowed)
                        </label>
                        <input
                          id="coral-gallery-file-input"
                          type="file"
                          multiple
                          accept="image/*,video/*"
                          onChange={(e) => {
                            if (e.target.files) {
                              setGalleryFiles(e.target.files);
                            }
                          }}
                          className="w-full text-xs text-[#8e9fb5] file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#00d2be] file:text-[#0d121a] hover:file:bg-[#14ebd7] cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-[#8e9fb5] mb-1">
                          Optional Caption / Tag
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Daylight coloration, polyps open"
                          value={galleryCaption}
                          onChange={(e) => setGalleryCaption(e.target.value)}
                          className="w-full bg-[#161e2b] border border-[#28364a] rounded-lg px-2.5 py-1.5 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#28364a]/50">
                      <label className="flex items-center gap-1.5 text-xs text-[#8e9fb5] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={gallerySetAsPrimary}
                          onChange={(e) => setGallerySetAsPrimary(e.target.checked)}
                          className="accent-[#00d2be]"
                        />
                        <span>Set first uploaded file as Card Cover</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => handleUploadGalleryMedia(inspectCoral.id)}
                        disabled={uploadingGallery || !galleryFiles || galleryFiles.length === 0}
                        className="px-4 py-1.5 rounded-lg bg-[#00d2be] text-[#0d121a] hover:bg-[#14ebd7] text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 cursor-pointer shadow-sm"
                      >
                        {uploadingGallery ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                        {uploadingGallery ? "Uploading..." : `Upload & Add (${galleryFiles?.length || 0})`}
                      </button>
                    </div>

                    {galleryStatusMsg && (
                      <p className={`text-xs p-1.5 rounded ${galleryStatusMsg.includes("✓") ? "bg-emerald-950/40 text-emerald-300 font-semibold" : "bg-rose-950/40 text-rose-300"}`}>
                        {galleryStatusMsg}
                      </p>
                    )}
                  </div>

                  {/* Existing Specimen Media Grid */}
                  {inspectCoral.media && inspectCoral.media.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-semibold text-[#8e9fb5]">
                        Existing Specimen Media ({inspectCoral.media.length})
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto pr-1">
                        {inspectCoral.media.map((m) => {
                          const isPrimaryImage = editFormData.primaryPhotoUrl === m.url;
                          const isPrimaryVideo = editFormData.primaryVideoUrl === m.url;
                          const isCover = isPrimaryImage || isPrimaryVideo;

                          return (
                            <div
                              key={m.id}
                              className={`bg-[#0f1520] border rounded-lg overflow-hidden group relative flex flex-col justify-between ${
                                isCover ? "border-[#00d2be] shadow-[0_0_10px_rgba(0,210,190,0.2)]" : "border-[#28364a]"
                              }`}
                            >
                              <div className="aspect-[4/3] bg-black relative">
                                {m.mediaType === "video" ? (
                                  <HoverVideo
                                    src={m.url}
                                    title={m.caption || inspectCoral.name}
                                    onEnlarge={() =>
                                      openMedia({
                                        type: "video",
                                        url: m.url,
                                        title: inspectCoral.name,
                                        subtitle: m.caption || "Specimen Video",
                                        date: new Date(m.date).toLocaleDateString(),
                                      })
                                    }
                                  />
                                ) : (
                                  <EnlargeableImage
                                    src={m.url}
                                    alt={m.caption || inspectCoral.name}
                                    onEnlarge={() =>
                                      openMedia({
                                        type: "image",
                                        url: m.url,
                                        title: inspectCoral.name,
                                        subtitle: m.caption || "Specimen Photo",
                                        date: new Date(m.date).toLocaleDateString(),
                                      })
                                    }
                                  />
                                )}
                                <div className="absolute top-1 left-1 flex flex-wrap gap-1">
                                  {isCover && (
                                    <span className="text-[9px] bg-[#00d2be] text-[#0d121a] px-1 py-0.2 rounded font-bold shadow flex items-center gap-0.5">
                                      <Star size={9} /> COVER
                                    </span>
                                  )}
                                  {m.mediaType === "video" && !isCover && (
                                    <span className="text-[9px] bg-purple-600/90 text-white px-1 py-0.2 rounded font-bold">
                                      VIDEO
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="p-1.5 text-[10px] space-y-1">
                                <p className="font-semibold text-[#f0f4f8] truncate" title={m.caption || "Specimen Media"}>
                                  {m.caption || "Specimen Media"}
                                </p>
                                <div className="flex items-center justify-between gap-1 pt-0.5 border-t border-[#28364a]/50">
                                  {!isCover ? (
                                    <button
                                      type="button"
                                      onClick={() => handleSetPrimaryMedia(inspectCoral.id, m.url, m.mediaType)}
                                      className="text-[9px] text-[#00d2be] hover:underline font-bold"
                                      title="Set this media as the card cover photo/video"
                                    >
                                      Set Cover
                                    </button>
                                  ) : (
                                    <span className="text-[9px] text-emerald-400 font-bold">✓ Active Cover</span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteMedia(inspectCoral.id, m.id)}
                                    className="p-1 rounded text-[#8e9fb5] hover:text-rose-400 hover:bg-rose-950/30"
                                    title="Delete from specimen gallery"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Primary Cover Preview & AI Species Auto-ID */}
                  <div className="pt-2 border-t border-[#28364a] flex flex-col sm:flex-row items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#8e9fb5]">Card Cover Media:</span>
                      {editFormData.primaryPhotoUrl ? (
                        <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                          ✓ Photo Cover Set
                        </span>
                      ) : editFormData.primaryVideoUrl ? (
                        <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                          <Video size={11} /> Video Cover Set
                        </span>
                      ) : (
                        <span className="text-[11px] text-amber-400 italic">No cover media selected</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAutoIdentify(editFormData.primaryPhotoUrl || editFormData.primaryVideoUrl, true)}
                      disabled={editIdentifying || editUploading || (!editFormData.primaryPhotoUrl && !editFormData.primaryVideoUrl)}
                      className="px-3.5 py-1.5 rounded-lg bg-[#00d2be] text-[#0d121a] hover:bg-[#14ebd7] text-xs font-bold flex items-center gap-1.5 shrink-0 disabled:opacity-40 cursor-pointer shadow-sm"
                      title="Use AI Vision to inspect cover photo/video polyps & skeleton"
                    >
                      {editIdentifying ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                      AI Auto-Identify Polyps & Species
                    </button>
                  </div>
                  {editIdentificationStatus && (
                    <p className={`text-xs p-1.5 rounded ${editIdentificationStatus.includes("⚠️") || editIdentificationStatus.includes("Error") ? "bg-rose-950/40 text-rose-300" : "bg-emerald-950/30 text-emerald-400 font-medium"}`}>
                      {editIdentificationStatus}
                    </p>
                  )}
                </div>

                {/* Form Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                      Coral Morph / Trade Name *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        className="flex-1 bg-[#161e2b] border border-[#28364a] rounded-lg px-3 py-1.5 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleIdentifyByName(true)}
                        disabled={editIdentifyingByName || !editFormData.name.trim()}
                        className="px-3 py-1.5 rounded-lg bg-[#00d2be]/15 border border-[#00d2be]/40 text-[#00d2be] hover:bg-[#00d2be] hover:text-[#0d121a] text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                        title="Use this trade name to identify coral morph and autofill profile data with AI"
                      >
                        {editIdentifyingByName ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Sparkles size={13} />
                        )}
                        <span>{editIdentifyingByName ? "Auto-Filling..." : "AI Auto-Fill by Name"}</span>
                      </button>
                    </div>

                    {/* Inline Status Feedback right below edit input */}
                    {editIdentificationStatus && (
                      <div
                        className={`text-[11px] p-2 rounded-lg border mt-2 flex items-center gap-1.5 ${
                          editIdentificationStatus.includes("⚠️") || editIdentificationStatus.includes("failed") || editIdentificationStatus.includes("Error") || editIdentificationStatus.includes("timed out")
                            ? "bg-rose-950/40 text-rose-300 border-rose-500/40"
                            : "bg-[#0d121a]/90 text-[#00d2be] border-[#00d2be]/30 font-medium"
                        }`}
                      >
                        <span>{editIdentificationStatus}</span>
                      </div>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                      Scientific Species (Latin)
                    </label>
                    <input
                      type="text"
                      value={editFormData.species}
                      onChange={(e) => setEditFormData({ ...editFormData, species: e.target.value })}
                      className="w-full bg-[#161e2b] border border-[#28364a] rounded-lg px-3 py-1.5 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                      Category *
                    </label>
                    <select
                      value={editFormData.category}
                      onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                      className="w-full bg-[#161e2b] border border-[#28364a] rounded-lg px-3 py-1.5 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                    >
                      <option value="LPS">LPS (Torch, Hammer, Acan, Duncan, Chalice)</option>
                      <option value="SPS">SPS (Acropora, Montipora, Stylophora, Millepora)</option>
                      <option value="Soft Coral">Soft Coral (Leathers, Zoanthids, Palythoas, Mushrooms, Polyps)</option>
                      <option value="Gorgonian">Gorgonian / Sea Fan</option>
                      <option value="Other">Other Macroalgae / Fauna</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#8e9fb5] mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Sprout size={12} className="text-emerald-400" /> Growth Type & Skeletal Structure
                      </span>
                      <span className="text-[10px] text-[#8e9fb5]">Presets</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Encrusting, Calcium carbonate skeleton building, Runners, Root"
                      value={editFormData.growthType}
                      onChange={(e) => setEditFormData({ ...editFormData, growthType: e.target.value })}
                      className="w-full bg-[#161e2b] border border-[#28364a] rounded-lg px-3 py-1.5 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none mb-1.5"
                    />
                    <div className="flex flex-wrap gap-1">
                      {GROWTH_TYPE_PRESETS.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setEditFormData({ ...editFormData, growthType: preset })}
                          className={`text-[10px] px-2 py-0.5 rounded border transition-all ${
                            editFormData.growthType === preset
                              ? "bg-emerald-950/80 border-emerald-500 text-emerald-300 font-semibold"
                              : "bg-[#0f1520] border-[#28364a] text-[#8e9fb5] hover:text-emerald-400 hover:border-emerald-500/50"
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#8e9fb5] mb-1 flex items-center gap-1">
                      <Sun size={12} className="text-amber-400" /> Lighting Requirement (PAR)
                    </label>
                    <input
                      type="text"
                      value={editFormData.lighting}
                      onChange={(e) => setEditFormData({ ...editFormData, lighting: e.target.value })}
                      className="w-full bg-[#161e2b] border border-[#28364a] rounded-lg px-3 py-1.5 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#8e9fb5] mb-1 flex items-center gap-1">
                      <MapPin size={12} className="text-[#ff6b35]" /> Placement Zone & Flow
                    </label>
                    <input
                      type="text"
                      value={editFormData.zone}
                      onChange={(e) => setEditFormData({ ...editFormData, zone: e.target.value })}
                      className="w-full bg-[#161e2b] border border-[#28364a] rounded-lg px-3 py-1.5 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#8e9fb5] mb-1 flex items-center gap-1">
                      <ShieldAlert size={12} className="text-rose-400" /> Type Aggressiveness & Warfare
                    </label>
                    <input
                      type="text"
                      value={editFormData.aggressiveness}
                      onChange={(e) => setEditFormData({ ...editFormData, aggressiveness: e.target.value })}
                      className="w-full bg-[#161e2b] border border-[#28364a] rounded-lg px-3 py-1.5 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#8e9fb5] mb-1 flex items-center gap-1">
                      <Utensils size={12} className="text-[#00d2be]" /> Diet & Feeding Regimen
                    </label>
                    <input
                      type="text"
                      value={editFormData.diet}
                      onChange={(e) => setEditFormData({ ...editFormData, diet: e.target.value })}
                      className="w-full bg-[#161e2b] border border-[#28364a] rounded-lg px-3 py-1.5 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#8e9fb5] mb-1">
                      Care Observations & Morph Notes
                    </label>
                    <textarea
                      rows={2}
                      value={editFormData.notes}
                      onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                      className="w-full bg-[#161e2b] border border-[#28364a] rounded-lg px-3 py-1.5 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                    />
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="flex justify-end items-center gap-2 pt-3 border-t border-[#28364a]">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#161e2b] text-[#8e9fb5] hover:text-[#f0f4f8] border border-[#28364a]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={savingEdit}
                    className="px-5 py-2 text-xs font-bold rounded-lg bg-[#00d2be] text-[#0d121a] hover:bg-[#14ebd7] flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-md"
                  >
                    {savingEdit ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                    {savingEdit ? "Saving Changes..." : "Save Profile Changes"}
                  </button>
                </div>
              </div>
            ) : (
              /* Biological Specifications Card */
              <div className="bg-[#0f1520] border border-[#28364a] rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#00d2be] mb-2 flex items-center gap-1.5">
                    <Info size={13} /> Ecological Profile
                  </h4>
                  <div className="space-y-2 text-xs text-[#8e9fb5]">
                    <div>
                      <span className="font-semibold text-[#f0f4f8]">Category: </span>
                      <span className="text-[#00d2be]">{inspectCoral.category}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-[#f0f4f8]">Growth Type: </span>
                      <span className="text-emerald-400 font-medium">
                        {inspectCoral.growthType || getCoralGrowthTypeFallback(inspectCoral)}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-[#f0f4f8]">Placement & Flow: </span>
                      <span>{inspectCoral.zone || "Moderate flow"}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-[#f0f4f8]">Lighting (PAR): </span>
                      <span className="text-amber-300">{inspectCoral.lighting || "Not specified"}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-2 flex items-center gap-1.5">
                    <ShieldAlert size={13} /> Aggressiveness & Nutrition
                  </h4>
                  <div className="space-y-2 text-xs text-[#8e9fb5]">
                    <div>
                      <span className="font-semibold text-[#f0f4f8]">Warfare / Stinging: </span>
                      <span className="text-rose-200/90">{inspectCoral.aggressiveness || "Peaceful / Non-aggressive"}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-[#f0f4f8]">Diet & Regimen: </span>
                      <span>{inspectCoral.diet || "Photosynthetic"}</span>
                    </div>
                    {inspectCoral.notes && (
                      <div>
                        <span className="font-semibold text-[#f0f4f8]">Notes: </span>
                        <span>{inspectCoral.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Growth Milestones Navigation Banner */}
            <div className="bg-gradient-to-r from-[#00d2be]/15 via-[#161e2b] to-[#ff6b35]/15 border border-[#00d2be]/40 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#00d2be] flex items-center gap-1.5">
                  <SlidersHorizontal size={14} /> Specimen Growth Milestones & Timeline
                </h4>
                <p className="text-xs text-[#8e9fb5]">
                  View historical frag-to-colony progression, before/after comparisons, and growth milestones on a dedicated page.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMilestoneCoral(inspectCoral);
                  setInspectCoral(null);
                }}
                className="px-4 py-2 rounded-lg bg-[#00d2be] text-[#0d121a] hover:bg-[#14ebd7] font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-md transition-all cursor-pointer"
              >
                <SlidersHorizontal size={13} />
                <span>Open Growth Milestones Page</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {/* Specimen Media Gallery (All Photos & Videos) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8e9fb5] flex items-center gap-1.5">
                  <ImageIcon size={14} className="text-[#00d2be]" /> Specimen Media Gallery ({inspectCoral.media?.length || 0})
                </h4>
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(true)}
                  className="text-xs text-[#00d2be] hover:underline font-semibold flex items-center gap-1"
                >
                  <PlusCircle size={12} /> Add More Photos or Videos
                </button>
              </div>

              {inspectCoral.media && inspectCoral.media.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {inspectCoral.media.map((m) => {
                    const isCover =
                      inspectCoral.primaryPhotoUrl === m.url || inspectCoral.primaryVideoUrl === m.url;

                    return (
                      <div
                        key={m.id}
                        className={`bg-[#0f1520] border rounded-lg overflow-hidden group relative flex flex-col justify-between ${
                          isCover ? "border-[#00d2be]/80" : "border-[#28364a]"
                        }`}
                      >
                        <div className="aspect-[4/3] bg-black relative">
                          {m.mediaType === "video" ? (
                            <HoverVideo
                              src={m.url}
                              title={m.caption || inspectCoral.name}
                              onEnlarge={() =>
                                openMedia({
                                  type: "video",
                                  url: m.url,
                                  title: inspectCoral.name,
                                  subtitle: m.caption || "Recorded Video",
                                  date: new Date(m.date).toLocaleDateString(),
                                })
                              }
                            />
                          ) : (
                            <EnlargeableImage
                              src={m.url}
                              alt={m.caption || inspectCoral.name}
                              onEnlarge={() =>
                                openMedia({
                                  type: "image",
                                  url: m.url,
                                  title: inspectCoral.name,
                                  subtitle: m.caption || "Recorded Photo",
                                  date: new Date(m.date).toLocaleDateString(),
                                })
                              }
                            />
                          )}
                          <div className="absolute top-1.5 left-1.5 flex flex-wrap gap-1">
                            {isCover && (
                              <span className="text-[9px] bg-[#00d2be] text-[#0d121a] px-1.5 py-0.5 rounded font-bold shadow flex items-center gap-0.5">
                                <Star size={9} /> COVER
                              </span>
                            )}
                            {m.isBefore && (
                              <span className="text-[9px] bg-[#ff6b35] text-black px-1.5 py-0.5 rounded font-black shadow">
                                BEFORE
                              </span>
                            )}
                            {m.isAfter && (
                              <span className="text-[9px] bg-emerald-400 text-black px-1.5 py-0.5 rounded font-black shadow">
                                AFTER
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="p-2 text-[11px] space-y-0.5">
                          <p className="font-semibold text-[#f0f4f8] truncate" title={m.caption || "Specimen Photo"}>
                            {m.caption || "Specimen Media"}
                          </p>
                          <p className="text-[10px] text-[#8e9fb5] flex items-center gap-1">
                            <Clock size={10} className="text-[#00d2be]" />
                            {new Date(m.date).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 bg-[#0f1520] border border-[#28364a] rounded-xl text-center text-xs text-[#8e9fb5] space-y-2">
                  <p>No photos or videos uploaded yet for this specimen.</p>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(true)}
                    className="px-3 py-1.5 rounded-lg bg-[#00d2be]/20 text-[#00d2be] border border-[#00d2be]/40 text-xs font-bold hover:bg-[#00d2be]/30 inline-flex items-center gap-1.5"
                  >
                    <Upload size={12} /> Upload Specimen Photos & Videos
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Growth Milestones Page / Modal */}
      {milestoneCoral && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="bg-[#161e2b] border border-[#28364a] rounded-2xl max-w-4xl w-full p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#28364a] pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#00d2be]/20 text-[#00d2be]">
                  <Sprout size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-[#f0f4f8]">
                      {milestoneCoral.name} - Growth Milestones & Timeline
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-[#00d2be]/90 text-black">
                      {milestoneCoral.category}
                    </span>
                  </div>
                  <p className="text-xs text-[#00d2be] italic font-serif">
                    {milestoneCoral.species} • <span className="text-[#8e9fb5] not-italic">Dedicated Growth Progression Page</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setInspectCoral(milestoneCoral);
                    setIsEditingProfile(false);
                    setMilestoneCoral(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#0f1520] hover:bg-[#1e293b] text-xs font-semibold text-[#8e9fb5] hover:text-[#f0f4f8] border border-[#28364a] flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Info size={13} />
                  <span>View Ecological Profile</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMilestoneCoral(null)}
                  className="p-1.5 rounded-lg text-[#8e9fb5] hover:text-[#f0f4f8] hover:bg-[#28364a]/50 transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Before & After Interactive Growth Slider Section */}
            <div className="bg-[#0f1520] border border-[#28364a] rounded-xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#00d2be] flex items-center gap-1.5">
                  <SlidersHorizontal size={14} /> Interactive Frag-to-Colony Growth Slider
                </h4>
                <span className="text-[11px] text-[#8e9fb5]">
                  Compare initial frag baseline vs current mature colony
                </span>
              </div>

              {milestoneCoral.beforePhotoUrl && milestoneCoral.afterPhotoUrl ? (
                <div className="py-2">
                  <GrowthSlider
                    beforeUrl={milestoneCoral.beforePhotoUrl}
                    afterUrl={milestoneCoral.afterPhotoUrl}
                    beforeLabel="Day 1 (Initial Frag)"
                    afterLabel="Current (Maturation)"
                    title={milestoneCoral.name}
                    aspectRatio="16 / 10"
                  />
                </div>
              ) : (
                <div className="p-4 bg-[#161e2b] rounded-lg border border-dashed border-[#28364a] text-center text-xs text-[#8e9fb5] space-y-1.5">
                  <p className="font-semibold text-[#f0f4f8]">Growth Slider needs both a "Before" and an "After" photo.</p>
                  <p>
                    Set any milestone below as <span className="text-[#ff6b35] font-semibold">"Before"</span> and another as <span className="text-[#00d2be] font-semibold">"After"</span> to activate the interactive slider comparison!
                  </p>
                </div>
              )}
            </div>

            {/* Chronological Milestone Timeline */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#f0f4f8] flex items-center gap-2">
                  <Calendar size={14} className="text-[#00d2be]" />
                  Recorded Growth Milestones ({milestoneCoral.media?.length || 0})
                </h4>
                <span className="text-[11px] text-[#8e9fb5]">
                  Historical timeline entries
                </span>
              </div>

              {milestoneCoral.media && milestoneCoral.media.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  {milestoneCoral.media.map((m) => (
                    <div
                      key={m.id}
                      className="bg-[#0f1520] border border-[#28364a] rounded-xl overflow-hidden flex flex-col justify-between group hover:border-[#00d2be]/50 transition-all shadow-md"
                    >
                      <div>
                        <div className="aspect-[4/3] bg-black relative">
                          {m.mediaType === "video" ? (
                            <HoverVideo
                              src={m.url}
                              title={m.caption || milestoneCoral.name}
                              onEnlarge={() =>
                                openMedia({
                                  type: "video",
                                  url: m.url,
                                  title: milestoneCoral.name,
                                  subtitle: m.caption || "Milestone Video",
                                  date: new Date(m.date).toLocaleDateString(),
                                })
                              }
                            />
                          ) : (
                            <EnlargeableImage
                              src={m.url}
                              alt={m.caption || milestoneCoral.name}
                              onEnlarge={() =>
                                openMedia({
                                  type: "image",
                                  url: m.url,
                                  title: milestoneCoral.name,
                                  subtitle: m.caption || "Milestone Photo",
                                  date: new Date(m.date).toLocaleDateString(),
                                })
                              }
                            />
                          )}
                          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                            {m.isBefore && (
                              <span className="text-[9px] bg-[#ff6b35] text-black px-1.5 py-0.5 rounded font-black tracking-wide shadow">
                                BEFORE FRAG
                              </span>
                            )}
                            {m.isAfter && (
                              <span className="text-[9px] bg-[#00d2be] text-black px-1.5 py-0.5 rounded font-black tracking-wide shadow">
                                AFTER MATURATION
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="p-3 space-y-1">
                          <p className="font-semibold text-xs text-[#f0f4f8] leading-snug">
                            {m.caption || "Growth Milestone"}
                          </p>
                          <p className="text-[11px] text-[#8e9fb5] flex items-center gap-1">
                            <Clock size={11} className="text-[#00d2be]" />
                            {new Date(m.date).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Milestone Actions: Set Before, Set After, Delete */}
                      <div className="p-2.5 pt-0 flex items-center justify-between border-t border-[#28364a]/50 gap-1.5">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggleGrowthTag(milestoneCoral.id, m.id, "before", m.isBefore)}
                            className={`text-[10px] font-bold px-2 py-1 rounded transition-all cursor-pointer ${
                              m.isBefore
                                ? "bg-[#ff6b35] text-black shadow"
                                : "bg-[#161e2b] text-[#ff6b35] border border-[#ff6b35]/40 hover:bg-[#ff6b35]/20"
                            }`}
                            title={m.isBefore ? "Click to unset Before tag" : "Set as Before Frag Baseline photo"}
                          >
                            {m.isBefore ? "✓ Before" : "Set Before"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleGrowthTag(milestoneCoral.id, m.id, "after", m.isAfter)}
                            className={`text-[10px] font-bold px-2 py-1 rounded transition-all cursor-pointer ${
                              m.isAfter
                                ? "bg-[#00d2be] text-black shadow"
                                : "bg-[#161e2b] text-[#00d2be] border border-[#00d2be]/40 hover:bg-[#00d2be]/20"
                            }`}
                            title={m.isAfter ? "Click to unset After tag" : "Set as After Maturation photo"}
                          >
                            {m.isAfter ? "✓ After" : "Set After"}
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteMedia(milestoneCoral.id, m.id)}
                          className="p-1 rounded text-[#8e9fb5] hover:text-rose-400 hover:bg-rose-950/30 transition-all cursor-pointer"
                          title="Delete this milestone"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-[#0f1520] border border-[#28364a] rounded-xl text-center text-xs text-[#8e9fb5]">
                  <Sprout size={28} className="mx-auto mb-2 text-[#00d2be] opacity-50" />
                  <p className="font-semibold text-[#f0f4f8]">No milestones recorded yet for {milestoneCoral.name}.</p>
                  <p className="mt-1">Upload your first frag baseline or maturation photo below.</p>
                </div>
              )}
            </div>

            {/* Upload New Growth Milestone Form */}
            <div className="bg-[#0f1520] border border-[#28364a] rounded-xl p-4 sm:p-5 space-y-4">
              <h4 className="text-xs font-bold text-[#f0f4f8] flex items-center gap-2 uppercase tracking-wider">
                <Upload size={14} className="text-[#00d2be]" />
                Record New Growth Milestone (Photo or Video)
              </h4>

              <form onSubmit={handleAddMilestone} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#8e9fb5] mb-1">
                      Choose Media File *
                    </label>
                    <input
                      id="coral-milestone-file-input"
                      type="file"
                      accept="image/*,video/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setMilestoneFile(e.target.files[0]);
                        }
                      }}
                      className="block w-full text-xs text-[#8e9fb5] file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#00d2be] file:text-[#0d121a] hover:file:bg-[#14ebd7] cursor-pointer"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#8e9fb5] mb-1">
                      Milestone Date
                    </label>
                    <input
                      type="date"
                      value={milestoneDate}
                      onChange={(e) => setMilestoneDate(e.target.value)}
                      className="w-full bg-[#161e2b] border border-[#28364a] rounded-md px-3 py-1.5 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#8e9fb5] mb-1">
                      Milestone Caption / Growth Notes
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 6-month growth rim extension, 4 new polyps"
                      value={milestoneCaption}
                      onChange={(e) => setMilestoneCaption(e.target.value)}
                      className="w-full bg-[#161e2b] border border-[#28364a] rounded-md px-3 py-1.5 text-xs text-[#f0f4f8] focus:border-[#00d2be] outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-4 text-xs text-[#8e9fb5]">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={milestoneIsBefore}
                        onChange={(e) => setMilestoneIsBefore(e.target.checked)}
                        className="accent-[#ff6b35]"
                      />
                      <span className="text-[#ff6b35] font-semibold">Set as "Before" Frag Photo</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={milestoneIsAfter}
                        onChange={(e) => setMilestoneIsAfter(e.target.checked)}
                        className="accent-[#00d2be]"
                      />
                      <span className="text-[#00d2be] font-semibold">Set as "After" Maturation Photo</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={uploadingMilestone || !milestoneFile}
                    className="px-5 py-2 rounded-lg bg-[#00d2be] text-[#0d121a] hover:bg-[#14ebd7] text-xs font-bold disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    {uploadingMilestone ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                    {uploadingMilestone ? "Uploading Milestone..." : "Save Growth Milestone"}
                  </button>
                </div>

                {milestoneStatusMsg && (
                  <p className="text-xs p-2 rounded bg-emerald-950/40 text-emerald-400 font-semibold border border-emerald-800/40">
                    {milestoneStatusMsg}
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Provider AI Settings Modal */}
      <AiSettingsModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        onKeysUpdated={syncAiKeysAndProvider}
      />
    </div>
  );
}
