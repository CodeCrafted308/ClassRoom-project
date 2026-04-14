# Project Structure

```
classroom/
├── frontend/                 # Frontend assets and templates
│   ├── static/              # CSS, JavaScript, images
│   │   ├── css/
│   │   │   └── style.css
│   │   └── js/
│   │       ├── auth.js
│   │       ├── teacher.js
│   │       └── student.js
│   └── templates/           # HTML templates
│       ├── login.html
│       ├── teacher_dashboard.html
│       └── student_dashboard.html
├── backend/                 # Backend application and scripts
│   ├── src/
│   │   ├── __init__.py
│   │   └── main.py          # FastAPI application
│   ├── requirements.txt       # Python dependencies
│   ├── start.bat            # Windows startup script
│   ├── start.ps1            # PowerShell startup script
│   └── start_fastapi.py     # Python startup script
├── uploads/                 # File upload directory
├── venv/                    # Virtual environment
├── start.py                 # Main startup script (root level)
├── requirements.txt          # Project dependencies
├── docker-compose.yml       # Docker configuration
└── Dockerfile              # Docker image configuration
```

## How to Run

### Option 1: Main Startup Script (Recommended)
```bash
python start.py
```

### Option 2: Backend Startup Script
```bash
cd backend
start.bat          # Windows
# or
start.ps1           # PowerShell
# or  
python start_fastapi.py
```

### Option 3: Direct Uvicorn
```bash
cd backend
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

## Access Points

- **Application**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Key Changes

1. **Separated Frontend/Backend**: Clean separation of concerns
2. **Fixed Static File Paths**: Proper path resolution for FastAPI
3. **Organized Startup Scripts**: Multiple ways to start the application
4. **Cleaned Structure**: Removed duplicate and unnecessary files
