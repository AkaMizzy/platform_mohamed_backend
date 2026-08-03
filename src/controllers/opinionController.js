import fs from "fs/promises";
import path from "path";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { toOpinionResponse } from "../utils/transformOpinion.js";
import { OPINIONS_DIR } from "../middleware/upload.js";
import * as OpinionModel from "../models/opinionModel.js";
import { OPINION_CATEGORIES } from "../models/opinionModel.js";
import { richTextToPlainText, sanitizeRichHtml } from "../utils/sanitizeRichHtml.js";

const ID_PATTERN = /^\d+$/;
const RELATED_LIMIT = 3;

function assertValidId(id) {
  if (!ID_PATTERN.test(id)) {
    throw new ApiError(400, "معرف غير صالح");
  }
}

async function removeCoverImageFromDisk(filename) {
  if (!filename) return;
  try {
    await fs.unlink(path.join(OPINIONS_DIR, filename));
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
  }
}

function isTruthyFlag(value) {
  return value === true || value === "true";
}

export const createOpinion = asyncHandler(async (req, res) => {
  const { title, content, category, topic } = req.body;
  const file = req.file;

  const errors = {};
  if (!title || !title.trim()) errors.title = "العنوان مطلوب";
  if (!richTextToPlainText(content)) errors.content = "محتوى المقال مطلوب";
  if (!category || !OPINION_CATEGORIES.includes(category)) {
    errors.category = "التصنيف غير صالح";
  }

  if (Object.keys(errors).length > 0) {
    await removeCoverImageFromDisk(file?.filename);
    throw new ApiError(400, "بيانات غير صالحة", errors);
  }

  const opinion = await OpinionModel.createOpinion({
    title: title.trim(),
    content: sanitizeRichHtml(content),
    category,
    topic: topic?.trim() || null,
    coverImagePath: file ? file.filename : null,
  });

  res.status(201).json({ success: true, data: toOpinionResponse(opinion, req) });
});

export const getOpinions = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 9));
  const category = OPINION_CATEGORIES.includes(req.query.category) ? req.query.category : null;
  const search = req.query.search?.trim() || "";

  const { rows, total } = await OpinionModel.findOpinions({ page, limit, category, search });

  res.json({
    success: true,
    data: rows.map((row) => toOpinionResponse(row, req)),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  });
});

export const getOpinionById = asyncHandler(async (req, res) => {
  assertValidId(req.params.id);

  const opinion = await OpinionModel.findOpinionById(req.params.id);
  if (!opinion) throw new ApiError(404, "المقال غير موجود");

  const relatedRows = await OpinionModel.findRelatedOpinions(
    opinion.category,
    opinion.id,
    RELATED_LIMIT
  );

  res.json({
    success: true,
    data: {
      ...toOpinionResponse(opinion, req),
      related: relatedRows.map((row) => toOpinionResponse(row, req)),
    },
  });
});

export const updateOpinion = asyncHandler(async (req, res) => {
  assertValidId(req.params.id);

  const existing = await OpinionModel.findOpinionById(req.params.id);
  if (!existing) {
    await removeCoverImageFromDisk(req.file?.filename);
    throw new ApiError(404, "المقال غير موجود");
  }

  const { title, content, category, topic, removeCoverImage } = req.body;
  const file = req.file;
  const errors = {};
  const updates = {};

  if (title !== undefined) {
    if (!title.trim()) errors.title = "العنوان مطلوب";
    else updates.title = title.trim();
  }

  if (content !== undefined) {
    if (!richTextToPlainText(content)) errors.content = "محتوى المقال مطلوب";
    else updates.content = sanitizeRichHtml(content);
  }

  if (category !== undefined) {
    if (!OPINION_CATEGORIES.includes(category)) errors.category = "التصنيف غير صالح";
    else updates.category = category;
  }

  if (topic !== undefined) {
    updates.topic = topic.trim() || null;
  }

  if (file) {
    await removeCoverImageFromDisk(existing.cover_image_path);
    updates.cover_image_path = file.filename;
  } else if (isTruthyFlag(removeCoverImage)) {
    await removeCoverImageFromDisk(existing.cover_image_path);
    updates.cover_image_path = null;
  }

  if (Object.keys(errors).length > 0) {
    await removeCoverImageFromDisk(file?.filename);
    throw new ApiError(400, "بيانات غير صالحة", errors);
  }

  const updated = await OpinionModel.updateOpinion(req.params.id, updates);
  res.json({ success: true, data: toOpinionResponse(updated, req) });
});

export const deleteOpinion = asyncHandler(async (req, res) => {
  assertValidId(req.params.id);

  const existing = await OpinionModel.findOpinionById(req.params.id);
  if (!existing) throw new ApiError(404, "المقال غير موجود");

  await removeCoverImageFromDisk(existing.cover_image_path);
  await OpinionModel.deleteOpinion(req.params.id);

  res.json({ success: true, data: null, message: "تم حذف المقال بنجاح" });
});
