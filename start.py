#!/usr/bin/env python
import os
import sys
import subprocess

def main():
    print("="*60)
    print("Scholar Rank Management System - Startup")
    print("="*60)
    print()
    
    project_root = os.path.dirname(__file__)
    
    try:
        # Run uvicorn directly
        subprocess.run([sys.executable, "-m", "uvicorn", "backend.src.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"], check=True, cwd=project_root)
    except KeyboardInterrupt:
        print("\n✓ Server stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"✗ Error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
