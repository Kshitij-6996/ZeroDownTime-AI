"""
Pydantic schemas for API request/response models.
Expanded with explainability, confidence, and feature contributions.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum


class RiskCategory(str, Enum):
    HEALTHY = "healthy"
    MODERATE = "moderate"
    HIGH = "high"
    CRITICAL = "critical"


class SensorInput(BaseModel):
    """Input sensor data for prediction."""
    machine_id: str = Field(..., description="Machine identifier")
    temperature: float = Field(default=50, ge=0, le=200)
    vibration: float = Field(default=2.0, ge=0, le=20)
    voltage: float = Field(default=400, ge=0, le=500)
    current: float = Field(default=5.0, ge=0, le=50)
    pressure: float = Field(default=5.0, ge=0, le=500)
    rpm: float = Field(default=3000, ge=0, le=20000)
    power: float = Field(default=30, ge=0, le=200)
    load: float = Field(default=50, ge=0, le=100)
    runtime_hours: float = Field(default=1000, ge=0, le=50000)
    maintenance_gap_hours: float = Field(default=200, ge=0, le=5000)
    efficiency: float = Field(default=92, ge=0, le=100)
    thermal_fluctuation: float = Field(default=1.0, ge=0, le=50)
    vibration_instability: float = Field(default=0.3, ge=0, le=10)


class AnomalyResult(BaseModel):
    """Result of anomaly detection."""
    is_anomaly: bool
    anomaly_score: float
    anomalous_sensors: List[str]
    confidence: float
    feature_contributions: Dict[str, float] = {}


class PredictionResult(BaseModel):
    """Full prediction result with explainability."""
    machine_id: str
    failure_probability: float
    risk_score: float
    risk_category: RiskCategory
    health_score: float
    predicted_failure_type: str = "none"
    predicted_failure_time: Optional[str] = None
    confidence_score: float = 0.0
    severity_level: str = "low"
    estimated_downtime_hours: float = 0.0
    anomaly: AnomalyResult
    suggestions: List[str]
    explanation: List[str] = []
    feature_contributions: Dict[str, float] = {}
    model_used: str
    model_metadata: Dict[str, Any] = {}


class RiskResult(BaseModel):
    """Risk scoring result."""
    machine_id: str
    risk_score: float
    risk_category: RiskCategory
    contributing_factors: List[dict]
    state_probabilities: Dict[str, float] = {}


class ModelInfoResponse(BaseModel):
    """Model info for monitoring panel."""
    models_loaded: bool
    training_date: str
    dataset_size: int
    feature_count: int
    models: Dict[str, Any]
    evaluation_metrics: Dict[str, Any]
    feature_importance: Dict[str, Any]


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    service: str
    models_loaded: bool
    model_count: int = 0
