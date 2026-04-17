import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategorySchema } from '@finance-app/shared';

@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  /**
   * Create default categories for a user
   * POST /categories/defaults
   */
  @Post('defaults')
  async createDefaults(@Query('userId') userId: string) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    return await this.categoriesService.createDefaults(userId);
  }

  /**
   * Create a new custom category
   * POST /categories
   */
  @Post()
  async create(
    @Body() body: any,
    @Query('userId') userId: string
  ) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    try {
      const validatedData = CreateCategorySchema.parse(body);
      return await this.categoriesService.create(userId, validatedData);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Get all categories
   * GET /categories
   */
  @Get()
  async findAll(@Query('userId') userId: string) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    return await this.categoriesService.findAll(userId);
  }

  /**
   * Get a single category
   * GET /categories/:id
   */
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Query('userId') userId: string
  ) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    return await this.categoriesService.findOne(userId, id);
  }

  /**
   * Update a category
   * PUT /categories/:id
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @Query('userId') userId: string
  ) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    return await this.categoriesService.update(userId, id, body);
  }

  /**
   * Delete a category
   * DELETE /categories/:id
   */
  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Query('userId') userId: string
  ) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    return await this.categoriesService.delete(userId, id);
  }

  /**
   * Get category spending statistics
   * GET /categories/stats/byDateRange
   */
  @Get('stats/byDateRange')
  async getStats(
    @Query('userId') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    if (!userId || !startDate || !endDate) {
      throw new BadRequestException('userId, startDate, and endDate are required');
    }

    return await this.categoriesService.getStats(
      userId,
      new Date(startDate),
      new Date(endDate)
    );
  }
}
