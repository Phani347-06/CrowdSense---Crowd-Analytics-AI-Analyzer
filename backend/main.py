from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random
import hashlib
import datetime
import time
import pandas as pd
import threading
import uvicorn

app = FastAPI()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
COLLEGE_START = 8 
COLLEGE_END = 20

# Updated locations to match Frontend
LOCATIONS = {
    "New Block": {"id": "newblock", "capacity": 300, "base": 150},
    "Academic Block D": {"id": "dblock", "capacity": 400, "base": 200},
    "PG Block": {"id": "pg", "capacity": 150, "base": 80},
    "Student Canteen": {"id": "canteen", "capacity": 200, "base": 100},
    "Main Library": {"id": "lib", "capacity": 500, "base": 250}
}
FLOORS = ["Floor 1", "Floor 2", "Floor 3", "Floor 4"]

# Shared state to store latest data
latest_data = {}

def generate_hash():
    return hashlib.sha256(str(random.random()).encode()).hexdigest()[:10]

def realistic_rssi():
    return random.randint(-85, -45)

def realistic_connection_time():
    return random.randint(60, 3600)

def time_multiplier(hour):
    if 9 <= hour <= 10: return 1.2
    elif 12 <= hour <= 14: return 1.8
    elif 16 <= hour <= 17: return 1.15
    elif hour >= 18: return 0.6
    return 1.0

def simulation_loop():
    global latest_data
    current_time = datetime.datetime.now().replace(hour=COLLEGE_START, minute=0, second=0, microsecond=0)
    
    print("Starting Simulation Loop...")
    
    while True:
        # Reset day if past end time
        if current_time.hour > COLLEGE_END:
            current_time = datetime.datetime.now().replace(hour=COLLEGE_START, minute=0, second=0)

        live_batch = []
        new_state = {}

        for name, config in LOCATIONS.items():
            base = config["base"]
            capacity = config["capacity"]
            region_id = config["id"]

            noise = random.uniform(0.9, 1.1)
            multiplier = time_multiplier(current_time.hour)
            
            density = int(base * multiplier * noise)
            density = min(density, int(capacity * 1.25)) # Cap at 125%
            
            # Ensure non-negative
            density = max(0, density)
            
            ratio = round(density / capacity, 2)
            
            # Determine Status
            status = "Low Activity"
            status_color = "text-green-500"
            if ratio >= 0.9:
                status = "High Congestion"
                status_color = "text-red-500"
            elif ratio >= 0.6:
                status = "Moderate"
                status_color = "text-amber-500"

            # Create record for frontend state
            new_state[region_id] = {
                "id": region_id,
                "name": name,
                "current": density,
                "capacity": capacity,
                "status": status,
                "statusColor": status_color,
                "last_updated": current_time.strftime("%H:%M")
            }

            # Generate individual device records (as per original script request)
            # We don't necessarily send 1000s of records to frontend every sec, 
            # but we simulate the generation for the CSV log.
            for _ in range(min(density, 10)): # Limit log generation for performance in this demo
                 record = {
                    "timestamp": current_time,
                    "device_hash": generate_hash(),
                    "location": name,
                    "floor": random.choice(FLOORS),
                    "rssi": realistic_rssi(),
                    "val": capacity
                }
                 live_batch.append(record)

        # Update global state safely
        latest_data = new_state
        
        # Save to CSV (Appended)
        if live_batch:
            df = pd.DataFrame(live_batch)
            df.to_csv("live_stream.csv", mode='a', header=False, index=False)

        # Advance time
        current_time += datetime.timedelta(minutes=5)
        
        # Sleep
        time.sleep(2)

@app.on_event("startup")
def start_simulation():
    thread = threading.Thread(target=simulation_loop, daemon=True)
    thread.start()

@app.get("/live-data")
def get_live_data():
    return latest_data

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
