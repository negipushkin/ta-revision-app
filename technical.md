# Technical Documentation — TA Revision App

## Overview

A mobile-first Progressive Web App for Territorial Army exam preparation. It serves 763 questions across multiple modes: standard revision, custom timed tests, and audio (TTS) revision. Progress is stored locally and synced to a cloud database.

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| UI Framework | React | 18.3.1 |
| Build Tool | Vite + @vitejs/plugin-react | 5.4.10 / 4.3.1 |
| Styling | Tailwind CSS | 3.4.14 |
| CSS Pipeline | PostCSS + Autoprefixer | 8.4.47 / 10.4.20 |
| Database | Supabase (PostgreSQL) | JS SDK 2.105.4 |
| Audio | Web Speech API (browser native) | — |
| Storage | localStorage + Supabase | — |

Module format: ES Modules. No TypeScript, no component library (all custom components).

---

## Project Structure

```
ta-revision-app/
├── src/
│   ├── main.jsx                        # React entry point
│   ├── App.jsx                         # Screen router + global state
│   ├── index.css                       # Tailwind base imports
│   ├── supabase.js                     # Supabase client initialization
│   ├── screens/
│   │   ├── HomeScreen.jsx              # Dashboard (stats + action buttons)
│   │   ├── RevisionScreen.jsx          # Core revision / custom-test interface
│   │   ├── SummaryScreen.jsx           # Progress analytics (4 breakdown tabs)
│   │   ├── CustomTestSetupScreen.jsx   # Test configuration form
│   │   ├── AudioRevisionScreen.jsx     # TTS playback + controls
│   │   └── AudioRevisionSetupScreen.jsx
│   ├── components/
│   │   ├── QuestionCard.jsx            # Single question with options + reveal
│   │   ├── QuestionPair.jsx            # Container for 2 QuestionCards
│   │   ├── NavBar.jsx                  # Top bar with progress + jump-to
│   │   ├── FilterSheet.jsx             # Slide-up filter modal
│   │   └── ProgressBar.jsx             # Correct/wrong ratio bar
│   ├── data/
│   │   └── useQuestions.js             # Custom hook: question loading + filtering
│   └── store/
│       └── progressStore.js            # Progress state: localStorage + Supabase sync
├── public/
│   └── questions.json                  # Static question bank (763 questions)
├── index.html
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

---

## Data Model

### Question (from `public/questions.json`)

```js
{
  id: 1,                          // integer, 1-indexed
  question: "...",
  options: { A: "...", B: "...", C: "...", D: "..." },
  answer: "B",                    // correct option letter
  explanation: "...",
  category: "Defence Current Affairs",
  subtopic: "Theatre Commands",
  super_category: "Current Affairs",
  difficulty: "Moderate",         // "Easy" | "Moderate" | "Hard"
  priority: "High",               // "High" | "Medium" | "Low"
  pattern_type: "...",
  revision_weight: 5,
  ta_repeat_probability: "High",
  question_nature: "Dynamic"
}
```

### Progress (localStorage key: `ta_progress`)

```js
{
  "1": { attempted: true, correct: true, selectedOption: "B" },
  "2": { attempted: true, correct: false, selectedOption: "A" }
}
```

### Bookmarks (localStorage key: `ta_review`)

```js
[1, 5, 23, 45]   // array of question IDs marked for review
```

### Supabase — `progress` table

| Column | Type | Notes |
|---|---|---|
| id | integer | Always 1 (single shared row) |
| data | jsonb | Full progress map |
| review | jsonb | Array of marked question IDs |
| updated_at | timestamptz | Auto-updated on upsert |

No user authentication. All users share a single row identified by `id = 1`.

---

## State Management

State is split between three layers:

```
App.jsx (screen routing + session state)
  ├── screen: 'home' | 'revision' | 'customTest' | 'audioRevisionSetup' | 'audioRevision' | 'summary'
  ├── reviewIds: Set<number>       — bookmarked question IDs
  ├── testIds: number[]            — custom test question set
  ├── timeLimitSeconds: number | null
  └── audioQuestions: Question[]

useQuestions() hook (data + filtering)
  ├── allQuestions: Question[]     — full bank from questions.json
  ├── filteredQuestions: Question[]
  └── filters: { subtopics, superCategories, difficulty, priority, weakOnly }

progressStore.js (persistence)
  ├── localStorage["ta_progress"]  — authoritative client-side state
  ├── localStorage["ta_review"]    — bookmarks
  └── Supabase                     — cloud backup (eventual consistency)
```

### Answer Flow

1. User selects option → local state in `QuestionCard`
2. User clicks Check → `onAnswer(id, isCorrect, selectedOption)` fires
3. `progressStore.markAnswer()` writes to localStorage
4. `pushToCloud()` upserts to Supabase asynchronously
5. Stats recomputed via `progressStore.getStats()`

---

## Screens & Features

### Home (`HomeScreen.jsx`)
Dashboard showing attempted / correct / bookmarked counts with buttons to enter each mode.

### Revision (`RevisionScreen.jsx`)
Questions displayed in pairs (2 per screen). User picks an option, clicks Check, sees the reveal, then auto-advances after 1 second. Supports:
- Filtering: subtopic, super-category, difficulty, priority, "weak only"
- Jump-to: enter a question number in the NavBar
- Review mode: shows only bookmarked questions
- Custom test mode: shuffled questions and options, optional countdown timer, isolated progress

### Audio Revision (`AudioRevisionScreen.jsx`)
Reads each question aloud using the browser's Web Speech API in sequence:
1. Question text (rate 0.85, lang `en-IN`)
2. Correct answer
3. Explanation
4. 5-second pause, then advances

Controls: Play, Pause/Resume, Prev, Next.

### Summary (`SummaryScreen.jsx`)
Analytics with four tabs: by Topic, by Subtopic, by Difficulty, by Priority. Each row shows `(attempted / total)` with a progress bar. Includes a full reset button with confirmation.

---

## API Integrations

### Supabase

```js
// src/supabase.js
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
```

- **Load:** `SELECT data, review FROM progress WHERE id = 1` on app start
- **Save:** `UPSERT { id: 1, data, review }` after every answer or bookmark change
- Keys are hardcoded (public anon key) — no secrets at risk

### Web Speech API

```js
const u = new SpeechSynthesisUtterance(text)
u.rate = 0.85
u.lang = 'en-IN'
window.speechSynthesis.speak(u)
```

No backend required. Uses the device's installed TTS voices.

---

## Build & Development

```bash
npm run dev      # Vite dev server at http://localhost:5173 with HMR
npm run build    # Production build to dist/
npm run preview  # Serve the production build locally
```

CSS pipeline: Tailwind → PostCSS → Autoprefixer → bundled with JS.

---

## Known Constraints

- **Single shared database row** — no multi-user isolation; intended for single-user use
- **Web Speech API** — behaviour varies by browser/device; may pause when phone screen locks (see fix in `AudioRevisionScreen.jsx`)
- **No offline fallback for cloud sync** — `pushToCloud()` failures are silently swallowed; data is safe in localStorage
- **Static question bank** — adding/updating questions requires rebuilding and redeploying `public/questions.json`
