
import React from 'react';
import { MagicWandIcon } from './icons/MagicWandIcon';

export const Header: React.FC = () => {
  return (
    <header className="text-center">
        <div className="inline-flex items-center justify-center bg-gray-800 p-3 rounded-full mb-4 border-2 border-cyan-500/50">
            <MagicWandIcon className="w-10 h-10 text-cyan-400"/>
        </div>
      <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
        AI Photo Editor
      </h1>
      <p className="mt-3 text-lg text-gray-400 max-w-2xl mx-auto">
        Upload your image, describe the edits, and let Gemini bring your vision to life.
      </p>
    </header>
  );
};
