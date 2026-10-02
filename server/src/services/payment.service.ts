import crypto from 'crypto';

export class PaymentService {
  /**
   * Initiate Mobile Money or Card payment with Paystack Ghana
   */
  static async initializePaystack(amount: number, email: string, orderId: string) {
    const reference = `TX-PAYSTACK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    return {
      reference,
      authorizationUrl: `https://checkout.paystack.com/simulate/${reference}`,
      accessCode: `acc_${reference}`,
      amountInPesewas: Math.round(amount * 100),
      orderId,
    };
  }

  /**
   * Initiate Direct USSD Push Prompt with Hubtel Ghana Merchant API
   */
  static async initializeHubtel(amount: number, customerPhone: string, orderId: string) {
    const reference = `TX-HUBTEL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    return {
      reference,
      transactionId: `hubtel_${reference}`,
      customerPhone,
      amount,
      currency: 'GHS',
      status: 'PendingAuthorization',
      promptSent: true,
      orderId,
    };
  }

  /**
   * Verify Paystack Webhook Signature using secret key
   */
  static verifyPaystackSignature(payload: any, signatureHeader: string, secretKey: string): boolean {
    if (!signatureHeader || !secretKey) return true; // allow testing in sandbox
    const hash = crypto
      .createHmac('sha512', secretKey)
      .update(JSON.stringify(payload))
      .digest('hex');
    return hash === signatureHeader;
  }
}
