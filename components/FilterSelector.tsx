
import React from 'react';
import { WandSparklesIcon } from './icons/WandSparklesIcon';

const FILTERS = ['None', 'Grayscale', 'Sepia', 'Invert', 'Vintage', 'Sharpen'];

// A reusable slider component for image adjustments.
interface SliderProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step: number;
    disabled: boolean;
    displayValue?: string;
}

const AdjustmentSlider: React.FC<SliderProps> = ({ label, value, onChange, min, max, step, disabled, displayValue }) => (
    <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
            <label htmlFor={label} className="font-medium text-gray-300">{label}</label>
            <span className="px-2 py-1 text-xs rounded-md bg-gray-800 text-cyan-400 font-mono">{displayValue ?? `${value}%`}</span>
        </div>
        <input
            id={label}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value, 10))}
            disabled={disabled}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500
                       [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:transition-transform
                       [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-cyan-500 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-none"
        />
    </div>
);

interface FilterSelectorProps {
    activeFilter: string;
    onSelectFilter: (filter: string) => void;
    disabled: boolean;
    brightness: number;
    onBrightnessChange: (value: number) => void;
    contrast: number;
    onContrastChange: (value: number) => void;
    saturation: number;
    onSaturationChange: (value: number) => void;
    exposure: number;
    onExposureChange: (value: number) => void;
    vignette: number;
    onVignetteChange: (value: number) => void;
    temperature: number;
    onTemperatureChange: (value: number) => void;
    isAutoEnhanced: boolean;
    onAutoEnhanceToggle: () => void;
}

export const FilterSelector: React.FC<FilterSelectorProps> = ({ 
    activeFilter, 
    onSelectFilter, 
    disabled,
    brightness,
    onBrightnessChange,
    contrast,
    onContrastChange,
    saturation,
    onSaturationChange,
    exposure,
    onExposureChange,
    vignette,
    onVignetteChange,
    temperature,
    onTemperatureChange,
    isAutoEnhanced,
    onAutoEnhanceToggle
}) => {
    return (
        <div className="mt-6 space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-300 mb-3">5. Final Touches</h3>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={onAutoEnhanceToggle}
                        disabled={disabled}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 ${
                            isAutoEnhanced
                                ? 'bg-cyan-600 text-white'
                                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        }`}
                        >
                        <WandSparklesIcon className="w-4 h-4" />
                        Auto Enhance
                    </button>
                    <div className="h-5 w-px bg-gray-600 mx-2"></div>
                    {FILTERS.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => onSelectFilter(filter)}
                            disabled={disabled}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 ${
                                activeFilter === filter
                                    ? 'bg-cyan-600 text-white'
                                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                            }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 pt-4 border-t border-gray-700/50">
               <AdjustmentSlider
                    label="Brightness"
                    value={brightness}
                    onChange={onBrightnessChange}
                    min={0}
                    max={200}
                    step={1}
                    disabled={disabled}
                />
                 <AdjustmentSlider
                    label="Contrast"
                    value={contrast}
                    onChange={onContrastChange}
                    min={0}
                    max={200}
                    step={1}
                    disabled={disabled}
                />
                 <AdjustmentSlider
                    label="Saturation"
                    value={saturation}
                    onChange={onSaturationChange}
                    min={0}
                    max={200}
                    step={1}
                    disabled={disabled}
                />
                 <AdjustmentSlider
                    label="Exposure"
                    value={exposure}
                    onChange={onExposureChange}
                    min={0}
                    max={200}
                    step={1}
                    disabled={disabled}
                />
                <AdjustmentSlider
                    label="Vignette"
                    value={vignette}
                    onChange={onVignetteChange}
                    min={0}
                    max={100}
                    step={1}
                    disabled={disabled}
                />
                 <AdjustmentSlider
                    label="Color Temp."
                    value={temperature}
                    onChange={onTemperatureChange}
                    min={0}
                    max={200}
                    step={1}
                    disabled={disabled}
                    displayValue={temperature === 100 ? 'Neutral' : (temperature > 100 ? `+${temperature-100}` : `${temperature-100}`)}
                />
            </div>
        </div>
    );
};
