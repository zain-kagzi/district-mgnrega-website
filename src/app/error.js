// src/app/error.js
'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="inline-block p-4 bg-red-100 rounded-full mb-4">
            <AlertCircle className="w-16 h-16 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Something went wrong!
          </h1>
          <p className="text-lg text-gray-700">कुछ गलत हो गया!</p>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-800 font-mono">
            {error.message || 'An unexpected error occurred'}
          </p>
        </div>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again / पुनः प्रयास करें
          </button>
          <Link
            href="/"
            className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Go Home / होम पर जाएं
          </Link>
        </div>
      </div>
    </div>
  );
}