# Voicinne — Current State (Iteration 4)

## What Was Built

### Iteration 1 — UI Scaffold
Established the complete UI scaffold for **Voicinne**, an educational deep fake awareness mobile app built with Expo + Expo Router.

### Iteration 2 — Audio Recording + API Stubs
Added real microphone recording via `expo-av`, a typed API client stub layer, and a processing pipeline screen on onboarding completion.

### Iteration 3 — Secure Backend Architecture
Established a real data pipeline: Mobile → Express Backend (`artifacts/api-server`) → Mock Response → Mobile. Three new `/api` endpoints handle transcription, persona generation, and voice cloning. The mobile `apiClient.ts` now makes real HTTP requests instead of local stubs.

### Iteration 4 — Live AI Integrations
Replaced all mock responses with real third-party API calls server-side:
- **`/api/transcribe`** → ElevenLabs `scribe_v1` speech-to-text API — receives audio buffer via multer, POSTs to `https://api.elevenlabs.io/v1/speech-to-text`, returns real transcription text.
- **`/api/generate-persona`** → Gemini `gemini-3.1-pro-preview` — sends transcription with the persona/debriefing prompt, receives JSON with `reveal_message`, tone, relationship, and Voice Agent config.
- **`/api/clone-voice`** → ElevenLabs `v1/voices/add` — uploads all 6 recorded audio files, returns real `voice_id` for the cloned voice named `voicinne_experiment_voice`.
- Added `axios`, `form-data` for multipart HTTP uploads; `@google/genai` for Gemini.
- All routes have proper error handling: 400 for missing inputs, 500 for unconfigured keys, 502 (with `details`) for upstream API failures.

---

## Architecture

- **Framework**: React Native with Expo SDK (Expo Router for navigation)
- **Language**: TypeScript
- **Styling**: Vanilla React Native StyleSheet (no Tailwind)
- **State**: Context API (`LanguageContext`) + local `useState`/`useRef` hooks
- **Navigation**: Stack-based (no tabs) — `index → onboarding → simulation`
- **Theme**: Dark mode (`userInterfaceStyle: "dark"`), high-contrast cyan/charcoal palette
- **Audio**: `expo-av` — real microphone capture with iOS/Android permission handling
- **Backend**: Express.js (`artifacts/api-server`) — Replit artifact at paths `/api` + `/api-server`, port 8080
- **AI / STT**: ElevenLabs `scribe_v1` (speech-to-text), ElevenLabs `v1/voices/add` (voice cloning)
- **LLM**: Google Gemini `gemini-3.1-pro-preview` via `@google/genai`
- **Data flow**: Mobile app → `https://{REPLIT_DEV_DOMAIN}/api-server/api/*` → Express routes → real AI APIs → response

---

## Files

### `contexts/LanguageContext.tsx`
Central language management context. Supports 6 languages (ENG, POL, SPA, GER, FRA, ITA) with full translation dictionaries.

**Iteration 2 additions — 3 new keys per language (18 new strings total):**
- `processingVoice` — "Processing voice profile..." (shown during API pipeline)
- `micPermissionTitle` — Alert title for microphone permission denied
- `micPermissionDenied` — Alert body explaining how to enable mic in Settings

---

### `app/index.tsx` — Home Screen
No changes in Iteration 2.

---

### `app/onboarding.tsx` — Interview Flow Screen (REWRITTEN Iteration 2)
**Real Audio Recording via `expo-av`:**
- `handleRecordStart` — calls `Audio.requestPermissionsAsync()` before starting. If denied, shows an `Alert` with `t.micPermissionTitle` / `t.micPermissionDenied`. On grant, calls `Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true })` then `Audio.Recording.createAsync(HIGH_QUALITY)`.
- `handleRecordEnd` — stops and unloads the recording, reads the URI via `getURI()`, resets `allowsRecordingIOS: false`, stores the URI into `recordedUris` state array at the current question index.
- `recordedUris: string[]` — array of local file URIs, one per question, grown as the user progresses.
- `recordingRef: MutableRefObject<Audio.Recording | null>` — holds the live Recording instance.

**Processing Pipeline:**
- After the 6th question's "Begin Experiment" is pressed, `runProcessingPipeline(recordedUris)` is called.
- Sets `isProcessing: true` — renders a full-screen `ActivityIndicator` + `t.processingVoice` text instead of the question UI (`testID="processing-view"`).
- Calls the three API stubs **sequentially**: `transcribeAudio` → `generatePersona` → `cloneVoice`.
- On success, navigates to `/simulation`. On error, resets `isProcessing` so the user can retry.

---

### `app/simulation.tsx` — Simulation Screen
No changes in Iteration 2.

---

### `utils/apiClient.ts` — API Client (UPDATED Iteration 3)
Three functions now make real `fetch` calls to the Express backend instead of using mock delays. No API keys are present — all external service calls are server-side only.

| Function | HTTP Call | Returns |
|---|---|---|
| `transcribeAudio(localUris)` | `POST /api/transcribe` (multipart/form-data) | `transcription: string` |
| `generatePersona(transcription)` | `POST /api/generate-persona` (JSON) | persona object |
| `cloneVoice(localUris)` | `POST /api/clone-voice` (multipart/form-data) | `voice_id: string` |

