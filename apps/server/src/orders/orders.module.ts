import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';
import { CartModule } from '../cart/cart.module.js';
import { PaymentModule } from '../payment/payment.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [CartModule, PaymentModule, AuthModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
