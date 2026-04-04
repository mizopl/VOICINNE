/**
 * API Client — Iteration 4: Live AI integrations
 *
 * All three functions make real HTTP requests to the Express backend.
 * API keys live exclusively on the server — never in this file.
 *
 * Base URL: https://{EXPO_PUBLIC_DOMAIN}/api-server
 * EXPO_PUBLIC_DOMAIN is injected by the mobile dev script as $REPLIT_DEV_DOMAIN.
 *
 * Platform note:
 *   On native (iOS/Android) React Native patches FormData so that appending
 *   { uri, name, type } reads the file from disk and creates a proper
 *   multipart file part.
 *   On web, that object is serialised as "[object Object]" — a plain string.
 *   We therefore branch on Platform.OS: web uses fetch+blob, native keeps
 *   the { uri, name, type } pattern.
 */

import { Platform } from 'react-native';

const API_BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api-server`;

/**
 * Append one audio file to a FormData object in a platform-safe way.
 *
 * Web  — fetch the local URI, resolve it to a Blob, then append the Blob.
 * Native — append the RN { uri, type, name } descriptor; RN's FormData patch
 *          reads the file from disk at request time.
 */
async function appendAudioFile(
  formData: FormData,
  uri: string,
  index: number
): Promise<void> {
  if (Platform.OS === 'web') {
    const fileResponse = await fetch(uri);
    const blob = await fileResponse.blob();
    formData.append('audio', blob, `audio_${index}.wav`);
  } else {
    formData.append('audio', {
      uri,
      type: 'audio/m4a',
      name: `audio_${index}.m4a`,
    } as unknown as Blob);
  }
}

/**
 * POST /api/transcribe
 * Sends all recorded audio files as multipart/form-data.
 * Returns the concatenated transcription of all answers.
 */
export async function transcribeAudio(localUris: string[]): Promise<string> {
  const validUris = localUris.filter(Boolean);
  if (validUris.length === 0) {
    throw new Error('transcribeAudio: no valid audio URIs provided');
  }

  const formData = new FormData();
  await Promise.all(validUris.map((uri, index) => appendAudioFile(formData, uri, index)));

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
 * Returns a Gemini-generated persona config object.
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
 * Sends all recorded audio files as multipart/form-data.
 * Returns the ElevenLabs voice_id of the cloned voice.
 */
export async function cloneVoice(localUris: string[]): Promise<string> {
  const validUris = localUris.filter(Boolean);
  if (validUris.length === 0) {
    throw new Error('cloneVoice: no valid audio URIs provided');
  }

  const formData = new FormData();
  await Promise.all(validUris.map((uri, index) => appendAudioFile(formData, uri, index)));

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
