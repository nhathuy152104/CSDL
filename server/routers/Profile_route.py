from fastapi import APIRouter, Request, Depends, status, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
from controller.Profile import Profile

router = APIRouter(prefix = "/profile", tags = ["Profile"])

class AddSkillRequest(BaseModel):
    level: int
    years_exp: Optional[float] = None
class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None 


@router.get("/me")
def get_mine_profile():
    user_id = 1
    return Profile.get_profile_user(user_id)
@router.put("/me")
def update_mine_profile(req: UpdateProfileRequest, request: Request):
    user_id = 1
    data = {
        "full_name": req.full_name,
        "phone": req.phone
    }
    print(data)
    return Profile.update_profile_user(data, user_id)

@router.get("/skills/")
def get_mine_skill(request: Request):
    user_id = 1
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated.")
    return Profile.get_mine_skill(user_id)

@router.post("/skills/{skill_id}", status_code = 201)
def add_skill(request: Request, req: AddSkillRequest, skill_id):
    user_id = 1
    data = {
        "user_id": int(user_id),
        "skill_id": int(skill_id),
        "level": req.level,
        "years_exp": req.years_exp
    }
    return Profile.add_skill_user(data)

@router.delete("/skills/{skill_id}")
def delete_mine_skill(request:Request, skill_id):
    user_id = 4
    print(user_id)
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated.")
    return Profile.remove_skill_user(user_id, skill_id)



