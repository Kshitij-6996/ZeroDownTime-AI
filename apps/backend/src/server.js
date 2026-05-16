/**
 * Zero Downtime AI — Backend Server
 * Express application entry point
 */

import express from 'express';
import cors from 'cors';
import config from './config/index.js';
import routes from './routes/index.js';
import { errorHandler, requestLogger, notFoundHandler } from './middlewares/index.js';
import simulationEngine from './simulation/SimulationEngine.js';
import automationEngine from './automation/AutomationEngine.js';

const app = express();

// ── Middleware ──────────────────────────
app.use(cors({ origin: config.cors.origins, credentials: true }));
app.use(express.json());
app.use(requestLogger);

// ── Routes ─────────────────────────────
app.use('/api', routes);

// ── Error Handling ─────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ── Start Server ───────────────────────
app.listen(config.port, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════════╗');
  console.log('  ║       ZERO DOWNTIME AI — Backend         ║');
  console.log('  ║       Predict. Prevent. Perform.         ║');
  console.log('  ╚══════════════════════════════════════════╝');
  console.log('');
  console.log(`  → Server:     http://localhost:${config.port}`);
  console.log(`  → API:        http://localhost:${config.port}/api`);
  console.log(`  → Health:     http://localhost:${config.port}/api/health`);
  console.log(`  → Env:        ${config.nodeEnv}`);
  console.log('');

  // Initialize and start engines
  simulationEngine.initialize();
  simulationEngine.start();
  automationEngine.start();

  console.log('  ✓ Simulation Engine started');
  console.log('  ✓ Automation Engine started');
  console.log('');
});

export default app;
