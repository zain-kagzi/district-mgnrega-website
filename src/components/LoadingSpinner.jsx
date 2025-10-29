// src/components/LoadingSpinner.jsx
'use client';

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-600 text-center">{message}</p>
    </div>
  );
}