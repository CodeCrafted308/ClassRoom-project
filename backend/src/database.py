import os
import sys
from pymongo import MongoClient

mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')

print(f"Connecting to MongoDB at {mongo_uri}...")
client = MongoClient(mongo_uri, serverSelectionTimeoutMS=3000)

try:
    client.admin.command('ping')
    print("SUCCESS: MongoDB connected successfully")
except Exception as e:
    print(f"FAILED: Failed to connect to MongoDB: {e}")
    print("Error: The application requires a running MongoDB instance.")
    print("Please ensure MongoDB is running or update the MONGO_URI environment variable.")
    sys.exit(1)

db = client['classroom_db']

def get_db():
    return db
