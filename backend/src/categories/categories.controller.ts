import { Controller, Get, Post, Body } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  getAllCategories(): string[] {
    return this.categoriesService.getAllCategories();
  }

  @Post('suggest')
  suggestCategories(
    @Body() body: { transactions: { id: string; description: string }[] },
  ) {
    return this.categoriesService.suggestCategories(body.transactions);
  }
}
