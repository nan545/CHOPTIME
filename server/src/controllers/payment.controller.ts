import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/payment.service';

export class PaymentController {
  static async initialize(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { gateway, amount, email, phone, orderId } = req.body;

      if (!amount || !orderId) {
        res.status(400).json({ success: false, error: 'Amount and orderId are required' });
        return;
      }

      if (gateway === 'hubtel') {
        const result = await PaymentService.initializeHubtel(
          amount,
          phone || '0241234567',
          orderId
        );
        res.json({ success: true, data: result });
      } else {
        const result = await PaymentService.initializePaystack(
          amount,
          email || 'customer@choptime.gh',
          orderId
        );
        res.json({ success: true, data: result });
      }
    } catch (err) {
      next(err);
    }
  }

  static async webhook(req: Request, res: Response): Promise<void> {
    const signature = (req.headers['x-paystack-signature'] as string) || '';
    const secretKey = process.env.PAYSTACK_SECRET_KEY || '';

    const isValid = PaymentService.verifyPaystackSignature(req.body, signature, secretKey);

    if (!isValid) {
      res.status(400).send('Invalid signature');
      return;
    }

    const event = req.body;
    console.log('[Payment Webhook Received]:', event.event || 'charge.success');

    // Always respond 200 OK to payment webhooks
    res.status(200).json({ status: 'success' });
  }
}
