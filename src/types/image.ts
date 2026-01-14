// 图片处理相关类型定义

export type ImageFormat = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' | 'image/bmp';

export interface ProcessedImage {
  id: string;
  name: string;
  originalFile: File;
  originalSize: number;
  originalFormat: string;
  processedBlob?: Blob;
  processedSize?: number;
  processedFormat?: string;
  previewUrl: string;
  processedPreviewUrl?: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
  compressionRatio?: number;
}

export interface CompressionOptions {
  maxSizeMB: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  quality?: number;
  targetFormat?: ImageFormat;
}

export const SUPPORTED_FORMATS: { value: ImageFormat; label: string }[] = [
  { value: 'image/jpeg', label: 'JPG' },
  { value: 'image/png', label: 'PNG' },
  { value: 'image/webp', label: 'WebP' },
];

export const FORMAT_EXTENSIONS: Record<ImageFormat, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/bmp': '.bmp',
};
