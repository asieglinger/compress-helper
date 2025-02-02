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
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm">
        <span>Original ({formatSize(originalSize)})</span>
        <span>Compressed ({formatSize(compressedSize)})</span>
      </div>
      <div ref={containerRef} className="image-container h-[400px]">
        <img
          src={originalImage}
          alt="Original"
          className="absolute top-0 left-0 w-full h-full object-contain"
        />
        <div
          className="absolute top-0 left-0 w-full h-full overflow-hidden"
          style={{ width: `${position}%` }}
        >
          <img
            src={compressedImage}
            alt="Compressed"
            className="absolute top-0 left-0 w-full h-full object-contain"
          />
        </div>
        <div
          className="comparison-slider"
          style={{ left: `${position}%` }}
        >
          <div ref={handleRef} className="comparison-handle">
            <ArrowLeftRight className="w-4 h-4 text-primary" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonView;