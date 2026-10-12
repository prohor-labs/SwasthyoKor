import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';
import type { Response } from 'express';
import { DrizzleService } from '../drizzle/drizzle.service.js';
import { orders } from '../drizzle/schema.js';
import { PaymentService, type VerifyPaymentResponse } from './payment.service.js';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly drizzle: DrizzleService,
    private readonly configService: ConfigService,
  ) {}

  @Get('callback')
  async callback(
    @Query('order_id') orderId: string,
    @Query('invoice_id') invoiceId: string,
    @Res() res: Response,
  ) {
    const appUrl = this.configService.get<string>('APP_URL') || 'http://localhost:3000';

    if (!orderId) {
      return res.redirect(`${appUrl}/search`);
    }

    if (invoiceId) {
      try {
        const verifyData: VerifyPaymentResponse =
          await this.paymentService.verifyPayment(invoiceId);

        if (verifyData.status === 'COMPLETED') {
          await this.drizzle.db
            .update(orders)
            .set({
              paymentStatus: 'paid',
              status: 'confirmed',
              paymentInvoiceId: invoiceId,
              paymentTrxId: verifyData.transaction_id,
              paymentSenderNumber: verifyData.sender_number,
              updatedAt: new Date(),
            })
            .where(eq(orders.id, orderId));

          return res.redirect(`${appUrl}/order/${orderId}?payment=success`);
        }
      } catch (err) {
        console.error('Error verifying payment on callback:', err);
      }
    }

    return res.redirect(`${appUrl}/order/${orderId}`);
  }

  @Post('webhook')
  async webhook(
    @Headers('rt-uddoktapay-api-key') apiKey: string,
    @Body() body: Record<string, unknown>,
  ) {
    if (!this.paymentService.validateWebhookHeader(apiKey)) {
      throw new BadRequestException('অবৈধ Webhook কী');
    }

    const invoiceId = body.invoice_id as string;
    const metadata = body.metadata as Record<string, string> | undefined;
    const orderId = metadata?.order_id;

    if (invoiceId && orderId && body.status === 'COMPLETED') {
      await this.drizzle.db
        .update(orders)
        .set({
          paymentStatus: 'paid',
          status: 'confirmed',
          paymentInvoiceId: invoiceId,
          paymentTrxId: body.transaction_id as string,
          paymentSenderNumber: body.sender_number as string,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId));
    }

    return { received: true };
  }
}
