import os
import uuid
import json
import threading
from pathlib import Path
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Business OS API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── State Storage (in-memory + JSON fallback) ──
JOB_STATE_DIR = Path("/tmp/business-os-jobs")
JOB_STATE_DIR.mkdir(exist_ok=True)

def set_state(job_id: str, data: dict):
    (JOB_STATE_DIR / f"{job_id}.json").write_text(json.dumps(data))

def get_state(job_id: str) -> dict | None:
    p = JOB_STATE_DIR / f"{job_id}.json"
    return json.loads(p.read_text()) if p.exists() else None


# ── Models ──
class BuildRequest(BaseModel):
    description: str
    niche: str = ""
    target_market: str = ""
    business_model: str = ""
    founder_name: str = ""

class AgentTaskRequest(BaseModel):
    business_id: str
    task: str
    context: dict = {}


# ── Background Job Runner ──
def run_build_job(job_id: str, req: BuildRequest):
    """Runs in background thread. No Redis/Celery needed."""
    try:
        set_state(job_id, {"status": "running", "progress": 5, "current_step": "Initialisiere..."})

        # Import here to avoid circular issues
        import sys
        sys.path.insert(0, str(Path(__file__).parent))

        # Load existing business_os.py if it exists
        bos_path = Path(__file__).parent / "business_os.py"
        workspace_bos = Path("/root/.openclaw/workspace/business-os/business_os.py")

        if bos_path.exists():
            import business_os as bos
        elif workspace_bos.exists():
            import importlib.util
            spec = importlib.util.spec_from_file_location("business_os", workspace_bos)
            bos = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(bos)
        else:
            raise FileNotFoundError("business_os.py nicht gefunden")

        set_state(job_id, {"status": "running", "progress": 15, "current_step": "Generiere Brand..."})
        description = req.description
        if req.niche:
            description += f" | Nische: {req.niche}"
        if req.target_market:
            description += f" | Zielmarkt: {req.target_market}"
        if req.business_model:
            description += f" | Modell: {req.business_model}"

        qualifications = {
            "niche": req.niche,
            "target_market": req.target_market,
            "business_model": req.business_model,
            "founder_name": req.founder_name,
        }

        set_state(job_id, {"status": "running", "progress": 30, "current_step": "Erstelle Inhalte mit AI..."})

        output_path = bos.build_business(description, qualifications)

        set_state(job_id, {"status": "running", "progress": 85, "current_step": "Erstelle ZIP-Archiv..."})

        # Read brand name
        brand_json_path = output_path / "BRAND.json"
        if brand_json_path.exists():
            brand_data = json.loads(brand_json_path.read_text())
            brand_name = brand_data.get("empfehlung", brand_data.get("name", "Business"))
            tagline = brand_data.get("empfohlene_tagline", brand_data.get("tagline", ""))
        else:
            brand_name = req.description[:30]
            tagline = ""

        zip_path = output_path.parent / f"{output_path.name}.zip"
        import shutil
        if not zip_path.exists():
            shutil.make_archive(str(output_path), 'zip', str(output_path))

        files = [f.name for f in output_path.iterdir() if f.is_file()]

        set_state(job_id, {
            "status": "done",
            "progress": 100,
            "current_step": "Fertig! ✅",
            "brand_name": brand_name,
            "tagline": tagline,
            "output_dir": str(output_path),
            "zip_path": str(zip_path),
            "files": files,
        })

    except Exception as e:
        import traceback
        set_state(job_id, {
            "status": "failed",
            "progress": 0,
            "current_step": f"Fehler: {str(e)}",
            "error": traceback.format_exc()
        })


# ── ROUTES ──

@app.get("/")
def health():
    return {"status": "ok", "service": "Business OS v2"}

@app.post("/api/jobs")
def create_job(req: BuildRequest):
    job_id = str(uuid.uuid4())
    set_state(job_id, {"status": "pending", "progress": 0, "current_step": "Warte auf Start..."})

    # Run in background thread (no Redis/Celery needed)
    t = threading.Thread(target=run_build_job, args=(job_id, req), daemon=True)
    t.start()

    return {
        "job_id": job_id,
        "status": "pending",
        "estimated_minutes": 3,
        "message": "Business wird gebaut... 🚀"
    }

@app.get("/api/jobs/{job_id}/status")
def get_job_status(job_id: str):
    state = get_state(job_id)
    if not state:
        raise HTTPException(status_code=404, detail="Job nicht gefunden")
    return {
        "job_id": job_id,
        "status": state.get("status", "unknown"),
        "progress": state.get("progress", 0),
        "current_step": state.get("current_step", ""),
        "error": state.get("error"),
    }

