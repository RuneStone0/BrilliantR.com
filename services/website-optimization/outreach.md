# Outreach prioritization

Ranks the 10 candidates from [research.md](research.md) / [site-analysis.md](site-analysis.md) against the three-part pitch:

1. **Migrate your hosting, pay ~50% of what you pay today.** (Same pricing model as [website-hosting](../website-hosting.md): 50% of current cost, $9/mo floor — we keep the other 50% as margin, since actual infra cost on Cloudflare Pages/Netlify approaches $0.)
2. **Your Lighthouse score is bad, here's why it matters in plain English, we'll fix it.**
3. **We're a phone call away for anything else** — an AI/IT consulting upsell (BrilliantR's core business).

> **Note on provider:** costs below assume the *savings* land regardless of whether we standardize on Cloudflare Pages (the earlier decision) or Netlify — the 50%-of-current-cost pricing model works the same either way. GitHub Pages stays ruled out (ToS). Worth confirming which one you actually want to lead with before outreach starts.

**Tracking:** live per-prospect state now lives in [prospects/coaching/utah/](prospects/coaching/utah/) — one JSON file per business (contact info, curation tier + reasoning, report/email paths, status). See [curation-rubric.md](curation-rubric.md) for how the tier assignments below were derived, and the top of [overview.md](overview.md) for how this fits into the larger prospecting pipeline. This doc remains the narrative writeup of that first batch — the JSON files are the source of truth for current status.

## Plain-English Lighthouse cheat sheet (for pitch #2)

Use this to translate scores into something a non-technical coach cares about — don't lead with the word "Lighthouse."

| Category | What it actually measures | Why they should care |
|---|---|---|
| **Performance** | How fast the site loads | Most visitors leave a site that takes more than a few seconds to load — a slow site is quietly losing them leads before they ever see the page. Google also ranks slower sites lower. |
| **Accessibility** | Whether people with disabilities (screen readers, low vision, keyboard-only) can use the site | Usability for a real slice of potential clients — and increasingly a legal exposure area (ADA-style website complaints/lawsuits are a growing small-business risk). |
| **Best Practices** | Outdated code, browser errors, insecure elements | Things that make a site look broken or untrustworthy in a modern browser, or that quietly stop working over time. |
| **SEO** | Whether Google can properly read and rank the site | Directly affects whether new customers find them by searching — the whole point of having a website. |

## Sample outreach report

[reports/bravely-rooted-coaching/report.pdf](reports/bravely-rooted-coaching/report.pdf) is a worked example — a one-page report built for Bravely Rooted Coaching, meant to attach directly to an outreach email. It follows the priority the user actually wants for these reports: mobile experience first (concrete load-time numbers from a phone, in plain English), what's already working (SEO, accessibility — builds trust, avoids manufacturing problems that aren't there), then cost savings, with a soft CTA that includes the pitch #3 (general tech/AI help) angle. Source is [reports/bravely-rooted-coaching/report.html](reports/bravely-rooted-coaching/report.html) — same folder pattern (`reports/<slug>/report.html` + `report.pdf` + local image assets) can be reused for the next prospect.

## Ranked priority

### Tier 1 — clean migrations: pure business-card sites, nothing to untangle

The dividing line that matters most for *how easy the sale is* isn't dollar size, it's whether a login or store lives on the platform we'd be moving them off of. These four have neither — no member area, no cart, nothing paid delivered through the site itself — so the full 50% savings is realistic on day one.

