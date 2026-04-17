import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

interface ReceiptUploadData {
  userId: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
}

interface ExtractedData {
  vendor?: string;
  date?: Date;
  total?: number;
  items?: Array<{
    description: string;
    price: number;
    quantity?: number;
  }>;
  paymentMethod?: string;
  receiptNumber?: string;
}

interface ReceiptRecord {
  id: string;
  userId: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  extractedData: ExtractedData;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  processingError?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ReceiptService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Upload a receipt file
   */
  async uploadReceipt(uploadData: ReceiptUploadData): Promise<ReceiptRecord> {
    // Validate file exists
    if (!fs.existsSync(uploadData.filePath)) {
      throw new BadRequestException('Uploaded file not found');
    }

    // Validate file size (max 10MB)
    if (uploadData.fileSize > 10 * 1024 * 1024) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    // Validate file type (image, PDF)
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validMimeTypes.includes(uploadData.mimeType)) {
      throw new BadRequestException('Invalid file type. Only images and PDFs are supported');
    }

    // Create receipt record
    const receipt = await this.prisma.receipt.create({
      data: {
        userId: uploadData.userId,
        fileName: uploadData.fileName,
        filePath: uploadData.filePath,
        mimeType: uploadData.mimeType,
        fileSize: uploadData.fileSize,
        extractedData: {},
        processingStatus: 'pending',
      },
    });

    return this.formatReceiptRecord(receipt);
  }

  /**
   * Extract data from receipt (simulated OCR)
   */
  async extractReceiptData(receiptId: string, userId: string): Promise<ExtractedData> {
    const receipt = await this.getReceiptById(receiptId, userId);

    if (receipt.processingStatus !== 'pending' && receipt.processingStatus !== 'processing') {
      return receipt.extractedData as ExtractedData;
    }

    // Update status to processing
    await this.prisma.receipt.update({
      where: { id: receiptId },
      data: { processingStatus: 'processing' },
    });

    try {
      // Simulate OCR extraction
      const extractedData = await this.simulateOCRExtraction(receipt.filePath);

      // Update receipt with extracted data
      await this.prisma.receipt.update({
        where: { id: receiptId },
        data: {
          extractedData,
          processingStatus: 'completed',
        },
      });

      return extractedData;
    } catch (error) {
      // Mark as failed
      await this.prisma.receipt.update({
        where: { id: receiptId },
        data: {
          processingStatus: 'failed',
          processingError: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw new BadRequestException(`Receipt processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * List receipts for user
   */
  async listReceipts(
    userId: string,
    filters?: {
      status?: 'pending' | 'processing' | 'completed' | 'failed';
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ receipts: ReceiptRecord[]; total: number }> {
    const where = {
      userId,
      ...(filters?.status && { processingStatus: filters.status }),
      ...(filters?.startDate && {
        createdAt: { gte: filters.startDate },
      }),
      ...(filters?.endDate && {
        createdAt: { lte: filters.endDate },
      }),
    };

    const [receipts, total] = await Promise.all([
      this.prisma.receipt.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: filters?.limit || 10,
        skip: filters?.offset || 0,
      }),
      this.prisma.receipt.count({ where }),
    ]);

    return {
      receipts: receipts.map((r) => this.formatReceiptRecord(r)),
      total,
    };
  }

  /**
   * Get receipt by ID
   */
  async getReceiptById(receiptId: string, userId: string): Promise<ReceiptRecord> {
    const receipt = await this.prisma.receipt.findUnique({
      where: { id: receiptId },
    });

    if (!receipt || receipt.userId !== userId) {
      throw new NotFoundException('Receipt not found');
    }

    return this.formatReceiptRecord(receipt);
  }

  /**
   * Delete receipt
   */
  async deleteReceipt(receiptId: string, userId: string): Promise<void> {
    const receipt = await this.getReceiptById(receiptId, userId);

    // Delete file from storage
    if (fs.existsSync(receipt.filePath)) {
      fs.unlinkSync(receipt.filePath);
    }

    // Delete database record
    await this.prisma.receipt.delete({
      where: { id: receiptId },
    });
  }

  /**
   * Get receipt statistics
   */
  async getReceiptStats(userId: string): Promise<{
    total: number;
    pending: number;
    completed: number;
    failed: number;
    averageExtractedAmount: number;
    totalExtractedAmount: number;
  }> {
    const receipts = await this.prisma.receipt.findMany({
      where: { userId },
    });

    const stats = {
      total: receipts.length,
      pending: receipts.filter((r) => r.processingStatus === 'pending').length,
      completed: receipts.filter((r) => r.processingStatus === 'completed').length,
      failed: receipts.filter((r) => r.processingStatus === 'failed').length,
      averageExtractedAmount: 0,
      totalExtractedAmount: 0,
    };

    // Calculate totals from extracted data
    const completedReceipts = receipts.filter((r) => r.processingStatus === 'completed');
    if (completedReceipts.length > 0) {
      const amounts = completedReceipts
        .map((r) => {
          const data = r.extractedData as ExtractedData;
          return data.total || 0;
        })
        .filter((a) => a > 0);

      if (amounts.length > 0) {
        stats.totalExtractedAmount = amounts.reduce((sum, a) => sum + a, 0);
        stats.averageExtractedAmount = stats.totalExtractedAmount / amounts.length;
      }
    }

    return stats;
  }

  /**
   * Simulate OCR extraction (placeholder for real OCR integration)
   */
  private async simulateOCRExtraction(filePath: string): Promise<ExtractedData> {
    // In a real implementation, this would call an OCR service like:
    // - Google Cloud Vision API
    // - AWS Textract
    // - Azure Computer Vision
    // - Local Tesseract

    // For now, simulate realistic data based on filename
    const fileName = path.basename(filePath);
    
    // Generate realistic mock data
    const vendors = ['Whole Foods', 'Trader Joe\'s', 'Safeway', 'Target', 'Walmart', 'CVS', 'Walgreens'];
    const vendor = vendors[Math.floor(Math.random() * vendors.length)];
    
    const amount = Math.round((Math.random() * 150 + 10) * 100) / 100;
    
    const items = Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, i) => ({
      description: `Item ${i + 1}`,
      price: Math.round((amount / (i + 2)) * 100) / 100,
      quantity: Math.floor(Math.random() * 3) + 1,
    }));

    return {
      vendor,
      date: new Date(),
      total: amount,
      items,
      paymentMethod: Math.random() > 0.5 ? 'credit_card' : 'cash',
      receiptNumber: `REC-${Date.now()}`,
    };
  }

  /**
   * Format receipt record for API response
   */
  private formatReceiptRecord(receipt: any): ReceiptRecord {
    return {
      id: receipt.id,
      userId: receipt.userId,
      fileName: receipt.fileName,
      filePath: receipt.filePath,
      mimeType: receipt.mimeType,
      fileSize: receipt.fileSize,
      extractedData: receipt.extractedData || {},
      processingStatus: receipt.processingStatus,
      processingError: receipt.processingError || undefined,
      createdAt: receipt.createdAt,
      updatedAt: receipt.updatedAt,
    };
  }
}
