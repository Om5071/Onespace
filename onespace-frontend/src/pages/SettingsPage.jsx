import React, { useState, useEffect } from 'react';
import { settingsApi } from '../api/settingsApi';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Loader } from '../components/common/Loader';
import {
  User,
  Shield,
  Bell,
  Clock,
  Dumbbell,
  Database,
  Download,
  Trash2,
  Save
} from 'lucide-react';

export const SettingsPage = () => {
  const { user, setUser, updateUserData, logout } = useAuth();
  const { addToast, subscribeToPush, unsubscribeFromPush, sendTestPush, isPushSubscribed } = useNotification();

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile Form
  const [profileData, setProfileData] = useState({
    name: '',
    bio: ''
  });

  // Password Form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Settings Object
  const [settings, setSettings] = useState({
    notificationPrefs: {
      email: true,
      push: true,
      sound: true,
      taskReminders: true,
      eventReminders: true,
      goalAlerts: true
    },
    reminderDefaults: {
      defaultMinutesBefore: 15,
      autoSnoozeMinutes: 15
    },
    fitnessPrefs: {
      unit: 'kg',
      dailyStepGoal: 10000,
      dailyWaterGoalMl: 2500
    },
    dataPrefs: {
      autoBackup: true,
      dateFormat: 'YYYY-MM-DD'
    }
  });

  const fetchSettings = async () => {
    try {
      const res = await settingsApi.getSettings();
      if (res.success && res.data) {
        setSettings((prev) => ({
          ...prev,
          ...res.data,
          notificationPrefs: { ...prev.notificationPrefs, ...(res.data.notificationPrefs || {}) },
          reminderDefaults: { ...prev.reminderDefaults, ...(res.data.reminderDefaults || {}) },
          fitnessPrefs: { ...prev.fitnessPrefs, ...(res.data.fitnessPrefs || {}) },
          dataPrefs: { ...prev.dataPrefs, ...(res.data.dataPrefs || {}) }
        }));
      }
      if (user) {
        setProfileData({
          name: user.name || '',
          bio: user.bio || ''
        });
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await settingsApi.updateProfile(profileData);
      if (res.success) {
        const updatedUser = res.data?.user || res.data;
        if (updateUserData) {
          updateUserData(updatedUser);
        } else if (setUser) {
          setUser((prev) => ({ ...prev, ...updatedUser }));
        }
        addToast('Profile updated successfully', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      addToast('New passwords do not match', 'error');
      return;
    }
    setSaving(true);
    try {
      await settingsApi.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      addToast('Password updated successfully', 'success');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      addToast(err.message || 'Failed to change password', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettingsObj = async (section) => {
    setSaving(true);
    try {
      await settingsApi.updateSettings(settings);
      addToast(`${section} preferences saved`, 'success');
    } catch (err) {
      addToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = () => {
    window.open(settingsApi.exportDataUrl(), '_blank');
  };

  const handleDeleteAccount = async () => {
    const confirmation = prompt('Type "DELETE" to permanently delete your account and all data:');
    if (confirmation === 'DELETE') {
      try {
        await settingsApi.deleteAccount();
        addToast('Account deleted', 'info');
        logout();
      } catch (err) {
        addToast('Failed to delete account', 'error');
      }
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'password', label: 'Security & Password', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'reminders', label: 'Reminders', icon: Clock },
    { id: 'fitness', label: 'Fitness & Health', icon: Dumbbell },
    { id: 'data', label: 'Data & Backup', icon: Database }
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">User Settings</h1>
        <p className="text-xs text-slate-400 mt-0.5">Customize your personal profile, notifications, and preferences</p>
      </div>

      {loading ? (
        <Loader size="lg" text="Loading settings..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          {/* Navigation Sidebar */}
          <div className="bg-[#101726] rounded-2xl p-2 border border-slate-800 shadow-xs space-y-1">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-400 border border-blue-500/30'
                      : 'text-slate-400 hover:bg-[#1A243B] hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Panel */}
          <div className="md:col-span-3 bg-[#101726] rounded-2xl p-6 border border-slate-800 shadow-xs">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <h2 className="text-sm font-bold text-white pb-2 border-b border-slate-800">
                  Profile Information
                </h2>

                <Input
                  label="Display Name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  required
                />

                <Input label="Email Address" value={user?.email || ''} disabled helperText="Email cannot be changed" />

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Bio / Personal Mantra
                  </label>
                  <textarea
                    rows={3}
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-[#131D31] px-3 py-2 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" variant="primary" icon={Save} loading={saving}>
                    Save Profile
                  </Button>
                </div>
              </form>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <h2 className="text-sm font-bold text-white pb-2 border-b border-slate-800">
                  Change Password
                </h2>

                <Input
                  label="Current Password"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                />

                <Input
                  label="New Password"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                />

                <div className="flex justify-end pt-2">
                  <Button type="submit" variant="primary" icon={Shield} loading={saving}>
                    Update Password
                  </Button>
                </div>
              </form>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-white pb-2 border-b border-slate-800">
                  Notification Preferences
                </h2>

                <div className="space-y-3">
                  {[
                    { key: 'email', label: 'Email Notifications', desc: 'Receive summaries and alert digests via email' },
                    { key: 'push', label: 'Browser & Windows Desktop Push Notifications', desc: 'Real-time native OS alert prompts even when minimized' },
                    { key: 'sound', label: 'In-App Sound Alerts', desc: 'Play notification chime when reminders trigger' },
                    { key: 'taskReminders', label: 'Task Due Reminders', desc: 'Alerts when tasks approach deadlines' },
                    { key: 'goalAlerts', label: 'Goal Milestone Celebrations', desc: 'Pop confetti on milestone completions' }
                  ].map((item) => (
                    <label key={item.key} className="flex items-center justify-between p-3 rounded-xl bg-[#131D31] border border-slate-800/80 cursor-pointer hover:border-slate-700 transition-colors">
                      <div>
                        <p className="text-xs font-semibold text-slate-100">{item.label}</p>
                        <p className="text-[11px] text-slate-400">{item.desc}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={!!settings.notificationPrefs[item.key]}
                        onChange={async (e) => {
                          const checked = e.target.checked;
                          setSettings((prev) => ({
                            ...prev,
                            notificationPrefs: { ...prev.notificationPrefs, [item.key]: checked }
                          }));
                          if (item.key === 'push') {
                            if (checked) {
                              await subscribeToPush();
                            } else {
                              await unsubscribeFromPush();
                            }
                          }
                        }}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                    </label>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800 flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    icon={Bell}
                    onClick={sendTestPush}
                  >
                    Test Desktop Notification
                  </Button>

                  <Button variant="primary" icon={Save} loading={saving} onClick={() => handleSaveSettingsObj('Notification')}>
                    Save Notifications
                  </Button>
                </div>
              </div>
            )}

            {/* Reminders Tab */}
            {activeTab === 'reminders' && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-white pb-2 border-b border-slate-800">
                  Reminder Defaults
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Default Minutes Before Event
                    </label>
                    <input
                      type="number"
                      value={settings.reminderDefaults.defaultMinutesBefore}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          reminderDefaults: { ...prev.reminderDefaults, defaultMinutesBefore: Number(e.target.value) }
                        }))
                      }
                      className="w-full h-9 rounded-xl border border-slate-700 bg-[#131D31] px-3 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Auto-Snooze Duration (mins)
                    </label>
                    <input
                      type="number"
                      value={settings.reminderDefaults.autoSnoozeMinutes}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          reminderDefaults: { ...prev.reminderDefaults, autoSnoozeMinutes: Number(e.target.value) }
                        }))
                      }
                      className="w-full h-9 rounded-xl border border-slate-700 bg-[#131D31] px-3 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button variant="primary" icon={Save} loading={saving} onClick={() => handleSaveSettingsObj('Reminder')}>
                    Save Reminders
                  </Button>
                </div>
              </div>
            )}

            {/* Fitness Tab */}
            {activeTab === 'fitness' && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-white pb-2 border-b border-slate-800">
                  Fitness Preferences
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Daily Step Goal
                    </label>
                    <input
                      type="number"
                      value={settings.fitnessPrefs.dailyStepGoal}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          fitnessPrefs: { ...prev.fitnessPrefs, dailyStepGoal: Number(e.target.value) }
                        }))
                      }
                      className="w-full h-9 rounded-xl border border-slate-700 bg-[#131D31] px-3 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Daily Water Goal (ml)
                    </label>
                    <input
                      type="number"
                      value={settings.fitnessPrefs.dailyWaterGoalMl}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          fitnessPrefs: { ...prev.fitnessPrefs, dailyWaterGoalMl: Number(e.target.value) }
                        }))
                      }
                      className="w-full h-9 rounded-xl border border-slate-700 bg-[#131D31] px-3 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button variant="primary" icon={Save} loading={saving} onClick={() => handleSaveSettingsObj('Fitness')}>
                    Save Fitness Prefs
                  </Button>
                </div>
              </div>
            )}

            {/* Data & Backup Tab */}
            {activeTab === 'data' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-sm font-bold text-white pb-2 border-b border-slate-800">
                    Data Export & Backup
                  </h2>
                  <p className="text-xs text-slate-400 mt-2">
                    Download a full offline JSON bundle containing all your tasks, notes, workouts, reminders, and documents.
                  </p>
                  <Button variant="secondary" icon={Download} className="mt-3" onClick={handleExportData}>
                    Download Data Export (.JSON)
                  </Button>
                </div>

                <div className="pt-6 border-t border-rose-950/60 space-y-3">
                  <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider">Danger Zone</h3>
                  <p className="text-xs text-slate-400">
                    Permanently delete your account and all associated personal data from OneSpace.
                  </p>
                  <Button variant="danger" icon={Trash2} onClick={handleDeleteAccount}>
                    Delete Account
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
