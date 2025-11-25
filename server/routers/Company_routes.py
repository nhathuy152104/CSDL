from fastapi import APIRouter, Request, Depends, HTTPException, status
from controller.Company import Company
from pydantic import BaseModel

router = APIRouter(prefix="/company", tags=["Company"])


class CompanyUpdateRequire(BaseModel):
    address: str
    description: str
    name: str
    website: str
# Admin-only routes

@router.get("/")
def get_all_companies():
    return Company.get_all()

@router.get("/{company_id}")
def get_detail_company(company_id):
    return Company.get_by_id(company_id)
@router.post("/add")
def add_company(data: dict):
    Company.add(**data)
    return {"message": "Company added successfully"}

# User-editable route
def user_required(request: Request):
    if not request.session.get("user_id"):
        raise HTTPException(status_code=403, detail="Login required")

@router.put("/update/{company_id}")
def update_my_company(company_id, req: CompanyUpdateRequire):
    data = {
        "address": req.address,
        "name": req.name,
        "description": req.description,
        "website": req.website
    }

    if not company_id:
        raise HTTPException(status_code=404, detail="Company not found")
    
    Company.update(company_id, data)
    return {"message": "Company updated successfully"}
@router.get("/mycompany")
def get_my_company():
    company_id = 11
    return Company.get_by_id(company_id)