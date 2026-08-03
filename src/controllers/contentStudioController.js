import fs from "fs/promises";
import path from "path";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { CONTENT_MEDIA_DIR } from "../middleware/upload.js";
import { toContentEntryResponse } from "../utils/transformContentEntry.js";
import { richTextToPlainText, sanitizeRichHtml } from "../utils/sanitizeRichHtml.js";
import * as ContentStudioModel from "../models/contentStudioModel.js";

const TYPES = ["article", "opinion", "reference", "consultation", "medical_guidance"];
const STATUSES = ["draft", "scheduled", "published", "archived"];
const ID_PATTERN = /^\d+$/;
const SLUG_PATTERN = /^[a-z0-9\u0600-\u06ff]+(?:-[a-z0-9\u0600-\u06ff]+)*$/i;

function assertId(id) {
  if (!ID_PATTERN.test(id)) throw new ApiError(400, "معرف غير صالح");
}

function cleanString(value, fallback = null) {
  const cleaned = typeof value === "string" ? value.trim() : "";
  return cleaned || fallback;
}

function cleanDateTime(value) {
  const cleaned = cleanString(value);
  if (!cleaned) return null;

  const normalized = cleaned.replace("T", " ").replace(/Z$/i, "");
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(normalized)) {
    return `${normalized}:00`;
  }
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(normalized)) {
    return normalized.slice(0, 19);
  }
  return normalized;
}

function normalizePayload(body, user, existing = null) {
  const errors = {};
  const contentType = TYPES.includes(body.contentType) ? body.contentType : existing?.content_type;
  const status = STATUSES.includes(body.status) ? body.status : existing?.status || "draft";
  const title = cleanString(body.title);
  const slug = cleanString(body.slug)?.toLowerCase();
  const contentHtml = sanitizeRichHtml(body.contentHtml);
  const textOnly = richTextToPlainText(contentHtml);

  if (!contentType) errors.contentType = "نوع المحتوى غير صالح";
  if (!title) errors.title = "عنوان المحتوى مطلوب";
  if (!slug || !SLUG_PATTERN.test(slug)) {
    errors.slug = "الرابط المختصر يجب أن يحتوي على حروف وأرقام وشرطات فقط";
  }
  if (!textOnly && !contentHtml.includes("<img") && !contentHtml.includes("<iframe")) {
    errors.contentHtml = "محتوى المنشور مطلوب";
  }
  if (status === "scheduled" && !cleanDateTime(body.scheduledAt)) {
    errors.scheduledAt = "تاريخ الجدولة مطلوب";
  }

  if (Object.keys(errors).length) throw new ApiError(400, "بيانات غير صالحة", errors);

  const authorId = Number(body.authorId) || user?.id || existing?.author_id || null;
  return {
    contentType,
    title,
    slug,
    excerpt: cleanString(body.excerpt),
    contentHtml,
    status,
    category: cleanString(body.category),
    tags: JSON.stringify(Array.isArray(body.tags) ? body.tags.map((tag) => String(tag).trim()).filter(Boolean) : []),
    authorId,
    authorName: cleanString(body.authorName, user?.name || existing?.author_name || "الدكتور محمد لفريخي"),
    publicationDate: cleanDateTime(body.publicationDate),
    scheduledAt: status === "scheduled" ? cleanDateTime(body.scheduledAt) : null,
    featuredImageUrl: cleanString(body.featuredImageUrl),
    featuredImageAlt: cleanString(body.featuredImageAlt),
    featuredImageCaption: cleanString(body.featuredImageCaption),
    seoTitle: cleanString(body.seoTitle),
    seoDescription: cleanString(body.seoDescription),
    templateKey: cleanString(body.templateKey),
    dynamicFields: JSON.stringify(
      body.dynamicFields && typeof body.dynamicFields === "object" ? body.dynamicFields : {}
    ),
  };
}

export const listEntries = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));
  const type = TYPES.includes(req.query.type) ? req.query.type : null;
  const status = STATUSES.includes(req.query.status) ? req.query.status : null;
  const search = cleanString(req.query.search, "");
  const { rows, total } = await ContentStudioModel.list({ page, limit, type, status, search });

  res.json({
    success: true,
    data: rows.map(toContentEntryResponse),
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  });
});

export const getEntry = asyncHandler(async (req, res) => {
  assertId(req.params.id);
  const entry = await ContentStudioModel.findById(req.params.id);
  if (!entry) throw new ApiError(404, "المحتوى غير موجود");
  res.json({ success: true, data: toContentEntryResponse(entry) });
});

export const createEntry = asyncHandler(async (req, res) => {
  const data = normalizePayload(req.body, req.user);
  const duplicate = await ContentStudioModel.findBySlug(data.slug);
  if (duplicate) {
    throw new ApiError(409, "الرابط المختصر مستخدم مسبقاً", { slug: "اختر رابطاً مختصراً آخر" });
  }
  const created = await ContentStudioModel.create(data);
  res.status(201).json({ success: true, data: toContentEntryResponse(created) });
});

export const updateEntry = asyncHandler(async (req, res) => {
  assertId(req.params.id);
  const existing = await ContentStudioModel.findById(req.params.id);
  if (!existing) throw new ApiError(404, "المحتوى غير موجود");

  const data = normalizePayload(req.body, req.user, existing);
  const duplicate = await ContentStudioModel.findBySlug(data.slug);
  if (duplicate && duplicate.id !== existing.id) {
    throw new ApiError(409, "الرابط المختصر مستخدم مسبقاً", { slug: "اختر رابطاً مختصراً آخر" });
  }

  const columns = {
    content_type: data.contentType,
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt,
    content_html: data.contentHtml,
    status: data.status,
    category: data.category,
    tags: data.tags,
    author_id: data.authorId,
    author_name: data.authorName,
    publication_date: data.publicationDate,
    scheduled_at: data.scheduledAt,
    featured_image_url: data.featuredImageUrl,
    featured_image_alt: data.featuredImageAlt,
    featured_image_caption: data.featuredImageCaption,
    seo_title: data.seoTitle,
    seo_description: data.seoDescription,
    template_key: data.templateKey,
    dynamic_fields: data.dynamicFields,
  };
  const updated = await ContentStudioModel.update(req.params.id, columns);
  res.json({ success: true, data: toContentEntryResponse(updated) });
});

export const deleteEntry = asyncHandler(async (req, res) => {
  assertId(req.params.id);
  const existing = await ContentStudioModel.findById(req.params.id);
  if (!existing) throw new ApiError(404, "المحتوى غير موجود");
  await ContentStudioModel.remove(req.params.id);
  res.json({ success: true, data: null, message: "تم حذف المحتوى بنجاح" });
});

export const uploadMedia = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "يرجى اختيار ملف");
  const url = `${req.protocol}://${req.get("host")}/uploads/content-media/${req.file.filename}`;
  res.status(201).json({
    success: true,
    data: {
      url,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      isImage: req.file.mimetype.startsWith("image/"),
    },
  });
});

export const removeMedia = asyncHandler(async (req, res) => {
  const filename = path.basename(req.params.filename);
  try {
    await fs.unlink(path.join(CONTENT_MEDIA_DIR, filename));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  res.json({ success: true, data: null });
});
