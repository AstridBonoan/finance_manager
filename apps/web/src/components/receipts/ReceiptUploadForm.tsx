'use client';

import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';

export interface ReceiptUploadFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (file: File) => Promise<void>;
  isLoading?: boolean;
}

export function ReceiptUploadForm({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: ReceiptUploadFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validFileTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const validateFile = (file: File): string | null => {
    if (!validFileTypes.includes(file.type)) {
      return 'Invalid file type. Please upload JPG, PNG, WebP, or PDF files.';
    }
    if (file.size > maxFileSize) {
      return 'File size exceeds 10MB limit.';
    }
    return null;
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setSelectedFile(null);
      } else {
        setError(null);
        setSelectedFile(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setSelectedFile(null);
      } else {
        setError(null);
        setSelectedFile(file);
      }
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    try {
      setError(null);
      await onSubmit(selectedFile);
      handleRemoveFile();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Receipt</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.pdf"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Drag and Drop Zone */}
          {!selectedFile ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={handleClickUpload}
            >
              <Upload className="mx-auto mb-2 text-gray-400" size={32} />
              <p className="font-semibold text-gray-900">Drop your receipt here</p>
              <p className="text-sm text-gray-600 mt-1">or click to browse</p>
              <p className="text-xs text-gray-500 mt-2">
                Supported: JPG, PNG, WebP, PDF (Max 10MB)
              </p>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 break-words">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveFile}
                    className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                    title="Remove file"
                  >
                    <X size={20} />
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-semibold text-red-900">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Tip:</strong> Clear, well-lit photos work best for OCR processing.
              Make sure the receipt is fully visible and text is readable.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              handleRemoveFile();
              onOpenChange(false);
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedFile || isLoading}
          >
            {isLoading && <Loader className="mr-2 animate-spin" size={16} />}
            {isLoading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
