# Architecture Documentation

## System Overview

Zero Downtime AI follows a **microservices monorepo** architecture with three independent services communicating via REST APIs.

```
┌──────────────────────────────────────────────────────────────┐
│                      ZERO DOWNTIME AI                        │
├──────────────┬──────────────────┬────────────────────────────┤
│   Frontend   │     Backend      │        AI Service          │
│  (React)     │   (Express.js)   │       (FastAPI)            │
│              │                  │                            │
│  Dashboard   │  Simulation Eng. │  Anomaly Detection         │
│  Machine Mon │  Automation Eng. │  Failure Prediction        │
│  AI Panel    │  Alert Service   │  Risk Scoring              │
│  Analytics   │  Machine Service │  ML Models                 │
│  Alerts      │  Prediction Svc  │  (IsolationForest,         │
│  Automation  │  Analytics Svc   │   RandomForest)            │
├──────────────┴──────────────────┴────────────────────────────┤
│                    Shared Packages                           │
│   shared-types  │  constants  │  config  │  utilities        │
└──────────────────────────────────────────────────────────────┘
```

## Data Flow

1. **Simulation Engine** generates realistic sensor data every 3 seconds
2. **Backend API** serves current machine state to the frontend
3. **Frontend** polls API endpoints for real-time dashboard updates
4. **Automation Engine** evaluates rules every 5 seconds against machine state
5. When anomalies are detected, automation actions execute (load reduction, alerts, maintenance scheduling)
6. **AI Service** (optional) provides ML-powered predictions via separate API

## Key Design Decisions

- **In-Memory Store**: Using in-memory data store for hackathon speed. The store module exposes a clean interface that can be swapped with MongoDB/Firebase.
- **Local Fallback Predictions**: Backend includes local heuristic predictions so the system works without the Python AI service running.
- **Event-Driven Automation**: The automation engine uses a rule-based system with cooldown tracking to prevent alert storms.
- **Polling Architecture**: Frontend uses polling (not WebSockets) for simplicity. The polling hook is reusable and configurable.
