import React, { useState, useEffect } from 'react';
import { reminderApi } from '../api/reminderApi';
import { useNotification } from '../context/NotificationContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { Loader } from '../components/common/Loader';
import { Badge } from '../components/common/Badge';
import { formatDate, formatDateTime } from '../utils/formatDate';
import {
  Clock,
  Plus,
  CheckCheck,
  Trash2,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

export const RemindersPage = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    reminderDate: '',
    reminderTime: '09:00',
    relatedType: 'custom',
    recurrence: 'none'
  });

  const { addToast } = useNotification();

  const fetchReminders = async () => {
    try {
      const res = await reminderApi.getReminders();
      if (res.success) {
        const list = Array.isArray(res.data) ? res.data : (res.data?.reminders || []);
        setReminders(list);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load reminders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleCreateReminder = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.reminderDate) return;

    try {
      const dateTimeStr = `${formData.reminderDate}T${formData.reminderTime || '09:00'}`;
      await reminderApi.createReminder({
        ...formData,
        remindAt: new Date(dateTimeStr),
        reminderDate: new Date(dateTimeStr)
      });
      addToast('Reminder created', 'success');
      setIsModalOpen(false);
      fetchReminders();
    } catch (err) {
      addToast(err.message || 'Failed to create reminder', 'error');
    }
  };

  const handleComplete = async (id) => {
    try {
      await reminderApi.completeReminder(id);
      addToast('Reminder completed', 'success');
      fetchReminders();
    } catch (err) {
      addToast('Failed to complete reminder', 'error');
    }
  };

  const handleSnooze = async (id, minutes) => {
    try {
      await reminderApi.snoozeReminder(id, minutes);
      addToast(`Snoozed for ${minutes} minutes`, 'success');
      fetchReminders();
    } catch (err) {
      addToast('Failed to snooze reminder', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await reminderApi.deleteReminder(id);
      setReminders((prev) => prev.filter((r) => r._id !== id));
      addToast('Reminder deleted', 'success');
    } catch (err) {
      addToast('Failed to delete reminder', 'error');
    }
  };

  const now = new Date();
  const overdueReminders = reminders.filter((r) => new Date(r.remindAt || r.reminderDate) < now && !r.isCompleted && !r.isTriggered);
  const upcomingReminders = reminders.filter((r) => new Date(r.remindAt || r.reminderDate) >= now && !r.isCompleted);
  const completedReminders = reminders.filter((r) => r.isCompleted);

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Reminder Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">Time-based alerts across tasks, events, fitness, and goals</p>
        </div>

        <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
          Set Reminder
        </Button>
      </div>

      {loading ? (
        <Loader size="lg" text="Loading reminders..." />
      ) : reminders.length === 0 ? (
        <div className="text-center py-16 bg-[#101726] rounded-2xl border border-dashed border-slate-800">
          <Clock className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <h3 className="text-sm font-semibold text-slate-300">No active reminders</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Schedule a reminder to never miss a chore, deadline, or appointment.
          </p>
          <Button variant="primary" size="sm" icon={Plus} className="mt-4" onClick={() => setIsModalOpen(true)}>
            Create Reminder
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overdue Section */}
          {overdueReminders.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Overdue ({overdueReminders.length})
              </h2>
              <div className="space-y-2">
                {overdueReminders.map((r) => (
                  <div
                    key={r._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-rose-950/20 border border-rose-900/60 gap-3 shadow-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-rose-200">{r.title}</p>
                        <Badge variant="warning" size="xs">
                          {r.relatedType || 'custom'}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-rose-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatDateTime(r.remindAt || r.reminderDate)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="secondary" onClick={() => handleSnooze(r._id, 15)}>
                        Snooze 15m
                      </Button>
                      <Button size="sm" variant="primary" icon={CheckCheck} onClick={() => handleComplete(r._id)}>
                        Complete
                      </Button>
                      <button onClick={() => handleDelete(r._id)} className="p-1.5 text-slate-400 hover:text-rose-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Section */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-400" /> Upcoming Reminders ({upcomingReminders.length})
            </h2>

            {upcomingReminders.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 italic">No upcoming reminders.</p>
            ) : (
              <div className="space-y-2">
                {upcomingReminders.map((r) => (
                  <div
                    key={r._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-[#101726] border border-slate-800 shadow-xs gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-white">{r.title}</p>
                        <Badge variant="brand" size="xs">
                          {r.relatedType || 'custom'}
                        </Badge>
                        {r.recurrence !== 'none' && (
                          <Badge variant="default" size="xs">
                            {r.recurrence}
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" /> {formatDateTime(r.remindAt || r.reminderDate)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="secondary" onClick={() => handleSnooze(r._id, 60)}>
                        +1 Hour
                      </Button>
                      <Button size="sm" variant="outline" icon={CheckCheck} onClick={() => handleComplete(r._id)}>
                        Complete
                      </Button>
                      <button onClick={() => handleDelete(r._id)} className="p-1.5 text-slate-400 hover:text-rose-400 cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completed History Section */}
          {completedReminders.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Completed Reminders ({completedReminders.length})
              </h2>
              <div className="space-y-2">
                {completedReminders.slice(0, 5).map((r) => (
                  <div
                    key={r._id}
                    className="p-3 rounded-xl bg-[#131D31]/60 border border-slate-800 flex items-center justify-between opacity-75"
                  >
                    <span className="text-xs line-through text-slate-400">{r.title}</span>
                    <span className="text-[10px] text-slate-500">{formatDate(r.remindAt || r.reminderDate)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Reminder">
        <form onSubmit={handleCreateReminder} className="space-y-4">
          <Input
            label="Reminder Title"
            placeholder="e.g., Take vitamins, Pay electricity bill..."
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Date"
              type="date"
              value={formData.reminderDate}
              onChange={(e) => setFormData({ ...formData, reminderDate: e.target.value })}
              required
            />
            <Input
              label="Time"
              type="time"
              value={formData.reminderTime}
              onChange={(e) => setFormData({ ...formData, reminderTime: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Related Category
              </label>
              <select
                value={formData.relatedType}
                onChange={(e) => setFormData({ ...formData, relatedType: e.target.value })}
                className="w-full h-9 rounded-xl border border-slate-700 bg-[#131D31] px-3 text-xs text-white"
              >
                <option value="custom">Custom</option>
                <option value="task">Task</option>
                <option value="event">Event</option>
                <option value="fitness">Fitness</option>
                <option value="goal">Goal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Repeat
              </label>
              <select
                value={formData.recurrence}
                onChange={(e) => setFormData({ ...formData, recurrence: e.target.value })}
                className="w-full h-9 rounded-xl border border-slate-700 bg-[#131D31] px-3 text-xs text-white"
              >
                <option value="none">Does not repeat</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Set Reminder
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
