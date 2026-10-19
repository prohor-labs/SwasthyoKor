import { siteConfig } from "@/config";
import { DEFAULT_FROM_EMAIL, resend } from "./resend";

export async function sendMagicLinkEmail({
  to,
  magicLinkUrl,
}: {
  to: string;
  magicLinkUrl: string;
}) {
  const brandName = siteConfig.name;

  return await resend.emails.send({
    from: DEFAULT_FROM_EMAIL,
    to: [to],
    subject: `${brandName} - লগইন ম্যাজিক লিংক`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 28px;">
          <h1 style="color: #15803d; font-size: 26px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">
            ${brandName}
          </h1>
          <p style="color: #6b7280; font-size: 13px; margin: 6px 0 0 0;">
            ১০০% খাঁটি ও প্রাকৃতিক খাদ্যের নির্ভরযোগ্য ঠিকানা
          </p>
        </div>

        <div style="background: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid #f3f4f6;">
          <h2 style="font-size: 18px; font-weight: 700; color: #111827; margin: 0 0 12px 0;">
            লগইন করার অনুরোধ
          </h2>
          <p style="font-size: 14px; line-height: 1.6; color: #374151; margin: 0 0 20px 0;">
            আপনার অ্যাকাউন্টে সরাসরি লগইন করার জন্য নিচের বাটনে ক্লিক করুন। এই লিংকটির মেয়াদ থাকবে <strong>১৫ মিনিট</strong>।
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${magicLinkUrl}" style="background-color: #16a34a; color: #ffffff; padding: 14px 32px; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 10px; display: inline-block; box-shadow: 0 2px 4px rgba(22, 163, 74, 0.2);">
              লগইন করুন
            </a>
          </div>
          <p style="font-size: 12px; color: #9ca3af; margin: 0; word-break: break-all; text-align: center;">
            বাটন কাজ না করলে লিংকটি কপি করে ব্রাউজারে পেস্ট করুন:<br/>
            <a href="${magicLinkUrl}" style="color: #16a34a; text-decoration: underline;">${magicLinkUrl}</a>
          </p>
        </div>

        <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">
          আপনি যদি এই অনুরোধ না করে থাকেন, তবে নির্দ্বিধায় এই ইমেইলটি উপেক্ষা করুন।<br/>
          &copy; ${new Date().getFullYear()} ${brandName}. সর্বস্বত্ব সংরক্ষিত।
        </p>
      </div>
    `,
  });
}

export async function sendOrderConfirmationEmail({
  to,
  orderId,
  customerName,
  totalAmount,
  items,
}: {
  to: string;
  orderId: string;
  customerName?: string | null;
  totalAmount: number;
  items: Array<{
    productTitle: string;
    variantTitle?: string | null;
    quantity: number;
    priceAmount: number;
  }>;
}) {
  const brandName = siteConfig.name;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://swasthyokor.com";
  const orderUrl = `${baseUrl}/order/${orderId}`;

  const itemsHtml = items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #f3f4f6;">
        <td style="padding: 12px 8px; font-size: 13px; color: #374151;">
          <strong>${item.productTitle}</strong>
          ${item.variantTitle ? `<br/><span style="color: #6b7280; font-size: 11px;">${item.variantTitle}</span>` : ""}
        </td>
        <td style="padding: 12px 8px; font-size: 13px; color: #374151; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 12px 8px; font-size: 13px; color: #111827; text-align: right; font-weight: 600;">
          ৳${item.priceAmount * item.quantity}
        </td>
      </tr>
    `,
    )
    .join("");

  return await resend.emails.send({
    from: DEFAULT_FROM_EMAIL,
    to: [to],
    subject: `${brandName} - অর্ডার নিশ্চিতকরণ (#${orderId.slice(0, 8)})`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 28px;">
          <h1 style="color: #15803d; font-size: 26px; font-weight: 800; margin: 0;">
            ${brandName}
          </h1>
          <p style="color: #6b7280; font-size: 13px; margin: 4px 0 0 0;">
            আপনার অর্ডার সফলভাবে গৃহীত হয়েছে!
          </p>
        </div>

        <p style="font-size: 15px; color: #111827; margin: 0 0 16px 0;">
          প্রিয় <strong>${customerName || "গ্রাহক"}</strong>,
        </p>
        <p style="font-size: 14px; color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
          স্বাস্থ্যকর-এ অর্ডার করার জন্য ধন্যবাদ। আপনার অর্ডার নম্বর <code>#${orderId}</code> সফলভাবে প্রক্রিয়াধীন রয়েছে।
        </p>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="border-bottom: 2px solid #e5e7eb; background: #f9fafb;">
              <th style="padding: 10px 8px; font-size: 12px; text-align: left; color: #4b5563;">পণ্য</th>
              <th style="padding: 10px 8px; font-size: 12px; text-align: center; color: #4b5563;">পরিমাণ</th>
              <th style="padding: 10px 8px; font-size: 12px; text-align: right; color: #4b5563;">মূল্য</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 14px 8px; font-size: 14px; font-weight: 700; color: #111827; text-align: right;">
                সর্বমোট:
              </td>
              <td style="padding: 14px 8px; font-size: 16px; font-weight: 800; color: #15803d; text-align: right;">
                ৳${totalAmount}
              </td>
            </tr>
          </tfoot>
        </table>

        <div style="text-align: center; margin: 28px 0;">
          <a href="${orderUrl}" style="background-color: #16a34a; color: #ffffff; padding: 12px 28px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px; display: inline-block;">
            অর্ডারের বিবরণ দেখুন
          </a>
        </div>

        <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">
          যেকোনো প্রয়োজনে যোগাযোগ করুন: ${siteConfig.supportPhone} অথবা ${siteConfig.supportEmail}<br/>
          &copy; ${new Date().getFullYear()} ${brandName}. সর্বস্বত্ব সংরক্ষিত।
        </p>
      </div>
    `,
  });
}
