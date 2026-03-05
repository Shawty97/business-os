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

    briefing_text = response.choices[0].message.content

    # Auto-generate decisions for the Decision Queue
    decision_prompt = f"""Basierend auf diesem CEO-Briefing, erstelle 2 konkrete Entscheidungen die der CEO treffen muss.

Briefing:
{briefing_text}

Antworte NUR als JSON-Array mit genau 2 Objekten:
[
  {{"title": "kurzer Titel", "description": "1 Satz Erklärung", "options": ["Option A", "Option B", "Option C"], "urgency": "high|medium|low"}},
  {{"title": "...", "description": "...", "options": ["...", "...", "..."], "urgency": "..."}}
]"""

    dec_response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": decision_prompt}],
        max_tokens=600,
    )

    try:
        dec_raw = dec_response.choices[0].message.content
        # Extract JSON array from response
        import re as _re
        arr_match = _re.search(r'\[.*\]', dec_raw, _re.DOTALL)
        if arr_match:
            decisions_list = json.loads(arr_match.group())
        else:
            decisions_list = json.loads(dec_raw) if dec_raw.strip().startswith('[') else []
        if isinstance(decisions_list, dict):
            decisions_list = decisions_list.get("decisions", decisions_list.get("items", []))

        if req.business_id not in _decisions:
            _decisions[req.business_id] = []

        for d in decisions_list[:2]:
            import uuid as _u
            import time as _t
            _decisions[req.business_id].append({
                "id": str(_u.uuid4())[:8],
                "title": d.get("title", "Entscheidung erforderlich"),
                "description": d.get("description", ""),
                "options": d.get("options", ["Ja", "Nein", "Später"]),
                "agent": "analytics",
                "urgency": d.get("urgency", "medium"),
                "status": "open",
                "created_at": _t.strftime("%Y-%m-%d %H:%M"),
            })
        decisions_created = len(decisions_list[:2])
    except Exception:
        decisions_created = 0

    return {
        "agent": "analytics",
        "briefing": briefing_text,
        "period": req.context.get("period", "heute"),
        "business_id": req.business_id,
        "decisions_created": decisions_created,
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


# ── BOS v3 — VERCEL DEPLOY API ──────────────────────────────────────────
# Stufe 2: Nicht nur Dokumente — echte Landing Page deployen

import subprocess as _subprocess
import tempfile as _tempfile
import shutil as _shutil

class DeployRequest(BaseModel):
    business_id: str
    brand_name: str
    tagline: str
    niche: str
    target_market: str
    business_model: str
    primary_color: str = "#6366f1"  # indigo default
    founder_name: str = ""
    founder_email: str = ""  # for auto welcome email after deploy

class DeployStatus(BaseModel):
    business_id: str
    deploy_status: str  # pending | building | live | failed
    url: str = ""
    error: str = ""

_deploy_state: dict = {}

@app.post("/api/v3/deploy")
async def deploy_business_landing(req: DeployRequest, background_tasks: BackgroundTasks):
    """BOS v3: Deploy a real landing page for the business to Vercel."""
    _deploy_state[req.business_id] = {
        "deploy_status": "pending",
        "url": "",
        "error": ""
    }
    background_tasks.add_task(_run_deploy, req)
    return {
        "business_id": req.business_id,
        "deploy_status": "pending",
        "message": f"Landing Page für '{req.brand_name}' wird deployed...",
        "status_url": f"/api/v3/deploy/{req.business_id}/status"
    }

@app.get("/api/v3/deploy/{business_id}/status")
def get_deploy_status(business_id: str):
    state = _deploy_state.get(business_id, {"deploy_status": "not_found", "url": "", "error": ""})
    return {"business_id": business_id, **state}

def _run_deploy(req: DeployRequest):
    """Background: Generate Next.js landing page and deploy to Vercel."""
    try:
        _deploy_state[req.business_id] = {"deploy_status": "building", "url": "", "error": ""}

        # Build landing page HTML/Next.js
        landing_html = _generate_landing_page(req)

        # Create temp Next.js project
        tmpdir = _tempfile.mkdtemp(prefix="bos-deploy-")
        try:
            # Write package.json
            (Path(tmpdir) / "package.json").write_text(json.dumps({
                "name": req.brand_name.lower().replace(" ", "-"),
                "version": "1.0.0",
                "private": True,
                "scripts": {"build": "next build", "start": "next start"},
                "dependencies": {"next": "15.3.9", "react": "^19.0.0", "react-dom": "^19.0.0"}
            }, indent=2))

            # Write pages
            (Path(tmpdir) / "app").mkdir()
            (Path(tmpdir) / "app" / "page.tsx").write_text(landing_html)
            (Path(tmpdir) / "app" / "layout.tsx").write_text(
                f'export default function Layout({{children}}: {{children: React.ReactNode}}) {{\n'
                f'  return (<html lang="de"><body style={{{{fontFamily: "system-ui, sans-serif", margin: 0, background: "#0a0a0a", color: "white"}}}}>'
                f'{{children}}</body></html>)\n}}'
            )

            # Deploy via Vercel API (file-based deploy)
            vercel_token = os.environ.get("VERCEL_TOKEN", "")
            team_id = "team_R4HVIrNbSOlLtqfrBwYqiZgO"
            project_name = f"biz-{req.business_id[:8]}"

            files = []
            for f in Path(tmpdir).rglob("*"):
                if f.is_file():
                    rel = str(f.relative_to(tmpdir))
                    content = f.read_text()
                    files.append({"file": rel, "data": content})

            import urllib.request
            deploy_payload = json.dumps({
                "name": project_name,
                "files": files,
                "projectSettings": {"framework": "nextjs"},
                "target": "production"
            }).encode()

            req_obj = urllib.request.Request(
                f"https://api.vercel.com/v13/deployments?teamId={team_id}",
                data=deploy_payload,
                headers={
                    "Authorization": f"Bearer {vercel_token}",
                    "Content-Type": "application/json"
                },
                method="POST"
            )
            with urllib.request.urlopen(req_obj, timeout=60) as resp:
                deploy_data = json.loads(resp.read())

            deploy_url = f"https://{deploy_data.get('url', '')}"
            _deploy_state[req.business_id] = {
                "deploy_status": "live",
                "url": deploy_url,
                "vercel_id": deploy_data.get("id", ""),
                "error": ""
            }

            # Auto-send welcome email if founder_email provided
            if req.founder_email:
                try:
                    _send_welcome_auto(
                        business_id=req.business_id,
                        brand_name=req.brand_name,
                        founder_email=req.founder_email,
                        founder_name=req.founder_name,
                        landing_url=deploy_url,
                        tagline=req.tagline,
                    )
                except Exception:
                    pass  # Don't fail deploy if email fails

        finally:
            _shutil.rmtree(tmpdir, ignore_errors=True)

    except Exception as e:
        import traceback
        _deploy_state[req.business_id] = {
            "deploy_status": "failed",
            "url": "",
            "error": str(e)
        }

def _generate_landing_page(req: DeployRequest) -> str:
    """Generate a Next.js page.tsx for the business landing page."""
    brand = req.brand_name.replace("'", "").replace('"', '')
    tagline = req.tagline.replace("'", "").replace('"', '')
    niche = req.niche.replace("'", "").replace('"', '')
    market = req.target_market.replace("'", "").replace('"', '')
    model = req.business_model.replace("'", "").replace('"', '')
    color = req.primary_color

    lines = [
        "export default function Page() {",
        "  return (",
        '    <main style={{fontFamily:"system-ui,sans-serif",textAlign:"center",padding:"80px 24px",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>',
        f'      <div style={{{{color:"{color}",fontWeight:600,marginBottom:"24px"}}}}>Powered by A-Impact &#xB7; AI Business OS</div>',
        f'      <h1 style={{{{fontSize:"clamp(36px,8vw,64px)",fontWeight:900,marginBottom:"16px"}}}}>{brand}</h1>',
        f'      <p style={{{{fontSize:"20px",color:"#888",maxWidth:"500px",lineHeight:1.6,marginBottom:"40px"}}}}>{tagline}</p>',
        f'      <a href="#contact" style={{{{background:"{color}",color:"white",padding:"16px 40px",borderRadius:"12px",fontSize:"18px",fontWeight:700,textDecoration:"none",display:"inline-block"}}}}>Jetzt starten &#x2192;</a>',
        '      <div style={{marginTop:"64px",display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"16px",maxWidth:"700px",width:"100%"}}>',
        f'        <div style={{{{background:"#111",border:"1px solid #222",borderRadius:"12px",padding:"20px"}}}}><div>&#x1F3AF; <b>Nische</b></div><div style={{{{color:"#888",fontSize:"14px"}}}}>{niche}</div></div>',
        f'        <div style={{{{background:"#111",border:"1px solid #222",borderRadius:"12px",padding:"20px"}}}}><div>&#x1F465; <b>Zielmarkt</b></div><div style={{{{color:"#888",fontSize:"14px"}}}}>{market}</div></div>',
        f'        <div style={{{{background:"#111",border:"1px solid #222",borderRadius:"12px",padding:"20px"}}}}><div>&#x1F4B0; <b>Modell</b></div><div style={{{{color:"#888",fontSize:"14px"}}}}>{model}</div></div>',
        "      </div>",
        '      <p style={{color:"#444",fontSize:"13px",marginTop:"80px"}}>Built with A-Impact Business OS &#xB7; ALMPACT LTD</p>',
        "    </main>",
        "  )",
        "}",
    ]
    return "\n".join(lines) + "\n"



# ── Cal.com Integration ──────────────────────────────────────────────────

class CalBookingRequest(BaseModel):
    business_id: str
    brand_name: str
    founder_email: str
    founder_name: str = ""
    meeting_type: str = "strategy-call"  # strategy-call | onboarding | support

@app.post("/api/v3/book-call")
def book_strategy_call(req: CalBookingRequest):
    """Returns Cal.com booking URL for strategy call with A-Impact team."""
    # Cal.com booking links (A-Impact team)
    cal_links = {
        "strategy-call": "https://cal.com/a-impact/strategy",
        "onboarding": "https://cal.com/a-impact/onboarding",
        "support": "https://cal.com/a-impact/support",
    }
    base_url = cal_links.get(req.meeting_type, cal_links["strategy-call"])
    
    # Pre-fill Cal.com form via URL params
    import urllib.parse
    params = {
        "name": req.founder_name or req.brand_name,
        "email": req.founder_email,
        "notes": f"Business OS Kunde: {req.brand_name} (ID: {req.business_id})",
    }
    booking_url = f"{base_url}?{urllib.parse.urlencode(params)}"
    
    return {
        "booking_url": booking_url,
        "meeting_type": req.meeting_type,
        "business_id": req.business_id,
        "embed_url": f"https://cal.com/embed?calLink={urllib.parse.quote(base_url)}",
        "message": f"Termin buchen für {req.brand_name}"
    }

@app.get("/api/v3/cal-embed/{business_id}")
def get_cal_embed(business_id: str, meeting_type: str = "strategy-call"):
    """Returns Cal.com embed script for inline booking."""
    cal_links = {
        "strategy-call": "a-impact/strategy",
        "onboarding": "a-impact/onboarding",
    }
    cal_link = cal_links.get(meeting_type, "a-impact/strategy")
    
    embed_script = f"""<script type="text/javascript">
(function (C, A, L) {{ 
  let p = function (a, ar) {{ a.q.push(ar); }};
  let d = C.document;
  C.Cal = C.Cal || function () {{ let cal = C.Cal; let ar = arguments; if (!cal.loaded) {{ cal.ns = {{}}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; }} if (ar[0] === L) {{ const api = function () {{ p(api, arguments); }}; const namespace = ar[1]; api.q = api.q || []; typeof namespace === "string" ? (cal.ns[namespace] = api) && p(api, ar) : p(cal, ar); return; }} p(cal, ar); }};
}})(window, "https://app.cal.com/embed/embed.js", "init");
Cal("init", "a-impact", {{origin:"https://cal.com"}});
Cal.ns["a-impact"]("inline", {{
  elementOrSelector:"#cal-booking-{business_id}",
  config: {{"layout":"month_view"}},
  calLink: "{cal_link}",
}});
</script>
<div id="cal-booking-{business_id}" style="width:100%;height:500px;"></div>"""
    
    return {
        "business_id": business_id,
        "embed_html": embed_script,
        "cal_link": cal_link,
    }


# ── RESEND Email Integration ────────────────────────────────────────────

class WelcomeEmailRequest(BaseModel):
    business_id: str
    brand_name: str
    founder_email: str
    founder_name: str = ""
    landing_url: str = ""
    tagline: str = ""

@app.post("/api/v3/send-welcome")
def send_welcome_email(req: WelcomeEmailRequest):
    """Send welcome email sequence via RESEND after business deploy."""
    import urllib.request
    
    resend_key = os.environ.get("RESEND_API_KEY", "")
    if not resend_key:
        return {"status": "skipped", "reason": "RESEND_API_KEY not configured"}
    
    html_body = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
body {{font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a0a; color: #fff; margin: 0; padding: 0;}}
.container {{max-width: 600px; margin: 0 auto; padding: 40px 24px;}}
.badge {{display: inline-block; background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.3); color: #818cf8; font-size: 13px; padding: 6px 16px; border-radius: 20px; margin-bottom: 24px;}}
h1 {{font-size: 28px; font-weight: 900; margin: 0 0 12px;}}
p {{color: #888; line-height: 1.6; margin: 0 0 16px;}}
.cta {{display: inline-block; background: #4f46e5; color: white; font-weight: 700; padding: 14px 28px; border-radius: 10px; text-decoration: none; margin: 8px 0;}}
.box {{background: #111; border: 1px solid #222; border-radius: 12px; padding: 20px; margin: 20px 0;}}
.footer {{color: #444; font-size: 12px; margin-top: 40px;}}
</style></head>
<body>
<div class="container">
  <div class="badge">⚡ A-Impact Business OS</div>
  <h1>Dein Business ist ready, {req.founder_name or req.brand_name}!</h1>
  <p>Wir haben <strong>{req.brand_name}</strong> für dich aufgebaut. Hier ist alles was du jetzt hast:</p>
  
  <div class="box">
    <p style="color:#fff; font-weight:600; margin-bottom:8px;">✅ Was deployed wurde:</p>
    <p>🎨 Vollständiges Brand-Paket<br>
    📢 90-Tage Marketing-Plan<br>
    💰 Sales Deck (ready zum Versenden)<br>
    🤖 AI-Agents konfiguriert (Sales, Marketing, Support, Analytics)<br>
    {f"🌐 Landing Page live: {req.landing_url}" if req.landing_url else ""}</p>
  </div>
  
  {f'<a href="{req.landing_url}" class="cta">🌐 Landing Page ansehen →</a><br>' if req.landing_url else ''}
  <a href="https://business-os-git-main-ai-mpact.vercel.app/dashboard/{req.business_id}" class="cta" style="background:#1a1a1a; border: 1px solid #333;">⚡ CEO Dashboard öffnen</a>
  
  <p style="margin-top:24px;">Deine nächsten Schritte:</p>
  <p>1. <strong>CEO Briefing generieren</strong> — sehen was deine Agents empfehlen<br>
  2. <strong>Decision Queue</strong> — erste Entscheidungen treffen<br>
  3. <strong>Sales Deck teilen</strong> — erste Kunden kontaktieren</p>
  
  <p>Fragen? Antworte einfach auf diese Email.<br>
  Oder buch ein Strategy Call: <a href="https://cal.com/a-impact/strategy" style="color:#818cf8;">cal.com/a-impact/strategy</a></p>
  
  <div class="footer">
    A-Impact · ALMPACT LTD · Paphos, Cyprus<br>
    Business OS by A-Impact | <a href="#" style="color:#444;">Unsubscribe</a>
  </div>
</div>
</body>
</html>"""

    email_payload = json.dumps({
        "from": "A-Impact Business OS <onboarding@a-impact.io>",
        "to": [req.founder_email],
        "subject": f"🚀 {req.brand_name} ist live — dein Business wartet auf dich",
        "html": html_body,
        "reply_to": "robert@a-impact.io",
    }).encode()

    try:
        req_obj = urllib.request.Request(
            "https://api.resend.com/emails",
            data=email_payload,
            headers={
                "Authorization": f"Bearer {resend_key}",
                "Content-Type": "application/json"
            },
            method="POST"
        )
        with urllib.request.urlopen(req_obj, timeout=10) as resp:
            result = json.loads(resp.read())
        return {"status": "sent", "email_id": result.get("id"), "to": req.founder_email}
    except Exception as e:
        return {"status": "failed", "error": str(e)}


# ── MDT Integration — Auto-Marketing Launch ─────────────────────────────

class MarketingLaunchRequest(BaseModel):
    business_id: str
    brand_name: str
    niche: str
    target_market: str
    tagline: str = ""
    founder_name: str = ""

@app.post("/api/v3/marketing-launch")
async def marketing_launch(req: MarketingLaunchRequest, background_tasks: BackgroundTasks):
    """
    BOS v3: After business deploy, automatically generate first week of marketing content
    via MDT (Marketing Dream Team). Returns job_id for async tracking.
    """
    launch_id = f"launch-{req.business_id[:8]}"
    _deploy_state[launch_id] = {"status": "running", "content": {}, "error": ""}
    background_tasks.add_task(_run_marketing_launch, req, launch_id)
    return {
        "launch_id": launch_id,
        "status": "running",
        "message": "Marketing Army generiert deine erste Content-Woche...",
        "status_url": f"/api/v3/marketing-launch/{launch_id}/status"
    }

@app.get("/api/v3/marketing-launch/{launch_id}/status")
def get_marketing_launch_status(launch_id: str):
    state = _deploy_state.get(launch_id, {"status": "not_found", "content": {}, "error": ""})
    return {"launch_id": launch_id, **state}

async def _run_marketing_launch(req: MarketingLaunchRequest, launch_id: str):
    """Generate first week of content via MDT API."""
    import urllib.request as _req
    
    mdt_url = "http://localhost:8002/api/v1/army/run"
    headers = {"Content-Type": "application/json", "X-Tenant-ID": req.business_id}
    results = {}
    
    tasks = [
        ("linkedin_post", {"topic": f"{req.brand_name} — {req.tagline or req.niche}", "tone": "thought_leadership", "target_audience": req.target_market}),
        ("write_email_sequence", {"brand": req.brand_name, "product": req.niche, "target": req.target_market, "sequence_length": 3}),
        ("plan_content_calendar", {"brand": req.brand_name, "niche": req.niche, "platforms": ["LinkedIn", "Instagram", "Email"], "duration_weeks": 4}),
    ]
    
    for task_type, params in tasks:
        try:
            payload = json.dumps({"task_type": task_type, "parameters": params}).encode()
            r = _req.Request(mdt_url, data=payload, headers=headers, method="POST")
            with _req.urlopen(r, timeout=60) as resp:
                data = json.loads(resp.read())
                results[task_type] = data.get("data", data.get("result", ""))
        except Exception as e:
            results[task_type] = f"Error: {str(e)}"
    
    _deploy_state[launch_id] = {
        "status": "done",
        "content": results,
        "tasks_completed": len([v for v in results.values() if not str(v).startswith("Error")]),
        "error": ""
    }


def _send_welcome_auto(business_id: str, brand_name: str, founder_email: str,
                       founder_name: str, landing_url: str, tagline: str):
    """Internal helper: send welcome email after successful deploy."""
    req = WelcomeEmailRequest(
        business_id=business_id,
        brand_name=brand_name,
        founder_email=founder_email,
        founder_name=founder_name,
        landing_url=landing_url,
        tagline=tagline,
    )
    send_welcome_email(req)
