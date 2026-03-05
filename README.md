# ⚡ Business OS — by A-Impact

> Du gibst eine Idee ein. Wir bauen die Firma. KI betreibt sie.

**Live URL:** https://business-os-git-main-ai-mpact.vercel.app  
**Backend:** http://187.124.4.166:8001  
**GitHub:** Shawty97/business-os  

---

## Was ist Business OS?

Business OS ist eine KI-Plattform die aus einer Beschreibung in 90 Sekunden eine vollständige Unternehmensinfrastruktur erstellt — und danach autonome AI-Agenten einsetzt die das Business betreiben.

**Der Founder trifft nur noch Entscheidungen. Alles andere läuft automatisch.**

---

## Features

### v2 — Business Generator
- **Build Wizard** (`/build`) — 2-Step Form: Beschreibung + Nische + Zielmarkt
- **90-Sekunden Generate** — 11 Dokumente: Brand, Marketing, Sales, Finance, Ops, Legal, Tech
- **CEO Dashboard** (`/dashboard/[id]`) — KPI Cards, AI-Briefing, Decision Queue
- **6 AI-Agenten** — Sales, Marketing, Support, Finance, Analytics, Ops (GPT-4o)
- **Decision Queue** — Agents stellen Entscheidungen in Queue, CEO approves/rejects
- **Admin Page** (`/admin`) — Alle erstellten Businesses übersichtlich

### v3 — Deploy & Operate  
- **Landing Page Deploy** (`/deploy/[id]`) — Echtes Vercel Deploy in ~30 Sek.
- **RESEND Welcome Email** — Automatisch nach erfolgreichem Deploy
- **Cal.com Booking** — `POST /api/v3/book-call` für Strategy Calls
- **MDT Integration** — `POST /api/v3/marketing-launch` → erste Content-Woche
- **Demo Mode** (`/demo`) — 3 vorkonfigurierte Demo-Businesses für Kunden-Calls

---

## Routes

| Route | Beschreibung |
|-------|-------------|
| `/` | Landing Page |
| `/demo` | Live Demo — wähle Business, build läuft automatisch |
| `/build` | Business Wizard |
| `/progress/[id]` | Fortschrittsanzeige |
| `/result/[id]` | Ergebnis + Downloads |
| `/deploy/[id]` | Vercel Landing Page Deploy |
| `/dashboard/[id]` | CEO Dashboard mit Decision Queue |
| `/pricing` | Pricing (Starter €49, Operator €299, Enterprise) |
| `/admin` | Admin — alle Businesses |

---

## API Endpoints

### Core
- `POST /api/jobs` — Neues Business erstellen
- `GET /api/jobs/{id}/status` — Fortschritt
- `GET /api/jobs/{id}/result` — Ergebnis
- `GET /api/jobs/{id}/download` — ZIP Download

### AI Agents (alle POST)
- `/api/agents/sales` — Sales-Analyse + Strategie
- `/api/agents/marketing` — Marketing-Kampagne
- `/api/agents/support` — Support-Antworten
- `/api/agents/finance` — Finanz-Report
- `/api/agents/analytics` — CEO Briefing (+ Decision Queue)
- `/api/agents/ops` — Operations-Plan

### Decision Queue
- `POST /api/decisions/{business_id}` — Agent stellt Entscheidung
- `GET /api/decisions/{business_id}` — Offene Entscheidungen abrufen
- `PATCH /api/decisions/{business_id}/{decision_id}` — Entscheidung auflösen

### v3 (Deploy & Operate)
- `POST /api/v3/deploy` — Business Landing Page auf Vercel deployen
- `GET /api/v3/deploy/{id}/status` — Deploy-Status
- `POST /api/v3/book-call` — Cal.com Booking URL generieren
- `POST /api/v3/send-welcome` — RESEND Welcome Email senden
- `POST /api/v3/marketing-launch` — MDT Content-Woche starten

### Admin
- `GET /api/admin/jobs` — Alle Businesses mit Stats
- `GET /api/admin/status` — System-Status (Services, Jobs, Uptime)

---

## Tech Stack

**Backend:**
- Python 3.12 + FastAPI + Uvicorn
- OpenAI GPT-4o (6 Agenten-Endpoints)
- RESEND (Transactional Email)
- Vercel Deploy API (Landing Pages)
- Systemd Service (Auto-Restart)

**Frontend:**
- Next.js 15 + TypeScript + Tailwind CSS
- Vercel Deployment (Auto-Deploy from GitHub)
- NEXT_PUBLIC_API_URL → `http://187.124.4.166:8001`

**Infra:**
- Hetzner VPS (187.124.4.166)
- Port 8001 (Business OS API, systemd)
- GitHub: Shawty97/business-os

---

## Pricing

| Plan | Preis | Was |
|------|-------|-----|
| Starter | €49 einmalig | 11 Dokumente + CEO Dashboard (30 Tage) |
| Operator | €299/Mo + 3% Revenue Share | Starter + Landing Page + 6 Agents + Marketing |
| Enterprise | ab €1.500/Mo | White-Label + Custom + SLA |

---

## Local Dev

```bash
# Backend
cd backend
pip install -r requirements.txt
export OPENAI_API_KEY=...
python -m uvicorn main:app --port 8001

# Frontend  
cd frontend
npm install
NEXT_PUBLIC_API_URL=http://localhost:8001 npm run dev
```

---

## Deployment

Backend: Systemd auf VPS  
```bash
systemctl status business-os
systemctl restart business-os
```

Frontend: Vercel (auto-deploy auf `git push origin main`)
```bash
git push origin main  # → auto-deploy
```

---

Made by Apex for A-Impact / ALMPACT LTD · Paphos, Cyprus
