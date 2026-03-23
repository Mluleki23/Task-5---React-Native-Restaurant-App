import Constants from 'expo-constants';

export type PaymentMethod = 'cash_on_delivery' | 'paystack' | 'eft';

export interface PaymentPreparationResult {
  status: 'paid' | 'pending_payment';
  reference: string;
  message?: string;
}

const createReference = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export interface PaystackPaymentRequest {
  key: string;
  email: string;
  amount: number;
  currency?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  reference?: string;
}

const getPaystackConfig = () => {
  const expoConfig = Constants.expoConfig?.extra as
    | { paystackPublicKey?: string; paystackCurrency?: string }
    | undefined;

  return {
    paystackPublicKey:
      process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY || expoConfig?.paystackPublicKey || '',
    paystackCurrency:
      process.env.EXPO_PUBLIC_PAYSTACK_CURRENCY || expoConfig?.paystackCurrency || '',
  };
};

const normalizePaystackKey = (value: string) => value.trim();
const normalizeEmail = (value: string) => value.trim().toLowerCase();

const isValidPaystackPublicKey = (value: string) =>
  /^(pk_test|pk_live)_[A-Za-z0-9]+$/.test(value) && !value.includes('replace_with');

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const paymentService = {
  getPaystackPublicKey(): string {
    return normalizePaystackKey(getPaystackConfig().paystackPublicKey);
  },

  getPaystackCurrency(): string | undefined {
    const currency = getPaystackConfig().paystackCurrency.trim().toUpperCase();
    return currency || undefined;
  },

  createPaystackPaymentRequest(
    amount: number,
    customer: {
      email: string;
      firstname?: string;
      lastname?: string;
      phone?: string;
    }
  ): PaystackPaymentRequest {
    const publicKey = this.getPaystackPublicKey();
    const email = normalizeEmail(customer.email);

    if (!publicKey) {
      throw new Error(
        'Missing Paystack public key. Add your real Paystack public key in app.json or EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY.'
      );
    }

    if (!isValidPaystackPublicKey(publicKey)) {
      throw new Error(
        'Invalid Paystack public key. Replace the placeholder key with your real key from the Paystack dashboard.'
      );
    }

    if (!email) {
      throw new Error('Paystack requires a customer email address.');
    }

    if (!isValidEmail(email)) {
      throw new Error('The account email is not in a valid format for Paystack.');
    }

    const normalizedAmount = Math.round(amount * 100);

    if (normalizedAmount < 100) {
      throw new Error('Paystack requires a minimum charge of R1.00.');
    }

    const request: PaystackPaymentRequest = {
      key: publicKey,
      email,
      amount: normalizedAmount,
      reference: createReference('PSTK'),
    };

    const configuredCurrency = this.getPaystackCurrency();
    if (configuredCurrency) {
      request.currency = configuredCurrency;
    }

    if (customer.firstname?.trim()) {
      request.firstName = customer.firstname.trim();
    }

    if (customer.lastname?.trim()) {
      request.lastName = customer.lastname.trim();
    }

    if (customer.phone?.trim()) {
      request.phone = customer.phone.trim();
    }

    return request;
  },

  createPaystackCheckoutHtml(request: PaystackPaymentRequest): string {
    const serializedRequest = JSON.stringify(request);

    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
    />
    <title>Paystack Checkout</title>
    <style>
      body {
        margin: 0;
        font-family: Arial, sans-serif;
        background: #fff7ed;
        color: #102a43;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
      }

      .status {
        text-align: center;
        padding: 24px;
      }
    </style>
  </head>
  <body>
    <div class="status">
      <h2>Opening Paystack...</h2>
      <p>Please wait while secure checkout loads.</p>
    </div>

    <script src="https://js.paystack.co/v2/inline.js"></script>
    <script>
      const request = ${serializedRequest};
      const sendMessage = (payload) => {
        window.ReactNativeWebView.postMessage(JSON.stringify(payload));
      };

      try {
        const paystack = new PaystackPop();
        const transactionOptions = {
          key: request.key,
          email: request.email,
          amount: request.amount,
          reference: request.reference,
          onSuccess: (transaction) => {
            sendMessage({
              type: 'success',
              reference: transaction.reference,
              message: 'Paystack payment completed successfully.',
            });
          },
          onCancel: () => {
            sendMessage({
              type: 'cancel',
              message: 'Payment was cancelled before completion.',
            });
          },
          onError: (error) => {
            sendMessage({
              type: 'error',
              message: error?.message || 'Paystack rejected the transaction parameters.',
            });
          },
        };

        if (request.currency) {
          transactionOptions.currency = request.currency;
        }

        if (request.firstName) {
          transactionOptions.firstName = request.firstName;
        }

        if (request.lastName) {
          transactionOptions.lastName = request.lastName;
        }

        if (request.phone) {
          transactionOptions.phone = request.phone;
        }

        paystack.newTransaction(transactionOptions);
      } catch (error) {
        sendMessage({
          type: 'error',
          message: error?.message || 'Unable to start Paystack checkout.',
        });
      }
    </script>
  </body>
</html>`;
  },

  async preparePayment(
    method: PaymentMethod,
    amount: number
  ): Promise<PaymentPreparationResult> {
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
      message: 'Bank transfer selected. Confirm payment manually before delivery.',
    };
  },
};