@app.get("/api/jobs/{job_id}/result")
def get_job_result(job_id: str):
    state = get_state(job_id)
    if not state:
        raise HTTPException(status_code=404, detail="Job nicht gefunden")
    if state.get("status") != "done":
        raise HTTPException(status_code=202, detail=f"Job noch nicht fertig: {state.get('status')}")
    return {
        "job_id": job_id,
        "brand_name": state.get("brand_name", ""),
        "tagline": state.get("tagline", ""),
        "files": state.get("files", []),
        "zip_url": f"/api/jobs/{job_id}/download",
    }

@app.get("/api/jobs/{job_id}/download")
def download_zip(job_id: str):
    state = get_state(job_id)
    if not state or state.get("status") != "done":
        raise HTTPException(status_code=404, detail="Job nicht fertig")
    zip_path = state.get("zip_path")
    if not zip_path or not Path(zip_path).exists():
        raise HTTPException(status_code=404, detail="ZIP nicht gefunden")
    brand = state.get("brand_name", "business").lower().replace(" ", "-")
    return FileResponse(zip_path, media_type="application/zip", filename=f"{brand}-paket.zip")


# ── AI AGENTS (echte Endpoints) ──

@app.post("/api/agents/sales")
def sales_agent(req: AgentTaskRequest):
    """Sales Agent: Lead qualifizieren, Follow-Up schreiben"""
    from openai import OpenAI
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

    prompt = f"""Du bist ein erfahrener B2B Sales Agent für {req.context.get('business_name', 'ein Unternehmen')}.
    
Aufgabe: {req.task}
Kontext: {json.dumps(req.context, ensure_ascii=False)}

Führe die Aufgabe professionell aus. Antworte auf Deutsch."""

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1000
    )

    return {
        "agent": "sales",
        "task": req.task,
        "result": response.choices[0].message.content,
        "business_id": req.business_id
    }

@app.post("/api/agents/marketing")
def marketing_agent(req: AgentTaskRequest):
    """Marketing Agent: Content erstellen, Kampagnen planen"""
    from openai import OpenAI
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

    prompt = f"""Du bist ein Senior Marketing Manager für {req.context.get('business_name', 'ein Unternehmen')} in der Nische {req.context.get('niche', '')}.

Aufgabe: {req.task}
Kontext: {json.dumps(req.context, ensure_ascii=False)}

Erstelle professionellen Marketing-Content auf Deutsch."""

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1500
    )

    return {
        "agent": "marketing",
        "task": req.task,
        "result": response.choices[0].message.content,
        "business_id": req.business_id
    }

@app.post("/api/agents/support")
def support_agent(req: AgentTaskRequest):
    """Support Agent: Kundenanfragen beantworten"""
    from openai import OpenAI
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

    prompt = f"""Du bist ein freundlicher Customer Support Agent für {req.context.get('business_name', 'unser Unternehmen')}.

Kundenanfrage: {req.task}
Produkt/Service Kontext: {json.dumps(req.context, ensure_ascii=False)}

Beantworte die Anfrage hilfreich, professionell und auf Deutsch."""

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=800
    )

    return {
        "agent": "support",
        "customer_query": req.task,
        "response": response.choices[0].message.content,
        "business_id": req.business_id
    }

@app.post("/api/agents/analytics")
def analytics_agent(req: AgentTaskRequest):
    """Analytics Agent: KPIs analysieren, CEO-Briefing generieren"""
    from openai import OpenAI
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

    metrics = req.context.get("metrics", {})
    business_name = req.context.get("business_name", "das Unternehmen")

    prompt = f"""Du bist ein Business Analytics Agent. Erstelle ein prägnantes CEO-Briefing für {business_name}.

Aktuelle Metriken: {json.dumps(metrics, ensure_ascii=False)}
Zeitraum: {req.context.get('period', 'heute')}
Aufgabe: {req.task}

Format:
- TOP 3 Highlights
- TOP 3 Probleme / Risiken  
- 3 empfohlene Maßnahmen für heute
- Kurze Prognose

Kurz und direkt. Kein Bullshit."""

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1000
    )

    return {
        "agent": "analytics",
        "briefing": response.choices[0].message.content,
        "period": req.context.get("period", "heute"),
        "business_id": req.business_id
    }

@app.get("/api/agents/status/{business_id}")
def agents_status(business_id: str):
    """Status aller Agents für ein Business"""
    return {
        "business_id": business_id,
        "agents": [
            {"name": "sales", "status": "active", "endpoint": "/api/agents/sales"},
            {"name": "marketing", "status": "active", "endpoint": "/api/agents/marketing"},
            {"name": "support", "status": "active", "endpoint": "/api/agents/support"},
            {"name": "analytics", "status": "active", "endpoint": "/api/agents/analytics"},
        ],
        "message": "Alle Agents bereit. POST mit task + context."
    }


