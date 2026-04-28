# Instrumentation audit — pre-beta cohort prep

**Date:** 2026-04-28 · **Branch:** phase-2-history (audit pass; no code changes) · **Scope:** staging Supabase (`debkssddxfmhofenwcpn`) + Vercel + Stripe + email surfaces

**Top-line:** Of the 35 funnel events + 9 segmentation dimensions in `MMM-Funnel-Events-Spec.md`, **2 are cleanly queryable today, 5 are partially queryable with caveats, 17 are addressable with frontend instrumentation + an events store, and 20 are architecturally blocked** (missing schema, missing infrastructure, or aspirational features). Roughly **15% capture, 40% addressable, 45% blocked**.

The three biggest gaps are: (1) no event store, (2) no Stripe webhook (already banked as Phase A blocker item 5), (3) `profiles.profile_dna` is never populated server-side because `Profile.jsx` writes to localStorage only — which silently invalidates 4 of the 9 segmentation dimensions.

---

## Section A — Event capture matrix

Legend: ✅ captured · ⚠️ partial · 🔧 possible (not captured) · 🚫 architecturally blocked

### Stage 0 — Acquisition

| Event | Status | Notes |
|---|---|---|
| `landing_view` | 🔧 | `trackPageView` only fires on `/ColorScanner`. No `/Home` pageview. |
| `referral_source` | 🔧 | No UTM parsing anywhere. No storage column. |
| `signup_started` | 🔧 | No instrumentation on auth forms. |
| `signup_completed` | ✅ | `auth.users.created_at` + `handle_new_user()` trigger creates `profiles` row. |
| `signup_abandoned` | 🚫 | Depends on `signup_started`; can't derive without it. |

### Stage 1 — Activation

| Event | Status | Notes |
|---|---|---|
| `first_scan_attempted` | 🔧 | Only `/ColorScanner` mount fires `trackPageView` → localStorage. Not queryable. |
| `first_scan_completed` | ⚠️ | `MIN(scans.created_at)` per user — but **only for authed users**. `migrateAnonymousData` (storage.js:405) migrates products + shades, **not scans**. Anon-then-authed users lose pre-signup scan history. |
| `first_save` | ⚠️ | `MIN(saved_*.created_at)` per user — but **migration overwrites `created_at` with migration time** (Supabase default `now()` on insert). First-save timing is corrupted for any anon-then-authed user. Real bug, not just analytics. |
| `first_share` | 🔧 | Share buttons in `MatchResults.jsx:424` don't call any tracking. |
| `beauty_dna_started` | 🚫 | `Profile.jsx:33-37` `save()` writes `localStorage` only. **Never reaches `profiles.profile_dna`**. |
| `beauty_dna_completed` | 🚫 | Same root cause as above. |

### Stage 2 — Engagement

| Event | Status | Notes |
|---|---|---|
| `return_visit` | 🔧 | `auth.users.last_sign_in_at` exists but updates on token refresh, not on every visit. Needs explicit session-start event. |
| `scan_event` | ⚠️ | `scans` table queryable for authed users only. |
| `save_event` | ⚠️ | `saved_*` tables queryable for authed users only. |
| `library_visit` | 🔧 | No pageview on `/Library`. |
| `library_revisit_save` | 🚫 | Requires per-card click tracking + revisit detection. No event store. |
| `persona_engagement` | 🚫 | `scans` table has `advice` text but no `persona` column. Persona name lives in `sessionStorage.mmm_language` only. |
| `persona_switch` | 🚫 | **Feature does not exist.** Language is locked at the Home language picker; no in-app switch. Aspirational event. |
| `share_completion` | 🔧 | `trackRetailerClick` defined in `analytics.js:55` but **never imported anywhere** — dead code. |
| `dna_section_completion` | 🚫 | Per-section save() writes localStorage only. No timestamps. |
| `upsell_view` | 🔧 | Conditional render in `MatchResults.jsx:433`; no view event. |
| `upsell_click` | 🔧 | `handleCheckout()` fires (`MatchResults.jsx:131`); not tracked. |

### Stage 3 — Retention

| Event | Status | Notes |
|---|---|---|
| `weekly_active` | ⚠️ | Derivable for authed users from `scans.created_at` / `saved_*.created_at` joins. No "session" concept. |
| `monthly_active` | ⚠️ | Same. |
| `dormancy_started` | 🚫 | Needs daily computation against an event log. None exists. |
| `reactivation` | 🚫 | Same. |
| `feature_first_use` | 🚫 | No per-feature event taxonomy. |
| `cumulative_scans` | ⚠️ | `count(*) from scans where user_id=X` works ad-hoc; no weekly snapshot. |
| `cumulative_saves` | ⚠️ | Same. |

