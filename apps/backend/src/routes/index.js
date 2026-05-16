import { Router } from 'express';
import machineRoutes from './machineRoutes.js';
import alertRoutes from './alertRoutes.js';
import predictionRoutes from './predictionRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import automationRoutes from './automationRoutes.js';
import simulationRoutes from './simulationRoutes.js';

const router = Router();

router.use('/machines', machineRoutes);
router.use('/alerts', alertRoutes);
router.use('/predictions', predictionRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/automation', automationRoutes);
router.use('/simulation', simulationRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'zero-downtime-backend', timestamp: new Date().toISOString() });
});

export default router;
