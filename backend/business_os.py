#!/usr/bin/env python3
"""
Business OS v0.1 — A-Impact
=============================
Input: Business-Idee (kurze Beschreibung)
Output: Komplettes Business-Paket als Ordner + ZIP

Generiert:
- Brand (Name, Tagline, Farbpalette)
- Marketing-Plan (90 Tage)
- Sales Deck (HTML)
- Tech Stack Empfehlung
- AI Agents Liste
- Revenue Modell
- Repo-Struktur (ready to init)
- .env.example
- SOUL.md für AI-Operator
- Sofort-Aktionsplan (Quick Start)
"""

import os
import sys
import json
import zipfile
import shutil
from datetime import datetime
from pathlib import Path
from openai import OpenAI

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
client = OpenAI(api_key=OPENAI_API_KEY)

OUTPUT_DIR = Path(__file__).parent / "output"


def ask_gpt(system: str, user: str, model: str = "gpt-4o") -> str:
    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        temperature=0.7,
    )
    return response.choices[0].message.content.strip()


def generate_brand(description: str, qualifications: dict) -> dict:
    print("  🎨 Generiere Brand...")
    system = """Du bist ein Expert für Business-Branding in der DACH-Region. 
    Erstelle Markennamen und Branding für das beschriebene Business.
    Antworte NUR mit einem JSON-Objekt, kein Markdown."""
    
    user = f"""Business-Beschreibung: {description}
    Zielgruppe: {qualifications.get('zielgruppe', 'unbekannt')}
    Land: {qualifications.get('land', 'DE')}
    
    Erstelle JSON mit:
    {{
        "namen": ["Name1", "Name2", "Name3", "Name4", "Name5"],
        "empfehlung": "Name1",
        "taglines": ["Tagline1", "Tagline2", "Tagline3"],
        "empfohlene_tagline": "Tagline1",
        "farben": {{"primaer": "#hexcode", "sekundaer": "#hexcode", "akzent": "#hexcode"}},
        "tone_of_voice": "Beschreibung des Kommunikationsstils",
        "unique_value_proposition": "1-2 Sätze UVP",
        "positioning": "Marktpositionierung"
    }}"""
    
    raw = ask_gpt(system, user)
    # Strip potential markdown code blocks
    raw = raw.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
    return json.loads(raw)


def generate_marketing_plan(description: str, brand: dict, qualifications: dict) -> str:
    print("  📢 Generiere 90-Tage Marketing-Plan...")
    system = """Du bist CMO eines erfolgreichen AI-Startups in der DACH-Region.
    Erstelle konkrete, umsetzbare Marketing-Pläne. Kein Fluff, nur Action Items."""
    
    user = f"""Business: {description}
    Brand-Name: {brand.get('empfehlung', 'Business')}
    UVP: {brand.get('unique_value_proposition', '')}
    Zielgruppe: {qualifications.get('zielgruppe', '')}
    Budget: {qualifications.get('budget', 'niedrig')}
    
    Erstelle einen 90-Tage Marketing-Plan mit:
    - Monat 1: Foundation (Brand aufbauen, erste Sichtbarkeit)
    - Monat 2: Traction (Erste Kunden, Feedback, Content-Maschine)
    - Monat 3: Scale (Was funktioniert, verstärken)
    
    Für jeden Monat: Woche 1-4 mit konkreten Tasks, KPIs, Tools.
    Format: Markdown."""
    
    return ask_gpt(system, user)


