import { Controller, Post, Get, Delete, Param, Patch, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ReceiptService, ReceiptRecord } from './receipts.service';

@Controller('receipts')
export class ReceiptController {
  constructor(private readonly receiptService: ReceiptService) {}

  @Post(':id/extract')
  async extractReceipt(@Param('id') receiptId: string): Promise<{ success: boolean; data: ReceiptRecord }> {
    const extractedData = await this.receiptService.extractReceiptData(receiptId, 'user-id');
    return { success: true, data: extractedData };
  }

  @Get()
  async listReceipts(
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ): Promise<{ success: boolean; data: ReceiptRecord[]; pagination: any }> {
    const result = await this.receiptService.listReceipts('user-id', {
      status: status as any,
      limit: limit ? parseInt(limit) : 10,
      offset: offset ? parseInt(offset) : 0,
    });

    return {
      success: true,
      data: result.receipts,
      pagination: { total: result.total },
    };
  }

  @Get(':id')
  async getReceipt(@Param('id') receiptId: string): Promise<{ success: boolean; data: ReceiptRecord }> {
    const receipt = await this.receiptService.getReceiptById(receiptId, 'user-id');
    return { success: true, data: receipt };
  }

  @Patch(':id/status')
  async updateReceiptStatus(
    @Param('id') receiptId: string,
    @Query('status') status: string
  ): Promise<{ success: boolean; data: ReceiptRecord }> {
    const receipt = await this.receiptService.updateReceiptStatus(receiptId, 'user-id', status as any);
    return { success: true, data: receipt };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteReceipt(@Param('id') receiptId: string): Promise<void> {
    await this.receiptService.deleteReceipt(receiptId, 'user-id');
  }

  @Get('stats/summary')
  async getReceiptStats(): Promise<{ success: boolean; data: Record<string, any> }> {
    const stats = await this.receiptService.getReceiptStats('user-id');
    return { success: true, data: stats };
  }
}
import { Controller, Post, Get, Delete, Param, Patch, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ReceiptService, ReceiptRecord } from './receipts.service';

@Controller('receipts')
export class ReceiptController {
  constructor(private readonly receiptService: ReceiptService) {}

  @Post(':id/extract')
  async extractReceipt(@Param('id') receiptId: string): Promise<{ success: boolean; data: ReceiptRecord }> {
    const extractedData = await this.receiptService.extractReceiptData(receiptId, 'user-id');
    return { success: true, data: extractedData };
  }

  @Get()
  async listReceipts(
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ): Promise<{ success: boolean; data: ReceiptRecord[]; pagination: any }> {
    const result = await this.receiptService.listReceipts('user-id', {
      status: status as any,
      limit: limit ? parseInt(limit) : 10,
      offset: offset ? parseInt(offset) : 0,
    });

    return {
      success: true,
      data: result.receipts,
      pagination: { total: result.total },
    };
  }

  @Get(':id')
  async getReceipt(@Param('id') receiptId: string): Promise<{ success: boolean; data: ReceiptRecord }> {
    const receipt = await this.receiptService.getReceiptById(receiptId, 'user-id');
    return { success: true, data: receipt };
  }

  @Patch(':id/status')
  async updateReceiptStatus(
    @Param('id') receiptId: string,
    @Query('status') status: string
  ): Promise<{ success: boolean; data: ReceiptRecord }> {
    const receipt = await this.receiptService.updateReceiptStatus(receiptId, 'user-id', status as any);
    return { success: true, data: receipt };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteReceipt(@Param('id') receiptId: string): Promise<void> {
    await this.receiptService.deleteReceipt(receiptId, 'user-id');
  }

  @Get('stats/summary')
  async getReceiptStats(): Promise<{ success: boolean; data: Record<string, any> }> {
    const stats = await this.receiptService.getReceiptStats('user-id');
    return { success: true, data: stats };
  }
}
import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Patch,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReceiptService, ReceiptRecord } from './receipts.service';

@Controller('receipts')
export class ReceiptController {
  constructor(private readonly receiptService: ReceiptService) {}

  @Post(':id/extract')
  async extractReceipt(@Param('id') receiptId: string): Promise<{ success: boolean; data: ReceiptRecord }> {
    const extractedData = await this.receiptService.extractReceiptData(receiptId, 'user-id');
    return { success: true, data: extractedData };
  }

