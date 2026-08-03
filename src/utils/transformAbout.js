function toLines(text) {
  return text.split("\n").map((line) => line.trim()).filter(Boolean);
}

export function toAboutResponse(row) {
  if (!row) return null;

  return {
    name: row.name,
    title: row.title,
    shortBio: row.short_bio,
    fullBio: toLines(row.full_bio),
    academicCareer: toLines(row.academic_career),
    positions: toLines(row.positions),
    researchInterests: toLines(row.research_interests),
    contributions: toLines(row.contributions),
    contact: {
      email: row.contact_email,
      phone: row.contact_phone,
      address: row.contact_address,
      social: {
        facebook: row.social_facebook,
        twitter: row.social_twitter,
        youtube: row.social_youtube,
        linkedin: row.social_linkedin,
      },
    },
    updatedAt: row.updated_at,
  };
}
