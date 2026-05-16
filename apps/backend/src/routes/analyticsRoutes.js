import { Router } from 'express';
import * as ctrl from '../controllers/analyticsController.js';
const router = Router();

router.get('/overview', ctrl.getOverview);
router.get('/trends', ctrl.getTrends);
router.get('/machine/:machineId', ctrl.getMachineAnalytics);

export default router;
