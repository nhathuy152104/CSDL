import os
from dotenv import load_dotenv

from fastapi import FastAPI
from starlette.middleware.sessions import SessionMiddleware
from fastapi.middleware.cors import CORSMiddleware
load_dotenv()

app = FastAPI()

# Serve built frontend (replace path if needed)
app.add_middleware( 
    CORSMiddleware, 
    allow_origins=["http://127.0.0.1:3000"], 
    allow_credentials=True, 
    allow_methods=["*"], 
    allow_headers=["*"], 
)



from routers.User_routes import router as user_router
from routers.Job_Routes import router as job_router
from routers.Skills_routers import router as skill_router
from routers.Company_routes import router as company_router
from routers.Profile_route import router as profile_router
from routers.Application_routes import router as Application_router
from routers.Location_route import router as Location_router

# Register routers
app.include_router(user_router, prefix="/api")
app.include_router(job_router, prefix = "/api")
app.include_router(skill_router, prefix="/api")
app.include_router(company_router, prefix="/api")
app.include_router(profile_router, prefix="/api")
app.include_router(Application_router, prefix="/api")
app.include_router(Location_router, prefix="/api")


@app.get("/") 
def home(): 
    return {"message": "Welcome to the Book Library API"}