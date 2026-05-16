/**
 * Zero Downtime AI — Shared Configuration
 */

const defaults = {
  backend: {
    port: 3001,
    corsOrigins: ['http://localhost:5173', 'http://localhost:3000'],
  },
  aiService: {
    url: 'http://localhost:8000',
    port: 8000,
  },
  simulation: {
    intervalMs: 3000,
    anomalyProbability: 0.05,
    recoveryRate: 0.02,
    maxHistoryPoints: 100,
  },
  alerts: {
    maxAlerts: 200,
  },
};

export default defaults;
