import { Router } from 'express';
import * as ctrl from '../controllers/predictionController.js';
const router = Router();

router.get('/', ctrl.getAll);
router.get('/model-info', ctrl.modelInfo);
router.get('/:machineId', ctrl.getByMachine);
router.post('/analyze', ctrl.analyze);

export default router;
