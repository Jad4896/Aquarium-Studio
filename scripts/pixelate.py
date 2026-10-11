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
    
    # Auto-crop any empty margins
    bbox = im.getbbox()
    if bbox:
        im = im.crop(bbox)
        
    w, h = im.size
    aspect = w / max(1, h)
    
    # Fit into a 54x42 inner bounding box inside the 64x64 canvas
    max_w = int(target_size * 0.85)
    max_h = int(target_size * 0.70)
    
    if aspect > 1.0:
        new_w = max_w
        new_h = max(16, int(max_w / aspect))
    else:
        new_h = max_h
        new_w = max(16, int(max_h * aspect))
        
    # Step 1: Downscale with bilinear filter to preserve silhouette
    small = im.resize((new_w, new_h), Image.Resampling.BILINEAR)
    
    # Step 2: Create target 64x64 canvas with transparent background
    canvas = Image.new("RGBA", (target_size, target_size), (0, 0, 0, 0))
    offset_x = (target_size - new_w) // 2
    offset_y = (target_size - new_h) // 2
    canvas.paste(small, (offset_x, offset_y), small)
    
    # Step 3: Quantize RGB channels to retro 28-color palette (no dithering for clean pixel clusters)
    alpha = canvas.split()[3]
    rgb = canvas.convert("RGB").quantize(colors=28, dither=Image.Dither.NONE).convert("RGBA")
    
    # Step 4: Re-apply crisp thresholded alpha mask
    alpha_arr = np.array(alpha) > 80
    r, g, b, _ = rgb.split()
    clean_alpha = Image.fromarray((alpha_arr * 255).astype(np.uint8))
    final = Image.merge("RGBA", (r, g, b, clean_alpha))
    
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
