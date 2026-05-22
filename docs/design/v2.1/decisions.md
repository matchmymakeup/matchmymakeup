# v2.1 Design Direction — locked decisions

Locked 2026-05-01 after design review with Desiree Pretorius. This file is the code-side mirror of `MMM-design-direction-v2.1.docx` (to be banked alongside in this folder). Authoritative source for the v2.1 build on branch `phase-3-design-v2.1`.

## 11 locked decisions

1. **Hub-and-spoke architecture.** Page 1 entry → Page 2 "My DNA" hub. All sub-pages return to the hub.
2. **Profile renamed "My DNA"** — replaces existing `Profile.jsx` / `/Profile`.
3. **Three Page-1 entry options:** Take Quiz · Just Scan · Sign in.
4. **Just Scan works without an account.** Save-to-library prompts account creation AFTER the result is delivered, not before scan. (Retrofit note below — pattern not yet implemented.)
5. **Language: auto-detect from browser** with corner override component.
6. **Palette:** warm cream `#F5F1EA` + white `#FFFFFF` cards + ink `#1A1A1A` + clay accent `#9C5B4A`. Replaces existing noir/champagne/rosegold/ivory.
7. **Skin tone selection MUST use real photographic samples** — no illustrated/emoji swatches.
8. **Back nav always returns to My DNA hub**, never to colour box. `PageBackBar` default destination → `/MyDNA`.
9. **Shade naming: Munsell-derived** format `<descriptor> · <season> <value>/<chroma>`, e.g. "Warm Beige · Spring 6/4". Slash separator matches standard Munsell practitioner notation (`hue value/chroma`) and resolves 2-digit-chroma ambiguity. Helper: `src/lib/munsell.js` (PR A2).
10. **Library categories are MMM's actual 8:** Lipstick, Nail Polish, Foundation, Mascara, Blush, Eyeshadow, Highlighter, Lip Liner. Tile counts driven by `saved_products.category`.
11. **Phase 3 (deferred): 12-season colour analysis extension to My DNA.** Awaiting Desiree's methodology document. Don't stub `seasonal_analysis` schema until the methodology lands.

## UX reference (per Desiree)

DRMTLGY's Dr. Marisa Skin Quiz: <https://www.drmtlgy.com/pages/shop-quiz>

Patterns to mirror:
- Brand authority framing in the entry CTA ("Take our quiz by [persona], get a custom result in less than 2 minutes")
- Concern-led entry (DRMTLGY's "skin goals" → MMM equivalent: shade category / "find my palette")
- Sequential questions, single per screen, large circular icon options, auto-advance on select
- Real photographic skin samples (matches decision #7)
- Output: personalised result + product recommendations + completion incentive (DRMTLGY uses 25% off; MMM equivalent TBD)
- No visible back button during quiz — prevents state loss

## Constraints inherited from project Hard Rules

- All user-facing strings remain translatable. New v2.1 strings ship in the existing 15-locale set from day 1; no English-only `// TODO i18n` placeholders.
- One Supabase migration step at a time. Munsell columns ship as migration `0004_profile_munsell_columns.sql` standalone, not bundled.
- `products.js` is read-only. Munsell mapping lives in new `src/lib/munsell.js`.

## Build sequencing (locked 2026-05-01)

Branch `phase-3-design-v2.1` off `main`. The branch IS the feature flag — no code-level flag.

| Step | Scope | Notes |
|---|---|---|
| 0 | Bank design direction (this file + .docx) | THIS COMMIT |
| 1 | Foundation: A1 palette tokens (add only, no sweep), A2 `munsell.js`, A3 migration `0004` | three independent PRs |
| 2 | Hub skeleton: `MyDNA.jsx` + `/Profile`→`/MyDNA` redirect + Header nav rename | single PR |
| 3 | Page 1 landing: `Landing.jsx` + 3 tiles + browser-lang detect + corner override + sunset `/Home` (301→`/`) | bundle Just Scan post-result account-prompt retrofit (currently saves silently for anon users) |
| 4 | Quiz flow (C1–C4); C2 skin tone uses gradient placeholders behind `data-placeholder="true"` until photo assets land, with "Final imagery pending" caption in dev/preview | C1/C3/C4 not blocked |
| 5 | Polish: palette sweep (old → new, then remove old), photo asset pipeline, smoke testing on Vercel preview | |

Phase 3 (12-season) is separate scope, unblocked by Desiree's methodology doc.

## State verified at lock-time (2026-05-01)

- **`/Home` sunset is internal-only safe.** Referenced in `src/lib/safeRedirect.js:3`, `src/pages/ResetPasswordConfirm.jsx:40`, `src/pages/SignUp.jsx:44`, `src/pages/AuthCallback.jsx:67`. No external surface depends on it: root `index.html` (18 lines) has no og:url/canonical/twitter tags, no `public/sitemap*` or `public/robots*` files exist, `vercel.json` is SPA-rewrite only. The four code call sites get updated to `/` (or `/MyDNA` for authed-only post-flow) when Step 3 ships.
- **Just Scan post-result account-creation prompt is not yet implemented.** `MatchResults.jsx`'s `saveProductToLibrary` (line 164) calls `saveProduct` directly with no auth check — anon users save silently to localStorage and rely on the existing anon→authed migration on next sign-in. Decision #4 requires an explicit prompt UI; bundle this retrofit into Step 3.
- **i18n locale count is 15** (`en, hi, pt, zh, id, ng, es, ar, fr, bn, sw, tl, en-za, af, zu`). Embedded in `ColorScanner.jsx` and `MatchResults.jsx` only; `Home.jsx`, `Profile.jsx`, `Library.jsx`, `Header.jsx` carry no locale objects (existing tech debt). v2.1 new strings on Landing/MyDNA/Quiz pages ship the same 15-locale embedded pattern. Migration to `react-i18next` is Phase 4+ tech debt.

## Phase 4+ tech debt (banked)

- Migrate embedded i18n to `react-i18next` once v2.1 is stable. Locale list of 15 codified in a single source (`src/lib/locales.js`) at that point.
- Audit which pages currently lack i18n (Home, Profile, Library, Header) and back-fill against the 15-locale set.
- After v2.1 ships, sweep `noir / champagne / rosegold / ivory` → remove from `tailwind.config.js` (post Step 5 sweep).
