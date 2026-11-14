# AGENT.md

Instructions for AI agents (and future humans) working in this repo. Read this before editing anything
under `website/`.

## The golden rule

**Any change to public website content must ship with an update to both agent-facing files, in the same
commit:**

1. `website/index.md` : the full site in clean markdown, for language models and assistants.
2. `website/llms.txt` : the small llmstxt.org guide that points at `index.md` and summarises the key facts.

If the visitor-facing page changed, these two changed too. Prices, service names, positioning, contact
details, case studies, guarantees: all of it lives in three places and must stay consistent. The date line
at the top of `index.md` (`Last updated YYYY-MM-DD`) is updated every time it is touched.

Rationale: agents now read the markdown files instead of the HTML, and a stale `llms.txt` tells them the
wrong price. That is worse than having no file at all.

## Private paths, never make these public

- `website/pay/` : invoice payment page, reached only from an invoice QR code.
- `website/invoice/` : encrypted invoice documents (ciphertext plus a key carried in the URL fragment).
- `website/offer/` : encrypted client proposals.

Rules that keep them private:

- Keep `noindex, nofollow` in their HTML head. Do not remove it.
- Keep the `Disallow` lines for `/pay/`, `/invoice/` and `/offer/` in `website/robots.txt`.
- **Never** list, link or describe these paths in `website/llms.txt`, `website/index.md`, or
  `website/sitemap.xml`. `llms.txt` mentions once, in prose, that private client tools exist at those
  paths and must not be cited. That is the only permitted mention.
- Never commit client data, invoice amounts, keys or personal details in plaintext. Payment handles live in
  `pay/pay-details.js`; a method with `enabled: false` is not rendered.

## What lives where

```
AGENT.md                  # this file, repo root, NOT published
README.md                 # human orientation, NOT published
scripts/pre-commit-llms.sh # optional git hook that enforces the golden rule
website/                  # the published site (GitHub Pages source: ./website)
  index.html              # the entire public site: HTML, CSS and JS in one file
  index.md                # markdown twin of the public site, for agents
  llms.txt                # llmstxt.org v2 guide: H1, blockquote, prose facts, H2 link lists, Optional
  404.html, robots.txt, sitemap.xml, CNAME
  css/, js/, images/, logos/
  pay/, invoice/, offer/  # PRIVATE, see above
```

## Checklist before committing a content change

1. Edit `website/index.html` as needed.
2. Update `website/index.md`: same facts, same numbers, same ordering of ideas. Update the `Last updated`
   date.
3. Update `website/llms.txt` if anything in its summary block or its key-facts bullets changed. Keep it
   under ~4 KB: it must fit in context next to real work. Links must point at `index.md` (with anchors
   where useful), not at the HTML page.
4. Confirm every `index.md#anchor` used in `llms.txt` still resolves to a real heading in `index.md`.
5. Confirm nothing under `pay/`, `invoice/` or `offer/` leaked into the agent files.
6. Commit the page change and both agent files together.

A pre-commit hook enforcing step 6 is available:

```bash
cp scripts/pre-commit-llms.sh .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit
```

It blocks a commit that touches `website/*.html` without staging `website/index.md` and
`website/llms.txt`. Bypass with `git commit --no-verify` only for changes with no visitor-facing effect.

## Verifying (after the push, against the live site)

```bash
curl -sI https://brilliantr.com/llms.txt | head -1
curl -s https://brilliantr.com/index.md | head -5
```

Better: run the AI-readiness auditor from the `brilliantr-website-optimization` skill
(`scripts/ai_readiness.py https://brilliantr.com`). It checks llms.txt presence and spec compliance,
markdown alternates, the `rel="alternate"` / `rel="describedby"` discovery tags, AI-crawler access in
robots.txt, sitemap and JSON-LD. The target is 100/100; the two discovery tags live in the `<head>` of
`website/index.html` and must not be removed.

## Deploying

Pushing to `main` deploys automatically via GitHub Pages (`.github/workflows/deploy-pages.yml`, source
`./website`). There is no build step and no preview environment: review locally by opening
`website/index.html`, and verify on the live URL after the deploy lands (allow about a minute).
