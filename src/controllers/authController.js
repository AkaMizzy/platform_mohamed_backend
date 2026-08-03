import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as UserModel from "../models/userModel.js";

const COOKIE_NAME = "token";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

function toUserResponse(user) {
  return { id: user.id, name: user.name, email: user.email };
}

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const errors = {};
  if (!email || !email.trim()) errors.email = "البريد الإلكتروني مطلوب";
  if (!password) errors.password = "كلمة المرور مطلوبة";
  if (Object.keys(errors).length > 0) {
    throw new ApiError(400, "بيانات غير صالحة", errors);
  }

  const user = await UserModel.findByEmail(email.trim().toLowerCase());
  if (!user) throw new ApiError(401, "البريد الإلكتروني أو كلمة المرور غير صحيحة");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new ApiError(401, "البريد الإلكتروني أو كلمة المرور غير صحيحة");

  setAuthCookie(res, signToken(user));
  res.json({ success: true, data: toUserResponse(user) });
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie(COOKIE_NAME, { path: "/" });
  res.json({ success: true, data: null, message: "تم تسجيل الخروج بنجاح" });
});

export const me = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.user.id);
  if (!user) throw new ApiError(401, "غير مصرح بالدخول");
  res.json({ success: true, data: toUserResponse(user) });
});
