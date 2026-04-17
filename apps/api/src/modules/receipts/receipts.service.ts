import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

interface ReceiptUploadData {
  userId: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
}

interface ExtractedData {
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
  constructor(private prisma: PrismaService) {}

  async uploadReceipt(uploadData: ReceiptUploadData): Promise<ReceiptRecord> {
    if (uploadData.fileSize > 10 * 1024 * 1024) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validMimeTypes.includes(uploadData.mimeType)) {
      throw new BadRequestException('Invalid file type');
    }

    const receipt = await this.prisma.receipt.create({
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

    const updated = await this.prisma.receipt.update({
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

  async listReceipts(
    userId: string,
    filters?: {
      status?: 'pending' | 'parsed' | 'reviewed' | 'error';
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ receipts: ReceiptRecord[]; total: number }> {
    const where: any = { userId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters?.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters?.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

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

  async getReceiptById(receiptId: string, userId: string): Promise<ReceiptRecord> {
    const receipt = await this.prisma.receipt.findUnique({
      where: { id: receiptId },
    });

    if (!receipt || receipt.userId !== userId) {
      throw new NotFoundException('Receipt not found');
    }

    return this.formatReceiptRecord(receipt);
  }

  async deleteReceipt(receiptId: string, userId: string): Promise<void> {
    const receipt = await this.getReceiptById(receiptId, userId);
    await this.prisma.receipt.delete({
      where: { id: receiptId },
    });
  }

  async getReceiptStats(userId: string): Promise<Record<string, any>> {
    const receipts = await this.prisma.receipt.findMany({
      where: { userId },
    });

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

  async updateReceiptStatus(
    receiptId: string,
    userId: string,
    status: 'pending' | 'parsed' | 'reviewed' | 'error'
  ): Promise<ReceiptRecord> {
    const receipt = await this.getReceiptById(receiptId, userId);

    const updated = await this.prisma.receipt.update({
      where: { id: receiptId },
      data: { status },
    });

    return this.formatReceiptRecord(updated);
  }

  private simulateOCRExtraction(): ExtractedData {
    const merchants = ['Whole Foods', "Trader Joe's", 'Safeway', 'Target', 'Walmart'];
    const merchant = merchants[Math.floor(Math.random() * merchants.length)];
    const subtotal = Math.round((Math.random() * 150 + 15) * 100) / 100;
    const tax = Math.round(subtotal * 0.0825 * 100) / 100;

    return {
      merchant,
      date: new Date().toISOString().split('T')[0],
      subtotal,
      tax,
      total: subtotal + tax,
      items: Array.from({ length: 3 }, (_, i) => ({
        description: `Item ${i + 1}`,
        price: Math.round((Math.random() * 50 + 2) * 100) / 100,
      })),
    };
  }

  private formatReceiptRecord(receipt: any): ReceiptRecord {
    return {
      id: receipt.id,
      userId: receipt.userId,
      fileName: receipt.fileName,
      filePath: receipt.filePath,
      mimeType: receipt.mimeType,
      fileSize: receipt.fileSize,
      rawText: receipt.rawText,
      parsedData: receipt.parsedData,
      confidence: receipt.confidence,
      status: receipt.status,
      errorMessage: receipt.errorMessage,
      createdAt: receipt.createdAt,
      updatedAt: receipt.updatedAt,
    };
  }
}
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

interface ReceiptUploadData {
  userId: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
}

interface ExtractedData {
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
  constructor(private prisma: PrismaService) {}

  async uploadReceipt(uploadData: ReceiptUploadData): Promise<ReceiptRecord> {
    if (uploadData.fileSize > 10 * 1024 * 1024) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validMimeTypes.includes(uploadData.mimeType)) {
      throw new BadRequestException('Invalid file type');
    }

    const receipt = await this.prisma.receipt.create({
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

    const updated = await this.prisma.receipt.update({
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

  async listReceipts(
    userId: string,
    filters?: {
      status?: 'pending' | 'parsed' | 'reviewed' | 'error';
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ receipts: ReceiptRecord[]; total: number }> {
    const where: any = { userId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters?.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters?.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

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

  async getReceiptById(receiptId: string, userId: string): Promise<ReceiptRecord> {
    const receipt = await this.prisma.receipt.findUnique({
      where: { id: receiptId },
    });

    if (!receipt || receipt.userId !== userId) {
      throw new NotFoundException('Receipt not found');
    }

    return this.formatReceiptRecord(receipt);
  }

  async deleteReceipt(receiptId: string, userId: string): Promise<void> {
    const receipt = await this.getReceiptById(receiptId, userId);
    await this.prisma.receipt.delete({
      where: { id: receiptId },
    });
  }

  async getReceiptStats(userId: string): Promise<Record<string, any>> {
    const receipts = await this.prisma.receipt.findMany({
      where: { userId },
    });

    return {
      totalCount: receipts.length,
      byStatus: {
        pending: receipts.filter((r) => r.status === 'pending').length,
        parsed: receipts.filter((r) => r.status === 'parsed').length,
        reviewed: receipts.filter((r) => r.status === 'reviewed').length,
        error: receipts.filter((r) => r.status === 'error').length,
      },
      totalSpent: receipts.reduce((sum, r) => {
        if (r.parsedData && typeof r.parsedData === 'object' && 'total' in r.parsedData) {
          return sum + ((r.parsedData as any).total || 0);
        }
        return sum;
      }, 0),
    };
  }

  async updateReceiptStatus(
    receiptId: string,
    userId: string,
    status: 'pending' | 'parsed' | 'reviewed' | 'error'
  ): Promise<ReceiptRecord> {
    const receipt = await this.getReceiptById(receiptId, userId);

    const updated = await this.prisma.receipt.update({
      where: { id: receiptId },
      data: { status },
    });

    return this.formatReceiptRecord(updated);
  }

  private simulateOCRExtraction(): ExtractedData {
    const merchants = ['Whole Foods', "Trader Joe's", 'Safeway', 'Target', 'Walmart'];
    const merchant = merchants[Math.floor(Math.random() * merchants.length)];
    const subtotal = Math.round((Math.random() * 150 + 15) * 100) / 100;
    const tax = Math.round(subtotal * 0.0825 * 100) / 100;

    return {
      merchant,
      date: new Date().toISOString().split('T')[0],
      subtotal,
      tax,
      total: subtotal + tax,
      items: Array.from({ length: 3 }, (_, i) => ({
        description: `Item ${i + 1}`,
        price: Math.round((Math.random() * 50 + 2) * 100) / 100,
      })),
    };
  }

  private formatReceiptRecord(receipt: any): ReceiptRecord {
    return {
      id: receipt.id,
      userId: receipt.userId,
      fileName: receipt.fileName,
      filePath: receipt.filePath,
      mimeType: receipt.mimeType,
      fileSize: receipt.fileSize,
      rawText: receipt.rawText,
      parsedData: receipt.parsedData,
      confidence: receipt.confidence,
      status: receipt.status,
      errorMessage: receipt.errorMessage,
      createdAt: receipt.createdAt,
      updatedAt: receipt.updatedAt,
    };
  }
}
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

interface ReceiptUploadData {
  userId: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
}

interface ExtractedData {
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
  constructor(private prisma: PrismaService) {}

  async uploadReceipt(uploadData: ReceiptUploadData): Promise<ReceiptRecord> {
    if (uploadData.fileSize > 10 * 1024 * 1024) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validMimeTypes.includes(uploadData.mimeType)) {
      throw new BadRequestException('Invalid file type');
    }

    const receipt = await this.prisma.receipt.create({
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

    try {
      const extractedData = this.simulateOCRExtraction();

      const updated = await this.prisma.receipt.update({
        where: { id: receiptId },
        data: {
          parsedData: extractedData,
          rawText: JSON.stringify(extractedData),
          status: 'parsed',
          confidence: Math.round(Math.random() * 30 + 70),
        },
      });

      return this.formatReceiptRecord(updated);
    } catch (error) {
      await this.prisma.receipt.update({
        where: { id: receiptId },
        data: {
          status: 'error',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw new BadRequestException(
        `Receipt processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async listReceipts(
    userId: string,
    filters?: {
      status?: 'pending' | 'parsed' | 'reviewed' | 'error';
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ receipts: ReceiptRecord[]; total: number }> {
    const where: any = { userId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters?.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters?.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

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

  async getReceiptById(receiptId: string, userId: string): Promise<ReceiptRecord> {
    const receipt = await this.prisma.receipt.findUnique({
      where: { id: receiptId },
    });

    if (!receipt || receipt.userId !== userId) {
      throw new NotFoundException('Receipt not found');
    }

    return this.formatReceiptRecord(receipt);
  }

  async deleteReceipt(receiptId: string, userId: string): Promise<void> {
    const receipt = await this.getReceiptById(receiptId, userId);
    await this.prisma.receipt.delete({
      where: { id: receiptId },
    });
  }

  async getReceiptStats(userId: string): Promise<Record<string, any>> {
    const receipts = await this.prisma.receipt.findMany({
      where: { userId },
    });

    const stats = {
      totalCount: receipts.length,
      byStatus: {
        pending: receipts.filter((r) => r.status === 'pending').length,
        parsed: receipts.filter((r) => r.status === 'parsed').length,
        reviewed: receipts.filter((r) => r.status === 'reviewed').length,
        error: receipts.filter((r) => r.status === 'error').length,
      },
      totalSpent: receipts.reduce((sum, r) => {
        if (r.parsedData && typeof r.parsedData === 'object' && 'total' in r.parsedData) {
          return sum + ((r.parsedData as any).total || 0);
        }
        return sum;
      }, 0),
      averageConfidence:
        receipts.filter((r) => r.confidence !== null).length > 0
          ? receipts.reduce((sum, r) => sum + (r.confidence || 0), 0) /
            receipts.filter((r) => r.confidence !== null).length
          : 0,
    };

    return stats;
  }

  async updateReceiptStatus(
    receiptId: string,
    userId: string,
    status: 'pending' | 'parsed' | 'reviewed' | 'error'
  ): Promise<ReceiptRecord> {
    const receipt = await this.getReceiptById(receiptId, userId);

    const updated = await this.prisma.receipt.update({
      where: { id: receiptId },
      data: { status },
    });

    return this.formatReceiptRecord(updated);
  }

  private simulateOCRExtraction(): ExtractedData {
    const merchants = [
      'Whole Foods Market',
      "Trader Joe's",
      'Safeway',
      'Target',
      'Walmart',
      'CVS Pharmacy',
      'Walgreens',
    ];

    const merchant = merchants[Math.floor(Math.random() * merchants.length)];
    const itemCount = Math.floor(Math.random() * 8) + 2;
    const subtotal = Math.round((Math.random() * 150 + 15) * 100) / 100;
    const tax = Math.round(subtotal * 0.0825 * 100) / 100;
    const total = subtotal + tax;

    const items: ExtractedData[] = [];
    for (let i = 0; i < itemCount; i++) {
      items.push({
        description: `Item ${i + 1}`,
        quantity: Math.floor(Math.random() * 4) + 1,
        price: Math.round((Math.random() * 50 + 2) * 100) / 100,
      });
    }

    return {
      merchant,
      date: new Date().toISOString().split('T')[0],
      time: `${Math.floor(Math.random() * 23)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      items,
      subtotal,
      tax,
      total,
      paymentMethod: ['Credit Card', 'Debit Card', 'Cash'][Math.floor(Math.random() * 3)],
      transactionId: `TXN-${Date.now()}`,
    };
  }

  private formatReceiptRecord(receipt: any): ReceiptRecord {
    return {
      id: receipt.id,
      userId: receipt.userId,
      fileName: receipt.fileName,
      filePath: receipt.filePath,
      mimeType: receipt.mimeType,
      fileSize: receipt.fileSize,
      rawText: receipt.rawText,
      parsedData: receipt.parsedData,
      confidence: receipt.confidence,
      status: receipt.status,
      errorMessage: receipt.errorMessage,
      createdAt: receipt.createdAt,
      updatedAt: receipt.updatedAt,
    };
  }
}
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

interface ReceiptUploadData {
  userId: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
}

interface ExtractedData {
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
  constructor(private prisma: PrismaService) {}

  /**
   * Upload a receipt file
   */
  async uploadReceipt(uploadData: ReceiptUploadData): Promise<ReceiptRecord> {
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
        status: 'pending',
      },
    });

    return this.formatReceiptRecord(receipt);
  }

  /**
   * Extract data from receipt (simulated OCR)
   */
  async extractReceiptData(receiptId: string, userId: string): Promise<ReceiptRecord> {
    const receipt = await this.getReceiptById(receiptId, userId);

    try {
      // Simulate OCR extraction
      const extractedData = this.simulateOCRExtraction();

      // Update receipt with extracted data
      const updated = await this.prisma.receipt.update({
        where: { id: receiptId },
        data: {
          parsedData: extractedData,
          rawText: JSON.stringify(extractedData),
          status: 'parsed',
          confidence: Math.round(Math.random() * 30 + 70), // 70-100% confidence
        },
      });

      return this.formatReceiptRecord(updated);
    } catch (error) {
      // Mark as error
      await this.prisma.receipt.update({
        where: { id: receiptId },
        data: {
          status: 'error',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw new BadRequestException(
        `Receipt processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * List receipts for user
   */
  async listReceipts(
    userId: string,
    filters?: {
      status?: 'pending' | 'parsed' | 'reviewed' | 'error';
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ receipts: ReceiptRecord[]; total: number }> {
    const where: any = { userId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters?.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters?.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

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

    // Delete database record
    await this.prisma.receipt.delete({
      where: { id: receiptId },
    });
  }

  /**
   * Get receipt statistics
   */
  async getReceiptStats(userId: string): Promise<Record<string, any>> {
    const receipts = await this.prisma.receipt.findMany({
      where: { userId },
    });

    const stats = {
      totalCount: receipts.length,
      byStatus: {
        pending: receipts.filter((r) => r.status === 'pending').length,
        parsed: receipts.filter((r) => r.status === 'parsed').length,
        reviewed: receipts.filter((r) => r.status === 'reviewed').length,
        error: receipts.filter((r) => r.status === 'error').length,
      },
      totalSpent: receipts.reduce((sum, r) => {
        if (r.parsedData && typeof r.parsedData === 'object' && 'total' in r.parsedData) {
          return sum + ((r.parsedData as any).total || 0);
        }
        return sum;
      }, 0),
      averageConfidence:
        receipts.filter((r) => r.confidence !== null).length > 0
          ? receipts.reduce((sum, r) => sum + (r.confidence || 0), 0) /
            receipts.filter((r) => r.confidence !== null).length
          : 0,
    };

    return stats;
  }

  /**
   * Update receipt status
   */
  async updateReceiptStatus(
    receiptId: string,
    userId: string,
    status: 'pending' | 'parsed' | 'reviewed' | 'error'
  ): Promise<ReceiptRecord> {
    const receipt = await this.getReceiptById(receiptId, userId);

    const updated = await this.prisma.receipt.update({
      where: { id: receiptId },
      data: { status },
    });

    return this.formatReceiptRecord(updated);
  }

  /**
   * Simulate OCR extraction with realistic data
   */
  private simulateOCRExtraction(): ExtractedData {
    const merchants = [
      'Whole Foods Market',
      "Trader Joe's",
      'Safeway',
      'Target',
      'Walmart',
      'CVS Pharmacy',
      'Walgreens',
      'Costco',
      'Sprouts Farmers Market',
    ];

    const merchant = merchants[Math.floor(Math.random() * merchants.length)];
    const itemCount = Math.floor(Math.random() * 8) + 2;
    const subtotal = Math.round((Math.random() * 150 + 15) * 100) / 100;
    const tax = Math.round(subtotal * 0.0825 * 100) / 100;
    const total = subtotal + tax;

    const items: Record<string, any>[] = [];
    for (let i = 0; i < itemCount; i++) {
      items.push({
        description: `Item ${i + 1}`,
        quantity: Math.floor(Math.random() * 4) + 1,
        price: Math.round((Math.random() * 50 + 2) * 100) / 100,
      });
    }

    return {
      merchant,
      date: new Date().toISOString().split('T')[0],
      time: `${Math.floor(Math.random() * 23)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      items,
      subtotal,
      tax,
      total,
      paymentMethod: ['Credit Card', 'Debit Card', 'Cash'][Math.floor(Math.random() * 3)],
      transactionId: `TXN-${Date.now()}`,
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
      rawText: receipt.rawText,
      parsedData: receipt.parsedData,
      confidence: receipt.confidence,
      status: receipt.status,
      errorMessage: receipt.errorMessage,
      createdAt: receipt.createdAt,
      updatedAt: receipt.updatedAt,
    };
  }
}
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
  merchant?: string;
  date?: string;
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
  rawText?: string;
  parsedData: ExtractedData;
  confidence: number;
  status: 'pending' | 'parsed' | 'reviewed' | 'error';
  errorMessage?: string;
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
        parsedData: {},
        status: 'pending',
        confidence: 0,
      },
    });

    return this.formatReceiptRecord(receipt);
  }

  /**
   * Extract data from receipt (simulated OCR)
   */
  async extractReceiptData(receiptId: string, userId: string): Promise<ExtractedData> {
    const receipt = await this.getReceiptById(receiptId, userId);

    if (receipt.status !== 'pending') {
      return receipt.parsedData as ExtractedData;
    }

    try {
      // Simulate OCR extraction
      const extractedData = await this.simulateOCRExtraction(receipt.filePath);

      // Update receipt with extracted data
      await this.prisma.receipt.update({
        where: { id: receiptId },
        data: {
          parsedData: extractedData,
          status: 'parsed',
          confidence: 0.85, // Simulated confidence score
        },
      });

      return extractedData;
    } catch (error) {
      // Mark as error
      await this.prisma.receipt.update({
        where: { id: receiptId },
        data: {
          status: 'error',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
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
      status?: 'pending' | 'parsed' | 'reviewed' | 'error';
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ receipts: ReceiptRecord[]; total: number }> {
    const where = {
      userId,
      ...(filters?.status && { status: filters.status }),
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
    parsed: number;
    error: number;
    averageExtractedAmount: number;
    totalExtractedAmount: number;
  }> {
    const receipts = await this.prisma.receipt.findMany({
      where: { userId },
    });

    const stats = {
      total: receipts.length,
      pending: receipts.filter((r) => r.status === 'pending').length,
      parsed: receipts.filter((r) => r.status === 'parsed').length,
      error: receipts.filter((r) => r.status === 'error').length,
      averageExtractedAmount: 0,
      totalExtractedAmount: 0,
    };

    // Calculate totals from extracted data
    const parsedReceipts = receipts.filter((r) => r.status === 'parsed');
    if (parsedReceipts.length > 0) {
      const amounts = parsedReceipts
        .map((r) => {
          const data = r.parsedData as ExtractedData;
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
   * Update receipt status
   */
  async updateReceiptStatus(
    receiptId: string,
    userId: string,
    status: 'pending' | 'parsed' | 'reviewed' | 'error'
  ): Promise<ReceiptRecord> {
    const receipt = await this.getReceiptById(receiptId, userId);

    const updated = await this.prisma.receipt.update({
      where: { id: receiptId },
      data: { status },
    });

    return this.formatReceiptRecord(updated);
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
    const merchants = ['Whole Foods', 'Trader Joe\'s', 'Safeway', 'Target', 'Walmart', 'CVS', 'Walgreens'];
    const merchant = merchants[Math.floor(Math.random() * merchants.length)];
    
    const amount = Math.round((Math.random() * 150 + 10) * 100) / 100;
    
    const items = Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, i) => ({
      description: `Item ${i + 1}`,
      price: Math.round((amount / (i + 2)) * 100) / 100,
      quantity: Math.floor(Math.random() * 3) + 1,
    }));

    return {
      merchant,
      date: new Date().toISOString(),
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
      rawText: receipt.rawText || undefined,
      parsedData: (receipt.parsedData || {}) as ExtractedData,
      confidence: receipt.confidence || 0,
      status: receipt.status,
      errorMessage: receipt.errorMessage || undefined,
      createdAt: receipt.createdAt,
      updatedAt: receipt.updatedAt,
    };
  }
}

