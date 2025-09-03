
import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ImageViewer } from './components/ImageViewer';
import { GenerateButton } from './components/GenerateButton';
import { Header } from './components/Header';
import { Alert } from './components/Alert';
import { editImageWithGemini } from './services/geminiService';
import type { EditedImageResult, PixelCrop } from './types';
import { UndoIcon } from './components/icons/UndoIcon';
import { RedoIcon } from './components/icons/RedoIcon';
import { SaveIcon } from './components/icons/SaveIcon';
import { CropModal } from './components/CropModal';
import { CropIcon } from './components/icons/CropIcon';
import { FilterSelector } from './components/FilterSelector';
import { LandscapeIcon } from './components/icons/LandscapeIcon';
// FIX: Import LoadingSpinner component
import { LoadingSpinner } from './components/icons/LoadingSpinner';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalMimeType, setOriginalMimeType] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [editedText, setEditedText] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [backgroundPrompt, setBackgroundPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<string>('Original');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState<boolean>(false);
  const [crop, setCrop] = useState<PixelCrop | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('None');
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [exposure, setExposure] = useState<number>(100);
  const [vignette, setVignette] = useState<number>(0);
  const [temperature, setTemperature] = useState<number>(100);
  const [isAutoEnhanced, setIsAutoEnhanced] = useState<boolean>(false);

  const editedImage = history[historyIndex] ?? null;

  const resetAdjustments = () => {
    setActiveFilter('None');
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setExposure(100);
    setVignette(0);
    setTemperature(100);
    setIsAutoEnhanced(false);
  }

  const handleImageUpload = (imageDataUrl: string, mimeType: string) => {
    setOriginalImage(imageDataUrl);
    setOriginalMimeType(mimeType);
    setHistory([]);
    setHistoryIndex(-1);
    setEditedText(null);
    setError(null);
    setCrop(null);
    resetAdjustments();
  };

  const cropImage = (
    imageSrc: string,
    crop: PixelCrop
  ): Promise<{ imageDataUrl: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = imageSrc;
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Could not get canvas context'));
        }
        ctx.drawImage(
          image,
          crop.x,
          crop.y,
          crop.width,
          crop.height,
          0,
          0,
          crop.width,
          crop.height
        );
        resolve({
          imageDataUrl: canvas.toDataURL('image/png'),
          mimeType: 'image/png',
        });
      };
      image.onerror = (error) => reject(error);
    });
  };

  const executeImageEdit = useCallback(async (promptToExecute: string) => {
    if (!originalImage || !originalMimeType) {
      setError('Please upload an image.');
      return;
    }
     if (!promptToExecute) {
      setError('Please enter a prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setEditedText(null);
    resetAdjustments();

    try {
      let imageToProcess = originalImage;
      let mimeTypeToProcess = originalMimeType;

      if (crop) {
        const croppedData = await cropImage(originalImage, crop);
        imageToProcess = croppedData.imageDataUrl;
        mimeTypeToProcess = croppedData.mimeType;
      }
      
      const base64Data = imageToProcess.split(',')[1];
      
      let finalPrompt = promptToExecute;
      // Only add aspect ratio prompt if not cropping, as cropping defines the aspect ratio
      if (!crop && aspectRatio !== 'Original') {
        finalPrompt = `${promptToExecute}\n\nImportant: The final output image must have a ${aspectRatio} aspect ratio. Creatively fill any new areas if necessary.`;
      }

      const result: EditedImageResult = await editImageWithGemini(
        base64Data,
        mimeTypeToProcess,
        finalPrompt
      );
      
      if (result.image) {
        const newImage = `data:image/png;base64,${result.image}`;
        const newHistory = [...history.slice(0, historyIndex + 1), newImage];
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }
      if (result.text) {
        setEditedText(result.text);
      }
      if (!result.image && !result.text) {
        setError("The model didn't return an image or text. Please try a different prompt.");
      }

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, originalMimeType, history, historyIndex, aspectRatio, crop]);

  const handleGenerate = () => {
    executeImageEdit(prompt);
  };
  
  const handleBackgroundChange = () => {
    const backgroundChangePrompt = `Change the background to: ${backgroundPrompt}. Keep the foreground subject unchanged and realistic.`;
    executeImageEdit(backgroundChangePrompt);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
    } else if (historyIndex === 0) {
        setHistoryIndex(-1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
    }
  };
  
  const handleDownload = () => {
    if (!editedImage) return;

    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        
        const filterMap: { [key: string]: string } = {
            Grayscale: 'grayscale(100%)',
            Sepia: 'sepia(100%)',
            Invert: 'invert(100%)',
            Vintage: 'sepia(60%) brightness(110%) contrast(90%)',
            Sharpen: 'contrast(120%)',
        };
        
        const filters = [];
        if (activeFilter !== 'None' && filterMap[activeFilter]) {
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

        ctx.filter = filters.length > 0 ? filters.join(' ') : 'none';
        ctx.drawImage(image, 0, 0);
        ctx.filter = 'none'; // Reset for subsequent canvas operations

        // Add temperature effect
        const tempDelta = temperature - 100;
        if (tempDelta !== 0) {
          const alpha = Math.abs(tempDelta) / 100 * 0.2; // Max 20% overlay
          ctx.globalCompositeOperation = 'color';
          if (tempDelta > 0) { // Warm
            ctx.fillStyle = `rgba(255, 165, 0, ${alpha})`;
          } else { // Cool
            ctx.fillStyle = `rgba(0, 100, 255, ${alpha})`;
          }
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.globalCompositeOperation = 'source-over'; // Reset composite operation
        }

        // Add vignette effect after drawing the image
        if (vignette > 0) {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const outerRadius = Math.sqrt(centerX**2 + centerY**2);
            const innerRadius = outerRadius * (1 - (vignette / 100) * 0.7);
            
            const gradient = ctx.createRadialGradient(centerX, centerY, innerRadius, centerX, centerY, outerRadius);
            gradient.addColorStop(0, 'rgba(0,0,0,0)');
            gradient.addColorStop(1, `rgba(0,0,0,${Math.min(vignette / 100 * 1.2, 1)})`);

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        const fileName = `edited-${new Date().toISOString()}.png`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    image.src = editedImage;
  };

  const handleCropConfirm = (newCrop: PixelCrop) => {
    setCrop(newCrop);
    setIsCropModalOpen(false);
  };

  const handleAutoEnhanceToggle = () => {
    const willBeEnabled = !isAutoEnhanced;
    setIsAutoEnhanced(willBeEnabled);
    setActiveFilter('None');

    if (willBeEnabled) {
      // Apply enhancement values
      setBrightness(105);
      setContrast(110);
      setSaturation(115);
      setExposure(100);
      setVignette(0);
      setTemperature(100);
    } else {
      // Reset all adjustments to default when toggling off
      resetAdjustments();
    }
  };

  const createAdjustmentHandler = <T,>(setter: React.Dispatch<React.SetStateAction<T>>) => {
    return (value: T) => {
      setIsAutoEnhanced(false);
      setter(value);
    };
  };

  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex < history.length - 1;
  const isGenerateDisabled = !originalImage || !prompt || isLoading;
  const isBackgroundChangeDisabled = !originalImage || !backgroundPrompt || isLoading;

  const imageControls = (
    <div className="flex items-center space-x-2">
      <button
        onClick={handleDownload}
        disabled={!editedImage || isLoading}
        className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Save image"
      >
        <SaveIcon className="w-5 h-5" />
      </button>

      <div className="h-5 w-px bg-gray-600"></div>

      <button
          onClick={handleUndo}
          disabled={!canUndo || isLoading}
          className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Undo"
      >
          <UndoIcon className="w-5 h-5" />
      </button>
      <button
          onClick={handleRedo}
          disabled={!canRedo || isLoading}
          className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Redo"
      >
          <RedoIcon className="w-5 h-5" />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <Header />
        
        {isCropModalOpen && originalImage && (
          <CropModal 
            imageSrc={originalImage}
            onClose={() => setIsCropModalOpen(false)}
            onConfirm={handleCropConfirm}
            initialAspectRatio={aspectRatio}
          />
        )}

        <main className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-cyan-400 mb-4">1. Upload Image</h2>
              <ImageUploader onImageUpload={handleImageUpload} />
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-cyan-400 mb-4">2. Crop & Resize</h2>
                <div className="flex flex-wrap gap-2 mb-4">
                    {['Original', '1:1', '16:9', '4:3'].map((ratio) => (
                    <button
                        key={ratio}
                        onClick={() => setAspectRatio(ratio)}
                        disabled={isLoading}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 ${
                        aspectRatio === ratio
                            ? 'bg-cyan-600 text-white'
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        }`}
                    >
                        {ratio}
                    </button>
                    ))}
                </div>
                <button
                  onClick={() => setIsCropModalOpen(true)}
                  disabled={!originalImage || isLoading}
                  className="w-full flex items-center justify-center p-3 text-sm font-semibold rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <CropIcon className="w-4 h-4 mr-2" />
                  Select Area
                </button>
                {crop && (
                   <div className="mt-3 text-xs text-center text-gray-400 p-2 bg-gray-700/50 rounded-md flex justify-between items-center">
                    <span>Crop applied: {crop.width}x{crop.height}px</span>
                    <button onClick={() => setCrop(null)} className="font-semibold text-red-400 hover:text-red-300">Clear</button>
                   </div>
                )}
            </div>

            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-cyan-400 mb-4">3. Change Background</h2>
              <input
                type="text"
                value={backgroundPrompt}
                onChange={(e) => setBackgroundPrompt(e.target.value)}
                placeholder="e.g., 'a sunny beach with palm trees'"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors placeholder-gray-400"
                disabled={isLoading}
              />
               <button
                  onClick={handleBackgroundChange}
                  disabled={isBackgroundChangeDisabled}
                  className="w-full mt-3 flex items-center justify-center px-6 py-3 border border-transparent text-md font-semibold rounded-xl text-white bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 transition-all"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner className="w-5 h-5 mr-3" />
                      <span>Applying...</span>
                    </>
                  ) : (
                    <>
                      <LandscapeIcon className="w-5 h-5 mr-3" />
                      <span>Change Background</span>
                    </>
                  )}
                </button>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-cyan-400 mb-4">4. Advanced Edit <span className="text-sm text-gray-400 font-normal">(Optional)</span></h2>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., 'add a wizard hat to the cat'"
                className="w-full h-24 p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors placeholder-gray-400"
                disabled={isLoading}
              />
               <div className="mt-3">
                <GenerateButton
                  onClick={handleGenerate}
                  isLoading={isLoading}
                  disabled={isGenerateDisabled}
                />
              </div>
            </div>

             {error && <div className="mt-4"><Alert message={error} /></div>}
            
          </div>

          <div className="lg:col-span-8 bg-gray-800 rounded-xl p-6 shadow-lg">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ImageViewer title="Original" imageUrl={originalImage} isLoading={false} />
                <ImageViewer 
                  title="Edited" 
                  imageUrl={editedImage} 
                  isLoading={isLoading} 
                  controls={imageControls} 
                  activeFilter={activeFilter}
                  brightness={brightness}
                  contrast={contrast}
                  saturation={saturation}
                  exposure={exposure}
                  vignette={vignette}
                  temperature={temperature}
                />
             </div>
              {editedImage && (
                <FilterSelector 
                  activeFilter={activeFilter} 
                  onSelectFilter={createAdjustmentHandler(setActiveFilter)}
                  disabled={isLoading}
                  brightness={brightness}
                  onBrightnessChange={createAdjustmentHandler(setBrightness)}
                  contrast={contrast}
                  onContrastChange={createAdjustmentHandler(setContrast)}
                  saturation={saturation}
                  onSaturationChange={createAdjustmentHandler(setSaturation)}
                  exposure={exposure}
                  onExposureChange={createAdjustmentHandler(setExposure)}
                  vignette={vignette}
                  onVignetteChange={createAdjustmentHandler(setVignette)}
                  temperature={temperature}
                  onTemperatureChange={createAdjustmentHandler(setTemperature)}
                  isAutoEnhanced={isAutoEnhanced}
                  onAutoEnhanceToggle={handleAutoEnhanceToggle}
                />
              )}
             {editedText && (
                <div className="mt-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                    <h3 className="font-semibold text-cyan-400 mb-2">AI Response:</h3>
                    <p className="text-gray-300 whitespace-pre-wrap">{editedText}</p>
                </div>
             )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
