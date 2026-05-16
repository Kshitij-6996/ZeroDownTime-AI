"""
Model Evaluation Pipeline
==========================
Generates comprehensive evaluation metrics for all trained models.
"""

import numpy as np
import json
import joblib
from pathlib import Path
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
)

from preprocess import load_and_preprocess


def evaluate_all_models():
    """Evaluate all trained models and save metrics."""
    models_dir = Path(__file__).parent.parent / "models"

    print("\n" + "=" * 60)
    print("  ZERO DOWNTIME AI — Model Evaluation")
    print("=" * 60)

    # ── Load preprocessed data ──
    print("\n[1/4] Loading preprocessed data...")
    data = load_and_preprocess()
    X_test = data["X_test"]

    # ── Load models ──
    print("[2/4] Loading trained models...")
    anomaly_detector = joblib.load(models_dir / "anomaly_detector.pkl")
    failure_classifier = joblib.load(models_dir / "failure_classifier.pkl")
    risk_scorer = joblib.load(models_dir / "risk_scorer.pkl")
    le_failure = data["label_encoder_failure"]
    le_state = data["label_encoder_state"]

    metrics = {}

    # ────────────────────────────────────────────────────────────
    # Evaluate Anomaly Detector
    # ────────────────────────────────────────────────────────────
    print("\n[3/4] Evaluating Anomaly Detector...")
    anom_preds = anomaly_detector.predict(X_test)
    anom_binary = (anom_preds == -1).astype(int)  # -1 = anomaly → 1
    y_anom_true = data["y_anomaly_test"]

    anom_metrics = {
        "accuracy": round(float(accuracy_score(y_anom_true, anom_binary)), 4),
        "precision": round(float(precision_score(y_anom_true, anom_binary, zero_division=0)), 4),
        "recall": round(float(recall_score(y_anom_true, anom_binary, zero_division=0)), 4),
        "f1": round(float(f1_score(y_anom_true, anom_binary, zero_division=0)), 4),
        "total_samples": int(len(y_anom_true)),
        "true_anomalies": int(y_anom_true.sum()),
        "detected_anomalies": int(anom_binary.sum()),
    }
    metrics["anomaly_detector"] = anom_metrics
    print(f"  Accuracy:  {anom_metrics['accuracy']}")
    print(f"  Precision: {anom_metrics['precision']}")
    print(f"  Recall:    {anom_metrics['recall']}")
    print(f"  F1:        {anom_metrics['f1']}")

    # ────────────────────────────────────────────────────────────
    # Evaluate Failure Classifier
    # ────────────────────────────────────────────────────────────
    print("\n[4/4] Evaluating Failure Classifier...")
    fail_preds = failure_classifier.predict(X_test)
    y_fail_true = data["y_failure_test"]

    fail_report = classification_report(
        y_fail_true, fail_preds,
        target_names=le_failure.classes_,
        output_dict=True,
        zero_division=0,
    )

    fail_cm = confusion_matrix(y_fail_true, fail_preds)

    fail_metrics = {
        "accuracy": round(float(accuracy_score(y_fail_true, fail_preds)), 4),
        "precision_macro": round(float(precision_score(y_fail_true, fail_preds, average="macro", zero_division=0)), 4),
        "recall_macro": round(float(recall_score(y_fail_true, fail_preds, average="macro", zero_division=0)), 4),
        "f1_macro": round(float(f1_score(y_fail_true, fail_preds, average="macro", zero_division=0)), 4),
        "f1_weighted": round(float(f1_score(y_fail_true, fail_preds, average="weighted", zero_division=0)), 4),
        "per_class": {},
        "confusion_matrix": fail_cm.tolist(),
        "class_names": le_failure.classes_.tolist(),
    }
    for cls_name in le_failure.classes_:
        if cls_name in fail_report:
            fail_metrics["per_class"][cls_name] = {
                "precision": round(fail_report[cls_name]["precision"], 4),
                "recall": round(fail_report[cls_name]["recall"], 4),
                "f1": round(fail_report[cls_name]["f1-score"], 4),
                "support": int(fail_report[cls_name]["support"]),
            }

    metrics["failure_classifier"] = fail_metrics
    print(f"  Accuracy:       {fail_metrics['accuracy']}")
    print(f"  F1 (macro):     {fail_metrics['f1_macro']}")
    print(f"  F1 (weighted):  {fail_metrics['f1_weighted']}")

    # ────────────────────────────────────────────────────────────
    # Evaluate Risk Scorer
    # ────────────────────────────────────────────────────────────
    print("\n  Evaluating Risk Scorer...")
    state_preds = risk_scorer.predict(X_test)
    y_state_true = data["y_state_test"]

    state_report = classification_report(
        y_state_true, state_preds,
        target_names=le_state.classes_,
        output_dict=True,
        zero_division=0,
    )

    state_metrics = {
        "accuracy": round(float(accuracy_score(y_state_true, state_preds)), 4),
        "f1_macro": round(float(f1_score(y_state_true, state_preds, average="macro", zero_division=0)), 4),
        "f1_weighted": round(float(f1_score(y_state_true, state_preds, average="weighted", zero_division=0)), 4),
        "per_class": {},
        "class_names": le_state.classes_.tolist(),
    }
    for cls_name in le_state.classes_:
        if cls_name in state_report:
            state_metrics["per_class"][cls_name] = {
                "precision": round(state_report[cls_name]["precision"], 4),
                "recall": round(state_report[cls_name]["recall"], 4),
                "f1": round(state_report[cls_name]["f1-score"], 4),
                "support": int(state_report[cls_name]["support"]),
            }

    metrics["risk_scorer"] = state_metrics
    print(f"  Accuracy:       {state_metrics['accuracy']}")
    print(f"  F1 (weighted):  {state_metrics['f1_weighted']}")

    # ── Save all metrics ──
    with open(models_dir / "evaluation_metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)

    print(f"\n{'=' * 60}")
    print(f"  Evaluation complete!")
    print(f"  Metrics saved → models/evaluation_metrics.json")
    print(f"{'=' * 60}\n")

    return metrics


if __name__ == "__main__":
    evaluate_all_models()
