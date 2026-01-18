# Silhouette POC Results

## Test Run: 2026-01-18

### Summary

- **Total images**: 21
- **Success rate**: 100% (21/21)
- **Average processing time**: 1564ms
- **Total time**: 32.9s

### Success Metrics

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Success rate | ≥90% | 100% | ✅ PASS |
| Processing time | <5000ms | 1564ms avg | ✅ PASS |
| Manual intervention | 0 | 0 | ✅ PASS |

### Results by Era

| Era | Success | Rate |
|-----|---------|------|
| WWII | 15/15 | 100% |
| WWI | 1/1 | 100% |
| Cold War | 2/2 | 100% |
| Age of Sail | 2/2 | 100% |
| Modern | 1/1 | 100% |

### Results by Ship Type

| Type | Success | Rate |
|------|---------|------|
| Aircraft carrier | 10/10 | 100% |
| Battleship | 6/6 | 100% |
| Cruiser | 2/2 | 100% |
| Battlecruiser | 1/1 | 100% |
| Ship of the line | 1/1 | 100% |
| Frigate | 1/1 | 100% |

### Quality Assessment

| Image | Era | Type | Time | Quality | Notes |
|-------|-----|------|------|---------|-------|
| akagi.jpg | WWII | carrier | 1823ms | ✓ Good | Clear hull profile |
| bismarck.jpg | WWII | battleship | 1487ms | ✓ Good | Clean silhouette |
| hms-ark-royal.jpg | WWII | carrier | 1542ms | ✓ Good | Flight deck visible |
| hms-belfast.jpg | WWII | cruiser | 2058ms | ✓ Good | Clear superstructure |
| hms-dreadnought.jpg | WWI | battleship | 1568ms | ✓ Good | Historical image handled well |
| hms-hood.jpg | WWII | battlecruiser | 1320ms | ✓ Good | Distinctive profile |
| hms-invincible.jpg | Cold War | carrier | 1590ms | ✓ Good | Modern ship clear |
| hms-victory.jpg | Age of Sail | ship of the line | 1514ms | ✓ Good | Masts and rigging visible |
| scharnhorst.jpg | WWII | battleship | 1252ms | ✓ Good | Clean outline |
| tirpitz.jpg | WWII | battleship | 1472ms | ✓ Good | Side profile clear |
| uss-constitution.jpg | Age of Sail | frigate | 2433ms | ✓ Good | Sails preserved |
| uss-enterprise-cv6.jpg | WWII | carrier | 1492ms | ✓ Good | Island structure visible |
| uss-forrestal.jpg | Cold War | carrier | 1581ms | ✓ Good | Angled deck recognizable |
| uss-hornet.jpg | WWII | carrier | 1452ms | ✓ Good | Clear profile |
| uss-indianapolis.jpg | WWII | cruiser | 1412ms | ✓ Good | Gun turrets visible |
| uss-iowa-bb61.jpg | WWII | battleship | 1490ms | ✓ Good | Distinctive profile |
| uss-lexington-cv2.jpg | WWII | carrier | 1494ms | ✓ Good | Large carrier profile |
| uss-nimitz-cvn68.jpg | Modern | carrier | 1712ms | ✓ Good | Modern supercarrier |
| uss-wasp.jpg | WWII | carrier | 1423ms | ✓ Good | Clear outline |
| yamato.jpg | WWII | battleship | 1313ms | ✓ Good | Pagoda mast visible |
| zuikaku.jpg | WWII | carrier | 1423ms | ✓ Good | Flight deck clear |

### Failure Patterns

**None observed.** All 21 test images produced usable silhouettes.

### Key Findings

1. **Library Choice**: `@imgly/background-removal-node` works excellently for this use case
   - No need to evaluate rembg alternative (100% success rate)
   - Processing time (~1.5s) is acceptable for batch processing

2. **Input Format**: Library requires Blob input with RGBA PNG
   - Grayscale JPEGs must be converted to RGBA before processing
   - Use `sharp().toColorspace('srgb').ensureAlpha().png()` for preprocessing

3. **Image Quality**: Works across all quality levels
   - Historical grainy photos: ✓
   - Modern high-res photos: ✓
   - Black and white images: ✓

4. **Ship Types**: All ship types produce recognizable silhouettes
   - Sailing ships with rigging: ✓
   - Modern flat-deck carriers: ✓
   - Battleships with complex superstructures: ✓

### Algorithm Configuration

Final settings used:

```typescript
{
  preprocessBrightness: 1.1,  // Slight brightness boost
  thresholdValue: 128,        // Standard binary threshold
  outputWidth: 1000,          // Normalize to 1000px width
  preBlur: false              // No blur needed
}
```

### Recommendations

1. **Keep current pipeline** - No tuning needed, 100% success rate
2. **Skip rembg evaluation** - @imgly meets all requirements
3. **Proceed to Phase 2** - Data source evaluation

### Next Steps

- [x] Silhouette generation POC validated
- [ ] Move to Phase 2: Data Source Evaluation
- [ ] Scale to 1000+ ships once data pipeline is ready

---
*Generated: 2026-01-18*
