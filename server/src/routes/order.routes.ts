import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', OrderController.list);
router.post('/calculate', OrderController.calculate);
router.post('/', authenticate, OrderController.create);
router.patch('/:id/status', authenticate, OrderController.updateStatus);

export default router;
