from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
import pathlib

# Import our new modular routes and auth
from backend.src.auth import get_current_user
from backend.src.routers.auth_routes import router as auth_router
from backend.src.routers.teacher import router as teacher_router
from backend.src.routers.student import router as student_router

app = FastAPI(title="Classroom Management System", version="3.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files and templates
current_dir = pathlib.Path(__file__).parent.parent.parent
app.mount("/static", StaticFiles(directory=str(current_dir / "frontend" / "static")), name="static")
templates = Jinja2Templates(directory=str(current_dir / "frontend" / "templates"))

# Include Routers
app.include_router(auth_router)
app.include_router(teacher_router)
app.include_router(student_router)

# ---------------------------------------------------------------------------
# HTML Page Rendering Routes
# ---------------------------------------------------------------------------

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    current_user = get_current_user(request)
    if current_user:
        if current_user['role'] == 'teacher':
            return RedirectResponse(url="/teacher/dashboard", status_code=302)
        else:
            return RedirectResponse(url="/student/dashboard", status_code=302)
    return templates.TemplateResponse("home.html", {"request": request})

@app.get("/home", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("home.html", {"request": request})

@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse("login_page.html", {"request": request})

@app.get("/register", response_class=HTMLResponse)
async def register_page(request: Request):
    return templates.TemplateResponse("register_page.html", {"request": request})

@app.get("/teacher/dashboard", response_class=HTMLResponse)
async def teacher_dashboard(request: Request):
    current_user = get_current_user(request)
    if not current_user or current_user.get('role') != 'teacher':
        return RedirectResponse(url="/login", status_code=302)
    return templates.TemplateResponse("teacher_dashboard.html", {"request": request})

@app.get("/student/dashboard", response_class=HTMLResponse)
async def student_dashboard(request: Request):
    current_user = get_current_user(request)
    if not current_user or current_user.get('role') != 'student':
        return RedirectResponse(url="/login", status_code=302)
    return templates.TemplateResponse("student_dashboard.html", {"request": request})
