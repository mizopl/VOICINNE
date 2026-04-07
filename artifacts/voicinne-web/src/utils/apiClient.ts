const API_BASE = `${window.location.origin}/api-server`;

async function appendAudioFile(formData: FormData, blob: Blob, index: number): Promise<void> {
  formData.append('audio', blob, `audio_${index}.wav`);
}

export async function transcribeAudio(blobs: Blob[]): Promise<string> {
  const formData = new FormData();
  blobs.forEach((blob, i) => appendAudioFile(formData, blob, i));
  const response = await fetch(`${API_BASE}/api/transcribe`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error(`transcribeAudio failed: ${response.status} ${response.statusText}`);
  const json = await response.json() as { transcription: string };
  return json.transcription;
}

export async function generatePersona(transcription: string, recordingDurationSeconds: number): Promise<Record<string, unknown>> {
  const response = await fetch(`${API_BASE}/api/generate-persona`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcription, recordingDurationSeconds }),
  });
  if (!response.ok) throw new Error(`generatePersona failed: ${response.status} ${response.statusText}`);
  return response.json() as Promise<Record<string, unknown>>;
}

export async function createAgent(
  voice_id: string,
  system_prompt: string,
  reveal_message: string,
  language_code: string,
  first_message: string
): Promise<{ agentId: string; revealMessage: string }> {
  const response = await fetch(`${API_BASE}/api/create-agent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ voice_id, system_prompt, reveal_message, language_code, first_message }),
  });
  if (!response.ok) throw new Error(`createAgent failed: ${response.status} ${response.statusText}`);
  const json = await response.json() as { agent_id: string; reveal_message: string };
  return { agentId: json.agent_id, revealMessage: json.reveal_message };
}

export async function cloneVoice(blobs: Blob[]): Promise<string> {
  const formData = new FormData();
  blobs.forEach((blob, i) => appendAudioFile(formData, blob, i));
  const response = await fetch(`${API_BASE}/api/clone-voice`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error(`cloneVoice failed: ${response.status} ${response.statusText}`);
  const json = await response.json() as { voice_id: string };
  return json.voice_id;
}

export interface ConversationTokenResult {
  conversationToken: string | null;
  signedUrl: string | null;
}

export async function getConversationToken(agentId: string): Promise<ConversationTokenResult> {
  const url = `${API_BASE}/api/get-conversation-token?agentId=${encodeURIComponent(agentId)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`getConversationToken failed: ${response.status} ${response.statusText}`);
  const json = await response.json() as ConversationTokenResult;
  return json;
}
