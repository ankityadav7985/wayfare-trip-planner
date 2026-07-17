# Wayfare — a trip planner

Describe a trip in a sentence or two. An AI model turns it into a structured,
day-by-day itinerary that you can expand, reorder, remove stops from, and add
stops to — not a chat transcript, an editable plan.

## Stack

- **Frontend:** React 18 (hooks, functional components) + Vite. Plain CSS,
  no UI framework.
- **Backend:** a small Express server that proxies one route,
  `POST /api/plan-trip`, to whatever AI provider you configure. This keeps
  the API key out of the browser.
- **AI:** any OpenAI-compatible chat completions endpoint — Groq, OpenRouter,
  OpenAI, or a local Ollama instance. Swapping providers is a `.env` change,
  not a code change.

## Setup

Requires Node 18+.

```bash
npm install
cp .env.example .env
```

Open `.env` and set `AI_API_KEY` (and `AI_BASE_URL` / `AI_MODEL` if you're
not using the default Groq config — see the comments in `.env.example` for
OpenAI, OpenRouter, and local-Ollama options).

```bash
npm start
```

This runs the Vite dev server (`http://localhost:5173`) and the Express
backend (`http://localhost:3001`) together, with Vite proxying `/api/*`
requests to the backend. Open `http://localhost:5173`.

## How a request flows

1. User submits a free-form description in `TripForm`.
2. `useTripPlanner` (a `useReducer`-based hook) fires `POST /api/plan-trip`,
   tagging the request with an incrementing id and aborting any in-flight
   previous request.
3. The backend calls the configured AI provider with a system prompt that
   demands a specific JSON shape, and forwards back whatever text comes out
   — it does not try to parse or validate it.
4. The frontend's `parseItinerary` (in `src/utils/parseItinerary.js`) is
   where the real work happens: it strips markdown fences if present,
   extracts the outermost `{...}` if there's stray text around the JSON,
   attempts a trailing-comma repair if `JSON.parse` fails outright, and then
   validates the shape (days array present, each stop has a name, etc.),
   normalizing anything missing or malformed rather than crashing.
5. Only a response that still matches the *latest* request id gets applied
   to state — anything superseded by a newer request is silently dropped, so
   a slow response can never clobber a newer one.
6. If parsing or the request itself fails **and there's no existing
   itinerary on screen**, a full error panel with a "Try again" button is
   shown. If there **is** an existing itinerary (e.g. a regenerate failed),
   it stays on screen with a small inline retry banner instead of being
   wiped out.

## AI-usage note

> **Fill this in honestly for your own submission** — the brief specifically
> asks for this, and you'll be walking through the code live.

This project was built by asking Claude (Anthropic) to write the app end to
end from the assignment brief, in one sitting. Replace this paragraph with
what's actually true for you: which parts you wrote yourself, which parts an
AI assistant scaffolded, what you changed after generation, and which tool
you used. Being specific here counts in your favor; being vague or silent
about heavy AI use is the thing to avoid.

Before you submit this, **read every file until you can explain any line of
it from memory** — the interview includes walking through your code, fixing
a bug someone else introduces, and adding a small feature live. Code you
can't explain will be obvious.

## Known limitations

- No authentication, no persistence — refreshing the page clears the
  itinerary (the footer says so on purpose). "Save and reload sessions" from
  the stretch goals isn't implemented.
- No streaming — the full response is parsed only once the model finishes.
- Reordering is up/down buttons rather than drag-and-drop. This was a
  deliberate choice for reliable mobile support without adding a
  drag-and-drop dependency, not an oversight.
- The retry button re-sends the exact same description; there's no
  refinement loop (follow-up prompts that edit the existing plan instead of
  regenerating it from scratch).
- Only one block type (a day of stops). The stretch goal of mixed block
  types (cards / charts / checklists) isn't implemented.
- Server-side rate limiting isn't implemented — fine for local/personal use,
  not for a public deploy.
- Tested primarily against Groq's Llama 3.1 8B. Other models will vary in
  how often the JSON comes back clean; the parser is the safety net for
  that, but a much weaker model may still fail validation more often.

## What I'd do next

- A refinement loop ("make day 2 less packed") that sends the current
  itinerary back to the model alongside the follow-up instruction, rather
  than regenerating from the original description.
- Streaming the response so the itinerary fills in day-by-day instead of
  appearing all at once.
- Persisting itineraries (`localStorage` is fine for a personal project;
  or a real backend store if this needed to be shared).

## Time spent

> Fill in your actual time here — the brief asks for it directly, and
> "~8 hours, stopped and noted what's left" is a completely normal answer.