### Stage 4 — Conversion

| Event | Status | Notes |
|---|---|---|
| `conversion_email_sent` | 🚫 | No email provider beyond Supabase native auth SMTP. |
| `conversion_email_opened` | 🚫 | Same — no tracking pixels possible. |
| `conversion_landing_view` | 🚫 | Conversion landing page does not exist. |
| `conversion_completed` | 🚫 | **No Stripe webhook handler in `api/`.** `profiles.subscription_status` etc. are dead columns. (Phase A blocker item 5.) |
| `conversion_declined` | 🚫 | No decline UX. |
| `lapsed` | 🚫 | Depends on `conversion_completed` non-occurrence + cohort end date. |

### Stage 5 — Cohort segmentation

| Dimension | Status | Notes |
|---|---|---|
| Cohort identifier | 🚫 | No `cohort_id` column on `profiles`. Schema change required. |
| Acquisition channel | 🚫 | No UTM capture, no storage column. |
| Persona used | 🚫 | No `persona` column on `scans`. Lives in `sessionStorage` only. |
| Market | ⚠️ | `profiles.country` exists; **never written** by `Profile.jsx` (localStorage only). |
| Language | 🚫 | `sessionStorage.mmm_language` only. No `profiles.language`. |
| Device class | 🚫 | No user_agent capture. |
| Subscription tier | ⚠️ | `profiles.subscription_tier` defaults `'free'`, **never updated**. Becomes real once Stripe webhook ships. |
| Beauty DNA completeness | 🚫 | `profile_dna` never populated server-side (Profile.jsx bug). |
| Age band | 🚫 | Lives in localStorage `mmm_profile`; never reaches `profiles`. |

---

## Section B — Gap categorisation

**Hard blockers for beta** (Stages 0-2 basics, blocks activation/engagement measurement):
- No event store table.
- `Profile.jsx` writes localStorage only — silently breaks 4 segmentation dimensions and 3 Beauty-DNA events.
- `migrateAnonymousData` doesn't migrate scans, and overwrites `created_at` on saves — first-scan / first-save timestamps are corrupted for anon-then-authed users.
- No cohort identifier — can't slice beta users from regular signups.
- Stripe webhook missing (already Phase A item 5; unblocks `subscription_tier`).

