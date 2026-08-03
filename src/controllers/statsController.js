import pool from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getStats = asyncHandler(async (req, res) => {
  // All scalar counts in one round-trip
  const [scalarRows] = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM lectures)                                                      AS lectures_total,
      (SELECT COUNT(*) FROM lectures WHERE youtube_url IS NOT NULL)                        AS lectures_video,
      (SELECT COUNT(*) FROM lectures WHERE file_path  IS NOT NULL)                        AS lectures_file,
      (SELECT COUNT(*) FROM lectures
        WHERE YEAR(created_at) = YEAR(CURDATE())
          AND MONTH(created_at) = MONTH(CURDATE()))                                       AS lectures_this_month,

      (SELECT COUNT(*) FROM articles)                                                      AS articles_total,
      (SELECT COUNT(*) FROM articles WHERE content_type = 'text')                         AS articles_text,
      (SELECT COUNT(*) FROM articles WHERE content_type = 'file')                         AS articles_file,
      (SELECT COUNT(*) FROM articles
        WHERE YEAR(created_at) = YEAR(CURDATE())
          AND MONTH(created_at) = MONTH(CURDATE()))                                       AS articles_this_month,

      (SELECT COUNT(*) FROM \`references\`)                                                AS references_total,
      (SELECT COUNT(*) FROM \`references\` WHERE source_type = 'file')                    AS references_file,
      (SELECT COUNT(*) FROM \`references\` WHERE source_type = 'link')                    AS references_link,
      (SELECT COUNT(*) FROM \`references\`
        WHERE YEAR(created_at) = YEAR(CURDATE())
          AND MONTH(created_at) = MONTH(CURDATE()))                                       AS references_this_month,

      (SELECT COUNT(*) FROM opinions)                                                      AS opinions_total,
      (SELECT COUNT(*) FROM opinions
        WHERE YEAR(created_at) = YEAR(CURDATE())
          AND MONTH(created_at) = MONTH(CURDATE()))                                       AS opinions_this_month
  `);
  const c = scalarRows[0];

  // Monthly aggregations for the last 6 full calendar months (parallel)
  const [[lecturesByMonthRows], [articlesByMonthRows], [referencesByMonthRows], [opinionsByMonthRows]] = await Promise.all([
    pool.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS count
      FROM   lectures
      WHERE  created_at >= DATE_SUB(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 5 MONTH)
      GROUP  BY month
      ORDER  BY month ASC
    `),
    pool.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS count
      FROM   articles
      WHERE  created_at >= DATE_SUB(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 5 MONTH)
      GROUP  BY month
      ORDER  BY month ASC
    `),
    pool.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS count
      FROM   \`references\`
      WHERE  created_at >= DATE_SUB(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 5 MONTH)
      GROUP  BY month
      ORDER  BY month ASC
    `),
    pool.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS count
      FROM   opinions
      WHERE  created_at >= DATE_SUB(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 5 MONTH)
      GROUP  BY month
      ORDER  BY month ASC
    `),
  ]);

  res.json({
    success: true,
    data: {
      lectures: {
        total:     Number(c.lectures_total),
        video:     Number(c.lectures_video),
        file:      Number(c.lectures_file),
        thisMonth: Number(c.lectures_this_month),
        byMonth:   lecturesByMonthRows.map((r) => ({ month: r.month, count: Number(r.count) })),
      },
      articles: {
        total:     Number(c.articles_total),
        text:      Number(c.articles_text),
        file:      Number(c.articles_file),
        thisMonth: Number(c.articles_this_month),
        byMonth:   articlesByMonthRows.map((r) => ({ month: r.month, count: Number(r.count) })),
      },
      references: {
        total:     Number(c.references_total),
        file:      Number(c.references_file),
        link:      Number(c.references_link),
        thisMonth: Number(c.references_this_month),
        byMonth:   referencesByMonthRows.map((r) => ({ month: r.month, count: Number(r.count) })),
      },
      opinions: {
        total:     Number(c.opinions_total),
        thisMonth: Number(c.opinions_this_month),
        byMonth:   opinionsByMonthRows.map((r) => ({ month: r.month, count: Number(r.count) })),
      },
    },
  });
});
