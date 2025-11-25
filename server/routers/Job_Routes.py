from fastapi import APIRouter, Request, Depends, status, HTTPException, Form, UploadFile, File, Request, Query
from fastapi.responses import JSONResponse
from controller.Job import Job  # Create a Job controller similar to Book
from pydantic import BaseModel
from datetime import date
from typing import List, Optional
import json

router = APIRouter(prefix="/job", tags=["Job"])

class FilterRequest(BaseModel):
    employment_type: str
    salary_min: str
    salary_max: str
    


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
@router.get("/by-filter")
def get_by_filter(
    skills: List[int] = Query(..., description="List of skill ids"),
    region: Optional[str] = Query(None, description="Job region"),
    min_salary: Optional[int] = Query(None, description="Minimum salary"),
    max_salary: Optional[int] = Query(None, description="Maximum salary")
):
    # Tạo dict data để truyền vào method Job.get_by_filter
    data = {
        "skill_ids": skills,
        "region": region,
        "min_salary": min_salary,
        "max_salary": max_salary
    }

    # Gọi hàm trong model để filter jobs
    jobs_from_db = Job.get_by_filter(data)

    # Mapping dữ liệu từ DB sang JSON chuẩn
    jobs = [
        {
            "id": j["job_id"],
            "title": j["title"],
            "company": j.get("company_name", j["company_id"]),  # nếu muốn trả tên công ty, join table company
            "location": j["location"],
            "description": j["description"],
            "postedAt": j["posted_at"].isoformat() if j["posted_at"] else None,
            "salary": {
                "min": j.get("salary_min"),
                "max": j.get("salary_max")
            },
            "type": j.get("employment_type", "Full-time")
        }
        for j in jobs_from_db
    ]

    return {"jobs": jobs}
@router.get("/by-company")
def get_job_by_company():
    jobs_from_db = Job.get_by_company(11)
    jobs = [
        {
            "id": j["job_id"],  
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

@router.get("/by-company/{company_id}")
def get_job_by_company(company_id):
    jobs_from_db = Job.get_by_company(company_id)
    jobs = [
        {
            "id": j["job_id"],  
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
@router.get("/by-skill")
def get_by_skill(skills: List[int] = Query(..., description="Comma-separated skill ids")):
    jobs_from_db =Job.get_by_skill(skills)
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
        "salary_min": job.get("salary_min", None),
        "salary_max": job.get("salary_max", None),
        "type": job.get("employment_type", "Full-time")
    }

                       


# ➕ ADD NEW JOB (COMPANY ONLY)
# -----------------------
@router.post("/add")
async def add_job(
    title: str = Form(...),
    description: str = Form(...),
    location: str = Form(...),
    employment: str = Form(...),
    salary_min: float = Form(...),
    salary_max: float = Form(...),
    expires_at: date = Form(...),
    region: str = Form(...),       
    skills: str = Form(...),        
    pdf: UploadFile | None = File(None),
):
    if salary_max < salary_min:
        raise HTTPException(400, "salary_max must be >= salary_min")

    try:
        region_obj = json.loads(region)  # parse JSON string
        region_id = region_obj.get("region_id")
        if region_id is None:
            raise ValueError
    except Exception:
        raise HTTPException(400, "Invalid region JSON")

    try:
        skill_list = json.loads(skills)
        if not isinstance(skill_list, list):
            raise ValueError
    except Exception:
        raise HTTPException(400, "Invalid skills JSON")

    data = {
        "title": title,
        "description": description,
        "location": location,
        "employment": employment,
        "salary_min": salary_min,
        "salary_max": salary_max,
        "expires_at": expires_at,
        "region_id": region_id,
        "skills": skill_list
    }

    print(data)
    Job.add(11, data)
    return {"message": "Job posted successfully"}
    
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


@router.delete("/{job_id}")
def delete_job(job_id: int):
    Job.delete(job_id)
    return {"message": "Job deleted successfully"}



