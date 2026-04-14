#!/usr/bin/env python3
"""
Simple server runner for Scholar Rank
"""
import os
import sys
import subprocess

def main():
    print("🚀 Starting Scholar Rank Application...")
    print("📱 Access: http://localhost:8000")
    print("🔧 If issues persist, check browser console for errors")
    
    # Get the backend directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(script_dir, 'backend')
    
    # Change to backend directory
    os.chdir(backend_dir)
    
    # Add backend/src to Python path
    sys.path.insert(0, os.path.join(backend_dir, 'src'))
    
    try:
        # Try to import and run the FastAPI app
        import start_fastapi
        start_fastapi.main()
    except KeyboardInterrupt:
        print("\n✓ Server stopped by user")
    except Exception as e:
        print(f"\n✗ Error: {e}")
        print("Please check:")
        print("1. MongoDB is running on localhost:27017")
        print("2. All required packages are installed")
        print("3. Files are in correct locations")

if __name__ == "__main__":
    main()
