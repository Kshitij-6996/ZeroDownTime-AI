"""
Zero Downtime AI -- AI Service
FastAPI application with pre-trained model loading at startup.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from pathlib import Path
import json

app = FastAPI(
    title="Zero Downtime AI -- AI Service",
    description="Industrial AI prediction engine with pre-trained ML models for anomaly detection, failure prediction, and risk scoring",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(router, prefix="/api")

MODELS_DIR = Path(__file__).parent.parent / "models"


@app.get("/")
async def root():
    # Load model metadata
    metadata = {}
    meta_path = MODELS_DIR / "model_metadata.json"
    if meta_path.exists():
        with open(meta_path) as f:
            metadata = json.load(f)

    return {
        "service": "Zero Downtime AI -- AI Engine",
        "version": "2.0.0",
        "status": "operational",
        "models_loaded": True,
        "training_date": metadata.get("training_date", "unknown"),
        "dataset_size": metadata.get("dataset_size", 0),
        "model_count": 3,
        "models": ["IsolationForest", "RandomForestClassifier", "GradientBoostingClassifier"],
        "endpoints": {
            "predict": "/api/predict",
            "anomaly": "/api/anomaly",
            "risk": "/api/risk",
            "explain": "/api/explain",
            "model_info": "/api/model-info",
            "batch_predict": "/api/batch-predict",
            "health": "/api/health",
            "docs": "/docs",
        },
    }
