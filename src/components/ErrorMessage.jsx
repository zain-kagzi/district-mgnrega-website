// src/components/ErrorMessage.jsx
'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="p-6 bg-red-50 border-2 border-red-200 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-800 mb-1">
            Error / त्रुटि
          </h3>
          <p className="text-red-700 mb-3">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retry / पुनः प्रयास करें
            </button>
          )}
        </div>
      </div>
    </div>
  );
}