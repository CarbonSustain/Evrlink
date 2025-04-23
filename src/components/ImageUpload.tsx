import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

const ImageUpload = ({ value, onChange, className }: ImageUploadProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // Convert to base64 for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        onChange(base64);
      };
      reader.readAsDataURL(file);
    }
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false
  });

  return (
    <div 
      {...getRootProps()} 
      className={cn(
        "relative group cursor-pointer rounded-xl overflow-hidden border-2 border-dashed transition-all duration-200",
        isDragActive ? "border-primary/50 bg-primary/5" : "border-white/10 hover:border-white/20",
        className
      )}
    >
      <input {...getInputProps()} />
      
      {value ? (
        <>
          <img 
            src={value} 
            alt="Gift card preview" 
            className="w-full h-full object-cover aspect-video"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="text-white text-center">
              <Upload className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm">Change image</p>
            </div>
          </div>
        </>
      ) : (
        <div className="aspect-video flex flex-col items-center justify-center p-6 text-white/60">
          <ImageIcon className="w-10 h-10 mb-4" />
          <p className="text-center mb-1">
            {isDragActive ? (
              "Drop your image here"
            ) : (
              "Drag & drop your image here"
            )}
          </p>
          <p className="text-sm opacity-50">
            PNG, JPG or GIF (max 5MB)
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
