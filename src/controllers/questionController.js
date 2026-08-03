import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { toQuestionResponse, toPublicQuestionResponse } from "../utils/transformQuestion.js";
import * as QuestionModel from "../models/questionModel.js";
import { richTextToPlainText, sanitizeRichHtml } from "../utils/sanitizeRichHtml.js";

const ID_PATTERN = /^\d+$/;

function assertValidId(id) {
  if (!ID_PATTERN.test(id)) throw new ApiError(400, "معرف غير صالح");
}

// Public: submit a question
export const submitQuestion = asyncHandler(async (req, res) => {
  const { type, senderName, senderEmail, specialty, studyLevel, subject, question } = req.body;

  const errors = {};

  if (!type || !["consultation", "guidance"].includes(type)) {
    errors.type = "نوع الطلب غير صالح";
  }
  if (!senderName?.trim()) {
    errors.senderName = "الاسم الكامل مطلوب";
  }
  if (!question?.trim()) {
    errors.question = "نص السؤال أو تفاصيل الطلب مطلوبة";
  }
  if (type === "consultation" && !specialty?.trim()) {
    errors.specialty = "التخصص مطلوب للاستشارات";
  }
  if (type === "guidance" && !studyLevel?.trim()) {
    errors.studyLevel = "المستوى الدراسي مطلوب";
  }
  if (type === "guidance" && !subject?.trim()) {
    errors.subject = "موضوع الطلب مطلوب";
  }

  if (Object.keys(errors).length > 0) {
    throw new ApiError(400, "بيانات غير صالحة", errors);
  }

  const created = await QuestionModel.createQuestion({
    type,
    senderName: senderName.trim(),
    senderEmail: senderEmail?.trim() || null,
    specialty: specialty?.trim() || null,
    studyLevel: studyLevel?.trim() || null,
    subject: subject?.trim() || null,
    question: question.trim(),
  });

  res.status(201).json({ success: true, data: toQuestionResponse(created) });
});

// Public: get published Q&As (for Consultations and Guidance pages)
export const getPublishedQuestions = asyncHandler(async (req, res) => {
  const type = ["consultation", "guidance"].includes(req.query.type) ? req.query.type : null;
  const rows = await QuestionModel.findPublishedQuestions(type);
  res.json({ success: true, data: rows.map(toPublicQuestionResponse) });
});

// Admin: list all questions
export const getQuestions = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const type = ["consultation", "guidance"].includes(req.query.type) ? req.query.type : null;
  const status = ["pending", "answered"].includes(req.query.status) ? req.query.status : null;
  const search = req.query.search?.trim() || "";

  const { rows, total } = await QuestionModel.findQuestions({ page, limit, type, status, search });

  res.json({
    success: true,
    data: rows.map(toQuestionResponse),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  });
});

// Admin: get single question
export const getQuestionById = asyncHandler(async (req, res) => {
  assertValidId(req.params.id);
  const question = await QuestionModel.findQuestionById(req.params.id);
  if (!question) throw new ApiError(404, "السؤال غير موجود");
  res.json({ success: true, data: toQuestionResponse(question) });
});

// Admin: answer a question (and optionally publish)
export const answerQuestion = asyncHandler(async (req, res) => {
  assertValidId(req.params.id);

  const existing = await QuestionModel.findQuestionById(req.params.id);
  if (!existing) throw new ApiError(404, "السؤال غير موجود");

  const { answer, isPublished } = req.body;

  if (!richTextToPlainText(answer)) {
    throw new ApiError(400, "نص الجواب مطلوب", { answer: "الجواب مطلوب" });
  }

  const updated = await QuestionModel.answerQuestion(
    req.params.id,
    sanitizeRichHtml(answer),
    isPublished === true || isPublished === "true"
  );

  res.json({ success: true, data: toQuestionResponse(updated) });
});

// Admin: toggle publish status
export const setPublished = asyncHandler(async (req, res) => {
  assertValidId(req.params.id);

  const existing = await QuestionModel.findQuestionById(req.params.id);
  if (!existing) throw new ApiError(404, "السؤال غير موجود");

  if (existing.status !== "answered") {
    throw new ApiError(400, "لا يمكن نشر سؤال لم يتم الإجابة عليه بعد");
  }

  const publish = req.body.isPublished === true || req.body.isPublished === "true";
  const updated = await QuestionModel.setPublished(req.params.id, publish);

  res.json({ success: true, data: toQuestionResponse(updated) });
});

// Admin: delete a question
export const deleteQuestion = asyncHandler(async (req, res) => {
  assertValidId(req.params.id);

  const existing = await QuestionModel.findQuestionById(req.params.id);
  if (!existing) throw new ApiError(404, "السؤال غير موجود");

  await QuestionModel.deleteQuestion(req.params.id);
  res.json({ success: true, data: null, message: "تم حذف السؤال بنجاح" });
});
