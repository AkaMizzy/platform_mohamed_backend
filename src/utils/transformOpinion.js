const WORDS_PER_MINUTE = 180;

function computeReadingMinutes(content) {
  const wordCount = content.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));
}

export function toOpinionResponse(row, req) {
  if (!row) return null;

  const coverImageUrl = row.cover_image_path
    ? `${req.protocol}://${req.get("host")}/uploads/opinions/${row.cover_image_path}`
    : null;

  return {
    id: row.id,
    title: row.title,
    content: row.content,
    category: row.category,
    topic: row.topic,
    coverImageUrl,
    readingMinutes: computeReadingMinutes(row.content),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
