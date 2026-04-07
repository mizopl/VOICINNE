import { Router } from "express";
import axios from "axios";
import { logger } from "../../lib/logger";

const router = Router();

router.get("/get-conversation-token", async (req, res) => {
  const agentId = req.query["agentId"] as string | undefined;

  if (!agentId) {
    res.status(400).json({ error: "agentId query param is required" });
    return;
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "ELEVENLABS_API_KEY not configured" });
    return;
  }

  try {
    const response = await axios.get<{ token?: string; signed_url?: string }>(
      `https://api.elevenlabs.io/v1/convai/conversation/token`,
      {
        params: { agent_id: agentId },
        headers: { "xi-api-key": apiKey },
      }
    );

    // ElevenLabs returns either { token } (JWT) or { signed_url } (wss:// URL).
    // Prefer the full signed_url; fall back to constructing one from the JWT.
    const signedUrl =
      response.data.signed_url ??
      (response.data.token
        ? `wss://api.elevenlabs.io/v1/convai/conversation?jwt=${response.data.token}`
        : null);

    if (!signedUrl) {
      logger.error({ agentId }, "[voicinne] no signed_url or token in ElevenLabs response");
      res.status(502).json({ error: "No conversation URL returned by ElevenLabs" });
      return;
    }

    logger.info({ agentId }, "[voicinne] conversation token issued");
    res.json({ signedUrl });
  } catch (err) {
    logger.error({ err, agentId }, "[voicinne] get-conversation-token failed");
    const message = err instanceof Error ? err.message : String(err);
    res.status(502).json({ error: "Failed to get conversation token", details: message });
  }
});

export default router;
