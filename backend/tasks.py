import os
import json
from celery import Celery
from pathlib import Path
from business_os import build_business

REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379")
celery_app = Celery("business_os", broker=REDIS_URL, backend=REDIS_URL)
celery_app.conf.update(task_serializer="json", result_serializer="json", accept_content=["json"])

JOB_STATE_DIR = Path("/tmp/business-os-jobs")
JOB_STATE_DIR.mkdir(exist_ok=True)

def set_state(job_id: str, data: dict):
    (JOB_STATE_DIR / f"{job_id}.json").write_text(json.dumps(data))

def get_state(job_id: str) -> dict | None:
    p = JOB_STATE_DIR / f"{job_id}.json"
    return json.loads(p.read_text()) if p.exists() else None

@celery_app.task(bind=True, name="tasks.run_business_os")
def run_business_os(self, job_id: str, description: str, qualifications: dict):
    steps = [
        ("Generiere Brand...", 10),
        ("Erstelle Marketing-Plan...", 25),
        ("Baue Sales-Materialien...", 40),
        ("Analysiere Tech Stack...", 55),
        ("Konfiguriere AI Agents...", 70),
        ("Berechne Revenue Modell...", 85),
        ("Erstelle ZIP-Archiv...", 95),
    ]

    try:
        set_state(job_id, {"status": "running", "progress": 5, "current_step": "Initialisiere..."})

        # Monkey-patch progress updates into build_business
        import business_os as bos
        original_brand = bos.generate_brand
        original_marketing = bos.generate_marketing_plan
        original_sales = bos.generate_sales_content
        original_tech = bos.generate_tech_stack
        original_agents = bos.generate_ai_agents
        original_revenue = bos.generate_revenue_model

        step_labels = iter(steps)

        def make_wrapper(orig_fn, label, pct):
            def wrapper(*args, **kwargs):
                set_state(job_id, {"status": "running", "progress": pct, "current_step": label})
                return orig_fn(*args, **kwargs)
            return wrapper

        bos.generate_brand = make_wrapper(original_brand, "Generiere Brand...", 10)
        bos.generate_marketing_plan = make_wrapper(original_marketing, "Erstelle Marketing-Plan...", 25)
        bos.generate_sales_content = make_wrapper(original_sales, "Baue Sales-Materialien...", 40)
        bos.generate_tech_stack = make_wrapper(original_tech, "Analysiere Tech Stack...", 55)
        bos.generate_ai_agents = make_wrapper(original_agents, "Konfiguriere AI Agents...", 70)
        bos.generate_revenue_model = make_wrapper(original_revenue, "Berechne Revenue Modell...", 85)

        output_path = build_business(description, qualifications)

        # Restore
        bos.generate_brand = original_brand
        bos.generate_marketing_plan = original_marketing
        bos.generate_sales_content = original_sales
        bos.generate_tech_stack = original_tech
        bos.generate_ai_agents = original_agents
        bos.generate_revenue_model = original_revenue

        # Read brand name from result
        brand_data = json.loads((output_path / "BRAND.json").read_text())

        set_state(job_id, {
            "status": "done",
            "progress": 100,
            "current_step": "Fertig! ✅",
            "brand_name": brand_data.get("empfehlung", "Business"),
            "tagline": brand_data.get("empfohlene_tagline", ""),
            "output_dir": str(output_path),
            "zip_path": str(output_path.parent / f"{output_path.name}.zip"),
            "files": [f.name for f in output_path.iterdir() if f.is_file()]
        })

    except Exception as e:
        set_state(job_id, {"status": "failed", "progress": 0, "error": str(e)})
        raise
