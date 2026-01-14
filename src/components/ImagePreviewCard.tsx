import { Download, FileImage, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { ProcessedImage } from '@/types/image';
import { FORMAT_EXTENSIONS } from '@/types/image';
import { changeFileExtension, downloadBlob, formatFileSize } from '@/utils/imageProcessor';

interface ImagePreviewCardProps {
  image: ProcessedImage;
  onRemove: (id: string) => void;
}

export default function ImagePreviewCard({ image, onRemove }: ImagePreviewCardProps) {
  const handleDownload = () => {
    if (image.processedBlob) {
      const extension = image.processedFormat ? FORMAT_EXTENSIONS[image.processedFormat as keyof typeof FORMAT_EXTENSIONS] : '';
      const filename = extension ? changeFileExtension(image.name, extension) : image.name;
      downloadBlob(image.processedBlob, filename);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* 图片预览区域 */}
          <div className="grid grid-cols-2 gap-2">
            {/* 原图 */}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground text-center">原图</p>
              <div className="aspect-square bg-muted rounded-md overflow-hidden flex items-center justify-center">
                <img
                  src={image.previewUrl}
                  alt={image.name}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* 处理后 */}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground text-center">处理后</p>
              <div className="aspect-square bg-muted rounded-md overflow-hidden flex items-center justify-center">
                {image.status === 'completed' && image.processedPreviewUrl ? (
                  <img
                    src={image.processedPreviewUrl}
                    alt={`${image.name} - 已处理`}
                    className="w-full h-full object-contain"
                  />
                ) : image.status === 'processing' ? (
                  <div className="flex flex-col items-center justify-center gap-2 p-4">
                    <FileImage className="w-8 h-8 text-muted-foreground animate-pulse" />
                    <p className="text-xs text-muted-foreground">处理中...</p>
                  </div>
                ) : image.status === 'error' ? (
                  <div className="flex flex-col items-center justify-center gap-2 p-4">
                    <FileImage className="w-8 h-8 text-destructive" />
                    <p className="text-xs text-destructive text-center">{image.error || '处理失败'}</p>
                  </div>
                ) : (
                  <FileImage className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
            </div>
          </div>

          {/* 文件信息 */}
          <div className="space-y-2">
            <p className="text-sm font-medium truncate" title={image.name}>
              {image.name}
            </p>

            {image.status === 'processing' && (
              <Progress value={50} className="h-1" />
            )}

            {image.status === 'completed' && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>原始大小</span>
                  <span className="font-medium">{formatFileSize(image.originalSize)}</span>
                </div>
                {image.processedSize && (
                  <>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>压缩后</span>
                      <span className="font-medium text-primary">{formatFileSize(image.processedSize)}</span>
                    </div>
                    {image.compressionRatio !== undefined && (
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">压缩率</span>
                        <span className="font-medium text-primary">
                          {image.compressionRatio > 0 ? `↓ ${image.compressionRatio}%` : '无变化'}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1"
              onClick={handleDownload}
              disabled={image.status !== 'completed'}
            >
              <Download className="w-4 h-4 mr-1" />
              下载
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onRemove(image.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
