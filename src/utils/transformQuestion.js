export function toQuestionResponse(row) {
  if (!row) return null;

  return {
    id: row.id,
    type: row.type,
    senderName: row.sender_name,
    senderEmail: row.sender_email,
    specialty: row.specialty,
    studyLevel: row.study_level,
    subject: row.subject,
    question: row.question,
    answer: row.answer,
    isPublished: row.is_published === 1,
    status: row.status,
    createdAt: row.created_at,
    answeredAt: row.answered_at,
  };
}

export function toPublicQuestionResponse(row) {
  if (!row) return null;

  return {
    id: row.id,
    type: row.type,
    specialty: row.specialty,
    studyLevel: row.study_level,
    subject: row.subject,
    question: row.question,
    answer: row.answer,
    answeredAt: row.answered_at,
  };
}
