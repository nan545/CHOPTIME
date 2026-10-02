import { Router } from 'express';
import { RestaurantController } from '../controllers/restaurant.controller';

const router = Router();

router.get('/', RestaurantController.list);
router.get('/:id', RestaurantController.getById);
router.get('/:id/menu', RestaurantController.getMenu);

export default router;
