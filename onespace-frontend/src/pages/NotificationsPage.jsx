import React, { useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { formatRelativeTime } from '../utils/formatDate';
import { Bell, CheckCheck, Clock, CheckCircle2, Circle, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NotificationsPage = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    hasNativePermission,
    isPushSubscribed,
    subscribeToPush,
    sendTestPush
  } = useNotification();
  const [filter, setFilter] = useState('all');

  const safeList = Array.isArray(notifications) ? notifications : [];
  const filtered = safeList.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Notification Center</h1>
          <p className="text-xs text-slate-400 mt-0.5">Stay updated on task alerts, reminders, and system events</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={Bell} onClick={sendTestPush}>
            Test Alert
          </Button>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" icon={CheckCheck} onClick={markAllAsRead}>
              Mark All as Read
            </Button>
          )}
        </div>
      </div>

      {/* Browser Notification Banner */}
      {(!hasNativePermission || !isPushSubscribed) && (
        <div className="p-4 rounded-2xl bg-[#101726] border border-blue-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-blue-400 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-white">Enable Real Windows & Browser Push Notifications</p>
              <p className="text-[11px] text-slate-400">Receive real-time desktop alert banners for reminders, calendar events, and task deadlines even when OneSpace is minimized.</p>
            </div>
          </div>
          <Button size="sm" variant="primary" onClick={subscribeToPush}>
            Enable Desktop Alerts
          </Button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            filter === 'all'
              ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            filter === 'unread'
              ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notification List */}
      <div className="bg-[#101726] rounded-2xl border border-slate-800 shadow-xs divide-y divide-slate-800/80 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-xs">
            <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
            No notifications in this view.
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n._id}
              className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                n.isRead ? 'bg-transparent' : 'bg-blue-950/20'
              }`}
            >
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 rounded-xl bg-blue-950/60 border border-blue-800/50 text-blue-400 shrink-0 mt-0.5">
                  <Bell className="w-4 h-4" />
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-semibold text-white">{n.title || n.message}</h4>
                    <Badge variant={n.type === 'reminder' ? 'warning' : 'brand'} size="xs">
                      {n.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-300">{n.message}</p>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {formatRelativeTime(n.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => (n.isRead ? markAsUnread(n._id) : markAsRead(n._id))}
                  className="p-1.5 text-slate-400 hover:text-blue-400 rounded-lg text-xs font-medium cursor-pointer"
                  title={n.isRead ? 'Mark as unread' : 'Mark as read'}
                >
                  {n.isRead ? <Circle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </button>
                {n.linkUrl && (
                  <Link
                    to={n.linkUrl}
                    className="px-2.5 py-1 bg-[#1A243B] hover:bg-[#23304E] text-slate-200 rounded-lg text-xs font-medium border border-slate-700/60"
                  >
                    Open
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
