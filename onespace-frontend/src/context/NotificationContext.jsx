import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { notificationApi } from '../api/notificationApi';
import { reminderApi } from '../api/reminderApi';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

// Helper to convert base64 url-safe string to Uint8Array for PushManager
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [isPushSubscribed, setIsPushSubscribed] = useState(false);
  const [swRegistration, setSwRegistration] = useState(null);
  const [hasNativePermission, setHasNativePermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission === 'granted' : false
  );

  const alertedReminderIdsRef = useRef(new Set());

  // Sound chime
  const playNotificationSound = () => {
    try {
      if (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {
      // Audio autoplay policy fallback
    }
  };

  // Register Service Worker on Load
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then(async (reg) => {
          setSwRegistration(reg);
          if ('Notification' in window && Notification.permission === 'granted') {
            setHasNativePermission(true);
            setIsPushSubscribed(true);
          }
          if ('pushManager' in reg) {
            try {
              const sub = await reg.pushManager.getSubscription();
              if (sub) setIsPushSubscribed(true);
            } catch (e) {
              // silent catch for pushManager checking
            }
          }
        })
        .catch((err) => {
          console.warn('[ServiceWorker] Registration notice:', err.message);
        });
    }
  }, []);

  // Request Native Permission & Web Push Subscription (Resilient 2-tier architecture)
  const subscribeToPush = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      addToast('Web Notifications not supported in this browser.', 'warning');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      setHasNativePermission(granted);

      if (!granted) {
        addToast('Notification permission was denied. Please allow notifications in browser site settings.', 'warning');
        return false;
      }

      // Try remote push gateway if supported
      try {
        let reg = swRegistration;
        if (!reg && 'serviceWorker' in navigator) {
          reg = await navigator.serviceWorker.ready;
          setSwRegistration(reg);
        }

        if (reg && 'pushManager' in reg) {
          const keyRes = await notificationApi.getVapidPublicKey();
          if (keyRes.success && keyRes.data?.publicKey) {
            const applicationServerKey = urlBase64ToUint8Array(keyRes.data.publicKey);
            let subscription = await reg.pushManager.getSubscription();
            if (!subscription) {
              subscription = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey
              });
            }

            if (subscription) {
              const subJson = subscription.toJSON();
              await notificationApi.subscribePush({
                endpoint: subJson.endpoint,
                keys: subJson.keys
              });
            }
          }
        }
      } catch (pushGateErr) {
        console.warn('[PushManager] Remote push service notice (native OS notifications active):', pushGateErr.message);
      }

      setIsPushSubscribed(true);
      showNativeNotification(
        '🔔 OneSpace Desktop Notifications Active',
        'You will now receive native Windows desktop alerts for reminders, events, and task deadlines.'
      );
      addToast('Desktop push notifications enabled!', 'success');
      return true;
    } catch (err) {
      console.error('[Push] Permission error:', err);
      addToast('Failed to enable notifications: ' + (err.message || 'Error'), 'error');
      return false;
    }
  };

  const unsubscribeFromPush = async () => {
    try {
      if (swRegistration && 'pushManager' in swRegistration) {
        try {
          const sub = await swRegistration.pushManager.getSubscription();
          if (sub) {
            await sub.unsubscribe();
            await notificationApi.unsubscribePush(sub.endpoint);
          }
        } catch (e) {
          // ignore pushManager error on unsubscribe
        }
      }
      setIsPushSubscribed(false);
      addToast('Desktop notifications disabled', 'info');
    } catch (err) {
      console.error('[Push] Unsubscribe error:', err);
    }
  };

  const sendTestPush = async () => {
    try {
      showNativeNotification(
        '🔔 OneSpace Windows Alert',
        'Real-time desktop notifications are working smoothly on your device!'
      );
      addToast('Test desktop notification sent! 🔔', 'success');

      // Dispatch backend test notification
      await notificationApi.sendTestPush().catch(() => {});
    } catch (err) {
      console.warn('Test push dispatch:', err);
    }
  };

  const showNativeNotification = (title, body, tag, targetUrl = '/notifications') => {
    playNotificationSound();
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const notificationOptions = {
          body,
          icon: '/favicon.svg',
          badge: '/favicon.svg',
          tag: tag || `onespace-${Date.now()}`,
          data: { url: targetUrl }
        };

        if (swRegistration && 'showNotification' in swRegistration) {
          swRegistration.showNotification(title, notificationOptions);
        } else {
          const n = new Notification(title, { ...notificationOptions, tag: tag || `onespace-${Date.now()}` });
          n.onclick = () => {
            window.focus();
            if (targetUrl && targetUrl.startsWith('/')) {
              window.location.href = targetUrl;
            }
            n.close();
          };
        }
      } catch (e) {
        console.error('Native notification error:', e);
      }
    }
  };

  const addToast = (message, type = 'info', title) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await notificationApi.getNotifications({ limit: 30 });
      if (res.success) {
        const list = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.notifications)
            ? res.data.notifications
            : [];
        setNotifications(list);
        setUnreadCount(typeof res.unreadCount === 'number' ? res.unreadCount : list.filter((n) => !n.isRead).length);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  }, [isAuthenticated]);

  // Periodic Reminder & Alert Checker (every 15s)
  const checkDueReminders = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await reminderApi.getReminders({ isCompleted: false });
      if (res.success && Array.isArray(res.data)) {
        const now = new Date().getTime();
        res.data.forEach((rem) => {
          const remTime = new Date(rem.remindAt || rem.reminderDate).getTime();
          if (!alertedReminderIdsRef.current.has(rem._id) && remTime <= now + 60000 && remTime >= now - 600000) {
            alertedReminderIdsRef.current.add(rem._id);
            showNativeNotification(
              `⏰ Reminder: ${rem.title}`,
              rem.relatedType ? `Related to ${rem.relatedType}` : 'Scheduled OneSpace alert',
              `rem-${rem._id}`
            );
            addToast(`⏰ Reminder: ${rem.title}`, 'warning', 'OneSpace Reminder');
          }
        });
      }
    } catch (err) {
      // silent background catch
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchNotifications();
    checkDueReminders();

    const interval = setInterval(() => {
      fetchNotifications();
      checkDueReminders();
    }, 15000);

    return () => clearInterval(interval);
  }, [isAuthenticated, fetchNotifications, checkDueReminders]);

  const markAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAsUnread = async (id) => {
    try {
      await notificationApi.markAsUnread(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: false } : n))
      );
      setUnreadCount((prev) => prev + 1);
    } catch (err) {
      console.error('Failed to mark as unread:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toasts,
        hasNativePermission,
        isPushSubscribed,
        subscribeToPush,
        unsubscribeFromPush,
        sendTestPush,
        showNativeNotification,
        addToast,
        removeToast,
        markAsRead,
        markAsUnread,
        markAllAsRead,
        refreshNotifications: fetchNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
