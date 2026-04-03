import { Router } from "express";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";
import { logger } from "../../lib/logger";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/transcribe", upload.array("audio"), async (req, res) => {
  const files = req.files as Express.Multer.File[] | undefined;
  logger.info(
    { fileCount: files?.length ?? 0 },
    "[voicinne] POST /api/transcribe received"
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
    const file = files[0];
    const form = new FormData();
    form.append("file", file.buffer, {
      filename: file.originalname || "audio.m4a",
      contentType: file.mimetype || "audio/m4a",
    });
    form.append("model_id", "scribe_v1");

    const response = await axios.post<{ text: string }>(
      "https://api.elevenlabs.io/v1/speech-to-text",
      form,
      {
        headers: {
          "xi-api-key": apiKey,
          ...form.getHeaders(),
        },
      }
    );

    const transcription = response.data.text;
    logger.info(
      { transcriptionLength: transcription.length },
      "[voicinne] transcription received from ElevenLabs"
    );
    res.json({ transcription });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error({ err }, "[voicinne] transcribe failed");
    res.status(502).json({ error: "Transcription failed", details: message });
  }
});

export default router;
