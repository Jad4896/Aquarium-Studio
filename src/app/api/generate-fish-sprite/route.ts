import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const TIMEOUT_MS = 12_000;

/** Path to Python interpreter */
const PYTHON_PATH = process.env.PYTHON_BG_REMOVAL || "python";

/** Path to remove_bg.py helper script */
const REMOVE_BG_SCRIPT = path.join(process.cwd(), "scripts", "remove_bg.py");

/** Path to pixelate.py helper script */
const PIXELATE_SCRIPT = path.join(process.cwd(), "scripts", "pixelate.py");

/**
 * Curated Library of pristine, retro 16-bit pixel art transparent sprites.
 */
const CURATED_SPRITES: Array<{ keywords: string[]; filename: string }> = [
  {
    keywords: ["clownfish", "ocellaris", "percula", "amphiprion", "clown fish"],
    filename: "clownfish_pixel.png",
  },
  {
    keywords: ["blue tang", "regal tang", "hippo tang", "paracanthurus", "hepatus"],
    filename: "blue_tang_pixel.png",
  },
  {
    keywords: ["yellow tang", "flavescens"],
    filename: "yellow_tang_pixel.png",
  },
  {
    keywords: ["royal gramma", "gramma loreto", "basslet"],
    filename: "royal_gramma_pixel.png",
  },
  {
    keywords: ["flame angel", "loriculus", "centropyge"],
    filename: "flame_angel_pixel.png",
  },
  {
    keywords: ["yellow assessor", "assessor", "flavissimus"],
    filename: "yellow_assessor_pixel.png",
  },
  {
    keywords: ["cherry shrimp", "red cherry", "neocaridina"],
    filename: "cherry_shrimp_pixel.png",
  },
  {
    keywords: ["cleaner shrimp", "skunk cleaner", "amboinensis", "shrimp"],
    filename: "cleaner_shrimp_pixel.png",
  },
  {
    keywords: ["tailspot blenny", "blenny", "ecsenius", "stigmatura"],
    filename: "tailspot_blenny_pixel.png",
  },
  {
    keywords: ["tuxedo urchin", "urchin", "mespilia", "globulus", "sea urchin"],
    filename: "tuxedo_urchin_pixel.png",
  },
  {
    keywords: ["snail", "turbo", "trochus", "nerite", "mollusk"],
    filename: "turbo_snail_pixel.png",
  },
  {
    keywords: ["neon tetra", "cardinal tetra", "paracheirodon", "tetra"],
    filename: "neon_tetra_pixel.png",
  },
];

function findCuratedSprite(name: string, species?: string): string | null {
  const target = `${name} ${species || ""}`.toLowerCase();
  for (const entry of CURATED_SPRITES) {
    if (entry.keywords.some((k) => target.includes(k))) {
      const srcPath = path.join(process.cwd(), "public", "aquariums", entry.filename);
      return srcPath;
    }
  }
  return null;
}

