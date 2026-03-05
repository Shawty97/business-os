"""
AI-Powered Daily Cycle — Each agent calls GPT-4o with real business context.
This is the 100x upgrade: agents don't just log actions, they THINK and ACT.
"""
import os
import json
import requests
from datetime import datetime
from pathlib import Path

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
MDT_URL = os.environ.get("MDT_URL", "http://localhost:8002")

def call_gpt(system: str, user: str, max_tokens: int = 800) -> str:
    """Call GPT-4o with a system + user prompt."""
    try:
        resp = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {OPENAI_API_KEY}", "Content-Type": "application/json"},
            json={"model": "gpt-4o", "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}], "max_tokens": max_tokens, "temperature": 0.7},
            timeout=30
        )
        return resp.json()["choices"][0]["message"]["content"]
    except Exception as e:
        return f"[AI Error: {e}]"


def run_ai_marketing(brand: dict, business_desc: str) -> dict:
    """Marketing Agent: Generate today's social media content."""
    name = brand.get("empfehlung", "Business")
    tagline = brand.get("empfohlene_tagline", "")
    uvp = brand.get("unique_value_proposition", "")
    
    result = call_gpt(
        f"Du bist der Marketing Agent von {name}. Dein Job: Täglicher Content der Aufmerksamkeit generiert.",
        f"Business: {name} — {tagline}\nUVP: {uvp}\nBeschreibung: {business_desc[:200]}\n\nErstelle für HEUTE:\n1. Einen LinkedIn Post (max 200 Wörter, Hook + Value + CTA)\n2. Einen Tweet/X Post (max 280 Zeichen)\n3. Eine Story-Idee (Instagram/TikTok, 1 Satz)\n\nDatum: {datetime.now().strftime('%d.%m.%Y')}",
    )
    return {"agent": "marketing", "action": "daily_content", "result": result}


def run_ai_sales(brand: dict, business_desc: str) -> dict:
    """Sales Agent: Identify prospects and create outreach."""
    name = brand.get("empfehlung", "Business")
    target = brand.get("positioning", "")
    
    result = call_gpt(
        f"Du bist der Sales Agent von {name}. Dein Job: Neue Leads finden und qualifizieren.",
        f"Business: {name}\nPositionierung: {target[:200]}\n\nErstelle:\n1. 3 ideale Kundenprofile (ICP) für heute\n2. Für jeden ICP: Eine personalisierte LinkedIn Nachricht (< 300 Zeichen)\n3. Qualifizierungsfrage (BANT)\n\nSei spezifisch, nicht generisch.",
    )
    return {"agent": "sales", "action": "prospect_outreach", "result": result}


def run_ai_analytics(brand: dict, actions_log: list) -> dict:
    """Analytics Agent: Analyze recent actions and create CEO briefing."""
    name = brand.get("empfehlung", "Business")
    recent = json.dumps(actions_log[-10:], ensure_ascii=False)[:500] if actions_log else "Keine bisherigen Aktionen"
    
    result = call_gpt(
        f"Du bist der Analytics Agent von {name}. Erstelle ein CEO Briefing basierend auf den bisherigen Aktionen.",
        f"Business: {name}\nBisherige Agent-Aktionen:\n{recent}\n\nErstelle:\n1. Status-Zusammenfassung (3 Bullet Points)\n2. Top 3 Prioritäten für morgen\n3. 1 Warnung/Risiko\n4. 1 Quick Win",
    )
    return {"agent": "analytics", "action": "ceo_briefing", "result": result}


def run_ai_support(brand: dict) -> dict:
    """Support Agent: Prepare FAQ and response templates."""
    name = brand.get("empfehlung", "Business")
    uvp = brand.get("unique_value_proposition", "")
    
    result = call_gpt(
        f"Du bist der Support Agent von {name}.",
        f"Business: {name}\nUVP: {uvp}\n\nErstelle 3 häufige Kundenanfragen mit perfekten Antworten:\n1. Preisanfrage\n2. Technische Frage\n3. Beschwerden/Kündigung\n\nJede Antwort: Empathisch, lösungsorientiert, max 3 Sätze.",
    )
    return {"agent": "support", "action": "faq_templates", "result": result}


def run_ai_finance(brand: dict, month: int = 1) -> dict:
    """Finance Agent: Revenue projection and cost analysis."""
    name = brand.get("empfehlung", "Business")
    
    result = call_gpt(
        f"Du bist der Finance Agent von {name}.",
        f"Business: {name}\nMonat: {month}\n\nErstelle:\n1. Umsatzprognose Monat {month} (konservativ/realistisch/optimistisch)\n2. Top 3 Kostenpositionen\n3. Break-Even Analyse (wann profitabel?)\n4. Cash-Flow Empfehlung\n\nSei realistisch, keine Fantasy-Zahlen.",
    )
    return {"agent": "finance", "action": "revenue_projection", "result": result}


def run_ai_ops(services: dict = None) -> dict:
    """Ops Agent: System health and automation recommendations."""
    result = call_gpt(
        "Du bist der Operations Agent. Dein Job: Prozesse optimieren und automatisieren.",
        f"Services: {json.dumps(services or {}, ensure_ascii=False)}\n\nErstelle:\n1. System Health Status (basierend auf Services)\n2. Top 3 Automatisierungsmöglichkeiten\n3. Nächster Optimierungsschritt\n\nPraktisch und umsetzbar.",
    )
    return {"agent": "ops", "action": "optimization_report", "result": result}


def run_full_ai_cycle(job_id: str, brand: dict, business_desc: str, actions_log: list) -> list:
    """Run ALL agents with real AI calls. This is the 100x upgrade."""
    results = []
    
    results.append(run_ai_marketing(brand, business_desc))
    results.append(run_ai_sales(brand, business_desc))
    results.append(run_ai_analytics(brand, actions_log))
    results.append(run_ai_support(brand))
    results.append(run_ai_finance(brand))
    results.append(run_ai_ops({"bos": "ok", "mdt": "ok", "colony": "live"}))
    
    return results