| Business | Current platform/cost | New cost (50%, $9 floor) | Client saves/yr | Pitch #2 hook |
|---|---|---|---|---|
| **[Bravely Rooted Coaching](https://bravelyrootedcoaching.com/)** | Squarespace, $275/yr | ~$11.50/mo | ~$138 | Performance score of **32/100** — the worst Performance number in the set. Booking is just a Zoom link, nothing to replace. Best lead-off: dramatic score, trivial migration. |
| **[Certified Life Coaching UT](https://www.helpingyouloveyourlife.com/)** | Duda, ~$265/yr | $11/mo | ~$132 | Perf 75 — mild, honest talking point. |
| **[2Evolve Coaching](https://www.2evolvecoaching.com/)** | Duda, ~$265/yr | $11/mo | ~$132 | Perf 72 — same shape. |
| **[Attainment Life](https://www.attainmentlife.com/)** | GoDaddy Website Builder, ~$210/yr | $9/mo (floor) | ~$102 | Perf 69 — smallest dollar amount here, still an easy migration. |

Good set for building an initial track record fast: nothing to negotiate around, nothing dependent on a third-party platform surviving the move, modest-to-decent savings, and a real (if not always dramatic) performance story on each. Start with Bravely Rooted — best story-to-effort ratio of the four.

### Tier 2 — big dollar opportunity, but the platform likely runs more of their business than "just the website"

All four of these have a login, member area, or store baked into the expensive platform — meaning the site isn't the only thing we'd be replacing, and the realistic pitch is "let's fix/host your public pages, then talk about the rest" rather than a clean 50%-off migration. Ranked by dollar opportunity:

| Business | Current platform/cost | New cost (50%, $9 floor) | Client saves/yr | Dependency | Note |
|---|---|---|---|---|---|
| **[Rachel Ellenani Health](https://rachelellenani.com/)** | GoHighLevel, ~$2,360/yr (range: $1,160–3,560) | ~$98.50/mo | **~$1,182** (largest in the group) | GHL is very likely her full CRM/funnel/automation backbone, not just hosting — the biggest platform to untangle of the four. | Performance (57) and Best Practices (77) are real, fixable problems to open with regardless of how far the migration goes. |
| **[Bryce Bauer Coaching](http://brycebauer.com)** | Kajabi, ~$1,670/yr | ~$69.50/mo | ~$834 | Kajabi hosts a member/login area for paid content, not just marketing pages — that piece needs a new home (e.g. Memberful/Podia) before the full saving is realistic. | Best Practices score of **37/100** — the worst score in the entire set of 10. Strongest "your site has a real problem" opener, just don't promise the full $834 on the first call. |
| **[Dynamo Careers Consulting](https://dynamocareers.com/)** | Kartra, ~$1,075/yr | ~$45/mo | ~$540 | Real store/cart running through Kartra. | Best Practices (73) is the weak spot to open with. |
| **[Milk + Honey Wellness](https://www.milkandhoneywellness.com/)** | Squarespace Commerce, $430/yr | $18/mo | ~$216 | Login + paid programs depend on Squarespace Commerce specifically. | Smallest dollar size in this tier. Performance (63) is the opening. |

These are real opportunities — the two largest dollar amounts on the whole list are here — but none of them close in one call. They're where pitch #3 (ongoing IT/AI help) matters most, since disentangling a business from an all-in-one platform is consulting work, not a weekend migration. A couple of completed Tier 1 case studies will make these easier to close.

### Skip / deprioritize

| Business | Why |
|---|---|
| **[Insight for Leadership](https://www.executivecoachingutah.com/)** | Already on Netlify, likely near-free. Perf 97, SEO 100 — there is no savings pitch (50% of ~$10/mo current cost is *below* our $9 floor — they'd get **no discount**, possibly a worse deal) and no technical pitch (scores are already excellent). |
| **[HoloBeing Health & Wellness](https://holobeinghealthandwellness.com/)** | Cheap Bluehost hosting (~$200/yr) and excellent scores (98/86/100/100). Savings would be small (~$92/yr) and there's no "we can fix this" story. Low return for outreach effort — only revisit if there's spare capacity. |

## Suggested outreach order

1. **Bravely Rooted** first — best story-to-effort ratio of all 10: dramatic score, trivial migration, no dependencies.
2. **Certified Life Coaching UT, 2Evolve, Attainment Life** next — fast, low-friction wins to build a track record and testimonials before tackling the harder accounts.
3. **Rachel Ellenani, Bryce Bauer, Dynamo Careers, Milk + Honey** once there's a proof point to show — ranked by dollar opportunity, but all four need a consulting-style conversation (pitch #3) rather than a cold migration pitch, since each has a login or store that has to be dealt with first.
4. Skip Insight for Leadership and HoloBeing unless capacity is free and a warm relationship exists anyway (e.g., through referral) — the math doesn't favor them.
