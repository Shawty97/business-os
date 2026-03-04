import os
import uuid
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from models import BuildRequest, JobStatus, JobResult
from tasks import run_business_os, get_state

app = FastAPI(title="Business OS API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health():
    return {"status": "ok", "service": "Business OS v2"}

@app.post("/api/jobs", response_model=dict)
def create_job(req: BuildRequest):
    job_id = str(uuid.uuid4())

    # Queue async task
    run_business_os.delay(
        job_id=job_id,
        description=req.description,
        qualifications=req.qualifications.model_dump()
    )

    return {
        "job_id": job_id,
        "status": "pending",
        "estimated_minutes": 20,
        "message": "Business wird gebaut... 🚀"
    }

@app.get("/api/jobs/{job_id}/status", response_model=JobStatus)
def get_job_status(job_id: str):
    state = get_state(job_id)
    if not state:
        raise HTTPException(status_code=404, detail="Job nicht gefunden")
    return JobStatus(job_id=job_id, **{k: v for k, v in state.items() if k in JobStatus.model_fields})

@app.get("/api/jobs/{job_id}/result", response_model=JobResult)
def get_job_result(job_id: str):
    state = get_state(job_id)
    if not state:
        raise HTTPException(status_code=404, detail="Job nicht gefunden")
    if state.get("status") != "done":
        raise HTTPException(status_code=202, detail=f"Job noch nicht fertig: {state.get('status')}")

    return JobResult(
        job_id=job_id,
        brand_name=state["brand_name"],
        tagline=state.get("tagline", ""),
        files=state.get("files", []),
        zip_url=f"/api/jobs/{job_id}/download",
        output_dir=state["output_dir"]
    )

@app.get("/api/jobs/{job_id}/download")
def download_zip(job_id: str):
    state = get_state(job_id)
    if not state or state.get("status") != "done":
        raise HTTPException(status_code=404, detail="Job nicht gefunden oder nicht fertig")

    zip_path = state.get("zip_path")
    if not zip_path or not os.path.exists(zip_path):
        raise HTTPException(status_code=404, detail="ZIP nicht gefunden")

    brand = state.get("brand_name", "business").lower().replace(" ", "-")
    return FileResponse(zip_path, media_type="application/zip", filename=f"{brand}-paket.zip")
