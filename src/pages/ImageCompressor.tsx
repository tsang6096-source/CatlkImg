import { Download, RefreshCw, Settings2, Sparkles } from 'lucide-react';
import { useCallback, useState } from 'react';
import ImagePreviewCard from '@/components/ImagePreviewCard';
import ImageUploadZone from '@/components/ImageUploadZone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import type { ImageFormat, ProcessedImage } from '@/types/image';
import { SUPPORTED_FORMATS } from '@/types/image';
import {
  calculateCompressionRatio,
  compressAndConvertImage,
  downloadMultipleFiles,
} from '@/utils/imageProcessor';

// 单次处理图片数量限制
const MAX_IMAGES_PER_BATCH = 20;

export default function ImageCompressor() {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [targetFormat, setTargetFormat] = useState<ImageFormat | 'original'>('original');
  const [quality, setQuality] = useState<number>(92);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // 处理文件选择
  const handleFilesSelected = useCallback((files: File[]) => {
    // 检查数量限制
    if (images.length + files.length > MAX_IMAGES_PER_BATCH) {
      toast({
        title: '图片数量超限',
        description: `为保证处理质量，单次最多处理 ${MAX_IMAGES_PER_BATCH} 张图片。当前已有 ${images.length} 张，最多还能添加 ${MAX_IMAGES_PER_BATCH - images.length} 张。`,
        variant: 'destructive',
      });
      return;
    }

    const newImages: ProcessedImage[] = files.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      name: file.name,
      originalFile: file,
      originalSize: file.size,
      originalFormat: file.type,
      previewUrl: URL.createObjectURL(file),
      status: 'pending' as const,
    }));

    setImages((prev) => [...prev, ...newImages]);
  }, [images.length, toast]);

  // 处理单个图片
  const processImage = async (image: ProcessedImage): Promise<ProcessedImage> => {
    try {
      const format = targetFormat === 'original' ? undefined : targetFormat;
      const processedBlob = await compressAndConvertImage(
        image.originalFile,
        format,
        quality / 100
      );

      const processedPreviewUrl = URL.createObjectURL(processedBlob);
      const compressionRatio = calculateCompressionRatio(image.originalSize, processedBlob.size);

      return {
        ...image,
        processedBlob,
        processedSize: processedBlob.size,
        processedFormat: format || image.originalFormat,
        processedPreviewUrl,
        compressionRatio,
        status: 'completed',
      };
    } catch (error) {
      console.error('处理图片失败:', error);
      return {
        ...image,
        status: 'error',
        error: error instanceof Error ? error.message : '处理失败',
      };
    }
  };

  // 处理未处理的图片
  const handleProcessPending = async () => {
    const pendingImages = images.filter((img) => img.status === 'pending');
    
    if (pendingImages.length === 0) {
      toast({
        title: '没有待处理的图片',
        description: '所有图片都已处理完成',
      });
      return;
    }

    setIsProcessing(true);

    // 标记待处理图片为处理中
    setImages((prev) =>
      prev.map((img) => 
        img.status === 'pending' 
          ? { ...img, status: 'processing' as const }
          : img
      )
    );

    try {
      // 处理待处理的图片
      const processedResults = await Promise.all(
        pendingImages.map((image) => processImage(image))
      );

      // 更新图片列表
      setImages((prev) =>
        prev.map((img) => {
          const processed = processedResults.find((p) => p.id === img.id);
          return processed || img;
        })
      );

      const successCount = processedResults.filter((img) => img.status === 'completed').length;
      const failCount = processedResults.filter((img) => img.status === 'error').length;

      toast({
        title: '处理完成',
        description: `成功处理 ${successCount} 张图片${failCount > 0 ? `，失败 ${failCount} 张` : ''}`,
      });
    } catch (error) {
      toast({
        title: '处理失败',
        description: '图片处理过程中出现错误，请重试',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 重新处理所有图片（按新的设置）
  const handleReprocessAll = async () => {
    if (images.length === 0) {
      toast({
        title: '请先上传图片',
        description: '请选择要处理的图片文件',
      });
      return;
    }

    setIsProcessing(true);

    // 标记所有图片为处理中，清除之前的处理结果
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        status: 'processing' as const,
        processedBlob: undefined,
        processedSize: undefined,
        processedFormat: undefined,
        processedPreviewUrl: img.processedPreviewUrl ? (() => {
          URL.revokeObjectURL(img.processedPreviewUrl);
          return undefined;
        })() : undefined,
        compressionRatio: undefined,
        error: undefined,
      }))
    );

    try {
      // 批量处理图片
      const processedImages = await Promise.all(
        images.map((image) => processImage(image))
      );

      setImages(processedImages);

      const successCount = processedImages.filter((img) => img.status === 'completed').length;
      const failCount = processedImages.filter((img) => img.status === 'error').length;

      toast({
        title: '重新处理完成',
        description: `成功处理 ${successCount} 张图片${failCount > 0 ? `，失败 ${failCount} 张` : ''}`,
      });
    } catch (error) {
      toast({
        title: '处理失败',
        description: '图片处理过程中出现错误，请重试',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 下载所有已处理的图片
  const handleDownloadAll = async () => {
    const completedImages = images.filter((img) => img.status === 'completed');
    if (completedImages.length === 0) {
      toast({
        title: '没有可下载的图片',
        description: '请先处理图片',
      });
      return;
    }

    try {
      await downloadMultipleFiles(completedImages);
      toast({
        title: '下载完成',
        description: `已下载 ${completedImages.length} 张图片`,
      });
    } catch (error) {
      toast({
        title: '下载失败',
        description: '部分图片下载失败，请重试',
        variant: 'destructive',
      });
    }
  };

  // 移除图片
  const handleRemoveImage = useCallback((id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.previewUrl);
        if (image.processedPreviewUrl) {
          URL.revokeObjectURL(image.processedPreviewUrl);
        }
      }
      return prev.filter((img) => img.id !== id);
    });
  }, []);

  // 清空所有图片
  const handleClearAll = useCallback(() => {
    images.forEach((image) => {
      URL.revokeObjectURL(image.previewUrl);
      if (image.processedPreviewUrl) {
        URL.revokeObjectURL(image.processedPreviewUrl);
      }
    });
    setImages([]);
  }, [images]);

  const completedCount = images.filter((img) => img.status === 'completed').length;

  return (
    <div className="min-h-screen bg-background">
      {/* 头部 */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">智能图片压缩转换器</h1>
              <p className="text-sm text-muted-foreground">
                快速压缩图片，支持格式转换，保持高质量
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* 左侧：设置面板 */}
          <div className="xl:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="w-5 h-5" />
                  处理设置
                </CardTitle>
                <CardDescription>配置压缩和转换参数</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 目标格式 */}
                <div className="space-y-2">
                  <Label htmlFor="format">目标格式</Label>
                  <Select
                    value={targetFormat}
                    onValueChange={(value) => setTargetFormat(value as ImageFormat | 'original')}
                  >
                    <SelectTrigger id="format">
                      <SelectValue placeholder="选择格式" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="original">保持原格式</SelectItem>
                      {SUPPORTED_FORMATS.map((format) => (
                        <SelectItem key={format.value} value={format.value}>
                          {format.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    选择转换后的图片格式
                  </p>
                </div>

                {/* 压缩质量 */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center gap-2">
                    <Label htmlFor="quality">压缩质量</Label>
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        value={quality}
                        onChange={(e) => {
                          const val = Number.parseInt(e.target.value);
                          if (!Number.isNaN(val) && val >= 1 && val <= 100) {
                            setQuality(val);
                          }
                        }}
                        className="w-16 h-8 text-center text-sm"
                      />
                      <span className="text-sm font-medium text-primary">%</span>
                    </div>
                  </div>
                  <Slider
                    id="quality"
                    min={1}
                    max={100}
                    step={1}
                    value={[quality]}
                    onValueChange={(value) => setQuality(value[0])}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    质量越高，文件越大（默认92%）
                  </p>
                </div>

                {/* 操作按钮 */}
                <div className="space-y-2 pt-4">
                  <Button
                    className="w-full"
                    onClick={handleProcessPending}
                    disabled={images.length === 0 || isProcessing}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {isProcessing ? '处理中...' : '开始处理'}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleReprocessAll}
                    disabled={images.length === 0 || isProcessing}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    重新生成
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleDownloadAll}
                    disabled={completedCount === 0}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    下载全部 ({completedCount})
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleClearAll}
                    disabled={images.length === 0}
                  >
                    清空列表
                  </Button>
                </div>

                {/* 统计信息 */}
                {images.length > 0 && (
                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">总图片数</span>
                      <span className="font-medium">{images.length} / {MAX_IMAGES_PER_BATCH}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">已完成</span>
                      <span className="font-medium text-primary">{completedCount}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 右侧：上传区域和图片列表 */}
          <div className="xl:col-span-3 space-y-6">
            {/* 上传区域 */}
            <ImageUploadZone
              onFilesSelected={handleFilesSelected}
              disabled={isProcessing}
            />

            {/* 图片列表 */}
            {images.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">
                  图片列表 ({images.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {images.map((image) => (
                    <ImagePreviewCard
                      key={image.id}
                      image={image}
                      onRemove={handleRemoveImage}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 空状态提示 */}
            {images.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="p-4 bg-muted rounded-full mb-4">
                    <Sparkles className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">开始使用</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-md">
                    上传图片后，配置压缩参数，点击"开始处理"即可快速压缩和转换图片格式
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="border-t mt-12 bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center gap-2">
            <p className="text-center text-sm text-muted-foreground">
              © 2025 智能图片压缩转换器 - 所有图片处理均在浏览器本地完成，保护您的隐私
            </p>
            <p className="text-center text-xs text-muted-foreground">
              版本 1.0.0 | 未经授权的商业使用和代码复制是被禁止的
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
