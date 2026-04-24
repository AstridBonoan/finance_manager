'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';


interface ExtractedData {
  vendor?: string;
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

interface Receipt {
  id: string;
  fileName: string;
  extractedData?: ExtractedData;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
}

interface ReceiptDetailProps {
  receipt: Receipt | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTransaction?: (data: {
    vendor?: string;
    amount: number;
    date: Date;
    category?: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

function formatDate(dateString?: string): string {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
}

export function ReceiptDetail({
  receipt,
  open,
  onOpenChange,
  onCreateTransaction,
  isLoading = false,
}: ReceiptDetailProps) {
  if (!receipt) return null;

  const extractedData = receipt.extractedData as ExtractedData | undefined;
  const hasItems = extractedData?.items && extractedData.items.length > 0;

  const handleCreateTransaction = async () => {
    if (extractedData?.total && onCreateTransaction) {
      await onCreateTransaction({
        vendor: extractedData.vendor,
        amount: extractedData.total,
        date: extractedData.date ? new Date(extractedData.date) : new Date(),
        category: 'shopping',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Receipt Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Vendor</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {extractedData?.vendor || 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Total Amount</p>
                  <p className="text-lg font-semibold text-green-600 mt-1">
                    {extractedData?.total ? `$${extractedData.total.toFixed(2)}` : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Date</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {formatDate(extractedData?.date)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Payment Method</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {extractedData?.paymentMethod
                      ? extractedData.paymentMethod.replace(/_/g, ' ').toUpperCase()
                      : 'N/A'}
                  </p>
                </div>
              </div>

              {extractedData?.receiptNumber && (
                <>
                  <Separator className="my-4" />
                  <p className="text-sm text-gray-600">
                    Receipt #: <span className="font-mono font-semibold">{extractedData.receiptNumber}</span>
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Items */}
          {hasItems && extractedData.items && extractedData.items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {extractedData.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.description}</p>
                        {item.quantity && (
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        )}
                      </div>
                      <p className="font-semibold text-gray-900 text-right">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900">Total</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${extractedData.items.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* File Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">File Name</span>
                  <span className="font-mono text-gray-900 break-all">{receipt.fileName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Uploaded</span>
                  <span className="text-gray-900">{formatDate(receipt.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <Badge
                    className={`${
                      receipt.processingStatus === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    } border-0`}
                  >
                    {receipt.processingStatus.charAt(0).toUpperCase() +
                      receipt.processingStatus.slice(1)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info Message */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> The extracted data above was processed using OCR.
              Please review for accuracy before creating a transaction.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Close
          </Button>
          {extractedData?.total && (
            <Button
              onClick={handleCreateTransaction}
              disabled={isLoading}
            >
              <Plus size={16} className="mr-2" />
              Create Transaction
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
