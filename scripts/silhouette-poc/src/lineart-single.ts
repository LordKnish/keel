import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdir } from 'fs/promises';
import { generateLineArt } from './lineart.ts';
import type { LineArtOptions } from './lineart.ts';

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
  const outputDir = join(__dirname, '../output/lineart');
  await mkdir(outputDir, { recursive: true });

  const inputPath = join(__dirname, '../test-images', imageName);
  const outputPath = join(outputDir, imageName.replace(/\.\w+$/, '-lineart.png'));

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
