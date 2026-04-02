# Voicinne — Current State (Iteration 2)

## What Was Built

### Iteration 1 — UI Scaffold
Established the complete UI scaffold for **Voicinne**, an educational deep fake awareness mobile app built with Expo + Expo Router.

### Iteration 2 — Audio Recording + API Stubs
Added real microphone recording via `expo-av`, a typed API client stub layer, and a processing pipeline screen on onboarding completion.

---

## Architecture

- **Framework**: React Native with Expo SDK (Expo Router for navigation)
- **Language**: TypeScript
- **Styling**: Vanilla React Native StyleSheet (no Tailwind)
- **State**: Context API (`LanguageContext`) + local `useState`/`useRef` hooks
- **Navigation**: Stack-based (no tabs) — `index → onboarding → simulation`
- **Theme**: Dark mode (`userInterfaceStyle: "dark"`), high-contrast cyan/charcoal palette
- **Audio**: `expo-av` — real microphone capture with iOS/Android permission handling

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

### `utils/apiClient.ts` — API Client Stubs (NEW Iteration 2)
Three async stub functions simulating the planned backend API calls. Each introduces a ~1.2s mock delay.

| Function | Signature | Returns |
|---|---|---|
| `transcribeAudio` | `(localUris: string[]) => Promise<string>` | Mock transcription text |
| `generatePersona` | `(transcription: string) => Promise<Record<string, unknown>>` | Mock persona JSON |
| `cloneVoice` | `(localUris: string[]) => Promise<string>` | Fake `voice_id` string |

**Architecture Note** (documented in file): In production, API keys (ElevenLabs, Gemini) live exclusively server-side. This client calls our own backend endpoints only — never third-party APIs directly.

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

---

## TypeScript
✅ 0 errors across all files (`pnpm exec tsc --noEmit`)

---

## What Is NOT Implemented (Deferred to Future Iterations)

- ElevenLabs voice cloning (real API call)
- Gemini AI agent setup and call flow
- Replit Serverless Backend (Express/Hono) — stub functions simulate its response
- Safety word establishment logic
- User authentication / profiles
- Persistence of recorded answers or persona data

---

## Next Steps (Iteration 3+)

1. **Replit Backend** — Build the Express/Hono API server with ElevenLabs + Gemini server-side integration
2. **Real `transcribeAudio`** — POST audio files to backend → Whisper / Google STT
3. **Real `generatePersona`** — POST transcription to backend → Gemini agent returns persona JSON
4. **Real `cloneVoice`** — POST audio URIs to backend → ElevenLabs voice clone returns `voice_id`
5. **Simulation Screen v2** — Play AI-generated audio using the cloned `voice_id`
6. **Safety Word Flow** — Post-reveal, guide both parties to establish and store a safety word