# ── DECISION QUEUE — The Unique Feature ────────────────────────────────
import uuid as _uuid_mod
import time as _time_mod

_decisions: dict = {}  # {business_id: [{id, title, desc, options, agent, urgency, status, created_at}]}

class DecisionSubmit(BaseModel):
    title: str
    description: str
    options: list[str] = ["Ja, umsetzen", "Nein, überspringen", "Später entscheiden"]
    agent: str = "analytics"
    urgency: str = "medium"  # high | medium | low

class DecisionResolve(BaseModel):
    chosen_option: str
    note: str = ""

@app.post("/api/decisions/{business_id}")
def submit_decision(business_id: str, req: DecisionSubmit):
    """Agent submits a decision for the CEO to make."""
    if business_id not in _decisions:
        _decisions[business_id] = []
    decision = {
        "id": str(_uuid_mod.uuid4())[:8],
        "title": req.title,
        "description": req.description,
        "options": req.options,
        "agent": req.agent,
        "urgency": req.urgency,
        "status": "open",
        "created_at": _time_mod.strftime("%Y-%m-%d %H:%M"),
    }
    _decisions[business_id].append(decision)
    return {"decision_id": decision["id"], "status": "queued"}

@app.get("/api/decisions/{business_id}")
def get_decisions(business_id: str):
    """Get all open decisions for a business."""
    all_d = _decisions.get(business_id, [])
    open_d = [d for d in all_d if d["status"] == "open"]
    resolved = [d for d in all_d if d["status"] == "resolved"]
    return {
        "business_id": business_id,
        "decisions": open_d,
        "resolved_count": len(resolved),
        "total": len(all_d),
    }

@app.patch("/api/decisions/{business_id}/{decision_id}")
def resolve_decision(business_id: str, decision_id: str, req: DecisionResolve):
    """CEO resolves a decision."""
    for d in _decisions.get(business_id, []):
        if d["id"] == decision_id:
            d["status"] = "resolved"
            d["chosen_option"] = req.chosen_option
            d["resolved_at"] = _time_mod.strftime("%Y-%m-%d %H:%M")
            return {"status": "resolved", "chosen": req.chosen_option}
    raise HTTPException(status_code=404, detail="Decision not found")

@app.get("/api/businesses/{business_id}/agents")
def get_business_agents(business_id: str):
    """Status of all 6 agents for a business."""
    open_decisions = len([d for d in _decisions.get(business_id, []) if d["status"] == "open"])
    return {
        "business_id": business_id,
        "agents": [
            {"name": "Sales", "icon": "🎯", "status": "active", "endpoint": "/api/agents/sales"},
            {"name": "Marketing", "icon": "📢", "status": "active", "endpoint": "/api/agents/marketing"},
            {"name": "Support", "icon": "💬", "status": "active", "endpoint": "/api/agents/support"},
            {"name": "Analytics", "icon": "📊", "status": "active", "endpoint": "/api/agents/analytics"},
            {"name": "Finance", "icon": "💰", "status": "active", "endpoint": "/api/agents/finance"},
            {"name": "Ops", "icon": "⚡", "status": "active", "endpoint": "/api/agents/ops"},
        ],
        "open_decisions": open_decisions,
        "dashboard_url": f"/dashboard/{business_id}",
    }


@app.post("/api/agents/finance")
def finance_agent(req: AgentTaskRequest):
    """Finance Agent: Invoicing, Revenue Tracking, P&L"""
    from openai import OpenAI
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
    prompt = f"""Du bist ein präziser Finance Agent für {req.context.get('business_name', 'ein Unternehmen')}.
Aufgabe: {req.task}
Finanzdaten: {json.dumps(req.context, ensure_ascii=False)}
Erstelle einen klaren Finance-Report auf Deutsch. Format: Übersicht → Details → Empfehlungen → Nächste Schritte"""
    r = client.chat.completions.create(model="gpt-4o", messages=[{"role":"user","content":prompt}], max_tokens=800)
    return {"agent":"finance","result":r.choices[0].message.content,"business_id":req.business_id}

@app.post("/api/agents/ops")
def ops_agent(req: AgentTaskRequest):
    """Ops Agent: Process Automation, Integration Management"""
    from openai import OpenAI
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
    prompt = f"""Du bist ein Ops & Automation Agent für {req.context.get('business_name', 'ein Unternehmen')}.
Aufgabe: {req.task}
Kontext: {json.dumps(req.context, ensure_ascii=False)}
Optimiere Prozesse, schlage Automationen vor, löse Integrationsthemen. Antworte auf Deutsch."""
    r = client.chat.completions.create(model="gpt-4o", messages=[{"role":"user","content":prompt}], max_tokens=800)
    return {"agent":"ops","result":r.choices[0].message.content,"business_id":req.business_id}
