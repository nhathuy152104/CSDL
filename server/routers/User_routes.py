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
