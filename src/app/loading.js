// src/app/loading.js
export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xl text-gray-700">लोड हो रहा है...</p>
        <p className="text-sm text-gray-500 mt-2">Loading...</p>
      </div>
    </div>
  );
}