# Phase 1, Plan 2 Summary: Programmatic Line Art Generation

## Outcome: SUCCESS

The line art generation POC achieved 100% success rate, exceeding the 80% target. The adaptive threshold pipeline with OpenCV.js produces high-quality line drawings that preserve ship details better than silhouettes.

## Results

| Metric | Target | Actual |
|--------|--------|--------|
| Success rate | ≥80% | **100%** |
| Processing time | <5s | **2.0s avg** |
| Deterministic | Yes | **Yes** |
| No AI APIs | Yes | **Yes** |

## What Was Built

### Core Pipeline (`scripts/silhouette-poc/src/lineart.ts`)

Five-stage line art generation:
1. **Preprocessing**: Resize, convert to sRGB, ensure alpha
2. **Background Removal**: @imgly/background-removal-node
3. **Bilateral Filter**: Edge-preserving smoothing (OpenCV.js)
4. **Adaptive Threshold**: Region-based binarization (OpenCV.js)
5. **Composition**: Apply alpha mask, flatten to white background

Default parameters that work across all ship types:
- Bilateral: d=9, sigmaColor=75, sigmaSpace=75
- Adaptive: blockSize=11, C=2

### Test Infrastructure

- `lineart-single.ts`: Single-image processor with parameter tuning CLI
- `lineart-runner.ts`: Batch processor with statistics reporting
- 31 test images processed successfully
- `LINEART-RESULTS.md`: Detailed quality assessment

## Tasks Completed

| Task | Status | Notes |
|------|--------|-------|
| 1. Add OpenCV.js | ✓ Complete | @techstark/opencv-js installed |
| 2. Implement pipeline | ✓ Complete | lineart.ts with full pipeline |
| 3. Single-image tool | ✓ Complete | lineart-single.ts with CLI options |
| 4. Batch test runner | ✓ Complete | lineart-runner.ts with statistics |
| 5. Run initial tests | ✓ Complete | 100% success rate |
| 6. Parameter tuning | Skipped | Not needed - 100% already |
| 7. Alternative approach | Skipped | Not needed - primary approach works |
| 8. Document results | ✓ Complete | LINEART-RESULTS.md |

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Use adaptive threshold (not Canny) | Better detail preservation, cleaner lines |
| OpenCV.js over pure Sharp | Bilateral filter and adaptive threshold not available in Sharp |
| Keep default parameters | 100% success without tuning proves robustness |
| Skip pencil sketch alternative | Primary approach exceeded requirements |
| Recommend line art over silhouettes | More distinguishing features for gameplay |

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 1bea7b3 | feat | Add OpenCV.js dependency |
| 8f3e536 | feat | Implement line art pipeline |
| 663d438 | feat | Add single-image test tool |
| e98a99f | feat | Add batch test runner |
| d8c33e6 | test | Document line art POC results |

## Output Artifacts

- `scripts/silhouette-poc/src/lineart.ts` - Core line art generation function
- `scripts/silhouette-poc/src/lineart-single.ts` - Single-image test tool
- `scripts/silhouette-poc/src/lineart-runner.ts` - Batch test runner
- `scripts/silhouette-poc/output/lineart/` - 31 generated line art images
- `scripts/silhouette-poc/LINEART-RESULTS.md` - Detailed quality assessment

## Learnings

1. **OpenCV.js works well in Node.js** - Async initialization required but otherwise smooth
2. **Bilateral filter is key** - Edge-preserving smoothing before threshold produces clean results
3. **Adaptive threshold beats global** - Handles varying illumination across ship images
4. **Sailing ships excel** - Rigging detail comes through beautifully in line art
5. **No tuning needed** - Default parameters robust across all ship types and eras

## Comparison: Line Art vs Silhouettes

| Aspect | Silhouette (Plan 1) | Line Art (Plan 2) |
|--------|---------------------|-------------------|
| Success rate | 100% | 100% |
| Avg time | 1.56s | 2.00s |
| Detail level | Low (solid fill) | High (internal lines) |
| File size | 5-15KB | 10-50KB |
| Distinguishing features | Hull profile only | Superstructure, radar, rigging |
| Game difficulty | Easier | More skill-based |

## Recommendation

**Use line art for the game.** The additional 0.4s processing time is worth the significantly better detail preservation. Line art makes the game more engaging and skill-based.

## Checkpoint Verification

- [x] Line art pipeline produces recognizable ship drawings
- [x] Quality is better than basic Canny (mentioned as "decent" in STATE.md)
- [x] Processing is deterministic (no AI APIs)
- [x] Decision made: use line art for final game

## Next Phase

Phase 2: Data Source Evaluation - determine best sources for 1000+ ship database

---
*Completed: 2026-01-18*
