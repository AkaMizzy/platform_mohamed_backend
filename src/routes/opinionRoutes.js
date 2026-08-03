import { Router } from "express";
import { uploadOpinionCoverImage } from "../middleware/upload.js";
import { requireAuth } from "../middleware/auth.js";
import {
  createOpinion,
  getOpinions,
  getOpinionById,
  updateOpinion,
  deleteOpinion,
} from "../controllers/opinionController.js";

const router = Router();

router.get("/", getOpinions);
router.get("/:id", getOpinionById);
router.post("/", requireAuth, uploadOpinionCoverImage, createOpinion);
router.put("/:id", requireAuth, uploadOpinionCoverImage, updateOpinion);
router.delete("/:id", requireAuth, deleteOpinion);

export default router;
