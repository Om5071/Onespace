import React from 'react';

export const Loader = ({ size = 'md', text = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3'
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 gap-3 text-center">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-slate-800 border-t-blue-500 border-r-purple-500`} />
      {text && <p className="text-xs text-slate-400 font-medium">{text}</p>}
    </div>
  );
};
