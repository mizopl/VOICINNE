import { Router } from "express";
import axios from "axios";
import { logger } from "../../lib/logger";

const router = Router();

interface CreateAgentBody {
  voice_id: string;
  system_prompt: string;
  first_message?: string;
  reveal_message?: string;
  language_code?: string;
}

interface ElevenLabsCreateAgentResponse {
  agent_id: string;
}

router.post("/create-agent", async (req, res) => {
  const { voice_id, system_prompt, first_message, reveal_message, language_code } =
    req.body as Partial<CreateAgentBody>;

  const rawLang = language_code?.trim() ?? "";
  const resolvedLang = /^[a-z]{2}$/.test(rawLang) ? rawLang : "en";

  logger.info(
    {
      voice_id,
      systemPromptLength: system_prompt?.length ?? 0,
      hasFirstMessage: Boolean(first_message),
      hasRevealMessage: Boolean(reveal_message),
      languageCode: resolvedLang,
    },
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
          turn: {
            turn_timeout: 1.0,
            mode: "turn",
            turn_eagerness: "eager",
            speculative_turn: true,
          },
          conversation: {
            max_duration_seconds: 180,
          },
          tts: {
            model_id: resolvedLang === "en" ? "eleven_flash_v2" : "eleven_flash_v2_5",
            voice_id,
            stability: 0.2,
            speed: 1.0,
            similarity_boost: 1.0,
          },
          agent: {
            first_message: first_message || undefined,
            language: resolvedLang,
            prompt: {
              prompt: system_prompt,
              llm: "gemini-2.5-flash",
              temperature: 1.0,
              tools: [
                {
                  type: "system",
                  name: "end_call",
                  description: "End a conversation after the reveal of the AI persona.",
                  response_timeout_secs: 20,
                  disable_interruptions: true,
                  force_pre_tool_speech: false,
                  params: {
                    system_tool_type: "end_call",
                  },
                },
              ],
            },
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

    res.json({ agent_id, reveal_message: reveal_message ?? "" });
  } catch (err: unknown) {
    const axiosErr = err as { response?: { status?: number; data?: unknown }; message?: string };
    const responseBody = axiosErr?.response?.data;
    const responseStatus = axiosErr?.response?.status;
    const message = err instanceof Error ? err.message : String(err);
    logger.error(
      { err, elevenLabsStatus: responseStatus, elevenLabsBody: responseBody },
      "[voicinne] create-agent failed"
    );
    res.status(502).json({ error: "Agent creation failed", details: message, elevenLabsBody: responseBody });
  }
});

export default router;
