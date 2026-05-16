# Setup Guide

## Prerequisites

- **Node.js** 18+ ([download](https://nodejs.org))
- **Python** 3.10+ ([download](https://python.org))
- **npm** 9+

## Step-by-Step Setup

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd zero-downtime-ai
```

### 2. Install Backend Dependencies
```bash
cd apps/backend
npm install
```

### 3. Install Frontend Dependencies
```bash
cd apps/frontend
npm install
```

### 4. Install AI Service Dependencies (Optional)
```bash
cd apps/ai-service
pip install -r requirements.txt
```

### 5. Environment Configuration
```bash
# Copy env template (from project root)
cp .env.example .env
# Edit .env if needed (defaults work out of the box)
```

## Running the Project

### Backend (Required)
```bash
cd apps/backend
npm run dev
# Server starts on http://localhost:3001
```

### Frontend (Required)
```bash
cd apps/frontend
npm run dev
# Dashboard at http://localhost:5173
```

### AI Service (Optional)
```bash
cd apps/ai-service
uvicorn app.main:app --reload --port 8000
# API docs at http://localhost:8000/docs
```

## Troubleshooting

| Issue | Solution |
|-------|---------|
| Port already in use | Change port in `.env` |
| Frontend can't reach backend | Check Vite proxy config in `vite.config.js` |
| Python import errors | Ensure you're in `apps/ai-service/` and deps are installed |
| CORS errors | Backend allows localhost:5173 by default |
