import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { ApiError } from "../utils/ApiError.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const UPLOADS_ROOT = path.join(__dirname, "../../uploads");
export const LECTURES_DIR = path.join(UPLOADS_ROOT, "lectures");
export const ARTICLES_DIR = path.join(UPLOADS_ROOT, "articles");
export const REFERENCES_DIR = path.join(UPLOADS_ROOT, "references");
export const OPINIONS_DIR = path.join(UPLOADS_ROOT, "opinions");
export const CONTENT_MEDIA_DIR = path.join(UPLOADS_ROOT, "content-media");

fs.mkdirSync(LECTURES_DIR, { recursive: true });
fs.mkdirSync(ARTICLES_DIR, { recursive: true });
fs.mkdirSync(REFERENCES_DIR, { recursive: true });
fs.mkdirSync(OPINIONS_DIR, { recursive: true });
fs.mkdirSync(CONTENT_MEDIA_DIR, { recursive: true });

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);
const ALLOWED_EXTENSIONS = new Set([".pdf", ".doc", ".docx", ".ppt", ".pptx"]);
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, LECTURES_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_MIME_TYPES.has(file.mimetype) || ALLOWED_EXTENSIONS.has(ext)) {
    return cb(null, true);
  }
  cb(new ApiError(400, "صيغة الملف غير مدعومة. الصيغ المسموح بها: PDF, DOC, DOCX, PPT, PPTX"));
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).single("file");

export function uploadLectureFile(req, res, next) {
  upload(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      return next(new ApiError(400, "حجم الملف يتجاوز الحد المسموح به (20 ميغابايت)"));
    }
    if (err instanceof multer.MulterError) {
      return next(new ApiError(400, err.message));
    }
    next(err);
  });
}

const articleStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, ARTICLES_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${ext}`);
  },
});

const uploadArticle = multer({
  storage: articleStorage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).single("file");

export function uploadArticleFile(req, res, next) {
  uploadArticle(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      return next(new ApiError(400, "حجم الملف يتجاوز الحد المسموح به (20 ميغابايت)"));
    }
    if (err instanceof multer.MulterError) {
      return next(new ApiError(400, err.message));
    }
    next(err);
  });
}

const referenceStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, REFERENCES_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${ext}`);
  },
});

const uploadReference = multer({
  storage: referenceStorage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).single("file");

export function uploadReferenceFile(req, res, next) {
  uploadReference(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      return next(new ApiError(400, "حجم الملف يتجاوز الحد المسموح به (20 ميغابايت)"));
    }
    if (err instanceof multer.MulterError) {
      return next(new ApiError(400, err.message));
    }
    next(err);
  });
}

const ALLOWED_IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

function imageFileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype) || ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
    return cb(null, true);
  }
  cb(new ApiError(400, "صيغة الصورة غير مدعومة. الصيغ المسموح بها: JPG, PNG, WEBP"));
}

const opinionStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, OPINIONS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${ext}`);
  },
});

const uploadOpinion = multer({
  storage: opinionStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: MAX_IMAGE_SIZE },
}).single("coverImage");

export function uploadOpinionCoverImage(req, res, next) {
  uploadOpinion(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      return next(new ApiError(400, "حجم الصورة يتجاوز الحد المسموح به (5 ميغابايت)"));
    }
    if (err instanceof multer.MulterError) {
      return next(new ApiError(400, err.message));
    }
    next(err);
  });
}

const CONTENT_MEDIA_MIME_TYPES = new Set([
  ...ALLOWED_MIME_TYPES,
  ...ALLOWED_IMAGE_MIME_TYPES,
  "image/gif",
]);
const CONTENT_MEDIA_EXTENSIONS = new Set([
  ...ALLOWED_EXTENSIONS,
  ...ALLOWED_IMAGE_EXTENSIONS,
  ".gif",
]);

const contentMediaStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, CONTENT_MEDIA_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${ext}`);
  },
});

const uploadContentMediaFile = multer({
  storage: contentMediaStorage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (CONTENT_MEDIA_MIME_TYPES.has(file.mimetype) || CONTENT_MEDIA_EXTENSIONS.has(ext)) {
      return cb(null, true);
    }
    cb(new ApiError(400, "صيغة الملف غير مدعومة"));
  },
  limits: { fileSize: MAX_FILE_SIZE },
}).single("file");

export function uploadContentMedia(req, res, next) {
  uploadContentMediaFile(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      return next(new ApiError(400, "حجم الملف يتجاوز الحد المسموح به (20 ميغابايت)"));
    }
    if (err instanceof multer.MulterError) {
      return next(new ApiError(400, err.message));
    }
    next(err);
  });
}
