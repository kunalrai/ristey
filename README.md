# Ristey — The Heritage Curator

> Curated matchmaking rooted in cultural heritage and family values.

Ristey is a Progressive Web App (PWA) for South Asian matchmaking. It uses a weighted compatibility scoring algorithm to connect users based on their values, lifestyle, and preferences — built with a modern serverless stack and an elegant heritage aesthetic.

---

## Features

- **Weighted Compatibility Scoring** — Cosine-similarity algorithm scores matches directionally (A→B and B→A) based on per-question weights set by each user. Mutual score is the harmonic mean of both directions.
- **Swipeable Match Feed** — Card-stack UI with swipe gestures for match discovery, showing compatibility percentages and profile highlights.
- **Real-Time Messaging** — Full in-app chat with unread counts and live message sync via Convex subscriptions.
- **AI Persona System** — Seed/test profiles respond to messages authentically using Google Gemini 2.0 Flash (via OpenRouter), simulating real conversations with realistic delays.
- **Onboarding & Preferences** — Multi-step onboarding collects profile answers; a separate preferences flow lets users weight each dimension (diet, religion, location, career, etc.).
- **Admin Dashboard** — Protected admin panel to manage questions (add/edit/delete), view user stats, and configure the AI API key.
- **Membership Tiers** — Free, Curator, Heritage, and Concierge tiers with expiry tracking.
- **Photo Crop & Rotate** — In-app avatar upload with crop and rotation support.
- **PWA** — Installable on mobile and desktop, offline-capable with service worker caching.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Routing | React Router v6 |
| Backend & DB | [Convex](https://convex.dev) (serverless functions + real-time database) |
| Auth | [Clerk](https://clerk.com) (SSO, JWT) |
| AI | OpenRouter → Google Gemini 2.0 Flash |
| PWA | vite-plugin-pwa, Workbox |
| Image | react-easy-crop, sharp |
| Testing | Playwright (E2E) |

---

## Project Structure

```
ristey/
├── src/
│   ├── pages/
│   │   ├── LandingPage.tsx        # Unauthenticated landing
│   │   ├── OnboardingPage.tsx     # Profile setup (gender + questions)
│   │   ├── PreferencesPage.tsx    # Preference weights
│   │   ├── FeedPage.tsx           # Swipe match feed
│   │   ├── MatchDetailPage.tsx    # Single match breakdown
│   │   ├── MatchesPage.tsx        # All matches list
│   │   ├── ProfilePage.tsx        # User profile editing
│   │   ├── MessagesPage.tsx       # Conversation list
│   │   ├── ChatPage.tsx           # Real-time chat
│   │   ├── MembershipPage.tsx     # Tier info
│   │   └── AdminPage.tsx          # Admin dashboard
│   ├── components/layout/
│   │   ├── AppShell.tsx           # Layout wrapper
│   │   └── BottomNav.tsx          # Mobile navigation
│   └── App.tsx                    # Router & auth guards
├── convex/
│   ├── schema.ts                  # Database schema
│   ├── users.ts                   # User CRUD
│   ├── profiles.ts                # Profile answer storage
│   ├── preferences.ts             # Preference weights
│   ├── questions.ts               # Question bank + admin mutations
│   ├── matching.ts                # Scoring algorithm
│   ├── matches.ts                 # Feed & match queries
│   ├── chat.ts                    # Messaging
│   ├── ai.ts                      # AI persona responses
│   ├── admin.ts                   # Admin-only operations
│   ├── auth.config.ts             # Clerk JWT config
│   └── seed.ts                    # Test data
├── e2e/                           # Playwright tests
└── public/                        # Icons, manifest, offline page
```

---

## Matching Algorithm

Each user sets a **weight (1–10)** per question dimension. When computing a match score from user A's perspective:

1. For each question, compute similarity using the configured strategy:
   - `exact_match` / `boolean_match`: 1 if answers match, else 0
   - `overlap` (multi-select): cosine similarity on multi-hot vectors
2. Weight each similarity by A's preference weight for that question
3. Compute the weighted cosine score × 100
4. Repeat from B's perspective
5. **Mutual score** = harmonic mean of A→B and B→A scores

Scores are pre-computed and stored in the `matchScores` table. Only opposite-gender candidates are shown.

---

## AI Persona System

Seed profiles respond to incoming messages via AI:

- **Model:** Google Gemini 2.0 Flash via OpenRouter
- **Persona context:** Profile answers, name, and recent conversation history are injected into the system prompt
- **Delay:** Random 2–7 second delay before responding to feel natural
- **Key storage:** OpenRouter API key is stored in the `settings` table and manageable from the Admin UI

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Convex](https://dashboard.convex.dev) project
- A [Clerk](https://dashboard.clerk.com) application
- An [OpenRouter](https://openrouter.ai/keys) API key (for AI personas)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create `.env.local`:

```env
VITE_CONVEX_URL=https://<your-deployment>.convex.cloud
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
```

In your Convex dashboard, set:

```
CLERK_JWT_ISSUER_DOMAIN=https://<your-clerk-domain>.clerk.accounts.dev
```

### 3. Run locally

```bash
# Terminal 1 — Convex backend
npx convex dev

# Terminal 2 — Vite frontend
npm run dev
```

### 4. Seed questions

On first run, navigate to the app — questions are seeded automatically on the first call to `seedQuestions`. Alternatively, trigger it from the Convex dashboard.

---

## Scripts

```bash
npm run dev          # Start Vite dev server
npm run build        # TypeScript check + production build
npm run preview      # Preview production bundle
npm run test:e2e     # Run Playwright E2E tests
npm run test:ui      # Playwright UI mode
npx convex deploy    # Deploy Convex backend to production
```

---

## Admin Access

The admin dashboard (`/admin`) is restricted to `ikunalrai@gmail.com`. From the admin panel you can:

- View platform stats (users, matches, success rate)
- **Add, edit, or delete** profile/preference questions
- Manage user accounts
- Set the OpenRouter API key for AI personas

---

## Design

- **Primary:** Crimson `#800020`
- **Accent:** Gold `#C5A059`
- **Background:** Stone `#F5F0E6`
- **Typography:** Noto Serif / Georgia for headers, Inter for body
- **Logo:** Crown monogram — *The Heritage Curator*

---

## License

Private — all rights reserved.
