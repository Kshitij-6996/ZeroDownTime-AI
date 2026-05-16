"""
Anomaly Detection Service
Uses pre-trained Isolation Forest loaded from disk.
Provides explainable anomaly detection with feature contributions.
"""

import numpy as np
import joblib
import json
from pathlib import Path
from app.api.schemas import SensorInput, AnomalyResult

MODELS_DIR = Path(__file__).parent.parent.parent / "models"

FEATURE_NAMES = [
    "temperature", "vibration", "voltage", "current", "pressure",
    "rpm", "load", "power", "runtime_hours", "maintenance_gap_hours",
    "efficiency", "thermal_fluctuation", "vibration_instability",
    "temp_power_ratio", "vib_load_interaction",
    "power_efficiency_ratio", "thermal_stress", "mechanical_stress",
]

# Sensor thresholds for individual anomaly flagging
THRESHOLDS = {
    "temperature": {"warn": 65, "crit": 85},
    "vibration": {"warn": 3.5, "crit": 6.0},
    "voltage_low": {"warn": 380, "crit": 365},
    "pressure": {"warn": 8.0, "crit": 12.0},
    "load": {"warn": 75, "crit": 90},
    "power": {"warn": 55, "crit": 80},
    "thermal_fluctuation": {"warn": 4.0, "crit": 8.0},
    "vibration_instability": {"warn": 1.5, "crit": 3.0},
}


class AnomalyService:
    def __init__(self):
        self.model = joblib.load(MODELS_DIR / "anomaly_detector.pkl")
        self.scaler = joblib.load(MODELS_DIR / "scaler.pkl")
        print("[AnomalyService] Pre-trained Isolation Forest loaded")

    def _build_features(self, data: SensorInput) -> np.ndarray:
        """Build full feature vector with engineered features."""
        base = [
            data.temperature, data.vibration, data.voltage, data.current,
            data.pressure, data.rpm, data.load, data.power,
            data.runtime_hours, data.maintenance_gap_hours,
            data.efficiency, data.thermal_fluctuation, data.vibration_instability,
        ]
        # Engineered features (same as training)
        temp_power_ratio = data.temperature / (data.power + 0.01)
        vib_load_interaction = data.vibration * data.load / 100
        power_efficiency_ratio = data.power / (data.efficiency + 0.01)
        thermal_stress = data.thermal_fluctuation * data.temperature / 100
        mechanical_stress = data.vibration_instability * data.vibration

        base.extend([temp_power_ratio, vib_load_interaction,
                     power_efficiency_ratio, thermal_stress, mechanical_stress])
        return np.array([base])

    def detect(self, data: SensorInput) -> AnomalyResult:
        """Detect anomalies with explainability."""
        features_raw = self._build_features(data)
        features_scaled = self.scaler.transform(features_raw)

        # Isolation Forest prediction
        prediction = self.model.predict(features_scaled)[0]
        anomaly_score = float(-self.model.score_samples(features_scaled)[0])

        # Identify anomalous sensors via thresholds
        anomalous_sensors = []
        if data.temperature > THRESHOLDS["temperature"]["warn"]:
            anomalous_sensors.append("temperature")
        if data.vibration > THRESHOLDS["vibration"]["warn"]:
            anomalous_sensors.append("vibration")
        if data.voltage < THRESHOLDS["voltage_low"]["warn"]:
            anomalous_sensors.append("voltage")
        if data.pressure > THRESHOLDS["pressure"]["warn"]:
            anomalous_sensors.append("pressure")
        if data.load > THRESHOLDS["load"]["warn"]:
            anomalous_sensors.append("load")
        if data.power > THRESHOLDS["power"]["warn"]:
            anomalous_sensors.append("power")
        if data.thermal_fluctuation > THRESHOLDS["thermal_fluctuation"]["warn"]:
            anomalous_sensors.append("thermal_fluctuation")
        if data.vibration_instability > THRESHOLDS["vibration_instability"]["warn"]:
            anomalous_sensors.append("vibration_instability")

        is_anomaly = prediction == -1 or len(anomalous_sensors) >= 2

        # Feature contributions (deviation from mean in scaled space)
        feature_contributions = {}
        for i, name in enumerate(FEATURE_NAMES):
            deviation = abs(float(features_scaled[0][i]))
            if deviation > 1.0:  # more than 1 std from mean
                feature_contributions[name] = round(deviation, 3)

        confidence = min(1.0, anomaly_score / 0.55)

        return AnomalyResult(
            is_anomaly=is_anomaly,
            anomaly_score=round(anomaly_score, 4),
            anomalous_sensors=anomalous_sensors,
            confidence=round(float(confidence), 3),
            feature_contributions=feature_contributions,
        )
