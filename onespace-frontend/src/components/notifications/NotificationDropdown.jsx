import React, { useState, useRef, useEffect } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { Bell, CheckCheck, Clock, ExternalLink } from 'lucide-react';
import { formatRelativeTime } from '../../utils/formatDate';
import { Link } from 'react-router-dom';

export const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 text-slate-300 hover:bg-[#1A243B] hover:text-white rounded-xl transition-all cursor-pointer border border-transparent hover:border-slate-700 shadow-sm"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 px-1 text-[9px] font-bold text-white ring-2 ring-[#101726] animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#101726]/95 shadow-[0_24px_80px_rgba(2,6,23,0.6)] border border-slate-800 z-50 overflow-hidden text-slate-100 backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#131D31]/90">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-[10px] uppercase tracking-[0.18em] text-slate-300">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] bg-blue-950 text-blue-300 border border-blue-800/80 rounded-full font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[10px] text-blue-300 hover:text-blue-200 flex items-center gap-1 font-semibold cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No notifications right now.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => !n.isRead && markAsRead(n._id)}
                  className={`p-3.5 transition-colors flex items-start justify-between gap-3 cursor-pointer ${
                    n.isRead
                      ? 'bg-transparent hover:bg-[#131D31]/60'
                      : 'bg-blue-950/20 hover:bg-blue-950/30 border-l-2 border-blue-500'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">
                      {n.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                      {n.message}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatRelativeTime(n.createdAt)}
                    </p>
                  </div>
                  {n.linkUrl && (
                    <Link
                      to={n.linkUrl}
                      onClick={() => setIsOpen(false)}
                      className="text-slate-400 hover:text-blue-400 p-1 rounded-md hover:bg-slate-800/70"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="p-2 border-t border-slate-800 bg-[#0B0F19] text-center">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-blue-300 hover:text-blue-200 block py-1.5"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
