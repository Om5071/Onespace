import React, { useState, useEffect } from 'react';
import { goalApi } from '../api/goalApi';
import { useNotification } from '../context/NotificationContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { Loader } from '../components/common/Loader';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { formatDate } from '../utils/formatDate';
import {
  Target,
  Plus,
  Trophy,
  CheckCircle2,
  Trash2,
  Edit2,
  TrendingUp,
  Award
} from 'lucide-react';

export const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Goal Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Career',
    timeframe: 'medium_term',
    targetDate: '',
    metrics: { targetValue: 100, currentValue: 0, unit: '%' }
  });

  // Check-in / Progress Modal
  const [checkInGoal, setCheckInGoal] = useState(null);
  const [progressValue, setProgressValue] = useState(0);
  const [progressNote, setProgressNote] = useState('');

  const { addToast } = useNotification();

  const fetchGoals = async () => {
    try {
      const res = await goalApi.getGoals();
      if (res.success) {
        const list = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.goals)
          ? res.data.goals
          : [];
        setGoals(list);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load goals', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleSaveGoal = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    // Ensure targetDate fallback to 30 days from now if not explicitly set
    const fallbackDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const payload = {
      ...formData,
      targetDate: formData.targetDate || fallbackDate
    };

    try {
      if (editingGoal) {
        await goalApi.updateGoal(editingGoal._id, payload);
        addToast('Goal updated', 'success');
      } else {
        await goalApi.createGoal(payload);
        addToast('New goal set', 'success');
      }
      setIsModalOpen(false);
      fetchGoals();
    } catch (err) {
      addToast(err.message || 'Failed to save goal', 'error');
    }
  };

  const handleLogProgress = async (e) => {
    e.preventDefault();
    if (!checkInGoal) return;

    try {
      await goalApi.logProgress(checkInGoal._id, {
        valueAdded: Number(progressValue),
        notes: progressNote
      });
      addToast('Goal progress updated', 'success');
      setCheckInGoal(null);
      fetchGoals();
    } catch (err) {
      addToast(err.message || 'Failed to log progress', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this goal permanently?')) return;
    try {
      await goalApi.deleteGoal(id);
      setGoals((prev) => (Array.isArray(prev) ? prev : []).filter((g) => g._id !== id));
      addToast('Goal removed', 'success');
    } catch (err) {
      addToast('Failed to delete goal', 'error');
    }
  };

  const openCreateModal = () => {
    setEditingGoal(null);
    setFormData({
      title: '',
      description: '',
      category: 'Career',
      timeframe: 'medium_term',
      targetDate: '',
      metrics: { targetValue: 100, currentValue: 0, unit: '%' }
    });
    setIsModalOpen(true);
  };

  const openEditModal = (g) => {
    if (!g) return;
    setEditingGoal(g);
    let dateStr = '';
    if (g.targetDate) {
      const parsed = new Date(g.targetDate);
      if (!isNaN(parsed.getTime())) {
        dateStr = parsed.toISOString().split('T')[0];
      }
    }
    setFormData({
      title: g.title || '',
      description: g.description || '',
      category: g.category || 'Career',
      timeframe: g.timeframe || 'medium_term',
      targetDate: dateStr,
      metrics: g.metrics || { targetValue: 100, currentValue: 0, unit: '%' }
    });
    setIsModalOpen(true);
  };

  const safeGoals = Array.isArray(goals) ? goals : [];
  const activeGoals = safeGoals.filter((g) => g && g.status !== 'completed');
  const completedGoals = safeGoals.filter((g) => g && g.status === 'completed');

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Goals & Milestones</h1>
          <p className="text-xs text-slate-400 mt-0.5">Track progress on short, medium, and long-term life objectives</p>
        </div>

        <Button variant="primary" icon={Plus} onClick={openCreateModal}>
          New Goal
        </Button>
      </div>

      {loading ? (
        <Loader size="lg" text="Loading goals..." />
      ) : safeGoals.length === 0 ? (
        <div className="text-center py-16 bg-[#101726] rounded-2xl border border-dashed border-slate-800">
          <Target className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <h3 className="text-sm font-semibold text-slate-300">No active goals</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Set ambitious targets with measurable milestones and track your journey.
          </p>
          <Button variant="primary" size="sm" icon={Plus} className="mt-4" onClick={openCreateModal}>
            Create Goal
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Active Goals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeGoals.map((g) => {
              const pct = g.progressPercent ?? 0;
              const timeframeText = (g.timeframe || 'medium_term').replace('_', ' ');
              return (
                <div
                  key={g._id}
                  className="bg-[#101726] rounded-2xl p-5 border border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="brand" size="xs">
                          {g.category || 'General'}
                        </Badge>
                        <span className="text-[10px] text-slate-400 capitalize">{timeframeText}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEditModal(g)} className="p-1 text-slate-400 hover:text-blue-400">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(g._id)} className="p-1 text-slate-400 hover:text-rose-400">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-bold text-sm text-white">{g.title}</h3>
                    {g.description && <p className="text-xs text-slate-400 line-clamp-2">{g.description}</p>}
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-400">
                        {g.metrics?.currentValue ?? 0} / {g.metrics?.targetValue ?? 100} {g.metrics?.unit || ''}
                      </span>
                      <span className="text-blue-400 font-bold">{pct}%</span>
                    </div>

                    <ProgressBar progress={pct} color="bg-gradient-to-r from-blue-600 to-purple-600" />

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[10px] text-slate-500">
                        {g.targetDate ? `Target: ${formatDate(g.targetDate)}` : 'No deadline'}
                      </span>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setCheckInGoal(g);
                          setProgressValue(g.metrics?.currentValue ?? 0);
                          setProgressNote('');
                        }}
                      >
                        Update Progress
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Completed Goals Trophy Case */}
          {completedGoals.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Trophy className="w-4 h-4" /> Achieved Milestones ({completedGoals.length})
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {completedGoals.map((cg) => (
                  <div
                    key={cg._id}
                    className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-800/50 flex items-center gap-3 shadow-xs"
                  >
                    <Award className="w-8 h-8 text-emerald-400 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate">{cg.title}</p>
                      <p className="text-[10px] text-emerald-300">100% Completed</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Goal Create/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingGoal ? 'Edit Goal' : 'Create Goal'}>
        <form onSubmit={handleSaveGoal} className="space-y-4">
          <Input
            label="Goal Title"
            placeholder="e.g. Read 20 books, Save $5000, Learn Rust..."
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="Why this goal matters and what success looks like..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-[#131D31] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Category"
              placeholder="Career, Finance, Health, Personal"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
            <Input
              label="Target Date"
              type="date"
              value={formData.targetDate}
              onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Current Value"
              type="number"
              value={formData.metrics.currentValue}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  metrics: { ...formData.metrics, currentValue: Number(e.target.value) }
                })
              }
            />
            <Input
              label="Target Value"
              type="number"
              value={formData.metrics.targetValue}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  metrics: { ...formData.metrics, targetValue: Number(e.target.value) }
                })
              }
            />
            <Input
              label="Unit"
              placeholder="%, INR, pages"
              value={formData.metrics.unit}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  metrics: { ...formData.metrics, unit: e.target.value }
                })
              }
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingGoal ? 'Save Changes' : 'Set Goal'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Check-In Progress Modal */}
      {checkInGoal && (
        <Modal isOpen={!!checkInGoal} onClose={() => setCheckInGoal(null)} title={`Update: ${checkInGoal.title}`}>
          <form onSubmit={handleLogProgress} className="space-y-4">
            <Input
              label={`Current Progress (${checkInGoal.metrics?.unit || 'Units'})`}
              type="number"
              value={progressValue}
              onChange={(e) => setProgressValue(e.target.value)}
              required
              autoFocus
            />

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Check-in Notes / Milestone Log
              </label>
              <textarea
                rows={3}
                placeholder="What did you achieve in this step?"
                value={progressNote}
                onChange={(e) => setProgressNote(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-[#131D31] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
              <Button type="button" variant="ghost" onClick={() => setCheckInGoal(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Progress
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default GoalsPage;
