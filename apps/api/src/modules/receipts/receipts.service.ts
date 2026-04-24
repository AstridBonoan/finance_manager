import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@finance-app/db';

const prisma = new PrismaClient();

interface ReceiptUploadData {
  userId: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
}

export interface ExtractedData {
  [key: string]: any;
}

export interface ReceiptRecord {
  id: string;
  userId: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  rawText: string | null;
  parsedData: ExtractedData | null;
  confidence: number | null;
  status: string;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ReceiptService {
  async uploadReceipt(uploadData: ReceiptUploadData): Promise<ReceiptRecord> {
    if (uploadData.fileSize > 10 * 1024 * 1024) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validMimeTypes.includes(uploadData.mimeType)) {
      throw new BadRequestException('Invalid file type');
    }

    const receipt = await prisma.receipt.create({
      data: {
        userId: uploadData.userId,
        fileName: uploadData.fileName,
        filePath: uploadData.filePath,
        mimeType: uploadData.mimeType,
        fileSize: uploadData.fileSize,
        status: 'pending',
      },
    });

    return this.formatReceiptRecord(receipt);
  }

  async extractReceiptData(receiptId: string, userId: string): Promise<ReceiptRecord> {
    const receipt = await this.getReceiptById(receiptId, userId);
    const extractedData = this.simulateOCRExtraction();

    const updated = await prisma.receipt.update({
      where: { id: receiptId },
      data: {
        parsedData: extractedData,
        rawText: JSON.stringify(extractedData),
        status: 'parsed',
        confidence: Math.round(Math.random() * 30 + 70),
      },
    });

    return this.formatReceiptRecord(updated);
  }

  async listReceipts(userId: string, filters?: any): Promise<{ receipts: ReceiptRecord[]; total: number }> {
    const where: any = { userId };
    if (filters?.status) where.status = filters.status;
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters?.startDate) where.createdAt.gte = filters.startDate;
      if (filters?.endDate) where.createdAt.lte = filters.endDate;
    }

    const [receipts, total] = await Promise.all([
      prisma.receipt.findMany({ where, orderBy: { createdAt: 'desc' }, take: filters?.limit || 10, skip: filters?.offset || 0 }),
      prisma.receipt.count({ where }),
    ]);

    return { receipts: receipts.map((r) => this.formatReceiptRecord(r)), total };
  }

  async getReceiptById(receiptId: string, userId: string): Promise<ReceiptRecord> {
    const receipt = await prisma.receipt.findUnique({ where: { id: receiptId } });
    if (!receipt || receipt.userId !== userId) throw new NotFoundException('Receipt not found');
    return this.formatReceiptRecord(receipt);
  }

  async deleteReceipt(receiptId: string, userId: string): Promise<void> {
    const receipt = await this.getReceiptById(receiptId, userId);
    await prisma.receipt.delete({ where: { id: receiptId } });
  }

  async getReceiptStats(userId: string): Promise<Record<string, any>> {
    const receipts = await prisma.receipt.findMany({ where: { userId } });
    return {
      totalCount: receipts.length,
      byStatus: {
        pending: receipts.filter((r) => r.status === 'pending').length,
        parsed: receipts.filter((r) => r.status === 'parsed').length,
        reviewed: receipts.filter((r) => r.status === 'reviewed').length,
        error: receipts.filter((r) => r.status === 'error').length,
      },
    };
  }

  async updateReceiptStatus(receiptId: string, userId: string, status: any): Promise<ReceiptRecord> {
    const receipt = await this.getReceiptById(receiptId, userId);
    const updated = await prisma.receipt.update({ where: { id: receiptId }, data: { status } });
    return this.formatReceiptRecord(updated);
  }

  private simulateOCRExtraction(): ExtractedData {
    const merchants = ['Whole Foods', 'Trader Joes', 'Safeway', 'Target', 'Walmart'];
    const merchant = merchants[Math.floor(Math.random() * merchants.length)];
    const subtotal = Math.round((Math.random() * 150 + 15) * 100) / 100;
    const tax = Math.round(subtotal * 0.0825 * 100) / 100;

    return { merchant, date: new Date().toISOString().split('T')[0], subtotal, tax, total: subtotal + tax, items: Array.from({ length: 3 }, (_, i) => ({ description: `Item ${i + 1}`, price: Math.round((Math.random() * 50 + 2) * 100) / 100 })) };
  }

  private formatReceiptRecord(receipt: any): ReceiptRecord {
    return { id: receipt.id, userId: receipt.userId, fileName: receipt.fileName, filePath: receipt.filePath, mimeType: receipt.mimeType, fileSize: receipt.fileSize, rawText: receipt.rawText || null, parsedData: receipt.parsedData || null, confidence: receipt.confidence || null, status: receipt.status, errorMessage: receipt.errorMessage || null, createdAt: receipt.createdAt, updatedAt: receipt.updatedAt };
  }
}
