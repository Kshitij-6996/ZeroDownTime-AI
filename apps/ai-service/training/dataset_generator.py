"""
Industrial Telemetry Dataset Generator
=======================================
Generates high-quality synthetic industrial sensor data with:
- Correlated sensor behavior (temperature ↔ power ↔ load)
- Progressive degradation patterns over time
- Realistic failure scenarios with labeled types
- Time-series structure across 30 simulated days
- Healthy → Warning → Critical → Failed state transitions
"""

import numpy as np
import pandas as pd
from pathlib import Path
import json

# ── Configuration ──────────────────────────────────────────────

MACHINE_TYPES = [
    {"id": "CNC_MILL", "base_temp": 48, "base_vib": 1.8, "base_rpm": 3200, "base_load": 55},
    {"id": "HYD_PRESS", "base_temp": 52, "base_vib": 2.2, "base_rpm": 1800, "base_load": 60},
    {"id": "ROBOT_ARM", "base_temp": 40, "base_vib": 1.2, "base_rpm": 4500, "base_load": 45},
    {"id": "CONVEYOR", "base_temp": 35, "base_vib": 1.5, "base_rpm": 1200, "base_load": 40},
    {"id": "COMPRESSOR", "base_temp": 58, "base_vib": 2.8, "base_rpm": 2800, "base_load": 65},
    {"id": "LATHE", "base_temp": 50, "base_vib": 2.0, "base_rpm": 3500, "base_load": 50},
    {"id": "WELD_CELL", "base_temp": 55, "base_vib": 1.6, "base_rpm": 0, "base_load": 70},
    {"id": "PUMP_SYS", "base_temp": 42, "base_vib": 2.5, "base_rpm": 2200, "base_load": 58},
]

FAILURE_SCENARIOS = {
    "bearing_failure":       {"temp": 1.4, "vib": 3.5, "power": 1.3, "eff": 0.7, "desc": "Progressive bearing wear"},
    "overheating":           {"temp": 2.2, "vib": 1.2, "power": 1.5, "eff": 0.6, "desc": "Cooling system degradation"},
    "lubrication_issues":    {"temp": 1.3, "vib": 2.5, "power": 1.2, "eff": 0.75, "desc": "Lubrication breakdown"},
    "power_instability":     {"temp": 1.1, "vib": 1.8, "power": 2.0, "eff": 0.65, "desc": "Power supply fluctuation"},
    "cooling_degradation":   {"temp": 1.9, "vib": 1.1, "power": 1.4, "eff": 0.7, "desc": "Cooling system failure"},
    "overload":              {"temp": 1.6, "vib": 1.5, "power": 1.8, "eff": 0.55, "desc": "Sustained overload condition"},
    "vibration_anomaly":     {"temp": 1.2, "vib": 4.0, "power": 1.1, "eff": 0.8, "desc": "Structural resonance"},
    "efficiency_degradation":{"temp": 1.15, "vib": 1.3, "power": 1.6, "eff": 0.5, "desc": "General mechanical wear"},
    "motor_imbalance":       {"temp": 1.35, "vib": 3.0, "power": 1.4, "eff": 0.65, "desc": "Rotor/stator misalignment"},
}

SENSOR_COLUMNS = [
    "temperature", "vibration", "voltage", "current", "pressure",
    "rpm", "load", "power", "runtime_hours", "maintenance_gap_hours",
    "efficiency", "thermal_fluctuation", "vibration_instability",
]

np.random.seed(42)


