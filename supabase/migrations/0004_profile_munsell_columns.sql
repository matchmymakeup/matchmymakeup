-- Migration 0004: profile Munsell-infrastructure columns for v2.1.
-- See docs/design/v2.1/decisions.md (#9, #11) and the v2.1 season-convention memory.
-- All nullable, no defaults, no backfill. Populated on My DNA creation per user.
--
--   country_code   — ISO 3166-1 alpha-2 (e.g. 'AU', 'US'). Sourced from
--                    getLocation() in src/analytics.js:25. Parallel to the
--                    existing profiles.country (full-name format, drives
--                    product filtering — preserved per Hard Rule on
--                    products.js read-only).
--   season         — canonical English season key: 'spring' | 'summer'
--                    | 'autumn' | 'winter'. Commonwealth spelling. Display
--                    layer applies hemisphere-localised override via
--                    src/lib/munsell.js (Northern → "Fall", Southern → "Autumn").
--   value_munsell  — Munsell value (0–10).
--   chroma_munsell — Munsell chroma (0–N, varies by hue family).
--                    Stored as text for placeholder flexibility; if Phase 3
--                    needs numeric filtering, a follow-up migration converts.
--
-- Phase 3 forward-compat hints (NOT part of this migration):
--   * Munsell hue may need its own column (hue_munsell text). Full Munsell
--     notation is `<hue> <value>/<chroma>` e.g. "7.5YR 6/4"; only value+chroma
--     are stored here. Migration 0005 can add hue if methodology requires.
--   * 12-season subtype ('soft_autumn', 'bright_spring', etc.) belongs in a
--     separate seasonal_subtype text column — NOT as a sub-key inside the
--     season column. Keeps `where season = 'autumn'` queries inclusive of
--     all autumn subtypes. Migration 0005 can add seasonal_subtype if needed.
--
-- Existing RLS policy on profiles covers all columns of the user's own row;
-- no policy change needed.

alter table public.profiles
  add column if not exists country_code   text,
  add column if not exists season         text,
  add column if not exists value_munsell  text,
  add column if not exists chroma_munsell text;
