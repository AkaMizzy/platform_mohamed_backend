import fs from "fs/promises";
import path from "path";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { toReferenceResponse } from "../utils/transformReference.js";
import { REFERENCES_DIR } from "../middleware/upload.js";
import { THUMBNAILS_DIR, generatePdfThumbnail } from "../utils/pdfThumbnail.js";
import * as ReferenceModel from "../models/referenceModel.js";
import { sanitizeRichHtml } from "../utils/sanitizeRichHtml.js";

const ID_PATTERN = /^\d+$/;

function assertValidId(id) {
  if (!ID_PATTERN.test(id)) {
    throw new ApiError(400, "معرف غير صالح");
  }
}

async function removeFileFromDisk(filename) {
  if (!filename) return;
  try {
    await fs.unlink(path.join(REFERENCES_DIR, filename));
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
  }
}

async function removeThumbnailFromDisk(filename) {
  if (!filename) return;
  try {
    await fs.unlink(path.join(THUMBNAILS_DIR, filename));
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
  }
}

async function createThumbnailForFile(file) {
  if (!file || file.mimetype !== "application/pdf") return null;
  const destFilename = `${path.parse(file.filename).name}.png`;
  const absolutePath = path.join(REFERENCES_DIR, file.filename);
  return generatePdfThumbnail(absolutePath, destFilename);
}

function isValidUrl(str) {
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isTruthyFlag(value) {
  return value === true || value === "true";
}

export const createReference = asyncHandler(async (req, res) => {
  const { title, description, sourceType, linkUrl } = req.body;
  const file = req.file;

  const errors = {};
  if (!title || !title.trim()) errors.title = "العنوان مطلوب";

  if (!sourceType || !["file", "link"].includes(sourceType)) {
    errors.sourceType = "نوع المصدر غير صالح، يجب أن يكون 'file' أو 'link'";
  } else if (sourceType === "link") {
    const trimmedUrl = linkUrl?.trim() || "";
    if (!trimmedUrl) {
      errors.linkUrl = "رابط المرجع مطلوب";
    } else if (!isValidUrl(trimmedUrl)) {
      errors.linkUrl = "رابط غير صالح، يجب أن يبدأ بـ http أو https";
    }
    if (file) await removeFileFromDisk(file.filename);
  } else if (sourceType === "file") {
    if (!file) errors.file = "الملف مطلوب";
  }

  if (Object.keys(errors).length > 0) {
    await removeFileFromDisk(file?.filename);
    throw new ApiError(400, "بيانات غير صالحة", errors);
  }

  const thumbnailPath = sourceType === "file" ? await createThumbnailForFile(file) : null;

  const reference = await ReferenceModel.createReference({
    title: title.trim(),
    description: description?.trim() ? sanitizeRichHtml(description) : null,
    sourceType,
    linkUrl: sourceType === "link" ? linkUrl.trim() : null,
    filePath: sourceType === "file" ? file.filename : null,
    fileOriginalName: sourceType === "file" ? file.originalname : null,
    fileMimeType: sourceType === "file" ? file.mimetype : null,
    thumbnailPath,
  });

  res.status(201).json({ success: true, data: toReferenceResponse(reference, req) });
});

export const getReferences = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 6));
  const type = ["file", "link"].includes(req.query.type) ? req.query.type : "all";
  const search = req.query.search?.trim() || "";

  const { rows, total } = await ReferenceModel.findReferences({ page, limit, type, search });

  res.json({
    success: true,
    data: rows.map((row) => toReferenceResponse(row, req)),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  });
});

export const getReferenceById = asyncHandler(async (req, res) => {
  assertValidId(req.params.id);

  const reference = await ReferenceModel.findReferenceById(req.params.id);
  if (!reference) throw new ApiError(404, "المرجع غير موجود");

  res.json({ success: true, data: toReferenceResponse(reference, req) });
});

export const updateReference = asyncHandler(async (req, res) => {
  assertValidId(req.params.id);

  const existing = await ReferenceModel.findReferenceById(req.params.id);
  if (!existing) {
    await removeFileFromDisk(req.file?.filename);
    throw new ApiError(404, "المرجع غير موجود");
  }

  const { title, description, sourceType, linkUrl, removeFile } = req.body;
  const file = req.file;
  const errors = {};
  const updates = {};

  if (title !== undefined) {
    if (!title.trim()) errors.title = "العنوان مطلوب";
    else updates.title = title.trim();
  }

  if (description !== undefined) {
    updates.description = description.trim() ? sanitizeRichHtml(description) : null;
  }

  const nextType = sourceType && ["file", "link"].includes(sourceType)
    ? sourceType
    : existing.source_type;

  if (sourceType !== undefined && !["file", "link"].includes(sourceType)) {
    errors.sourceType = "نوع المصدر غير صالح";
  }

  if (nextType === "link") {
    const trimmedUrl = linkUrl?.trim();
    if (trimmedUrl !== undefined && trimmedUrl !== null) {
      if (!trimmedUrl) {
        errors.linkUrl = "رابط المرجع مطلوب";
      } else if (!isValidUrl(trimmedUrl)) {
        errors.linkUrl = "رابط غير صالح، يجب أن يبدأ بـ http أو https";
      } else {
        updates.link_url = trimmedUrl;
      }
    } else if (existing.source_type !== "link") {
      errors.linkUrl = "رابط المرجع مطلوب عند التحويل إلى نوع رابط";
    }

    // Switching from file to link — remove old file
    if (existing.source_type === "file") {
      await removeFileFromDisk(existing.file_path);
      await removeThumbnailFromDisk(existing.thumbnail_path);
      updates.file_path = null;
      updates.file_original_name = null;
      updates.file_mime_type = null;
      updates.file_size = null;
      updates.thumbnail_path = null;
    }
    if (file) await removeFileFromDisk(file.filename);
  } else if (nextType === "file") {
    if (file) {
      await removeFileFromDisk(existing.file_path);
      await removeThumbnailFromDisk(existing.thumbnail_path);
      updates.file_path = file.filename;
      updates.file_original_name = file.originalname;
      updates.file_mime_type = file.mimetype;
      updates.thumbnail_path = await createThumbnailForFile(file);
    } else if (isTruthyFlag(removeFile)) {
      errors.file = "لا يمكن حذف الملف دون توفير ملف بديل في المراجع من نوع ملف";
    } else if (existing.source_type !== "file") {
      errors.file = "الملف مطلوب عند التحويل إلى مرجع من نوع ملف";
    }

    // Switching from link to file — clear link_url
    if (existing.source_type === "link") {
      updates.link_url = null;
    }
  }

  if (sourceType !== undefined && sourceType !== existing.source_type) {
    updates.source_type = nextType;
  }

  if (Object.keys(errors).length > 0) {
    await removeFileFromDisk(file?.filename);
    await removeThumbnailFromDisk(updates.thumbnail_path);
    throw new ApiError(400, "بيانات غير صالحة", errors);
  }

  const updated = await ReferenceModel.updateReference(req.params.id, updates);
  res.json({ success: true, data: toReferenceResponse(updated, req) });
});

export const deleteReference = asyncHandler(async (req, res) => {
  assertValidId(req.params.id);

  const existing = await ReferenceModel.findReferenceById(req.params.id);
  if (!existing) throw new ApiError(404, "المرجع غير موجود");

  await removeFileFromDisk(existing.file_path);
  await removeThumbnailFromDisk(existing.thumbnail_path);
  await ReferenceModel.deleteReference(req.params.id);

  res.json({ success: true, data: null, message: "تم حذف المرجع بنجاح" });
});
