mkdir -p ~/Documents/matchmymakeup/docs && pbpaste > ~/Documents/matchmymakeup/docs/MMM-Funnel-Events-Spec.md
# MatchMyMakeup — Funnel Event Specification
**Purpose:** Define the events your analytics needs to capture before the beta cohort starts, so you can answer real questions about 
activation, engagement, retention, and conversion. Use this as the source-of-truth list for the instrumentation audit.

**Brisbane, 28 April 2026 · pre-beta scope**

---

## Stage 0 — Acquisition

These tell you *how* people arrive and whether referral channels work. Mostly relevant for the cold-cohort supplement, but worth 
capturing from day one.

| Event | Definition | Why it matters | Probable source |
|---|---|---|---|
| `landing_view` | First page load, anonymous user, no session yet | Baseline traffic by channel | Vercel analytics or 
self-instrumented |
| `referral_source` | UTM parameters captured on landing | Which channel works (network, social, cold) | URL params on landing page 
|
| `signup_started` | Auth modal opened, email entered | Top of funnel | Auth event listener |
| `signup_completed` | Email verified, session established | Conversion to identified user | Supabase auth.users insert |
| `signup_abandoned` | `signup_started` without `signup_completed` within 24hr | Friction in auth flow | Derived from above |

**Critical question for analyst:** What % of `landing_view` becomes `signup_completed`? If <2%, your landing page is the problem. If 
>5%, your funnel is healthy.

---

## Stage 1 — Activation

The single most important stage. Activation predicts retention better than any other variable. Get this right and the rest follows.

| Event | Definition | Why it matters | Probable source |
|---|---|---|---|
| `first_scan_attempted` | User opens scanner camera/photo input | Did they cross the threshold to use the product? | Frontend event 
|
| `first_scan_completed` | Hex value successfully extracted, MatchResults rendered | The "aha moment" — they saw a real match | 
Frontend event after match |
| `first_save` | First product OR shade saved to library | Investment signal — they want to keep something | Supabase saved_shades / 
saved_products insert |
| `first_share` | First share button clicked (any channel) | Social signal — would they tell anyone? | Frontend event on share click 
|
| `beauty_dna_started` | Profile page visited, first field filled | Willingness to give zero-party data | Frontend event |
| `beauty_dna_completed` | All 7 sections filled | Deep engagement marker | Profile completion = 100% |

**Activation definition (proposal):** A user is "activated" when they have done `first_scan_completed` AND `first_save` within 7 
days of `signup_completed`. This is a *hypothesis*, not a fact — adjust after seeing actual cohort behaviour. Industry rule of thumb 
is that activation = the action that predicts week-4 retention with the highest correlation. You'll discover the real definition 
empirically once you have 20 cohorts to look at.

**Critical question for analyst:** What's the time-to-activation distribution? If most activate in <10 minutes, the product is 
intuitive. If activation requires repeat visits, your onboarding is the problem.

---

## Stage 2 — Engagement (Week 1-4)

Tells you whether the product is sticky. Most apps lose 60-80% of users in week 1. Your goal is to know your shape, not match a 
benchmark.

| Event | Definition | Why it matters | Probable source |
|---|---|---|---|
| `return_visit` | Any session > 24hr after signup | Did they come back at all? | Supabase auth session events |
| `scan_event` | Any subsequent scan after first | Repeat usage | Frontend event |
| `save_event` | Any subsequent save | Repeat investment | Supabase inserts |
| `library_visit` | /Library page loaded | Are they browsing what they saved? | Frontend route event |
| `library_revisit_save` | User revisits a previously-saved item | Are saves valuable artefacts or junk drawer? | Click event on 
Library card |
| `persona_engagement` | Which Maya advice block was viewed (per persona) | Which personas resonate? | Frontend event with 
persona_id |
| `persona_switch` | User changed default persona (if feature exists) | Are personas working as intended? | Profile update event |
| `share_completion` | Share dialog confirmed (not just opened) | Real social action vs intent | Frontend event with channel |
| `dna_section_completion` | Each Beauty DNA section completed | Where do they drop off in profile? | Section-level events |
| `upsell_view` | Premium upsell card viewed | Awareness of paid tier | Frontend event |
| `upsell_click` | Upsell CTA clicked | Intent toward paid tier | Frontend event |

**Critical metrics for analyst:**
- **Week-1 return rate.** % of activated users who return within 7 days. Target shape: >40% for a healthy app, >60% for a sticky 
one.
- **Scans per user per week.** Distribution, not average. Average lies.
- **Persona distribution.** Does Maya dominate even for users in non-English markets? That's a localisation failure signal.
- **Library size at week 4.** Distribution across cohort. Power-law expected (most users save few, few users save many).

---

## Stage 3 — Retention (Week 4 → Month 12)

This is where the 12-month free Premium cohort gives you your most valuable asset: a real retention curve.

