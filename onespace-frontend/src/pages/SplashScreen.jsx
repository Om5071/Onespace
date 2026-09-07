import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layers } from 'lucide-react';

export const SplashScreen = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Smooth progress animation over 3 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 60); // 50 steps * 60ms = 3000ms

    // Navigate after 3 seconds
    const timer = setTimeout(() => {
      sessionStorage.setItem('onespace_splash_shown', 'true');
      const hasToken = !!localStorage.getItem('onespace_access_token');
      if (isAuthenticated || hasToken) {
        navigate('/', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0F19] text-white relative overflow-hidden select-none">
      {/* Subtle Background Glow Elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.08)_0%,rgba(11,15,25,0)_70%)] pointer-events-none" />

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-sm w-full animate-fade-in">
        {/* Prominent OneSpace Logo */}
        <div className="relative mb-6 group">
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl blur-md opacity-60 group-hover:opacity-100 transition-opacity duration-1000 animate-pulse" />
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/30 border border-white/20">
            <Layers className="w-12 h-12 sm:w-14 sm:h-14 text-white drop-shadow-md" />
          </div>
        </div>

        {/* Brand Text */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          One<span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">Space</span>
        </h1>

        {/* Tagline */}
        <p className="text-sm sm:text-base text-slate-400 font-medium mt-2 tracking-wide">
          Your Personal Workspace
        </p>

        {/* Subtle Modern Progress Bar */}
        <div className="w-48 sm:w-56 h-1.5 bg-slate-800/80 rounded-full overflow-hidden mt-10 border border-slate-700/50 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-75 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Status Text */}
        <span className="text-[11px] text-slate-500 font-medium mt-3 tracking-wider uppercase">
          Initializing Workspace...
        </span>
      </div>
    </div>
  );
};
