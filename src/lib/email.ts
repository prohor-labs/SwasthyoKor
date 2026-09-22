import "server-only";

interface SendMagicLinkParams {
  to: string;
  token: string;
  appUrl: string;
}

interface SendResult {
  success: boolean;
  error?: string;
}

export async function sendMagicLinkEmail({
  to,
  token,
  appUrl,
}: SendMagicLinkParams): Promise<SendResult> {
  const magicUrl = `${appUrl}/api/auth/verify?token=${token}`;

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey && !apiKey.startsWith("re_placeholder")) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(apiKey);

      const from =
        process.env.EMAIL_FROM ?? "SwasthyoKor <onboarding@resend.dev>";

      const { error } = await resend.emails.send({
        from,
        to,
        subject: "স্বাস্থ্যকর অ্যাকাউন্টে লগইন করুন",
        html: `
          <!DOCTYPE html>
          <html lang="bn">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>স্বাস্থ্যকর অ্যাকাউন্টে লগইন করুন</title>
            </head>
            <body style="background-color: #f4f4f5; margin: 0; padding: 48px 16px; font-family: sans-serif;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; border: 1px solid #e4e4e7; box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.05); overflow: hidden;">
                <tr>
                  <td style="padding: 40px 32px; text-align: center;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #059669; margin: 0 0 4px 0;">
                      স্বাস্থ্যকর (SwasthyoKor)
                    </h1>
                    <p style="font-size: 13px; font-weight: 500; color: #71717a; margin: 0 0 28px 0;">
                      খাঁটি ও প্রাকৃতিক পণ্যের নির্ভরযোগ্য প্রতিষ্ঠান
                    </p>

                    <div style="height: 1px; background-color: #f4f4f5; width: 100%; margin-bottom: 28px;"></div>

                    <h2 style="font-size: 18px; font-weight: 700; color: #18181b; margin: 0 0 12px 0;">
                      অ্যাকাউন্টে প্রবেশ নিশ্চিত করুন
                    </h2>
                    <p style="font-size: 14px; color: #52525b; line-height: 1.65; margin: 0 0 32px 0;">
                      আপনার পাসওয়ার্ডহীন নিরাপদে লগইন করার জন্য ম্যাজিক লিংক প্রস্তুত। নিচের বাটনে ক্লিক করে সরাসরি অ্যাকাউন্টে প্রবেশ করুন।
                    </p>

                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto 32px auto;">
                      <tr>
                        <td align="center" style="border-radius: 12px; background-color: #059669;">
                          <a href="${magicUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 15px; border-radius: 12px;">
                            লগইন করুন &nbsp;→
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="font-size: 12px; color: #a1a1aa; line-height: 1.5; margin: 0;">
                      নিরাপত্তার স্বার্থে এই লিংকটি ১৫ মিনিট পর্যন্ত কার্যকর থাকবে।
                    </p>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `,
      });

      if (error) {
        console.error("[email] Resend error:", error);
        return { success: false, error: "ইমেইল পাঠাতে সমস্যা হয়েছে।" };
      }

      return { success: true };
    } catch (err) {
      console.error("[email] Failed to send via Resend:", err);
      return { success: false, error: "ইমেইল পাঠাতে সমস্যা হয়েছে।" };
    }
  }

  return { success: true };
}
