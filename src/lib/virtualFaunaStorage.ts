"use client";

const STORAGE_PREFIX = "reef_studio_virtual_tank_livestock_";
const SPRITE_PREFIX = "reef_studio_fish_sprite_";
const SPRITE_FAIL_PREFIX = "reef_studio_fish_sprite_fail_";
/** How long before we retry a failed sprite lookup (24 hours) */
const RETRY_AFTER_MS = 24 * 60 * 60 * 1000;

/* ─── Virtual Tank inhabitant IDs (which fish are in the tank) ─── */

export function getVirtualTankLivestockIds(tankId: string): string[] {
  if (typeof window === "undefined" || !tankId) return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${tankId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Failed to read virtual tank livestock ids", err);
    return [];
  }
}

export function setVirtualTankLivestockIds(tankId: string, ids: string[]): void {
  if (typeof window === "undefined" || !tankId) return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${tankId}`, JSON.stringify(ids));
    window.dispatchEvent(
      new CustomEvent("virtual-tank-livestock-updated", {
        detail: { tankId, ids },
      })
    );
  } catch (err) {
    console.error("Failed to write virtual tank livestock ids", err);
  }
}

export function isLivestockInVirtualTank(tankId: string, livestockId: string): boolean {
  const ids = getVirtualTankLivestockIds(tankId);
  return ids.includes(livestockId);
}

export function toggleLivestockInVirtualTank(tankId: string, livestockId: string): boolean {
  const ids = getVirtualTankLivestockIds(tankId);
  const exists = ids.includes(livestockId);
  const nextIds = exists ? ids.filter((id) => id !== livestockId) : [...ids, livestockId];
  setVirtualTankLivestockIds(tankId, nextIds);
  return !exists;
}

export function addLivestockToVirtualTank(tankId: string, livestockId: string): void {
  const ids = getVirtualTankLivestockIds(tankId);
  if (!ids.includes(livestockId)) {
    setVirtualTankLivestockIds(tankId, [...ids, livestockId]);
  }
}

export function removeLivestockFromVirtualTank(tankId: string, livestockId: string): void {
  const ids = getVirtualTankLivestockIds(tankId);
  if (ids.includes(livestockId)) {
    setVirtualTankLivestockIds(
      tankId,
      ids.filter((id) => id !== livestockId)
    );
  }
}

/* ─── Sprite URL cache (realistic fish photo) ─── */

export function getCachedSpriteUrl(livestockId: string): string | null {
  if (typeof window === "undefined" || !livestockId) return null;
  try {
    return localStorage.getItem(`${SPRITE_PREFIX}${livestockId}`) || null;
  } catch {
    return null;
  }
}

export function setCachedSpriteUrl(livestockId: string, url: string): void {
  if (typeof window === "undefined" || !livestockId || !url) return;
  try {
    localStorage.setItem(`${SPRITE_PREFIX}${livestockId}`, url);
    // Clear any previous failure marker
    localStorage.removeItem(`${SPRITE_FAIL_PREFIX}${livestockId}`);
    window.dispatchEvent(
      new CustomEvent("virtual-tank-sprite-ready", {
        detail: { livestockId, url },
      })
    );
  } catch {
    // Ignore storage quota errors
  }
}

export function clearCachedSpriteUrl(livestockId: string): void {
  if (typeof window === "undefined" || !livestockId) return;
  try {
    localStorage.removeItem(`${SPRITE_PREFIX}${livestockId}`);
    localStorage.removeItem(`${SPRITE_FAIL_PREFIX}${livestockId}`);
  } catch {}
}

/** Clears all sprite failure markers — call this after upgrading the sprite generation strategy */
export function clearAllSpriteFailures(): void {
  if (typeof window === "undefined") return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(SPRITE_FAIL_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch {}
}


/** Mark that we already tried and failed so we don't retry every render */
function markSpriteFailed(livestockId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${SPRITE_FAIL_PREFIX}${livestockId}`, String(Date.now()));
    // Notify so the UI can stop showing the spinner
    window.dispatchEvent(
      new CustomEvent("virtual-tank-sprite-failed", { detail: { livestockId } })
    );
  } catch {}
}