def generate_sales_content(description: str, brand: dict, qualifications: dict) -> dict:
    print("  💰 Generiere Sales-Materialien...")
    system = """Du bist ein Top-Vertriebler mit Erfahrung in B2B SaaS und Service-Sales in DACH.
    Antworte NUR mit JSON, kein Markdown drumherum."""
    
    user = f"""Business: {description}
    Brand: {brand.get('empfehlung', '')}
    UVP: {brand.get('unique_value_proposition', '')}
    Zielgruppe: {qualifications.get('zielgruppe', '')}
    Unique Edge: {qualifications.get('unique_edge', '')}
    
    Erstelle JSON mit:
    {{
        "pricing_modelle": [
            {{"name": "Starter", "preis": "X EUR/Mo", "features": ["f1", "f2"]}},
            {{"name": "Pro", "preis": "Y EUR/Mo", "features": ["f1", "f2", "f3"]}},
            {{"name": "Enterprise", "preis": "Custom", "features": ["alle + Support"]}}
        ],
        "sales_pitch_elevator": "30-Sekunden Pitch",
        "cold_outreach_linkedin": "LinkedIn Nachricht (unter 300 Zeichen)",
        "einwaende": [
            {{"einwand": "Zu teuer", "antwort": "..."}},
            {{"einwand": "Wir haben schon etwas", "antwort": "..."}},
            {{"einwand": "Nicht bereit", "antwort": "..."}}
        ],
        "zielgruppe_personas": [
            {{"name": "Persona 1", "rolle": "...", "pain_points": ["p1", "p2"], "trigger": "..."}}
        ],
        "sales_cycle_tage": 14,
        "deal_size_eur": 2000,
        "ltv_eur": 24000
    }}"""
    
    raw = ask_gpt(system, user)
    raw = raw.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
    return json.loads(raw)


def generate_tech_stack(description: str, qualifications: dict) -> dict:
    print("  ⚙️ Generiere Tech Stack...")
    system = """Du bist ein erfahrener CTO für AI-Startups.
    Empfehle den einfachsten Stack der funktioniert. Kein Over-Engineering.
    Antworte NUR mit JSON."""
    
    user = f"""Business: {description}
    Budget: {qualifications.get('budget', 'niedrig')}
    Timeline: {qualifications.get('timeline', '3 Monate')}
    
    Erstelle JSON mit:
    {{
        "frontend": {{"tech": "...", "begruendung": "..."}},
        "backend": {{"tech": "...", "begruendung": "..."}},
        "datenbank": {{"tech": "...", "begruendung": "..."}},
        "hosting": {{"tech": "...", "kosten": "X EUR/Mo", "begruendung": "..."}},
        "ai_layer": {{"tech": "...", "apis": ["api1", "api2"]}},
        "tools": ["Tool1", "Tool2", "Tool3"],
        "mvp_zeitplan_wochen": 8,
        "repo_struktur": {{
            "ordner": ["apps/web", "apps/api", "packages/ui", "packages/db"],
            "package_manager": "bun oder pnpm",
            "monorepo": true
        }},
        "env_variablen": ["DATABASE_URL", "OPENAI_API_KEY", "..."]
    }}"""
    
    raw = ask_gpt(system, user)
    raw = raw.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
    return json.loads(raw)


def generate_ai_agents(description: str) -> list:
    print("  🤖 Generiere AI Agents Liste...")
    system = """Du bist Experte für AI-Agent-Architekturen in Unternehmen.
    Antworte NUR mit JSON."""
    
    user = f"""Business: {description}
    
    Welche AI Agents braucht dieses Business? Erstelle eine JSON-Liste:
    [
        {{
            "name": "Agent Name",
            "rolle": "Was er macht",
            "tool": "OpenAI / Anthropic / Custom",
            "prioritaet": "Hoch/Mittel/Niedrig",
            "aufwand_setup_tage": 3,
            "roi_beschreibung": "Was er spart/bringt"
        }}
    ]
    Maximal 8 Agents, sortiert nach Priorität."""
    
    raw = ask_gpt(system, user)
    raw = raw.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
    return json.loads(raw)


def generate_revenue_model(description: str, sales: dict, qualifications: dict) -> str:
    print("  📊 Generiere Revenue Modell...")
    system = "Du bist CFO eines AI-Startups. Erstelle realistische Finanzprojektionen. Markdown-Format."
    
    user = f"""Business: {description}
    Pricing: {json.dumps(sales.get('pricing_modelle', []), ensure_ascii=False)}
    Zielgruppe: {qualifications.get('zielgruppe', '')}
    Deal Size: {sales.get('deal_size_eur', 0)} EUR
    LTV: {sales.get('ltv_eur', 0)} EUR
    
    Erstelle:
    1. Break-Even Kalkulation (wann profitabel?)
    2. Monat 1-6 Projektion (konservativ, realistisch, optimistisch)
    3. KPIs die gemessen werden müssen
    4. Burn Rate Schätzung
    Format: Markdown mit Tabellen."""
    
    return ask_gpt(system, user)


