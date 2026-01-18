# Phase 1, Plan 2: Programmatic Line Art Generation

## Objective

Extend the validated silhouette pipeline to generate clean line art drawings instead of solid black shapes. Line art preserves ship details (superstructure, radar, guns) while maintaining a recognizable outline.

**Why this matters**: Solid silhouettes lose important distinguishing features. Line art preserves details that help players identify specific ship classes.

## Success Criteria

- [ ] Working programmatic line art pipeline (no AI APIs)
- [ ] Tested on existing 21 test images
- [ ] >80% produce recognizable line drawings with visible ship details
- [ ] Processing time <5s per image
- [ ] Deterministic output (same input → same output)
- [ ] Quality improvement over basic Canny edge detection

## Context

**From LINE-ART-RESEARCH.md:**
- Recommended: Adaptive threshold pipeline with bilateral filter
- Library: OpenCV.js (@techstark/opencv-js) for bilateral filter + adaptive threshold
- Sharp + @imgly already working for background removal
- Key techniques: bilateral filter (edge-preserving smoothing) + adaptive threshold (region-based binarization)

**Existing Infrastructure:**
- `scripts/silhouette-poc/` - Working project with dependencies
- 21 test images with manifest
- @imgly background removal validated at 100%
- Sharp for image I/O

**Constraint**: Must be purely programmatic - no AI image generation APIs (FLUX tried but rejected due to API dependency).

## Tasks

### Task 1: Add OpenCV.js Dependency

Install OpenCV.js for advanced image processing.

```bash
cd scripts/silhouette-poc
npm install @techstark/opencv-js
```

Create a test file to verify OpenCV.js loads correctly:

```typescript
// src/test-opencv.ts
import cv from '@techstark/opencv-js';

async function testOpenCV() {
  console.log('Initializing OpenCV.js...');

  // OpenCV.js requires async initialization
  await new Promise<void>((resolve) => {
    if (cv.Mat) {
      resolve();
    } else {
      cv.onRuntimeInitialized = () => resolve();
    }
  });

  console.log('OpenCV.js ready');
  console.log('Version:', cv.getVersionString?.() || 'loaded');

  // Quick smoke test
  const mat = new cv.Mat(100, 100, cv.CV_8UC1);
  console.log('Created test mat:', mat.rows, 'x', mat.cols);
  mat.delete();

  console.log('✓ OpenCV.js working');
}

testOpenCV().catch(console.error);
```

Run: `npx ts-node --esm src/test-opencv.ts`

**Output:** OpenCV.js installed and verified working

---

### Task 2: Implement Line Art Pipeline

Create `src/lineart.ts` with the adaptive threshold pipeline:

