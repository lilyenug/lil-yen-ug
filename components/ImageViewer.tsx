
import React from 'react';
import { ImageIcon } from './icons/ImageIcon';
import { LoadingSpinner } from './icons/LoadingSpinner';

interface ImageViewerProps {
  title: string;
  imageUrl: string | null;
  isLoading: boolean;
  controls?: React.ReactNode;
  activeFilter?: string;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  exposure?: number;
  vignette?: number;
  temperature?: number;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ 
  title, imageUrl, isLoading, controls, activeFilter, 
  brightness = 100, 
  contrast = 100, 
  saturation = 100,
  exposure = 100,
  vignette = 0,
  temperature = 100
}) => {
  const getFilterStyle = (): React.CSSProperties => {
    const filters = [];
    const filterMap: { [key: string]: string } = {
        Grayscale: 'grayscale(100%)',
        Sepia: 'sepia(100%)',
        Invert: 'invert(100%)',
        Vintage: 'sepia(60%) brightness(110%) contrast(90%)',
        Sharpen: 'contrast(120%)',
    };
    
    if (activeFilter && filterMap[activeFilter]) {
        filters.push(filterMap[activeFilter]);
    }
    
    const combinedBrightness = (brightness / 100) * (exposure / 100);
    if (combinedBrightness !== 1) {
        filters.push(`brightness(${combinedBrightness})`);
    }

    if (contrast !== 100) {
        filters.push(`contrast(${contrast / 100})`);
    }

    if (saturation !== 100) {
        filters.push(`saturate(${saturation / 100})`);
    }
    
    return filters.length > 0 ? { filter: filters.join(' ') } : {};
  };

  const getTemperatureOverlay = () => {
    if (temperature === 100) return null;

    const tempDelta = temperature - 100;
    const alpha = Math.abs(tempDelta) / 100 * 0.25; // Max 25% overlay
    const color = tempDelta > 0 ? `rgba(255, 165, 0, ${alpha})` : `rgba(0, 100, 255, ${alpha})`;

    return (
      <div
        className="absolute inset-0 pointer-events-none rounded-lg"
        style={{
          backgroundColor: color,
          mixBlendMode: 'color',
        }}
      />
    );
  };
  
  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-300">{title}</h3>
        {controls && <div>{controls}</div>}
      </div>
      <div className="aspect-square w-full bg-gray-700/50 rounded-lg flex items-center justify-center relative overflow-hidden border border-gray-600">
        {isLoading && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-20">
            <LoadingSpinner className="w-10 h-10 text-cyan-400" />
            <p className="text-gray-300 mt-3 text-sm">AI is thinking...</p>
          </div>
        )}
        {imageUrl ? (
          <>
            <img 
              src={imageUrl} 
              alt={title} 
              className="w-full h-full object-contain z-0"
              style={getFilterStyle()}
            />
            {getTemperatureOverlay()}
            {vignette > 0 && (
              <div
                className="absolute inset-0 pointer-events-none rounded-lg z-10"
                style={{
                  background: `radial-gradient(ellipse at center, transparent ${100 - vignette * 0.7}%, rgba(0,0,0,${Math.min(vignette / 100 * 1.2, 1)}) 100%)`,
                }}
              />
            )}
          </>
        ) : (
          !isLoading && (
            <div className="text-gray-500 flex flex-col items-center">
              <ImageIcon className="w-12 h-12" />
              <p className="mt-2 text-sm">{title} image will appear here</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};