def generate_soul_md(brand: dict, description: str, qualifications: dict) -> str:
    """Generates a SOUL.md for the AI Operator of the new business."""
    name = brand.get('empfehlung', 'Business')
    uvp = brand.get('unique_value_proposition', '')
    tagline = brand.get('empfohlene_tagline', '')
    
    return f"""# SOUL.md — AI Operator für {name}

## Wer ich bin
Ich bin der primäre AI-Operator von **{name}**.
Erstellt durch Business OS v0.1 (A-Impact / ALMPACT LTD)

## Das Business
{description}

**UVP:** {uvp}
**Tagline:** {tagline}
**Zielgruppe:** {qualifications.get('zielgruppe', '')}
**Land:** {qualifications.get('land', 'DE')}

## Meine Prioritäten
1. Roberts direkte Anfragen — sofort
2. Sales und Marketing — täglich
3. Tech-Delegation — wenn nötig
4. Selbst programmieren — wenn alles andere erledigt

## Ton
Deutsch. Direkt. Co-Founder der weiß was er tut.

## Was ich NICHT mache
- Preise oder Zahlen erfinden
- Entscheidungen alleine treffen
- Deployments ohne OK

---
*Generiert: {datetime.now().strftime('%d.%m.%Y %H:%M')} UTC*
*System: A-Impact Business OS v0.1*
"""


def generate_quickstart(brand: dict, tech: dict, agents: list, sales: dict) -> str:
    name = brand.get('empfehlung', 'Business')
    first_agent = agents[0] if agents else {}
    first_pricing = sales.get('pricing_modelle', [{}])[0]
    
    return f"""# Quick Start Guide — {name}

*Generiert: {datetime.now().strftime('%d.%m.%Y')}*
*System: A-Impact Business OS v0.1*

---

## 🚀 Direktstart in 7 Tagen

### Tag 1 — Foundation
- [ ] Domain registrieren (Empfehlung: Namecheap oder Cloudflare)
- [ ] GitHub Repo anlegen (Monorepo-Struktur aus TECH_STACK.md)
- [ ] Vercel + Neon kostenlos einrichten
- [ ] .env.example → .env befüllen

### Tag 2 — Brand
- [ ] Logo erstellen (Canva oder Figma mit den Farben aus BRAND.json)
- [ ] LinkedIn Company Page anlegen
- [ ] Erste 3 Posts scheduled (aus MARKETING_PLAN.md)

### Tag 3-4 — MVP Tech
- [ ] Repo initalisieren mit empfohlenem Stack
- [ ] Basis Landing Page live schalten
- [ ] Ersten AI Agent aufsetzen: {first_agent.get('name', 'Voice Agent')}

### Tag 5 — Sales
- [ ] 10 erste Prospects recherchieren
- [ ] Cold Outreach starten (Template aus SALES.json)
- [ ] Calendly/Cal.com für Erstgespräche einrichten

### Tag 6-7 — Erste Kunden
- [ ] Feedback von 3 potenziellen Kunden einholen
- [ ] Pricing validieren: Starter bei {first_pricing.get('preis', '297 EUR/Mo')}
- [ ] Ersten Vertrag vorbereiten

---

## 📦 Was in diesem Paket enthalten ist

| Datei | Inhalt |
|-------|--------|
| BRAND.json | Namen, Farben, UVP, Positioning |
| MARKETING_PLAN.md | 90-Tage Plan, Woche für Woche |
| SALES.json | Pricing, Pitch, Einwände, Personas |
| TECH_STACK.json | Stack, Repo-Struktur, Timeline |
| AI_AGENTS.json | Alle empfohlenen Agents mit ROI |
| REVENUE_MODEL.md | Break-Even, Projektionen, KPIs |
| SOUL.md | AI-Operator Konfiguration |
| SALES_DECK.html | Präsentation für Kunden (öffne im Browser) |
| .env.example | Alle benötigten Umgebungsvariablen |

---

*Erstellt mit A-Impact Business OS — https://a-impact.io*
"""


