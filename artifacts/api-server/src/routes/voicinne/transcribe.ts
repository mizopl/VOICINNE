import { Router } from "express";
import multer from "multer";
import { logger } from "../../lib/logger";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/transcribe", upload.array("audio"), (req, res) => {
  const files = req.files as Express.Multer.File[] | undefined;
  logger.info(
    { fileCount: files?.length ?? 0, fieldnames: files?.map((f) => f.fieldname) },
    "[voicinne] POST /api/transcribe received"
  );
  res.json({
    transcription:
      "[MOCK] The speaker described a warm, trusting relationship with their loved one using natural, casual language filled with shared memories.",
  });
});

export default router;
