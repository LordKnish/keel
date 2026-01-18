# Phase 1, Plan 1: Silhouette Generation POC

## Objective

Build and validate a fully automated silhouette generation pipeline that produces recognizable ship hull outlines from photographs. This is the core differentiator - if silhouettes don't work, the game concept fails.

## Success Criteria

- [ ] Working Node.js script that takes a ship photo and outputs a black silhouette
- [ ] Tested on 20+ diverse ship images (mix of eras, types, image quality)
- [ ] >90% of test images produce recognizable silhouettes
- [ ] <5s processing time per image
- [ ] Zero manual intervention required
- [ ] Documented quality metrics and failure patterns

## Context

**From Research (RESEARCH.md):**
- Two-stage pipeline: AI background removal → threshold to black silhouette
- Primary library: @imgly/background-removal-node (free, local, AGPL)
- Fallback: rembg (Python) if imgly quality insufficient
- Sharp for all image manipulation

**Key Challenges:**
- Water reflections may extend silhouette below waterline
- Low contrast (gray ship on gray sky) needs preprocessing
- Side profile views work best for recognizable shapes

## Tasks

### Task 1: Project Setup for POC Scripts

Create a minimal Node.js project for the POC scripts.

```bash
# In project root
mkdir -p scripts/silhouette-poc
cd scripts/silhouette-poc
npm init -y
npm install sharp @imgly/background-removal-node typescript ts-node @types/node
```

Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "strict": true,
    "outDir": "./dist"
  }
}
```

**Output:** `scripts/silhouette-poc/` with package.json and dependencies

---

### Task 2: Collect Test Images

Create a test dataset of 20-30 ship photos covering:
- **Eras**: Sailing ships (2-3), WWI/WWII (8-10), Cold War (5-6), Modern (5-6)
- **Types**: Battleship, aircraft carrier, destroyer, submarine, cruiser
- **Quality**: High-res museum photos, historical grainy, Wikipedia commons

Sources:
- Wikimedia Commons (public domain)
- Naval History and Heritage Command (US Navy, public domain)
- Wikipedia ship articles

Create `scripts/silhouette-poc/test-images/` directory and download images.
Create `scripts/silhouette-poc/test-images/manifest.json` listing each image with metadata:

```json
[
  {
    "filename": "uss-enterprise-cv6.jpg",
    "name": "USS Enterprise (CV-6)",
    "era": "WWII",
    "type": "aircraft carrier",
    "nation": "USA",
    "source": "Wikimedia Commons",
    "quality": "high"
  }
]
```

**Output:** 20+ test images with manifest

---

### Task 3: Implement Silhouette Pipeline

Create `scripts/silhouette-poc/src/silhouette.ts`:

```typescript
import sharp from 'sharp';
import { removeBackground } from '@imgly/background-removal-node';
import { readFile, writeFile } from 'fs/promises';

export interface SilhouetteOptions {
  preprocessBrightness?: number;  // Default 1.1
  thresholdValue?: number;        // Default 128
  outputWidth?: number;           // Default 1000
}