def create_sales_deck_html(brand: dict, sales: dict, description: str) -> str:
    name = brand.get('empfehlung', 'Business')
    tagline = brand.get('empfohlene_tagline', '')
    uvp = brand.get('unique_value_proposition', '')
    color = brand.get('farben', {}).get('primaer', '#6366f1')
    accent = brand.get('farben', {}).get('akzent', '#a855f7')
    pitch = sales.get('sales_pitch_elevator', '')
    pricing = sales.get('pricing_modelle', [])
    positioning = brand.get('positioning', '')
    personas = sales.get('zielgruppe_personas', [])
    einwaende = sales.get('einwaende', [])
    cycle = sales.get('sales_cycle_tage', 14)
    deal_size = sales.get('deal_size_eur', 0)
    ltv = sales.get('ltv_eur', 0)
    
    pricing_html = ""
    for i, p in enumerate(pricing):
        features = "".join(f"<li>{f}</li>" for f in p.get('features', []))
        featured = ' featured' if i == 1 else ''
        pricing_html += f"""
        <div class="pricing-card{featured}">
            <div class="p-label">{p.get('name', '')}</div>
            <div class="price">{p.get('preis', '')}</div>
            <ul>{features}</ul>
        </div>"""
    
    objection_html = ""
    for e in einwaende[:3]:
        objection_html += f"""
        <div class="objection-card">
            <div class="obj-q">❓ {e.get('einwand','')}</div>
            <div class="obj-a">→ {e.get('antwort','')}</div>
        </div>"""
    
    persona_html = ""
    for p in personas[:2]:
        pains = "".join(f"<span>{pain}</span>" for pain in p.get('pain_points',[])[:3])
        persona_html += f"""
        <div class="persona-card">
            <div class="persona-name">{p.get('name','')}</div>
            <div class="persona-role">{p.get('rolle','')}</div>
            <div class="persona-pains">{pains}</div>
        </div>"""
    
    return f"""<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{name} — Sales Deck</title>
<style>
*{{box-sizing:border-box;margin:0;padding:0}}
body{{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#080b14;color:#c8d8f0;scroll-behavior:smooth}}
.slide{{min-height:100vh;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:80px 40px;text-align:center;border-bottom:1px solid #1a2640;position:relative}}
.slide:nth-child(even){{background:#0d1220}}
.slide-num{{position:absolute;top:24px;right:32px;font-size:12px;color:#2a3a5a;font-weight:600;letter-spacing:.1em}}
h1{{font-size:clamp(2.5rem,8vw,5rem);font-weight:900;color:#fff;margin-bottom:1rem;line-height:1.1}}
h2{{font-size:clamp(1.5rem,4vw,2.5rem);font-weight:800;color:#fff;margin-bottom:1.5rem}}
p{{font-size:1.15rem;color:#8090b0;max-width:720px;line-height:1.8;margin:0 auto}}
.accent{{color:{color}}}
.tagline{{font-size:1.4rem;color:#c8d8f0;margin-bottom:2.5rem;font-style:italic}}
.badge{{display:inline-flex;align-items:center;gap:8px;background:{color}18;border:1px solid {color}44;color:{color};padding:8px 20px;border-radius:99px;font-size:13px;margin-bottom:2rem;font-weight:600}}
.label{{font-size:11px;text-transform:uppercase;letter-spacing:.15em;color:{color};margin-bottom:12px;font-weight:700}}
.stat-row{{display:flex;gap:48px;justify-content:center;flex-wrap:wrap;margin-top:3rem}}
.stat{{text-align:center}}
.stat-num{{font-size:2.5rem;font-weight:900;color:{color}}}
.stat-label{{font-size:.85rem;color:#4a5a7a;margin-top:4px}}
.pricing-grid{{display:flex;gap:20px;margin-top:2.5rem;flex-wrap:wrap;justify-content:center}}
.pricing-card{{background:#0d1220;border:1px solid #1a2640;border-radius:20px;padding:32px;min-width:230px;text-align:left}}
.pricing-card.featured{{border-color:{color}66;background:{color}0a}}
.p-label{{font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:{color};margin-bottom:12px;font-weight:700}}
.price{{font-size:2rem;font-weight:900;color:#fff;margin-bottom:1rem}}
.pricing-card ul{{list-style:none}}
.pricing-card li{{color:#6070a0;padding:5px 0;font-size:.9rem;border-bottom:1px solid #1a2640}}
.pricing-card li::before{{content:"✓ ";color:{color}}}
.objection-grid{{display:grid;gap:16px;max-width:800px;width:100%;margin-top:2rem;text-align:left}}
.objection-card{{background:#0d1220;border:1px solid #1a2640;border-radius:16px;padding:20px}}
.obj-q{{font-weight:700;color:#fff;margin-bottom:8px}}
.obj-a{{color:#6070a0;font-size:.9rem;line-height:1.6}}
.persona-row{{display:flex;gap:20px;margin-top:2rem;flex-wrap:wrap;justify-content:center}}
.persona-card{{background:#0d1220;border:1px solid #1a2640;border-radius:16px;padding:24px;max-width:300px;text-align:left}}
.persona-name{{font-weight:800;color:#fff;margin-bottom:4px}}
.persona-role{{font-size:.85rem;color:{color};margin-bottom:12px}}
.persona-pains{{display:flex;flex-direction:column;gap:6px}}
.persona-pains span{{font-size:.85rem;color:#6070a0;padding:4px 0;border-bottom:1px solid #1a2640}}
.cta{{background:{color};color:#fff;padding:18px 48px;border-radius:99px;font-size:1.1rem;font-weight:700;text-decoration:none;display:inline-block;margin-top:2.5rem;transition:opacity .2s}}
.cta:hover{{opacity:.85}}
.kv-grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;max-width:800px;width:100%;margin-top:2rem}}
.kv{{background:#0d1220;border:1px solid #1a2640;border-radius:12px;padding:16px;text-align:left}}
.kv-label{{font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:#4a5a7a;margin-bottom:4px}}
.kv-val{{font-size:1.1rem;font-weight:700;color:#fff}}
footer{{text-align:center;padding:60px;color:#2a3a5a;font-size:.85rem;border-top:1px solid #1a2640}}
footer a{{color:#4a5a7a;text-decoration:none}}
</style>
</head>
<body>

<div class="slide">
  <div class="slide-num">01 / 06</div>
  <div class="badge">⚡ Powered by A-Impact Business OS</div>
  <h1><span class="accent">{name}</span></h1>
  <div class="tagline">"{tagline}"</div>
  <p>{description}</p>
  <div class="stat-row">
    <div class="stat"><div class="stat-num">{deal_size:,}€</div><div class="stat-label">Ø Deal-Größe</div></div>
    <div class="stat"><div class="stat-num">{cycle}</div><div class="stat-label">Sales Cycle (Tage)</div></div>
    <div class="stat"><div class="stat-num">{ltv:,}€</div><div class="stat-label">LTV pro Kunde</div></div>
  </div>
</div>

<div class="slide">
  <div class="slide-num">02 / 06</div>
  <div class="label">Das Problem</div>
  <h2>Warum jetzt?</h2>
  <p>{uvp}</p>
  {('<div class="persona-row">' + persona_html + '</div>') if persona_html else ''}
</div>

<div class="slide">
  <div class="slide-num">03 / 06</div>
  <div class="label">Die Lösung</div>
  <h2>Was wir bieten</h2>
  <p>{pitch}</p>
  <p style="margin-top:1.5rem;font-size:1rem;color:#4a5a7a">{positioning[:200] if positioning else ''}</p>
</div>

<div class="slide">
  <div class="slide-num">04 / 06</div>
  <div class="label">Pricing</div>
  <h2>Einfach starten</h2>
  <div class="pricing-grid">{pricing_html}</div>
</div>

<div class="slide">
  <div class="slide-num">05 / 06</div>
  <div class="label">Einwände</div>
  <h2>Häufige Fragen</h2>
  <div class="objection-grid">{objection_html if objection_html else '<p>Keine typischen Einwände identifiziert.</p>'}</div>
</div>

<div class="slide">
  <div class="slide-num">06 / 06</div>
  <div class="label">Next Steps</div>
  <h2>Bereit loszulegen?</h2>
  <p>20 Minuten. Kein Pitch. Nur ein ehrliches Gespräch ob das für euch passt.</p>
  <a href="https://a-impact.io" class="cta">Strategiegespräch buchen</a>
</div>

<footer>
  <strong>{name}</strong> | Erstellt mit A-Impact Business OS | {datetime.now().strftime('%d.%m.%Y')} | 
  <a href="https://a-impact.io">a-impact.io</a>
</footer>
</body>
</html>"""


