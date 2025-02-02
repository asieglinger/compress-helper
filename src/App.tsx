import { useState, useCallback, useEffect } from "react";
import { formatFileSize } from "@/lib/utils";
import { ImageCompare } from '@/components/ImageCompare';

interface CompressedImage {
  dataUrl: string;
  size: number;
  method: string;
  quality?: number;
}

function App() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedImages, setCompressedImages] = useState<CompressedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateImageSize = (dataUrl: string): number => {
    // Remove the data URL prefix to get the base64 string
    const base64String = dataUrl.split(',')[1];
    // Calculate size in bytes
    return Math.round((base64String.length * 3) / 4);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset states
    setError(null);
    setIsLoading(true);
    setCompressedImages([]);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      setIsLoading(false);
      return;
    }

    // Validate file size (e.g., max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Please upload an image smaller than 10MB');
      setIsLoading(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setOriginalImage(dataUrl);
      setOriginalSize(file.size);
      setIsLoading(false);
    };
    reader.onerror = () => {
      setError('Error reading file');
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const compressImage = useCallback(async () => {
    if (!originalImage) return;

    setIsLoading(true);
    setError(null);

    try {
      const img = new Image();
      img.src = originalImage;
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('Could not initialize canvas context');
          }

          // Draw the image on canvas first
          ctx.drawImage(img, 0, 0);

          // Create different compression versions
          const compressionMethods: CompressedImage[] = [
            // JPEG with different qualities
            {
              dataUrl: canvas.toDataURL('image/jpeg', 0.8),
              method: 'JPEG High Quality (80%)',
              quality: 80
            },
            {
              dataUrl: canvas.toDataURL('image/jpeg', 0.4),
              method: 'JPEG Medium Quality (40%)',
              quality: 40
            },
            {
              dataUrl: canvas.toDataURL('image/jpeg', 0.1),
              method: 'JPEG Low Quality (10%)',
              quality: 10
            },
            // WebP format with high compression
            {
              dataUrl: canvas.toDataURL('image/webp', 0.4) || canvas.toDataURL('image/jpeg', 0.4),
              method: 'WebP Compressed',
              quality: 40
            },
            // PNG format (for comparison)
            {
              dataUrl: canvas.toDataURL('image/png', 1.0),
              method: 'PNG (Lossless)',
            },
            // Extreme compression
            {
              dataUrl: canvas.toDataURL('image/jpeg', 0.01),
              method: 'Maximum Compression (1%)',
              quality: 1
            }
          ].map(img => {
            const size = calculateImageSize(img.dataUrl);
            console.log(`${img.method} - Size: ${formatFileSize(size)}`);
            return {
              ...img,
              size
            };
          });

          setCompressedImages(compressionMethods);
          setIsLoading(false);
        } catch (err) {
          setError('Error compressing image. Please try another image.');
          setIsLoading(false);
        }
      };

      img.onerror = () => {
        setError('Error loading image. Please try another image.');
        setIsLoading(false);
      };
    } catch (err) {
      setError('Error processing image. Please try another image.');
      setIsLoading(false);
    }
  }, [originalImage]);

  useEffect(() => {
    if (originalImage) {
      compressImage();
    }
  }, [originalImage, compressImage]);

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleImageUpload}
          className="block w-full text-sm text-slate-500 mb-4
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-violet-50 file:text-violet-700
            hover:file:bg-violet-100"
        />
        {error && (
          <p className="text-red-500 mt-2">{error}</p>
        )}
        {isLoading && (
          <p className="text-slate-500 mt-2">Processing image...</p>
        )}
      </div>

      {originalImage && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {compressedImages.map((img, index) => (
            <ImageCompare
              key={index}
              originalImage={originalImage}
              compressedImage={img.dataUrl}
              method={img.method}
              compressedSize={img.size}
              originalSize={originalSize}
              quality={img.quality}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default App;