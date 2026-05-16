"""
Preprocessing Pipeline
=======================
- Loads raw CSV dataset
- Feature engineering (derived features)
- StandardScaler normalization
- Stratified train/test split
- Saves scaler and processed data
"""

import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from pathlib import Path
import joblib
import json


FEATURE_COLUMNS = [
    "temperature", "vibration", "voltage", "current", "pressure",
    "rpm", "load", "power", "runtime_hours", "maintenance_gap_hours",
    "efficiency", "thermal_fluctuation", "vibration_instability",
]


def load_and_preprocess(dataset_path: str = None):
    """Load dataset and apply preprocessing."""
    if dataset_path is None:
        dataset_path = Path(__file__).parent.parent / "datasets" / "industrial_telemetry.csv"
    else:
        dataset_path = Path(dataset_path)

    models_dir = Path(__file__).parent.parent / "models"
    models_dir.mkdir(parents=True, exist_ok=True)

    print("\n" + "=" * 60)
    print("  ZERO DOWNTIME AI — Preprocessing Pipeline")
    print("=" * 60)

    # ── Load ──
    print("\n[1/5] Loading dataset...")
    df = pd.read_csv(dataset_path)
    print(f"  ✓ Loaded {len(df)} samples, {len(df.columns)} columns")

    # ── Handle missing values ──
    print("[2/5] Handling missing values...")
    df[FEATURE_COLUMNS] = df[FEATURE_COLUMNS].fillna(df[FEATURE_COLUMNS].median())
    print(f"  ✓ Missing values filled with median")

    # ── Feature engineering ──
    print("[3/5] Engineering features...")
    df["temp_power_ratio"] = df["temperature"] / (df["power"] + 0.01)
    df["vib_load_interaction"] = df["vibration"] * df["load"] / 100
    df["power_efficiency_ratio"] = df["power"] / (df["efficiency"] + 0.01)
    df["thermal_stress"] = df["thermal_fluctuation"] * df["temperature"] / 100
    df["mechanical_stress"] = df["vibration_instability"] * df["vibration"]

    engineered_features = [
        "temp_power_ratio", "vib_load_interaction",
        "power_efficiency_ratio", "thermal_stress", "mechanical_stress",
    ]
    all_features = FEATURE_COLUMNS + engineered_features
    print(f"  ✓ {len(engineered_features)} derived features added → {len(all_features)} total features")

    # ── Encode labels ──
    print("[4/5] Encoding labels...")
    le_failure = LabelEncoder()
    df["failure_type_encoded"] = le_failure.fit_transform(df["failure_type"])

    le_state = LabelEncoder()
    df["state_encoded"] = le_state.fit_transform(df["state"])

    # Save label encoders
    joblib.dump(le_failure, models_dir / "label_encoder_failure.pkl")
    joblib.dump(le_state, models_dir / "label_encoder_state.pkl")

    label_mapping = {
        "failure_types": dict(zip(le_failure.classes_.tolist(), range(len(le_failure.classes_)))),
        "states": dict(zip(le_state.classes_.tolist(), range(len(le_state.classes_)))),
    }
    with open(models_dir / "label_mapping.json", "w") as f:
        json.dump(label_mapping, f, indent=2)

    print(f"  ✓ Failure types: {list(le_failure.classes_)}")
    print(f"  ✓ States: {list(le_state.classes_)}")

    # ── Scale features ──
    print("[5/5] Scaling features...")
    X = df[all_features].values
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    joblib.dump(scaler, models_dir / "scaler.pkl")

    # Save feature list
    feature_info = {
        "base_features": FEATURE_COLUMNS,
        "engineered_features": engineered_features,
        "all_features": all_features,
        "feature_count": len(all_features),
    }
    with open(models_dir / "feature_info.json", "w") as f:
        json.dump(feature_info, f, indent=2)

    print(f"  ✓ StandardScaler fitted and saved")

    # ── Split ──
    y_anomaly = df["is_anomaly"].values
    y_failure = df["failure_type_encoded"].values
    y_state = df["state_encoded"].values

    X_train, X_test, y_anom_train, y_anom_test, y_fail_train, y_fail_test, y_state_train, y_state_test = \
        train_test_split(X_scaled, y_anomaly, y_failure, y_state,
                         test_size=0.2, random_state=42, stratify=y_anomaly)

    print(f"\n  Train: {len(X_train)} | Test: {len(X_test)}")
    print(f"  Anomaly ratio (train): {y_anom_train.mean():.3f}")
    print(f"  Anomaly ratio (test):  {y_anom_test.mean():.3f}")
    print(f"{'=' * 60}\n")

    return {
        "X_train": X_train,
        "X_test": X_test,
        "y_anomaly_train": y_anom_train,
        "y_anomaly_test": y_anom_test,
        "y_failure_train": y_fail_train,
        "y_failure_test": y_fail_test,
        "y_state_train": y_state_train,
        "y_state_test": y_state_test,
        "feature_names": all_features,
        "scaler": scaler,
        "label_encoder_failure": le_failure,
        "label_encoder_state": le_state,
        "df": df,
    }


if __name__ == "__main__":
    data = load_and_preprocess()
    print(f"Preprocessing complete. Train shape: {data['X_train'].shape}")
