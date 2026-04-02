# Voicinne — Current State (Iteration 1)

## What Was Built

Iteration 1 establishes the complete UI scaffold for **Voicinne**, an educational deep fake awareness mobile app built with Expo + Expo Router.

---

## Architecture

- **Framework**: React Native with Expo SDK (Expo Router for navigation)
- **Language**: TypeScript
- **Styling**: Vanilla React Native StyleSheet (no Tailwind)
- **State**: Context API (`LanguageContext`)
- **Navigation**: Stack-based (no tabs) — `index → onboarding → simulation`
- **Theme**: Dark mode (`userInterfaceStyle: "dark"`), high-contrast cyan/charcoal palette

---

## Files Created

### `contexts/LanguageContext.tsx`
Central language management context. Supports 6 languages with full translation dictionaries:

| Code | Language |
|------|----------|
| ENG | English |
| POL | Polski |
| SPA | Español |
| GER | Deutsch |
| FRA | Français |
| ITA | Italiano |

**Translated keys per language:**
- `appTitle` — "Voicinne"
- `appSubtitle` — Deep fake awareness tagline
- `startButton` — "Start Experiment"
- `question1–6` — 6 interview questions:
  - "How does she call you?"
  - "What does she mean to you?"
  - "How do you call her?"
  - "What will she ask?"
  - "What will you answer?"
  - "What can you ask her?"
- Additional UI strings (recording, next, timer labels, reveal text, safe word prompt)

**Exports**: `LanguageProvider`, `useLanguage()`, `LANGUAGE_LABELS`, `QUESTIONS_KEYS`, `Language` type

---

### `app/index.tsx` — Home Screen
- **Design**: Full dark-mode, high-contrast, accessible for older adults
- **Elements**:
  - Voicinne title with microphone icon ring
  - App subtitle
  - Massive "Start Experiment" button (CTA) — navigates to `/onboarding`
  - Language selector button — opens bottom sheet modal with all 6 language options
  - Warning disclaimer box at bottom
- **Accessibility**: Font sizes 17–48pt, strong contrast, large tap targets

---

### `app/onboarding.tsx` — Interview Flow Screen
- **Flow**: Shows one question at a time, cycles through all 6
- **Elements**:
  - Back button + progress indicator (dots, animated active state)
  - Question counter (X / 6)
  - Large question text (32pt bold)
  - Animated "Hold to Record" button (press-and-hold mockup — no real audio)
    - Pulses while recording
    - Turns red during active recording state
    - Shows "Recorded" badge after release
  - "Next" button appears only after recording (mockup)
  - Last question's "Next" becomes "Begin Experiment" → navigates to `/simulation`

---

### `app/simulation.tsx` — Simulation Screen
- **Elements**:
  - 3-minute countdown timer (large, pulsing ring)
    - Timer turns red when under 20% time remaining
  - Progress bar showing elapsed time
  - Info box explaining the simulation
  - Prominent red "Reveal Experiment" button
- **On Reveal**:
  - Timer stops
  - Screen transitions to full-screen reveal view (dark, high-contrast)
  - Shows: "Deep Fake Revealed" title + educational message + safety word prompt
  - "Back to Home" button
- **Auto-reveal**: Timer auto-triggers reveal when it hits 0:00

---

### `constants/colors.ts` — Design Tokens
Full dark + light palette:
- **Background**: `#0a0a0a` (dark), `#f5f5f5` (light)
- **Primary**: `#00b4d8` (cyan/teal)
- **Foreground**: `#f0f0f0` (dark), `#0a0a0a` (light)
- **Card**: `#141414` (dark), `#ffffff` (light)
- **Destructive**: `#ef4444` (red — used for recording + reveal)

---

### `app/_layout.tsx` — Updated
- Removed tab navigation
- Added `LanguageProvider` wrapping the Stack
- Stack screens: `index`, `onboarding`, `simulation` (all `headerShown: false`)

### `app.json` — Updated
- `userInterfaceStyle: "dark"` — forced dark mode
- Splash background: `#0a0a0a`
- Custom AI-generated app icon

---

## What Is NOT Implemented (Out of Scope for Iteration 1)

- ElevenLabs voice cloning API integration
- Real audio recording (microphone capture)
- Gemini AI agent setup and call flow
- Safety word establishment logic
- Any backend API endpoints or database
- Authentication / user profiles
- Persistence of recorded answers

---

## Next Steps (Iteration 2+)

1. **Voice Recording** — Use `expo-av` to implement real microphone capture during the "Hold to Record" flow
2. **ElevenLabs Integration** — Clone voice from recorded samples via ElevenLabs API
3. **Gemini AI Agent** — Build the AI agent that uses the cloned voice + interview answers to mimic the user
4. **Live Call Simulation** — Simulate a "call" to a relative using the agent
5. **Safety Word Flow** — Post-reveal, guide both parties to establish and store a safety word
