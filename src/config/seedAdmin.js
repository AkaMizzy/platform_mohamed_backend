import bcrypt from "bcryptjs";
import * as UserModel from "../models/userModel.js";

const ADMIN_NAME = "الدكتور محمد لفريخي";
const ADMIN_EMAIL = "mohamed_lafrikhi@gmail.com";
const ADMIN_PASSWORD = "12345678";

export async function ensureAdminUser() {
  const existing = await UserModel.findByEmail(ADMIN_EMAIL);
  if (existing) return;

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await UserModel.createUser({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: hashedPassword,
  });

  console.log(`Seeded default admin account: ${ADMIN_EMAIL}`);
}
