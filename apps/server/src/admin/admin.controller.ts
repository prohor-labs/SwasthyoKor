import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service.js';
import { SessionGuard } from '../auth/guards/session.guard.js';
import { AdminGuard } from '../auth/guards/admin.guard.js';

@Controller('admin')
@UseGuards(SessionGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('products')
  async getProducts() {
    return this.adminService.getAllProducts();
  }

  @Post('products')
  async createProduct(@Body() body: any) {
    return this.adminService.createProduct(body);
  }

  @Delete('products/:id')
  async deleteProduct(@Param('id') id: string) {
    return this.adminService.deleteProduct(id);
  }

  @Patch('products/:id/availability')
  async toggleAvailability(@Param('id') id: string, @Body('available') available: boolean) {
    return this.adminService.toggleProductAvailability(id, available);
  }

  @Get('orders')
  async getOrders() {
    return this.adminService.getAllOrders();
  }

  @Patch('orders/:id/status')
  async updateOrderStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.adminService.updateOrderStatus(id, status);
  }

  @Get('collections')
  async getCollections() {
    return this.adminService.getAllCollections();
  }

  @Post('collections')
  async createCollection(@Body() body: any) {
    return this.adminService.createCollection(body);
  }

  @Delete('collections/:id')
  async deleteCollection(@Param('id') id: string) {
    return this.adminService.deleteCollection(id);
  }

  @Get('customers')
  async getCustomers() {
    return this.adminService.getAllCustomers();
  }

  @Patch('customers/:id/ban')
  async toggleBan(@Param('id') id: string, @Body('isBanned') isBanned: boolean) {
    return this.adminService.toggleCustomerBan(id, isBanned);
  }

  @Get('coupons')
  async getCoupons() {
    return this.adminService.getAllCoupons();
  }

  @Post('coupons')
  async createCoupon(@Body() body: any) {
    return this.adminService.createCoupon(body);
  }

  @Delete('coupons/:id')
  async deleteCoupon(@Param('id') id: string) {
    return this.adminService.deleteCoupon(id);
  }

  @Get('banners')
  async getBanners() {
    return this.adminService.getAllBanners();
  }

  @Post('banners')
  async createBanner(@Body() body: any) {
    return this.adminService.createBanner(body);
  }

  @Delete('banners/:id')
  async deleteBanner(@Param('id') id: string) {
    return this.adminService.deleteBanner(id);
  }

  @Post('settings')
  async updateSettings(@Body() body: any) {
    return this.adminService.updateSettings(body);
  }
}
