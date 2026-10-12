import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { OrdersService } from './orders.service.js';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get(':id')
  async getOrder(@Param('id') id: string) {
    const order = await this.ordersService.getOrder(id);
    return { order };
  }

  @Post('checkout')
  async checkoutCart(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: { address?: string; phone?: string; customerName?: string },
  ) {
    return this.ordersService.checkoutCart(req, res, body);
  }

  @Post('checkout/direct')
  async checkoutDirect(
    @Req() req: Request,
    @Body()
    body: {
      handle: string;
      quantity?: number;
      name?: string;
      phone?: string;
      address?: string;
      couponCode?: string;
    },
  ) {
    return this.ordersService.checkoutDirect(req, body);
  }
}
