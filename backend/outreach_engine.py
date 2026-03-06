"""
BOS Outreach Engine — Automated lead generation & cold email drafting.
When a business is created, this engine finds relevant leads and drafts personalized outreach.
"""
import json
import os
from datetime import datetime

LEADS_FILE = os.path.join(os.path.dirname(__file__), "..", "..", "business", "leads-all-verticals-2026-03-05.json")
OPENAI_KEY = os.environ.get("OPENAI_API_KEY", "")


def find_matching_leads(vertical: str, country: str = "DE", limit: int = 10) -> list:
    """Find leads matching a business vertical and country."""
    try:
        with open(LEADS_FILE) as f:
            all_leads = json.load(f)
    except Exception:
        return []
    
    # Fuzzy match vertical
    vertical_lower = vertical.lower()
    vertical_map = {
        "versicherung": "Insurance",
        "insurance": "Insurance",
        "auto": "Automotive",
        "automotive": "Automotive",
        "kfz": "Automotive",
        "immobilien": "Immobilien",
        "real estate": "Immobilien",
        "makler": "Immobilien",
        "zahnarzt": "Orthopädie",
        "arzt": "Orthopädie",
        "praxis": "Orthopädie",
        "orthopädie": "Orthopädie",
        "callcenter": "Callcenter",
        "call center": "Callcenter",
        "coach": "Coaches",
        "coaching": "Coaches",
        "beratung": "Coaches",
    }
    
    matched_vertical = None
    for key, val in vertical_map.items():
        if key in vertical_lower:
            matched_vertical = val
            break
    
    matches = []
    for lead in all_leads:
        score = 0
        if matched_vertical and lead.get("vertical") == matched_vertical:
            score += 3
        if lead.get("country", "").upper() == country.upper():
            score += 2
        if score >= 3:
            lead["match_score"] = score
            matches.append(lead)
    
    # Sort by score, return top N
    matches.sort(key=lambda x: x.get("match_score", 0), reverse=True)
    return matches[:limit]


def draft_outreach_for_business(brand_name: str, tagline: str, description: str, leads: list) -> list:
    """Draft personalized cold emails for matched leads using GPT-4o."""
    if not leads or not OPENAI_KEY:
        return []
    
    import requests
    
    emails = []
    # Batch — send all leads in one GPT call
    lead_summaries = "\n".join([
        f"- {l.get('company','?')} ({l.get('city','?')}, {l.get('country','?')}): {l.get('pain_point','')[:80]}"
        for l in leads[:10]
    ])
    
    try:
        resp = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {OPENAI_KEY}", "Content-Type": "application/json"},
            json={
                "model": "gpt-4o",
                "max_tokens": 3000,
                "messages": [
                    {"role": "system", "content": f"Du bist ein Top-Sales-Experte. Du schreibst Cold Emails die geöffnet und beantwortet werden. Firma: {brand_name} — {tagline}"},
                    {"role": "user", "content": f"""Schreibe für JEDE der folgenden Firmen eine personalisierte Cold Email.

Unser Produkt: {brand_name} — {description[:200]}

Leads:
{lead_summaries}

Format pro Email:
---
AN: [Firma]
BETREFF: [max 50 Zeichen, personalisiert]
EMAIL:
[Max 150 Wörter. Hook → Pain → Lösung → CTA. Kein Fluff.]
---

Schreibe alle Emails jetzt."""}
                ]
            },
            timeout=60
        )
        if resp.status_code == 200:
            content = resp.json()["choices"][0]["message"]["content"]
            return [{"type": "outreach_batch", "emails": content, "lead_count": len(leads)}]
    except Exception as e:
        return [{"error": str(e)}]
    
    return emails


def generate_outreach_package(job_data: dict) -> dict:
    """Full outreach package for a completed BOS job."""
    brand_name = job_data.get("brand_name", "")
    tagline = job_data.get("tagline", "")
    description = job_data.get("description", "")
    country = job_data.get("qualifications", {}).get("land", "DE")
    
    # Find matching leads
    leads = find_matching_leads(description, country, limit=10)
    
    # Draft emails
    emails = []
    if leads:
        emails = draft_outreach_for_business(brand_name, tagline, description, leads)
    
    return {
        "generated_at": datetime.now().isoformat(),
        "brand": brand_name,
        "matching_leads": len(leads),
        "leads": leads,
        "outreach_emails": emails,
    }
