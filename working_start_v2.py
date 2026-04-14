import os
import sys

os.chdir('backend')
sys.path.insert(0, 'backend/src')

from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pathlib import Path

app = FastAPI()

# Static files and templates
current_dir = Path(__file__).parent.parent
app.mount("/static", StaticFiles(directory=str(current_dir / "frontend" / "static")), name="static")
templates = Jinja2Templates(directory=str(current_dir / "frontend" / "templates"))

@app.get("/")
async def home():
    return templates.TemplateResponse("home.html")

@app.get("/login")
async def login():
    return templates.TemplateResponse("login_page.html")

@app.get("/register")
async def register():
    return templates.TemplateResponse("register_page.html")

if __name__ == "__main__":
    import uvicorn
    print("🚀 Scholar Rank starting on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
