import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DrizzleModule } from './drizzle/drizzle.module.js';
import { MailModule } from './mail/mail.module.js';
import { StorageModule } from './storage/storage.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ProductsModule } from './products/products.module.js';
import { CartModule } from './cart/cart.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { PaymentModule } from './payment/payment.module.js';
import { AdminModule } from './admin/admin.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    EventEmitterModule.forRoot(),
    DrizzleModule,
    MailModule,
    StorageModule,
    AuthModule,
    ProductsModule,
    CartModule,
    PaymentModule,
    OrdersModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
