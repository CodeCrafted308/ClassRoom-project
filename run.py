#!/usr/bin/env python
"""
Startup script for Classroom Management System
This script checks prerequisites and provides helpful error messages
"""
import sys
import os

def check_python_version():
    """Check if Python version is 3.7+"""
    if sys.version_info < (3, 7):
        print("✗ Error: Python 3.7 or higher is required")
        print(f"   Current version: {sys.version}")
        return False
    print(f"✓ Python version: {sys.version.split()[0]}")
    return True

def check_dependencies():
    """Check if all required packages are installed"""
    required_packages = {
        'flask': 'Flask',
        'flask_cors': 'flask-cors',
        'pymongo': 'pymongo',
        'werkzeug': 'werkzeug'
    }
    
    missing = []
    for module, package in required_packages.items():
        try:
            __import__(module)
            print(f"✓ {package} installed")
        except ImportError:
            print(f"✗ {package} NOT installed")
            missing.append(package)
    
    if missing:
        print(f"\n✗ Missing packages: {', '.join(missing)}")
        print("   Install them with: pip install -r requirements.txt")
        return False
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
    print("Classroom Management System - Startup Check")
    print("="*60)
    print()
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    print()
    
    # Check dependencies
    if not check_dependencies():
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
    print("Starting Flask application...")
    print("="*60)
    print()
    
    # Import and run the app
    try:
        from app import app
        app.run(debug=True, host='0.0.0.0', port=5000)
    except KeyboardInterrupt:
        print("\n\n✓ Server stopped by user")
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()