```typescript
import cv from '@techstark/opencv-js';
import sharp from 'sharp';
import { removeBackground } from '@imgly/background-removal-node';
import { readFile, writeFile } from 'fs/promises';

// Initialize OpenCV once
let cvReady = false;
async function initCV(): Promise<void> {
  if (cvReady) return;
  await new Promise<void>((resolve) => {
    if (cv.Mat) {
      resolve();
    } else {
      cv.onRuntimeInitialized = () => resolve();
    }
  });
  cvReady = true;
}

export interface LineArtOptions {
  /** Output width in pixels (default: 1000) */
  outputWidth?: number;
  /** Bilateral filter diameter (default: 9, lower = faster) */
  bilateralD?: number;
  /** Bilateral color sigma (default: 75) */
  bilateralSigmaColor?: number;
  /** Bilateral space sigma (default: 75) */
  bilateralSigmaSpace?: number;
  /** Adaptive threshold block size (default: 11, must be odd) */
  adaptiveBlockSize?: number;
  /** Adaptive threshold constant C (default: 2) */
  adaptiveC?: number;
  /** Line thickness adjustment via morphology (default: 1) */
  lineThickness?: number;
  /** Skip background removal (for testing) */
  skipBackgroundRemoval?: boolean;
}

export interface LineArtResult {
  success: boolean;
  timeMs: number;
  error?: string;
  dimensions?: { width: number; height: number };
}

/**
 * Convert Sharp buffer to OpenCV Mat.
 * Assumes RGBA 4-channel input.
 */
function bufferToMat(buffer: Buffer, width: number, height: number): cv.Mat {
  const mat = new cv.Mat(height, width, cv.CV_8UC4);
  mat.data.set(buffer);
  return mat;
}

/**
 * Convert OpenCV Mat to Sharp-compatible buffer.
 */
function matToBuffer(mat: cv.Mat): Buffer {
  return Buffer.from(mat.data);
}

/**
 * Generate line art from a ship photograph.
 *
 * Pipeline:
 * 1. Background removal (@imgly)
 * 2. Convert to grayscale
 * 3. Bilateral filter (edge-preserving smoothing)
 * 4. Adaptive threshold (region-based binarization)
 * 5. Optional morphological adjustment
 * 6. Composite onto white background
 */
export async function generateLineArt(
  inputPath: string,
  outputPath: string,
  options: LineArtOptions = {}
): Promise<LineArtResult> {
  const start = Date.now();

  try {
    await initCV();

    // 1. Read and preprocess for background removal
    const inputBuffer = await readFile(inputPath);
    const preprocessed = await sharp(inputBuffer)
      .resize(options.outputWidth ?? 1000, null, { withoutEnlargement: true })
      .toColorspace('srgb')
      .ensureAlpha()
      .png()
      .toBuffer();

    // 2. Remove background (or skip for testing)
    let noBgBuffer: Buffer;
    if (options.skipBackgroundRemoval) {
      noBgBuffer = preprocessed;
    } else {
      const blob = new Blob([preprocessed], { type: 'image/png' });
      const resultBlob = await removeBackground(blob);
      noBgBuffer = Buffer.from(await resultBlob.arrayBuffer());
    }

    // Get dimensions
    const { data, info } = await sharp(noBgBuffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { width, height } = info;

    // 3. Load into OpenCV
    const src = bufferToMat(data, width, height);
    const gray = new cv.Mat();
    const bilateral = new cv.Mat();
    const binary = new cv.Mat();
    const output = new cv.Mat();

    // 4. Convert to grayscale
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

    // 5. Bilateral filter (edge-preserving smoothing)
    cv.bilateralFilter(
      gray,
      bilateral,
      options.bilateralD ?? 9,
      options.bilateralSigmaColor ?? 75,
      options.bilateralSigmaSpace ?? 75
    );

    // 6. Adaptive threshold
    cv.adaptiveThreshold(
      bilateral,
      binary,
      255,
      cv.ADAPTIVE_THRESH_GAUSSIAN_C,
      cv.THRESH_BINARY,
      options.adaptiveBlockSize ?? 11,
      options.adaptiveC ?? 2
    );

    // 7. Optional: adjust line thickness with morphology
    const thickness = options.lineThickness ?? 1;
    if (thickness > 1) {
      const kernel = cv.getStructuringElement(
        cv.MORPH_ELLIPSE,
        new cv.Size(thickness, thickness)
      );
      cv.dilate(binary, binary, kernel);
      kernel.delete();
    }

    // 8. Apply alpha mask from original (keep only ship area)
    // Invert binary (we want black lines on white)
    // and mask with original alpha
    cv.cvtColor(binary, output, cv.COLOR_GRAY2RGBA);

    // Apply original alpha mask
    const outputData = matToBuffer(output);
    for (let i = 0; i < outputData.length; i += 4) {
      const originalAlpha = data[i + 3];
      if (originalAlpha < 128) {
        // Outside ship - make white (will be background)
        outputData[i] = 255;
        outputData[i + 1] = 255;
        outputData[i + 2] = 255;
        outputData[i + 3] = 255;
      } else {
        // Inside ship - keep the line art (black on white)
        outputData[i + 3] = 255; // Full opacity
      }
    }

    // 9. Export
    const lineArt = await sharp(outputData, {
      raw: { width, height, channels: 4 }
    })
      .flatten({ background: { r: 255, g: 255, b: 255 } }) // White background
      .png()
      .toBuffer();

    await writeFile(outputPath, lineArt);

    // Cleanup
    src.delete();
    gray.delete();
    bilateral.delete();
    binary.delete();
    output.delete();

    return {
      success: true,
      timeMs: Date.now() - start,
      dimensions: { width, height }
    };
  } catch (error) {
    return {
      success: false,
      timeMs: Date.now() - start,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
```

**Output:** Working line art generation function

---

### Task 3: Create Single-Image Test Tool

