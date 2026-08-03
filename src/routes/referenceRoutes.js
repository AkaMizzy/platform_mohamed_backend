import { Router } from "express";
import { uploadReferenceFile } from "../middleware/upload.js";
import { requireAuth } from "../middleware/auth.js";
import {
  createReference,
  getReferences,
  getReferenceById,
  updateReference,
  deleteReference,
} from "../controllers/referenceController.js";

const router = Router();

router.get("/", getReferences);
router.get("/:id", getReferenceById);
router.post("/", requireAuth, uploadReferenceFile, createReference);
router.put("/:id", requireAuth, uploadReferenceFile, updateReference);
router.delete("/:id", requireAuth, deleteReference);

export default router;
