import pool from "../config/db.js";

export async function findReferenceById(id) {
  const [rows] = await pool.query("SELECT * FROM `references` WHERE id = ?", [id]);
  return rows[0] || null;
}

export async function findReferences({ page, limit, type, search }) {
  const conditions = [];
  const params = [];

  if (type === "file") {
    conditions.push("source_type = 'file'");
  } else if (type === "link") {
    conditions.push("source_type = 'link'");
  }

  if (search) {
    conditions.push("title LIKE ?");
    params.push(`%${search}%`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM \`references\` ${whereClause}`,
    params
  );
  const total = countRows[0].total;

  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT * FROM \`references\` ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { rows, total };
}

export async function createReference(data) {
  const [result] = await pool.query(
    `INSERT INTO \`references\`
      (title, description, source_type, link_url, file_path, file_original_name, file_mime_type, thumbnail_path)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.title,
      data.description,
      data.sourceType,
      data.linkUrl,
      data.filePath,
      data.fileOriginalName,
      data.fileMimeType,
      data.thumbnailPath,
    ]
  );
  return findReferenceById(result.insertId);
}

export async function updateReference(id, columns) {
  const entries = Object.entries(columns);
  if (entries.length === 0) return findReferenceById(id);

  const setClause = entries.map(([column]) => `${column} = ?`).join(", ");
  const params = entries.map(([, value]) => value);
  params.push(id);

  await pool.query(`UPDATE \`references\` SET ${setClause} WHERE id = ?`, params);
  return findReferenceById(id);
}

export async function deleteReference(id) {
  await pool.query("DELETE FROM `references` WHERE id = ?", [id]);
}
