#!/usr/bin/env python3
"""
pixelate.py — Transforms an image into a crisp 16-bit retro pixel art sprite.
Usage: python pixelate.py <input_path> <output_path> [target_size=64]
"""
import sys
import os
from PIL import Image
import numpy as np

def convert_to_pixel_art(input_path, output_path, target_size=64):
    if not os.path.exists(input_path):
        print(f"File not found: {input_path}", file=sys.stderr)
        return False

    im = Image.open(input_path).convert("RGBA")
    
    # Crop tightly to non-empty bounding box so fish takes full resolution
    bbox = im.getbbox()
    if bbox:
        im = im.crop(bbox)
        
    w, h = im.size
    aspect = w / max(1, h)
    
    # Scale to full target resolution (e.g. 96px base) to retain rich pixel features
    target_res = max(target_size, 96)
    if aspect > 1.0:
        new_w = target_res
        new_h = max(24, int(target_res / aspect))
    else:
        new_h = target_res
        new_w = max(24, int(target_res * aspect))
        
    # Step 1: High-fidelity downsample
    small = im.resize((new_w, new_h), Image.Resampling.BILINEAR)
    
    # Step 2: Crisp 16-bit color quantization (36 rich colors, no dithering)
    alpha = small.split()[3]
    rgb = small.convert("RGB").quantize(colors=36, dither=Image.Dither.NONE).convert("RGBA")
    
    # Step 3: Re-apply clean alpha mask
    alpha_arr = np.array(alpha) > 60
    r, g, b, _ = rgb.split()
    clean_alpha = Image.fromarray((alpha_arr * 255).astype(np.uint8))
    final = Image.merge("RGBA", (r, g, b, clean_alpha))

    # Auto-crop final sprite so it has NO empty padding margins
    final_bbox = final.getbbox()
    if final_bbox:
        final = final.crop(final_bbox)
    
    final.save(output_path, "PNG")
    print(f"OK:{output_path}")
    return True

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: pixelate.py <input_path> <output_path> [target_size=64]", file=sys.stderr)
        sys.exit(1)
        
    in_p = sys.argv[1]
    out_p = sys.argv[2]
    size = int(sys.argv[3]) if len(sys.argv) > 3 else 64
    
    if convert_to_pixel_art(in_p, out_p, size):
        sys.exit(0)
    else:
        sys.exit(1)
