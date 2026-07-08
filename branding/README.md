# Zipra Brand & Icon System

A premium, modern icon set for the Zipra grocery-delivery brand.

## Brand mark
- **Concept:** A leaf merged with a lightning-style **Z** (the brand initial), sitting on a rounded-square tile.
  It communicates *fresh produce* + *lightning-fast delivery* — a unique identity, **not** a generic shopping cart.
- **Primary:** `#FF7A00` (orange gradient `#FF9A3D → #F26400`)
- **Secondary:** white `#FFFFFF` and cream `#FFF3E8`
- **Dark:** charcoal for text/neutral backgrounds
- **Style:** flat/minimal with subtle gradients and a soft inner glow.

## Source files
- `branding/zipra-icon.svg` — master vector (1024×1024 viewBox)
- `branding/generate-icons.js` — zero-dependency PNG generator (zlib-based, supersampled AA)
- `branding/generated/` — all raster sizes

## Regenerate
```bash
node branding/generate-icons.js
```
Then copy the needed outputs to `public/icons/` (web/PWA) and `zipra-mobile/assets/` (Expo).

## Deliverables produced
| Asset | Size | Purpose |
|-------|------|---------|
| icon-1024 / 512 | 1024, 512 | App store / Play Store / source |
| icon-192 / 144 / 96 / 72 / 48 | various | PWA / launcher |
| favicon-32 / 16 | 32, 16 | Browser tab |
| maskable-1024 | 1024 | PWA maskable |
| adaptive-foreground-1024 / 432 | — | Android adaptive icon foreground |
| notification-white-96 | 96 | Android status-bar notification (white, transparent) |
| splash-2048 / 1242 | — | iOS / Android splash |

## Where icons live
- **Web / PWA:** `public/icons/*`, `public/manifest.webmanifest`, wired in `app/layout.jsx` metadata.
- **Expo mobile:** `zipra-mobile/assets/{icon,adaptive-icon,notification-icon,splash-icon,favicon}.png`, configured in `zipra-mobile/app.json`.
- **In-app logo:** `components/ui/logo.jsx` (renders the same leaf-bolt mark).
