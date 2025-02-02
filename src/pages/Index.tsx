import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { Button } from '@/components/ui/button';
import { Download, Image } from 'lucide-react';
import ImageDropzone from '@/components/ImageDropzone';
import ComparisonView from '@/components/ComparisonView';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CompressionResult {
  originalUrl: string;
  compressedUrl: string;
  originalSize: number;
  compressedSize: number;
  method: string;
}

const compressionMethods = [
  {
    id: 'high',
    name: 'High Quality',
    options: { maxSizeMB: 1, maxWidthOrHeight: 1920, quality: 0.8 }
  },
  {
    id: 'medium',
    name: 'Balanced',
    options: { maxSizeMB: 0.5, maxWidthOrHeight: 1600, quality: 0.6 }
  },
  {
    id: 'low',
    name: 'Maximum Compression',
    options: { maxSizeMB: 0.2, maxWidthOrHeight: 1200, quality: 0.4 }
  },
  {
    id: 'tiny',
    name: 'Tiny Size',
    options: { maxSizeMB: 0.1, maxWidthOrHeight: 800, quality: 0.3 }
  },
  {
    id: 'webp',
    name: 'WebP Format',
    options: { maxSizeMB: 0.5, maxWidthOrHeight: 1600, useWebWorker: true }
  }
];

const Index = () => {
  const [results, setResults] = useState<CompressionResult[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('high');
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
      <div className="max-w-6xl mx-auto space-y-8">
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

            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid grid-cols-5 gap-4">
                {compressionMethods.map((method) => (
                  <TabsTrigger key={method.id} value={method.id}>
                    {method.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {compressionMethods.map((method) => {
                const result = results.find(r => r.method === method.id);
                if (!result) return null;

                return (
                  <TabsContent key={method.id} value={method.id}>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>{method.name}</span>
                          <Button onClick={() => handleDownload(result)}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        </CardTitle>
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
                  </TabsContent>
                );
              })}
            </Tabs>
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