#!/usr/bin/env python3
"""
remove_bg.py — Background removal and intactness verification helper.
Usage: python remove_bg.py <input_path> <output_path> [--verify]
Exits 0 on success, non-zero on failure.
Writes a transparent-background PNG to output_path.
"""
import sys
import os

def isolate_primary_subject(arr):
    import numpy as np
    from scipy import ndimage
    alpha = arr[:, :, 3]
    h, w = alpha.shape
    mask = alpha > 40

    # Label connected components
    labeled, num_features = ndimage.label(mask)
    if num_features == 0:
        return arr, False, "No opaque subject detected"

    # Find size of each component
    sizes = ndimage.sum(mask, labeled, range(1, num_features + 1))
    if len(sizes) == 0 or max(sizes) < 400:
        return arr, False, "Subject is too small or transparent"

    # Find largest component
    max_label = np.argmax(sizes) + 1
    primary_mask = labeled == max_label

    # Filter out secondary noise/other fish by zeroing out non-primary pixels
    isolated_arr = np.copy(arr)
    isolated_arr[~primary_mask] = [0, 0, 0, 0]

    # Crop to bounding box of primary component
    rows = np.any(primary_mask, axis=1)
    cols = np.any(primary_mask, axis=0)
    ymin, ymax = np.where(rows)[0][[0, -1]]
    xmin, xmax = np.where(cols)[0][[0, -1]]

    # Ensure valid bounding box
    cropped_arr = isolated_arr[ymin:ymax+1, xmin:xmax+1]

    # Check fill ratio on the isolated single organism
    bbox_area = (ymax - ymin + 1) * (xmax - xmin + 1)
    fill_ratio = np.sum(primary_mask) / max(1, bbox_area)
    if fill_ratio < 0.12:
        return cropped_arr, False, f"Subject too sparse or fragmented (fill={fill_ratio:.1%})"

    return cropped_arr, True, "Subject intact"

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

        # Extract dominant single organism and verify
        isolated_arr, is_intact, reason = isolate_primary_subject(arr)

        if verify_intactness and not is_intact:
            print(f"REJECTED:{reason}", file=sys.stderr)
            sys.exit(2)

        out_img = Image.fromarray(isolated_arr)
        out_img.save(output_path, "PNG")
        print(f"OK:{output_path}")
        sys.exit(0)
    except Exception as e:
        print(f"ERROR:{e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
