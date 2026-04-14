# 🚀 Scholar Rank - How to Run

## **Method 1: Direct Command Prompt**
```cmd
cd C:\Users\hanyl\Desktop\classroom\backend
python start_fastapi.py
```

## **Method 2: Using Created Scripts**
```cmd
cd C:\Users\hanyl\Desktop\classroom
python SIMPLE_START_V2.py
```

## **Method 3: Simple Direct Start**
```cmd
cd C:\Users\hanyl\Desktop\classroom\backend
python -c "
import sys
sys.path.insert(0, 'backend/src')
import uvicorn
from fastapi import FastAPI
app = FastAPI()
uvicorn.run(app, host='0.0.0.0', port=8000)
"
```

## **Method 4: Manual Python**
```cmd
cd C:\Users\hanyl\Desktop\classroom\backend
python
```
Then paste this code:
```python
import sys
sys.path.insert(0, 'backend/src')
import start_fastapi
start_fastapi.main()
```

## **Access Your Website**
Once running, open browser:
- **Homepage**: http://localhost:8000/home
- **Login**: http://localhost:8000/login
- **Register**: http://localhost:8000/register

## **Demo Accounts**
- **Teacher**: `teacher@scholarrank.com` / `teacher123`
- **Student**: `student@scholarrank.com` / `student123`

## **Troubleshooting**
If not working:
1. Check Python version: `python --version` (should be 3.8+)
2. Check MongoDB: `mongod` should be running
3. Check dependencies: `pip install fastapi uvicorn pymongo passlib`
4. Use Command Prompt (not PowerShell)
