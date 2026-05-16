import { Router } from 'express';
import * as ctrl from '../controllers/automationController.js';
const router = Router();

router.get('/workflows', ctrl.getWorkflows);
router.get('/logs', ctrl.getLogs);
router.get('/rules', ctrl.getRules);
router.get('/status', ctrl.getStatus);

export default router;
