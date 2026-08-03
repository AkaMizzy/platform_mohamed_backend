export function toReferenceResponse(row, req) {
  if (!row) return null;

  const fileUrl = row.file_path
    ? `${req.protocol}://${req.get("host")}/uploads/references/${row.file_path}`
    : null;
  const thumbnailUrl = row.thumbnail_path
    ? `${req.protocol}://${req.get("host")}/uploads/thumbnails/${row.thumbnail_path}`
    : null;

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    sourceType: row.source_type,
    linkUrl: row.link_url,
    file: row.file_path
      ? {
          url: fileUrl,
          originalName: row.file_original_name,
          mimeType: row.file_mime_type,
          thumbnailUrl,
        }
      : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
