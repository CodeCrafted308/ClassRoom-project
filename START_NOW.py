#!/usr/bin/env python3
import os
import sys
import subprocess

print("🚀 Starting Scholar Rank...")
print("📱 Access: http://localhost:8000")

# Direct execution
try:
    os.chdir('backend')
    sys.path.insert(0, 'backend/src')
    import start_fastapi
    start_fastapi.main()
except KeyboardInterrupt:
    print("\n✓ Server stopped")
except Exception as e:
    print(f"Error: {e}")
