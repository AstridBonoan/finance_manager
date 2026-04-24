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
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategorySchema } from '@finance-app/shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../auth/decorators/current-user.decorator';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  /**
   * Create default categories for a user
   * POST /categories/defaults
   */
  @Post('defaults')
  async createDefaults(@CurrentUser() user: AuthenticatedUser) {
    return await this.categoriesService.createDefaults(user.id);
  }

  /**
   * Create a new custom category
   * POST /categories
   */
  @Post()
  async create(
    @Body() body: any,
    @CurrentUser() user: AuthenticatedUser
  ) {
    try {
      const validatedData = CreateCategorySchema.parse(body);
      return await this.categoriesService.create(user.id, validatedData);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Get all categories
   * GET /categories
   */
  @Get()
  async findAll(@CurrentUser() user: AuthenticatedUser) {
    return await this.categoriesService.findAll(user.id);
  }

  /**
   * Get a single category
   * GET /categories/:id
   */
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return await this.categoriesService.findOne(user.id, id);
  }

  /**
   * Update a category
   * PUT /categories/:id
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return await this.categoriesService.update(user.id, id, body);
  }

  /**
   * Delete a category
   * DELETE /categories/:id
   */
  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return await this.categoriesService.delete(user.id, id);
  }

  /**
   * Get category spending statistics
   * GET /categories/stats/byDateRange
   */
  @Get('stats/byDateRange')
  async getStats(
    @CurrentUser() user: AuthenticatedUser,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException('startDate and endDate are required');
    }

    return await this.categoriesService.getStats(
      user.id,
      new Date(startDate),
      new Date(endDate)
    );
  }
}
