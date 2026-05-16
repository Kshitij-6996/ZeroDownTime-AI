import { Router } from 'express';
import * as ctrl from '../controllers/alertController.js';
const router = Router();

router.get('/', ctrl.getAll);
router.get('/stats', ctrl.getStats);
router.post('/:id/acknowledge', ctrl.acknowledge);

export default router;
