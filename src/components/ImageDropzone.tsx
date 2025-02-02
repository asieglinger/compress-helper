import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';

interface ImageDropzoneProps {
  onImageDrop: (file: File) => void;
}

const ImageDropzone = ({ onImageDrop }: ImageDropzoneProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onImageDrop(acceptedFiles[0]);
    }
  }, [onImageDrop]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    multiple: false
  });

  return (
    <div
      {...getRootProps()}
      className={`dropzone ${isDragActive ? 'dropzone-active' : ''}`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4">
        <Upload className="w-12 h-12 text-primary" />
        <p className="text-lg font-medium">
          {isDragActive
            ? "Drop your image here..."
            : "Drag & drop an image, or click to select"}
        </p>
        <p className="text-sm text-muted-foreground">
          Supports PNG, JPG and WebP
        </p>
      </div>
    </div>
  );
};

export default ImageDropzone;