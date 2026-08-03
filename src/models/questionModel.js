import pool from "../config/db.js";

export async function findQuestionById(id) {
  const [rows] = await pool.query("SELECT * FROM questions WHERE id = ?", [id]);
  return rows[0] || null;
}

export async function findQuestions({ page, limit, type, status, search }) {
  const conditions = [];
  const params = [];

  if (type && ["consultation", "guidance"].includes(type)) {
    conditions.push("type = ?");
    params.push(type);
  }
  if (status && ["pending", "answered"].includes(status)) {
    conditions.push("status = ?");
    params.push(status);
  }
  if (search) {
    conditions.push("(sender_name LIKE ? OR question LIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM questions ${whereClause}`,
    params
  );
  const total = countRows[0].total;

  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT * FROM questions ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { rows, total };
}

export async function findPublishedQuestions(type) {
  const conditions = ["is_published = 1", "status = 'answered'"];
  const params = [];

  if (type && ["consultation", "guidance"].includes(type)) {
    conditions.push("type = ?");
    params.push(type);
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;

  const [rows] = await pool.query(
    `SELECT * FROM questions ${whereClause} ORDER BY answered_at DESC`,
    params
  );

  return rows;
}

export async function createQuestion(data) {
  const [result] = await pool.query(
    `INSERT INTO questions
      (type, sender_name, sender_email, specialty, study_level, subject, question)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.type,
      data.senderName,
      data.senderEmail || null,
      data.specialty || null,
      data.studyLevel || null,
      data.subject || null,
      data.question,
    ]
  );
  return findQuestionById(result.insertId);
}

export async function answerQuestion(id, answer, isPublished) {
  await pool.query(
    `UPDATE questions
     SET answer = ?, is_published = ?, status = 'answered', answered_at = NOW()
     WHERE id = ?`,
    [answer, isPublished ? 1 : 0, id]
  );
  return findQuestionById(id);
}

export async function setPublished(id, isPublished) {
  await pool.query(
    "UPDATE questions SET is_published = ? WHERE id = ?",
    [isPublished ? 1 : 0, id]
  );
  return findQuestionById(id);
}

export async function deleteQuestion(id) {
  await pool.query("DELETE FROM questions WHERE id = ?", [id]);
}