function hasRecentlyFailed(livestockId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const ts = localStorage.getItem(`${SPRITE_FAIL_PREFIX}${livestockId}`);
    if (!ts) return false;
    return Date.now() - Number(ts) < RETRY_AFTER_MS;
  } catch {
    return false;
  }
}

/** In-flight request de-duplication map (prevents double-fetching on the same page load) */
const inFlight = new Map<string, Promise<string | null>>();

export function isSpriteVerified(livestockId: string): boolean {
  return Boolean(getCachedSpriteUrl(livestockId));
}

/**
 * Request a sprite for the given livestock.
 * - Returns immediately if already cached.
 * - Returns immediately if already failed recently (avoids infinite retries).
 * - Enforces a 90-second client-side AbortController timeout.
 * - De-duplicates concurrent calls for the same livestockId.
 */
export async function requestFishSprite(livestock: {
  id: string;
  name: string;
  species?: string;
  category?: string;
  primaryPhotoUrl?: string;
}): Promise<string | null> {
  if (typeof window === "undefined") return null;


  // 1. Already cached
  const cached = getCachedSpriteUrl(livestock.id);
  if (cached) return cached;

  // 2. Already failed recently — don't spam the API
  if (hasRecentlyFailed(livestock.id)) return null;


  // 4. De-duplicate concurrent requests for the same ID
  const existing = inFlight.get(livestock.id);
  if (existing) return existing;

  const promise = (async (): Promise<string | null> => {
    const controller = new AbortController();
    // 90-second timeout — rembg CPU inference takes ~45s on first run
    const timer = setTimeout(() => controller.abort(), 90_000);

    try {
      const res = await fetch("/api/generate-fish-sprite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          livestockId: livestock.id,
          name: livestock.name,
          species: livestock.species || "",
          category: livestock.category || "Fish",
          primaryPhotoUrl: livestock.primaryPhotoUrl || "",
        }),
        signal: controller.signal,
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.url) {
          setCachedSpriteUrl(livestock.id, data.url);
          return data.url;
        }
      }
      // 404 = not found, other errors = give up
      markSpriteFailed(livestock.id);
      return null;
    } catch (err: any) {
      if (err?.name === "AbortError") {
        console.warn(`[requestFishSprite] Timed out for "${livestock.name}"`);
      } else {
        console.warn(`[requestFishSprite] Failed for "${livestock.name}":`, err);
      }
      markSpriteFailed(livestock.id);
      return null;
    } finally {
      clearTimeout(timer);
      inFlight.delete(livestock.id);
    }
  })();

  inFlight.set(livestock.id, promise);
  return promise;
}

/* ─── Sessile (Stationary) Livestock Position Persistence ─── */

const SESSILE_POS_PREFIX = "reef_studio_sessile_pos_";

export interface SessilePosition {
  topPct: number;
  leftPct: number;
}

export function getSessilePosition(tankId: string, livestockId: string): SessilePosition | null {
  if (typeof window === "undefined" || !tankId || !livestockId) return null;
  try {
    const raw = localStorage.getItem(`${SESSILE_POS_PREFIX}${tankId}_${livestockId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.topPct === "number" && typeof parsed?.leftPct === "number") {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function setSessilePosition(tankId: string, livestockId: string, pos: SessilePosition): void {
  if (typeof window === "undefined" || !tankId || !livestockId) return;
  try {
    localStorage.setItem(`${SESSILE_POS_PREFIX}${tankId}_${livestockId}`, JSON.stringify(pos));
    window.dispatchEvent(
      new CustomEvent("virtual-tank-sessile-pos-updated", {
        detail: { tankId, livestockId, pos },
      })
    );
  } catch {}
}
