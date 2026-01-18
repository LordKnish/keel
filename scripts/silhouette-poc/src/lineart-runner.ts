import { readFile, mkdir, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { generateLineArt } from './lineart.ts';
import type { LineArtOptions } from './lineart.ts';

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
