# Voicinne

### Built with Replit Agent — a vibecoding case study

> An educational deepfake awareness app that clones your voice in 60 seconds and uses it to call a family member — to teach them that AI scams are real.

---

### Built with Antigravity as a companion (a word from Gemini)
- **Dual-Agent Architecture:** While Replit deployed the infrastructure, a specialized AI Agent ("Antigravity") acted as the CTO, parsing ElevenLabs JSON diffs and strictly enforcing prompt safety, linguistic boundaries, and API integrations.


## What is Voicinne?

Voicinne is a dual-platform app (Expo mobile + React web) that guides a user through a live psychological experiment. Here is the full arc:

1. **Record** — The user narrates a 60-second roleplay out loud: they set the scene ("I'm calling my grandmother who has her birthday this weekend") and immediately act out the conversation.
2. **Clone** — The recording is sent to ElevenLabs Instant Voice Clone, which produces a voice model indistinguishable from the user's own voice.
3. **Analyse** — The transcription is sent to Gemini 2.5 Flash, which extracts tone, relationship context, vocabulary, and language — then generates a fully localized system prompt for the AI agent.
4. **Call** — An ElevenLabs ConvAI agent, speaking in the cloned voice, initiates a conversation with the nearby relative for approximately four turns.
5. **Reveal** — The agent self-terminates (via the `end_call` tool) and the app shows an educational screen: deepfake statistics, risk scenarios, and a prompt to agree on a family safe word.

The entire experience runs in **six languages**: English, Polish, Spanish, German, French, and Italian — auto-detected from the recording.

---

## Tech Stack

### Mobile App — `artifacts/mobile`

- **Expo** (React Native) with file-based routing via Expo Router
- **`@elevenlabs/react-native`** for real-time voice conversations
- Forced dark mode; Stack-only navigation
- Custom `LanguageContext` for 6-language i18n, shared across all screens
- Animated scam ticker on the home screen (fade + slide, touch-to-pause)
- Live waveform visualization using Web Audio API on web, `expo-av` metering on native

### Web App — `artifacts/voicinne-web`

- **React + Vite** (TypeScript)
- **`@elevenlabs/react`** for voice conversations — same AI pipeline as mobile
- Responsive layout: phone mockup shell on landscape screens, full-width content on portrait (via `window.matchMedia` with a live `change` listener)
- Same 6-language context, same design tokens

### API Server — `artifacts/api-server`

- **Express 5 + TypeScript**, bundled with esbuild
- **Pino** structured JSON logging throughout
- Five routes powering the full AI pipeline:

| Route | Purpose |
|---|---|
| `POST /api/transcribe` | ElevenLabs speech-to-text on the audio recording |
| `POST /api/generate-persona` | Gemini 2.5 Flash → structured persona JSON |
| `POST /api/clone-voice` | ElevenLabs Instant Voice Clone → `voice_id` |
| `POST /api/create-agent` | ElevenLabs ConvAI agent creation with cloned voice + custom prompt |
| `GET /api/get-conversation-token` | ElevenLabs signed auth token for private agents |

### AI Pipeline in Detail

```
User recording (60s WAV)
    │
    ├─► ElevenLabs STT ──────────────► Transcription text
    │                                          │
    ├─► ElevenLabs Voice Clone ──────► voice_id
    │                                          │
    └─► Gemini 2.5 Flash ◄───────────┘
            │  (transcription + duration + voice_id)
            │
            ▼
    Persona JSON:
      tone, relationship, vocabulary,
      languageCode, first_message,
      systemInstruction (roleplay prompt),
      reveal_message
            │
            ▼
    ElevenLabs ConvAI Agent
      model_id:   eleven_flash_v2_5
      llm:        gemini-2.5-flash
      voice_id:   (cloned)
      ignore_default_personality: true
      tools:      [end_call]
      similarity_boost: 1.0
      stability:  0.2
```

### Infrastructure

- **pnpm monorepo** — `pnpm-workspace.yaml` with supply-chain attack defense (`minimumReleaseAge: 1440`)
- **Replit Agent** as the sole developer throughout the entire session
- **Replit Secrets** for `ELEVENLABS_API_KEY` and `GEMINI_API_KEY`

---

## The Vibecoding Journey

