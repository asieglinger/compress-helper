import { useState } from 'react';
import { formatFileSize } from "@/lib/utils";

interface ImageCompareProps {
  originalImage: string;
  compressedImage: string;
  method: string;
  compressedSize: number;
  originalSize: number;
  quality?: number;
}

export function ImageCompare({
  originalImage,
  compressedImage,
  method,
  compressedSize,
  originalSize,
  quality
}: ImageCompareProps) {
  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-bold mb-2">{method}</h3>
      <div 
        className="relative w-full aspect-[4/3] overflow-hidden cursor-pointer group"
        onClick={() => setShowOriginal(!showOriginal)}
      >
        {/* Compressed Image */}
        <img 
          src={compressedImage} 
          alt="Compressed" 
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
        
        {/* Original Image with fade transition */}
        <img 
          src={originalImage} 
          alt="Original" 
          className="absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-200"
          style={{ 
            opacity: showOriginal ? 1 : 0,
          }}
        />

        {/* Hover/Click Instruction */}
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <p className="text-white font-medium px-4 py-2 rounded-lg bg-black bg-opacity-50">
            {showOriginal ? 'Click to see compressed' : 'Click to see original'}
          </p>
        </div>
      </div>
      <div className="text-sm text-gray-600 mt-2">
        <div>Size: {formatFileSize(compressedSize)}</div>
        <div>Savings: {Math.round((1 - compressedSize / originalSize) * 100)}%</div>
        {quality && <div>Quality: {quality}%</div>}
      </div>
    </div>
  );
} 