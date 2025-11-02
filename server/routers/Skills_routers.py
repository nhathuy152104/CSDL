# routes_skill.py
from fastapi import APIRouter, Query, Request, HTTPException
from typing import List, Optional
from controller.Skill import Skill   # ✅ đúng import
from pydantic import BaseModel


router = APIRouter(prefix="/skills", tags=["Skills"])


class SkillCatalogItem(BaseModel):
    skill_id: int
    name: str

@router.get("", response_model=List[SkillCatalogItem])
def list_skills(query: Optional[str] = Query(None, min_length=1)):
    """
    Trả về danh sách skills dạng mảng chuỗi.
    - Nếu có ?query=react -> lọc theo LIKE
    - Nếu không -> trả top 100 skill
    """
    skills = Skill.search_skills(query)
    return skills



    