def create_env_example(tech: dict, agents: list) -> str:
    env_vars = tech.get('env_variablen', [
        'DATABASE_URL', 'OPENAI_API_KEY', 'ANTHROPIC_API_KEY',
        'RESEND_API_KEY', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'
    ])
    
    lines = ["# .env.example — Alle benötigten Umgebungsvariablen", "# Kopiere diese Datei zu .env und fülle die Werte aus", ""]
    for var in env_vars:
        lines.append(f"{var}=")
    
    # Add AI agent keys
    lines.append("")
    lines.append("# AI Agent Keys")
    for agent in agents[:3]:
        tool = agent.get('tool', 'OPENAI')
        lines.append(f"# {agent.get('name', 'Agent')}")
        if 'anthropic' in tool.lower():
            lines.append("ANTHROPIC_API_KEY=")
        elif 'openai' in tool.lower():
            lines.append("OPENAI_API_KEY=")
    
    return "\n".join(lines)


def generate_pitch_md(brand: dict, sales: dict, description: str, qualifications: dict) -> str:
    """1-pager pitch document — for email or quick sharing."""
    name = brand.get('empfehlung', 'Business')
    tagline = brand.get('empfohlene_tagline', '')
    uvp = brand.get('unique_value_proposition', '')
    positioning = brand.get('positioning', '')
    pitch = sales.get('sales_pitch_elevator', '')
    pricing = sales.get('pricing_modelle', [])
    deal_size = sales.get('deal_size_eur', 0)
    zielgruppe = qualifications.get('zielgruppe', '')
    
    pricing_lines = ""
    for p in pricing:
        pricing_lines += f"- **{p.get('name','')}:** {p.get('preis','')} — {', '.join(p.get('features',[])[:3])}\n"
    
    return f"""# {name} — Pitch

**"{tagline}"**

---

## TL;DR
{pitch}

## Problem
{uvp}

## Positionierung
{positioning}

## Zielgruppe
{zielgruppe}

## Pricing
{pricing_lines}
**Ø Deal Size:** {deal_size:,}€ | **Sales Cycle:** {sales.get('sales_cycle_tage',14)} Tage

## Nächster Schritt
📅 Strategiegespräch (20 Min): https://cal.com/a-impact/strategy
📧 apex@a-impact.io | 🌐 https://a-impact.io

---
*Erstellt mit A-Impact Business OS · {datetime.now().strftime('%d.%m.%Y')}*
"""


