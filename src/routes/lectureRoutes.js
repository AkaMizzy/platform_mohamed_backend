import { Router } from "express";
import { uploadLectureFile } from "../middleware/upload.js";
import { requireAuth } from "../middleware/auth.js";
import {
  createLecture,
  getLectures,
  getLectureById,
  updateLecture,
  deleteLecture,
} from "../controllers/lectureController.js";

const router = Router();

router.get("/", getLectures);
router.get("/:id", getLectureById);
router.post("/", requireAuth, uploadLectureFile, createLecture);
router.put("/:id", requireAuth, uploadLectureFile, updateLecture);
router.delete("/:id", requireAuth, deleteLecture);

export default router;
