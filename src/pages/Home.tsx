import { Download, RefreshCw, Settings2, Sparkles } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import FAQ from '@/components/FAQ';
import Features from '@/components/Features';
import ImagePreviewCard from '@/components/ImagePreviewCard';
import ImageUploadZone from '@/components/ImageUploadZone';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import SEO from '@/components/SEO';
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

export default function Home() {
  const { t } = useTranslation();
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [targetFormat, setTargetFormat] = useState<ImageFormat | 'original'>('original');
  const [quality, setQuality] = useState<number>(92);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // 处理文件选择
  const handleFilesSelected = useCallback(
    (files: File[]) => {
      // 检查数量限制
      if (images.length + files.length > MAX_IMAGES_PER_BATCH) {
        toast({
          title: t('toast.limitExceeded'),
          description: t('toast.limitExceededDesc', {
            max: MAX_IMAGES_PER_BATCH,
            current: images.length,
            remaining: MAX_IMAGES_PER_BATCH - images.length,
          }),
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
    },
    [images.length, toast, t]
  );

  // 处理单个图片
  const processImage = async (image: ProcessedImage): Promise<ProcessedImage> => {
    try {
      const format = targetFormat === 'original' ? undefined : targetFormat;
      const processedBlob = await compressAndConvertImage(image.originalFile, format, quality / 100);

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
        title: t('toast.noPendingImages'),
        description: t('toast.noPendingImagesDesc'),
      });
      return;
    }

    setIsProcessing(true);

    // 标记待处理图片为处理中
    setImages((prev) =>
      prev.map((img) => (img.status === 'pending' ? { ...img, status: 'processing' as const } : img))
    );

    try {
      // 处理待处理的图片
      const processedResults = await Promise.all(pendingImages.map((image) => processImage(image)));

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
        title: t('toast.processSuccess', { count: successCount }),
        description: failCount > 0 ? `${failCount} failed` : undefined,
      });
    } catch (error) {
      toast({
        title: t('toast.processError'),
        description: t('toast.processError'),
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
        title: t('toast.pleaseUpload'),
        description: t('toast.pleaseUploadDesc'),
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
        processedPreviewUrl: img.processedPreviewUrl
          ? (() => {
              URL.revokeObjectURL(img.processedPreviewUrl);
              return undefined;
            })()
          : undefined,
        compressionRatio: undefined,
        error: undefined,
      }))
    );

    try {
      // 批量处理图片
      const processedImages = await Promise.all(images.map((image) => processImage(image)));

      setImages(processedImages);

      const successCount = processedImages.filter((img) => img.status === 'completed').length;
      const failCount = processedImages.filter((img) => img.status === 'error').length;

      toast({
        title: t('toast.reprocessComplete'),
        description: t('toast.reprocessSuccess', { count: successCount }) + (failCount > 0 ? `, ${failCount} failed` : ''),
      });
    } catch (error) {
      toast({
        title: t('toast.processError'),
        description: t('toast.processError'),
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
        title: t('toast.noCompletedImages'),
        description: t('toast.noCompletedImagesDesc'),
      });
      return;
    }

    try {
      await downloadMultipleFiles(completedImages);
      toast({
        title: t('toast.downloadSuccess'),
        description: `${completedImages.length} images`,
      });
    } catch (error) {
      toast({
        title: t('toast.downloadError'),
        description: error instanceof Error ? error.message : t('toast.downloadError'),
        variant: 'destructive',
      });
    }
  };

  // 删除单个图片
  const handleDeleteImage = useCallback((id: string) => {
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
    <>
      <SEO />
      <div className="min-h-screen bg-background">
        {/* 头部 */}
        <header className="border-b bg-card sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#ffffff] bg-none" data-href="/">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    version="1.0"
                    viewBox="0 0 1536 576"
                    preserveAspectRatio="xMidYMid meet"
                    width="160px"
                    height="60px"
                    key="441e7468-c192-4945-8c18-d24361672879"
                    className="text-primary"
                  >
                    <path d="M108.5 33c-.8 1.3-9.9 41.9-12.3 55-9.9 53.2-12.3 118.6-6.2 168.5.6 4.4 2.2 14.6 3.7 22.7l2.6 14.7-2.6 5.8c-13 29.3-18 62.7-14.3 97.3 4.6 42.9 20.3 75.7 51 106.2 25.4 25.2 59.4 41 98.8 45.8 14.5 1.8 43.6.8 57.3-1.9 23.3-4.7 45.5-14 60.3-25.2 7.6-5.7 17.8-15.4 19.4-18.3 1.3-2.3 2.4-18.6 1.3-18.6-.4 0-4.7 3.7-9.4 8.3-23.1 22.1-48.3 35.6-77.6 41.3-13.8 2.7-39.8 2.5-53.3-.4-25.5-5.5-43.6-15.5-62.7-34.7-22.7-22.8-37.4-53.3-43.2-89.5-2.5-16.1-2.5-57.4 0-70.5 7.2-37.1 18.9-61.5 40.8-84.8 26.1-27.8 56-40.7 94.8-40.7 36.5 0 66.2 11.6 95 37 8.6 7.7 9.4 8.2 10.5 6.4 1.9-3.2 2.4-5.7 2.5-11.7.1-6.8-.5-8-10.9-19.7-3.6-4.1-8.8-10.2-11.5-13.5C285.5 143.9 207 81.8 123 38.9c-13.2-6.7-13.8-7-14.5-5.9m31.2 50.6c11.2 6.7 42.8 27.7 53.5 35.6 17.9 13.3 45.9 37.8 67.3 59 12.6 12.5 22.7 23 22.4 23.3-.4.3-6.2 0-13-.6-9.5-.9-15.4-.9-26 0-16.3 1.4-39.4 5.9-46.4 9-1.1.5-4.2 1.7-7 2.6-17.3 6.1-38.9 19.1-54.5 32.9-6.9 6.1-8.6 7.1-9.2 5.8-1.6-3.9-5.1-45.3-5.6-65.6-.5-24.8.8-49.5 4.3-79.6 2.7-22.4 3.3-27.4 3.4-27.8.3-.7 2.3.3 10.8 5.4M1394 33.4c-1.4.8-11.9 6.5-23.5 12.7-46.2 24.7-86.6 52.5-130 89.4-12.7 10.9-42.9 40.4-60.8 59.4l-10.7 11.4V546h36.5l-.2-84.8c-.2-46.6 0-85.7.2-87 .6-2.7 4-3 7.4-.6 2.3 1.7 33.8 33.5 49.7 50.4 4.9 5.2 13.2 14 18.4 19.5 17.8 18.6 25.6 27 32 34 10.7 11.7 37.7 40.2 52 54.7l13.4 13.8h50.3l-21.6-21.8c-25.6-25.7-32.7-33.1-87.7-90.7-48.4-50.8-73.7-76.5-75.3-76.5-2.5 0-.8-3 3.6-6.6 5.6-4.6 12.8-11 23.8-21.4 4.4-4.2 10.7-10 14-13 5.6-4.9 13.2-11.9 44-40.5 6.6-6.1 16.5-15.2 22-20.2s14.5-13.4 20-18.6c5.5-5.3 10.1-9.4 10.3-9.2.2.1-.6 4.2-1.7 9-3.3 13.8-4.5 10.3 14.9 43.5 5.3 9.1 9.9 17.3 10.3 18.2.9 2.5 2.7 2.2 2.7-.4 0-1.2.7-4.7 1.5-7.7 2.7-10.7 5.5-27.7 7.7-47.6 3.1-29 3.2-79.4 0-108-2.6-23.3-3.5-29.5-6.8-46.5-5.9-30.6-11.7-55.3-12.9-55.7-.6-.1-2.1.4-3.5 1.1m-14 64c2.1 16.2 3.1 24.3 4 34.1 1.1 11.5 1.3 61.3.3 70.1l-.6 5.9-9.9 9c-5.4 4.9-13.6 12.4-18.2 16.5s-14.6 13.3-22.3 20.5c-24 22.4-49.4 45.8-59.8 54.9-5.5 4.9-13.4 12.1-17.6 16-29.9 28.2-47.6 43.6-50 43.6-.5 0-.9-30.8-.9-73.9v-74l31.3-31.3c17.1-17.3 36.5-35.9 43.1-41.4 33.9-28.3 44.2-36.1 76.6-57.5l20.5-13.5 1.2 6.4c.7 3.6 1.7 10.1 2.3 14.6M499.2 204.7c.2.5 3.8 7.8 8.1 16.3 4.2 8.5 7.7 16.2 7.7 17.1 0 2.1-3.3 10.1-9.2 22.2-2.6 5.4-4.8 10-4.8 10.3s-.7 2.2-1.6 4.2c-.9 2.1-2.4 5.5-3.4 7.7s-2.4 5.6-3.3 7.5c-3.5 8.2-23.7 56.9-23.7 57.4 0 .2-1.6 3.9-3.5 8-1.9 4.2-5.1 11.7-7.1 16.8s-4.4 11.1-5.4 13.3-3.9 8.9-6.4 15c-2.6 6-5.1 11.9-5.5 13-.5 1.1-2.4 5.6-4.1 10-3.1 7.7-5.6 13.5-8.6 20-.7 1.6-3.6 8.6-6.3 15.5-7.4 18.7-14.9 36.8-17.6 42.8-1.4 2.9-2.5 5.8-2.5 6.5s-.4 1.7-.8 2.3c-.5.5-1.9 3.4-3.2 6.4-2.6 6.3-6.5 15-10.4 22.9-1.4 3-2.6 5.6-2.6 5.8s4 .3 8.9.3h8.9l3.5-8.8c2-4.8 6.6-15.9 10.2-24.7 3.7-8.8 7.3-17.7 8-19.8.8-2 2.2-5.4 3.1-7.5 2.2-5 7.9-18.9 15.8-37.9l2.1-5.3 68.8-.2c37.8-.1 72.1-.3 76.3-.3h7.5l5.8 14.5c3.2 8 6.5 16.1 7.4 18 .8 1.9 3.2 7.5 5.2 12.5 2 4.9 4.3 10.3 5 12 .8 1.6 3.2 7.3 5.3 12.5s6.3 15.2 9.3 22.2l5.4 12.7 19.3.3c10.7.2 19.5.2 19.7 0 .1-.1-1.6-4.4-3.8-9.5-5.2-11.9-14.7-34.9-25.3-61.2-4.7-11.6-9.1-22.4-9.9-24-.7-1.7-4.3-10.2-7.8-19-7-17.2-14.8-36-24.7-60-3.4-8.3-9.1-22-12.5-30.5s-6.7-16.6-7.3-18-3.4-8.4-6.2-15.5c-2.8-7.2-5.8-14.4-6.5-16-.8-1.7-4.9-11.6-9.1-22-10.4-25.9-10.3-25.5-19.3-47l-7.9-19-20.7-.3c-11.4-.1-20.5.1-20.3.5m23.8 51.5c0 1.5 3 8.9 19.6 49 6.8 16.3 16 38.8 20.5 50 4.4 11.1 8.7 21.6 9.4 23.3.8 1.6 2.6 5.9 4 9.5 9.1 22.4 11.9 28.8 14 33.1 1.4 2.7 2.5 5.1 2.5 5.4 0 .9-139.9.5-140.5-.5-.3-.5.6-3.3 1.9-6.2 1.4-2.9 6.6-15.4 11.7-27.8 5-12.4 12.3-30.2 16.1-39.5 3.9-9.4 8.1-19.7 9.3-23 1.3-3.3 3.5-8.7 4.9-12 3.7-8.4 3.8-8.7 9-21 6.3-15.2 15.6-39.4 15.6-40.5 0-.6.5-1 1-1 .6 0 1 .6 1 1.2m109.2-46.1c-.5 11.2-7.1 10.1 56.9 9.7l55.9-.3V546h36V219.9l57 .1h57v-16H632.5zm300.2-3.9c.3 1.3.6 78.2.6 171.1V546l99.3-.2 99.2-.3.3-8.3c.2-4.9-.1-8.1-.6-7.8s-37.2.6-81.6.6l-80.6.1V204h-37.2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold">{t('app.name')}</h1>
                  <p className="text-xs text-muted-foreground hidden sm:block">{t('app.tagline')}</p>
                </div>
              </div>
              <LanguageSwitcher />
            </div>
          </div>
        </header>

        {/* 主内容区域 */}
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* 左侧：设置面板 */}
            <div className="xl:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings2 className="w-5 h-5" />
                    {t('settings.title')}
                  </CardTitle>
                  <CardDescription>{t('settings.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 目标格式 */}
                  <div className="space-y-2">
                    <Label htmlFor="format">{t('settings.targetFormat')}</Label>
                    <Select
                      value={targetFormat}
                      onValueChange={(value) => setTargetFormat(value as ImageFormat | 'original')}
                    >
                      <SelectTrigger id="format">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="original">{t('settings.keepOriginal')}</SelectItem>
                        {SUPPORTED_FORMATS.map((format) => (
                          <SelectItem key={format.value} value={format.value}>
                            {format.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">{t('settings.targetFormatDesc')}</p>
                  </div>

                  {/* 压缩质量 */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center gap-2">
                      <Label htmlFor="quality">{t('settings.quality')}</Label>
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
                    <p className="text-xs text-muted-foreground">{t('settings.qualityDesc')}</p>
                  </div>

                  {/* 操作按钮 */}
                  <div className="space-y-2 pt-4">
                    <Button
                      className="w-full"
                      onClick={handleProcessPending}
                      disabled={images.length === 0 || isProcessing}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {isProcessing ? t('settings.processing') : t('settings.processBtn')}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleReprocessAll}
                      disabled={images.length === 0 || isProcessing}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      {t('settings.reprocessBtn')}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleDownloadAll}
                      disabled={completedCount === 0}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {t('settings.downloadAllBtn')} ({completedCount})
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleClearAll}
                      disabled={images.length === 0}
                    >
                      {t('settings.clearBtn')}
                    </Button>
                  </div>

                  {/* 统计信息 */}
                  {images.length > 0 && (
                    <div className="pt-4 border-t space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t('settings.stats.total')}</span>
                        <span className="font-medium">
                          {images.length} / {MAX_IMAGES_PER_BATCH}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t('settings.stats.completed')}</span>
                        <span className="font-medium text-primary">{completedCount}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 右侧：上传和预览区域 */}
            <div className="xl:col-span-3 space-y-6">
              {/* 上传区域 */}
              <ImageUploadZone onFilesSelected={handleFilesSelected} />

              {/* 图片预览列表 */}
              {images.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {images.map((image) => (
                    <ImagePreviewCard key={image.id} image={image} onRemove={handleDeleteImage} />
                  ))}
                </div>
              )}

              {/* 空状态提示 */}
              {images.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Sparkles className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{t('upload.getStarted')}</h3>
                    <p className="text-sm text-muted-foreground text-center max-w-md">
                      {t('upload.getStartedDesc')}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>

        {/* 特性展示 */}
        <Features />

        {/* FAQ */}
        <FAQ />

        {/* 页脚 */}
        <footer className="border-t mt-12 bg-card">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col items-center gap-2">
              <p className="text-center text-sm text-muted-foreground">{t('footer.copyright')}</p>
              <p className="text-center text-xs text-muted-foreground">
                {t('footer.version', { version: '1.0.0' })}
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
