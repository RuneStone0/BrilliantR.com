# BrilliantR.com

**[brilliantr.com](https://brilliantr.com)** — IT and AI consulting for small and mid-sized businesses.

## About

Public marketing website for BrilliantR. Built as a self-contained static site — no framework, no build step, no dependencies beyond a Google Fonts import.

## Structure

```
website/
├── index.html   # Entire site — HTML, CSS, and JS in one file
├── i/           # Encrypted invoice pages (ciphertext only) — unlisted, noindex
├── pay/         # Invoice payment page (QR target) — unlisted, noindex
├── css/         # Stylesheets
├── images/      # Site images (logo, photo, icon)
├── js/          # Scripts
└── logos/       # Brand assets
```

`i/` is the invoice itself, published as ciphertext: the link carries the key in the
fragment (`brilliantr.com/i/#002.<key>`), so the public repo never holds client data.
See `../brilliantr/services/invoicing/publish.py`.

`pay/` is reached only from the QR code on an invoice:
`brilliantr.com/pay/?amt=1720.00&inv=001`. Payment handles and account details live in
`pay/pay-details.js`; a method with `enabled: false` is not rendered.

> Internal operations content (services, prospects, marketing, QR tooling) lives in the private repo **RuneStone0/brilliantr**, not here.

## Hosting

Deployed via GitHub Pages on the `main` branch (`.github/workflows/deploy-pages.yml`, source: `./website`). Pushes to `main` go live automatically at [brilliantr.com](https://brilliantr.com).

## Development

Open `website/index.html` directly in a browser — no server needed.
