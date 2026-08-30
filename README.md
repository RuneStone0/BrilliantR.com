# BrilliantR.com

**[brilliantr.com](https://brilliantr.com)** — IT and AI consulting for small and mid-sized businesses.

## About

Public marketing website for BrilliantR. Built as a self-contained static site — no framework, no build step, no dependencies beyond a Google Fonts import.

## Structure

```
website/
├── index.html   # Entire site — HTML, CSS, and JS in one file
├── css/         # Stylesheets
├── images/      # Site images (logo, photo, icon)
├── js/          # Scripts
└── logos/       # Brand assets
```

> Internal operations content (services, prospects, marketing, QR tooling) lives in the private repo **RuneStone0/brilliantr**, not here.

## Hosting

Deployed via GitHub Pages on the `main` branch (`.github/workflows/deploy-pages.yml`, source: `./website`). Pushes to `main` go live automatically at [brilliantr.com](https://brilliantr.com).

## Development

Open `website/index.html` directly in a browser — no server needed.
