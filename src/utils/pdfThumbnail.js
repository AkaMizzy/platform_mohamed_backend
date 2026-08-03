import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createCanvas } from "@napi-rs/canvas";
import { UPLOADS_ROOT } from "../middleware/upload.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const THUMBNAILS_DIR = path.join(UPLOADS_ROOT, "thumbnails");
fs.mkdirSync(THUMBNAILS_DIR, { recursive: true });

const PDFJS_DIST_DIR = path.dirname(
  fileURLToPath(import.meta.resolve("pdfjs-dist/package.json"))
);
const THUMBNAIL_WIDTH = 480;

class NodeCanvasFactory {
  create(width, height) {
    const canvas = createCanvas(width, height);
    return { canvas, context: canvas.getContext("2d") };
  }
  reset(canvasAndContext, width, height) {
    canvasAndContext.canvas.width = width;
    canvasAndContext.canvas.height = height;
  }
  destroy(canvasAndContext) {
    canvasAndContext.canvas.width = 0;
    canvasAndContext.canvas.height = 0;
    canvasAndContext.canvas = null;
    canvasAndContext.context = null;
  }
}

// @napi-rs/canvas's JPEG encoder corrupts text-heavy renders (verified: PNG
// output from the exact same canvas is clean), so thumbnails are saved as PNG.
export async function generatePdfThumbnail(absoluteFilePath, destFilename) {
  let loadingTask;
  try {
    const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const data = new Uint8Array(fs.readFileSync(absoluteFilePath));

    loadingTask = getDocument({
      data,
      useWorkerFetch: false,
      isEvalSupported: false,
      disableFontFace: true,
      canvasFactory: new NodeCanvasFactory(),
      standardFontDataUrl: path.join(PDFJS_DIST_DIR, "standard_fonts").replace(/\\/g, "/") + "/",
      cMapUrl: path.join(PDFJS_DIST_DIR, "cmaps").replace(/\\/g, "/") + "/",
      cMapPacked: true,
    });

    const doc = await loadingTask.promise;
    const page = await doc.getPage(1);
    const baseViewport = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: THUMBNAIL_WIDTH / baseViewport.width });

    const canvas = createCanvas(Math.round(viewport.width), Math.round(viewport.height));
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({ canvasContext: ctx, viewport }).promise;

    fs.writeFileSync(path.join(THUMBNAILS_DIR, destFilename), canvas.toBuffer("image/png"));
    return destFilename;
  } catch (err) {
    console.warn(`Failed to generate PDF thumbnail for ${absoluteFilePath}:`, err.message);
    return null;
  } finally {
    await loadingTask?.destroy();
  }
}
