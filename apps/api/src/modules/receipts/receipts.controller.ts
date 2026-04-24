import { Controller, Post, Get, Delete, Param, Patch, Query, HttpCode, HttpStatus, UseGuards } from "@nestjs/common";
import { ReceiptService, ReceiptRecord, ExtractedData } from "./receipts.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser, AuthenticatedUser } from "../auth/decorators/current-user.decorator";

@Controller("receipts")
@UseGuards(JwtAuthGuard)
export class ReceiptController {
  constructor(private readonly receiptService: ReceiptService) {}

  @Post(":id/extract")
  async extractReceipt(
    @Param("id") receiptId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ success: boolean; data: ReceiptRecord }> {
    const data = await this.receiptService.extractReceiptData(receiptId, user.id);
    return { success: true, data };
  }

  @Get()
  async listReceipts(
    @CurrentUser() user: AuthenticatedUser,
    @Query("status") status?: string,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
  ): Promise<any> {
    const result = await this.receiptService.listReceipts(user.id, {
      status: status as any,
      limit: limit ? parseInt(limit) : 10,
      offset: offset ? parseInt(offset) : 0,
    });
    return { success: true, data: result.receipts, pagination: { total: result.total } };
  }

  @Get(":id")
  async getReceipt(
    @Param("id") receiptId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ success: boolean; data: ReceiptRecord }> {
    const data = await this.receiptService.getReceiptById(receiptId, user.id);
    return { success: true, data };
  }

  @Patch(":id/status")
  async updateReceiptStatus(
    @Param("id") receiptId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query("status") status: string,
  ): Promise<{ success: boolean; data: ReceiptRecord }> {
    const data = await this.receiptService.updateReceiptStatus(receiptId, user.id, status as any);
    return { success: true, data };
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteReceipt(
    @Param("id") receiptId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.receiptService.deleteReceipt(receiptId, user.id);
  }

  @Get("stats/summary")
  async getReceiptStats(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ success: boolean; data: Record<string, any> }> {
    const data = await this.receiptService.getReceiptStats(user.id);
    return { success: true, data };
  }
}
