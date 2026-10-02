import { Router } from 'express';
import { RiderController } from '../controllers/rider.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.post('/online', authenticate, requireRole(['RIDER', 'ADMIN']), RiderController.toggleOnline);
router.post('/location', authenticate, requireRole(['RIDER', 'ADMIN']), RiderController.updateLocation);
router.get('/earnings', authenticate, requireRole(['RIDER', 'ADMIN']), RiderController.earnings);

export default router;
