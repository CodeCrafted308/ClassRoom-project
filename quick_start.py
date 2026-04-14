#!/usr/bin/env python3
"""
Quick start for Scholar Rank
"""
import os
import sys
import subprocess

def main():
    print("🚀 Starting Scholar Rank...")
    print("📱 Access: http://localhost:8000")
    print("🔧 If issues persist, check browser console for errors")
    
    # Change to backend directory and start FastAPI
    backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
    os.chdir(backend_dir)
    
    try:
        subprocess.run([sys.executable, 'start_fastapi.py'], check=True)
    except KeyboardInterrupt:
        print("\n✓ Server stopped by user")
    except Exception as e:
        print(f"\n✗ Error: {e}")

if __name__ == "__main__":
    main()
