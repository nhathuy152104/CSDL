from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from controller.User import User
from fastapi.responses import JSONResponse
from typing import Optional
from controller.Skill import Skill

router = APIRouter(prefix="/user", tags=["User"])

# ==== Request Model ====
class LoginRequest(BaseModel):
    username: str
    password: str

class SignupRequest(BaseModel):
    full_name: str
    email: str
    phone: str
    password: str
    role: str

class AddSkillRequest(BaseModel):
    level: int
    years_exp: Optional[float] = None

@router.post("/login")
def login_api(req: LoginRequest):
    result = User.check_login(req.username, req.password)

    if not result:
        return JSONResponse(
            content={"success": False, "message": "Tên đăng nhập hoặc mật khẩu không đúng"},
            status_code=401
        )

    print("passed")
    user_id, role = result  

    response = JSONResponse(
        content={"success": True, "user_id": user_id, "role": role}
    )

    response.set_cookie(key="UserID", value=str(user_id), httponly=True, secure=False, samesite="lax")
    response.set_cookie(key="Role", value=role, httponly=True, secure=False, samesite="lax")

    print("✅ Cookie set:", {"UserID": user_id, "Role": role})
    return response
@router.post("/register")
def register_api(req: SignupRequest):
    if not req.email.endswith("@gmail.com"):
        raise HTTPException(status_code=400, detail="Email phải là Gmail")

    data = {
        "fullname": req.full_name,
        "email": req.email,
        "phone": req.phone,
        "password": req.password,
        "role": req.role
    }
    result = User.register(data)
    if result.get("success"):
        return {"success": True, "message": "Đăng ký thành công!"}
    
    raise HTTPException(status_code=400, detail=result.get("error", "Signup failed"))

@router.get("/profile")
def get_profile(request: Request):
    role =  request.cookies.get("Role")
    user_id = request.cookies.get("UserID")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated.")
    return
@router.post("/skills/{skill_id}", status_code=201)
def add_skill(request: Request,req: AddSkillRequest, skill_id):
    role = request.cookies.get("Role")
    user_id = request.cookies.get("UserID")
    data = {
        "user_id": int(user_id),
        "skill_id": int(skill_id),
        "level": req.level,
        "years_exp": req.years_exp
    }
    return Skill.add_skill(data)
@router.get("/skills/")
def get_mine_skill(request: Request):
    role = request.cookies.get("Role")
    user_id = request.cookies.get("UserID")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated.")
    return Skill.get_mine_skill(user_id)

@router.delete("/skills/{skill_id}")
def delete_mine_skill(request:Request, skill_id):
    role = request.cookies.get("Role")
    user_id = request.cookies.get("UserID")
    print(user_id)
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated.")
    return Skill.remove_skill(user_id, skill_id)
