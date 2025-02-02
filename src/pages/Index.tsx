import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import ImageDropzone from '@/components/ImageDropzone';
import ComparisonView from '@/components/ComparisonView';
import { useToast } from '@/components/ui/use-toast';

interface CompressionResult {
  originalUrl: string;
  compressedUrl: string;
  originalSize: number;
  compressedSize: number;
}

const Index = () => {
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const { toast } = useToast();

  const handleImageDrop = async (file: File) => {
    try {
      setIsCompressing(true);

      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);
      
      const originalUrl = URL.createObjectURL(file);
      const compressedUrl = URL.createObjectURL(compressedFile);

      setResult({
        originalUrl,
        compressedUrl,
        originalSize: file.size,
        compressedSize: compressedFile.size,
      });

      toast({
        title: "Image compressed successfully!",
        description: `Reduced from ${(file.size / 1024).toFixed(2)}KB to ${(compressedFile.size / 1024).toFixed(2)}KB`,
      });
    } catch (error) {
      toast({
        title: "Compression failed",
        description: "There was an error compressing your image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    
    const link = document.createElement('a');
    link.href = result.compressedUrl;
    link.download = 'compressed-image.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Image Compressor</h1>
        <p className="text-muted-foreground">
          Compress your images without losing quality
        </p>
      </div>

      {!result && (
        <ImageDropzone onImageDrop={handleImageDrop} />
      )}

      {result && (
        <div className="space-y-6">
          <ComparisonView
            originalImage={result.originalUrl}
            compressedImage={result.compressedUrl}
            originalSize={result.originalSize}
            compressedSize={result.compressedSize}
          />
          
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => {
                setResult(null);
                toast({
                  title: "Ready for a new image",
                  description: "Upload another image to compress",
                });
              }}
            >
              Compress another image
            </Button>
            
            <Button onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download compressed image
            </Button>
          </div>
        </div>
      )}

      {isCompressing && (
        <div className="text-center text-muted-foreground">
          Compressing your image...
        </div>
      )}
    </div>
  );
};

export default Index;