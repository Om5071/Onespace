import React from 'react';

export const ProgressBar = ({ progress = 0, color = 'bg-gradient-to-r from-blue-600 to-purple-600', height = 'h-2', showLabel = false }) => {
  const clamped = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1 text-xs text-slate-400">
          <span>Progress</span>
          <span className="font-semibold text-white">{clamped}%</span>
        </div>
      )}
      <div className={`w-full bg-[#1A243B] rounded-full overflow-hidden border border-slate-800/80 ${height}`}>
        <div
          className={`${color} ${height} rounded-full transition-all duration-500 shadow-xs`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