**Base URL**: `https://${process.env.EXPO_PUBLIC_DOMAIN}` — resolved from the `EXPO_PUBLIC_DOMAIN` env var injected by the mobile dev script.

**File uploads**: Audio files are sent as `FormData` entries using the React Native standard pattern `{ uri, type, name }` — compatible with Expo Go without additional packages.

---

### `artifacts/api-server/src/routes/voicinne/` — New Route Files (Iteration 3)

Three new Express route files added to the API server, each imported into `src/routes/index.ts`:

**`transcribe.ts`** — `POST /api/transcribe`
- Accepts `multipart/form-data` with `audio` file fields (via `multer` memory storage)
- Logs file count and field names
- Returns: `{ transcription: string }` (mock)

**`generate-persona.ts`** — `POST /api/generate-persona`
- Accepts JSON body `{ transcription: string }`
- Logs transcription length
- Returns: `{ mock: true, persona: { tone, relationship, vocabulary, emotionalTriggers, systemInstruction } }`

**`clone-voice.ts`** — `POST /api/clone-voice`
- Accepts `multipart/form-data` with `audio` file fields
- Logs file count
- Returns: `{ voice_id: "mock_123" }`

---

### `constants/colors.ts` — Design Tokens
Unchanged from Iteration 1.

### `app.json` — Updated Iteration 2
- Added `ios.infoPlist.NSMicrophoneUsageDescription` — required for App Store mic permission.
- Added `android.permissions: ["android.permission.RECORD_AUDIO"]` — required for Android recording.

### `app/_layout.tsx`
Unchanged from Iteration 1.

---

## Dependencies

| Package | Version | Added |
|---|---|---|
| `expo-av` | (resolved by Expo SDK 54) | Iteration 2 |
| `multer` | ^2.x | Iteration 3 (api-server) |
| `@types/multer` | ^2.x | Iteration 3 (api-server, devDep) |
| `axios` | ^1.x | Iteration 4 (api-server) |
| `form-data` | ^4.x | Iteration 4 (api-server) |
| `@types/form-data` | ^2.x | Iteration 4 (api-server, devDep) |
| `@google/genai` | ^1.x | Iteration 4 (api-server) |

---

## TypeScript
✅ 0 errors across all files (both `@workspace/api-server` and `@workspace/mobile`)

---

## Smoke Testing the Backend (Iteration 3)

You can verify the backend is receiving requests by running these curl commands from any terminal. Replace `{DOMAIN}` with your Replit dev domain (visible in the preview URL or in the API server workflow logs as `REPLIT_DEV_DOMAIN`).

**1. Health check (sanity test):**
```bash
curl https://{DOMAIN}/api/healthz
# Expected: {"status":"ok"}
```

**2. Generate Persona — via `/api-server` prefix (the path the mobile app uses):**
```bash
curl -X POST https://{DOMAIN}/api-server/api/generate-persona \
  -H "Content-Type: application/json" \
  -d '{"transcription":"She calls me her little star."}'
# Expected: {"mock":true,"persona":{"tone":"warm",...}}
```

**3. Clone Voice — via `/api-server` prefix:**
```bash
curl -X POST https://{DOMAIN}/api-server/api/clone-voice -F "dummy=test"
# Expected: {"voice_id":"mock_123"}
```

**4. Transcribe — via `/api-server` prefix:**
```bash
curl -X POST https://{DOMAIN}/api-server/api/transcribe -F "dummy=test"
# Expected: {"transcription":"[MOCK] The speaker described..."}
```

> **Note:** The API server handles both `/api/*` (legacy/health-check) and `/api-server/api/*` (used by the mobile client). The Replit proxy routes both `/api` and `/api-server` path prefixes to port 8080.

**Checking server logs:** In the Replit workspace, look at the "API Server" workflow console. Each request logs: `[voicinne] POST /api/<route> received` with file count / transcription length.

**From the mobile app:** Run through the full onboarding flow (6 questions → "Begin Experiment"). The processing screen will appear while the three requests fire sequentially. On success, the simulation screen loads. Check the API Server workflow console to see the three log lines arrive in sequence.

---

## What Is NOT Implemented (Deferred to Future Iterations)

- Simulation Screen v2: using the real `voice_id` to synthesise and play the "deepfake call" audio via ElevenLabs TTS
- Safety word establishment flow (post-reveal, guided passcode creation)
- Multer file-size / file-count limits on upload routes (pre-production hardening)
- `expo/fetch` + `File` typed upload abstraction (currently uses RN FormData `{ uri, type, name }`)
- User authentication / profiles
- Persistence of recorded answers or persona data

---

## Next Steps (Iteration 5+)

1. **Simulation Screen v2** — Use the `voice_id` returned by `/api/clone-voice` to make an ElevenLabs TTS call, play the resulting audio as the simulated "deepfake phone call"
2. **Safety Word Flow** — Post-reveal, guide both parties to establish and store a family passcode
3. **Upload hardening** — Add multer limits and payload validation before real production traffic
4. **Typed upload abstraction** — Replace RN FormData object with `expo/fetch` + `File` for stream-safe uploads
