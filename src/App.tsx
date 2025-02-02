import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useState, useCallback, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { formatFileSize } from "@/lib/utils";
import { ImageCompareSlider } from '@/components/ImageCompareSlider';

const queryClient = new QueryClient();

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
  const [quality, setQuality] = useState<number>(80);

  const calculateImageSize = (dataUrl: string): number => {
    // Remove the data URL prefix to get the base64 string
    const base64String = dataUrl.split(',')[1];
    // Calculate size in bytes
    return Math.round((base64String.length * 3) / 4);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setOriginalImage(dataUrl);
        setOriginalSize(file.size);
      };
      reader.readAsDataURL(file);
    }
  };

  const compressImage = useCallback(async () => {
    if (!originalImage) return;

    const img = new Image();
    img.src = originalImage;
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

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
    };
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
      </div>

      {originalImage && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {compressedImages.map((img, index) => (
            <ImageCompareSlider
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