import { Router } from "express";
import { logger } from "../../lib/logger";

const router = Router();

router.post("/generate-persona", (req, res) => {
  const { transcription } = req.body as { transcription?: string };
  logger.info(
    { transcriptionLength: transcription?.length ?? 0 },
    "[voicinne] POST /api/generate-persona received"
  );
  res.json({
    mock: true,
    persona: {
      tone: "warm",
      relationship: "close_family",
      vocabulary: "casual",
      emotionalTriggers: ["trust", "familiarity", "urgency"],
      systemInstruction:
        "You are a trusted loved one speaking on a phone call. Use a warm, familiar tone. Reference shared memories naturally. Keep responses short and conversational.",
    },
  });
});

export default router;
