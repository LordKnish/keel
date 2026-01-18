# Phase 1 Research: Silhouette Generation

## Problem Statement

Generate clean hull-profile silhouettes from ship photographs automatically (no manual cleanup). Must work at scale (1000+ ships) with varied image quality, backgrounds, and lighting conditions.

## Recommended Approach

**Two-stage pipeline:**
1. **Background Removal** → AI-based segmentation to isolate ship from water/sky
2. **Silhouette Conversion** → Threshold to solid black shape

This is more reliable than pure edge detection because ship photos have complex backgrounds (water reflections, sky gradients, other vessels).

---

## Stage 1: Background Removal Libraries

### Recommended: @imgly/background-removal-node

**Why**: Free, runs locally, no API costs, AGPL license, good quality.

```bash
npm install @imgly/background-removal-node
```

```typescript
import { removeBackground } from '@imgly/background-removal-node';

const blob = await removeBackground(imageBuffer);
// Returns PNG with transparent background
```

**Pros:**
- No external API calls (privacy, no rate limits)
- Runs in Node.js or browser
- Good quality for general objects
- Free under AGPL

**Cons:**
- First run downloads ~180MB model
- Slower than cloud APIs (~2-5s per image)
- May struggle with water reflections

**Source:** [GitHub - imgly/background-removal-js](https://github.com/imgly/background-removal-js)

### Alternative: rembg (Python)

**Why**: More models available, better for batch processing if Python is acceptable.

```bash
pip install "rembg[cpu]"
```

```python
from rembg import remove, new_session
from PIL import Image

session = new_session("u2net")  # Reuse for batch
output = remove(Image.open("ship.jpg"), session=session)
output.save("ship_nobg.png")
```

**Available Models:**
- `u2net` - General purpose, good quality
- `u2netp` - Lightweight, faster
- `silueta` - Smaller (43MB), decent quality
- `isnet-general-use` - Good for objects
- `birefnet-general` - State-of-the-art accuracy

**Pros:**
- Multiple model choices for quality/speed tradeoff
- Session reuse improves batch performance
- More battle-tested for object segmentation

**Cons:**
- Python dependency (could wrap in subprocess or HTTP server)
- Models 40-200MB each

**Source:** [GitHub - danielgatis/rembg](https://github.com/danielgatis/rembg)

### Avoid: Cloud APIs (remove.bg, etc.)

- Free tiers have low resolution (0.25MP)
- Per-image costs add up at 1000+ scale
- Network dependency for batch processing

---

## Stage 2: Silhouette Conversion

After background removal, convert transparent PNG to solid black silhouette.

### Approach: Threshold + Fill

```typescript
// Using Sharp for Node.js
import sharp from 'sharp';

async function toSilhouette(inputPath: string, outputPath: string) {
  await sharp(inputPath)
    .ensureAlpha()
    .extractChannel('alpha')      // Get alpha channel as grayscale
    .threshold(128)               // Binary threshold
    .negate()                     // Invert (black ship, white bg) -> (white ship, black bg)
    .toColourspace('b-w')
    // Now we have white ship on black background
    // To get black silhouette on transparent:
    .toFile(outputPath);
}
```

**Better approach - preserve as black shape:**

```typescript
async function createSilhouette(pngWithTransparency: Buffer): Promise<Buffer> {
  const { data, info } = await sharp(pngWithTransparency)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // For each pixel: if alpha > 128, make it black; else transparent
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    if (alpha > 128) {
      data[i] = 0;     // R
      data[i + 1] = 0; // G
      data[i + 2] = 0; // B
      data[i + 3] = 255; // Full opacity
    } else {
      data[i + 3] = 0; // Transparent
    }
  }

  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toBuffer();
}
```

**Source:** [Sharp - High performance Node.js image processing](https://sharp.pixelplumbing.com/)

---

## Edge Detection (Alternative Approach)

If background removal proves unreliable, pure edge detection can extract outlines.

### CannyJS (Browser)

```typescript
import CannyJS from 'cannyjs';

// ht=high threshold, lt=low threshold
CannyJS.canny(canvas, 100, 50, 1.4, 5);
```

**Source:** [GitHub - yuta1984/CannyJS](https://github.com/yuta1984/CannyJS)

### Sobel Filter (Node/Browser)

```typescript
import Sobel from 'sobel';

const imageData = ctx.getImageData(0, 0, width, height);
const sobelData = Sobel(imageData);
const sobelImageData = sobelData.toImageData();
```

**Source:** [GitHub - miguelmota/sobel](https://github.com/miguelmota/sobel)

### Why Edge Detection Alone Won't Work

- Ship photos have busy backgrounds (water waves, clouds, horizon)
- Edge detection finds ALL edges, not just the ship outline
- Would require manual masking or perfect studio backgrounds

---

## Ship Photo Challenges

### Common Issues

| Challenge | Impact | Mitigation |
|-----------|--------|------------|
| Water reflections | Ship extends into reflection | Crop below waterline or accept longer silhouette |
| Low contrast (gray ship, gray sky) | Poor segmentation | May need preprocessing (contrast boost) |
| Multiple ships in frame | Wrong ship detected | Manual curation or accept primary subject |
| Partial occlusion (dock, other ships) | Incomplete silhouette | Source images from profile/side views |
| Old/grainy photos | Noisy edges | Blur before threshold |

### Image Quality Requirements

For best results, source images should be:
- **Side profile view** (broadside) - shows distinctive hull shape
- **Clear separation** from background (sky or sea horizon)
- **Moderate resolution** (1000px+ width)
- **Good lighting** - avoid heavy shadows or silhouettes against sun

### Pre-processing Pipeline

```typescript
async function preprocessForSilhouette(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .resize(1500, null, { withoutEnlargement: true }) // Normalize size
    .modulate({ brightness: 1.1 })                    // Slight brightness boost
    .sharpen()                                        // Sharpen edges
    .toBuffer();
}
```

---

## Recommended Stack

```
┌─────────────────────────────────────────────────┐
│  Input: Ship Photo (JPEG/PNG)                   │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  Pre-process: Sharp                             │
│  - Resize to consistent width                   │
│  - Boost contrast/brightness                    │
│  - Sharpen                                      │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  Background Removal: @imgly/background-removal  │
│  OR rembg via subprocess/HTTP                   │
│  Output: PNG with transparent background        │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  Silhouette: Sharp                              │
│  - Extract alpha channel                        │
│  - Threshold to binary                          │
│  - Fill black                                   │
│  Output: Black silhouette on transparent        │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  Post-process: Sharp                            │
│  - Remove small artifacts (morphological ops)   │
│  - Center and crop to bounds                    │
│  - Export as PNG                                │
└─────────────────────────────────────────────────┘
```

---

## POC Test Plan

### Phase 1a: Library Evaluation

1. Collect 20-30 diverse ship photos:
   - Mix of eras (sail, WWII, modern)
   - Mix of ship types (battleship, carrier, destroyer, submarine)
   - Mix of image quality (museum photos, historical, Wikipedia)

2. Test each approach:
   - @imgly/background-removal-node + Sharp threshold
   - rembg (u2net) + Sharp threshold
   - rembg (silueta) + Sharp threshold

3. Evaluate on:
   - **Silhouette quality** - Is hull profile recognizable?
   - **Edge cleanliness** - Smooth outline or jagged?
   - **Processing time** - Acceptable for batch?
   - **Failure rate** - How many need manual intervention?

### Phase 1b: Pipeline Tuning

1. Identify failure patterns
2. Add preprocessing for problem cases
3. Tune threshold values
4. Add post-processing (artifact removal)

### Success Metrics

- **>90%** of test images produce recognizable silhouettes
- **<5s** processing time per image
- **Zero** manual intervention required

---

## What NOT to Hand-Roll

| Component | Use Instead | Why |
|-----------|-------------|-----|
| Background removal ML | @imgly or rembg | Training segmentation models requires massive datasets |
| Edge detection algorithms | CannyJS, Sobel | Well-tested implementations exist |
| Image manipulation | Sharp | libvips is 4-5x faster than ImageMagick |
| Binary morphology | Sharp or OpenCV.js | Erosion/dilation need optimized implementations |

---

## Dependencies to Install

**Node.js (recommended):**
```bash
npm install sharp @imgly/background-removal-node
```

**If using Python rembg:**
```bash
pip install "rembg[cpu]"
# Then call via subprocess or wrap in HTTP server
```

---

## Sources

- [GitHub - imgly/background-removal-js](https://github.com/imgly/background-removal-js) - Browser/Node background removal
- [npm - @imgly/background-removal-node](https://www.npmjs.com/package/@imgly/background-removal-node) - Node.js package
- [GitHub - danielgatis/rembg](https://github.com/danielgatis/rembg) - Python background removal with multiple models
- [Sharp - High performance Node.js image processing](https://sharp.pixelplumbing.com/) - Image manipulation
- [GitHub - yuta1984/CannyJS](https://github.com/yuta1984/CannyJS) - Canny edge detection
- [GitHub - miguelmota/sobel](https://github.com/miguelmota/sobel) - Sobel edge detection
- [Inspekt Labs - Background Removal Challenges](https://inspektlabs.com/blog/challenges-of-background-removal-and-how-deep-learning-overcomes-them/) - Common issues and solutions
- [Photoroom - Background Remover Mistakes](https://www.photoroom.com/blog/background-remover-mistakes) - Best practices

---
*Last updated: 2026-01-18*
