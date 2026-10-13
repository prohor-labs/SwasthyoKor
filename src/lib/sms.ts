/**
 * BD Bulk SMS Integration & OTP Management
 * Gateway documentation: https://api.bdbulksms.net/api.php?json
 */

export interface SmsSendResult {
  success: boolean;
  message?: string;
  error?: string;
  mocked?: boolean;
}

/**
 * Normalizes Bangladeshi phone number to 11 digits: e.g. 01XXXXXXXXX
 */
export function normalizeBdPhone(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.startsWith("880")) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.startsWith("88")) {
    cleaned = cleaned.slice(2);
  }
  return cleaned;
}

/**
 * Validates Bangladeshi mobile number format
 */
export function isValidBdPhone(phone: string): boolean {
  const normalized = normalizeBdPhone(phone);
  return /^01[3-9]\d{8}$/.test(normalized);
}

/**
 * Sends SMS using BD Bulk SMS API or Mock logger
 */
export async function sendBdBulkSms(
  to: string,
  message: string,
): Promise<SmsSendResult> {
  const formattedPhone = normalizeBdPhone(to);
  const token = process.env.BD_BULK_SMS_TOKEN?.trim();

  // If token is missing, use mock mode for local/staging development
  if (!token || token === "mock" || token === "YOUR_BD_BULK_SMS_TOKEN") {
    console.log(
      `\n----------------------------------------\n[MOCK BD BULK SMS]\nTo: ${formattedPhone}\nMessage: "${message}"\n----------------------------------------\n`,
    );
    return {
      success: true,
      mocked: true,
      message: `[MOCK MODE] SMS sent to ${formattedPhone}`,
    };
  }

  try {
    const url = "https://api.bdbulksms.net/api.php?json";
    const body = new URLSearchParams({
      token,
      to: formattedPhone,
      message,
    });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        success: false,
        error: `SMS Gateway HTTP Error: ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: typeof data === "string" ? data : JSON.stringify(data),
    };
  } catch (error) {
    console.error("BD Bulk SMS Send Error:", error);
    return {
      success: false,
      error: "এসএমএস পাঠাতে সমস্যা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।",
    };
  }
}