Create `src/lineart-single.ts` for testing individual images:

```typescript
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { generateLineArt, LineArtOptions } from './lineart.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: npx ts-node --esm src/lineart-single.ts <image> [options]');
    console.log('');
    console.log('Options:');
    console.log('  --block=N       Adaptive threshold block size (default: 11)');
    console.log('  --c=N           Adaptive threshold constant (default: 2)');
    console.log('  --bilateral=N   Bilateral filter diameter (default: 9)');
    console.log('  --sigma=N       Bilateral sigma color/space (default: 75)');
    console.log('  --thickness=N   Line thickness (default: 1)');
    console.log('  --no-bg-remove  Skip background removal');
    process.exit(1);
  }

  const imageName = args[0];
  const inputPath = join(__dirname, '../test-images', imageName);
  const outputPath = join(__dirname, '../output/lineart', imageName.replace(/\.\w+$/, '-lineart.png'));

  // Parse options from args
  const options: LineArtOptions = {};
  for (const arg of args.slice(1)) {
    const [key, value] = arg.split('=');
    switch (key) {
      case '--block':
        options.adaptiveBlockSize = parseInt(value);
        break;
      case '--c':
        options.adaptiveC = parseInt(value);
        break;
      case '--bilateral':
        options.bilateralD = parseInt(value);
        break;
      case '--sigma':
        options.bilateralSigmaColor = parseInt(value);
        options.bilateralSigmaSpace = parseInt(value);
        break;
      case '--thickness':
        options.lineThickness = parseInt(value);
        break;
      case '--no-bg-remove':
        options.skipBackgroundRemoval = true;
        break;
    }
  }

  console.log(`Processing: ${imageName}`);
  console.log(`Options:`, options);

  const result = await generateLineArt(inputPath, outputPath, options);

  if (result.success) {
    console.log(`✓ Success in ${result.timeMs}ms`);
    console.log(`  Output: ${outputPath}`);
    console.log(`  Dimensions: ${result.dimensions?.width}x${result.dimensions?.height}`);
  } else {
    console.log(`✗ Failed: ${result.error}`);
  }
}

main().catch(console.error);
```

Add to package.json scripts:
```json
{
  "scripts": {
    "lineart": "ts-node --esm src/lineart-single.ts",
    "lineart:test": "ts-node --esm src/lineart-runner.ts"
  }
}
```

**Output:** Single-image testing tool for parameter tuning

---

### Task 4: Create Batch Test Runner

Create `src/lineart-runner.ts`:

```typescript
import { readFile, mkdir, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { generateLineArt, LineArtOptions } from './lineart.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface TestResult {
  filename: string;
  name: string;
  era: string;
  type: string;
  success: boolean;
  timeMs: number;
  error?: string;
}

async function runTests(options: LineArtOptions = {}) {
  const inputDir = join(__dirname, '../test-images');
  const outputDir = join(__dirname, '../output/lineart');

  await mkdir(outputDir, { recursive: true });

  const manifest = JSON.parse(
    await readFile(join(inputDir, 'manifest.json'), 'utf-8')
  );

  const results: TestResult[] = [];
  let totalTime = 0;

  console.log('═'.repeat(60));
  console.log('🎨 Line Art Generation Test');
  console.log(`Images: ${manifest.length}`);
  console.log(`Options:`, JSON.stringify(options, null, 2));
  console.log('═'.repeat(60));

  for (const entry of manifest) {
    const inputPath = join(inputDir, entry.filename);
    const outputPath = join(outputDir, entry.filename.replace(/\.\w+$/, '-lineart.png'));

    console.log(`\nProcessing: ${entry.name}...`);

    const result = await generateLineArt(inputPath, outputPath, options);
    totalTime += result.timeMs;

    results.push({
      filename: entry.filename,
      name: entry.name,
      era: entry.era,
      type: entry.type,
      success: result.success,
      timeMs: result.timeMs,
      error: result.error
    });

    const status = result.success ? '✓' : '✗';
    console.log(`  ${status} ${result.timeMs}ms${result.error ? ` - ${result.error}` : ''}`);
  }

  // Summary
  const successes = results.filter(r => r.success).length;
  const avgTime = totalTime / results.length;

  console.log('\n' + '═'.repeat(60));
  console.log('📊 Summary');
  console.log('═'.repeat(60));
  console.log(`Success rate: ${successes}/${results.length} (${((successes/results.length)*100).toFixed(1)}%)`);
  console.log(`Average time: ${avgTime.toFixed(0)}ms`);
  console.log(`Total time: ${(totalTime/1000).toFixed(1)}s`);

  // By era
  console.log('\nBy Era:');
  const byEra = new Map<string, { success: number; total: number }>();
  for (const r of results) {
    const entry = byEra.get(r.era) || { success: 0, total: 0 };
    entry.total++;
    if (r.success) entry.success++;
    byEra.set(r.era, entry);
  }
  for (const [era, stats] of byEra) {
    console.log(`  ${era}: ${stats.success}/${stats.total}`);
  }

  // By type
  console.log('\nBy Type:');
  const byType = new Map<string, { success: number; total: number }>();
  for (const r of results) {
    const entry = byType.get(r.type) || { success: 0, total: 0 };
    entry.total++;
    if (r.success) entry.success++;
    byType.set(r.type, entry);
  }
  for (const [type, stats] of byType) {
    console.log(`  ${type}: ${stats.success}/${stats.total}`);
  }

  // Save results
  await writeFile(
    join(outputDir, 'results.json'),
    JSON.stringify({ options, results, summary: { successes, total: results.length, avgTimeMs: avgTime } }, null, 2)
  );

  console.log(`\nOutput: ${outputDir}`);

  return results;
}

// Run with default options
runTests().catch(console.error);
```

