#!/usr/bin/env python3
"""
remove_bg.py — Background removal and intactness verification helper.
Usage: python remove_bg.py <input_path> <output_path> [--verify]
Exits 0 on success, non-zero on failure.
Writes a transparent-background PNG to output_path.
"""
import sys
import os

def check_color_accuracy(cropped_arr, name_lower):
    import numpy as np
    mask = cropped_arr[:, :, 3] > 40
    rgb_pixels = cropped_arr[mask][:, :3]
    if len(rgb_pixels) < 40:
        return True, "Insufficient pixels"

    # Convert RGB to HSV
    norm = rgb_pixels / 255.0
    r, g, b = norm[:, 0], norm[:, 1], norm[:, 2]
    mx = np.maximum(np.maximum(r, g), b)
    mn = np.minimum(np.minimum(r, g), b)
    df = mx - mn

    s = np.where(mx == 0, 0, df / np.maximum(1e-6, mx))
    v = mx
    h = np.zeros_like(r)
    mask_r = (mx == r) & (df > 1e-5)
    mask_g = (mx == g) & (df > 1e-5)
    mask_b = (mx == b) & (df > 1e-5)
    h[mask_r] = (60 * ((g[mask_r] - b[mask_r]) / df[mask_r]) + 360) % 360
    h[mask_g] = (60 * ((b[mask_g] - r[mask_g]) / df[mask_g]) + 120) % 360
    h[mask_b] = (60 * ((r[mask_b] - g[mask_b]) / df[mask_b]) + 240) % 360

    if "yellow" in name_lower or "gold" in name_lower:
        yellow_mask = (h >= 35) & (h <= 75) & (s > 0.20) & (v > 0.20)
        ratio = np.mean(yellow_mask)
        if ratio < 0.12:
            return False, f"Color mismatch: expected yellow, but only {ratio:.1%} pixels match (likely brown/dark morph)"

    if "blue" in name_lower:
        blue_mask = (h >= 175) & (h <= 265) & (s > 0.20) & (v > 0.20)
        ratio = np.mean(blue_mask)
        if ratio < 0.10:
            return False, f"Color mismatch: expected blue, found only {ratio:.1%} blue pixels"

    if "red" in name_lower or "flame" in name_lower or "ruby" in name_lower:
        red_mask = ((h <= 25) | (h >= 335)) & (s > 0.22) & (v > 0.20)
        ratio = np.mean(red_mask)
        if ratio < 0.10:
            return False, f"Color mismatch: expected red/flame, found only {ratio:.1%} red pixels"

    if "green" in name_lower:
        green_mask = (h >= 75) & (h <= 165) & (s > 0.20) & (v > 0.20)
        ratio = np.mean(green_mask)
        if ratio < 0.10:
            return False, f"Color mismatch: expected green, found only {ratio:.1%} green pixels"

    if "purple" in name_lower or "violet" in name_lower:
        purple_mask = (h >= 265) & (h <= 330) & (s > 0.20) & (v > 0.20)
        ratio = np.mean(purple_mask)
        if ratio < 0.10:
            return False, f"Color mismatch: expected purple, found only {ratio:.1%} purple pixels"

    if "orange" in name_lower:
        orange_mask = (h >= 15) & (h <= 45) & (s > 0.22) & (v > 0.20)
        ratio = np.mean(orange_mask)
        if ratio < 0.10:
            return False, f"Color mismatch: expected orange, found only {ratio:.1%} orange pixels"

    return True, "Color verified"

def isolate_primary_subject(arr, name=""):
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

    # Level fish horizontally if it is tilted:
    y_coords, x_coords = np.where(cropped_arr[:, :, 3] > 40)
    if len(x_coords) > 50:
        x_centered = x_coords - np.mean(x_coords)
        y_centered = y_coords - np.mean(y_coords)
        cov = np.cov(x_centered, y_centered)
        eigvals, eigvecs = np.linalg.eigh(cov)
        major_axis = eigvecs[:, np.argmax(eigvals)] # (x, y)
        angle_rad = np.arctan2(major_axis[1], major_axis[0])
        angle_deg = np.degrees(angle_rad)

        # If tilted noticeably (between 15 and 80 degrees), level it
        if abs(angle_deg) > 15 and abs(angle_deg) < 75:
            from PIL import Image
            temp_im = Image.fromarray(cropped_arr)
            rotated_im = temp_im.rotate(angle_deg, resample=Image.Resampling.BILINEAR, expand=True)
            rot_arr = np.array(rotated_im)
            rot_mask = rot_arr[:, :, 3] > 40
            r_rows = np.any(rot_mask, axis=1)
            r_cols = np.any(rot_mask, axis=0)
            if np.any(r_rows) and np.any(r_cols):
                rymin, rymax = np.where(r_rows)[0][[0, -1]]
                rxmin, rxmax = np.where(r_cols)[0][[0, -1]]
                cropped_arr = rot_arr[rymin:rymax+1, rxmin:rxmax+1]

    # Check fill ratio on the isolated single organism
    bbox_area = cropped_arr.shape[0] * cropped_arr.shape[1]
    opaque_count = np.sum(cropped_arr[:, :, 3] > 40)
    fill_ratio = opaque_count / max(1, bbox_area)
    if fill_ratio < 0.10:
        return cropped_arr, False, f"Subject too sparse or fragmented (fill={fill_ratio:.1%})"

    # ── VERIFY SIDE PROFILE ───────────────────────────────────────────────
    h_crop, w_crop = cropped_arr.shape[:2]
    aspect = w_crop / max(1, h_crop)
    name_lower = name.lower()
    is_round = any(k in name_lower for k in ["urchin", "snail", "starfish", "crab", "clam", "anemone", "coral"])
    if not is_round and aspect < 1.20:
        return cropped_arr, False, f"Subject is not in side-profile (aspect ratio {aspect:.2f} < 1.20, appears front-facing or top-down)"

    # ── VERIFY COLOR ACCURACY ─────────────────────────────────────────────
    color_ok, color_reason = check_color_accuracy(cropped_arr, name_lower)
    if not color_ok:
        return cropped_arr, False, color_reason

    return cropped_arr, True, "Subject intact, side-profile and color verified"

def main():
    if len(sys.argv) < 3:
        print("Usage: remove_bg.py <input_path> <output_path> [--verify] [--name <name>]", file=sys.stderr)
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2]
    verify_intactness = "--verify" in sys.argv

    name = ""
    for i in range(len(sys.argv)):
        if sys.argv[i] == "--name" and i + 1 < len(sys.argv):
            name = sys.argv[i + 1]

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
        isolated_arr, is_intact, reason = isolate_primary_subject(arr, name=name)

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
