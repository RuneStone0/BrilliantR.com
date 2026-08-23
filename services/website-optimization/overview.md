# Website Optimization

**Status:** Brainstorming — market research in progress, no offering defined yet.

## Concept

Not yet defined. Working hypothesis: a service for small businesses whose websites are outdated, slow, hard to find (SEO), or not converting visitors — distinct from [website-hosting.md](../website-hosting.md), which is about *where* a site runs, not how good it is. Needs scoping: is this an audit/report product, a one-time fix-it engagement, an ongoing retainer, or an upsell attached to the hosting service?

## The prospecting pipeline

This started as one-off manual research (see below) but is meant to grow into a repeatable, eventually agent-driven pipeline for finding and qualifying prospects across verticals and states — not just Utah coaching businesses. Three stages, each with a narrow read/write contract, connected through one JSON file per prospect rather than shared documents (so agents don't need to parse each other's prose, and so status is always unambiguous):

```
discovered → curated → approved (human) → outreach_ready → sent → responded → converted / declined
```

- **Prospector** — finds businesses in a target vertical/geography, does basic platform fingerprinting, writes new records with `status: "discovered"`.
- **Curator** — scores `discovered` records against [curation-rubric.md](curation-rubric.md) (dollar opportunity, migration complexity, Lighthouse severity), writes back a tier + written reasoning, sets `status: "curated"`.
- **Human gate** — reviews curated records, flips `status` to `approved` or `declined`. Deliberately manual for now — see the note in curation-rubric.md's closing section on why this isn't automated yet.
- **Outreach generator** — builds `report.pdf` + `email.md` for `approved` records (same pattern as the Bravely Rooted example under `reports/`), sets `status: "outreach_ready"`.

Live prospect data lives under [prospects/](prospects/) — one file per business, grouped `prospects/<vertical>/<state>/<slug>.json`. That's the source of truth for current status; the docs below are the narrative record of the first manual batch that the rubric was derived from.

## Market research (first batch — manual, seeded the rubric above)

See [research.md](research.md) for the first pass: 10 small coaching businesses in Utah, their sites, and a few standout "dead domain" leads.

See [site-analysis.md](site-analysis.md) for a deeper look at those same 10 sites: what functionality each one actually has (business card, forms, booking, store, login), what platform each is hosted on (confirmed via DNS/HTTP fingerprinting, not guessed), estimated annual cost, and Lighthouse scores. Headline finding: 3 of the 10 are on expensive all-in-one SaaS platforms (Kartra, GoHighLevel, Kajabi — $950–3,500+/year), and the cheapest-hosted sites in the group actually score *better* on Lighthouse than the priciest ones — "you're overpaying for a worse site" is a stronger pitch than cost alone.

See [outreach.md](outreach.md) for the prioritized ranking that resulted (the reasoning behind it is now codified in curation-rubric.md) — who to approach first, who needs a longer consulting conversation instead of a quick migration, and who to skip.

## Open questions

- **Service definition.** What's actually being sold — an audit, a rebuild, an SEO/speed fix, ongoing optimization? Needs to be scoped before pricing or outreach makes sense.
- **Relationship to hosting service.** Upsell to existing hosting clients, a standalone lead-gen offer, or the *first* touchpoint that funnels into hosting?
- **Build the three pipeline agents.** The rubric and data schema exist; the Prospector, Curator, and Outreach-generator agents themselves haven't been built yet. Curator is the one most worth building first — it's the step with the least manual judgment left once the rubric exists, and unblocks scaling the other tier1 prospects that are still just `status: "curated"` with no report/email yet.
- **Expand beyond Utah coaching.** Once the pipeline works end-to-end on this vertical, extend `prospects/` to other verticals (tradespeople, restaurants — matching the hosting service's target) and other states.
