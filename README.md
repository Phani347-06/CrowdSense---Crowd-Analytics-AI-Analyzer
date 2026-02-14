# 🌐 CrowdSense — Smart Campus Analytics & AI Predictor

**CrowdSense** is a state-of-the-art real-time crowd monitoring and predictive analytics platform designed for large-scale campus environments. Leveraging machine learning (XGBoost) and live simulation engines, it provides actionable insights into crowd density, risk factors, and future congestion trends.

---

## 🚀 Key Features

### 📊 Real-Time Dashboard
- **Campus Density Map**: Interactive visualization of live crowd distribution using OpenStreetMap.
- **Micro-Animations**: Vibrant UI with glassmorphism effects and smooth transitions.
- **Live Metrics**: Real-time tracking of device counts, estimated people, and the **Campus Risk Index (CRI)**.

### 🤖 AI-Powered Predictions
- **XGBoost Integration**: Robust ML models predicting density 24 hours in advance with high performance.
- **Time Travel**: Forecast mode allows administrators to scrub through future timelines (20-day range) to spot potential bottlenecks.
- **Trend Synchronization**: Actual vs. Predicted charts for historical accuracy verification.

### 🎟️ Event Control System
- **Zone Management**: Dynamically adjust capacity limits for campus areas (Libraries, Canteens, PG Blocks).
- **Broadcast Alerts**: Instant emergency notification system to coordinate with campus security.
- **Registration Pipeline**: Manage participant approvals and automated communication flows.

### 🛡️ Production-Grade Backend
- **MongoDB Atlas Integration**: Secured with persistent cloud storage for trends, logs, and user data.
- **Scalable Architecture**: Flexible deployment ready for Render (Auto-scaling & Environment-driven ports).

---

## 🛠️ Tech Stack

### **Frontend**
- **React 18** (Vite)
- **Tailwind CSS** (Custom Design System)
- **Lucide React** (Unified Iconography)
- **Chart.js** (Live Time-Series Data)

### **Backend**
- **Python / Flask**
- **XGBoost** (Machine Learning)
- **MongoDB Atlas** (Database)
- **Certifi / Pymongo** (Secure Cloud Connectivity)
- **Joblib / Pandas / Numpy** (Data Processing)

---

## 📂 Project Structure

```text
├── backend/            # Python Flask Application
│   ├── app.py          # Main Entry Point & Simulation Engine
│   ├── database.py     # MongoDB Connection & Logging
│   ├── ml_models/      # Pre-trained XGBoost Models
│   └── .env            # Private Credentials
├── frontend/           # React Application
│   ├── src/
│   │   ├── pages/      # Dashboard, Prediction, Events
│   │   ├── components/ # Header, Sidebar, Maps
│   │   └── apiConfig.js# Dynamic API Switching (Local vs Cloud)
└── README.md
```

---

## ⚙️ Installation & Setup

### **1. Prerequisites**
- Python 3.9+
- Node.js 18+
- MongoDB Atlas Account

### **2. Setup Backend**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### **3. Setup Frontend**
```bash
cd frontend
npm install
npm run dev
```

---

## 🌍 Deployment Environment

### **Required `.env` Variables**
Ensure these are set in your local `.env` and **Render Dashboard**:
- `MONGO_URI`: Your MongoDB Atlas connection string.
- `EMAIL_ADDRESS`: SMTP Alert Sender.
- `EMAIL_PASSWORD`: App-specific password.
- `FRONTEND_URL`: Production URL for CORS.
- `PORT`: Automatically handled by Render (Default: 5000).

---

## 📝 License
Proprietary — Developed for Campus Ideathon by **Phani Sri Southu**.