This app was built entirely through conversation with Replit Agent. No manual code editing. Every component, API route, language translation, design decision, and debugging session happened through natural language prompts.

Here is the actual session arc — in roughly the order things happened.

---

### 1. The Initial Concept

The opening prompt established the full product vision in one message:

> *"Build 'Voicinne' — an educational deepfake awareness Expo mobile app + web app. Users record a 60-second narrated roleplay; their voice is cloned via ElevenLabs; a ConvAI agent impersonates them to a relative for ~4 turns before self-revealing as AI, then shows an educational reveal screen. 6-language support, forced dark-mode, Stack-only navigation, full AI pipeline."*

This single prompt set the architecture: two artifacts (mobile + web), one API server, three AI services.

---

### 2. Locking Down the Design Language

Rather than letting the agent guess colors and styles, the design system was specified as a constraint:

> *"Red #ef4444 accent, background #0a0a0a, cards #141414. VOICINNE wordmark top-left. Never use theme tokens — hardcode the color constants at the top of each screen."*

This "hardcode colors, never theme tokens" constraint prevented design drift as the agent worked across multiple files across multiple sessions.

---

### 3. Warning Cards — One Prompt, Four Screens

A consistent warning component was specified once and applied everywhere:

> *"Add a warning card: amber left-stripe 4px, triangle SVG ⚠ icon, IMPORTANT bold header 11px 1.2 letterSpacing, body text #9ca3af 12px/18px. Apply to all 4 screens — mobile home, mobile simulation, web home, web simulation."*

Outcome: identical amber warning cards with the educational disclaimer on every screen, in all six languages.

---

### 4. Standardising Disclaimer Text Across Six Languages

Once the warning card pattern was locked in, the disclaimer copy inside it needed to match exactly across every language:

> *"Standardize disclaimer text across all 6 languages: 'Educational Purpose Only: This app uses advanced Voice AI to teach cybersecurity. Audio recordings can be stored securely for educational and security audit purposes.'"*

The agent updated `consentText` and `aiDisclaimer` in all six language dictionaries (both mobile and web `LanguageContext` files) in a single pass, using the English source as the canonical reference.

---

### 5. Synchronising Content Across Platforms

