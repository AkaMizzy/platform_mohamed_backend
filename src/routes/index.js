import { Router } from "express";
import lectureRoutes from "./lectureRoutes.js";
import authRoutes from "./authRoutes.js";
import articleRoutes from "./articleRoutes.js";
import statsRoutes from "./statsRoutes.js";
import referenceRoutes from "./referenceRoutes.js";
import questionRoutes from "./questionRoutes.js";
import opinionRoutes from "./opinionRoutes.js";
import aboutRoutes from "./aboutRoutes.js";
import contentStudioRoutes from "./contentStudioRoutes.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

router.use("/auth", authRoutes);
router.use("/lectures", lectureRoutes);
router.use("/articles", articleRoutes);
router.use("/stats", statsRoutes);
router.use("/references", referenceRoutes);
router.use("/questions", questionRoutes);
router.use("/opinions", opinionRoutes);
router.use("/about", aboutRoutes);
router.use("/content-studio", contentStudioRoutes);

export default router;
