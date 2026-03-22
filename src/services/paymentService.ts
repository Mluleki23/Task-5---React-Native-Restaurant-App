export type PaymentMethod = 'cash_on_delivery' | 'card' | 'eft';

export interface PaymentPreparationResult {
  status: 'paid' | 'pending_payment';
  reference: string;
  message?: string;
}

const createReference = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const paymentService = {
  async preparePayment(method: PaymentMethod, amount: number): Promise<PaymentPreparationResult> {
    if (method === 'cash_on_delivery') {
      return {
        status: 'pending_payment',
        reference: createReference('COD'),
        message: `Cash payment will be collected on delivery for R${amount.toFixed(2)}.`,
      };
    }

    return {
      status: 'pending_payment',
      reference: createReference(method.toUpperCase()),
      message: 'Payment gateway integration is pending. Complete payment after backend gateway setup.',
    };
  },
};
