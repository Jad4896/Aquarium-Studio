#!/usr/bin/env python3
"""
remove_bg.py — Background removal and intactness verification helper.
Usage: python remove_bg.py <input_path> <output_path> [--verify]
Exits 0 on success, non-zero on failure.
Writes a transparent-background PNG to output_path.
"""
import sys
import os

def check_intactness(arr):
    import numpy as np
    alpha = arr[:, :, 3]
    h, w = alpha.shape
    mask = alpha > 40
    opaque = np.sum(mask)
    if opaque < 1000:
        return False, "Subject is too small or hollow"
    
    rows = np.any(mask, axis=1)
    cols = np.any(mask, axis=0)
    if not np.any(rows) or not np.any(cols):
        return False, "Empty subject"
        
    ymin, ymax = np.where(rows)[0][[0, -1]]
    xmin, xmax = np.where(cols)[0][[0, -1]]
    
    # Check if subject was truncated by the outer image boundary
    # If the boundary of the image slices through a large number of opaque pixels,
    # the fish's head/tail was cut off in the camera frame.
    touches = [
        np.sum(mask[0, :]) / w if ymin == 0 else 0,
        np.sum(mask[-1, :]) / w if ymax == h - 1 else 0,
        np.sum(mask[:, 0]) / h if xmin == 0 else 0,
        np.sum(mask[:, -1]) / h if xmax == w - 1 else 0,
    ]
    max_touch = max(touches)
    if max_touch > 0.05:
        return False, f"Subject truncated by photo boundary ({max_touch:.1%})"
        
    # Check fill ratio inside bounding box
    bbox_area = (ymax - ymin + 1) * (xmax - xmin + 1)
    fill_ratio = opaque / bbox_area
    if fill_ratio < 0.20:
        return False, f"Subject is fragmented or hollow (fill={fill_ratio:.1%})"

    return True, "Subject intact"

def main():
    if len(sys.argv) < 3:
        print("Usage: remove_bg.py <input_path> <output_path> [--verify]", file=sys.stderr)
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2]
    verify_intactness = "--verify" in sys.argv

    if not os.path.exists(input_path):
        print(f"Input file not found: {input_path}", file=sys.stderr)
        sys.exit(1)

    try:
        import rembg
        from PIL import Image
        import numpy as np
        import io

        with open(input_path, "rb") as f:
            img_data = f.read()

        # Remove background — returns PNG bytes with RGBA
        result_bytes = rembg.remove(img_data)

        # Load into PIL
        img = Image.open(io.BytesIO(result_bytes))
        if img.mode != "RGBA":
            img = img.convert("RGBA")

        arr = np.array(img)

        if verify_intactness:
            is_intact, reason = check_intactness(arr)
            if not is_intact:
                print(f"REJECTED:{reason}", file=sys.stderr)
                sys.exit(2) # Code 2 means rejected quality check

        img.save(output_path, "PNG")
        print(f"OK:{output_path}")
        sys.exit(0)
    except Exception as e:
        print(f"ERROR:{e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
