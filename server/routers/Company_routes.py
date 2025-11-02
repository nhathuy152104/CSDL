from fastapi import APIRouter, Request, Depends, HTTPException, status
from controller.Company import Company

router = APIRouter(prefix="/company", tags=["Company"])

# Admin-only routes
def admin_required(request: Request):
    if request.session.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admins only")

@router.get("/")
def get_all_companies():
    return Company.get_all()
@router.get("/{company_id}")
def get_detail_company(company_id):
    return Company.get_by_id(company_id)
@router.post("/add")
def add_company(data: dict, _=Depends(admin_required)):
    Company.add(**data)
    return {"message": "Company added successfully"}

# User-editable route
def user_required(request: Request):
    if not request.session.get("user_id"):
        raise HTTPException(status_code=403, detail="Login required")

@router.put("/update")
def update_my_company(data: dict, request: Request = None, _=Depends(user_required)):
    user_id = request.session.get("user_id")
    company = Company.get_by_user(user_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    Company.update(company.company_id, **data)
    return {"message": "Company updated successfully"}

