import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { ReceiptService } from './receipts.service';
import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads', 'receipts');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (validMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestException('Invalid file type'), false);
  }
};

@Controller('receipts')
@UseGuards(JwtAuthGuard)
export class ReceiptController {
  constructor(private readonly receiptService: ReceiptService) {}

  /**
   * Upload a receipt file
   * POST /receipts/upload
   */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      fileFilter,
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    })
  )
  async uploadReceipt(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const receipt = await this.receiptService.uploadReceipt({
      userId: user.id,
      fileName: file.originalname,
      filePath: file.path,
      mimeType: file.mimetype,
      fileSize: file.size,
    });

    return {
      success: true,
      data: receipt,
    };
  }

  /**
   * Extract data from receipt
   * POST /receipts/:id/extract
   */
  @Post(':id/extract')
  async extractReceipt(
    @Param('id') receiptId: string,
    @CurrentUser() user: any
  ) {
    const extractedData = await this.receiptService.extractReceiptData(receiptId, user.id);

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
    @CurrentUser() user: any,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    const filters = {
      status: status as 'pending' | 'processing' | 'completed' | 'failed' | undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: limit ? parseInt(limit) : 10,
      offset: offset ? parseInt(offset) : 0,
    };

    const result = await this.receiptService.listReceipts(user.id, filters);

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
  async getReceipt(
    @Param('id') receiptId: string,
    @CurrentUser() user: any
  ) {
    const receipt = await this.receiptService.getReceiptById(receiptId, user.id);

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
  async deleteReceipt(
    @Param('id') receiptId: string,
    @CurrentUser() user: any
  ) {
    await this.receiptService.deleteReceipt(receiptId, user.id);
  }

  /**
   * Get receipt statistics
   * GET /receipts/stats/summary
   */
  @Get('stats/summary')
  async getReceiptStats(
    @CurrentUser() user: any
  ) {
    const stats = await this.receiptService.getReceiptStats(user.id);

    return {
      success: true,
      data: stats,
    };
  }
}
