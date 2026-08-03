import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { uploadContentMedia } from "../middleware/upload.js";
import {
  listEntries,
  getEntry,
  createEntry,
  updateEntry,
  deleteEntry,
  uploadMedia,
  removeMedia,
} from "../controllers/contentStudioController.js";

const router = Router();

router.use(requireAuth);
router.get("/", listEntries);
router.get("/:id", getEntry);
router.post("/", createEntry);
router.put("/:id", updateEntry);
router.delete("/:id", deleteEntry);
router.post("/media/upload", uploadContentMedia, uploadMedia);
router.delete("/media/:filename", removeMedia);

export default router;