def generate_healthy_sample(machine, t, noise_scale=1.0):
    """Generate a single healthy machine reading with realistic correlations."""
    # Base values with time-of-day variation (sinusoidal shift)
    hour_factor = 1.0 + 0.08 * np.sin(2 * np.pi * (t % 24) / 24)

    base_load = machine["base_load"] * hour_factor + np.random.normal(0, 3 * noise_scale)
    base_load = np.clip(base_load, 10, 85)

    # Correlated sensors: load drives power, power drives temperature
    power = (base_load / 100) * (35 + np.random.normal(0, 2 * noise_scale))
    temperature = machine["base_temp"] + (power / 35) * 8 + np.random.normal(0, 2 * noise_scale)

    # Vibration correlates with RPM and load
    base_vib = machine["base_vib"]
    rpm = machine["base_rpm"] * (0.85 + 0.3 * base_load / 100) + np.random.normal(0, 50 * noise_scale)
    vibration = base_vib * (0.7 + 0.6 * base_load / 100) + np.random.normal(0, 0.15 * noise_scale)

    voltage = 400 + np.random.normal(0, 3 * noise_scale)
    current = power / (voltage / 1000) + np.random.normal(0, 0.3 * noise_scale)
    pressure = 4.5 + (base_load / 100) * 3 + np.random.normal(0, 0.3 * noise_scale)

    runtime_hours = np.random.uniform(100, 8000)
    maintenance_gap = np.random.uniform(10, 500)
    efficiency = 92 + np.random.normal(0, 2 * noise_scale)
    thermal_fluct = abs(np.random.normal(0, 1.5 * noise_scale))
    vib_instab = abs(np.random.normal(0, 0.3 * noise_scale))

    return {
        "temperature": round(np.clip(temperature, 20, 200), 2),
        "vibration": round(np.clip(vibration, 0.1, 20), 3),
        "voltage": round(np.clip(voltage, 350, 450), 1),
        "current": round(np.clip(current, 0.5, 50), 2),
        "pressure": round(np.clip(pressure, 1, 30), 2),
        "rpm": round(np.clip(rpm, 0, 15000), 0),
        "load": round(np.clip(base_load, 5, 100), 1),
        "power": round(np.clip(power, 1, 150), 2),
        "runtime_hours": round(runtime_hours, 0),
        "maintenance_gap_hours": round(maintenance_gap, 0),
        "efficiency": round(np.clip(efficiency, 30, 100), 1),
        "thermal_fluctuation": round(thermal_fluct, 3),
        "vibration_instability": round(vib_instab, 3),
    }


def generate_degradation_sequence(machine, failure_type, length=60):
    """
    Generate a progressive degradation sequence.
    Starts healthy, gradually worsens over `length` steps.
    Returns list of samples with labels.
    """
    scenario = FAILURE_SCENARIOS[failure_type]
    samples = []

    for step in range(length):
        progress = step / length  # 0.0 → 1.0
        # Non-linear degradation curve (slow start, accelerating)
        degradation = progress ** 2.2

        t = np.random.uniform(0, 24)
        base = generate_healthy_sample(machine, t, noise_scale=0.8)

        # Apply degradation multipliers progressively
        base["temperature"] *= (1 + (scenario["temp"] - 1) * degradation)
        base["vibration"] *= (1 + (scenario["vib"] - 1) * degradation)
        base["power"] *= (1 + (scenario["power"] - 1) * degradation)
        base["efficiency"] *= (scenario["eff"] + (1 - scenario["eff"]) * (1 - degradation))

        # Secondary correlated effects
        base["thermal_fluctuation"] += degradation * 8
        base["vibration_instability"] += degradation * 2.5
        base["current"] *= (1 + degradation * 0.4)
        base["pressure"] += degradation * 4
        base["maintenance_gap_hours"] += degradation * 800

        # Clamp
        base["temperature"] = round(np.clip(base["temperature"], 20, 200), 2)
        base["vibration"] = round(np.clip(base["vibration"], 0.1, 20), 3)
        base["efficiency"] = round(np.clip(base["efficiency"], 20, 100), 1)
        base["current"] = round(np.clip(base["current"], 0.5, 50), 2)
        base["pressure"] = round(np.clip(base["pressure"], 1, 30), 2)

        # Determine state based on degradation
        if degradation < 0.25:
            state = "healthy"
            is_anomaly = 0
        elif degradation < 0.55:
            state = "warning"
            is_anomaly = 0
        elif degradation < 0.85:
            state = "critical"
            is_anomaly = 1
        else:
            state = "failed"
            is_anomaly = 1

        base["machine_type"] = machine["id"]
        base["failure_type"] = failure_type if degradation > 0.3 else "none"
        base["state"] = state
        base["is_anomaly"] = is_anomaly
        base["degradation_progress"] = round(degradation, 4)

        samples.append(base)

    return samples


