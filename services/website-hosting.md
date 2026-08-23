# Website Hosting

**Status:** Idea validated, infrastructure decided, not yet built.

## Concept

Discounted static-site hosting for small local businesses (restaurants, tradespeople, etc.) who are currently overpaying for hosting they don't need. Two goals:

1. Low-friction hook into future paid consulting/dev work with the same client.
2. Steady recurring revenue.

## Scope of offering

- Target: simple "business card" static websites, optionally with a basic contact form.
- Customer action required: repoint DNS to the new host — no domain transfer, so no risk to the customer's domain ownership.
- Included: hosting, SSL certificates, backups (via git version control of each client's site — not a separate backup system).
- Website edits: handled manually, per-request, for now. Pricing for this is not yet set (see Open Questions).

## Pricing model

- Charge 50% of the customer's current hosting cost, regardless of what that is.
- **That 50%-off rate is locked in for as long as the client stays with us** — not a first-year/intro discount. Framed to the client as "whatever you're paying today, cut in half, permanently," not as a specific dollar figure — keeps the pitch simple and avoids committing to a number before we've actually confirmed their current bill.
- Floor: **$9/month minimum** — protects against deals too small to be worth the admin overhead.
- No separate migration/setup fee. Decided against it to keep the pitch simple and attractive. Risk: skipping it may undervalue the work in the client's eyes — worth revisiting if it becomes a pattern.

## Infrastructure decision: Cloudflare Pages

Chosen over Netlify and GitHub Pages.

- **GitHub Pages** — ruled out over ToS concerns around commercial reselling.
- **Netlify** — built-in contact forms (unlimited/free as of the April 2026 pricing update) is a real advantage, but its credit-based pricing bills both builds *and* bandwidth from a shared pool, so cost scales with client count and traffic. That's a poor fit for a business built on thin, fixed-fee margins.
- **Cloudflare Pages (chosen)** — free tier includes unlimited bandwidth at every tier and 5 custom domains/project; Pro is a flat $5/month if needed. Cost doesn't scale with client count or traffic, which protects margin as the client base grows. Tradeoff: no built-in form handling — needs a small reusable Pages Function (or a shared Formspree account) built once and reused per client, rather than Netlify's zero-setup forms.

**ToS note (both providers):** Cloudflare and Netlify both prohibit reselling *the platform itself* (giving clients direct dashboard/API access, or marketing the offering as "Cloudflare/Netlify hosting"). Neither prohibits the standard agency model — deploying client sites under your own account and billing for a bundled hosting service. Mitigate by never exposing client-facing dashboard/API access and never branding the offering by the underlying provider's name.

## Future plan

Eventually build a small AI-based editor so customers can make their own edits directly. Deliberately sequenced *after* validating the manual-service model — real customer edit requests should inform what the editor needs to support.

## Open questions

- **Soft ceiling on eligible hosting cost.** E.g., "let's talk" above ~$75–100/mo current spend, since higher-cost sites likely aren't simple static sites and may not fit this model. Not yet decided.
- **Per-request edit pricing.** Needs a price so it doesn't become unpaid support time — though there's an argument for pricing it low early on, since early edit requests double as free product research for the planned AI editor.
- **Contact form implementation.** Pages Function vs. shared Formspree account — need to build/decide the reusable template.
- **Client-facing materials.** Service page (marketing copy, pricing) and a migration checklist (DNS repoint steps, SSL verification, git repo setup per client) not yet drafted.
