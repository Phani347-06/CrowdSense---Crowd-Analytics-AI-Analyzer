from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd

# -----------------------------
# Load model safely
# -----------------------------
package = joblib.load("smart_crowd_per_location_model.pkl")

model = None
le = None
features = None

# Case 1: dictionary structure
if isinstance(package, dict):
    model = package.get("model") or package.get("regressor") or package
    le = package.get("label_encoder", None)
    features = package.get("features", None)

# Case 2: model saved directly
else:
    model = package
    le = None
    features = None

# -----------------------------
# FastAPI setup
# -----------------------------
app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Input schema
# -----------------------------
class CrowdInput(BaseModel):
    location: str
    hour: int
    weekday: int
    rssi: float
    value: float
    prev_density: float
    prev2_density: float
    rolling_mean_3: float


# -----------------------------
# Home route
# -----------------------------
@app.get("/")
def home():
    return {"message": "CrowdSense API running"}


# -----------------------------
# Prediction route
# -----------------------------
@app.post("/predict")
def predict(data: CrowdInput):
    try:
        # Encode location if encoder exists
        if le:
            try:
                encoded_location = le.transform([data.location])[0]
            except:
                return {
                    "error": f"Unknown location: {data.location}",
                    "known_locations": list(le.classes_)
                }
        else:
            encoded_location = 0  # fallback if no encoder

        # Create input dataframe
        input_data = pd.DataFrame([{
            "location": encoded_location,
            "hour": data.hour,
            "weekday": data.weekday,
            "rssi": data.rssi,
            "value": data.value,
            "prev_density": data.prev_density,
            "prev2_density": data.prev2_density,
            "rolling_mean_3": data.rolling_mean_3
        }])

        # Ensure correct feature order if available
        if features:
            input_data = input_data[features]

        # Predict
        prediction = model.predict(input_data)[0]

        return {
            "location": data.location,
            "predicted_density": float(prediction)
        }

    except Exception as e:
        return {"error": str(e)}
