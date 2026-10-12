// lib/uddoktapay.ts

const BASE_URL =
  process.env.UDDOKTAPAY_BASE_URL || "https://swasthyokor.paymently.io/api";
const API_KEY =
  process.env.UDDOKTAPAY_API_KEY || "3axAuM0sv9A2XoRvVMBe5hL6sGJn2viR00Xx2fAj";

export interface CreateChargeParams {
  fullName: string;
  email: string;
  amount: string | number;
  metadata?: Record<string, string | number>;
  redirectUrl: string;
  cancelUrl: string;
  webhookUrl?: string;
  returnType?: "GET" | "POST";
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
  status: "COMPLETED" | "PENDING" | "ERROR";
  message?: string;
}

/**
 * Initiates payment with UddoktaPay/Paymently and returns the payment checkout URL
 */
export async function createPaymentCharge(
  params: CreateChargeParams,
): Promise<{ paymentUrl: string }> {
  const endpoint = `${BASE_URL.replace(/\/$/, "")}/checkout-v2`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "RT-UDDOKTAPAY-API-KEY": API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      full_name: params.fullName || "Customer",
      email: params.email || "customer@swasthyokor.com",
      amount: String(params.amount),
      metadata: params.metadata || {},
      redirect_url: params.redirectUrl,
      return_type: params.returnType || "GET",
      cancel_url: params.cancelUrl,
      ...(params.webhookUrl ? { webhook_url: params.webhookUrl } : {}),
    }),
    cache: "no-store",
  });

  const data = (await res.json()) as CreateChargeResponse;

  if (!data.status || !data.payment_url) {
    throw new Error(data.message || "পেমেন্ট গেটওয়ে চালু করতে ব্যর্থ হয়েছে।");
  }

  return { paymentUrl: data.payment_url };
}

/**
 * Verifies payment status directly with UddoktaPay/Paymently
 */
export async function verifyPayment(
  invoiceId: string,
): Promise<VerifyPaymentResponse> {
  const endpoint = `${BASE_URL.replace(/\/$/, "")}/verify-payment`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "RT-UDDOKTAPAY-API-KEY": API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      invoice_id: invoiceId,
    }),
    cache: "no-store",
  });

  const data = (await res.json()) as VerifyPaymentResponse;
  return data;
}

/**
 * Validates incoming webhook authorization header
 */
export function validateWebhookHeader(headerApiKey: string | null): boolean {
  if (!headerApiKey) return false;
  return headerApiKey.trim() === API_KEY.trim();
}

export interface RefundPaymentParams {
  transactionId: string;
  paymentMethod: string;
  amount: string | number;
  productName: string;
  reason: string;
}

export interface RefundPaymentResponse {
  status: boolean;
  message?: string;
  [key: string]: unknown;
}

/**
 * Initiates a refund request with UddoktaPay/Paymently
 */
export async function refundPayment(
  params: RefundPaymentParams,
): Promise<RefundPaymentResponse> {
  const endpoint = `${BASE_URL.replace(/\/$/, "")}/refund-payment`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "RT-UDDOKTAPAY-API-KEY": API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      transaction_id: params.transactionId,
      payment_method: params.paymentMethod,
      amount: String(params.amount),
      product_name: params.productName,
      reason: params.reason,
    }),
    cache: "no-store",
  });

  const data = (await res.json()) as RefundPaymentResponse;
  return data;
}