async function fetchWithTimeout(url: string, ms = TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

/**
 * Run rembg via Python helper script to remove background and verify intactness.
 */
async function removeBackgroundAndVerify(
  inputPath: string,
  outputPath: string
): Promise<{ success: boolean; reason?: string }> {
  try {
    const { stdout, stderr } = await execAsync(
      `"${PYTHON_PATH}" "${REMOVE_BG_SCRIPT}" "${inputPath}" "${outputPath}" --verify`,
      { timeout: 60_000 }
    );
    if (stdout.trim().startsWith("OK:")) {
      return { success: true };
    }
    return { success: false, reason: stderr || stdout };
  } catch (err: any) {
    return { success: false, reason: err?.message || String(err) };
  }
}

/**
 * Convert transparent cutout to crisp 64x64 retro pixel art sprite.
 */
async function convertToPixelArt(imagePath: string, targetSize = 64): Promise<boolean> {
  try {
    const { stdout } = await execAsync(
      `"${PYTHON_PATH}" "${PIXELATE_SCRIPT}" "${imagePath}" "${imagePath}" ${targetSize}`,
      { timeout: 15_000 }
    );
    return stdout.trim().startsWith("OK:");
  } catch (err) {
    console.warn("Failed to pixelate sprite:", err);
    return false;
  }
}

/**
 * Try Wikipedia Mediawiki pageimages API.
 */
async function tryWikipediaCandidates(query: string): Promise<string[]> {
  const results: string[] = [];
  const candidates = [query, query.split(" ").slice(0, 2).join("_")];
  for (const title of candidates) {
    try {
      const url =
        `https://en.wikipedia.org/w/api.php?action=query` +
        `&titles=${encodeURIComponent(title)}` +
        `&prop=pageimages` +
        `&format=json` +
        `&pithumbsize=800` +
        `&origin=*`;
      const res = await fetchWithTimeout(url, 8000);
      if (!res.ok) continue;
      const data = await res.json();
      const pages = Object.values(data?.query?.pages || {}) as any[];
      const thumb = pages[0]?.thumbnail?.source;
      if (thumb && !results.includes(thumb)) {
        results.push(thumb);
      }
    } catch { /* continue */ }
  }
  return results;
}

/**
 * Search Wikimedia Commons for high-quality specimen photos.
 */
async function tryWikimediaCommonsCandidates(query: string): Promise<string[]> {
  const results: string[] = [];
  try {
    const url =
      `https://commons.wikimedia.org/w/api.php?action=query` +
      `&generator=search` +
      `&gsrsearch=${encodeURIComponent(query)}` +
      `&gsrnamespace=6` +
      `&prop=imageinfo` +
      `&iiprop=url` +
      `&iiurlwidth=800` +
      `&format=json` +
      `&origin=*`;
    const res = await fetchWithTimeout(url, 8000);
    if (!res.ok) return results;
    const data = await res.json();
    const pages = Object.values(data?.query?.pages || {}) as any[];
    for (const page of pages) {
      const info = page?.imageinfo?.[0];
      const thumb = info?.thumburl || info?.url;
      if (thumb && !results.includes(thumb)) {
        results.push(thumb);
      }
      if (results.length >= 4) break;
    }
  } catch { /* continue */ }
  return results;
}

/**
 * Try iNaturalist search and observation photos for multiple candidates.
 */
async function tryINaturalistCandidates(query: string): Promise<string[]> {
  const results: string[] = [];
  try {
    const url = `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(query)}&per_page=1&is_active=true`;
    const res = await fetchWithTimeout(url, 8000);
    if (!res.ok) return results;
    const data = await res.json();
    const taxon = data?.results?.[0];
    if (!taxon) return results;

    const defaultPhoto = taxon?.default_photo?.medium_url;
    if (defaultPhoto) results.push(defaultPhoto);

    if (Array.isArray(taxon?.taxon_photos)) {
      for (const p of taxon.taxon_photos) {
        const u = p?.photo?.medium_url;
        if (u && !results.includes(u)) {
          results.push(u);
        }
      }
    }
  } catch { /* continue */ }
  return results;
}

/**
 * Download image to local file.
 */
async function downloadImage(imageUrl: string, destPath: string): Promise<boolean> {
  try {
    const res = await fetchWithTimeout(imageUrl, 14000);
    if (!res.ok) return false;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 1000) return false;
    await fs.writeFile(destPath, buf);
    return true;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { livestockId, name, species, category, primaryPhotoUrl } = body as {
      livestockId: string;
      name: string;
      species?: string;
      category?: string;
      primaryPhotoUrl?: string;
    };

    if (!livestockId || !name) {
      return NextResponse.json({ error: "livestockId and name are required" }, { status: 400 });
    }

    const spritesDir = path.join(process.cwd(), "public", "aquariums", "sprites");
    await fs.mkdir(spritesDir, { recursive: true });

    const tmpDir = path.join(process.cwd(), ".tmp-sprites");
    await fs.mkdir(tmpDir, { recursive: true });

    const finalPath = path.join(spritesDir, `${livestockId}.png`);
    const publicUrl = `/aquariums/sprites/${livestockId}.png`;

    // If already generated & confirmed on disk, return immediately
    try {
      await fs.access(finalPath);
      return NextResponse.json({ url: publicUrl, verified: true, cached: true });
    } catch { /* proceed to generate */ }

    // ── STEP 1: Check Curated Pixel Sprite Library First ──────────────────
    const curatedSrc = findCuratedSprite(name, species);
    if (curatedSrc) {
      try {
        await fs.copyFile(curatedSrc, finalPath);
        return NextResponse.json({
          url: publicUrl,
          verified: true,
          cached: false,
          source: "curated_pixel_library",
        });
      } catch { /* fallback to dynamic search */ }
    }

    // ── STEP 2: Collect candidate photos from multiple sources ─────────────
    const candidateUrls: string[] = [];

    // 2a. User's own uploaded photo (top priority if provided)
    let localUserPhotoPath: string | null = null;
    if (primaryPhotoUrl && primaryPhotoUrl.startsWith("/uploads/")) {
      const localSrc = path.join(process.cwd(), "public", primaryPhotoUrl);
      try {
        await fs.access(localSrc);
        localUserPhotoPath = localSrc;
      } catch { /* ignore */ }
    }

    // 2b. Wikipedia candidates
    if (species) {
      const wikiUrls = await tryWikipediaCandidates(species);
      candidateUrls.push(...wikiUrls);
    }
    if (candidateUrls.length < 2) {
      const wikiNameUrls = await tryWikipediaCandidates(name);
      for (const u of wikiNameUrls) {
        if (!candidateUrls.includes(u)) candidateUrls.push(u);
      }
    }

    // 2c. Wikimedia Commons high-resolution specimens
    const commonsUrls = await tryWikimediaCommonsCandidates(species || name);
    for (const u of commonsUrls) {
      if (!candidateUrls.includes(u)) candidateUrls.push(u);
    }

    // 2d. iNaturalist candidates
    const inatSearchTerms = species ? [species, name] : [name];
    for (const term of inatSearchTerms) {
      const inatUrls = await tryINaturalistCandidates(term);
      for (const u of inatUrls) {
        if (!candidateUrls.includes(u)) candidateUrls.push(u);
      }
    }

    // ── STEP 3: Cross-reference candidates, isolate background & pixelate ─
    if (localUserPhotoPath) {
      const tmpUser = path.join(tmpDir, `${livestockId}_user_src.png`);
      try {
        await fs.copyFile(localUserPhotoPath, tmpUser);
        const { success } = await removeBackgroundAndVerify(tmpUser, finalPath);
        await fs.unlink(tmpUser).catch(() => {});
        if (success) {
          // Pixelate to 64x64 retro game sprite
          await convertToPixelArt(finalPath, 64);
          return NextResponse.json({ url: publicUrl, verified: true, cached: false });
        }
      } catch { /* proceed to other candidates */ }
    }

    // Try web candidates sequentially
    for (let i = 0; i < Math.min(candidateUrls.length, 4); i++) {
      const candidateUrl = candidateUrls[i];
      const tmpDownload = path.join(tmpDir, `${livestockId}_candidate_${i}.jpg`);

      const downloaded = await downloadImage(candidateUrl, tmpDownload);
      if (!downloaded) continue;

      const { success } = await removeBackgroundAndVerify(tmpDownload, finalPath);
      await fs.unlink(tmpDownload).catch(() => {});

      if (success) {
        // Pixelate to 64x64 retro game sprite
        await convertToPixelArt(finalPath, 64);
        return NextResponse.json({
          url: publicUrl,
          verified: true,
          cached: false,
          candidateIndex: i,
        });
      }
    }

    // If dynamic background removal failed, fallback to curated pixel sprite
    const fallbackSrc = isSaltwater(category)
      ? path.join(process.cwd(), "public", "aquariums", "clownfish_pixel.png")
      : path.join(process.cwd(), "public", "aquariums", "neon_tetra_pixel.png");

    await fs.copyFile(fallbackSrc, finalPath);
    return NextResponse.json({
      url: publicUrl,
      verified: true,
      cached: false,
      source: "pixel_fallback",
    });
  } catch (err: any) {
    console.error("Generate pixel fish sprite error:", err);
    return NextResponse.json({ error: "Failed to generate pixel sprite" }, { status: 500 });
  }
}

function isSaltwater(category?: string): boolean {
  if (!category) return true;
  const c = category.toLowerCase();
  return c.includes("coral") || c.includes("sps") || c.includes("lps") || c.includes("softie");
}
