import fs from "fs/promises";
import path from "path";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { toArticleResponse } from "../utils/transformArticle.js";
import { ARTICLES_DIR } from "../middleware/upload.js";
import { THUMBNAILS_DIR, generatePdfThumbnail } from "../utils/pdfThumbnail.js";
import { generateDocxThumbnail } from "../utils/docxThumbnail.js";
import { richTextToPlainText, sanitizeRichHtml } from "../utils/sanitizeRichHtml.js";
import * as ArticleModel from "../models/articleModel.js";

const ID_PATTERN = /^\d+$/;

function assertValidId(id) {
  if (!ID_PATTERN.test(id)) {
    throw new ApiError(400, "معرف غير صالح");
  }
}

async function removeFileFromDisk(filename) {
  if (!filename) return;
  try {
    await fs.unlink(path.join(ARTICLES_DIR, filename));
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

const DOCX_MIME_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

async function createThumbnailForFile(file) {
  if (!file) return null;
  const destFilename = `${path.parse(file.filename).name}.png`;
  const absolutePath = path.join(ARTICLES_DIR, file.filename);

  if (file.mimetype === "application/pdf") {
    return generatePdfThumbnail(absolutePath, destFilename);
  }
  if (file.mimetype === DOCX_MIME_TYPE) {
    return generateDocxThumbnail(absolutePath, destFilename);
  }
  return null;
}

function isTruthyFlag(value) {
  return value === true || value === "true";
}

export const createArticle = asyncHandler(async (req, res) => {
  const { title, description, contentType, contentText } = req.body;
  const file = req.file;

  const errors = {};
  if (!title || !title.trim()) errors.title = "العنوان مطلوب";

  if (!contentType || !["text", "file"].includes(contentType)) {
    errors.contentType = "نوع المقال غير صالح، يجب أن يكون 'text' أو 'file'";
  } else if (contentType === "text") {
    if (!richTextToPlainText(contentText)) {
      errors.contentText = "محتوى المقال مطلوب للمقالات النصية";
    }
    if (file) {
      await removeFileFromDisk(file.filename);
    }
  } else if (contentType === "file") {
    if (!file) {
      errors.file = "الملف مطلوب للمقالات من نوع ملف";
    }
  }

  if (Object.keys(errors).length > 0) {
    await removeFileFromDisk(file?.filename);
    throw new ApiError(400, "بيانات غير صالحة", errors);
  }

  const thumbnailPath = contentType === "file" ? await createThumbnailForFile(file) : null;

  const article = await ArticleModel.createArticle({
    title: title.trim(),
    description: description?.trim() || null,
    contentType,
    contentText: contentType === "text" ? sanitizeRichHtml(contentText) : null,
    filePath: contentType === "file" ? file.filename : null,
    fileOriginalName: contentType === "file" ? file.originalname : null,
    fileMimeType: contentType === "file" ? file.mimetype : null,
    thumbnailPath,
  });

  res.status(201).json({ success: true, data: toArticleResponse(article, req) });
});

export const getArticles = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 6));
  const type = ["text", "file"].includes(req.query.type) ? req.query.type : "all";
  const search = req.query.search?.trim() || "";

  const { rows, total } = await ArticleModel.findArticles({ page, limit, type, search });

  res.json({
    success: true,
    data: rows.map((row) => toArticleResponse(row, req)),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  });
});

export const getArticleById = asyncHandler(async (req, res) => {
  assertValidId(req.params.id);

  const article = await ArticleModel.findArticleById(req.params.id);
  if (!article) throw new ApiError(404, "المقال غير موجود");

  res.json({ success: true, data: toArticleResponse(article, req) });
});

export const updateArticle = asyncHandler(async (req, res) => {
  assertValidId(req.params.id);

  const existing = await ArticleModel.findArticleById(req.params.id);
  if (!existing) {
    await removeFileFromDisk(req.file?.filename);
    throw new ApiError(404, "المقال غير موجود");
  }

  const { title, description, contentType, contentText, removeFile } = req.body;
  const file = req.file;
  const errors = {};
  const updates = {};

  if (title !== undefined) {
    if (!title.trim()) errors.title = "العنوان مطلوب";
    else updates.title = title.trim();
  }

  if (description !== undefined) {
    updates.description = description.trim() || null;
  }

  // Changing content_type requires new content to match
  const nextType = contentType && ["text", "file"].includes(contentType)
    ? contentType
    : existing.content_type;

  if (contentType !== undefined && !["text", "file"].includes(contentType)) {
    errors.contentType = "نوع المقال غير صالح";
  }

  if (nextType === "text") {
    // Switching to text or updating text content
    if (contentText !== undefined) {
      if (!richTextToPlainText(contentText)) errors.contentText = "محتوى المقال مطلوب للمقالات النصية";
      else updates.content_text = sanitizeRichHtml(contentText);
    } else if (existing.content_type !== "text") {
      errors.contentText = "محتوى المقال مطلوب عند التحويل إلى مقال نصي";
    }

    // Remove any existing file if switching to text type
    if (existing.content_type === "file" && nextType === "text") {
      await removeFileFromDisk(existing.file_path);
      await removeThumbnailFromDisk(existing.thumbnail_path);
      updates.file_path = null;
      updates.file_original_name = null;
      updates.file_mime_type = null;
      updates.file_size = null;
      updates.thumbnail_path = null;
    }

    if (file) {
      await removeFileFromDisk(file.filename);
    }
  } else if (nextType === "file") {
    // Switching to file or replacing file
    if (file) {
      await removeFileFromDisk(existing.file_path);
      await removeThumbnailFromDisk(existing.thumbnail_path);
      updates.file_path = file.filename;
      updates.file_original_name = file.originalname;
      updates.file_mime_type = file.mimetype;
      updates.thumbnail_path = await createThumbnailForFile(file);
    } else if (isTruthyFlag(removeFile)) {
      errors.file = "لا يمكن حذف الملف دون توفير ملف بديل في المقالات من نوع ملف";
    } else if (existing.content_type !== "file") {
      errors.file = "الملف مطلوب عند التحويل إلى مقال من نوع ملف";
    }

    // Clear text content if switching from text to file
    if (existing.content_type === "text" && nextType === "file") {
      updates.content_text = null;
    }
  }

  if (contentType !== undefined && contentType !== existing.content_type) {
    updates.content_type = nextType;
  }

  if (Object.keys(errors).length > 0) {
    await removeFileFromDisk(file?.filename);
    await removeThumbnailFromDisk(updates.thumbnail_path);
    throw new ApiError(400, "بيانات غير صالحة", errors);
  }

  const updated = await ArticleModel.updateArticle(req.params.id, updates);
  res.json({ success: true, data: toArticleResponse(updated, req) });
});

export const deleteArticle = asyncHandler(async (req, res) => {
  assertValidId(req.params.id);

  const existing = await ArticleModel.findArticleById(req.params.id);
  if (!existing) throw new ApiError(404, "المقال غير موجود");

  await removeFileFromDisk(existing.file_path);
  await removeThumbnailFromDisk(existing.thumbnail_path);
  await ArticleModel.deleteArticle(req.params.id);

  res.json({ success: true, data: null, message: "تم حذف المقال بنجاح" });
});
