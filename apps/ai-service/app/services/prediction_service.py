"""
Prediction Service
Orchestrates failure prediction using pre-trained models with explainable AI.
Loads RandomForest + GradientBoosting from disk at startup.
"""

import numpy as np
import json
import joblib
from pathlib import Path
from app.api.schemas import SensorInput, PredictionResult, RiskResult, AnomalyResult
from app.services.anomaly_service import AnomalyService

MODELS_DIR = Path(__file__).parent.parent.parent / "models"

FEATURE_NAMES = [
    "temperature", "vibration", "voltage", "current", "pressure",
    "rpm", "load", "power", "runtime_hours", "maintenance_gap_hours",
    "efficiency", "thermal_fluctuation", "vibration_instability",
    "temp_power_ratio", "vib_load_interaction",
    "power_efficiency_ratio", "thermal_stress", "mechanical_stress",
]

MAINTENANCE_SUGGESTIONS = {
    "bearing_failure": [
        "Inspect and replace worn bearings immediately",
        "Check shaft alignment and lubrication system",
        "Monitor vibration levels closely for 24 hours",
    ],
    "overheating": [
        "Inspect cooling system and clean air filters",
        "Check coolant levels and circulation pump",
        "Reduce operational load until temperature stabilizes",
    ],
    "lubrication_issues": [
        "Replenish lubrication in all contact points",
        "Inspect oil quality and filter condition",
        "Check lubrication pump and distribution lines",
    ],
    "power_instability": [
        "Inspect electrical connections and terminal blocks",
        "Check motor winding resistance and insulation",
        "Verify power supply voltage stability",
    ],
    "cooling_degradation": [
        "Clean or replace cooling system filters",
        "Inspect coolant flow rate and pump operation",
        "Check heat exchanger for blockages",
    ],
    "overload": [
        "Reduce machine load immediately",
        "Redistribute workload across available machines",
        "Inspect drive belt tension and motor capacity",
    ],
    "vibration_anomaly": [
        "Inspect foundation and mounting bolts",
        "Check for loose components or structural resonance",
        "Perform dynamic balancing on rotating components",
    ],
    "efficiency_degradation": [
        "Schedule comprehensive preventive maintenance",
        "Inspect all wear components and replace as needed",
        "Calibrate sensors and control systems",
    ],
    "motor_imbalance": [
        "Perform rotor balancing procedure",
        "Check stator/rotor alignment",
        "Inspect motor bearings and coupling",
    ],
    "none": [
        "Continue standard monitoring schedule",
        "No immediate action required",
    ],
}

EXPLANATION_TEMPLATES = {
    "temperature": "Temperature elevated at {val:.1f}C (threshold: {thresh}C) — indicates thermal stress",
    "vibration": "Vibration level at {val:.2f} mm/s (threshold: {thresh}) — suggests mechanical wear",
    "voltage": "Voltage dropped to {val:.1f}V (threshold: {thresh}V) — power supply instability",
    "load": "Load at {val:.1f}% (threshold: {thresh}%) — machine approaching capacity limits",
    "power": "Power consumption at {val:.1f}kW (threshold: {thresh}kW) — abnormal energy draw",
    "thermal_fluctuation": "Thermal fluctuation of {val:.2f} detected — cooling system may be degrading",
    "vibration_instability": "Vibration instability at {val:.2f} — bearing or alignment degradation",
    "efficiency": "Efficiency dropped to {val:.1f}% — progressive mechanical degradation detected",
    "pressure": "Pressure at {val:.1f} bar (threshold: {thresh} bar) — hydraulic system stress",
}


