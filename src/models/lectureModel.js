import pool from "../config/db.js";

export async function findLectureById(id) {
  const [rows] = await pool.query("SELECT * FROM lectures WHERE id = ?", [id]);
  return rows[0] || null;
}

export async function findLectures({ page, limit, type, search }) {
  const conditions = [];
  const params = [];

  if (type === "video") {
    conditions.push("youtube_url IS NOT NULL");
  } else if (type === "file") {
    conditions.push("file_path IS NOT NULL");
  }

  if (search) {
    conditions.push("title LIKE ?");
    params.push(`%${search}%`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM lectures ${whereClause}`,
    params
  );
  const total = countRows[0].total;

  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT * FROM lectures ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { rows, total };
}

export async function createLecture(data) {
  const [result] = await pool.query(
    `INSERT INTO lectures
      (title, description, youtube_url, youtube_id, location, file_path, file_original_name, file_mime_type, file_size, thumbnail_path)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.title,
      data.description,
      data.youtubeUrl,
      data.youtubeId,
      data.location,
      data.filePath,
      data.fileOriginalName,
      data.fileMimeType,
      data.fileSize,
      data.thumbnailPath,
    ]
  );
  return findLectureById(result.insertId);
}

export async function updateLecture(id, columns) {
  const entries = Object.entries(columns);
  if (entries.length === 0) return findLectureById(id);

  const setClause = entries.map(([column]) => `${column} = ?`).join(", ");
  const params = entries.map(([, value]) => value);
  params.push(id);

  await pool.query(`UPDATE lectures SET ${setClause} WHERE id = ?`, params);
  return findLectureById(id);
}

export async function deleteLecture(id) {
  await pool.query("DELETE FROM lectures WHERE id = ?", [id]);
}
