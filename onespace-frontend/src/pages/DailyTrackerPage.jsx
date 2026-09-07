import React, { useState, useEffect, useRef, useCallback } from 'react';
import { dailyTrackerApi } from '../api/dailyActivityApi';
import { useNotification } from '../context/NotificationContext';
import { Button } from '../components/common/Button';
import { Loader } from '../components/common/Loader';
import { ProgressBar } from '../components/common/ProgressBar';
import { formatDate } from '../utils/formatDate';
import {
  Smile,
  Meh,
  Frown,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  TrendingUp,
  Save,
  Check,
  DollarSign
} from 'lucide-react';

export const DailyTrackerPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activity, setActivity] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved');

  // Form states
  const [mood, setMood] = useState('good');
  const [notes, setNotes] = useState('');
  const [habits, setHabits] = useState([]);
  const [newHabitName, setNewHabitName] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: 'Food' });

  const stateRef = useRef({
    date: selectedDate,
    mood: 'good',
    notes: '',
    habits: [],
    expenses: []
  });

  const autoSaveTimerRef = useRef(null);
  const { addToast } = useNotification();

  const persistDailyData = useCallback(async (dataToSave) => {
    const payload = dataToSave || stateRef.current;
    if (!payload.date) return;
    setSaving(true);
    setSaveStatus('saving');
    try {
      await dailyTrackerApi.createOrUpdateDailyActivity({
        date: payload.date,
        mood: payload.mood,
        notes: payload.notes,
        habits: payload.habits,
        expenses: payload.expenses
      });
      setSaveStatus('saved');
    } catch (err) {
      console.error('Save error:', err);
      setSaveStatus('unsaved');
    } finally {
      setSaving(false);
    }
  }, []);

  const triggerDebouncedSave = useCallback(() => {
    setSaveStatus('unsaved');
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      persistDailyData();
    }, 600);
  }, [persistDailyData]);

  const fetchDailyData = async (date) => {
    setLoading(true);
    try {
      const [resDay, resHist] = await Promise.all([
        dailyTrackerApi.getDailyActivity(date),
        dailyTrackerApi.getActivityHistory(14)
      ]);

      if (resDay.success && resDay.data) {
        const d = resDay.data;
        const currentMood = d.mood || 'good';
        const currentNotes = d.notes || d.journalEntry || '';
        const currentHabits = Array.isArray(d.habits) && d.habits.length > 0 ? d.habits : [
          { name: 'Morning Exercise / Stretching', isCompleted: false },
          { name: 'Drink 2L Water', isCompleted: false },
          { name: 'Read 20 mins', isCompleted: false },
          { name: 'Meditation / Mindfulness', isCompleted: false },
          { name: 'Plan Tomorrow Tasks', isCompleted: false }
        ];
        const currentExpenses = Array.isArray(d.expenses) ? d.expenses : [];

        setActivity(d);
        setMood(currentMood);
        setNotes(currentNotes);
        setHabits(currentHabits);
        setExpenses(currentExpenses);

        stateRef.current = {
          date,
          mood: currentMood,
          notes: currentNotes,
          habits: currentHabits,
          expenses: currentExpenses
        };
        setSaveStatus('saved');
      }
      if (resHist.success) {
        setHistory(Array.isArray(resHist.data) ? resHist.data : []);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load tracker data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyData(selectedDate);
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [selectedDate]);

  const handleMoodSelect = (mKey) => {
    setMood(mKey);
    stateRef.current.mood = mKey;
    persistDailyData();
  };

  const handleNotesChange = (val) => {
    setNotes(val);
    stateRef.current.notes = val;
    triggerDebouncedSave();
  };

  const handleToggleHabit = (idx) => {
    const updated = habits.map((h, i) => (i === idx ? { ...h, isCompleted: !h.isCompleted } : h));
    setHabits(updated);
    stateRef.current.habits = updated;
    persistDailyData({ ...stateRef.current, habits: updated });
  };

  const handleAddHabit = () => {
    if (!newHabitName.trim()) return;
    const updated = [...habits, { name: newHabitName.trim(), isCompleted: false }];
    setHabits(updated);
    setNewHabitName('');
    stateRef.current.habits = updated;
    persistDailyData({ ...stateRef.current, habits: updated });
    addToast('Habit added', 'success');
  };

  const handleRemoveHabit = (idx) => {
    const updated = habits.filter((_, i) => i !== idx);
    setHabits(updated);
    stateRef.current.habits = updated;
    persistDailyData({ ...stateRef.current, habits: updated });
  };

  const handleAddExpense = () => {
    if (!newExpense.description.trim() || !newExpense.amount) return;
    const expenseItem = {
      description: newExpense.description.trim(),
      amount: Math.abs(Number(newExpense.amount)),
      category: newExpense.category || 'General',
      date: selectedDate
    };
    const updated = [...expenses, expenseItem];
    setExpenses(updated);
    setNewExpense({ description: '', amount: '', category: 'Food' });
    stateRef.current.expenses = updated;
    persistDailyData({ ...stateRef.current, expenses: updated });
    addToast('Expense logged & saved', 'success');
  };

  const handleRemoveExpense = (idx) => {
    const updated = expenses.filter((_, i) => i !== idx);
    setExpenses(updated);
    stateRef.current.expenses = updated;
    persistDailyData({ ...stateRef.current, expenses: updated });
  };

  const totalExpense = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const completedHabits = habits.filter((h) => h.isCompleted).length;
  const habitPct = habits.length > 0 ? Math.round((completedHabits / habits.length) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Daily Tracker</h1>
          <p className="text-xs text-slate-400 mt-0.5">Track mood, habits, daily expenses, and personal reflections with instant auto-save</p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="h-9 px-3 text-xs font-semibold rounded-xl border border-slate-700 bg-[#101726] text-white shadow-xs focus:border-blue-500 focus:outline-none cursor-pointer"
          />

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#101726] border border-slate-800 text-xs">
            {saveStatus === 'saving' ? (
              <span className="text-amber-400 flex items-center gap-1 font-medium">Saving...</span>
            ) : saveStatus === 'unsaved' ? (
              <span className="text-blue-400 flex items-center gap-1 font-medium">Unsaved</span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                <Check className="w-3.5 h-3.5" /> Saved
              </span>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <Loader size="lg" text="Loading daily logs..." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main 2 Cols: Habits & Expenses */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mood Selector Card */}
            <div className="bg-[#101726] rounded-2xl p-5 border border-slate-800 shadow-xs space-y-3">
              <h2 className="text-sm font-bold text-white">How are you feeling today?</h2>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { key: 'great', label: 'Great', icon: '😄', color: 'border-emerald-500 text-emerald-400 bg-emerald-950/30' },
                  { key: 'good', label: 'Good', icon: '🙂', color: 'border-blue-500 text-blue-400 bg-blue-950/30' },
                  { key: 'neutral', label: 'Neutral', icon: '😐', color: 'border-slate-500 text-slate-300 bg-slate-800/40' },
                  { key: 'sad', label: 'Low', icon: '😔', color: 'border-indigo-500 text-indigo-400 bg-indigo-950/30' },
                  { key: 'stressed', label: 'Stressed', icon: '😫', color: 'border-rose-500 text-rose-400 bg-rose-950/30' }
                ].map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => handleMoodSelect(m.key)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      mood === m.key
                        ? `${m.color} ring-2 ring-blue-500/40 font-bold`
                        : 'border-slate-800 bg-[#131D31] text-slate-400 hover:bg-[#1A243B]'
                    }`}
                  >
                    <span className="text-xl sm:text-2xl block mb-1">{m.icon}</span>
                    <span className="text-[11px] block truncate">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Habits Checklist */}
            <div className="bg-[#101726] rounded-2xl p-5 border border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white">Daily Habit Check-in</h2>
                  <p className="text-[11px] text-slate-400">
                    {completedHabits} of {habits.length} habits completed ({habitPct}%)
                  </p>
                </div>
                <div className="w-28">
                  <ProgressBar progress={habitPct} color="bg-gradient-to-r from-blue-600 to-purple-600" />
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add custom habit (e.g. Read 20 mins, Meditate)..."
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddHabit())}
                  className="flex-1 rounded-xl border border-slate-700 bg-[#131D31] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
                <Button size="sm" variant="primary" icon={Plus} onClick={handleAddHabit}>
                  Add Habit
                </Button>
              </div>

              <div className="space-y-2">
                {habits.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 italic text-center">No habits added for this day.</p>
                ) : (
                  habits.map((h, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#131D31] border border-slate-800/80 hover:border-slate-700 transition-colors shadow-xs"
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleHabit(i)}
                        className="flex items-center gap-3 cursor-pointer text-left flex-1"
                      >
                        {h.isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-500 shrink-0" />
                        )}
                        <span className={`text-xs font-semibold ${h.isCompleted ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                          {h.name}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveHabit(i)}
                        className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                        title="Delete habit"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Daily Expense Logger */}
            <div className="bg-[#101726] rounded-2xl p-5 border border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-400" /> Daily Expense Tracker
                  </h2>
                  <p className="text-[11px] text-slate-400">Log daily purchases and see them auto-synced into your monthly analytics</p>
                </div>
                <span className="text-sm font-bold text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-xl border border-emerald-800/50">
                  Total: ${totalExpense.toFixed(2)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <input
                  type="text"
                  placeholder="Item description (e.g. Lunch, Grocery)"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  className="sm:col-span-2 rounded-xl border border-slate-700 bg-[#131D31] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Amount ($)"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  className="rounded-xl border border-slate-700 bg-[#131D31] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  className="rounded-xl border border-slate-700 bg-[#131D31] px-2 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="Food">Food & Dining</option>
                  <option value="Transport">Transport</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Bills">Bills & Utilities</option>
                  <option value="Health">Health & Wellness</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <Button size="sm" variant="primary" icon={Plus} onClick={handleAddExpense} className="w-full sm:w-auto">
                Add & Save Expense
              </Button>

              <div className="divide-y divide-slate-800/80 pt-2">
                {expenses.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 italic text-center">No expenses recorded for this date.</p>
                ) : (
                  expenses.map((e, i) => (
                    <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-slate-200">{e.description}</span>
                        <span className="text-[10px] text-slate-400 ml-2 bg-[#1A243B] px-1.5 py-0.5 rounded border border-slate-700/50">
                          {e.category || 'General'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-emerald-400">${Number(e.amount).toFixed(2)}</span>
                        <button onClick={() => handleRemoveExpense(i)} className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Daily Reflection Notes & Consistency Streak */}
          <div className="space-y-6">
            {/* Daily Journal / Reflection */}
            <div className="bg-[#101726] rounded-2xl p-5 border border-slate-800 shadow-xs space-y-3">
              <h2 className="text-sm font-bold text-white">Daily Reflection</h2>
              <p className="text-[11px] text-slate-400">Write key thoughts, accomplishments, or notes for the day (auto-saved).</p>
              <textarea
                rows={7}
                placeholder="What went well today? Key wins or thoughts..."
                value={notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-[#131D31] p-3 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            {/* 14-day Mood & Streak History */}
            <div className="bg-[#101726] rounded-2xl p-5 border border-slate-800 shadow-xs space-y-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" /> Recent Activity History
              </h2>
              <div className="grid grid-cols-7 gap-1.5 pt-2">
                {history.slice(0, 14).map((h, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedDate(new Date(h.date).toISOString().split('T')[0])}
                    className="p-2 rounded-xl bg-[#131D31] border border-slate-800 hover:border-slate-700 text-center cursor-pointer transition-colors shadow-xs"
                    title={`${formatDate(h.date)}: ${h.mood || 'logged'}`}
                  >
                    <span className="text-[9px] text-slate-400 block">{formatDate(h.date, 'MMM d')}</span>
                    <span className="text-sm mt-1 block">
                      {h.mood === 'great' ? '😄' : h.mood === 'good' ? '🙂' : h.mood === 'stressed' ? '😫' : h.mood === 'sad' ? '😔' : '😐'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyTrackerPage;
