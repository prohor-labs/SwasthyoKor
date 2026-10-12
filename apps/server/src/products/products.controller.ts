import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service.js';

@Controller('shop')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('products')
  async getProducts(
    @Query('query') query?: string,
    @Query('sortKey') sortKey?: any,
    @Query('reverse') reverse?: string,
  ) {
    return this.productsService.getProducts({
      query,
      sortKey,
      reverse: reverse === 'true',
    });
  }

  @Get('products/:handle')
  async getProduct(@Param('handle') handle: string) {
    return this.productsService.getProduct(handle);
  }

  @Get('products/:id/recommendations')
  async getProductRecommendations(@Param('id') id: string) {
    return this.productsService.getProductRecommendations(id);
  }

  @Get('products/:id/reviews')
  async getProductReviews(@Param('id') id: string) {
    return this.productsService.getProductReviews(id);
  }

  @Get('collections')
  async getCollections() {
    return this.productsService.getCollections();
  }

  @Get('collections/:handle')
  async getCollection(@Param('handle') handle: string) {
    return this.productsService.getCollection(handle);
  }

  @Get('collections/:handle/products')
  async getCollectionProducts(
    @Param('handle') handle: string,
    @Query('sortKey') sortKey?: any,
    @Query('reverse') reverse?: string,
  ) {
    return this.productsService.getCollectionProducts({
      collection: handle,
      sortKey,
      reverse: reverse === 'true',
    });
  }

  @Get('homepage/categories')
  async getHomepageCategories() {
    return this.productsService.getCategorySliderCategories();
  }

  @Get('homepage/showcase')
  async getHomepageShowcase() {
    return this.productsService.getHomepageShowcaseCategories();
  }

  @Get('homepage/banners')
  async getHeroBanners() {
    return this.productsService.getHeroBanners();
  }

  @Get('settings')
  async getSettings() {
    return this.productsService.getStoreSettings();
  }

  @Get('menus/:handle')
  async getMenu(@Param('handle') handle: string) {
    return this.productsService.getMenu(handle);
  }

  @Get('pages')
  async getPages() {
    return this.productsService.getPages();
  }

  @Get('pages/:handle')
  async getPage(@Param('handle') handle: string) {
    return this.productsService.getPage(handle);
  }

  @Get('blogs')
  async getBlogs() {
    return this.productsService.getBlogs();
  }

  @Get('blogs/:slug')
  async getBlog(@Param('slug') slug: string) {
    return this.productsService.getBlog(slug);
  }
}