def build_business(description: str, qualifications: dict) -> Path:
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    brand_slug = description[:30].lower().replace(" ", "-").replace(",", "")
    folder_name = f"business_{brand_slug}_{timestamp}"
    output_path = OUTPUT_DIR / folder_name
    output_path.mkdir(parents=True, exist_ok=True)
    
    print(f"\n🚀 Building Business Package...")
    print(f"📁 Output: {output_path}\n")
    
    # Generate all components
    brand = generate_brand(description, qualifications)
    marketing = generate_marketing_plan(description, brand, qualifications)
    sales = generate_sales_content(description, brand, qualifications)
    tech = generate_tech_stack(description, qualifications)
    agents = generate_ai_agents(description)
    revenue = generate_revenue_model(description, sales, qualifications)
    
    # Generate derived content
    print("  📄 Generiere Dokumente...")
    soul_md = generate_soul_md(brand, description, qualifications)
    quickstart = generate_quickstart(brand, tech, agents, sales)
    sales_deck = create_sales_deck_html(brand, sales, description)
    env_example = create_env_example(tech, agents)
    pitch_md = generate_pitch_md(brand, sales, description, qualifications)
    
    # Write all files
    print("  💾 Schreibe Dateien...")
    (output_path / "BRAND.json").write_text(json.dumps(brand, ensure_ascii=False, indent=2))
    (output_path / "MARKETING_PLAN.md").write_text(marketing)
    (output_path / "SALES.json").write_text(json.dumps(sales, ensure_ascii=False, indent=2))
    (output_path / "TECH_STACK.json").write_text(json.dumps(tech, ensure_ascii=False, indent=2))
    (output_path / "AI_AGENTS.json").write_text(json.dumps(agents, ensure_ascii=False, indent=2))
    (output_path / "REVENUE_MODEL.md").write_text(revenue)
    (output_path / "SOUL.md").write_text(soul_md)
    (output_path / "QUICK_START.md").write_text(quickstart)
    (output_path / "SALES_DECK.html").write_text(sales_deck)
    (output_path / ".env.example").write_text(env_example)
    (output_path / "PITCH.md").write_text(pitch_md)
    
    # Write business summary
    summary = {
        "generated_at": datetime.now().isoformat(),
        "description": description,
        "qualifications": qualifications,
        "brand_name": brand.get('empfehlung'),
        "tagline": brand.get('empfohlene_tagline'),
        "files_generated": [f.name for f in output_path.iterdir()],
        "powered_by": "A-Impact Business OS v0.1"
    }
    (output_path / "SUMMARY.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2))
    
    # Create ZIP
    print("  📦 Erstelle ZIP-Archiv...")
    zip_path = OUTPUT_DIR / f"{folder_name}.zip"
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        for file in output_path.iterdir():
            zf.write(file, file.name)
    
    print(f"\n✅ Business Package fertig!")
    print(f"📁 Ordner: {output_path}")
    print(f"📦 ZIP: {zip_path}")
    print(f"🏷️  Brand: {brand.get('empfehlung')} — \"{brand.get('empfohlene_tagline')}\"")
    
    return output_path


def interactive_mode():
    print("=" * 60)
    print("  A-Impact Business OS v0.1")
    print("  Powered by A-Impact / ALMPACT LTD")
    print("=" * 60)
    print()
    
    print("Beschreibe das Business (2-5 Sätze):")
    description = input("> ").strip()
    
    print("\n5 kurze Qualifikationsfragen:\n")
    
    print("1. Zielgruppe (z.B. 'Versicherungsmakler in DE, 10-50 MA'):")
    zielgruppe = input("> ").strip()
    
    print("2. Land/Region (z.B. 'DE', 'DACH', 'EU'):")
    land = input("> ").strip() or "DE"
    
    print("3. Budget für Start (z.B. 'niedrig <5K', 'mittel 5-20K', 'hoch >20K'):")
    budget = input("> ").strip() or "niedrig"
    
    print("4. Timeline für MVP (z.B. '4 Wochen', '3 Monate'):")
    timeline = input("> ").strip() or "3 Monate"
    
    print("5. Was macht dieses Business einzigartig? (Unique Edge):")
    unique_edge = input("> ").strip()
    
    qualifications = {
        "zielgruppe": zielgruppe,
        "land": land,
        "budget": budget,
        "timeline": timeline,
        "unique_edge": unique_edge
    }
    
    print("\n" + "=" * 60)
    output = build_business(description, qualifications)
    print("=" * 60)
    print(f"\n🎉 Fertig! Öffne {output}/QUICK_START.md um zu starten.")


def demo_mode():
    """Run with a pre-defined demo business for testing."""
    description = "AI Voice Agent Plattform für Versicherungsmakler in der DACH-Region. Automatisiert eingehende Anrufe, qualifiziert Leads und trägt sie ins CRM ein. Spart 40+ Stunden pro Monat im Front-Office."
    qualifications = {
        "zielgruppe": "Versicherungsmakler und -agenturen, 5-50 Mitarbeiter, DACH",
        "land": "DE",
        "budget": "niedrig <5K",
        "timeline": "6 Wochen",
        "unique_edge": "Erste Voice AI speziell für Versicherungsbranche, DSGVO-konform, auf Deutsch"
    }
    
    print("🎭 Demo-Modus: Versicherungs-Voice-Agent")
    print(f"📝 Business: {description[:80]}...")
    print()
    
    output = build_business(description, qualifications)
    return output


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--demo":
        demo_mode()
    else:
        interactive_mode()
