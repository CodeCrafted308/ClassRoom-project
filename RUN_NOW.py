import os
import sys

# Change to backend directory
os.chdir('backend')
sys.path.insert(0, 'backend/src')

# Import and run the FastAPI application
import start_fastapi

if __name__ == "__main__":
    print("Starting Scholar Rank Application...")
    print("Access: http://localhost:8000")
    start_fastapi.main()
