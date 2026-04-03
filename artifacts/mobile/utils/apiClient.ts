/**
 * API Client — Iteration 3: Real Backend Calls
 *
 * All three functions now make actual HTTP requests to the Express server
 * running at artifacts/api-server. API keys (ElevenLabs, Gemini, etc.) are
 * NEVER placed in this file — they live exclusively on the server side.
 *
 * Base URL: https://{EXPO_PUBLIC_DOMAIN}
 * The EXPO_PUBLIC_DOMAIN env var is injected by the mobile dev script as
 * $REPLIT_DEV_DOMAIN (the Replit proxy domain). The API server artifact is
 * routed at the /api path prefix, so endpoints are /api/transcribe, etc.
 *
 * Note: Server endpoints currently return MOCK responses. Real ElevenLabs
 * and Gemini integration will be wired in on the server side in Iteration 4.
 */

const API_BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api-server`;

/**
 * POST /api/transcribe
 * Sends recorded audio files as multipart/form-data.
 * Returns a transcription string from the server.
 */
export async function transcribeAudio(localUris: string[]): Promise<string> {
  const formData = new FormData();
  localUris.forEach((uri, index) => {
    formData.append('audio', {
      uri,
      type: 'audio/m4a',
      name: `audio_${index}.m4a`,
    } as unknown as Blob);
  });

  const response = await fetch(`${API_BASE}/api/transcribe`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`transcribeAudio failed: ${response.status} ${response.statusText}`);
  }

  const json = await response.json() as { transcription: string };
  return json.transcription;
}

/**
 * POST /api/generate-persona
 * Sends the transcription as JSON.
 * Returns a persona profile object from the server.
 */
export async function generatePersona(transcription: string): Promise<Record<string, unknown>> {
  const response = await fetch(`${API_BASE}/api/generate-persona`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcription }),
  });

  if (!response.ok) {
    throw new Error(`generatePersona failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<Record<string, unknown>>;
}

/**
 * POST /api/clone-voice
 * Sends recorded audio files as multipart/form-data.
 * Returns a voice_id string from the server.
 */
export async function cloneVoice(localUris: string[]): Promise<string> {
  const formData = new FormData();
  localUris.forEach((uri, index) => {
    formData.append('audio', {
      uri,
      type: 'audio/m4a',
      name: `audio_${index}.m4a`,
    } as unknown as Blob);
  });

  const response = await fetch(`${API_BASE}/api/clone-voice`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`cloneVoice failed: ${response.status} ${response.statusText}`);
  }

  const json = await response.json() as { voice_id: string };
  return json.voice_id;
}
