import fs from "fs";
import path from "path";
import mammoth from "mammoth";
import { createCanvas } from "@napi-rs/canvas";
import { THUMBNAILS_DIR } from "./pdfThumbnail.js";

const FONT_STACK = "'Segoe UI', Tahoma, Arial, sans-serif";
const WIDTH = 480;
const HEIGHT = 679;
const MARGIN = 32;

function wrapText(ctx, text, maxWidth) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// Not a real layout render (that needs a browser engine) — draws the
// document's actual title + opening text onto a plain page-styled canvas, so
// the card shows real content instead of just a generic file icon.
export async function generateDocxThumbnail(absoluteFilePath, destFilename) {
  try {
    const { value: text } = await mammoth.extractRawText({ path: absoluteFilePath });
    const paragraphs = text
      .split("\n")
      .map((p) => p.trim())
      .filter(Boolean);

    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    const maxWidth = WIDTH - MARGIN * 2;
    let y = MARGIN + 24;

    if (paragraphs.length > 0) {
      ctx.fillStyle = "#1f2937";
      ctx.font = `bold 22px ${FONT_STACK}`;
      for (const line of wrapText(ctx, paragraphs[0], maxWidth).slice(0, 3)) {
        ctx.fillText(line, MARGIN, y);
        y += 30;
      }
      y += 12;
    }

    ctx.fillStyle = "#4b5563";
    ctx.font = `15px ${FONT_STACK}`;
    for (let i = 1; i < paragraphs.length && y < HEIGHT - MARGIN; i++) {
      for (const line of wrapText(ctx, paragraphs[i], maxWidth)) {
        if (y >= HEIGHT - MARGIN) break;
        ctx.fillText(line, MARGIN, y);
        y += 22;
      }
      y += 8;
    }

    fs.writeFileSync(path.join(THUMBNAILS_DIR, destFilename), canvas.toBuffer("image/png"));
    return destFilename;
  } catch (err) {
    console.warn(`Failed to generate DOCX thumbnail for ${absoluteFilePath}:`, err.message);
    return null;
  }
}
