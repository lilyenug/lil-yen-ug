import React, { useState, useRef } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface ImageUploaderProps {
  onImageUpload: (imageDataUrl: string, mimeType: string) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        setFileName(file.name);
        onImageUpload(result, file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file) {
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.');
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            setPreview(result);
            setFileName(file.name);
            onImageUpload(result, file.type);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      {preview ? (
        <div className="relative group cursor-pointer" onClick={triggerFileSelect}>
          <img src={preview} alt="Preview" className="w-full h-auto rounded-lg object-cover" />
           <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
            <p className="text-white text-center">Click to change image</p>
           </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="w-full h-48 border-2 border-dashed border-gray-500 rounded-lg flex flex-col items-center justify-center hover:border-cyan-400 hover:bg-gray-700/50 transition-colors p-4 text-center"
        >
          <UploadIcon className="w-8 h-8 text-gray-400 mb-3"/>
          <p className="text-gray-400">Drag & drop an image here, or</p>
          <button
            type="button"
            onClick={triggerFileSelect}
            className="mt-3 px-5 py-2 rounded-lg text-sm font-semibold transition-colors bg-gray-600 hover:bg-gray-500 text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500"
          >
            Select a file
          </button>
          <p className="text-xs text-gray-500 mt-3">PNG, JPG, GIF, etc.</p>
        </div>
      )}
      {fileName && <p className="text-xs text-gray-400 mt-2 truncate">File: {fileName}</p>}
    </div>
  );
};
