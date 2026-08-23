# Curation rubric

Explicit, reproducible rules for scoring a `discovered` prospect and assigning it a tier — the thing a curator agent needs to follow instead of making judgment calls from scratch each time. Derived directly from the reasoning used in [outreach.md](outreach.md) on the first batch (10 Utah coaching businesses); update this file, not the agent's prompt, when the rules need to change.

## Inputs a prospect needs before curation can run

- Current hosting platform (identified via DNS/HTTP fingerprinting — see [site-analysis.md Methodology](site-analysis.md#methodology))
- Estimated current cost/year (published list price for the plan tier that covers the site's observed features)
- Lighthouse scores (performance, accessibility, best-practices, seo) — headless run against the homepage
- A read of the site's functionality: does it have a login/member area, a store/cart, or run on an all-in-one CRM/funnel platform (GoHighLevel, Kartra, Kajabi, or similar)?

If the site is unreachable (dead domain) or ownership/identity can't be confirmed, curation cannot run — leave `status: "discovered"` and set `blocked_reason` instead of forcing a tier.

## Step 1 — compute the dollar opportunity

```
new_monthly   = max(current_monthly_cost * 0.5, 9)      # $9/mo floor, see website-hosting.md pricing model
savings_per_year = (current_monthly_cost - new_monthly) * 12
```

If `savings_per_year <= 0` (current cost is already at or below the floor), the dollar pitch doesn't exist — this alone doesn't disqualify a prospect, but it removes one of the two pitches available.

## Step 2 — flag migration complexity

Mark `migration_complexity: "platform_dependency"` if **any** of the following is true:
- The site has a login/member area for paid content
- The site has a working store/cart
- The site runs on an all-in-one CRM/funnel/course platform (GoHighLevel, Kartra, Kajabi, and similar — the tell is that the platform *is* the business's marketing/ops backbone, not just a page host)

Otherwise `migration_complexity: "clean"` — nothing to untangle beyond pointing DNS at the new host.

This flag exists because a login or store means the realistic pitch is "let's fix/host your public pages, then talk about the rest," not a same-day full migration — see the Bryce Bauer correction in outreach.md for why this overrides "looks like an easy win" impressions.

## Step 3 — score the technical story

- Any Lighthouse category **< 40**: "dramatic" — strong enough to lead pitch #2 with the number itself (e.g. Bravely Rooted's Performance 32, Bryce Bauer's Best Practices 37).
- Any category **40–69**: "real but mild" — worth mentioning, not worth leading with.
- All categories **≥ 85**: no technical story. Combined with `savings_per_year <= 0`, this is a **skip** (see Step 4) — see Insight for Leadership / HoloBeing.

## Step 4 — assign the tier

| Tier | Condition |
|---|---|
| **skip** | `savings_per_year <= 0` AND all Lighthouse categories ≥ 85 (no dollar story, no technical story) |
| **tier1** (clean migration) | `migration_complexity == "clean"` AND `savings_per_year > 0` |
| **tier2** (big $, needs a conversation) | `migration_complexity == "platform_dependency"` AND `savings_per_year > 150` |
| **needs_review** | anything that doesn't fit the above cleanly — e.g. `platform_dependency` with low savings, or a dramatic Lighthouse score but `clean` migration and near-zero savings. Don't force a tier; flag for a human to look at once volume makes that practical. |

## Step 5 — order within a tier

- **Within tier1:** dramatic Lighthouse score (Step 3) first, `savings_per_year` as tiebreaker. A trivial migration with an ugly, easy-to-show number (Bravely Rooted) beats a slightly bigger dollar amount with a merely mediocre score.
- **Within tier2:** `savings_per_year` descending. These all need a longer conversation regardless, so lead with the biggest opportunity.

## Step 6 — write the reasoning, not just the score

Every curated record needs a short `reasoning` string explaining *why* it landed in its tier — not just the number. Future you (or the next agent stage) needs to know "GoHighLevel is likely her full CRM backbone, not just hosting" without re-deriving it from raw data. A tier number with no reasoning isn't curation, it's a guess with extra steps.

## What this rubric deliberately doesn't decide

- Whether a `tier1`/`tier2` prospect is actually worth pursuing *right now* (capacity, geographic focus, relationship warmth) — that's the human-approval gate, not the curator.
- Pricing exceptions or one-off deals — the rubric assumes the standard [website-hosting](../website-hosting.md) pricing model; anything that needs to deviate from it goes through a person.
