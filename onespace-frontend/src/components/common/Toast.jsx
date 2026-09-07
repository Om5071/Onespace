import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import { CheckCircle2, AlertCircle, Info, X, Bell, Clock } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useNotification();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl shadow-2xl border backdrop-blur-md transition-all animate-slide-in relative overflow-hidden ${
              isSuccess
                ? 'bg-[#101726]/95 border-emerald-500/50 text-slate-100 shadow-emerald-950/20'
                : isError
                ? 'bg-[#101726]/95 border-rose-500/50 text-slate-100 shadow-rose-950/20'
                : isWarning
                ? 'bg-[#101726]/95 border-amber-500/50 text-slate-100 shadow-amber-950/20'
                : 'bg-[#101726]/95 border-blue-500/50 text-slate-100 shadow-blue-950/20'
            }`}
          >
            {/* Left Accent Strip */}
            <div
              className={`absolute top-0 left-0 bottom-0 w-1 ${
                isSuccess
                  ? 'bg-emerald-500'
                  : isError
                  ? 'bg-rose-500'
                  : isWarning
                  ? 'bg-amber-500'
                  : 'bg-blue-500'
              }`}
            />

            {/* Icon */}
            <div className="mt-0.5 shrink-0">
              {isSuccess ? (
                <div className="w-6 h-6 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              ) : isError ? (
                <div className="w-6 h-6 rounded-lg bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400">
                  <AlertCircle className="w-3.5 h-3.5" />
                </div>
              ) : isWarning ? (
                <div className="w-6 h-6 rounded-lg bg-amber-950/60 border border-amber-800/60 flex items-center justify-center text-amber-400">
                  <Clock className="w-3.5 h-3.5" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-lg bg-blue-950/60 border border-blue-800/60 flex items-center justify-center text-blue-400">
                  <Bell className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            {/* Content Body */}
            <div className="flex-1 min-w-0 pr-2">
              <p className="text-xs font-bold text-white tracking-tight">
                {toast.title || (isSuccess ? 'Success' : isError ? 'Attention Required' : isWarning ? 'OneSpace Reminder' : 'OneSpace Update')}
              </p>
              <p className="text-xs text-slate-300 mt-0.5 leading-snug">{toast.message}</p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
