from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status, Request
from fastapi.responses import JSONResponse,FileResponse
from pathlib import Path
import uuid
from pydantic import BaseModel
from typing import Optional
from controller.Application import Application

router = APIRouter(prefix = "/application", tags = ["Application"])




@router.get("/candicate_list/{job_id}")
def get_candicate_list(job_id, request: Request):
    return Application.get_candidate_list(job_id)
@router.get("/application_list")
def get_application_list():
    user_id = 1
    return Application.get_application_list(user_id)
UPLOAD_DIR = Path("uploads/cvs")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_TYPES = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

@router.post("/fkoff/{application_id}/{action}")             
def action_applicaton(action, application_id):
    return Application.action_application(action, application_id)

@router.post("/apply/{job_id}", status_code=201)
async def apply_job_with_cv(
    job_id: int,
    cv: UploadFile = File(...),
):
    """
    Accepts multipart/form-data with a file field named `cv`.
    Saves the file and calls Application.apply_job(job_id, user_id, cv_path).
    """
    user_id = 1  # or current_user.id

    # Validate mime type
    if cv.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only PDF/DOC/DOCX allowed.")

    # Read contents (small files only; adjust streaming for large files)
    contents = await cv.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Max 5 MB.")

    # Save with a safe unique name
    ext = Path(cv.filename).suffix or ""
    safe_name = f"{uuid.uuid4().hex}{ext}"
    dest = UPLOAD_DIR / safe_name
    try:
        dest.write_bytes(contents)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to save CV.")

    # Call your application logic — adapt to your function signature
    try:
        ok, created = Application.apply_job(job_id=job_id, user_id=user_id, cv_path=safe_name)
    except Exception as exc:
        # cleanup on error
        dest.unlink(missing_ok=True)
        raise HTTPException(status_code=500, detail="Apply failed.")

    if not ok:
        dest.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail="Apply failed (business rules).")

    return {"success": True, "applied": created, "cv": safe_name}
@router.get("/cv/{filename}")
def get_cv(filename: str):
    file_path = UPLOAD_DIR / filename

    if not file_path.exists():
        raise HTTPException(404, "CV not found")

    return FileResponse(str(file_path))
@router.delete("/{application_id}")
def dl_app(application_id):
    return Application.delete(application_id)