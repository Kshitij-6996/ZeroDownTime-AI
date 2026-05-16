"""
AI API Routes — Expanded with model-info and explain endpoints.
"""

from fastapi import APIRouter
from app.api.schemas import (
    SensorInput, PredictionResult, AnomalyResult,
    RiskResult, HealthResponse, ModelInfoResponse,
)
from app.services.prediction_service import PredictionService

router = APIRouter()
prediction_service = PredictionService()
anomaly_service = prediction_service.anomaly_service


@router.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="ok",
        service="zero-downtime-ai-engine",
        models_loaded=True,
        model_count=3,
    )


@router.post("/predict", response_model=PredictionResult)
async def predict_failure(data: SensorInput):
    """Predict machine failure with explainability."""
    return prediction_service.predict(data)


@router.post("/anomaly", response_model=AnomalyResult)
async def detect_anomaly(data: SensorInput):
    """Detect anomalies in sensor data."""
    return anomaly_service.detect(data)


@router.post("/risk", response_model=RiskResult)
async def calculate_risk(data: SensorInput):
    """Calculate risk score with state probabilities."""
    return prediction_service.calculate_risk(data)


@router.post("/batch-predict")
async def batch_predict(data: list[SensorInput]):
    """Predict failures for multiple machines."""
    results = [prediction_service.predict(d) for d in data]
    return {"predictions": results, "count": len(results)}


@router.get("/model-info")
async def get_model_info():
    """Get model metadata, metrics, and feature importance."""
    return prediction_service.get_model_info()


@router.post("/explain")
async def explain_prediction(data: SensorInput):
    """Get detailed AI explanation for a prediction."""
    prediction = prediction_service.predict(data)
    return {
        "machine_id": data.machine_id,
        "prediction": {
            "failure_type": prediction.predicted_failure_type,
            "failure_probability": prediction.failure_probability,
            "risk_score": prediction.risk_score,
            "confidence": prediction.confidence_score,
        },
        "explanation": prediction.explanation,
        "feature_contributions": prediction.feature_contributions,
        "suggestions": prediction.suggestions,
        "anomaly": {
            "is_anomaly": prediction.anomaly.is_anomaly,
            "score": prediction.anomaly.anomaly_score,
            "flagged_sensors": prediction.anomaly.anomalous_sensors,
        },
    }
