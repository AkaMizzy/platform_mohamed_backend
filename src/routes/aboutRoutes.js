import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getAbout, updateAbout } from "../controllers/aboutController.js";

const router = Router();

router.get("/", getAbout);
router.put("/", requireAuth, updateAbout);

export default router;