**Soft blockers** (Stage 2 advanced, can iterate during beta):
- Persona analytics (no persona column; `persona_switch` feature doesn't exist).
- Library revisit tracking.
- Upsell view/click instrumentation.
- Email infra for conversion-stage events (already on pre-launch list).

**Deferrable** (Stage 3-4, time-distance buys runway):
- Retention metrics — derivable retroactively from scan/save timestamps; weekly snapshots can be cron'd later.
- Conversion events — month 11-13, you have ~12 months to ship the conversion landing page + decline UX.
- Cold-cohort acquisition (UTM, referral) — warm cohort first.

---

## Section C — Three paths

### Path A — Self-rolled in Supabase

Add `public.analytics_events (id, user_id nullable, session_id, event_type, properties jsonb, persona, language, country, device_class, created_at)` with insert-anyone / select-service-role RLS. Repoint `analytics.js:saveEvent()` to insert via supabase-js. Instrument the 13 "possible" frontend events. Fix `Profile.jsx` to call `storage.js:saveProfile()`. Add `profiles.cohort_id` migration.

**Estimate:** ~12-16h. Schema migration ~1h, repoint analytics.js ~1-2h, frontend event instrumentation ~4-6h, Profile.jsx → Supabase ~1-2h, cohort tagging on signup ~2-3h, verification queries ~2-3h.

**Cost:** $0 marginal — uses existing Supabase plan.

**What breaks if skipped before cohort:** activation + retention measurement is missing or corrupted. You'd have to reconstruct from scan/save timestamps with the migration-distortion caveat baked in.

### Path B — PostHog (or equivalent)

`npm i posthog-js`. Init in `main.jsx` with project key. `posthog.identify(user.id)` on auth state change. Replace `analytics.js` `track*` functions with `posthog.capture('event_name', {properties})`. Instrument 13+ frontend events. Use PostHog's funnel/cohort/retention dashboards.

**Estimate:** ~6-10h. Setup + identify ~1-2h, event instrumentation ~3-5h, dashboard config ~2-3h.

**Cost:** PostHog Cloud free tier = 1M events/month. At 100 users × 50 events/day × 30 days = 150k events/month. Comfortably free for beta. Paid kicks in around ~10k MAU.

**What breaks if skipped before cohort:** Stripe `subscription_status` still localStorage-driven — paying users still get demoted on day 8 (the bug that elevated webhook to Phase A item 5). Conversion measurement still impossible.

### Path C — Hybrid (recommended)

Two clean responsibilities:

- **Stripe + Supabase = revenue + identity source-of-truth.** Ship the webhook (Phase A item 5; ~6-9h already estimated). Adds `profile_dna` server-side write, `cohort_id` column, populates `subscription_tier` from Stripe events. Fixes the day-8 bug as a side-effect.
- **PostHog = product analytics.** Funnels, retention, cohorts, frontend events. Joins to your DB via shared `user_id`.

**Estimate:** ~10-14h *new* work (PostHog setup + frontend events 4-6h, Profile.jsx fix 1-2h, cohort_id 2h) **on top of** the already-banked Phase A items 5 (Stripe webhook 6-9h) and Resend email migration.

**Cost:** $0 for beta cohort scale.

**What breaks if skipped before cohort:** Path C is the only path that fixes both the analytics gap *and* the day-8 reliability bug. Skipping = either (a) refund-risk on real subscribers post-beta, or (b) can't measure month-13 conversion honestly. Recommended path **because** the work overlaps with reliability work that has to happen anyway.

---

## Open questions on the spec (need your call before any instrumentation)

1. **`first_save` semantics**: should "first save" mean *first save action ever* (currently lost for anon→authed via migration timestamp overwrite), or *first save attributable to the authed identity* (current corrupted behaviour)? If the former, `migrateAnonymousData` needs to preserve original timestamps — small migration-logic change.
2. **Activation includes anon activity?** Spec proposes "first_scan_completed AND first_save within 7 days of signup_completed". Anon users frequently scan + save *before* signing up (the funnel encourages it). If anon timestamps are corrupted, your activation rate is artificially low. Decision: treat anon activity as zero, or fix the migration?
3. **`persona_engagement` granularity**: "advice text rendered" (cheap, fires on MatchResults mount) or "user dwelt N seconds with advice" (needs scroll/visibility tracking)?
4. **`library_revisit_save`**: re-read the wording — *"user revisits a previously-saved item"*. View click on a Library card, or some other interaction? Saves are dedupe-uniqued so re-saving is a no-op.
5. **`feature_first_use`**: needs a feature taxonomy — what counts as a "feature"? Library tabs? Persona switching (doesn't exist)? Worth a follow-up list before instrumentation.
6. **Cohort tagging timing**: when does a user become a "beta cohort" member? At signup with a special invite link? Manual flag-flip post-signup? Affects `cohort_id` write path.

---

## Appendix — Live-DB verification SQL (run when convenient)

The matrix above is built from migration files (authoritative for migration-applied state). The only thing migrations *can't* show is out-of-band changes (manual SQL Editor edits, dashboard-configured pg_cron, etc.). To close the loop:

```sql
-- Run in Supabase Dashboard SQL Editor (no DB password needed there)
-- against the staging project. Paste the output back to me.

-- 1. All tables across all schemas (look for any not in migrations 0001-0003)
SELECT table_schema, table_name FROM information_schema.tables
WHERE table_schema NOT IN ('pg_catalog','information_schema','pg_toast',
  'auth','storage','realtime','supabase_functions','vault','extensions',
  'graphql','graphql_public','net','pgsodium','pgsodium_masks')
  AND table_type = 'BASE TABLE'
ORDER BY 1,2;

-- 2. profiles columns (verify migrations match live)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema='public' AND table_name='profiles'
ORDER BY ordinal_position;

-- 3. Any pg_cron jobs?
SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname='pg_cron') AS pg_cron_installed;
-- If true:  SELECT jobid, schedule, command, jobname FROM cron.job;

-- 4. Functions/triggers in public (verify migration-known set)
SELECT routine_name FROM information_schema.routines WHERE routine_schema='public';
SELECT trigger_name, event_object_table FROM information_schema.triggers
WHERE trigger_schema='public';

-- 5. Sanity row counts
SELECT 'profiles' AS t, count(*) FROM public.profiles UNION ALL
SELECT 'scans', count(*) FROM public.scans UNION ALL
SELECT 'saved_shades', count(*) FROM public.saved_shades UNION ALL
SELECT 'saved_products', count(*) FROM public.saved_products UNION ALL
SELECT 'auth.users', count(*) FROM auth.users;
```

If output matches my migration-derived expectations (6 public tables, ~14 profiles columns, no pg_cron, 2 functions, 3 triggers), this report stands as-is. If anything's different, ping me and I'll revise.

---

**Pending external verification (not blocking):**
- Vercel dashboard: Web Analytics + Speed Insights toggle state. Code-side they're not installed (`package.json` has no `@vercel/analytics` or `@vercel/speed-insights`); even if toggled on in dashboard, custom events need the SDK.
