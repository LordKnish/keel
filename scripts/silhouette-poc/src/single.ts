/**
 * Process a single image for quick testing.
 * Usage: npm run single -- <input-path> [output-path]
 */
import { generateSilhouette } from './silhouette.ts';

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.log('Usage: npm run single -- <input-path> [output-path]');
    console.log('Example: npm run single -- test-images/bismarck.jpg output/bismarck-silhouette.png');
    process.exit(1);
  }

  const inputPath = args[0];
  const outputPath = args[1] || inputPath.replace(/\.[^.]+$/, '-silhouette.png');

  console.log(`Processing: ${inputPath}`);
  console.log(`Output: ${outputPath}`);

  const result = await generateSilhouette(inputPath, outputPath);

  if (result.success) {
    console.log(`✓ Success in ${result.timeMs}ms`);
    console.log(`  Dimensions: ${result.dimensions?.width}x${result.dimensions?.height}`);
  } else {
    console.log(`✗ Failed: ${result.error}`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
