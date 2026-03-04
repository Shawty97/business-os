from pydantic import BaseModel
from typing import Optional, Literal

class Qualifications(BaseModel):
    zielgruppe: str
    land: str = "DE"
    budget: str = "niedrig"
    timeline: str = "3 Monate"
    unique_edge: str

class BuildRequest(BaseModel):
    description: str
    qualifications: Qualifications

class JobStatus(BaseModel):
    job_id: str
    status: Literal["pending", "running", "done", "failed"]
    progress: int = 0
    current_step: Optional[str] = None
    error: Optional[str] = None
    brand_name: Optional[str] = None

class JobResult(BaseModel):
    job_id: str
    brand_name: str
    tagline: str
    files: list[str]
    zip_url: str
    output_dir: str
