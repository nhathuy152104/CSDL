# routes_skill.py
from fastapi import APIRouter, Query, Request, HTTPException
from typing import List, Optional
from controller.Location import Location  
from pydantic import BaseModel


router = APIRouter(prefix="/location", tags=["Location"])


class LocationCatalogItem(BaseModel):
    region_id: int
    name: str

@router.get("", response_model=List[LocationCatalogItem])
def list_locations(query: Optional[str] = Query(None, min_length=1)):
    """
    Trả về danh sách skills dạng mảng chuỗi.
    - Nếu có ?query=react -> lọc theo LIKE
    - Nếu không -> trả top 100 skill
    """
    locations = Location.search_locations(query)
    return locations



    