**Output:** Batch test runner with statistics

---

### Task 5: Run Initial Tests and Evaluate Quality

1. Run the test suite:
   ```bash
   npm run lineart:test
   ```

2. Manually review output images in `output/lineart/`:
   - Are ship details visible (superstructure, masts, radar)?
   - Are lines clean and not overly noisy?
   - Is the overall ship shape recognizable?

3. Compare to existing silhouettes in `output/`:
   - Does line art preserve more detail?
   - Would this help players distinguish ship classes?

**Output:** Initial quality assessment

---

### Task 6: Parameter Tuning

If initial results are not satisfactory, tune parameters:

| Issue | Adjustment |
|-------|------------|
| Lines too thick/blobby | Increase `adaptiveBlockSize` to 15-21 |
| Lines too thin/broken | Decrease `adaptiveBlockSize` to 7-9 |
| Too much noise | Increase `bilateralD` to 11-15 (slower) |
| Lines too faint | Decrease `adaptiveC` to 1 or 0 |
| Lost fine detail | Decrease `bilateralSigmaColor` to 50 |

Test parameter variations on problem images:
```bash
npm run lineart -- bismarck.jpg --block=15 --c=1 --bilateral=11
```

Create parameter presets for different ship types if needed.

**Output:** Tuned parameters documented

---

### Task 7: Alternative Approach - Pencil Sketch (If Needed)

If adaptive threshold doesn't produce good results, implement the pencil sketch (dodge blend) approach:

Create `src/lineart-sketch.ts`:

