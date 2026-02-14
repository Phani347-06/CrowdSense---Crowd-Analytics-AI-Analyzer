from fastapi import FastAPI, HTTPException, Query
from dotenv import load_dotenv
load_dotenv()
from fastapi.middleware.cors import CORSMiddleware
import random
import hashlib
import datetime
import time
import math
import threading
import os
import joblib
import numpy as np
import pandas as pd
from typing import List, Optional
import uvicorn

# Import database module
from database import predictions_collection, alerts_collection, zone_metrics_collection, log_prediction, log_alert

app = FastAPI(title="CrowdSense Enhanced Backend")

# Step 1: CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── ML Model Loading (Step 4 Requirement) ──
MODEL_PATH = os.path.join(os.path.dirname(__file__), "smart_crowd_per_location_model.pkl")
model_bundle = None
models = None
label_encoder = None

try:
    if os.path.exists(MODEL_PATH):
        model_bundle = joblib.load(MODEL_PATH)
        models = model_bundle.get("models")
        label_encoder = model_bundle.get("label_encoder")
        print("✅ ML Models loaded successfully")
    else:
        print("⚠️ Warning: Model file not found. Using formula-based predictions.")
except Exception as e:
    print(f"❌ Error loading ML model: {e}")

# ── Zone Configuration (Mapped to Frontend) ──
ZONES = {
    "canteen": {"name": "Student Canteen", "le_name": "Canteen", "capacity": 200, "base_density": 100, "type": "social"},
    "lib": {"name": "Main Library", "le_name": "Library", "capacity": 500, "base_density": 250, "type": "study"},
    "pg": {"name": "PG Block", "le_name": "PG Block", "capacity": 150, "base_density": 80, "type": "academic"},
    "newblock": {"name": "New Block", "le_name": "New Block", "capacity": 300, "base_density": 150, "type": "academic"},
    "dblock": {"name": "Academic Block D", "le_name": "D Block", "capacity": 400, "base_density": 200, "type": "academic"}
}

# ── State Persistence ──
latest_data = {}
history = {zid: [] for zid in ZONES}
alerts = []

# ── Helper Functions ──

def get_time_factor(hour, minute, weekday):
    """Global activity factor based on time of day."""
    t = hour + (minute / 60.0)
    if weekday >= 5: return 0.2 # Weekend fallback
    if 9 <= t < 11: return 1.1
    if 11 <= t < 14: return 1.4
    if 14 <= t < 18: return 1.0
    if 18 <= t < 20: return 0.6
    return 0.15

def get_zone_modifier(zone_type, hour, minute):
    """Zone-specific behavioral multipliers."""
    t = hour + (minute / 60.0)
    if zone_type == "social":
        if 11 <= t < 14: return 2.0
    elif zone_type == "study":
        if 14 <= t < 18: return 1.3
    return 1.0

def calculate_cri(current, capacity, predicted, growth_rate, hour):
    """Enhanced Crowd Risk Index (0-100)."""
    density_ratio = current / max(capacity, 1)
    pred_ratio = predicted / max(capacity, 1)
    
    cri = (density_ratio * 60) + (pred_ratio * 20) + (max(growth_rate, 0) * 10) + (10 if 12 <= hour <= 14 else 0)
    
    if current >= capacity: cri = max(cri, 85)
    return min(max(round(cri), 0), 100)

def detect_surge(zone_hist):
    if len(zone_hist) < 5: return False, 0.0
    recent = np.mean(zone_hist[-3:])
    older = np.mean(zone_hist[-10:-3]) if len(zone_hist) > 5 else zone_hist[0]
    growth = (recent - older) / max(older, 1)
    return growth > 0.3, growth

# ── Core Prediction Logic (Step 4 & 5 Integration) ──

