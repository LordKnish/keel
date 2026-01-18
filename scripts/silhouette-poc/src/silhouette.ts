import sharp from 'sharp';
import { removeBackground } from '@imgly/background-removal-node';
import { readFile, writeFile } from 'fs/promises';

export interface SilhouetteOptions {
  /** Brightness adjustment for preprocessing (default: 1.1) */
  preprocessBrightness?: number;
  /** Alpha threshold for silhouette (default: 128) */
  thresholdValue?: number;
  /** Output width in pixels (default: 1000) */
  outputWidth?: number;
  /** Apply slight blur before background removal (default: false) */
  preBlur?: boolean;
}

export interface SilhouetteResult {
  success: boolean;
  timeMs: number;
  error?: string;
  /** Dimensions of output silhouette */
  dimensions?: { width: number; height: number };
}

/**
 * Generate a black silhouette from a ship photograph.
 *
 * Pipeline:
 * 1. Preprocess (resize, brightness, sharpen)
 * 2. Remove background using AI segmentation
 * 3. Convert to binary black silhouette
 * 4. Export as PNG with transparency
 */
export async function generateSilhouette(
  inputPath: string,
  outputPath: string,
  options: SilhouetteOptions = {}
): Promise<SilhouetteResult> {
  const start = Date.now();

  try {
    // 1. Read and preprocess image
    const inputBuffer = await readFile(inputPath);

    // Ensure RGBA (4-channel) colorspace - required by @imgly background removal
    let preprocessor = sharp(inputBuffer)
      .toColorspace('srgb')
      .ensureAlpha()  // Convert to 4 channels (RGBA)
      .resize(options.outputWidth ?? 1000, null, { withoutEnlargement: true })
      .modulate({ brightness: options.preprocessBrightness ?? 1.1 })
      .sharpen();

    if (options.preBlur) {
      preprocessor = preprocessor.blur(0.5);
    }

    const preprocessed = await preprocessor.png().toBuffer();

    // 2. Remove background using AI segmentation
    // Note: @imgly requires Blob input, not raw Buffer
    const inputBlob = new Blob([preprocessed], { type: 'image/png' });
    const resultBlob = await removeBackground(inputBlob);
    const noBgBuffer = Buffer.from(await resultBlob.arrayBuffer());

    // 3. Convert to binary silhouette
    const { data, info } = await sharp(noBgBuffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Make all non-transparent pixels solid black
    const threshold = options.thresholdValue ?? 128;
    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3];
      if (alpha > threshold) {
        data[i] = 0;       // R = black
        data[i + 1] = 0;   // G = black
        data[i + 2] = 0;   // B = black
        data[i + 3] = 255; // Full opacity
      } else {
        data[i + 3] = 0;   // Transparent
      }
    }

    // 4. Export as PNG
    const silhouette = await sharp(data, {
      raw: { width: info.width, height: info.height, channels: 4 }
    })
      .png()
      .toBuffer();

    await writeFile(outputPath, silhouette);

    return {
      success: true,
      timeMs: Date.now() - start,
      dimensions: { width: info.width, height: info.height }
    };
  } catch (error) {
    return {
      success: false,
      timeMs: Date.now() - start,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Generate silhouette from buffer instead of file path.
 * Useful for batch processing or in-memory operations.
 */
export async function generateSilhouetteFromBuffer(
  inputBuffer: Buffer,
  options: SilhouetteOptions = {}
): Promise<{ silhouette: Buffer; result: SilhouetteResult }> {
  const start = Date.now();

  try {
    // 1. Preprocess (ensure RGBA 4-channel for @imgly compatibility)
    let preprocessor = sharp(inputBuffer)
      .toColorspace('srgb')
      .ensureAlpha()
      .resize(options.outputWidth ?? 1000, null, { withoutEnlargement: true })
      .modulate({ brightness: options.preprocessBrightness ?? 1.1 })
      .sharpen();

    if (options.preBlur) {
      preprocessor = preprocessor.blur(0.5);
    }

    const preprocessed = await preprocessor.png().toBuffer();

    // 2. Remove background (requires Blob input)
    const inputBlob = new Blob([preprocessed], { type: 'image/png' });
    const resultBlob = await removeBackground(inputBlob);
    const noBgBuffer = Buffer.from(await resultBlob.arrayBuffer());

    // 3. Convert to silhouette
    const { data, info } = await sharp(noBgBuffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const threshold = options.thresholdValue ?? 128;
    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3];
      if (alpha > threshold) {
        data[i] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
        data[i + 3] = 255;
      } else {
        data[i + 3] = 0;
      }
    }

    const silhouette = await sharp(data, {
      raw: { width: info.width, height: info.height, channels: 4 }
    })
      .png()
      .toBuffer();

    return {
      silhouette,
      result: {
        success: true,
        timeMs: Date.now() - start,
        dimensions: { width: info.width, height: info.height }
      }
    };
  } catch (error) {
    return {
      silhouette: Buffer.alloc(0),
      result: {
        success: false,
        timeMs: Date.now() - start,
        error: error instanceof Error ? error.message : String(error)
      }
    };
  }
}
