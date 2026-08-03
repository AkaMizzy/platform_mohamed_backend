import pool from "../config/db.js";

export async function findById(id) {
  const [rows] = await pool.query("SELECT * FROM content_entries WHERE id = ?", [id]);
  return rows[0] || null;
}

export async function findBySlug(slug) {
  const [rows] = await pool.query("SELECT * FROM content_entries WHERE slug = ?", [slug]);
  return rows[0] || null;
}

export async function list({ page, limit, type, status, search }) {
  const conditions = [];
  const params = [];

  if (type) {
    conditions.push("content_type = ?");
    params.push(type);
  }
  if (status) {
    conditions.push("status = ?");
    params.push(status);
  }
  if (search) {
    conditions.push("(title LIKE ? OR slug LIKE ? OR category LIKE ?)");
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM content_entries ${where}`,
    params
  );
  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT * FROM content_entries ${where}
     ORDER BY updated_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { rows, total: Number(countRows[0].total) };
}

export async function create(data) {
  const [result] = await pool.query(
    `INSERT INTO content_entries
      (content_type, title, slug, excerpt, content_html, status, category, tags,
       author_id, author_name, publication_date, scheduled_at, featured_image_url,
       featured_image_alt, featured_image_caption, seo_title, seo_description,
       template_key, dynamic_fields)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.contentType,
      data.title,
      data.slug,
      data.excerpt,
      data.contentHtml,
      data.status,
      data.category,
      data.tags,
      data.authorId,
      data.authorName,
      data.publicationDate,
      data.scheduledAt,
      data.featuredImageUrl,
      data.featuredImageAlt,
      data.featuredImageCaption,
      data.seoTitle,
      data.seoDescription,
      data.templateKey,
      data.dynamicFields,
    ]
  );
  return findById(result.insertId);
}

export async function update(id, columns) {
  const entries = Object.entries(columns);
  if (entries.length === 0) return findById(id);

  const setClause = entries.map(([column]) => `${column} = ?`).join(", ");
  await pool.query(
    `UPDATE content_entries SET ${setClause} WHERE id = ?`,
    [...entries.map(([, value]) => value), id]
  );
  return findById(id);
}

export async function remove(id) {
  await pool.query("DELETE FROM content_entries WHERE id = ?", [id]);
}