def generate_dataset(output_dir: str = None):
    """Generate the complete industrial telemetry dataset."""
    if output_dir is None:
        output_dir = Path(__file__).parent.parent / "datasets"
    else:
        output_dir = Path(output_dir)

    output_dir.mkdir(parents=True, exist_ok=True)

    all_samples = []
    print("\n" + "=" * 60)
    print("  ZERO DOWNTIME AI — Dataset Generator")
    print("=" * 60)

    # ── Phase 1: Healthy operation samples (~60% of data) ──
    print("\n[1/3] Generating healthy operation data...")
    for machine in MACHINE_TYPES:
        for _ in range(1000):
            t = np.random.uniform(0, 24)
            sample = generate_healthy_sample(machine, t)
            sample["machine_type"] = machine["id"]
            sample["failure_type"] = "none"
            sample["state"] = "healthy"
            sample["is_anomaly"] = 0
            sample["degradation_progress"] = 0.0
            all_samples.append(sample)
    print(f"  ✓ {len(all_samples)} healthy samples generated")

    # ── Phase 2: Degradation sequences (~35% of data) ──
    print("[2/3] Generating degradation sequences...")
    degradation_count = 0
    for machine in MACHINE_TYPES:
        for failure_type in FAILURE_SCENARIOS:
            # 1-2 degradation sequences per machine/failure combo
            n_sequences = np.random.choice([1, 2], p=[0.6, 0.4])
            for _ in range(n_sequences):
                length = np.random.randint(40, 80)
                seq = generate_degradation_sequence(machine, failure_type, length)
                all_samples.extend(seq)
                degradation_count += len(seq)
    print(f"  ✓ {degradation_count} degradation samples generated")

    # ── Phase 3: Sudden anomaly spikes (~5% of data) ──
    print("[3/3] Generating sudden anomaly events...")
    spike_count = 0
    for machine in MACHINE_TYPES:
        for _ in range(50):
            t = np.random.uniform(0, 24)
            sample = generate_healthy_sample(machine, t, noise_scale=1.5)

            # Random spike in 1-3 sensors
            spike_type = np.random.choice(list(FAILURE_SCENARIOS.keys()))
            scenario = FAILURE_SCENARIOS[spike_type]
            intensity = np.random.uniform(0.6, 1.0)

            sample["temperature"] *= (1 + (scenario["temp"] - 1) * intensity)
            sample["vibration"] *= (1 + (scenario["vib"] - 1) * intensity)
            sample["power"] *= (1 + (scenario["power"] - 1) * intensity)
            sample["efficiency"] *= scenario["eff"]
            sample["thermal_fluctuation"] += intensity * 6
            sample["vibration_instability"] += intensity * 2

            sample["temperature"] = round(np.clip(sample["temperature"], 20, 200), 2)
            sample["vibration"] = round(np.clip(sample["vibration"], 0.1, 20), 3)
            sample["efficiency"] = round(np.clip(sample["efficiency"], 20, 100), 1)

            sample["machine_type"] = machine["id"]
            sample["failure_type"] = spike_type
            sample["state"] = "critical" if intensity > 0.8 else "warning"
            sample["is_anomaly"] = 1
            sample["degradation_progress"] = round(intensity, 4)
            all_samples.append(sample)
            spike_count += 1
    print(f"  ✓ {spike_count} anomaly spike samples generated")

    # ── Build DataFrame ──
    df = pd.DataFrame(all_samples)

    # Add synthetic timestamps spanning 30 days
    base_time = pd.Timestamp("2026-04-01")
    df["timestamp"] = [base_time + pd.Timedelta(seconds=i * 120 + np.random.randint(0, 60))
                       for i in range(len(df))]

    # Shuffle for training (but keep a sorted copy for time-series analysis)
    df_sorted = df.sort_values("timestamp").reset_index(drop=True)
    df_shuffled = df.sample(frac=1, random_state=42).reset_index(drop=True)

    # ── Save ──
    csv_path = output_dir / "industrial_telemetry.csv"
    df_shuffled.to_csv(csv_path, index=False)

    ts_path = output_dir / "industrial_telemetry_timeseries.csv"
    df_sorted.to_csv(ts_path, index=False)

    # ── Dataset statistics ──
    stats = {
        "total_samples": len(df),
        "features": SENSOR_COLUMNS,
        "feature_count": len(SENSOR_COLUMNS),
        "machine_types": [m["id"] for m in MACHINE_TYPES],
        "failure_types": list(FAILURE_SCENARIOS.keys()) + ["none"],
        "state_distribution": df["state"].value_counts().to_dict(),
        "anomaly_distribution": df["is_anomaly"].value_counts().to_dict(),
        "failure_type_distribution": df["failure_type"].value_counts().to_dict(),
        "sensor_statistics": {},
    }
    for col in SENSOR_COLUMNS:
        stats["sensor_statistics"][col] = {
            "mean": round(float(df[col].mean()), 3),
            "std": round(float(df[col].std()), 3),
            "min": round(float(df[col].min()), 3),
            "max": round(float(df[col].max()), 3),
        }

    stats_path = output_dir / "dataset_statistics.json"
    with open(stats_path, "w") as f:
        json.dump(stats, f, indent=2)

    print(f"\n{'=' * 60}")
    print(f"  Dataset generated successfully!")
    print(f"  Total samples:  {len(df)}")
    print(f"  Features:       {len(SENSOR_COLUMNS)}")
    print(f"  Failure types:  {len(FAILURE_SCENARIOS)}")
    print(f"  States:         {dict(df['state'].value_counts())}")
    print(f"  Anomalies:      {dict(df['is_anomaly'].value_counts())}")
    print(f"  Output:         {csv_path}")
    print(f"{'=' * 60}\n")

    return csv_path


if __name__ == "__main__":
    generate_dataset()
