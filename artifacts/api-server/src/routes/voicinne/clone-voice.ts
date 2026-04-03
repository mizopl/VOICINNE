import { Router } from "express";
import multer from "multer";
import { logger } from "../../lib/logger";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/clone-voice", upload.array("audio"), (req, res) => {
  const files = req.files as Express.Multer.File[] | undefined;
  logger.info(
    { fileCount: files?.length ?? 0 },
    "[voicinne] POST /api/clone-voice received"
  );
  res.json({ voice_id: "mock_123" });
});

export default router;
