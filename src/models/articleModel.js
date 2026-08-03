import pool from "../config/db.js";

export async function findArticleById(id) {
  const [rows] = await pool.query("SELECT * FROM articles WHERE id = ?", [id]);
  return rows[0] || null;
}

export async function findArticles({ page, limit, type, search }) {
  const conditions = [];
  const params = [];

  if (type === "text" || type === "file") {
    conditions.push("content_type = ?");
    params.push(type);
  }

  if (search) {
    conditions.push("title LIKE ?");
    params.push(`%${search}%`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM articles ${whereClause}`,
    params
  );
  const total = countRows[0].total;

  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT * FROM articles ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { rows, total };
}

export async function createArticle(data) {
  const [result] = await pool.query(
    `INSERT INTO articles
      (title, description, content_type, content_text, file_path, file_original_name, file_mime_type, thumbnail_path)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.title,
      data.description,
      data.contentType,
      data.contentText,
      data.filePath,
      data.fileOriginalName,
      data.fileMimeType,
      data.thumbnailPath,
    ]
  );
  return findArticleById(result.insertId);
}

export async function updateArticle(id, columns) {
  const entries = Object.entries(columns);
  if (entries.length === 0) return findArticleById(id);

  const setClause = entries.map(([column]) => `${column} = ?`).join(", ");
  const params = entries.map(([, value]) => value);
  params.push(id);

  await pool.query(`UPDATE articles SET ${setClause} WHERE id = ?`, params);
  return findArticleById(id);
}

export async function deleteArticle(id) {
  await pool.query("DELETE FROM articles WHERE id = ?", [id]);
}