  @Get()
  async listReceipts(
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ): Promise<{ success: boolean; data: ReceiptRecord[]; pagination: any }> {
    const filters = {
      status: status as 'pending' | 'parsed' | 'reviewed' | 'error' | undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: limit ? parseInt(limit) : 10,
      offset: offset ? parseInt(offset) : 0,
    };

    const result = await this.receiptService.listReceipts('user-id', filters);

    return {
      success: true,
      data: result.receipts,
      pagination: {
        total: result.total,
        limit: filters.limit,
        offset: filters.offset,
      },
    };
  }

  @Get(':id')
  async getReceipt(@Param('id') receiptId: string): Promise<{ success: boolean; data: ReceiptRecord }> {
    const receipt = await this.receiptService.getReceiptById(receiptId, 'user-id');
    return { success: true, data: receipt };
  }

  @Patch(':id/status')
  async updateReceiptStatus(
    @Param('id') receiptId: string,
    @Query('status') status: string
  ): Promise<{ success: boolean; data: ReceiptRecord }> {
    const receipt = await this.receiptService.updateReceiptStatus(
      receiptId,
      'user-id',
      status as 'pending' | 'parsed' | 'reviewed' | 'error'
    );

    return { success: true, data: receipt };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteReceipt(@Param('id') receiptId: string): Promise<void> {
    await this.receiptService.deleteReceipt(receiptId, 'user-id');
  }

  @Get('stats/summary')
  async getReceiptStats(): Promise<{ success: boolean; data: Record<string, any> }> {
    const stats = await this.receiptService.getReceiptStats('user-id');
    return { success: true, data: stats };
  }
}
import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Patch,
  Query,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReceiptService, ReceiptRecord } from './receipts.service';

@Controller('receipts')
export class ReceiptController {
  constructor(private readonly receiptService: ReceiptService) {}

  /**
   * Upload a receipt file
   * POST /receipts/upload
   */
  @Post('upload')
  async uploadReceipt() {
    // File upload handled by middleware
    // This endpoint structure is prepared for future file upload integration
    throw new BadRequestException('File upload endpoint - implement file handling');
  }

  /**
   * Extract data from receipt
   * POST /receipts/:id/extract
   */
  @Post(':id/extract')
  async extractReceipt(@Param('id') receiptId: string): Promise<{ success: boolean; data: ReceiptRecord }> {
    const extractedData = await this.receiptService.extractReceiptData(receiptId, 'user-id');

    return {
      success: true,
      data: extractedData,
    };
  }

  /**
   * List receipts for user
   * GET /receipts
   */
  @Get()
  async listReceipts(
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ): Promise<{ success: boolean; data: ReceiptRecord[]; pagination: any }> {
    const filters = {
      status: status as 'pending' | 'parsed' | 'reviewed' | 'error' | undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: limit ? parseInt(limit) : 10,
      offset: offset ? parseInt(offset) : 0,
    };

    const result = await this.receiptService.listReceipts('user-id', filters);

    return {
      success: true,
      data: result.receipts,
      pagination: {
        total: result.total,
        limit: filters.limit,
        offset: filters.offset,
      },
    };
  }

  /**
   * Get receipt by ID
   * GET /receipts/:id
   */
  @Get(':id')
  async getReceipt(@Param('id') receiptId: string): Promise<{ success: boolean; data: ReceiptRecord }> {
    const receipt = await this.receiptService.getReceiptById(receiptId, 'user-id');

    return {
      success: true,
      data: receipt,
    };
  }

  /**
   * Update receipt status
   * PATCH /receipts/:id/status
   */
  @Patch(':id/status')
  async updateReceiptStatus(
    @Param('id') receiptId: string,
    @Query('status') status: string
  ): Promise<{ success: boolean; data: ReceiptRecord }> {
    const receipt = await this.receiptService.updateReceiptStatus(
      receiptId,
      'user-id',
      status as 'pending' | 'parsed' | 'reviewed' | 'error'
    );

    return {
      success: true,
      data: receipt,
    };
  }

  /**
   * Delete receipt
   * DELETE /receipts/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteReceipt(@Param('id') receiptId: string) {
    await this.receiptService.deleteReceipt(receiptId, 'user-id');
  }

  /**
   * Get receipt statistics
   * GET /receipts/stats/summary
   */
  @Get('stats/summary')
  async getReceiptStats() {
    const stats = await this.receiptService.getReceiptStats('user-id');

    return {
      success: true,
      data: stats,
    };
  }
}
