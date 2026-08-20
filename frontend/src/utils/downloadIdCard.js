// frontend/src/utils/downloadIdCard.js
// Uses html2canvas + jsPDF to download the ID card as PDF or PNG.

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const SCALE = 2; // 2x resolution for crisp output

/**
 * Captures the given DOM element as a canvas.
 */
async function captureElement(element) {
  return html2canvas(element, {
    scale: SCALE,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    logging: false,
    imageTimeout: 15000,
  });
}

/**
 * Downloads the ID card element as a PDF.
 * @param {HTMLElement} element - The ID card DOM element to capture.
 * @param {string} uniqueId - Used for the filename.
 */
export async function downloadAsPDF(element, uniqueId) {
  const canvas = await captureElement(element);

  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const imgWidth = canvas.width / SCALE;
  const imgHeight = canvas.height / SCALE;

  // A4 landscape or fit to card dimensions
  const pdf = new jsPDF({
    orientation: imgWidth > imgHeight ? 'landscape' : 'portrait',
    unit: 'px',
    format: [imgWidth, imgHeight],
    hotfixes: ['px_scaling'],
  });

  pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
  pdf.save(`UNITY-A-LIVE-GROUP-${uniqueId}.pdf`);
}

/**
 * Downloads the ID card element as a PNG.
 * @param {HTMLElement} element - The ID card DOM element to capture.
 * @param {string} uniqueId - Used for the filename.
 */
export async function downloadAsPNG(element, uniqueId) {
  const canvas = await captureElement(element);

  const link = document.createElement('a');
  link.download = `UNITY-A-LIVE-GROUP-${uniqueId}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
