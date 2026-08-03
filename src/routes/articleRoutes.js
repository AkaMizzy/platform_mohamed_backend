import { Router } from "express";
import { uploadArticleFile } from "../middleware/upload.js";
import { requireAuth } from "../middleware/auth.js";
import {
  createArticle,
  getArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
} from "../controllers/articleController.js";

const router = Router();

router.get("/", getArticles);
router.get("/:id", getArticleById);
router.post("/", requireAuth, uploadArticleFile, createArticle);
router.put("/:id", requireAuth, uploadArticleFile, updateArticle);
router.delete("/:id", requireAuth, deleteArticle);

export default router;
