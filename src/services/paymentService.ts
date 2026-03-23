export type PaymentMethod = 'cash_on_delivery' | 'card' | 'eft';

export interface PaymentPreparationResult {
  status: 'paid' | 'pending_payment';
  reference: string;
  message?: string;
}

interface PreparePaymentOptions {
  savedCardLast4?: string;
}

const createReference = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const paymentService = {
  async preparePayment(
    method: PaymentMethod,
    amount: number,
    options: PreparePaymentOptions = {}
  ): Promise<PaymentPreparationResult> {
    if (method === 'cash_on_delivery') {
      return {
        status: 'pending_payment',
        reference: createReference('COD'),
        message: `Cash payment will be collected on delivery for R${amount.toFixed(2)}.`,
      };
    }

    if (method === 'card') {
      if (!options.savedCardLast4) {
        throw new Error('Add a saved card in your profile before paying by card.');
      }

      return {
        status: 'paid',
        reference: createReference('CARD'),
        message: `Payment approved using saved card ending in ${options.savedCardLast4}.`,
      };
    }

    return {
      status: 'pending_payment',
      reference: createReference(method.toUpperCase()),
      message: 'Bank transfer selected. Confirm payment manually before delivery.',
    };
  },
};
