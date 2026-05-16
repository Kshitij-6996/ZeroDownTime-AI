import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

const config = {
  port: process.env.BACKEND_PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  simulation: {
    intervalMs: parseInt(process.env.SIMULATION_INTERVAL_MS) || 3000,
    anomalyProbability: parseFloat(process.env.ANOMALY_INJECTION_PROBABILITY) || 0.05,
  },
  cors: {
    origins: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173'],
  },
};

export default config;