```typescript
import sharp from 'sharp';
import { removeBackground } from '@imgly/background-removal-node';
import { readFile, writeFile } from 'fs/promises';

export interface SketchOptions {
  outputWidth?: number;
  blurSigma?: number;  // Higher = clearer sketch
  threshold?: number;  // Optional: convert to binary
}

/**
 * Pencil sketch effect using dodge blend technique.
 * Formula: sketch = grayscale / (255 - blur(invert(grayscale)))
 */
export async function generateSketch(
  inputPath: string,
  outputPath: string,
  options: SketchOptions = {}
): Promise<{ success: boolean; timeMs: number; error?: string }> {
  const start = Date.now();

  try {
    const inputBuffer = await readFile(inputPath);

    // Preprocess and remove background
    const preprocessed = await sharp(inputBuffer)
      .resize(options.outputWidth ?? 1000, null, { withoutEnlargement: true })
      .toColorspace('srgb')
      .ensureAlpha()
      .png()
      .toBuffer();

    const blob = new Blob([preprocessed], { type: 'image/png' });
    const resultBlob = await removeBackground(blob);
    const noBgBuffer = Buffer.from(await resultBlob.arrayBuffer());

    // Get raw grayscale data
    const { data: grayData, info } = await sharp(noBgBuffer)
      .grayscale()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { width, height } = info;

    // Invert grayscale
    const inverted = Buffer.alloc(grayData.length);
    for (let i = 0; i < grayData.length; i++) {
      inverted[i] = 255 - grayData[i];
    }

    // Blur inverted
    const blurred = await sharp(inverted, { raw: { width, height, channels: 1 } })
      .blur(options.blurSigma ?? 21)
      .raw()
      .toBuffer();

    // Dodge blend: gray / (255 - blurred)
    const sketch = Buffer.alloc(grayData.length);
    for (let i = 0; i < grayData.length; i++) {
      const gray = grayData[i];
      const blur = blurred[i];
      const divisor = 255 - blur;

      if (divisor === 0) {
        sketch[i] = 255;
      } else {
        const value = Math.min(255, Math.floor((gray * 256) / divisor));
        sketch[i] = value;
      }
    }

    // Optional: threshold to binary
    if (options.threshold !== undefined) {
      for (let i = 0; i < sketch.length; i++) {
        sketch[i] = sketch[i] > options.threshold ? 255 : 0;
      }
    }

    // Export
    const output = await sharp(sketch, { raw: { width, height, channels: 1 } })
      .png()
      .toBuffer();

    await writeFile(outputPath, output);

    return { success: true, timeMs: Date.now() - start };
  } catch (error) {
    return {
      success: false,
      timeMs: Date.now() - start,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
```

Compare sketch results to adaptive threshold results.

**Output:** Alternative implementation for comparison

---

### Task 8: Document Results

Create `LINEART-RESULTS.md` in the POC directory:

```markdown
# Line Art POC Results

## Test Run: [Date]

### Approach Used
[Adaptive Threshold / Pencil Sketch / Other]

### Parameters
```json
{
  "bilateralD": 9,
  "bilateralSigmaColor": 75,
  "adaptiveBlockSize": 11,
  "adaptiveC": 2
}
```

### Summary
- **Total images**: 21
- **Success rate**: X%
- **Average processing time**: Xms

### Quality Assessment

| Image | Quality | Details Visible | Notes |
|-------|---------|-----------------|-------|
| uss-enterprise-cv6.jpg | Good/Fair/Poor | Y/N | ... |
| ... | ... | ... | ... |

### Comparison to Silhouettes

| Aspect | Silhouette | Line Art | Winner |
|--------|------------|----------|--------|
| Processing time | 1.5s | Xs | ... |
| Detail preservation | Low | Medium/High | Line Art |
| Recognizability | Good | Good/Better | ... |
| File size | Xkb | Xkb | ... |

### Recommendation
[Use line art / Stick with silhouettes / Hybrid approach]

### Next Steps
- [ ] Proceed to Phase 2 with chosen approach
- [ ] OR further tune parameters
- [ ] OR try additional techniques
```

**Output:** Documented results and recommendation

---

## Verification

After completing all tasks:

1. **Line art exists**: `ls scripts/silhouette-poc/output/lineart/*.png` shows 21 files
2. **Success rate**: Check `output/lineart/results.json` for >80% success
3. **Quality check**: Manually review 5 random line art images
4. **Performance**: Average time in results.json <5000ms
5. **Deterministic**: Run same image twice, compare outputs (should be identical)

## Output

- `scripts/silhouette-poc/src/lineart.ts` - Line art generation function
- `scripts/silhouette-poc/src/lineart-single.ts` - Single-image test tool
- `scripts/silhouette-poc/src/lineart-runner.ts` - Batch test runner
- `scripts/silhouette-poc/output/lineart/` - Generated line art images
- `scripts/silhouette-poc/LINEART-RESULTS.md` - Quality assessment

## Checkpoint

**Before proceeding:**
- [ ] Line art pipeline produces recognizable ship drawings
- [ ] Quality is better than basic Canny (mentioned as "decent" in STATE.md)
- [ ] Processing is deterministic (no AI APIs)
- [ ] Decision made on line art vs silhouette for final game

**If <80% success rate after tuning:**
1. Try pencil sketch approach (Task 7)
2. Try combining approaches (edge detection + adaptive threshold)
3. Consider falling back to silhouettes with enhanced detail
4. STOP and reassess before Phase 2

---
*Created: 2026-01-18*
