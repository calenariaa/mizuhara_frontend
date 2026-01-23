# Mizuhara Frontend

Modernes **Tablet- & Mobile-First Frontend** auf Basis von **Nuxt 4 / Vue 3**,  
entwickelt als modulare Oberfläche für ein **API-Platform (Hydra / JSON-LD) Backend**.

Der Fokus liegt auf:
- sauberer Architektur
- strikter Typisierung
- sehr gute Developer Experience
- langfristiger Erweiterbarkeit (mehrere Backend-Module)

---

## ✨ Tech Stack

- **Nuxt 4** (Vue 3, Composition API)
- **TypeScript** (strict)
- **API Platform / Hydra (JSON-LD)**
- **ESLint (Nuxt-offiziell, Flat Config)**
- **Prettier**
- **Just + Makefile** (plattformübergreifende Dev-Commands)

---

## 🧱 Projektziele

- Mobile-First UI
- modulare API-Anbindung
- klare Trennung von
    - API-Client
    - Services
    - Views / Components
- konsequente statische Analyse & Clean Code
- reproduzierbare Dev- & CI-Workflows

---

## 📁 Projektstruktur (vereinfacht)

```text
.
├─ components/          # UI-Komponenten
├─ composables/         # API-Client & Reusable Logic
│  └─ api/
├─ services/            # Fachliche API-Services (pro Modul)
├─ pages/               # Nuxt Pages / Routing
├─ types/               # API- & Domain-Types (Hydra / DTOs)
├─ public/
├─ .nuxt/               # generated (nicht committen)
├─ eslint.config.mjs
├─ justfile
├─ Makefile
└─ nuxt.config.ts

```

## 🚀 Projekt aufsetzen

### Voraussetzungen

- **Node.js ≥ 18** (empfohlen: 20+)
- **npm**
- Optional:
  - **just** (Windows / Unix)
  - **make** (Unix / macOS / CI)

---

### Installation

```bash
npm install
just install
make install

```

### Server

```bash
npm run dev
just dev
make dev

```
