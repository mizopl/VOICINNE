import { Router } from "express";
import axios from "axios";
import { logger } from "../../lib/logger";

const router = Router();

interface CreateAgentBody {
  voice_id: string;
  system_prompt: string;
}

interface ElevenLabsCreateAgentResponse {
  agent_id: string;
}

router.post("/create-agent", async (req, res) => {
  const { voice_id, system_prompt } = req.body as Partial<CreateAgentBody>;

  logger.info(
    { voice_id, systemPromptLength: system_prompt?.length ?? 0 },
    "[voicinne] POST /api/create-agent received"
  );

  if (!voice_id) {
    res.status(400).json({ error: "voice_id is required" });
    return;
  }
  if (!system_prompt) {
    res.status(400).json({ error: "system_prompt is required" });
    return;
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "ELEVENLABS_API_KEY not configured" });
    return;
  }

  try {
    const response = await axios.post<ElevenLabsCreateAgentResponse>(
      "https://api.elevenlabs.io/v1/convai/agents/create",
      {
        name: `voicinne_agent_${voice_id}`,
        conversation_config: {
          agent: {
            prompt: {
              prompt: system_prompt,
            },
            first_message:
              "Hello, it's me. I just needed to hear your voice. How are you doing?",
          },
          tts: {
            voice_id,
          },
        },
        platform_settings: {
          auth: {
            enable_auth: false,
          },
          privacy: {
            record_voice: true,
            retention_days: -1,
            delete_audio: false,
            delete_transcript_and_pii: false,
          },
        },
      },
      {
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    const agent_id = response.data.agent_id;
    logger.info(
      { agent_id, voice_id },
      "[voicinne] ConvAI agent created via ElevenLabs"
    );
    res.json({ agent_id });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error({ err }, "[voicinne] create-agent failed");
    res.status(502).json({ error: "Agent creation failed", details: message });
  }
});

export default router;
