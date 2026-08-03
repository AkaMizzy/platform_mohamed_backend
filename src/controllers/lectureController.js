import fs from "fs/promises";
import path from "path";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { extractYoutubeId } from "../utils/youtube.js";
import { toLectureResponse } from "../utils/transformLecture.js";
import { LECTURES_DIR } from "../middleware/upload.js";
import { THUMBNAILS_DIR, generatePdfThumbnail } from "../utils/pdfThumbnail.js";
import { generateDocxThumbnail } from "../utils/docxThumbnail.js";
import * as LectureModel from "../models/lectureModel.js";
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
    await fs.unlink(path.join(LECTURES_DIR, filename));
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
  const absolutePath = path.join(LECTURES_DIR, file.filename);

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

export const createLecture = asyncHandler(async (req, res) => {
  const { title, description, youtubeUrl, location } = req.body;
  const file = req.file;

  const errors = {};
  if (!title || !title.trim()) errors.title = "العنوان مطلوب";

  let youtubeId = null;
  const trimmedYoutubeUrl = youtubeUrl?.trim() || "";
  if (trimmedYoutubeUrl) {
    youtubeId = extractYoutubeId(trimmedYoutubeUrl);
    if (!youtubeId) errors.youtubeUrl = "رابط يوتيوب غير صالح";
  }

  if (!trimmedYoutubeUrl && !file) {
    errors.content = "يجب توفير رابط يوتيوب أو ملف مرفق على الأقل";
  }

  if (Object.keys(errors).length > 0) {
    await removeFileFromDisk(file?.filename);
    throw new ApiError(400, "بيانات غير صالحة", errors);
  }

  const thumbnailPath = await createThumbnailForFile(file);

  const lecture = await LectureModel.createLecture({
    title: title.trim(),
    description: description?.trim() ? sanitizeRichHtml(description) : null,
    youtubeUrl: trimmedYoutubeUrl || null,
    youtubeId,
    location: location?.trim() || null,
    filePath: file?.filename || null,
    fileOriginalName: file?.originalname || null,
    fileMimeType: file?.mimetype || null,
    fileSize: file?.size || null,
    thumbnailPath,
  });

  res.status(201).json({ success: true, data: toLectureResponse(lecture, req) });
});

export const getLectures = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 6));
  const type = ["video", "file"].includes(req.query.type) ? req.query.type : "all";
  const search = req.query.search?.trim() || "";

  const { rows, total } = await LectureModel.findLectures({ page, limit, type, search });

  res.json({
    success: true,
    data: rows.map((row) => toLectureResponse(row, req)),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  });
});

export const getLectureById = asyncHandler(async (req, res) => {
  assertValidId(req.params.id);

  const lecture = await LectureModel.findLectureById(req.params.id);
  if (!lecture) throw new ApiError(404, "المحاضرة غير موجودة");

  res.json({ success: true, data: toLectureResponse(lecture, req) });
});

export const updateLecture = asyncHandler(async (req, res) => {
  assertValidId(req.params.id);

  const existing = await LectureModel.findLectureById(req.params.id);
  if (!existing) {
    await removeFileFromDisk(req.file?.filename);
    throw new ApiError(404, "المحاضرة غير موجودة");
  }

  const { title, description, youtubeUrl, location, removeFile, removeYoutube } = req.body;
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

  if (location !== undefined) {
    updates.location = location.trim() || null;
  }

  // Resolve the youtube link: explicit removal, replacement, or unchanged.
  let nextYoutubeUrl = existing.youtube_url;
  let nextYoutubeId = existing.youtube_id;

  if (isTruthyFlag(removeYoutube)) {
    nextYoutubeUrl = null;
    nextYoutubeId = null;
  }

  const trimmedYoutubeUrl = youtubeUrl?.trim();
  if (trimmedYoutubeUrl) {
    const id = extractYoutubeId(trimmedYoutubeUrl);
    if (!id) errors.youtubeUrl = "رابط يوتيوب غير صالح";
    nextYoutubeUrl = trimmedYoutubeUrl;
    nextYoutubeId = id;
  }

  if (nextYoutubeUrl !== existing.youtube_url) {
    updates.youtube_url = nextYoutubeUrl;
    updates.youtube_id = nextYoutubeId;
  }

  // Resolve the file: new upload, explicit removal, or unchanged.
  let nextFilePath = existing.file_path;

  if (file) {
    await removeFileFromDisk(existing.file_path);
    await removeThumbnailFromDisk(existing.thumbnail_path);
    updates.file_path = file.filename;
    updates.file_original_name = file.originalname;
    updates.file_mime_type = file.mimetype;
    updates.file_size = file.size;
    updates.thumbnail_path = await createThumbnailForFile(file);
    nextFilePath = file.filename;
  } else if (isTruthyFlag(removeFile)) {
    await removeFileFromDisk(existing.file_path);
    await removeThumbnailFromDisk(existing.thumbnail_path);
    updates.file_path = null;
    updates.file_original_name = null;
    updates.file_mime_type = null;
    updates.file_size = null;
    updates.thumbnail_path = null;
    nextFilePath = null;
  }

  if (!nextYoutubeUrl && !nextFilePath) {
    errors.content = "يجب توفير رابط يوتيوب أو ملف مرفق على الأقل";
  }

  if (Object.keys(errors).length > 0) {
    await removeFileFromDisk(file?.filename);
    await removeThumbnailFromDisk(updates.thumbnail_path);
    throw new ApiError(400, "بيانات غير صالحة", errors);
  }

  const updated = await LectureModel.updateLecture(req.params.id, updates);
  res.json({ success: true, data: toLectureResponse(updated, req) });
});

export const deleteLecture = asyncHandler(async (req, res) => {
  assertValidId(req.params.id);

  const existing = await LectureModel.findLectureById(req.params.id);
  if (!existing) throw new ApiError(404, "المحاضرة غير موجودة");

  await removeFileFromDisk(existing.file_path);
  await removeThumbnailFromDisk(existing.thumbnail_path);
  await LectureModel.deleteLecture(req.params.id);

  res.json({ success: true, data: null, message: "تم حذف المحاضرة بنجاح" });
});
