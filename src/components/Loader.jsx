import React from "react";

export default function Loader() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      {/* Loader Container */}
      <div className="relative w-full h-full flex items-center justify-center bg-opacity-50 bg-gray-800">
        {/* Animated GIF */}
        <img
          src="/beauty.gif" // Path to the GIF in public/k
          alt="Loading..."
          className="w-48 h-48 sm:w-64 sm:h-64 object-contain animate-pulse"
        />
        {/* Optional Loading Text */}
        <div className="absolute text-white text-lg sm:text-xl font-semibold mt-4 sm:mt-6 animate-pulse">
          Loading, please wait...
        </div>
      </div>
    </div>
  );
}
