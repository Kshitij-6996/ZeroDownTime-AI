import { Router } from 'express';
import * as ctrl from '../controllers/machineController.js';
const router = Router();

router.get('/', ctrl.getAll);
router.get('/overview', ctrl.getOverview);
router.get('/:id', ctrl.getById);
router.get('/:id/history', ctrl.getHistory);

export default router;
