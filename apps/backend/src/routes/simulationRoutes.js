import { Router } from 'express';
import * as ctrl from '../controllers/simulationController.js';
const router = Router();

router.get('/status', ctrl.getStatus);
router.post('/inject-anomaly', ctrl.injectAnomaly);
router.post('/reset', ctrl.reset);
router.post('/reset-machine', ctrl.resetMachine);

export default router;
