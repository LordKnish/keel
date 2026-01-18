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

  // Quick smoke test
  const mat = new cv.Mat(100, 100, cv.CV_8UC1);
  console.log('Created test mat:', mat.rows, 'x', mat.cols);
  mat.delete();

  console.log('✓ OpenCV.js working');
}

testOpenCV().catch(console.error);
