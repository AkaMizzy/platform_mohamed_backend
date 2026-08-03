function parseJson(value, fallback) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function toContentEntryResponse(row) {
  if (!row) return null;
  return {
    id: row.id,
    contentType: row.content_type,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    contentHtml: row.content_html,
    status: row.status,
    category: row.category,
    tags: parseJson(row.tags, []),
    authorId: row.author_id,
    authorName: row.author_name,
    publicationDate: row.publication_date,
    scheduledAt: row.scheduled_at,
    featuredImageUrl: row.featured_image_url,
    featuredImageAlt: row.featured_image_alt,
    featuredImageCaption: row.featured_image_caption,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    templateKey: row.template_key,
    dynamicFields: parseJson(row.dynamic_fields, {}),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