class PredictionService:
    def __init__(self):
        self.anomaly_service = AnomalyService()

        # Load pre-trained models
        self.failure_model = joblib.load(MODELS_DIR / "failure_classifier.pkl")
        self.risk_model = joblib.load(MODELS_DIR / "risk_scorer.pkl")
        self.scaler = joblib.load(MODELS_DIR / "scaler.pkl")

        # Load metadata
        with open(MODELS_DIR / "label_mapping.json") as f:
            self.label_mapping = json.load(f)
        with open(MODELS_DIR / "model_metadata.json") as f:
            self.model_metadata = json.load(f)
        with open(MODELS_DIR / "feature_importance.json") as f:
            self.feature_importance = json.load(f)
        with open(MODELS_DIR / "evaluation_metrics.json") as f:
            self.evaluation_metrics = json.load(f)

        # Invert label mappings
        self.failure_classes = {v: k for k, v in self.label_mapping["failure_types"].items()}
        self.state_classes = {v: k for k, v in self.label_mapping["states"].items()}

        print("[PredictionService] All pre-trained models loaded")

    def _build_features(self, data: SensorInput) -> np.ndarray:
        """Build full feature vector with engineered features."""
        base = [
            data.temperature, data.vibration, data.voltage, data.current,
            data.pressure, data.rpm, data.load, data.power,
            data.runtime_hours, data.maintenance_gap_hours,
            data.efficiency, data.thermal_fluctuation, data.vibration_instability,
        ]
        base.extend([
            data.temperature / (data.power + 0.01),
            data.vibration * data.load / 100,
            data.power / (data.efficiency + 0.01),
            data.thermal_fluctuation * data.temperature / 100,
            data.vibration_instability * data.vibration,
        ])
        return np.array([base])

    def _generate_explanation(self, data: SensorInput, anomaly: AnomalyResult,
                               failure_type: str, failure_prob: float) -> list:
        """Generate human-readable AI explanations."""
        explanations = []

        thresholds = {
            "temperature": 65, "vibration": 3.5, "voltage": 380,
            "load": 75, "power": 55, "thermal_fluctuation": 4.0,
            "vibration_instability": 1.5, "efficiency": 80, "pressure": 8.0,
        }

        if data.temperature > thresholds["temperature"]:
            explanations.append(EXPLANATION_TEMPLATES["temperature"].format(
                val=data.temperature, thresh=thresholds["temperature"]))
        if data.vibration > thresholds["vibration"]:
            explanations.append(EXPLANATION_TEMPLATES["vibration"].format(
                val=data.vibration, thresh=thresholds["vibration"]))
        if data.voltage < thresholds["voltage"]:
            explanations.append(EXPLANATION_TEMPLATES["voltage"].format(
                val=data.voltage, thresh=thresholds["voltage"]))
        if data.load > thresholds["load"]:
            explanations.append(EXPLANATION_TEMPLATES["load"].format(
                val=data.load, thresh=thresholds["load"]))
        if data.power > thresholds["power"]:
            explanations.append(EXPLANATION_TEMPLATES["power"].format(
                val=data.power, thresh=thresholds["power"]))
        if data.thermal_fluctuation > thresholds["thermal_fluctuation"]:
            explanations.append(EXPLANATION_TEMPLATES["thermal_fluctuation"].format(
                val=data.thermal_fluctuation, thresh=""))
        if data.vibration_instability > thresholds["vibration_instability"]:
            explanations.append(EXPLANATION_TEMPLATES["vibration_instability"].format(
                val=data.vibration_instability, thresh=""))
        if data.efficiency < thresholds["efficiency"]:
            explanations.append(EXPLANATION_TEMPLATES["efficiency"].format(
                val=data.efficiency, thresh=""))

        if failure_type != "none" and failure_prob > 30:
            explanations.append(
                f"ML model predicts '{failure_type.replace('_', ' ')}' "
                f"with {failure_prob:.1f}% confidence based on sensor pattern correlation"
            )

        if not explanations:
            explanations.append("All sensor readings within normal operational parameters")

        return explanations

    def predict(self, data: SensorInput) -> PredictionResult:
        """Generate full prediction with explainability."""
        features_raw = self._build_features(data)
        features_scaled = self.scaler.transform(features_raw)

        # Failure classification
        failure_proba = self.failure_model.predict_proba(features_scaled)[0]
        failure_pred = self.failure_model.predict(features_scaled)[0]
        failure_type = self.failure_classes.get(int(failure_pred), "none")

        # Max failure probability (excluding "none" class)
        none_idx = self.label_mapping["failure_types"].get("none", -1)
        failure_probs_without_none = [
            (prob, idx) for idx, prob in enumerate(failure_proba) if idx != none_idx
        ]
        max_failure_prob = max(failure_probs_without_none, key=lambda x: x[0])[0] * 100 if failure_probs_without_none else 0

        # If model predicts "none", use the highest non-none probability
        if failure_type == "none":
            failure_probability = max_failure_prob
        else:
            failure_probability = float(failure_proba[failure_pred]) * 100

        # Risk/state scoring
        state_proba = self.risk_model.predict_proba(features_scaled)[0]
        state_pred = self.risk_model.predict(features_scaled)[0]
        predicted_state = self.state_classes.get(int(state_pred), "healthy")

        # State probabilities
        state_probs = {}
        for idx, prob in enumerate(state_proba):
            state_name = self.state_classes.get(idx, f"state_{idx}")
            state_probs[state_name] = round(float(prob), 4)

        # Composite risk score
        risk_weights = {"healthy": 0, "warning": 40, "critical": 75, "failed": 100}
        risk_score = sum(state_probs.get(s, 0) * w for s, w in risk_weights.items())

        # Anomaly detection
        anomaly = self.anomaly_service.detect(data)

        # Boost risk if anomaly detected
        if anomaly.is_anomaly:
            risk_score = min(100, risk_score + anomaly.anomaly_score * 15)

        # Risk category
        if risk_score > 75:
            risk_category = "critical"
        elif risk_score > 50:
            risk_category = "high"
        elif risk_score > 25:
            risk_category = "moderate"
        else:
            risk_category = "healthy"

        # Confidence from probability distributions
        confidence_score = max(failure_proba) * max(state_proba)

        # Severity
        if risk_score > 75:
            severity = "critical"
        elif risk_score > 50:
            severity = "high"
        elif risk_score > 25:
            severity = "medium"
        else:
            severity = "low"

        # Predicted failure time
        predicted_failure_time = None
        estimated_downtime = 0.0
        if failure_probability > 30:
            hours = max(0.5, (100 - failure_probability) / 10)
            predicted_failure_time = f"{hours:.1f} hours"
            estimated_downtime = round(hours * 0.8, 1)

        # Feature contributions (importance * deviation)
        feature_contributions = {}
        importance_dict = self.feature_importance.get("failure_classifier", {})
        for i, name in enumerate(FEATURE_NAMES):
            importance = importance_dict.get(name, 0)
            deviation = abs(float(features_scaled[0][i]))
            contribution = importance * deviation
            if contribution > 0.01:
                feature_contributions[name] = round(contribution, 4)
        # Sort by contribution
        feature_contributions = dict(
            sorted(feature_contributions.items(), key=lambda x: x[1], reverse=True)
        )

        # Explanations
        explanation = self._generate_explanation(data, anomaly, failure_type, failure_probability)

        # Suggestions
        suggestions = MAINTENANCE_SUGGESTIONS.get(failure_type, MAINTENANCE_SUGGESTIONS["none"])

        return PredictionResult(
            machine_id=data.machine_id,
            failure_probability=round(failure_probability, 1),
            risk_score=round(risk_score, 1),
            risk_category=risk_category,
            health_score=round(max(0, 100 - risk_score), 1),
            predicted_failure_type=failure_type,
            predicted_failure_time=predicted_failure_time,
            confidence_score=round(confidence_score, 3),
            severity_level=severity,
            estimated_downtime_hours=estimated_downtime,
            anomaly=anomaly,
            suggestions=suggestions,
            explanation=explanation,
            feature_contributions=feature_contributions,
            model_used="rf-v2-pretrained + gb-v2-pretrained + if-v2-pretrained",
            model_metadata={
                "training_date": self.model_metadata.get("training_date", ""),
                "dataset_size": self.model_metadata.get("dataset_size", 0),
                "failure_accuracy": self.model_metadata["models"]["failure_classifier"]["test_accuracy"],
                "risk_accuracy": self.model_metadata["models"]["risk_scorer"]["test_accuracy"],
            },
        )

    def calculate_risk(self, data: SensorInput) -> RiskResult:
        """Calculate detailed risk score with state probabilities."""
        features_raw = self._build_features(data)
        features_scaled = self.scaler.transform(features_raw)

        state_proba = self.risk_model.predict_proba(features_scaled)[0]
        state_probs = {}
        for idx, prob in enumerate(state_proba):
            state_name = self.state_classes.get(idx, f"state_{idx}")
            state_probs[state_name] = round(float(prob), 4)

        risk_weights = {"healthy": 0, "warning": 40, "critical": 75, "failed": 100}
        risk_score = sum(state_probs.get(s, 0) * w for s, w in risk_weights.items())

        anomaly = self.anomaly_service.detect(data)
        if anomaly.is_anomaly:
            risk_score = min(100, risk_score + anomaly.anomaly_score * 15)

        # Contributing factors
        factors = []
        if data.temperature > 65:
            factors.append({"sensor": "temperature", "value": data.temperature,
                           "impact": "high" if data.temperature > 80 else "medium"})
        if data.vibration > 3.5:
            factors.append({"sensor": "vibration", "value": data.vibration,
                           "impact": "high" if data.vibration > 5.5 else "medium"})
        if data.load > 70:
            factors.append({"sensor": "load", "value": data.load,
                           "impact": "high" if data.load > 85 else "medium"})
        if data.voltage < 380:
            factors.append({"sensor": "voltage", "value": data.voltage,
                           "impact": "high" if data.voltage < 365 else "medium"})
        if data.thermal_fluctuation > 4:
            factors.append({"sensor": "thermal_fluctuation", "value": data.thermal_fluctuation,
                           "impact": "high" if data.thermal_fluctuation > 8 else "medium"})
        if data.vibration_instability > 1.5:
            factors.append({"sensor": "vibration_instability", "value": data.vibration_instability,
                           "impact": "high" if data.vibration_instability > 3 else "medium"})

        if risk_score > 75:
            risk_category = "critical"
        elif risk_score > 50:
            risk_category = "high"
        elif risk_score > 25:
            risk_category = "moderate"
        else:
            risk_category = "healthy"

        return RiskResult(
            machine_id=data.machine_id,
            risk_score=round(risk_score, 1),
            risk_category=risk_category,
            contributing_factors=factors,
            state_probabilities=state_probs,
        )

    def get_model_info(self):
        """Return model metadata for monitoring panel."""
        return {
            "models_loaded": True,
            "training_date": self.model_metadata.get("training_date", ""),
            "dataset_size": self.model_metadata.get("dataset_size", 0),
            "feature_count": self.model_metadata.get("feature_count", 0),
            "models": self.model_metadata.get("models", {}),
            "evaluation_metrics": self.evaluation_metrics,
            "feature_importance": self.feature_importance,
        }
