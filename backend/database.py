import os
from dotenv import load_dotenv

# Load environment variables early
load_dotenv()

from pymongo import MongoClient
import datetime

# Step 2: Load MONGO_URI
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")

if not MONGO_URI:
    # Raise a clear startup error if somehow both are missing
    raise EnvironmentError("❌ Startup Error: MONGO_URI environment variable is missing!")

# Step 3: Singleton-like connection setup
try:
    client = MongoClient(MONGO_URI)
    db = client["crowdsense"]
    
    # Collections
    predictions_collection = db["predictions"]
    alerts_collection = db["alerts"]
    zone_metrics_collection = db["zone_metrics"]
    
    # Step 7: Indexing for performance
    predictions_collection.create_index([("timestamp", -1)])
    predictions_collection.create_index([("zone", 1)])
    alerts_collection.create_index([("timestamp", -1)])
    
    print("✅ MongoDB Connected & Indexed")

except Exception as e:
    print(f"❌ MongoDB Connection Failed: {e}")
    # We don't raise here if we want the app to still start (Step 7 says do not crash on DB failure)
    # But Step 2 says raise on missing URI. Missing URI is different from connection failure.
    pass

def log_prediction(data):
    """Inserts prediction record non-blockingly."""
    try:
        data["timestamp"] = datetime.datetime.utcnow()
        predictions_collection.insert_one(data)
    except Exception as e:
        print(f"⚠️ Failed to log prediction: {e}")

def log_alert(data):
    """Inserts alert record non-blockingly."""
    try:
        data["timestamp"] = datetime.datetime.utcnow()
        alerts_collection.insert_one(data)
    except Exception as e:
        print(f"⚠️ Failed to log alert: {e}")
