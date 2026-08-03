import pool from "../config/db.js";

export async function getProfile() {
  const [rows] = await pool.query("SELECT * FROM about_profile WHERE id = 1");
  return rows[0] || null;
}

export async function updateProfile(columns) {
  const entries = Object.entries(columns);
  if (entries.length === 0) return getProfile();

  const setClause = entries.map(([column]) => `${column} = ?`).join(", ");
  const params = entries.map(([, value]) => value);

  await pool.query(`UPDATE about_profile SET ${setClause} WHERE id = 1`, params);
  return getProfile();
}
