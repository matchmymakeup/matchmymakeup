# Matchmymakeup — Project Context for Claude Code

## What this app does
AI-powered makeup shade matching and beauty advice.
- Scans/uploads images → extracts colours → matches to 295+ products across 80+ brands
- 14 culturally-anchored AI personas deliver beauty advice via Anthropic API across 13 languages
- Stripe subscription ($4.99 Premium, $9.99 Premium+ planned) for premium features
- Saves scans, products, shades, looks to a multi-tab library backed by Supabase

## Tech stack
- React + Vite + Tailwind CSS
- Vercel (deployment + serverless API routes)
- Anthropic API (claude-sonnet) — persona-based advice, multilingual
- Stripe — subscription checkout
- Supabase (Sydney region) — auth, profiles, scans, saved_products, saved_shades, saved_looks, wardrobe_items
- localStorage as anon-pre-auth scratch + Premium trial state (migrating to Supabase in Phase A)
- Vercel Analytics + Speed Insights — production telemetry as of 2026-04-29

## Project structure
api/
  advice.js        — Anthropic API, 11 personas, multilingual prompts
  create-checkout.js — Stripe subscription
  match.js         — Server-side product matching (295+ products, 80+ brands)

src/
  App.jsx          — Router, 12 routes (auth, public, AppLayout-wrapped)
  analytics.js     — Custom event tracker (writes to localStorage; B2B revenue surface per Hard Rule — pending repoint to backend in Phase A)
  products.js      — CATEGORIES export — deprecated (read-only per Hard Rule; product data lives in api/match.js)
  lib/
    auth.jsx       — AuthProvider + useUser hook + sanitizeError helper
    safeRedirect.js — Open-redirect guard for ?redirect= params
    storage.js     — Storage abstraction (Supabase + localStorage); anon→authed migration
    supabase.js    — Supabase client init (anon key, detectSessionInUrl: false)
    trial.js       — Premium trial state (localStorage `mmm_trial_start`)
  components/
    AppLayout.jsx  — Layout route: shared Header + Outlet for authed routes
    Header.jsx     — Persistent nav (Library, Profile, Logout)
    PageBackBar.jsx — Standardised back-nav for sub-pages
    RequireAuth.jsx — Auth-gating wrapper for protected actions
    UploadTab.jsx  — Image upload + colour picker
  pages/
    Home.jsx       — Landing + language selector bottom sheet
    ColorScanner.jsx — Upload/camera/picker + find match
    MatchResults.jsx — Results, advice, share, save, Stripe
    Library.jsx    — Multi-tab library (scans/products/shades/looks)
    Profile.jsx    — Beauty DNA profile builder
    LogIn.jsx      — Magic-link auth
    SignUp.jsx     — Magic-link signup
    AuthCallback.jsx — Post-magic-link redirect handler
    Privacy.jsx    — Privacy policy
    Terms.jsx      — Terms & conditions

supabase/
  migrations/
    0001_initial_schema.sql       — profiles, scans, saved_products, saved_shades, saved_looks
    0002_add_wardrobe_and_tier.sql — wardrobe_items + subscription_tier on profiles
    0003_saved_shades_unique.sql  — saved_shades UNIQUE NULLS NOT DISTINCT (user_id, name, hex) + dedup

## Current state (post-Phase 2, pre-beta)
- Phase 2 fully merged to main as of 2026-04-29 (Step 8, commit 2f33d40)
- Storage abstraction layer + RequireAuth + Library reads from Supabase + anon→authed migration + Header/AppLayout/PageBackBar all live in production
- Vercel Analytics + Speed Insights collecting on production
- Stripe in test mode at A$4.99/month (live mode pending Phase A)
- Trademark TM #2640607 (AU) filed; Madrid Protocol decision pending June 2026
- Phase A pre-beta sprint in progress: webhook + isPremium refactor, Resend migration, Profile.jsx persistence, migrateAnonymousData fix, analytics_events table, Terms/Privacy compliance review

## Known issues / watch points
- Library scan history reads from localStorage only; renders 'Invalid Date' on broken timestamps. Resolves with Phase A item 7 (migrateAnonymousData fix)
- isPremium() reads mmm_trial_start from localStorage, ignores Stripe state — Day 8 silent demotion bug. Phase A item 5
- Profile.jsx writes to localStorage only; saveProfile() helper exists in storage.js but isn't wired up — silently breaks 4 of 9 segmentation dimensions. Phase A item 6
- migrateAnonymousData overwrites created_at with now() and skips scans entirely. Phase A item 7
- products.js marked deprecated — product data lives in api/match.js
- Bundle size 517kB raw / 146kB gzipped — exceeds Vite's default 500kB warning. Code-split routes via React.lazy + Suspense when bandwidth allows (Phase 5+)

## Workflow patterns (banked from Phase 2)
- **Hotfix-class changes to main:** commit directly on main, then immediately back-merge into the active feature branch in the same session. Reserve cherry-pick for emergencies where the feature branch can't accept a merge yet (creates redundant commits in eventual merge history)
- **Supabase CLI password prompt:** `supabase` CLI prompts for DB password interactively and the agent harness can't answer. Workaround: run SQL via Supabase dashboard SQL Editor (https://supabase.com/dashboard/project/<project-id>/sql/new)
- **Smoke testing protocol for migration paths:** single browser context throughout (don't hop private→regular), fresh email per test, clear localStorage first. Brave private mode → regular Brave breaks magic-link deep linking
- **Dev machine extension stack:** uBlock Lite + Privacy Badger + Brave Shields stacked. All three block Vercel Analytics scripts at network layer. Smoke testing of own analytics installs requires either disabling all three on the test page or using Safari iPhone / extension-free browser

## Maintenance backlog

### api/advice.js — opportunistic upgrades
Bundle the following changes the next time `api/advice.js` is edited for any reason. None are urgent in isolation; deferring avoids a standalone deploy.

- **Model string:** `claude-sonnet-4-20250514` → `claude-sonnet-4-6-[latest]`
  - Same price, 1M context now GA on Sonnet 4.6
  - Sonnet 4 remains supported at 200K context; no forced deadline
- **API version header:** Review `anthropic-version: 2023-06-01` — currently fine but flagged for revisit on next SDK update
- **Verify after change:** Run a smoke test on at least one persona to confirm response quality is unchanged

Reviewed 26 Apr 2026 — confirmed not affected by 1M context beta retirement (April 30, 2026), as no `anthropic-beta` header is set and request size stays ~1,300 tokens.

### Pre-beta cleanups
- Refresh project CLAUDE.md again post-Phase-A once Stripe webhook + Profile fix + migration fix all land
- Code-split routes via React.lazy + Suspense to clear Vite 500kB warning
- Verify Supabase staging Site URL / redirect allowlist config (banked from Phase 2 audit)
- Document the Supabase SQL editor transaction quirk if it recurs

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
