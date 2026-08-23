# Site analysis: functionality, hosting, and cost

Deep-dive on the 10 candidates from [research.md](research.md). Hosting platform is identified from DNS records, HTTP response headers, and raw HTML fingerprinting (not guessed from appearance) — see [Methodology](#methodology). Functionality is read from each site's visible pages.

## Functionality matrix

Legend: ✅ present · ❌ absent · 🔗 external (handled by a third-party tool, not the main site) · — replaced by an alternative (see notes)

| # | Business | Card | Form | Booking | Store | Login | Blog |
|---|----------|:---:|:---:|:---:|:---:|:---:|:---:|
| 1 | [2Evolve Coaching](https://www.2evolvecoaching.com/) | ✅ | ✅ | ❌ | ❌ | ❌ | — |
| 2 | [Bravely Rooted Coaching](https://bravelyrootedcoaching.com/) | ✅ | — | ✅ | ❌ | ❌ | — |
| 3 | [Dynamo Careers Consulting](https://dynamocareers.com/) | ✅ | ✅ | ❌ | ✅ | — | — |
| 4 | [Attainment Life](https://www.attainmentlife.com/) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 5 | [Rachel Ellenani Health](https://rachelellenani.com/) | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| 6 | [Milk + Honey Wellness](https://www.milkandhoneywellness.com/) | ✅ | — | ❌ | ✅ | ✅ | ✅ |
| 7 | [Insight for Leadership](https://www.executivecoachingutah.com/) | ✅ | ✅ | ✅ | ❌ | 🔗 | ✅ |
| 8 | [HoloBeing Health & Wellness](https://holobeinghealthandwellness.com/) | ✅ | ✅ | ✅ | ❌ | 🔗 | ✅ |
| 9 | [Certified Life Coaching UT](https://www.helpingyouloveyourlife.com/) | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| 10 | [Bryce Bauer Coaching](http://brycebauer.com) | ✅ | ❌ | ✅ | — | ✅ | ❌ |

**Notes on the `—` cells:**
- **#1 Blog:** link in nav, but no real content behind it.
- **#2 Form:** no contact form — a Zoom scheduler link stands in for it. **Booking:** that same Zoom link.
- **#3 Login:** the free course/masterclass is likely gated by email capture, not a real account system. **Blog:** replaced by embedded Vimeo masterclass videos.
- **#6 Form:** no contact form — a newsletter signup stands in for it.
- **#10 Store:** no storefront, but "free trial" language implies a paid membership tier exists behind it.

**Pattern:** every single site is fundamentally a **business-card site** — none is a true web app. The variation is entirely in which *bolted-on tool* handles booking/payments/login: some use a lightweight external link (Zoom, Calendly), some embed a heavier all-in-one platform (Kartra, GoHighLevel, Kajabi) that provides store + login + email as a bundle. That bundle choice turns out to be the single biggest cost driver — see below.

## Hosting, platform & Lighthouse scores

Lighthouse run headless (Chrome, mobile emulation, default throttling) against each homepage on 2026-08-23. Scores are 0–100 per category.

| # | Business | Platform | Est. $/yr | Perf | A11y | BP | SEO |
|---|----------|----------|:---:|:---:|:---:|:---:|:---:|
| 1 | [2Evolve Coaching](https://www.2evolvecoaching.com/) | Duda | 230–300 | 72 | 91 | 92 | 85 |
| 2 | [Bravely Rooted Coaching](https://bravelyrootedcoaching.com/) | Squarespace | 275 | 32 | 98 | 100 | 100 |
| 3 | [Dynamo Careers Consulting](https://dynamocareers.com/) | Kartra | 950–1,200 | 83 | 100 | 73 | 92 |
| 4 | [Attainment Life](https://www.attainmentlife.com/) | GoDaddy Website Builder | 180–240 | 69 | 84 | 96 | 92 |
| 5 | [Rachel Ellenani Health](https://rachelellenani.com/) | GoHighLevel | 1,160–3,560 | 57 | 96 | 77 | 100 |
| 6 | [Milk + Honey Wellness](https://www.milkandhoneywellness.com/) | Squarespace (Commerce) | 430 | 63 | 90 | 96 | 92 |
| 7 | [Insight for Leadership](https://www.executivecoachingutah.com/) | Netlify | 0–240 | 97 | 87 | 96 | 100 |
| 8 | [HoloBeing Health & Wellness](https://holobeinghealthandwellness.com/) | Bluehost (WordPress) | 150–250 | 98 | 86 | 100 | 100 |
| 9 | [Certified Life Coaching UT](https://www.helpingyouloveyourlife.com/) | Duda | 230–300 | 75 | 88 | 96 | 92 |
| 10 | [Bryce Bauer Coaching](http://brycebauer.com) | Kajabi | 1,430–1,910 | 67 | 84 | 37 | 85 |

**How platform was identified:** DNS (`dig` NS/CNAME/A), HTTP response headers (`Server`, `CF-RAY`), and raw HTML fingerprinting for platform-specific strings (`squarespace`, `kajabi`, `wsimg.com`, `kartra`, `leadconnector`, etc.) — see [Methodology](#methodology).

**Cost basis:** current published list price, annual billing, for the plan tier that covers each site's observed features (login, store, forms). Not confirmed from an actual invoice — directional, not exact. #5 and #3 carry the widest ranges because GoHighLevel and Kartra are usually sold through an agency/reseller at a markup over list price.

### The real story: platform choice, not hosting, drives cost

None of these businesses are paying much for "hosting" in the sense we mean for [website-hosting](../website-hosting.md) — that's a red herring. What they're actually paying for is an **all-in-one SaaS platform** (Kartra, GoHighLevel, Kajabi) that bundles hosting with CRM, email, funnels, and course delivery, whether or not they use most of it:

- **3 of 10** (Dynamo Careers, Rachel Ellenani, Bryce Bauer) are on Kartra / GoHighLevel / Kajabi — **$950–3,500+/year** — for functionality that, on inspection, is mostly a business-card site plus one booking widget and occasionally a small store.
- **The other 7** are on ordinary website builders or basic hosting (Squarespace, Duda, GoDaddy, Netlify, Bluehost) — **roughly $0–430/year**.

That's close to an order-of-magnitude gap for sites that look and function almost identically from the visitor's side. The 3 expensive ones are the clearest wedge for a website-optimization pitch: a coach paying $1,500–3,000/year for Kajabi or GoHighLevel, when their site is fundamentally 4-5 pages plus a Calendly link, is a strong "you're overpaying for machinery you don't use" conversation — much stronger than the hosting-cost argument alone.

### Expensive doesn't mean better — the Lighthouse scores make that case directly

The two cheapest sites in the group score the best overall: **Insight for Leadership** (Netlify, $0–240/yr) hits 97/87/96/100, and **HoloBeing** (Bluehost, $150–250/yr) hits 98/86/100/100. Meanwhile **Bryce Bauer's** Kajabi site — the single most expensive platform here at $1,430–1,910/yr — posts the worst Best Practices score in the set (37) and a mediocre 67 on Performance. **Rachel Ellenani's** GoHighLevel site, also expensive, is similarly middling (57 Performance, 77 Best Practices). **Bravely Rooted's** Squarespace site is the Performance outlier on the cheap side (32) — proof that low cost doesn't guarantee quality either, but at least it's not compounding a high bill with a slow site.

This is arguably the sharper pitch than cost alone: it's not "you're overpaying," it's **"you're overpaying for a worse site."** A rebuild that's both cheaper to run and measurably faster/more compliant is a much easier sell than a rebuild that's just cheaper.

## Methodology

For each domain: `dig` for NS/CNAME/A records, `curl -I` for response headers (`Server`, `CF-RAY`, etc.), and `curl | grep` on the raw HTML for platform-specific strings (`squarespace`, `kajabi`, `wsimg.com`, `kartra`, etc.). Functionality was read from each site's rendered content. Lighthouse scores are from the `lighthouse` CLI (headless Chrome, default mobile emulation + throttling) against each homepage's `performance`, `accessibility`, `best-practices`, and `seo` categories — a single run per site, not averaged, so treat individual scores as a snapshot rather than a lab-grade benchmark. Cost estimates are current published list prices for the identified platform's plan that would cover the observed features (annual billing where offered, since that's the realistic rate) — not confirmed from the business's actual invoice, so treat as directional, not exact.
