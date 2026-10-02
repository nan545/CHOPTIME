import { Router } from 'express';
import restaurantRoutes from './restaurant.routes';
import orderRoutes from './order.routes';
import paymentRoutes from './payment.routes';
import authRoutes from './authRoutes';
import riderRoutes from './rider.routes';

const apiRouter = Router();

apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ChopTime Ghana API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

apiRouter.use('/restaurants', restaurantRoutes);
apiRouter.use('/orders', orderRoutes);
apiRouter.use('/payments', paymentRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/riders', riderRoutes);

export default apiRouter;
