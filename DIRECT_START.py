import os
import sys

os.chdir('backend')
sys.path.insert(0, 'backend/src')

import start_fastapi
start_fastapi.main()
