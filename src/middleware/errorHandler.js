import { ApiError } from "../utils/ApiError.js";

export function notFound(req, res, next) {
  next(new ApiError(404, `المسار غير موجود: ${req.originalUrl}`));
}

export function errorHandler(err, req, res, next) {
  const status = err instanceof ApiError ? err.status : err.status || 500;
  const message = err.message || "حدث خطأ في الخادم";

  res.status(status).json({
    success: false,
    message,
    ...(err instanceof ApiError && err.errors && { errors: err.errors }),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}
