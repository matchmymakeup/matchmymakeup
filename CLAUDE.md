# Matchmymakeup — Project Context for Claude Code

## What this app does
AI-powered makeup shade matching and beauty advice.
- Scans/uploads images → extracts skin tone colours → matches to 165 products
- 11 multilingual personas deliver culturally-specific beauty advice via Anthropic API
- Stripe subscription for premium features
- Saves scans, products, shades, looks to a 4-tab library

## Tech stack
- React + Vite + Tailwind CSS
- Vercel (deployment + serverless API routes)
- Anthropic API (claude-sonnet) — persona-based advice, multilingual
- Stripe — subscription checkout
- No backend database — client-side state + localStorage

## Project structure
api/
  advice.js        — Anthropic API, 11 personas, multilingual prompts
  create-checkout.js — Stripe subscription
  match.js         — Server-side product matching (165 products)

src/
  App.jsx          — Router, 7 routes
  analytics.js     — Scan tracking
  products.js      — CATEGORIES export (deprecated DB, handle carefully)
  components/
    UploadTab.jsx  — Image upload + colour picker
  pages/
    Home.jsx       — Landing + language selector bottom sheet
    ColorScanner.jsx — Upload/camera/picker + find match
    MatchResults.jsx — Results, advice, share, save, Stripe
    Library.jsx    — 4-tab library (scans/products/shades/looks)
    Profile.jsx    — Beauty DNA profile builder
    Terms.jsx      — Terms & conditions

## Current state
- Multilingual persona advice committed (api/advice.js) — 11 personas,
  native script + English fallback language instructions
- Stale root-level App.jsx and ColorScanner.jsx removed
- products.js is deprecated — do not extend, treat as read-only

## Known issues / watch points
- products.js marked deprecated — product data lives in api/match.js (165 products)
- Language fallback in advice.js — ensure English fallback doesn't bleed into
  user-facing responses, only for compliance/testing
- No backend DB — all persistence is client-side, factor this into any
  feature additions

## Maintenance backlog

### api/advice.js — opportunistic upgrades
Bundle the following changes the next time `api/advice.js` is edited for any reason. None are urgent in isolation; deferring avoids a standalone deploy.

- **Model string:** `claude-sonnet-4-20250514` → `claude-sonnet-4-6-[latest]`
  - Same price, 1M context now GA on Sonnet 4.6
  - Sonnet 4 remains supported at 200K context; no forced deadline
- **API version header:** Review `anthropic-version: 2023-06-01` — currently fine but flagged for revisit on next SDK update
- **Verify after change:** Run a smoke test on at least one persona to confirm response quality is unchanged

Reviewed 26 Apr 2026 — confirmed not affected by 1M context beta retirement (April 30, 2026), as no `anthropic-beta` header is set and request size stays ~1,300 tokens.

## Deployment
- Platform: Vercel
- API routes: /api/* (serverless functions)
- Config: vercel.json, vite.config.js

## Communication defaults
- AUD for money, AEST for times, Australian English spelling
- One command at a time, wait for confirmation before next step
- Flag risks before acting, not after

## Working Style (Champ)
- Worst-case-first risk framing — don't lead with optimistic defaults
- Give options with tradeoffs, not a single recommended answer
- No padding, no hype, no validation-seeking
- Explain what a change does before making it
- Never delete or overwrite working code without flagging it first
- If I go quiet mid-task, don't assume confirmation — ask

## Hard Rules
- API key must never appear client-side — flag immediately if seen
- Do not touch analytics tracking code without flagging — B2B revenue implication
- products.js is read-only — do not extend under any circumstances
- All user-facing strings must remain translatable — no hardcoded English in JSX
- One Supabase migration step at a time when that work begins
- P&L and account figures are private — never log or display in shareable output
