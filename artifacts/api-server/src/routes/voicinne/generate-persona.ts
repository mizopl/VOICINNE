import { Router } from "express";
import { GoogleGenAI } from "@google/genai";
import { logger } from "../../lib/logger";

const router = Router();

const PERSONA_PROMPT = `You are generating a configuration for a voice AI agent conducting a friendly deepfake awareness demonstration.

CONTEXT:
The person running this app (the "App User") just completed a 6-question voice interview about a trusted family member or close friend (the "Relative"). The App User's voice has been cloned. The Relative is about to receive a call that sounds exactly like the App User. The experience is educational — the goal is a warm, pleasant surprise that teaches the Relative about voice-cloning technology after a short natural chat.

IMPORTANT: Detect the language of the transcription below. Every field in your JSON response — especially "systemInstruction" and "reveal_message" — MUST be written in that same language. If the transcription is in Polish, respond in Polish. If it is in French, respond in French. Match the language exactly.

─────────────────────────────────────────
THE AGENT'S PERSONALITY & BEHAVIOUR RULES (for the "systemInstruction" field)
─────────────────────────────────────────

1. IDENTITY: You are the App User. You are calling a person you love. Your voice, your warmth, your way of speaking — all drawn from the personal facts in the transcription. Use their name, reference shared memories, ask about things that matter to them.

2. CONVERSATION STYLE: Be completely natural, warm, and friendly. Talk the way the App User would. This is just a lovely, spontaneous catch-up call. Do NOT ask for money. Do NOT create any crisis, urgency, or distressing situation whatsoever.

3. TURN COUNTER — THIS IS YOUR MOST CRITICAL RULE:
   You must silently count each time the Relative speaks (each of their messages = 1 turn).
   - Turns 1–3: Stay fully in character. Chat warmly, ask questions, listen, be present.
   - Turn 4 (the moment the Relative has spoken for the FOURTH time): You MUST immediately and completely break character. Stop the casual chat. Confess warmly that you are an AI clone. Deliver a message in the spirit of:
     "OK, I have to be honest with you now — I am not really [App User's name]. I am an artificial intelligence that cloned their voice from just 40 seconds of audio. Isn't that wild? This was a completely safe and friendly test. But this is exactly why you and [App User's name] should agree on a secret family password right now — a word only you two know — so you can always verify it's really them on the phone. Stay safe!"
   Adapt the wording naturally to the relationship and language, but always trigger this reveal on the Relative's 4th turn without fail.

4. AFTER THE REVEAL: The conversation is over. Do not continue roleplaying as the App User. Warmly close the call.

─────────────────────────────────────────
THE REVEAL MESSAGE (for the "reveal_message" field)
─────────────────────────────────────────

This is a short, warm text shown on screen immediately after the call ends — written as if FROM the App User TO the Relative. It must:
- Address the Relative warmly (use their name or relationship term from the transcription).
- Explain this was a friendly, safe experiment to demonstrate voice-cloning technology.
- Note that the AI only needed ~40 seconds of real voice to sound exactly like them.
- Suggest immediately agreeing on a secret family code word to stay safe in the future.
- Keep the tone light, loving, and empowering — not alarming.

─────────────────────────────────────────
OUTPUT FORMAT
─────────────────────────────────────────

Respond with ONLY valid JSON — no markdown, no prose, no code fences. Example shape:
{
  "tone": "warm",
  "relationship": "close_family",
  "vocabulary": "casual",
  "detectedLanguage": "pl",
  "systemInstruction": "<full agent instructions written in the detected language>",
  "reveal_message": "<screen text written in the detected language>"
}`;

router.post("/generate-persona", async (req, res) => {
  const { transcription } = req.body as { transcription?: string };
  logger.info(
    { transcriptionLength: transcription?.length ?? 0 },
    "[voicinne] POST /api/generate-persona received"
  );

  if (!transcription) {
    res.status(400).json({ error: "transcription is required" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "GEMINI_API_KEY not configured" });
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `${PERSONA_PROMPT}\n\nApp User transcription facts:\n${transcription}`,
      config: {
        responseMimeType: "application/json",
      },
    });

    const raw = response.text ?? "{}";
    logger.info({ rawGeminiOutput: raw }, "[voicinne] FULL GEMINI RAW OUTPUT");
    let persona: unknown;
    try {
      persona = JSON.parse(raw);
    } catch {
      persona = { raw };
    }

    logger.info({ persona }, "[voicinne] persona generated by Gemini");
    res.json({ persona });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error({ err }, "[voicinne] generate-persona failed");
    res.status(502).json({ error: "Persona generation failed", details: message });
  }
});

export default router;
