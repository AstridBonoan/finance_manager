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
import { TransactionsService } from './transactions.service';
import { CreateTransactionSchema } from '@finance-app/shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../auth/decorators/current-user.decorator';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  /**
   * Create a new transaction
   * POST /transactions
   */
  @Post()
  async create(
    @Body() body: any,
    @CurrentUser() user: AuthenticatedUser
  ) {
    try {
      const validatedData = CreateTransactionSchema.parse(body);
      return await this.transactionsService.create(user.id, validatedData);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Get all transactions
   * GET /transactions
   */
  @Get()
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('categoryId') categoryId?: string,
    @Query('type') type?: 'income' | 'expense',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '50'
  ) {
    return await this.transactionsService.findAll(user.id, {
      categoryId,
      type,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      skip: (parseInt(page) - 1) * parseInt(pageSize),
      take: parseInt(pageSize),
    });
  }

  /**
   * Get a single transaction
   * GET /transactions/:id
   */
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return await this.transactionsService.findOne(user.id, id);
  }

  /**
   * Update a transaction
   * PUT /transactions/:id
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return await this.transactionsService.update(user.id, id, body);
  }

  /**
   * Delete a transaction
   * DELETE /transactions/:id
   */
  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return await this.transactionsService.delete(user.id, id);
  }

  /**
   * Get transaction summary
   * GET /transactions/summary/byDateRange
   */
  @Get('summary/byDateRange')
  async getSummary(
    @CurrentUser() user: AuthenticatedUser,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException('startDate and endDate are required');
    }

    return await this.transactionsService.getSummary(
      user.id,
      new Date(startDate),
      new Date(endDate)
    );
  }
}
