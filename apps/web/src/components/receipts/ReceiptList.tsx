'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader, Trash2, Download, Eye, Clock, CheckCircle, AlertCircle, HardDrive } from 'lucide-react';

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
  fileSize: number;
  mimeType: string;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  processingError?: string;
  extractedData?: ExtractedData;
  createdAt: string;
  updatedAt: string;
}

interface ReceiptListProps {
  receipts: Receipt[];
  isLoading?: boolean;
  onDelete?: (id: string) => Promise<void>;
  onView?: (receipt: Receipt) => void;
  onDownload?: (id: string) => Promise<void>;
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'pending':
      return <Clock className="text-gray-500" size={16} />;
    case 'processing':
      return <Loader className="text-blue-500 animate-spin" size={16} />;
    case 'completed':
      return <CheckCircle className="text-green-600" size={16} />;
    case 'failed':
      return <AlertCircle className="text-red-600" size={16} />;
    default:
      return null;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'pending':
      return 'bg-gray-100 text-gray-800';
    case 'processing':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function ReceiptList({
  receipts,
  isLoading = false,
  onDelete,
  onView,
  onDownload,
}: ReceiptListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this receipt? This action cannot be undone.')) {
      setDeletingId(id);
      try {
        await onDelete?.(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleDownload = async (id: string) => {
    setDownloadingId(id);
    try {
      await onDownload?.(id);
    } finally {
      setDownloadingId(null);
    }
  };

  if (receipts.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <HardDrive size={32} className="mx-auto text-gray-400 mb-2" />
          <p className="text-gray-600 font-semibold">No receipts uploaded</p>
          <p className="text-sm text-gray-500 mt-1">Upload a receipt to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Uploaded Receipts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {receipts.map((receipt) => (
            <div
              key={receipt.id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left: File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg flex-shrink-0">
                      {receipt.mimeType === 'application/pdf' ? '📄' : '🖼️'}
                    </span>
                    <h4 className="font-semibold text-gray-900 truncate">
                      {receipt.fileName}
                    </h4>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-600 flex-wrap">
                    <span>{formatFileSize(receipt.fileSize)}</span>
                    <span>•</span>
                    <span>{formatDate(receipt.createdAt)}</span>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2 mt-2">
                    {getStatusIcon(receipt.processingStatus)}
                    <Badge className={`${getStatusColor(receipt.processingStatus)} border-0`}>
                      {receipt.processingStatus.charAt(0).toUpperCase() + receipt.processingStatus.slice(1)}
                    </Badge>
                  </div>

                  {/* Extracted Data Preview */}
                  {receipt.processingStatus === 'completed' && receipt.extractedData && (
                    <div className="mt-3 p-2 bg-green-50 rounded border border-green-200">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {receipt.extractedData.vendor && (
                          <div>
                            <span className="text-gray-600">Vendor:</span>
                            <p className="font-semibold text-gray-900">{receipt.extractedData.vendor}</p>
                          </div>
                        )}
                        {receipt.extractedData.total && (
                          <div>
                            <span className="text-gray-600">Amount:</span>
                            <p className="font-semibold text-gray-900">${receipt.extractedData.total.toFixed(2)}</p>
                          </div>
                        )}
                        {receipt.extractedData.date && (
                          <div>
                            <span className="text-gray-600">Date:</span>
                            <p className="font-semibold text-gray-900">
                              {new Date(receipt.extractedData.date).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        {receipt.extractedData.paymentMethod && (
                          <div>
                            <span className="text-gray-600">Payment:</span>
                            <p className="font-semibold text-gray-900">
                              {receipt.extractedData.paymentMethod.replace(/_/g, ' ')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {receipt.processingStatus === 'failed' && receipt.processingError && (
                    <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
                      <p className="text-xs text-red-700">{receipt.processingError}</p>
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  {receipt.processingStatus === 'completed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onView?.(receipt)}
                      disabled={isLoading || deletingId === receipt.id}
                    >
                      <Eye size={16} className="mr-1" />
                      View
                    </Button>
                  )}

                  {receipt.mimeType !== 'application/pdf' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(receipt.id)}
                      disabled={isLoading || downloadingId === receipt.id || deletingId === receipt.id}
                    >
                      {downloadingId === receipt.id ? (
                        <Loader size={16} className="mr-1 animate-spin" />
                      ) : (
                        <Download size={16} className="mr-1" />
                      )}
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(receipt.id)}
                    disabled={isLoading || deletingId === receipt.id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {deletingId === receipt.id ? (
                      <Loader size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