def predict_and_store(zone_id, config, hour, current_density):
    global label_encoder, models
    
    # ── 1. Calculate Prediction ──
    prediction = 0
    if models and label_encoder and config["le_name"] in label_encoder.classes_:
        try:
            le_idx = label_encoder.transform([config["le_name"]])[0]
            model = models.get(le_idx)
            if model:
                # Minimal features for simulation compatibility
                features = pd.DataFrame([{
                    "hour": hour, 
                    "weekday": 1, "rssi": -70, "value": config["capacity"],
                    "prev_density": current_density, "prev2_density": current_density,
                    "rolling_mean_6": current_density, "prev_day_density": current_density,
                    "is_weekend": 0
                }])
                prediction = int(model.predict(features)[0])
        except:
            pass
    
    if prediction <= 0: # Fallback
        prediction = int(current_density * random.uniform(0.95, 1.1))

    prediction = max(0, min(prediction, int(config["capacity"] * 1.5)))
    
    # ── 2. CRI Calculation ──
    surge, growth = detect_surge(history[zone_id])
    cri = calculate_cri(current_density, config["capacity"], prediction, growth, hour)
    
    # ── 3. Step 4: Store Prediction into MongoDB ──
    prediction_record = {
        "zone": config["name"],
        "raw_device_count": current_density,
        "estimated_humans": int(current_density * 1.3),
        "predicted_30min": prediction,
        "confidence_score": round(random.uniform(0.85, 0.98), 2),
        "cri": cri,
    }
    log_prediction(prediction_record)
    
    # ── 4. Step 5: Store Alert if needed ──
    if cri >= 70:
        alert_record = {
            "zone": config["name"],
            "cri": cri,
            "alert_level": "critical" if cri >= 85 else "high",
            "email_sent_to": "admin@vnrvjiet.in", # Default organizer for sim
            "status": "sent"
        }
        log_alert(alert_record)
        
    return prediction, cri, surge

# ── Simulation Loop ──

def simulation_loop():
    global latest_data, history
    print("🚀 Simulation Engine Started with MongoDB Storage")
    
    current_counts = {zid: ZONES[zid]["base_density"] for zid in ZONES}
    
    while True:
        now = datetime.datetime.now()
        h, m = now.hour, now.minute
        
        t_factor = get_time_factor(h, m, now.weekday())
        
        new_state = {}
        for zid, config in ZONES.items():
            z_factor = get_zone_modifier(config["type"], h, m)
            target = config["base_density"] * t_factor * z_factor * random.uniform(0.9, 1.1)
            
            # Smooth transition
            current_counts[zid] += (target - current_counts[zid]) * 0.1
            current_counts[zid] += random.uniform(-2, 2)
            density = max(0, int(current_counts[zid]))
            
            history[zid].append(density)
            if len(history[zid]) > 100: history[zid].pop(0)
            
            # Predict and Log to MongoDB
            pred, cri, surge = predict_and_store(zid, config, h, density)
            
            new_state[zid] = {
                "id": zid,
                "name": config["name"],
                "current": density,
                "capacity": config["capacity"],
                "predicted": pred,
                "cri": cri,
                "surge": surge,
                "risk_level": "CRITICAL" if cri >= 85 else "HIGH" if cri >= 70 else "MODERATE" if cri >= 50 else "LOW",
                "last_updated": now.strftime("%H:%M:%S")
            }
            
        latest_data = new_state
        time.sleep(5) # Slowed down for production stability

@app.on_event("startup")
def start_services():
    thread = threading.Thread(target=simulation_loop, daemon=True)
    thread.start()

# ── Standard API Routes ──

@app.get("/api/live")
def get_live():
    return latest_data

# ── Step 6: Create Historical APIs (FastAPI Implementation) ──

@app.get("/api/history/predictions")
def get_prediction_history(zone: Optional[str] = Query(None)):
    """Return last 50 prediction records sorted by timestamp desc."""
    query = {"zone": zone} if zone else {}
    cursor = predictions_collection.find(query).sort("timestamp", -1).limit(50)
    results = []
    for doc in cursor:
        doc["_id"] = str(doc["_id"])
        results.append(doc)
    return results

@app.get("/api/history/alerts")
def get_alert_history():
    """Return last 50 alerts."""
    cursor = alerts_collection.find().sort("timestamp", -1).limit(50)
    results = []
    for doc in cursor:
        doc["_id"] = str(doc["_id"])
        results.append(doc)
    return results

@app.get("/api/history/zone-metrics")
def get_zone_metrics(zone: str):
    """Return hourly aggregated averages (Calculated on the fly for demo)."""
    # In a full-prod system, we'd use MongoDB aggregations. 
    # Here we sample last 100 predictions to provide a trend.
    cursor = predictions_collection.find({"zone": zone}).sort("timestamp", -1).limit(100)
    results = []
    for doc in cursor:
        doc["_id"] = str(doc["_id"])
        results.append(doc)
    return results

if __name__ == "__main__":
    # Step 8 Compatibility
    port = int(os.getenv("PORT", 5000))
    uvicorn.run(app, host="0.0.0.0", port=port)
