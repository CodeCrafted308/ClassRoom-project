import os
import sys

print("=== Scholar Rank Debug ===")

# Change to backend directory
os.chdir('backend')
sys.path.insert(0, 'backend/src')

print(f"Current directory: {os.getcwd()}")
print(f"Python path: {sys.path[:3]}")

try:
    print("Testing imports...")
    import fastapi
    print("✓ FastAPI imported")
    
    import uvicorn
    print("✓ Uvicorn imported")
    
    import start_fastapi
    print("✓ start_fastapi imported")
    
    print("Starting application...")
    start_fastapi.main()
    
except ImportError as e:
    print(f"✗ Import error: {e}")
    print("Install missing packages: pip install fastapi uvicorn pymongo passlib")
except Exception as e:
    print(f"✗ Error: {e}")
    print("Check MongoDB is running: mongod")
