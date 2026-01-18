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
