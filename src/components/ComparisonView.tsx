import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeftRight } from 'lucide-react';

interface ComparisonViewProps {
  originalImage: string;
  compressedImage: string;
  originalSize: number;
  compressedSize: number;
}

const ComparisonView = ({
  originalImage,
  compressedImage,
  originalSize,
  compressedSize
}: ComparisonViewProps) => {
  const [position, setPosition] = useState(50);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const originalImageRef = useRef<HTMLImageElement>(null);

  const handleMove = (e: MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    setPosition(percentage);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  useEffect(() => {
    const container = containerRef.current;
    const handle = handleRef.current;
    if (!container || !handle) return;

    const onMouseDown = () => {
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    handle.addEventListener('mousedown', onMouseDown);

    return () => {
      handle.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  useEffect(() => {
    const img = originalImageRef.current;
    if (img) {
      const updateDimensions = () => {
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        let width = Math.min(img.naturalWidth, 800);
        let height = width / aspectRatio;
        
        if (height > 400) {
          height = 400;
          width = height * aspectRatio;
        }
        
        setDimensions({ width, height });
      };

      if (img.complete) {
        updateDimensions();
      } else {
        img.onload = updateDimensions;
      }
    }
  }, [originalImage]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>Original ({formatSize(originalSize)})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>Compressed ({formatSize(compressedSize)})</span>
        </div>
      </div>
      <div 
        ref={containerRef} 
        className="relative bg-neutral-100 rounded-lg overflow-hidden"
        style={{ 
          width: dimensions.width || '100%',
          height: dimensions.height || 400,
          margin: '0 auto'
        }}
      >
        <img
          ref={originalImageRef}
          src={originalImage}
          alt="Original"
          className="absolute top-0 left-0 w-full h-full object-contain"
        />
        <div
          className="absolute top-0 left-0 h-full overflow-hidden"
          style={{ width: `${position}%` }}
        >
          <img
            src={compressedImage}
            alt="Compressed"
            className="absolute top-0 left-0 w-full h-full object-contain"
            style={{ 
              width: `${dimensions.width}px`,
              height: `${dimensions.height}px`
            }}
          />
        </div>
        <div
          ref={handleRef}
          className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize"
          style={{ left: `${position}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
            <ArrowLeftRight className="w-4 h-4 text-primary" />
          </div>
        </div>
        
        <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
          Original
        </div>
        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
          Compressed
        </div>
      </div>
    </div>
  );
};

export default ComparisonView;