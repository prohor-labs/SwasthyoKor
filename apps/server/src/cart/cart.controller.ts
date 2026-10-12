import { Body, Controller, Delete, Get, Param, Patch, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { CartService, CART_COOKIE } from './cart.service.js';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@Req() req: Request) {
    const cartId = req.cookies?.[CART_COOKIE];
    return { cart: await this.cartService.getCart(cartId) };
  }

  @Post('items')
  async addItem(
    @Body('variantId') variantId: string,
    @Body('quantity') quantity: number | undefined,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cart = await this.cartService.addItem(variantId, quantity ?? 1, req, res);
    return { cart };
  }

  @Patch('items/:variantId')
  async updateItemQuantity(
    @Param('variantId') variantId: string,
    @Body('type') type: 'plus' | 'minus' | 'delete',
    @Req() req: Request,
  ) {
    const cart = await this.cartService.updateItemQuantity(variantId, type, req);
    return { cart };
  }

  @Delete('items/:variantId')
  async removeItem(@Param('variantId') variantId: string, @Req() req: Request) {
    const cart = await this.cartService.updateItemQuantity(variantId, 'delete', req);
    return { cart };
  }
}
