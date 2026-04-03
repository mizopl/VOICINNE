import { Router } from "express";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";
import { logger } from "../../lib/logger";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/clone-voice", upload.array("audio"), async (req, res) => {
  const files = req.files as Express.Multer.File[] | undefined;
  logger.info(
    { fileCount: files?.length ?? 0 },
    "[voicinne] POST /api/clone-voice received"
  );

  if (!files || files.length === 0) {
    res.status(400).json({ error: "No audio files provided" });
    return;
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "ELEVENLABS_API_KEY not configured" });
    return;
  }

  try {
    const form = new FormData();
    form.append("name", "voicinne_experiment_voice");

    for (const file of files) {
      form.append("files", file.buffer, {
        filename: file.originalname || "audio.m4a",
        contentType: file.mimetype || "audio/m4a",
      });
    }

    const response = await axios.post<{ voice_id: string }>(
      "https://api.elevenlabs.io/v1/voices/add",
      form,
      {
        headers: {
          "xi-api-key": apiKey,
          ...form.getHeaders(),
        },
      }
    );

    const voice_id = response.data.voice_id;
    logger.info({ voice_id }, "[voicinne] voice cloned via ElevenLabs");
    res.json({ voice_id });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error({ err }, "[voicinne] clone-voice failed");
    res.status(502).json({ error: "Voice cloning failed", details: message });
  }
});

export default router;
