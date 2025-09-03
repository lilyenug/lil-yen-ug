import React, { useState, useCallback } from 'react';
import { ImageCropper } from './ImageCropper';
import type { PixelCrop } from '../types';

interface CropModalProps {
  imageSrc: string;
  onClose: () => void;
  onConfirm: (crop: PixelCrop) => void;
  initialAspectRatio: string;
}

export const CropModal: React.FC<CropModalProps> = ({ imageSrc, onClose, onConfirm, initialAspectRatio }) => {
  const [crop, setCrop] = useState<PixelCrop | null>(null);
  const [aspectRatio, setAspectRatio] = useState<string>(initialAspectRatio);
  const [zoom, setZoom] = useState(1);

  const handleCropComplete = useCallback((newCrop: PixelCrop) => {
    setCrop(newCrop);
  }, []);

  const handleConfirm = () => {
    if (crop && crop.width > 0 && crop.height > 0) {
      onConfirm(crop);
    } else {
        alert("Please select an area to crop.")
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <header className="p-4 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
          <h2 className="text-lg font-semibold text-cyan-400">Crop Image</h2>
          <div className="flex items-center gap-2">
            <span className='text-sm text-gray-400'>Aspect Ratio:</span>
            {['Original', '1:1', '16:9', '4:3'].map((ratio) => (
                <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    aspectRatio === ratio
                        ? 'bg-cyan-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                >
                    {ratio}
                </button>
            ))}
          </div>
        </header>

        <main className="p-4 flex-grow overflow-hidden flex items-center justify-center bg-gray-900">
           <ImageCropper 
             src={imageSrc} 
             aspectRatio={aspectRatio}
             onCropComplete={handleCropComplete}
             zoom={zoom}
             onZoomChange={setZoom}
            />
        </main>

        <footer className="p-4 border-t border-gray-700 flex justify-end items-center gap-3 flex-shrink-0">
          <div className="flex-grow flex items-center gap-3 mr-4">
            <label htmlFor='zoom-slider' className='text-sm text-gray-300'>Zoom</label>
            <input
              id='zoom-slider'
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500
                       [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:rounded-full
                       [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-cyan-500 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-none"
            />
            <span className="px-2 py-1 text-xs rounded-md bg-gray-900 text-cyan-400 font-mono w-16 text-center">
              {Math.round(zoom * 100)}%
            </span>
          </div>
          <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 text-white font-semibold transition-colors">
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            className="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white font-semibold transition-colors disabled:opacity-50"
            disabled={!crop || crop.width === 0 || crop.height === 0}
            >
            Confirm Crop
          </button>
        </footer>
      </div>
    </div>
  );
};
