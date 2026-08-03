import pool from "../config/db.js";

const CATEGORIES = ["legal", "social", "educational", "cultural", "technology", "public_affairs"];

export { CATEGORIES as OPINION_CATEGORIES };

export async function findOpinionById(id) {
  const [rows] = await pool.query("SELECT * FROM opinions WHERE id = ?", [id]);
  return rows[0] || null;
}

export async function findOpinions({ page, limit, category, search }) {
  const conditions = [];
  const params = [];

  if (category && CATEGORIES.includes(category)) {
    conditions.push("category = ?");
    params.push(category);
  }

  if (search) {
    conditions.push("(title LIKE ? OR topic LIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM opinions ${whereClause}`,
    params
  );
  const total = countRows[0].total;

  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT * FROM opinions ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { rows, total };
}

export async function findRelatedOpinions(category, excludeId, limit = 3) {
  const [sameCategoryRows] = await pool.query(
    `SELECT * FROM opinions WHERE category = ? AND id != ? ORDER BY created_at DESC LIMIT ?`,
    [category, excludeId, limit]
  );

  if (sameCategoryRows.length >= limit) return sameCategoryRows;

  const excludeIds = [excludeId, ...sameCategoryRows.map((r) => r.id)];
  const placeholders = excludeIds.map(() => "?").join(", ");
  const [backfillRows] = await pool.query(
    `SELECT * FROM opinions WHERE id NOT IN (${placeholders}) ORDER BY created_at DESC LIMIT ?`,
    [...excludeIds, limit - sameCategoryRows.length]
  );

  return [...sameCategoryRows, ...backfillRows];
}

export async function createOpinion(data) {
  const [result] = await pool.query(
    `INSERT INTO opinions
      (title, content, category, topic, cover_image_path)
     VALUES (?, ?, ?, ?, ?)`,
    [
      data.title,
      data.content,
      data.category,
      data.topic,
      data.coverImagePath,
    ]
  );
  return findOpinionById(result.insertId);
}

export async function updateOpinion(id, columns) {
  const entries = Object.entries(columns);
  if (entries.length === 0) return findOpinionById(id);

  const setClause = entries.map(([column]) => `${column} = ?`).join(", ");
  const params = entries.map(([, value]) => value);
  params.push(id);

  await pool.query(`UPDATE opinions SET ${setClause} WHERE id = ?`, params);
  return findOpinionById(id);
}

export async function deleteOpinion(id) {
  await pool.query("DELETE FROM opinions WHERE id = ?", [id]);
}
