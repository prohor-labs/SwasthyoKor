import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface SendMagicLinkParams {
  to: string;
  token: string;
  appUrl: string;
}

interface SendResult {
  success: boolean;
  error?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendMagicLinkEmail({ to, token, appUrl }: SendMagicLinkParams): Promise<SendResult> {
    const magicUrl = `${appUrl}/api/auth/verify?token=${token}`;
    const apiKey = this.configService.get<string>('RESEND_API_KEY');

    if (apiKey && !apiKey.startsWith('re_placeholder')) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(apiKey);
        const from = this.configService.get<string>('EMAIL_FROM') ?? 'SwasthyoKor <onboarding@resend.dev>';

        const { error } = await resend.emails.send({
          from,
          to,
          subject: 'স্বাস্থ্যকর অ্যাকাউন্টে লগইন করুন',
          html: `
            <!DOCTYPE html>
            <html lang="bn">
              <head><meta charset="utf-8"><title>লগইন করুন</title></head>
              <body style="background-color: #f4f4f5; margin: 0; padding: 48px 16px; font-family: sans-serif;">
                <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; padding: 40px 32px; border-radius: 24px; text-align: center;">
                  <h1 style="color: #059669; margin: 0 0 10px 0;">স্বাস্থ্যকর (SwasthyoKor)</h1>
                  <p style="color: #52525b; margin-bottom: 24px;">নিচের বাটনে ক্লিক করে সরাসরি অ্যাকাউন্টে প্রবেশ করুন:</p>
                  <a href="${magicUrl}" style="background-color: #059669; color: #ffffff; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: bold; display: inline-block;">
                    লগইন করুন →
                  </a>
                  <p style="color: #a1a1aa; font-size: 12px; margin-top: 24px;">এই লিংকটি ১৫ মিনিট কার্যকর থাকবে।</p>
                </div>
              </body>
            </html>
          `,
        });

        if (error) {
          this.logger.error(`Resend error: ${JSON.stringify(error)}`);
          return { success: false, error: 'ইমেইল পাঠাতে সমস্যা হয়েছে।' };
        }
        return { success: true };
      } catch (err: unknown) {
        this.logger.error('Failed to send email:', err);
        return { success: false, error: 'ইমেইল পাঠাতে সমস্যা হয়েছে।' };
      }
    }

    this.logger.log(`[MOCK EMAIL] Magic link to ${to}: ${magicUrl}`);
    return { success: true };
  }
}
