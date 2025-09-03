import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { PixelCrop } from '../types';

interface ImageCropperProps {
  src: string;
  aspectRatio: string;
  onCropComplete: (crop: PixelCrop) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

interface Point {
  x: number;
  y: number;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const ImageCropper: React.FC<ImageCropperProps> = ({ 
    src, 
    aspectRatio, 
    onCropComplete,
    zoom,
    onZoomChange
}) => {
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Point>({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState<Point>({ x: 0, y: 0 });
  const [cropBox, setCropBox] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Reset pan and zoom when the source image changes
  useEffect(() => {
    setPan({ x: 0, y: 0 });
    if (zoom !== 1) onZoomChange(1);
  }, [src]);

  const aspectRatioValue = useMemo(() => {
    if (aspectRatio === '1:1') return 1;
    if (aspectRatio === '16:9') return 16 / 9;
    if (aspectRatio === '4:3') return 4 / 3;
    return null;
  }, [aspectRatio]);

  // Calculate the crop box dimensions based on container and aspect ratio
  useEffect(() => {
    const calculateCropBox = () => {
      if (!containerRef.current || !imageRef.current) return;
      
      const container = containerRef.current;
      const { clientWidth: containerWidth, clientHeight: containerHeight } = container;

      // Start with a 90% size for padding
      const targetWidth = containerWidth * 0.9;
      const targetHeight = containerHeight * 0.9;

      let width = targetWidth;
      let height = targetHeight;
      
      if (aspectRatioValue) {
        if (targetWidth / targetHeight > aspectRatioValue) {
          width = targetHeight * aspectRatioValue;
        } else {
          height = targetWidth / aspectRatioValue;
        }
      }

      setCropBox({
        width,
        height,
        x: (containerWidth - width) / 2,
        y: (containerHeight - height) / 2,
      });
    };

    const containerNode = containerRef.current;
    if (!containerNode) return;

    const resizeObserver = new ResizeObserver(calculateCropBox);
    resizeObserver.observe(containerNode);
    
    const imageNode = imageRef.current;
    if (imageNode) imageNode.onload = calculateCropBox;
    
    calculateCropBox();

    return () => {
        resizeObserver.disconnect();
        if (imageNode) imageNode.onload = null;
    };
  }, [aspectRatioValue]);


  const getClampedPan = useCallback((newPan: Point, currentZoom: number): Point => {
    if (!imageRef.current || !containerRef.current || cropBox.width === 0) return { x: 0, y: 0 };

    const { clientWidth: imgWidth, clientHeight: imgHeight } = imageRef.current;
    const { clientWidth: containerWidth, clientHeight: containerHeight } = containerRef.current;

    const scaledWidth = imgWidth * currentZoom;
    const scaledHeight = imgHeight * currentZoom;
    
    // Pan constraints to keep the image covering the crop box
    const minPanX = (containerWidth - scaledWidth) / 2 + cropBox.x + cropBox.width - scaledWidth;
    const maxPanX = (containerWidth - scaledWidth) / 2 + cropBox.x;
    
    const minPanY = (containerHeight - scaledHeight) / 2 + cropBox.y + cropBox.height - scaledHeight;
    const maxPanY = (containerHeight - scaledHeight) / 2 + cropBox.y;
    
    return {
      x: clamp(newPan.x, minPanX, maxPanX),
      y: clamp(newPan.y, minPanY, maxPanY),
    };
  }, [cropBox]);

  // Calculate the final pixel crop whenever transform values change
  useEffect(() => {
    if (!imageRef.current || !containerRef.current || cropBox.width === 0 || !imageRef.current.naturalWidth) {
      onCropComplete({ x: 0, y: 0, width: 0, height: 0 });
      return;
    }
    const image = imageRef.current;
    const container = containerRef.current;

    const scaleToNatural = image.naturalWidth / image.clientWidth;
    
    const scaledImgX = (container.clientWidth - image.clientWidth * zoom) / 2 + pan.x;
    const scaledImgY = (container.clientHeight - image.clientHeight * zoom) / 2 + pan.y;

    const cropOnScaledX = cropBox.x - scaledImgX;
    const cropOnScaledY = cropBox.y - scaledImgY;

    const finalCrop: PixelCrop = {
      x: Math.round((cropOnScaledX / zoom) * scaleToNatural),
      y: Math.round((cropOnScaledY / zoom) * scaleToNatural),
      width: Math.round((cropBox.width / zoom) * scaleToNatural),
      height: Math.round((cropBox.height / zoom) * scaleToNatural),
    };

    onCropComplete(finalCrop);
  }, [pan, zoom, cropBox, onCropComplete]);
  
  const getPointFromEvent = (e: React.MouseEvent | React.WheelEvent): Point => {
    const rect = containerRef.current!.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const newZoom = clamp(zoom - e.deltaY * 0.005, MIN_ZOOM, MAX_ZOOM);
    const point = getPointFromEvent(e);

    const container = containerRef.current;
    // Position of cursor relative to image center, scaled to un-zoomed image
    const pointOnImageX = (point.x - container.clientWidth / 2 - pan.x) / zoom;
    const pointOnImageY = (point.y - container.clientHeight / 2 - pan.y) / zoom;
    
    // Pan adjustment to keep the point under the cursor stationary
    const newPanX = pan.x - pointOnImageX * (newZoom - zoom);
    const newPanY = pan.y - pointOnImageY * (newZoom - zoom);

    onZoomChange(newZoom);
    setPan(getClampedPan({ x: newPanX, y: newPanY }, newZoom));
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsPanning(true);
    setDragStart(getPointFromEvent(e));
    setPanStart(pan);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    e.preventDefault();
    const currentPoint = getPointFromEvent(e);
    const newPan = {
      x: panStart.x + currentPoint.x - dragStart.x,
      y: panStart.y + currentPoint.y - dragStart.y,
    };
    setPan(getClampedPan(newPan, zoom));
  };
  
  const handleMouseUp = () => {
    setIsPanning(false);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full touch-none select-none overflow-hidden flex items-center justify-center"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
    >
      <img
        ref={imageRef}
        src={src}
        alt="Crop preview"
        className="max-w-full max-h-full object-contain"
        style={{ 
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            pointerEvents: 'none',
        }}
        draggable="false"
      />
      
      {cropBox.width > 0 && (
         <div
            className="absolute pointer-events-none"
            style={{
                left: cropBox.x,
                top: cropBox.y,
                width: cropBox.width,
                height: cropBox.height,
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.7)',
                border: '1px dashed rgba(255, 255, 255, 0.7)',
            }}
           />
      )}
    </div>
  );
};