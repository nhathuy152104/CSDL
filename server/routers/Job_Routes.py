from fastapi import APIRouter, Request, Depends, status, HTTPException
from fastapi.responses import JSONResponse
from controller.Job import Job  # Create a Job controller similar to Book
from pydantic import BaseModel

router = APIRouter(prefix="/job", tags=["Job"])



# Middleware: admin required
def employer_required(request: Request):
    role = request.session.get("Role")
    if role != "employer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Employers only"
        )
def admin_required(request: Request):
    if request.session.get("Role") != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    return True
# -----------------------
# 📄 GET ALL JOBS (OPTIONAL FILTER)
# -----------------------
@router.get("/")
@router.get("/by-location/{location}")
def get_jobs(location: str = None):
    jobs_from_db = Job.get_all(location=location)
    jobs = [
        {
            "id": j["job_id"],  # lowercase
            "title": j["title"],
            "company": j["company_id"],
            "location": j["location"],
            "description": j["description"],
            "postedAt": j["posted_at"].isoformat() if j["posted_at"] else None,
            "salary": j.get("salary"),
            "type": j.get("employment_type", "Full-time")
        }
        for j in jobs_from_db
    ]
    return {"jobs": jobs}



# -----------------------
# 📌 GET JOB DETAIL
# -----------------------
@router.get("/{job_id}")
def job_detail(job_id: int):
    job = Job.get_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {
        "id": job["job_id"],
        "title": job["title"],
        "company": job["company_id"],
        "location": job["location"],
        "description": job["description"],
        "postedAt": job["posted_at"].isoformat() if job["posted_at"] else None,
        "salary": job.get("salary", None),
        "type": job.get("employment_type", "Full-time")
    }

# USER
@router.post("/{job_id}/apply", status_code=201)
def apply_job(job_id: int, request: Request):
    # Lấy thông tin từ cookie (bạn đã set ở login)
    role = request.cookies.get("Role")
    user_id = request.cookies.get("UserID")
    print(role)
    print(user_id)
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated.")
    # seeker/user mới được apply
    if role not in ("user", "seeker"):
        raise HTTPException(status_code=403, detail="Login as job seeker to apply.")

    ok, created = Job.apply_job(job_id, int(user_id))
    if not ok:
        raise HTTPException(status_code=400, detail="Apply failed.")
    # created=False nghĩa là đã nộp trước đó (no-op)
    return {"success": True, "applied": created}
# -----------------------
# ➕ ADD NEW JOB (COMPANY ONLY)
# -----------------------
@router.post("/add")
async def add_job(request: Request, _=Depends(employer_required)):
    form = await request.form()
    title = form.get("title")
    company = form.get("company")
    location = form.get("location")
    description = form.get("description")

    if not all([title, company, location, description]):
        raise HTTPException(status_code=400, detail="Missing fields")

    # Save to database (example)
    Job.add(title, company, location, description)

    return JSONResponse(
        content={"message": "Job posted successfully"},
        status_code=status.HTTP_201_CREATED
    )
# -----------------------
# ✏️ UPDATE JOB (ADMIN ONLY)
# -----------------------
@router.put("/update/{job_id}")
def update_job(job_id: int, data: dict, request: Request = None, _=Depends(admin_required)):
    required_fields = ["title", "company", "location", "description"]

    if not data or not all(field in data for field in required_fields):
        raise HTTPException(status_code=400, detail="Missing fields")

    Job.update(
        job_id,
        data["title"],
        data["company"],
        data["location"],
        data["description"],
        data.get("salary"),
        data.get("type", "Full-time")
    )
    return {"message": "Job updated successfully"}

# -----------------------
# ❌ DELETE JOB (ADMIN ONLY)
# -----------------------
@router.delete("/delete/{job_id}")
def delete_job(job_id: int, _=Depends(admin_required)):
    Job.delete(job_id)
    return {"message": "Job deleted successfully"}
