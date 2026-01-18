import { readFile, mkdir, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { generateSilhouette, type SilhouetteResult } from './silhouette.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface ManifestEntry {
  filename: string;
  name: string;
  era: string;
  type: string;
  nation: string;
  source: string;
  quality: string;
}

interface TestResult extends SilhouetteResult {
  filename: string;
  name: string;
  era: string;
  type: string;
}

async function runTests() {
  const inputDir = join(__dirname, '../test-images');
  const outputDir = join(__dirname, '../output');

  await mkdir(outputDir, { recursive: true });

  // Load manifest
  const manifestPath = join(inputDir, 'manifest.json');
  const manifest: ManifestEntry[] = JSON.parse(
    await readFile(manifestPath, 'utf-8')
  );

  const results: TestResult[] = [];
  let totalTime = 0;

  console.log(`\n🚢 Silhouette Generation POC`);
  console.log(`${'='.repeat(50)}`);
  console.log(`Testing ${manifest.length} ship images...\n`);

  for (let i = 0; i < manifest.length; i++) {
    const entry = manifest[i];
    const inputPath = join(inputDir, entry.filename);
    const outputFilename = entry.filename.replace(/\.[^.]+$/, '-silhouette.png');
    const outputPath = join(outputDir, outputFilename);

    process.stdout.write(`[${i + 1}/${manifest.length}] ${entry.name}... `);

    const result = await generateSilhouette(inputPath, outputPath);
    totalTime += result.timeMs;

    results.push({
      filename: entry.filename,
      name: entry.name,
      era: entry.era,
      type: entry.type,
      ...result
    });

    if (result.success) {
      console.log(`✓ ${result.timeMs}ms (${result.dimensions?.width}x${result.dimensions?.height})`);
    } else {
      console.log(`✗ ${result.error}`);
    }
  }

  // Calculate summary statistics
  const successes = results.filter(r => r.success);
  const failures = results.filter(r => !r.success);
  const avgTime = totalTime / results.length;
  const successRate = (successes.length / results.length) * 100;

  // Print summary
  console.log(`\n${'='.repeat(50)}`);
  console.log(`📊 Summary`);
  console.log(`${'='.repeat(50)}`);
  console.log(`Total images:     ${results.length}`);
  console.log(`Successful:       ${successes.length} (${successRate.toFixed(1)}%)`);
  console.log(`Failed:           ${failures.length}`);
  console.log(`Average time:     ${avgTime.toFixed(0)}ms`);
  console.log(`Total time:       ${(totalTime / 1000).toFixed(1)}s`);

  if (failures.length > 0) {
    console.log(`\n❌ Failures:`);
    failures.forEach(f => console.log(`  - ${f.name}: ${f.error}`));
  }

  // Breakdown by era
  console.log(`\n📅 By Era:`);
  const byEra = groupBy(results, 'era');
  for (const [era, items] of Object.entries(byEra)) {
    const eraSuccesses = items.filter(r => r.success).length;
    console.log(`  ${era}: ${eraSuccesses}/${items.length} (${((eraSuccesses/items.length)*100).toFixed(0)}%)`);
  }

  // Breakdown by type
  console.log(`\n⚓ By Type:`);
  const byType = groupBy(results, 'type');
  for (const [type, items] of Object.entries(byType)) {
    const typeSuccesses = items.filter(r => r.success).length;
    console.log(`  ${type}: ${typeSuccesses}/${items.length} (${((typeSuccesses/items.length)*100).toFixed(0)}%)`);
  }

  console.log(`\n📁 Output saved to: ${outputDir}`);

  // Save detailed results JSON
  await writeFile(
    join(outputDir, 'results.json'),
    JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: {
        total: results.length,
        successful: successes.length,
        failed: failures.length,
        successRate: successRate.toFixed(1),
        avgTimeMs: avgTime.toFixed(0),
        totalTimeMs: totalTime
      },
      results
    }, null, 2)
  );

  // Return exit code based on success rate
  if (successRate >= 90) {
    console.log(`\n✅ POC PASSED: ${successRate.toFixed(1)}% success rate meets 90% threshold`);
    process.exit(0);
  } else {
    console.log(`\n⚠️  POC NEEDS TUNING: ${successRate.toFixed(1)}% success rate below 90% threshold`);
    process.exit(1);
  }
}

function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const k = String(item[key]);
    (acc[k] = acc[k] || []).push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

runTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