| Event | Definition | Why it matters | Probable source |
|---|---|---|---|
| `weekly_active` | Any meaningful action in a 7-day window | Standard WAU calculation | Aggregated from above events |
| `monthly_active` | Any meaningful action in a 30-day window | Standard MAU calculation | Aggregated |
| `dormancy_started` | No activity for 14 consecutive days | Predictor of churn | Computed daily |
| `reactivation` | Activity after dormancy_started | Did they come back? | Computed |
| `feature_first_use` | First use of any new feature shipped during cohort | Adoption of new features | Per-feature event |
| `cumulative_scans` | Total scans by user, snapshotted weekly | Cohort engagement depth | Aggregated |
| `cumulative_saves` | Total saves by user, snapshotted weekly | Library growth curve | Aggregated |

**Critical question for analyst:** What does the retention curve look like at weeks 1, 4, 12, 26, 52? The *shape* matters more than 
the absolute numbers. Three patterns:

- **L-shape** (steep drop, flatlines low): novelty product, no real need
- **Smile-shape** (drops then rebounds): some users find lasting value
- **Linear decline**: typical SaaS, manageable with re-engagement

You won't know your shape until ~week 12 at earliest, and the full picture takes the full year. That's why this cohort is patient 
capital.

---

## Stage 4 — Conversion (Month 11 → Month 13)

The single most important data point of the entire program. Did the cohort *choose* to keep paying?

| Event | Definition | Why it matters | Probable source |
|---|---|---|---|
| `conversion_email_sent` | Month-11 reminder email delivered | Inputs to conversion funnel | Email service log |
| `conversion_email_opened` | Pixel fired or link clicked | Awareness of pending end | Email service log |
| `conversion_landing_view` | User visited the conversion page | Active engagement with decision | Frontend event |
| `conversion_completed` | Stripe subscription created | Paid conversion | Stripe webhook |
| `conversion_declined` | User explicitly opted out | Honest no | Frontend event |
| `lapsed` | Free Premium ended, no action taken | Passive churn | Computed at month 13 |

**Critical question for analyst:** Among the cohort, what % of `monthly_active` at month 11 became `conversion_completed`? That 
ratio is a directional signal of product-market fit. Among `monthly_active` users, expect 20-40% to convert to paid in a healthy 
product. Among the *whole* cohort (including lapsed), expect 10-20%.

---

## Stage 5 — Cohort segmentation dimensions

Every event above should be filterable by these dimensions, otherwise the data is noise. This is where most instrumentation projects 
fail — they capture events but can't slice them.

| Dimension | Why | Source |
|---|---|---|
| Cohort identifier | Beta vs cold vs general signup | User metadata field |
| Acquisition channel | UTM source on signup | Stored on user record |
| Persona used | Which persona served their advice? | Per-event |
| Market | User's country (self-declared or IP-derived) | Profile field |
| Language | Primary interaction language | Profile or browser |
| Device class | Mobile/desktop, iOS/Android | User agent |
| Subscription tier | Free / Premium / Premium+ / Beta | profiles.subscription_tier |
| Beauty DNA completeness | 0% / partial / 100% | Computed from profile |
| Age band (if collected) | 18-24 / 25-34 / 35-44 / 45+ | Profile (sensitive — handle carefully) |

---

## What this list is for

This list is **the answer to "what do I need to know"** before the beta. The next step is the audit — for each event above, answer 
one question: *can my current stack capture this?*

Three possible answers per event:
- **Yes, captured today** — already in Supabase tables or analytics
- **Possible but not captured** — instrumentation work needed
- **Architecturally not possible** — requires schema change or new tooling

Group the events into three buckets after the audit:
- **Must-have before beta starts** — anything blocking activation/retention measurement
- **Should-have within first 4 weeks of beta** — engagement depth, persona analytics
- **Nice-to-have, can be added later** — cold-cohort specific stuff, conversion optimisation

---

## Audit questions for the next session

When you sit down to do the actual audit:

1. What analytics tooling do you currently have wired? (Vercel Analytics? Supabase logs? Google Analytics? PostHog? Self-rolled?)
2. What columns exist on the `profiles` table beyond `subscription_tier`?
3. Are there `events` or `analytics_events` tables in Supabase, or does each feature log independently?
4. Is there frontend event tracking in place, or only backend?
5. Do you have a way to identify a beta-cohort user vs a regular signup? If not, that's a Day 0 schema add.
6. Stripe webhook handlers — what events do they currently fire on, and are those events stored?

---

## Honest limits of this document

Three things this list deliberately does *not* try to do:

1. **It doesn't tell you what your activation criterion will be.** You'll discover that empirically once you have data. The proposal 
(`first_scan_completed` + `first_save` within 7 days) is a hypothesis to test, not a truth.

2. **It doesn't try to be exhaustive.** There are events not on this list that may matter (e.g. error rates, performance metrics, 
app stability). Those belong on a separate observability list, not this analytics one.

3. **It doesn't optimise for advertising attribution or marketing campaigns.** That's a separate and later concern. If you ever run 
paid acquisition you'll need a different event spec — this one assumes warm cohort + cold supplement only.
