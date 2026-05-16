"""
Model Training Pipeline
========================
Trains and serializes 3 production ML models:
1. IsolationForest — Anomaly detection
2. RandomForestClassifier — Failure type classification
3. GradientBoostingClassifier — Risk/state scoring

Architecture note: GradientBoosting can be swapped for XGBoost
by changing the import and class name. The interface is identical.
"""

import numpy as np
import json
import joblib
from pathlib import Path
from datetime import datetime
from sklearn.ensemble import (
    IsolationForest,
    RandomForestClassifier,
    GradientBoostingClassifier,
)

from preprocess import load_and_preprocess
from dataset_generator import generate_dataset


def train_all_models():
    """Train all models and save artifacts."""
    models_dir = Path(__file__).parent.parent / "models"
    models_dir.mkdir(parents=True, exist_ok=True)

    print("\n" + "=" * 60)
    print("  ZERO DOWNTIME AI — Model Training Pipeline")
    print("=" * 60)

    # ── Step 0: Generate dataset if not exists ──
    dataset_path = Path(__file__).parent.parent / "datasets" / "industrial_telemetry.csv"
    if not dataset_path.exists():
        print("\n[0/4] Dataset not found. Generating...")
        generate_dataset()

    # ── Step 1: Preprocess ──
    print("\n[1/4] Loading and preprocessing data...")
    data = load_and_preprocess()

    X_train = data["X_train"]
    X_test = data["X_test"]
    feature_names = data["feature_names"]

    # ────────────────────────────────────────────────────────────
    # MODEL 1: Isolation Forest (Anomaly Detection)
    # ────────────────────────────────────────────────────────────
    print("\n[2/4] Training Isolation Forest (anomaly detection)...")

    # Train on healthy data only for better anomaly detection
    healthy_mask = data["y_anomaly_train"] == 0
    X_healthy = X_train[healthy_mask]

    anomaly_detector = IsolationForest(
        n_estimators=200,
        contamination=0.08,
        max_features=0.8,
        max_samples="auto",
        random_state=42,
        n_jobs=-1,
    )
    anomaly_detector.fit(X_healthy)
    joblib.dump(anomaly_detector, models_dir / "anomaly_detector.pkl")

    # Quick evaluation
    train_preds = anomaly_detector.predict(X_train)
    train_anomaly_rate = (train_preds == -1).mean()
    print(f"  ✓ Isolation Forest trained on {len(X_healthy)} healthy samples")
    print(f"  ✓ Train anomaly rate: {train_anomaly_rate:.3f}")
    print(f"  ✓ Saved → anomaly_detector.pkl")

    # ────────────────────────────────────────────────────────────
    # MODEL 2: Random Forest (Failure Type Classification)
    # ────────────────────────────────────────────────────────────
    print("\n[3/4] Training Random Forest (failure classification)...")

    failure_classifier = RandomForestClassifier(
        n_estimators=200,
        max_depth=15,
        min_samples_split=5,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )
    failure_classifier.fit(X_train, data["y_failure_train"])
    joblib.dump(failure_classifier, models_dir / "failure_classifier.pkl")

    train_acc = failure_classifier.score(X_train, data["y_failure_train"])
    test_acc = failure_classifier.score(X_test, data["y_failure_test"])
    print(f"  ✓ Random Forest trained")
    print(f"  ✓ Train accuracy: {train_acc:.4f}")
    print(f"  ✓ Test accuracy:  {test_acc:.4f}")
    print(f"  ✓ Saved → failure_classifier.pkl")

    # Feature importance
    rf_importance = dict(zip(feature_names, failure_classifier.feature_importances_.tolist()))
    rf_importance_sorted = dict(sorted(rf_importance.items(), key=lambda x: x[1], reverse=True))

    # ────────────────────────────────────────────────────────────
    # MODEL 3: Gradient Boosting (Risk/State Scoring)
    # ────────────────────────────────────────────────────────────
    # NOTE: To swap for XGBoost, replace GradientBoostingClassifier
    # with xgboost.XGBClassifier. The .fit()/.predict() API is identical.
    print("\n[4/4] Training Gradient Boosting (risk scoring)...")

    risk_scorer = GradientBoostingClassifier(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.8,
        min_samples_split=5,
        random_state=42,
    )
    risk_scorer.fit(X_train, data["y_state_train"])
    joblib.dump(risk_scorer, models_dir / "risk_scorer.pkl")

    risk_train_acc = risk_scorer.score(X_train, data["y_state_train"])
    risk_test_acc = risk_scorer.score(X_test, data["y_state_test"])
    print(f"  ✓ Gradient Boosting trained")
    print(f"  ✓ Train accuracy: {risk_train_acc:.4f}")
    print(f"  ✓ Test accuracy:  {risk_test_acc:.4f}")
    print(f"  ✓ Saved → risk_scorer.pkl")

    # Feature importance from GBM
    gb_importance = dict(zip(feature_names, risk_scorer.feature_importances_.tolist()))
    gb_importance_sorted = dict(sorted(gb_importance.items(), key=lambda x: x[1], reverse=True))

    # ── Save combined feature importance ──
    feature_importance = {
        "failure_classifier": rf_importance_sorted,
        "risk_scorer": gb_importance_sorted,
        "top_features": list(rf_importance_sorted.keys())[:5],
    }
    with open(models_dir / "feature_importance.json", "w") as f:
        json.dump(feature_importance, f, indent=2)

    # ── Save model metadata ──
    metadata = {
        "training_date": datetime.now().isoformat(),
        "dataset_size": len(X_train) + len(X_test),
        "train_size": len(X_train),
        "test_size": len(X_test),
        "feature_count": len(feature_names),
        "feature_names": feature_names,
        "models": {
            "anomaly_detector": {
                "type": "IsolationForest",
                "library": "scikit-learn",
                "n_estimators": 200,
                "contamination": 0.08,
                "trained_on": "healthy_samples_only",
                "healthy_sample_count": int(len(X_healthy)),
            },
            "failure_classifier": {
                "type": "RandomForestClassifier",
                "library": "scikit-learn",
                "n_estimators": 200,
                "max_depth": 15,
                "train_accuracy": round(train_acc, 4),
                "test_accuracy": round(test_acc, 4),
                "classes": data["label_encoder_failure"].classes_.tolist(),
                "swappable_with": "XGBClassifier",
            },
            "risk_scorer": {
                "type": "GradientBoostingClassifier",
                "library": "scikit-learn",
                "n_estimators": 200,
                "learning_rate": 0.1,
                "train_accuracy": round(risk_train_acc, 4),
                "test_accuracy": round(risk_test_acc, 4),
                "classes": data["label_encoder_state"].classes_.tolist(),
                "swappable_with": "XGBClassifier",
            },
        },
    }
    with open(models_dir / "model_metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"\n{'=' * 60}")
    print(f"  All models trained and saved!")
    print(f"  Models directory: {models_dir}")
    print(f"  Files: anomaly_detector.pkl, failure_classifier.pkl,")
    print(f"         risk_scorer.pkl, scaler.pkl, *.json")
    print(f"{'=' * 60}\n")

    return metadata


if __name__ == "__main__":
    train_all_models()
