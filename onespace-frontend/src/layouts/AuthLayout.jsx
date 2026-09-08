import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { ToastContainer } from '../components/common/Toast';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[#0B0F19] text-white relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.06)_0%,rgba(11,15,25,0)_70%)] pointer-events-none" />

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 border border-white/10">
            <Layers className="w-5 h-5" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            One<span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">Space</span>
          </span>
        </Link>
        <p className="mt-2 text-xs sm:text-sm text-slate-400 font-medium">
          Your Personal Workspace
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-[#101726]/90 py-8 px-6 sm:px-8 shadow-2xl border border-slate-800/80 rounded-2xl backdrop-blur-md">
          <Outlet />
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};