When the reveal screen body text drifted between mobile and web (the web was showing Gemini's AI-generated persona message instead of the fixed educational text), the fix prompt used the working surface as the reference:

> *"The text at the reveal page of the web version should be exactly the same as on mobile — pre-set, not generated with Gemini. It should be: 'The voice you just heard was generated in real-time by an AI that cloned a voice from just 60 seconds of audio...' Fix it in all 6 languages."*

This also caught that the non-English translations in the web language file were truncated to a single sentence, missing the second paragraph. All five languages were completed to match mobile exactly.

---

### 6. Responsive Layout

> *"On vertical screens I want to show the web app without the phone mockup, the phone mockup just on horizontal screens."*

The agent implemented a `useIsLandscape()` hook using `window.matchMedia('(orientation: landscape)')` with a live event listener, so rotating a device or resizing a browser window switches the layout in real time — portrait gets full-width, landscape gets the 390×844px phone shell.

---

### 7. TTS Upgrade

> *"Upgrade the voice generation engine to the much lower latency 'Flash v2.5' model. Switch model_id to eleven_flash_v2_5, disable expressive_mode, set similarity_boost to 1.0, speed to 1.0."*

The `create-agent.ts` TTS block was updated from `eleven_v3_conversational` to `eleven_flash_v2_5`, with `similarity_boost` raised to 1.0 (maximum clone fidelity) and `expressive_mode` disabled (Flash model does not support it).

---

### 8. Stripping ElevenLabs' Default Personality

> *"Add `ignore_default_personality: true` inside `conversation_config.agent.prompt` — ElevenLabs injects a generic helpful AI persona that dilutes our custom deepfake character."*

Without this flag, ElevenLabs prepends a "helpful AI assistant" system prompt to every agent, which bleeds through during calls and breaks the immersive roleplay.

---

## The Hardest Bug — Web Voice Connection

This was the longest debugging arc in the session, taking three distinct attempts.

### Attempt 1: WebSocket with a constructed signed URL

The first approach had the API server call ElevenLabs' `/v1/convai/conversation/token` endpoint, then construct `wss://api.elevenlabs.io/v1/convai/conversation?jwt=TOKEN` from the returned value.

**Error:** *"Connection closed unexpectedly before session could be established."*

### Root Cause Investigation

Structured logging was added to the API server to print exactly what ElevenLabs returned:

```
hasToken: true
hasSignedUrl: false
```

ElevenLabs only returns a **LiveKit JWT** (`token`), not a WebSocket signed URL. The constructed WebSocket URL was using a LiveKit JWT as a WebSocket JWT — a completely different token type. The ElevenLabs WebSocket server rejected it immediately.

### Attempt 2: WebRTC via LiveKit (`conversationToken`)

The SDK was switched to pass the `conversationToken` directly, letting it use WebRTC natively via LiveKit.

**Error:** *"could not establish pc connection"*. Browser console showed: `"v1 RTC path not found"` — Replit's proxy environment blocks the UDP traffic that WebRTC requires for peer connections.

### The Actual Fix

Reading the `create-agent.ts` payload revealed that agents were created with `enable_auth: false` — they are **public agents** that accept unauthenticated WebSocket connections. The mobile app had been using exactly this all along: `agentId + connectionType: 'websocket'`, no token at all.

The web simulation was changed to match mobile exactly. Connection succeeded.

**Lesson:** When debugging an external API integration, log what the service actually returns rather than assuming. And read your own configuration — the answer was in `create-agent.ts` from the beginning.

---

## Prompt Engineering Patterns

Several patterns emerged from the session that consistently produced good outcomes:

**Exact color constants in every prompt.** Specifying `#ef4444`, `#0a0a0a`, `#141414` as literals in design prompts — never "dark red" or "charcoal" — prevented the agent from substituting slightly different values in different files.

**Using one working surface as the reference.** "Make the web version exactly the same as mobile" is faster than re-specifying the target state from scratch, and it catches regressions on the reference surface too.

**Constraint-first prompts.** Leading with `never`, `always`, and `must` to establish hard rules before describing desired behaviour. This prevents the agent from making plausible but wrong autonomous decisions.

**Debug by logging first.** Rather than guessing at an API integration problem, prompting the agent to add structured logging and observe the actual response before trying a fix. This cut the web connection debugging from a guessing game to a two-step process.

**Incremental config tuning.** Instead of specifying all TTS parameters in a single vague prompt, each named parameter was changed explicitly: model ID first, then `expressive_mode`, then `similarity_boost`, then `ignore_default_personality`. Each change was targeted and verifiable.

---

## Running the Project

```bash
# Install all workspace dependencies
pnpm install

# Start the API server
pnpm --filter @workspace/api-server run dev

# Start the mobile app (Expo)
pnpm --filter @workspace/mobile run dev

# Start the web app
pnpm --filter @workspace/voicinne-web run dev
```

**Required secrets** (set in Replit Secrets — never in code):
- `ELEVENLABS_API_KEY` — for voice cloning, STT, agent creation, and conversation tokens
- `GEMINI_API_KEY` — for persona generation via Gemini 2.5 Flash

---

## Project Structure

```
voicinne/
├── artifacts/
│   ├── api-server/               # Express API + full AI pipeline
│   │   └── src/routes/voicinne/
│   │       ├── transcribe.ts
│   │       ├── generate-persona.ts
│   │       ├── clone-voice.ts
│   │       ├── create-agent.ts
│   │       └── get-conversation-token.ts
│   ├── mobile/                   # Expo React Native app
│   │   ├── app/
│   │   │   ├── index.tsx         # Home screen
│   │   │   ├── onboarding.tsx    # Recording + processing
│   │   │   └── simulation.tsx    # Live call + reveal
│   │   └── contexts/
│   │       └── LanguageContext.tsx
│   └── voicinne-web/             # React + Vite web app
│       └── src/
│           ├── App.tsx
│           ├── components/
│           │   └── PhoneFrame.tsx
│           ├── contexts/
│           │   └── LanguageContext.tsx
│           └── pages/
│               ├── HomeScreen.tsx
│               ├── OnboardingScreen.tsx
│               └── SimulationScreen.tsx
├── lib/                          # Shared utilities
├── pnpm-workspace.yaml
└── README.md
```

---

> Built entirely through conversation with Replit Agent — no manual IDE editing. Every component, API route, language translation, design decision, and debugging session happened via natural language prompts.
