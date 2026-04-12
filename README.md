# DECLASSIFIED // Intelligence Feed
### AI-Powered Government Document Analyzer · PWA

> Drop any declassified government document. Get the most mind-blowing revelations extracted into a Twitter-style intelligence feed — instantly.

---

## 🔴 Live App

Deployed via Vercel:  
**`https://declassified-feed.vercel.app`**

---

## 📱 Progressive Web App

This is a fully installable PWA. No app store required.

| Platform | Install Method |
|---|---|
| **iOS Safari** | Share → Add to Home Screen |
| **Android Chrome** | Menu → Add to Home Screen (or tap the install banner) |
| **Desktop Chrome/Edge** | Click install icon in the address bar |

Once installed it runs like a native app — full screen, home screen icon, offline access to saved feeds.

---

## ⚡ Features

- **Drag & drop or paste** any declassified document text
- **AI extraction** — Claude identifies the 8–10 most shocking revelations
- **Shock level ratings** — CRITICAL / HIGH / NOTABLE per finding
- **Twitter-style feed** — punchy, shareable intel cards
- **Post to X** — one tap opens Twitter with the card pre-filled
- **Save feeds** — store up to 20 analyzed feeds locally
- **Offline mode** — saved feeds accessible without connection
- **PWA install** — add to home screen on any device

---

## 🗂 File Structure

```
declassified-feed/
├── index.html          # Main app (single file, no build step)
├── sw.js               # Service worker (caching + offline)
├── manifest.json       # PWA identity + icons
├── vercel.json         # Vercel deployment config
├── icons/
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   └── icon-512x512.png
└── README.md
```

---

## 🚀 Deploy Your Own

### 1. Fork or clone this repo
```bash
git clone https://github.com/YOUR_USERNAME/declassified-feed.git
cd declassified-feed
```

### 2. Deploy to Vercel (one click)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/declassified-feed)

Or via CLI:
```bash
npm i -g vercel
vercel
```

### 3. That's it
No build step. No dependencies. Pure static files.  
Vercel deploys in ~30 seconds.

---

## 📡 Recommended Document Sources

| Source | URL | Best For |
|---|---|---|
| CIA Reading Room | [cia.gov/readingroom](https://www.cia.gov/readingroom) | MKUltra, UFO files, Cold War ops |
| FBI Vault | [vault.fbi.gov](https://vault.fbi.gov) | JFK, MLK, COINTELPRO, mob |
| National Archives | [archives.gov](https://www.archives.gov) | Pentagon Papers, JFK records |
| NSA FOIA | [nsa.gov/Resources/FOIA](https://www.nsa.gov/Resources/FOIA-Reading-Room/) | Surveillance, signals intel |
| DoD FOIA | [esd.whs.mil/FOID](https://www.esd.whs.mil/FOID/Reading-Room/) | Military ops, defense docs |

---

## 🔧 How It Works

1. User pastes or uploads document text
2. App sends text to **Claude Sonnet** via Anthropic API
3. Claude extracts top 8–10 revelations as structured JSON
4. App renders findings as a styled intelligence feed
5. User can save, copy, or post findings directly to X

The Anthropic API key is handled by the Claude.ai artifact environment. If self-hosting outside Claude.ai, you will need to add your own API key to the fetch call in `index.html`.

---

## ⚠️ Disclaimer

All analysis is AI-generated from publicly available, officially declassified government documents. This application does not access any classified systems. Intended for research, journalism, and educational purposes.

---

## 🏗 Built With

- Vanilla HTML/CSS/JS — zero dependencies
- [Claude Sonnet](https://anthropic.com) — AI analysis engine
- [Vercel](https://vercel.com) — deployment
- PWA standards — Web App Manifest + Service Worker

---

*DECLASSIFIED INTELLIGENCE FEED · v1.2*
