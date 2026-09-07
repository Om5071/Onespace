import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div
        className="fixed inset-0 bg-[#0B0F19]/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={`relative z-10 my-auto flex w-full flex-col ${maxWidth} max-h-[min(90vh,calc(100dvh-2rem))] rounded-2xl border border-slate-800/80 bg-[#101726]/95 shadow-[0_28px_80px_rgba(2,6,23,0.72)] backdrop-blur-xl text-slate-100`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-800/80 px-5 sm:px-6 pt-5 pb-3">
          <h3 className="text-base font-semibold text-white tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100 cursor-pointer transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 sm:px-6 pt-4 pb-5">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};
