import { FileImage, Upload } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { isValidImageFile } from '@/utils/imageProcessor';

interface ImageUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

export default function ImageUploadZone({ onFilesSelected, disabled }: ImageUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      const validFiles = files.filter(isValidImageFile);

      if (validFiles.length === 0) {
        toast({
          title: t('toast.uploadError'),
          description: t('upload.supportedFormats'),
          variant: 'destructive',
        });
        return;
      }

      if (validFiles.length < files.length) {
        toast({
          title: 'Some files ignored',
          description: `Filtered ${files.length - validFiles.length} unsupported files`,
        });
      }

      onFilesSelected(validFiles);
    },
    [disabled, onFilesSelected, toast, t]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);
      const validFiles = fileArray.filter(isValidImageFile);

      if (validFiles.length === 0) {
        toast({
          title: t('toast.uploadError'),
          description: t('upload.supportedFormats'),
          variant: 'destructive',
        });
        return;
      }

      if (validFiles.length < fileArray.length) {
        toast({
          title: 'Some files ignored',
          description: `Filtered ${fileArray.length - validFiles.length} unsupported files`,
        });
      }

      onFilesSelected(validFiles);
      // 重置input值，允许重复选择同一文件
      e.target.value = '';
    },
    [onFilesSelected, toast, t]
  );

  return (
    <div
      className={cn(
        'relative border-2 border-dashed rounded-lg transition-all duration-200',
        'hover:border-primary hover:bg-accent/50',
        isDragging && 'border-primary bg-accent border-solid',
        disabled && 'opacity-50 cursor-not-allowed',
        !disabled && 'cursor-pointer'
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        multiple
        accept="image/png,image/jpeg,image/jpg,image/gif,image/bmp,image/webp"
        onChange={handleFileInput}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        id="file-upload"
      />
      <label
        htmlFor="file-upload"
        className="flex flex-col items-center justify-center py-12 px-6 cursor-pointer"
      >
        <div className="mb-4 p-4 bg-primary/10 rounded-full">
          {isDragging ? (
            <FileImage className="w-12 h-12 text-primary" />
          ) : (
            <Upload className="w-12 h-12 text-primary" />
          )}
        </div>
        <h3 className="text-lg font-semibold mb-2">
          {isDragging ? t('upload.dragDrop') : t('upload.clickToSelect')}
        </h3>
        <p className="text-sm text-muted-foreground text-center">{t('upload.supportedFormats')}</p>
        <p className="text-xs text-muted-foreground mt-1">{t('upload.maxFiles', { count: 20 })}</p>
      </label>
    </div>
  );
}
