
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { LoadingSpinner } from './icons/LoadingSpinner';

interface GenerateButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled: boolean;
}

export const GenerateButton: React.FC<GenerateButtonProps> = ({ onClick, isLoading, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-center px-6 py-4 border border-transparent text-lg font-semibold rounded-xl text-white bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 transition-all duration-300 transform hover:scale-105 disabled:scale-100"
    >
      {isLoading ? (
        <>
          <LoadingSpinner className="w-6 h-6 mr-3" />
          <span>Generating...</span>
        </>
      ) : (
        <>
          <SparklesIcon className="w-6 h-6 mr-3" />
          <span>Generate</span>
        </>
      )}
    </button>
  );
};
