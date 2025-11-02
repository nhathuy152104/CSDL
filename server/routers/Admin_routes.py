from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, EmailStr
from controller.User import User  # class User với các method signup, update, delete
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/admin", tags=["Admin"])


class SignupRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    fullname: str
    gender: str
@router.get("/users")
def get_all_user(request: Request):
    user_id = request.cookies.get("UserID")
    role = request.cookies.get("Role")
    if not user_id or role != "admin":
        return JSONResponse(content={"error": "Unauthorized"}, status_code=401)
    try:
        users = User.get_all()  
        return {"success": True, "data": users}
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.post("/signup")
def signup_api(req: SignupRequest, request: Request):
    user_id = request.cookies.get("UserID")
    role = request.cookies.get("Role")
    if not user_id or role != "admin":
        return JSONResponse(content={"error": "Unauthorized"}, status_code=401)
    if not req.email.endswith("@gmail.com"):
        raise HTTPException(status_code=400, detail="Email phải là Gmail")
    
    result = User.signup(req.username, req.email, req.password, req.fullname, req.gender)
    if result.get("success"):
        return {"success": True}
    raise HTTPException(status_code=400, detail=result.get("error", "Signup failed"))

# Tương tự, có thể tạo API update, delete
class UpdateRequest(BaseModel):
    username: str
    firstName: str
    lastName: str
    gender: str
    role: str
    password: str | None = None

@router.put("/update")
def update_user(req: UpdateRequest, request: Request):
    user_id = request.cookies.get("UserID")
    role = request.cookies.get("Role")
    if not user_id or role != "admin":
        return JSONResponse(content={"error": "Unauthorized"}, status_code=401)
    result = User.update(req.dict())
    if result.get("success"):
        return {"success": True}
    raise HTTPException(status_code=400, detail=result.get("error", "Update failed"))

@router.delete("/delete/{user_id}")
def delete_user(user_id: int, request: Request):
    admin_id = request.cookies.get("UserID")
    role = request.cookies.get("Role")

    if not admin_id or role != "admin":
        return JSONResponse(content={"error": "Unauthorized"}, status_code=401)

    result = User.delete(user_id)
    if result.get("success"):
        return {"success": True}

    raise HTTPException(status_code=400, detail=result.get("error", "Delete failed"))
