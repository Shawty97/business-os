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
    pitch = sales.get('sales_pitch_elevator', '')
    pricing = sales.get('pricing_modelle', [])
    
    pricing_html = ""
    for p in pricing:
        features = "".join(f"<li>{f}</li>" for f in p.get('features', []))
        pricing_html += f"""
        <div class="pricing-card">
            <h3>{p.get('name', '')}</h3>
            <div class="price">{p.get('preis', '')}</div>
            <ul>{features}</ul>
        </div>"""
    
    return f"""<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{name} — Sales Deck</title>
<style>
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f0f0f; color: #fff; }}
  .slide {{ min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 60px 40px; text-align: center; border-bottom: 1px solid #222; }}
  .slide:nth-child(even) {{ background: #161616; }}
  h1 {{ font-size: 3.5rem; font-weight: 800; color: {color}; margin-bottom: 1rem; }}
  h2 {{ font-size: 2rem; font-weight: 700; margin-bottom: 1.5rem; }}
  p {{ font-size: 1.2rem; color: #aaa; max-width: 700px; line-height: 1.7; }}
  .tagline {{ font-size: 1.5rem; color: #fff; margin-bottom: 2rem; }}
  .badge {{ background: {color}22; border: 1px solid {color}; color: {color}; padding: 6px 16px; border-radius: 99px; font-size: 0.85rem; display: inline-block; margin-bottom: 1rem; }}
  .pricing-grid {{ display: flex; gap: 24px; margin-top: 2rem; flex-wrap: wrap; justify-content: center; }}
  .pricing-card {{ background: #1a1a1a; border: 1px solid #333; border-radius: 16px; padding: 32px; min-width: 220px; text-align: left; }}
  .pricing-card h3 {{ color: {color}; margin-bottom: 0.5rem; }}
  .pricing-card .price {{ font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; }}
  .pricing-card ul {{ list-style: none; }}
  .pricing-card li {{ color: #aaa; padding: 4px 0; font-size: 0.9rem; }}
  .pricing-card li::before {{ content: "✓ "; color: {color}; }}
  .cta {{ background: {color}; color: #fff; padding: 16px 40px; border-radius: 99px; font-size: 1.1rem; font-weight: 600; text-decoration: none; display: inline-block; margin-top: 2rem; }}
  .label {{ font-size: 0.8rem; text-transform: uppercase; letter-spacing: 2px; color: {color}; margin-bottom: 0.5rem; }}
  footer {{ text-align: center; padding: 40px; color: #444; font-size: 0.85rem; }}
</style>
</head>
<body>

<div class="slide">
  <div class="badge">Powered by A-Impact Business OS</div>
  <h1>{name}</h1>
  <div class="tagline">{tagline}</div>
  <p>{description}</p>
</div>

<div class="slide">
  <div class="label">Das Problem</div>
  <h2>Warum jetzt?</h2>
  <p>{uvp}</p>
</div>

<div class="slide">
  <div class="label">Die Lösung</div>
  <h2>Was wir bieten</h2>
  <p>{pitch}</p>
</div>

<div class="slide">
  <div class="label">Pricing</div>
  <h2>Einfach starten</h2>
  <div class="pricing-grid">{pricing_html}</div>
</div>

<div class="slide">
  <div class="label">Next Steps</div>
  <h2>Lass uns sprechen</h2>
  <p>20 Minuten. Kein Pitch. Nur ehrlicher Austausch ob das für euch passt.</p>
  <a href="https://a-impact.io" class="cta">Jetzt Termin buchen</a>
</div>

<footer>
  {name} | Erstellt mit A-Impact Business OS v0.1 | {datetime.now().strftime('%d.%m.%Y')}
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
