#!/usr/bin/env python
"""
Main startup script for FastAPI Classroom Management System
"""
import os
import sys
import subprocess

def main():
    print("="*60)
    print("FastAPI Classroom Management System")
    print("="*60)
    print()
    
    # Get current directory (project root)
    project_root = os.path.dirname(__file__)
    print(f"Project root: {project_root}")
    print()
    
    # Run the FastAPI startup script from backend directory
    backend_script = os.path.join(project_root, 'backend', 'start_fastapi.py')
    try:
        subprocess.run([sys.executable, backend_script], check=True, cwd=project_root)
    except KeyboardInterrupt:
        print("\n✓ Server stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"✗ Error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
