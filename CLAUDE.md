# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install        # install dependencies
npm run dev        # dev server at http://localhost:3000
npm run build      # production build
npm run preview    # preview production build
npm run lint       # TypeScript type-check (no emit)
npm run clean      # remove dist/
```

## Environment

Copy `.env.example` to `.env.local` and set `GEMINI_API_KEY`. Vite exposes it to the client via `process.env.GEMINI_API_KEY` (see `vite.config.ts`). AI Studio injects it automatically at runtime from its Secrets panel.

## Architecture

This is a single-page React 19 + Vite 6 landing page for **Charles.AI** — an AI appointment-setter product targeting the Quebec B2B market.

**All application code lives in `src/App.tsx`** — there is no routing, no state management library, and no API calls. The entire page is one default-export component with inline hardcoded data (`performanceData` array for the chart).

**Sections in render order:**
1. **Nav** — fixed, links to `#performance`, `#voice`, `#intel`
2. **Hero** — animated headline + a UI mockup card showing "DURUM_INTEL_HANDSHAKE" data and a PitchLab waveform visualizer
3. **Voice** (`#voice`) — PitchLab voice feature highlights
4. **Performance** (`#performance`) — AreaChart (recharts) comparing Charles vs humans over 6 weeks
5. **Intelligence** (`#intel`) — Durum.ai integration features + a mock API panel
6. **CTA** — "Apply for Private Beta" / "Download One-Pager" buttons (not wired up)
7. **Footer**

**Styling:** Tailwind CSS v4 via `@tailwindcss/vite` plugin. Theme tokens are defined in `src/index.css` using the `@theme` block — not in a `tailwind.config.js`. Custom tokens: `--color-brand-orange: #FF4E00`, `--color-brand-blue: #3B28CC`. Use `bg-brand-orange`, `text-brand-orange`, etc. in JSX.

**Animations:** `motion/react` (Motion v12) — used for entrance animations (`initial`/`animate`) and `whileInView` scroll triggers.

**Charts:** `recharts` v3 — `AreaChart` with `ResponsiveContainer`. Chart data is hardcoded at the top of `App.tsx`.

## Product Context

Charles.AI is marketed as an AI phone setter (outbound appointment booking) powered by two named subsystems:
- **Durum Intelligence** (`Durum.ai`) — CRM/lead-data layer that reads past interactions, notes, and propensity scores before each call
- **PitchLab Voice** — voice synthesis layer tuned for Quebec FR-CA / bilingual phonetics

The product is pre-launch (waitlist / private beta). All CTAs are visual-only — no form submissions or API integrations are implemented.
