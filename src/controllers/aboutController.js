import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { toAboutResponse } from "../utils/transformAbout.js";
import * as AboutModel from "../models/aboutModel.js";

function validateLines(value, fieldName, errors, label) {
  if (!Array.isArray(value) || value.filter((line) => line && line.trim()).length === 0) {
    errors[fieldName] = `${label} مطلوب (سطر واحد على الأقل)`;
    return "";
  }
  return value.map((line) => line.trim()).filter(Boolean).join("\n");
}

export const getAbout = asyncHandler(async (req, res) => {
  const profile = await AboutModel.getProfile();
  if (!profile) throw new ApiError(404, "الملف الشخصي غير موجود");
  res.json({ success: true, data: toAboutResponse(profile) });
});

export const updateAbout = asyncHandler(async (req, res) => {
  const {
    name,
    title,
    shortBio,
    fullBio,
    academicCareer,
    positions,
    researchInterests,
    contributions,
    contact,
  } = req.body;

  const errors = {};

  if (!name || !name.trim()) errors.name = "الاسم مطلوب";
  if (!title || !title.trim()) errors.title = "الصفة العلمية مطلوبة";
  if (!shortBio || !shortBio.trim()) errors.shortBio = "الملخص التعريفي مطلوب";

  const fullBioText = validateLines(fullBio, "fullBio", errors, "نص السيرة الذاتية");
  const academicCareerText = validateLines(academicCareer, "academicCareer", errors, "المسار الأكاديمي");
  const positionsText = validateLines(positions, "positions", errors, "المهام والمسؤوليات");
  const researchInterestsText = validateLines(researchInterests, "researchInterests", errors, "الاهتمامات البحثية");
  const contributionsText = validateLines(contributions, "contributions", errors, "الإسهامات العلمية");

  if (!contact?.email || !contact.email.trim()) errors["contact.email"] = "البريد الإلكتروني مطلوب";
  if (!contact?.phone || !contact.phone.trim()) errors["contact.phone"] = "رقم الهاتف مطلوب";
  if (!contact?.address || !contact.address.trim()) errors["contact.address"] = "العنوان مطلوب";

  if (Object.keys(errors).length > 0) {
    throw new ApiError(400, "بيانات غير صالحة", errors);
  }

  const updated = await AboutModel.updateProfile({
    name: name.trim(),
    title: title.trim(),
    short_bio: shortBio.trim(),
    full_bio: fullBioText,
    academic_career: academicCareerText,
    positions: positionsText,
    research_interests: researchInterestsText,
    contributions: contributionsText,
    contact_email: contact.email.trim(),
    contact_phone: contact.phone.trim(),
    contact_address: contact.address.trim(),
    social_facebook: contact.social?.facebook?.trim() || null,
    social_twitter: contact.social?.twitter?.trim() || null,
    social_youtube: contact.social?.youtube?.trim() || null,
    social_linkedin: contact.social?.linkedin?.trim() || null,
  });

  res.json({ success: true, data: toAboutResponse(updated) });
});
