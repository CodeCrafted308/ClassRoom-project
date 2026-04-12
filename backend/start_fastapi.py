#!/usr/bin/env python
"""
FastAPI startup script for Classroom Management System
"""
import os
import sys
import subprocess

def check_python_version():
    """Check if Python version is 3.8+"""
    if sys.version_info < (3, 8):
        print("✗ Error: Python 3.8 or higher is required for FastAPI")
        print(f"   Current version: {sys.version}")
        return False
    print(f"✓ Python version: {sys.version.split()[0]}")
    return True

def check_mongodb():
    """Check MongoDB connection"""
    try:
        from pymongo import MongoClient
        mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=3000)
        client.server_info()
        print(f"✓ MongoDB connected at {mongo_uri}")
        return True
    except Exception as e:
        print(f"✗ MongoDB connection failed: {e}")
        print("\n  Solutions:")
        print("  1. Start MongoDB: mongod (or check if service is running)")
        print("  2. For Docker: docker-compose up mongodb")
        print("  3. Or use MongoDB Atlas (cloud) and set MONGO_URI environment variable")
        return False

def main():
    print("="*60)
    print("FastAPI Classroom Management System - Startup")
    print("="*60)
    print()
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    print()
    
    # Check MongoDB
    mongodb_ok = check_mongodb()
    print()
    
    if not mongodb_ok:
        print("⚠ Warning: MongoDB is not connected")
        print("   The app may not work properly without MongoDB")
        response = input("   Continue anyway? (y/n): ")
        if response.lower() != 'y':
            sys.exit(1)
    
    print("="*60)
    print("Starting FastAPI application...")
    print("="*60)
    print()
    print("✓ Server will start on http://localhost:8000")
    print("✓ API docs available at http://localhost:8000/docs")
    print("✓ Press Ctrl+C to stop")
    print()
    
    # Start uvicorn with the correct module path
    try:
        import uvicorn
        # Add parent directory to Python path
        sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
        uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)
    except KeyboardInterrupt:
        print("\n\n✓ Server stopped by user")
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()