export async function generateSilhouette(
  inputPath: string,
  outputPath: string,
  options: SilhouetteOptions = {}
): Promise<{ success: boolean; timeMs: number; error?: string }> {
  const start = Date.now();

  try {
    // 1. Read and preprocess
    const inputBuffer = await readFile(inputPath);
    const preprocessed = await sharp(inputBuffer)
      .resize(options.outputWidth ?? 1000, null, { withoutEnlargement: true })
      .modulate({ brightness: options.preprocessBrightness ?? 1.1 })
      .sharpen()
      .png()
      .toBuffer();

    // 2. Remove background
    const blob = await removeBackground(preprocessed);
    const noBgBuffer = Buffer.from(await blob.arrayBuffer());

    // 3. Convert to silhouette
    const { data, info } = await sharp(noBgBuffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Make all non-transparent pixels black
    const threshold = options.thresholdValue ?? 128;
    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3];
      if (alpha > threshold) {
        data[i] = 0;       // R
        data[i + 1] = 0;   // G
        data[i + 2] = 0;   // B
        data[i + 3] = 255; // Full opacity
      } else {
        data[i + 3] = 0;   // Transparent
      }
    }

    // 4. Export
    const silhouette = await sharp(data, {
      raw: { width: info.width, height: info.height, channels: 4 }
    })
      .png()
      .toBuffer();

    await writeFile(outputPath, silhouette);

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

**Output:** Working silhouette generation function

---

### Task 4: Create Batch Test Runner

Create `scripts/silhouette-poc/src/test-runner.ts`:

```typescript
import { readdir, readFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { generateSilhouette } from './silhouette.js';

interface TestResult {
  filename: string;
  success: boolean;
  timeMs: number;
  error?: string;
}

async function runTests() {
  const inputDir = join(import.meta.dirname, '../test-images');
  const outputDir = join(import.meta.dirname, '../output');

  await mkdir(outputDir, { recursive: true });

  const manifest = JSON.parse(
    await readFile(join(inputDir, 'manifest.json'), 'utf-8')
  );

  const results: TestResult[] = [];

  console.log(`Testing ${manifest.length} images...\n`);

  for (const entry of manifest) {
    const inputPath = join(inputDir, entry.filename);
    const outputPath = join(outputDir, entry.filename.replace(/\.[^.]+$/, '-silhouette.png'));

    console.log(`Processing: ${entry.name}...`);
    const result = await generateSilhouette(inputPath, outputPath);

    results.push({
      filename: entry.filename,
      ...result
    });

    console.log(`  ${result.success ? '✓' : '✗'} ${result.timeMs}ms${result.error ? ` - ${result.error}` : ''}`);
  }

  // Summary
  const successes = results.filter(r => r.success).length;
  const avgTime = results.reduce((sum, r) => sum + r.timeMs, 0) / results.length;

  console.log('\n--- Summary ---');
  console.log(`Success rate: ${successes}/${results.length} (${((successes/results.length)*100).toFixed(1)}%)`);
  console.log(`Average time: ${avgTime.toFixed(0)}ms`);
  console.log(`\nOutput saved to: ${outputDir}`);

  // Save results JSON
  await writeFile(
    join(outputDir, 'results.json'),
    JSON.stringify(results, null, 2)
  );
}

runTests().catch(console.error);
```

Add to `package.json`:
```json
{
  "type": "module",
  "scripts": {
    "test": "ts-node --esm src/test-runner.ts"
  }
}
```

**Output:** Batch test runner with summary statistics

---

### Task 5: Run Initial Tests and Document Results

1. Run the test suite: `npm test`
2. Review output silhouettes visually
3. Document results in `scripts/silhouette-poc/RESULTS.md`:

```markdown
# Silhouette POC Results

## Test Run: [Date]

### Summary
- **Total images**: X
- **Success rate**: X%
- **Average processing time**: Xms

### Quality Assessment

| Image | Era | Type | Quality | Notes |
|-------|-----|------|---------|-------|
| uss-enterprise-cv6.jpg | WWII | carrier | ✓ Good | Clear hull profile |
| bismarck.jpg | WWII | battleship | ⚠ Fair | Water reflection extends hull |
| ... | ... | ... | ... | ... |

### Failure Patterns
- [List common failure modes]

### Recommendations
- [Tuning suggestions]
```

**Output:** RESULTS.md with quality assessment

---

### Task 6: Tune Pipeline Based on Results

Based on failure patterns, adjust the pipeline:

1. **If water reflections are common**: Add bottom crop heuristic
2. **If low contrast fails**: Increase preprocessing contrast
3. **If edges are jagged**: Add slight blur before threshold
4. **If artifacts present**: Add morphological cleanup (erosion/dilation)

Update `silhouette.ts` with improvements and re-run tests.

**Output:** Tuned pipeline with improved success rate

---

### Task 7: Evaluate rembg Alternative (if needed)

If @imgly success rate is <90%, test rembg:

Create `scripts/silhouette-poc/rembg-test.py`:

```python
import sys
import json
from pathlib import Path
from rembg import remove, new_session
from PIL import Image
import time

def process_image(input_path: str, output_path: str, session) -> dict:
    start = time.time()
    try:
        img = Image.open(input_path)
        output = remove(img, session=session)
        output.save(output_path)
        return {"success": True, "timeMs": int((time.time() - start) * 1000)}
    except Exception as e:
        return {"success": False, "timeMs": int((time.time() - start) * 1000), "error": str(e)}

if __name__ == "__main__":
    session = new_session("u2net")
    input_dir = Path("test-images")
    output_dir = Path("output-rembg")
    output_dir.mkdir(exist_ok=True)

    manifest = json.loads((input_dir / "manifest.json").read_text())

    for entry in manifest:
        input_path = input_dir / entry["filename"]
        output_path = output_dir / f"{input_path.stem}-nobg.png"
        result = process_image(str(input_path), str(output_path), session)
        print(f"{entry['filename']}: {'✓' if result['success'] else '✗'} {result['timeMs']}ms")
```

Compare results between @imgly and rembg, choose winner.

**Output:** Comparison data, final library choice documented

---

## Verification

After completing all tasks:

1. **Silhouettes exist**: `ls scripts/silhouette-poc/output/*.png` shows 20+ files
2. **Success rate**: `cat scripts/silhouette-poc/output/results.json | jq '[.[] | select(.success)] | length'` >= 18 (90%)
3. **Quality check**: Manually review 5 random silhouettes - hull profiles are recognizable
4. **Performance**: Average time in results.json < 5000ms

## Output

- `scripts/silhouette-poc/` - Complete POC project
  - `src/silhouette.ts` - Core silhouette generation function
  - `src/test-runner.ts` - Batch test runner
  - `test-images/` - Test dataset with manifest
  - `output/` - Generated silhouettes and results.json
  - `RESULTS.md` - Quality assessment and recommendations

## Checkpoint

**Before moving to Phase 2:**
- [ ] Success rate meets 90% threshold
- [ ] Pipeline is fully automated (no manual steps)
- [ ] Clear documentation of algorithm and parameters
- [ ] Decision made on @imgly vs rembg

If success rate < 90% after tuning, STOP and reassess approach before continuing.

---
*Created: 2026-01-18*
