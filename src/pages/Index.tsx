import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { Button } from '@/components/ui/button';
import { Download, Image } from 'lucide-react';
import ImageDropzone from '@/components/ImageDropzone';
import ComparisonView from '@/components/ComparisonView';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CompressionResult {
  originalUrl: string;
  compressedUrl: string;
  originalSize: number;
  compressedSize: number;
  method: string;
}

const compressionMethods = [
  {
    id: 'high-quality',
    name: 'High Quality Compression',
    description: 'Minimal compression, preserves quality',
    options: { maxSizeMB: 1, maxWidthOrHeight: 1920, quality: 0.8 }
  },
  {
    id: 'balanced',
    name: 'Balanced Compression',
    description: 'Good balance of quality and size',
    options: { maxSizeMB: 0.5, maxWidthOrHeight: 1600, quality: 0.6 }
  },
  {
    id: 'size-optimized',
    name: 'Size Optimized',
    description: 'Prioritizes file size reduction',
    options: { maxSizeMB: 0.2, maxWidthOrHeight: 1200, quality: 0.4 }
  },
  {
    id: 'thumbnail',
    name: 'Thumbnail Compression',
    description: 'Small size, reduced dimensions',
    options: { maxSizeMB: 0.1, maxWidthOrHeight: 800, quality: 0.3 }
  },
  {
    id: 'webp',
    name: 'WebP Format',
    description: 'Modern format with better compression',
    options: { maxSizeMB: 0.5, maxWidthOrHeight: 1600, useWebWorker: true }
  }
];

const Index = () => {
  const [results, setResults] = useState<CompressionResult[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const { toast } = useToast();

  const handleImageDrop = async (file: File) => {
    try {
      setIsCompressing(true);
      const newResults: CompressionResult[] = [];
      const originalUrl = URL.createObjectURL(file);

      for (const method of compressionMethods) {
        const compressedFile = await imageCompression(file, method.options);
        const compressedUrl = URL.createObjectURL(compressedFile);

        newResults.push({
          originalUrl,
          compressedUrl,
          originalSize: file.size,
          compressedSize: compressedFile.size,
          method: method.id
        });
      }

      setResults(newResults);
      toast({
        title: "Images compressed successfully!",
        description: "Compare the different compression methods below.",
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

  const handleDownload = (result: CompressionResult) => {
    const link = document.createElement('a');
    link.href = result.compressedUrl;
    link.download = `compressed-image-${result.method}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-[1600px] mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Image Compressor</h1>
          <p className="text-xl text-muted-foreground">
            Compare various compression methods
          </p>
        </div>

        {!results.length && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5" />
                Select an image to start
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ImageDropzone onImageDrop={handleImageDrop} />
            </CardContent>
          </Card>
        )}

        {results.length > 0 && (
          <div className="space-y-6">
            <Button
              variant="outline"
              onClick={() => {
                setResults([]);
                toast({
                  title: "Ready for a new image",
                  description: "Upload another image to compress",
                });
              }}
            >
              Compress another image
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {compressionMethods.map((method) => {
                const result = results.find(r => r.method === method.id);
                if (!result) return null;

                return (
                  <Card key={method.id}>
                    <CardHeader className="space-y-1">
                      <CardTitle className="flex items-center justify-between">
                        <span>{method.name}</span>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDownload(result)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {method.description}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <ComparisonView
                        originalImage={result.originalUrl}
                        compressedImage={result.compressedUrl}
                        originalSize={result.originalSize}
                        compressedSize={result.compressedSize}
                      />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {isCompressing && (
          <div className="text-center text-muted-foreground">
            Compressing your image with multiple methods...
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;