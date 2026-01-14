import imageCompression from 'browser-image-compression';
import type { CompressionOptions, ImageFormat, ProcessedImage } from '@/types/image';

/**
 * 压缩并转换图片格式
 */
export async function compressAndConvertImage(
  file: File,
  targetFormat?: ImageFormat,
  quality: number = 0.8
): Promise<Blob> {
  const options = {
    maxSizeMB: 10,
    maxWidthOrHeight: 4096,
    useWebWorker: true,
    fileType: targetFormat || file.type,
    initialQuality: quality,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    
    // 如果需要转换格式
    if (targetFormat && targetFormat !== file.type) {
      return await convertImageFormat(compressedFile, targetFormat, quality);
    }
    
    return compressedFile;
  } catch (error) {
    console.error('图片压缩失败:', error);
    throw new Error('图片压缩失败，请重试');
  }
}

/**
 * 转换图片格式
 */
export async function convertImageFormat(
  file: File | Blob,
  targetFormat: ImageFormat,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('无法创建画布上下文'));
        return;
      }

      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('图片转换失败'));
          }
        },
        targetFormat,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('图片加载失败'));
    };

    img.src = url;
  });
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * 计算压缩比例
 */
export function calculateCompressionRatio(originalSize: number, compressedSize: number): number {
  if (originalSize === 0) return 0;
  return Math.round(((originalSize - compressedSize) / originalSize) * 100);
}

/**
 * 获取文件扩展名
 */
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot !== -1 ? filename.substring(lastDot) : '';
}

/**
 * 更改文件扩展名
 */
export function changeFileExtension(filename: string, newExtension: string): string {
  const lastDot = filename.lastIndexOf('.');
  const nameWithoutExt = lastDot !== -1 ? filename.substring(0, lastDot) : filename;
  return `${nameWithoutExt}${newExtension}`;
}

/**
 * 下载文件
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 批量下载文件
 */
export async function downloadMultipleFiles(images: ProcessedImage[]): Promise<void> {
  for (const image of images) {
    if (image.processedBlob && image.status === 'completed') {
      const filename = image.processedFormat
        ? changeFileExtension(image.name, getFormatExtension(image.processedFormat))
        : image.name;
      downloadBlob(image.processedBlob, filename);
      // 添加延迟避免浏览器阻止多个下载
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}

/**
 * 根据MIME类型获取文件扩展名
 */
function getFormatExtension(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/bmp': '.bmp',
  };
  return map[mimeType] || '.jpg';
}

/**
 * 验证文件是否为支持的图片格式
 */
export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];
  return validTypes.includes(file.type);
}
