
import React from 'react';
import { WarningIcon } from './icons/WarningIcon';

interface AlertProps {
  message: string;
}

export const Alert: React.FC<AlertProps> = ({ message }) => {
  return (
    <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative" role="alert">
      <div className="flex items-center">
        <WarningIcon className="w-5 h-5 mr-3" />
        <span className="block sm:inline">{message}</span>
      </div>
    </div>
  );
};
