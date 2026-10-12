import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface CreateChargeParams {
  fullName: string;
  email: string;
  amount: string | number;
  metadata?: Record<string, string | number>;
  redirectUrl: string;
  cancelUrl: string;
  webhookUrl?: string;
  returnType?: 'GET' | 'POST';
}

export interface CreateChargeResponse {
  status: boolean;
  message: string;
  payment_url?: string;
}

export interface VerifyPaymentResponse {
  full_name: string;
  email: string;
  amount: string;
  fee?: string;
  charged_amount?: string;
  invoice_id: string;
  metadata?: Record<string, unknown>;
  payment_method?: string;
  sender_number?: string;
  transaction_id?: string;
  date?: string;
  status: 'COMPLETED' | 'PENDING' | 'ERROR';
  message?: string;
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl =
      this.configService.get<string>('UDDOKTAPAY_BASE_URL') ||
      'https://swasthyokor.paymently.io/api';
    this.apiKey =
      this.configService.get<string>('UDDOKTAPAY_API_KEY') ||
      '3axAuM0sv9A2XoRvVMBe5hL6sGJn2viR00Xx2fAj';
  }

  async createPaymentCharge(params: CreateChargeParams): Promise<{ paymentUrl: string }> {
    const endpoint = `${this.baseUrl.replace(/\/$/, '')}/checkout-v2`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'RT-UDDOKTAPAY-API-KEY': this.apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        full_name: params.fullName || 'Customer',
        email: params.email || 'customer@swasthyokor.com',
        amount: String(params.amount),
        metadata: params.metadata || {},
        redirect_url: params.redirectUrl,
        return_type: params.returnType || 'GET',
        cancel_url: params.cancelUrl,
        ...(params.webhookUrl ? { webhook_url: params.webhookUrl } : {}),
      }),
    });

    const data = (await res.json()) as CreateChargeResponse;
    if (!data.status || !data.payment_url) {
      throw new Error(data.message || 'পেমেন্ট গেটওয়ে চালু করতে ব্যর্থ হয়েছে।');
    }

    return { paymentUrl: data.payment_url };
  }

  async verifyPayment(invoiceId: string): Promise<VerifyPaymentResponse> {
    const endpoint = `${this.baseUrl.replace(/\/$/, '')}/verify-payment`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'RT-UDDOKTAPAY-API-KEY': this.apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ invoice_id: invoiceId }),
    });

    return (await res.json()) as VerifyPaymentResponse;
  }

  validateWebhookHeader(headerApiKey: string | null): boolean {
    if (!headerApiKey) return false;
    return headerApiKey.trim() === this.apiKey.trim();
  }
}
