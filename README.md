<div align="center">
  <img src="https://img.shields.io/badge/ABB-Hackathon_2026-ff0000?style=for-the-badge&logo=abb&logoColor=white" alt="ABB Hackathon" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  
  <br />
  <br />

  <h1>⚡ ZERO DOWNTIME AI PLATFORM</h1>
  <p><strong>Enterprise-Grade Predictive Maintenance & Automated Industrial Continuity</strong></p>
</div>

---

## 📖 Project Overview

**Zero Downtime AI** is a state-of-the-art predictive maintenance platform designed for modern manufacturing floors. Moving beyond simple passive monitoring, this platform acts as an **intelligent command center**. It ingests live telemetry data, uses machine learning to predict mechanical failures *before* they occur, and triggers automated preventive workflows to stabilize machinery and avoid costly downtime.

## 🚀 Key Features

*   **Cinematic Operational Dashboard**: A highly polished, responsive React frontend utilizing Framer Motion to visualize machine states, risk scores, and live sensor telemetry.
*   **Production-Grade ML Pipeline**: Built with `scikit-learn` (IsolationForest, RandomForest, GradientBoosting) to handle multi-variate anomaly detection across temperature, vibration, voltage, and efficiency metrics.
*   **Explainable AI (XAI)**: Generates human-readable context explaining exactly *why* a machine was flagged as risky (e.g., "Anomalous harmonic frequencies detected").
*   **Live Operational Timeline**: Automatically translates triggered safety protocols into a narrative timeline, showing exact automation steps taken (e.g., "Reduced spindle RPM by 25%").
*   **Synthetic Data Simulation**: Built-in backend engine to dynamically inject anomalies and simulate real-time factory conditions for testing.

---

## 🏗️ Architecture

This project is built as a modular monorepo, decoupling the high-performance AI inference from the real-time simulation backend.

| Service | Technology | Role | Port |
| :--- | :--- | :--- | :--- |
| **Frontend** | React + Vite + TailwindCSS | Cinematic UI, Real-time Charts, Timeline | `5173` |
| **Backend** | Node.js + Express | Simulation Engine, Automation Rules, State | `3001` |
| **AI Service** | Python + FastAPI + Scikit-Learn | ML Inference, XAI generation, Risk Scoring | `8000` |

---

## 🛠️ Quick Start (Local Setup)

We've designed this repository for **zero-friction onboarding**. Follow these steps to get the entire stack running locally.

### Prerequisites
*   [Node.js](https://nodejs.org/en/) (v18+)
*   [Python](https://www.python.org/downloads/) (3.10+)

### 1. Clone & Install
```bash
git clone https://github.com/Kshitij-6996/ZeroDownTime-AI.git
cd ZeroDownTime-AI

# Install ALL dependencies (Node modules + Python requirements)
npm run install:all
```

### 2. Environment Variables
Copy the provided environment templates:
```bash
cp apps/frontend/.env.example apps/frontend/.env
cp apps/backend/.env.example apps/backend/.env
cp apps/ai-service/.env.example apps/ai-service/.env
```
*(The default values in the templates are already configured to work out-of-the-box).*

### 3. Start the Platform
```bash
# Starts the Frontend, Backend, and AI Service concurrently
npm run dev
```

Visit **[http://localhost:5173](http://localhost:5173)** to view the platform.

---

## 🐳 Docker Setup (Alternative)

If you prefer using Docker:
```bash
docker-compose up --build
```

---

## 🤝 Team Collaboration & Contribution

We follow a strict PR-based workflow to maintain the stability of the monorepo.

### Branching Strategy
*   `main`: Production-ready code.
*   `feat/xxx`: New features (e.g., `feat/dashboard-ui`).
*   `fix/xxx`: Bug fixes.

### Opening a PR
1.  Ensure you have run `npm run lint` locally.
2.  Push your branch and open a PR against `main`.
3.  The **Zero Downtime CI** GitHub Action will automatically run tests and builds.
4.  Fill out the automatically provided PR Template.

---

## 🔮 Future Scope
*   **Timeseries Forecasting**: Transitioning to LSTM/Transformers for long-term degradation predictions.
*   **IoT Edge Deployment**: Running a lightweight ONNX runtime directly on factory PLCs.
*   **Native Mobile App**: Porting the dashboard to React Native for on-the-floor engineers.

<div align="center">
  <br/>
  <p><i>Engineered for the ABB Accelerator Hackathon 2026</i></p>
</div>
