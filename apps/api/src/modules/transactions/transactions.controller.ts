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
import { TransactionsService } from './transactions.service';
import { CreateTransactionSchema } from '@finance-app/shared';

@Controller('transactions')
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  /**
   * Create a new transaction
   * POST /transactions
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
      const validatedData = CreateTransactionSchema.parse(body);
      return await this.transactionsService.create(userId, validatedData);
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
    @Query('userId') userId: string,
    @Query('categoryId') categoryId?: string,
    @Query('type') type?: 'income' | 'expense',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '50'
  ) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    return await this.transactionsService.findAll(userId, {
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
    @Query('userId') userId: string
  ) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    return await this.transactionsService.findOne(userId, id);
  }

  /**
   * Update a transaction
   * PUT /transactions/:id
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

    return await this.transactionsService.update(userId, id, body);
  }

  /**
   * Delete a transaction
   * DELETE /transactions/:id
   */
  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Query('userId') userId: string
  ) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    return await this.transactionsService.delete(userId, id);
  }

  /**
   * Get transaction summary
   * GET /transactions/summary/byDateRange
   */
  @Get('summary/byDateRange')
  async getSummary(
    @Query('userId') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    if (!userId || !startDate || !endDate) {
      throw new BadRequestException('userId, startDate, and endDate are required');
    }

    return await this.transactionsService.getSummary(
      userId,
      new Date(startDate),
      new Date(endDate)
    );
  }
}
