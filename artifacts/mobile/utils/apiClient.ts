/**
 * API Client — Stub Functions (Iteration 2)
 *
 * These are mock implementations that simulate the three core API calls
 * planned for the secure Replit Serverless Backend in a future iteration.
 * All functions introduce a realistic async delay to simulate network latency.
 *
 * ARCHITECTURE NOTE:
 * In production, all API keys (ElevenLabs, Gemini, etc.) will live exclusively
 * on the server side. This client file will only ever call our own backend
 * endpoints — never third-party APIs directly — to prevent key exposure.
 */

const MOCK_DELAY_MS = 1200;

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Stub: Transcribes the recorded audio files into a combined text string.
 * Production: Will POST local file URIs to our backend, which calls a
 * speech-to-text service (e.g. Whisper / Google STT) server-side.
 */
export async function transcribeAudio(localUris: string[]): Promise<string> {
  await delay(MOCK_DELAY_MS);
  return `[STUB] Transcribed ${localUris.length} audio file(s). Lorem ipsum dolor sit amet, the user answered warmly with personal details about their relationship.`;
}

/**
 * Stub: Generates a psychological persona profile from the transcription.
 * Production: Will POST transcription to our backend, which calls a
 * Gemini AI agent server-side and returns a structured persona JSON.
 */
export async function generatePersona(transcription: string): Promise<Record<string, unknown>> {
  await delay(MOCK_DELAY_MS);
  return {
    stub: true,
    inputLength: transcription.length,
    persona: {
      tone: 'warm',
      relationship: 'close_family',
      vocabulary: 'casual',
      emotionalTriggers: ['trust', 'familiarity', 'urgency'],
    },
  };
}

/**
 * Stub: Submits audio samples to clone the user's voice.
 * Production: Will POST local file URIs to our backend, which calls
 * ElevenLabs Voice Cloning API server-side and returns a voice_id.
 */
export async function cloneVoice(localUris: string[]): Promise<string> {
  await delay(MOCK_DELAY_MS);
  return `stub_voice_id_${Date.now()}_samples_${localUris.length}`;
}
