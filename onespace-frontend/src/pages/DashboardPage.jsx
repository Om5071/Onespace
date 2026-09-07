import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardApi } from '../api/dashboardApi';
import { noteApi } from '../api/noteApi';
import { dailyTrackerApi } from '../api/dailyActivityApi';
import { useNotification } from '../context/NotificationContext';
import { Loader } from '../components/common/Loader';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { ProgressBar } from '../components/common/ProgressBar';
import { RecentNotes } from '../components/notes/RecentNotes';
import { formatDate, formatTime } from '../utils/formatDate';
import { Link } from 'react-router-dom';
import {
  CheckSquare,
  Clock,
  Calendar,
  Smile,
  Target,
  Plus,
  ArrowRight,
  TrendingUp,
  Dumbbell,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Circle
} from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [recentNotes, setRecentNotes] = useState([]);
  const [habitsList, setHabitsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useNotification();

  const fetchDashboardData = async () => {
    try {
      const [resDash, resNotes] = await Promise.all([
        dashboardApi.getDashboardSummary(),
        noteApi.getNotes()
      ]);
      if (resDash.success) {
        setData(resDash.data);
        const habits = Array.isArray(resDash.data?.todayHabits) && resDash.data.todayHabits.length > 0
          ? resDash.data.todayHabits
          : Array.isArray(resDash.data?.todayActivity?.habits)
          ? resDash.data.todayActivity.habits
          : [];
        setHabitsList(habits);
      }
      if (resNotes.success) {
        const noteList = Array.isArray(resNotes.data)
          ? resNotes.data
          : Array.isArray(resNotes.data?.notes)
          ? resNotes.data.notes
          : [];
        setRecentNotes(noteList);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleToggleHabit = async (idx) => {
    const updated = habitsList.map((h, i) => (i === idx ? { ...h, isCompleted: !h.isCompleted } : h));
    setHabitsList(updated);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      await dailyTrackerApi.createOrUpdateDailyActivity({
        date: todayStr,
        habits: updated
      });
      addToast(updated[idx].isCompleted ? 'Habit marked completed! 🎉' : 'Habit unchecked', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <Loader size="lg" text="Loading your personal workspace..." />;
  }

  const todayTasks = Array.isArray(data?.todayTasks) ? data.todayTasks : [];
  const pendingTasksCount = data?.stats?.pendingTasks ?? data?.pendingTasksCount ?? 0;
  const completedTasksCount = data?.stats?.completedTasks ?? data?.completedTasksCount ?? 0;
  const upcomingReminders = Array.isArray(data?.upcomingReminders) ? data.upcomingReminders : [];
  const todayEvents = Array.isArray(data?.todayEvents) ? data.todayEvents : [];
  const activeGoals = Array.isArray(data?.activeGoals) ? data.activeGoals : [];

  const totalTasks = pendingTasksCount + completedTasksCount;
  const taskProgress = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

  const notesToDisplay = recentNotes.length > 0 ? recentNotes : (Array.isArray(data?.recentNotes) ? data.recentNotes : []);

  return (
    <div className="space-y-6 animate-fade-in text-slate-100 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-500/10 border border-white/10 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <Badge variant="warning" size="xs" className="bg-white/20 text-white border-0">
            {formatDate(new Date(), 'EEEE, MMMM do, yyyy')}
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] || 'Member'}! 👋
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm">
            Your unified workspace for tasks, schedules, daily habits, expenses, and long-term milestones.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#101726] rounded-2xl p-4 border border-slate-800 shadow-xs flex items-center gap-4 hover:border-slate-700 transition-colors">
          <div className="p-3 bg-blue-950/60 text-blue-400 border border-blue-800/50 rounded-xl">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Pending Tasks</p>
            <p className="text-xl font-bold text-white mt-0.5">{pendingTasksCount}</p>
          </div>
        </div>

        <div className="bg-[#101726] rounded-2xl p-4 border border-slate-800 shadow-xs flex items-center gap-4 hover:border-slate-700 transition-colors">
          <div className="p-3 bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Task Completion</p>
            <p className="text-xl font-bold text-white mt-0.5">{taskProgress}%</p>
          </div>
        </div>

        <div className="bg-[#101726] rounded-2xl p-4 border border-slate-800 shadow-xs flex items-center gap-4 hover:border-slate-700 transition-colors">
          <div className="p-3 bg-amber-950/60 text-amber-400 border border-amber-800/50 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Due Reminders</p>
            <p className="text-xl font-bold text-white mt-0.5">{upcomingReminders.length}</p>
          </div>
        </div>

        <div className="bg-[#101726] rounded-2xl p-4 border border-slate-800 shadow-xs flex items-center gap-4 hover:border-slate-700 transition-colors">
          <div className="p-3 bg-purple-950/60 text-purple-400 border border-purple-800/50 rounded-xl">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Active Goals</p>
            <p className="text-xl font-bold text-white mt-0.5">{activeGoals.length}</p>
          </div>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Priority Tasks, Events, and Recent Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Tasks */}
          <div className="bg-[#101726] rounded-2xl p-5 border border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-blue-400" />
                <h2 className="font-bold text-sm text-white">Today's Priority Tasks</h2>
              </div>
              <Link to="/tasks" className="text-xs font-semibold text-blue-400 hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {todayTasks.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-xl bg-[#131D31]/40">
                No tasks due today. You are completely caught up!
              </div>
            ) : (
              <div className="space-y-2">
                {todayTasks.map((t) => (
                  <div
                    key={t._id}
                    className="p-3.5 rounded-xl bg-[#131D31] border border-slate-800/80 hover:border-slate-700 flex items-center justify-between transition-colors shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <div>
                        <h4 className="text-xs font-semibold text-white">{t.title}</h4>
                        <p className="text-[10px] text-slate-400">{t.dueTime ? `Due @ ${t.dueTime}` : 'Due Today'}</p>
                      </div>
                    </div>
                    <Badge variant={t.priority === 'urgent' ? 'danger' : t.priority === 'high' ? 'warning' : 'brand'} size="xs">
                      {t.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Today's Schedule & Events */}
          <div className="bg-[#101726] rounded-2xl p-5 border border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <h2 className="font-bold text-sm text-white">Today's Schedule & Events</h2>
              </div>
              <Link to="/calendar" className="text-xs font-semibold text-blue-400 hover:underline flex items-center gap-1">
                Calendar <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {todayEvents.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-xl bg-[#131D31]/40">
                No calendar events scheduled for today.
              </div>
            ) : (
              <div className="space-y-2">
                {todayEvents.map((e) => (
                  <div
                    key={e._id}
                    className="p-3 rounded-xl bg-[#131D31] border border-slate-800/80 flex items-center justify-between shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: e.color || '#3B82F6' }} />
                      <div>
                        <h4 className="text-xs font-semibold text-white">{e.title}</h4>
                        <p className="text-[10px] text-slate-400">
                          {formatTime(e.startDateTime || e.startTime)} - {formatTime(e.endDateTime || e.endTime)}
                        </p>
                      </div>
                    </div>
                    {e.location && (
                      <span className="text-[10px] text-slate-300 bg-[#1A243B] border border-slate-700/60 px-2 py-0.5 rounded-md">
                        {e.location}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Notes Component */}
          <div className="bg-[#101726] rounded-2xl p-5 border border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <h2 className="font-bold text-sm text-white">Recent Notes & Ideas</h2>
              </div>
              <Link to="/notes" className="text-xs font-semibold text-blue-400 hover:underline flex items-center gap-1">
                All Notes <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <RecentNotes notes={notesToDisplay} maxItems={4} showViewAll={false} />
          </div>
        </div>

        {/* Right Col: Habits + Reminders + Goals */}
        <div className="space-y-6">
          {/* Daily Habits Quick Widget with Interactive Check-in */}
          <div className="bg-[#101726] rounded-2xl p-5 border border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm text-white flex items-center gap-2">
                <Smile className="w-4 h-4 text-emerald-400" /> Today's Habits
              </h2>
              <Link to="/daily-tracker" className="text-xs font-semibold text-blue-400 hover:underline">
                Tracker
              </Link>
            </div>
            {habitsList.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No habits registered today.</p>
            ) : (
              <div className="space-y-2">
                {habitsList.map((h, i) => (
                  <div
                    key={i}
                    onClick={() => handleToggleHabit(i)}
                    className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-[#131D31] border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-colors shadow-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      {h.isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-500 shrink-0" />
                      )}
                      <span className={h.isCompleted ? 'line-through text-slate-500' : 'text-slate-200 font-medium'}>
                        {h.name}
                      </span>
                    </div>
                    <Badge variant={h.isCompleted ? 'success' : 'default'} size="xs">
                      {h.isCompleted ? 'Done' : 'Pending'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Reminders */}
          <div className="bg-[#101726] rounded-2xl p-5 border border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" /> Due Reminders
              </h2>
              <Link to="/reminders" className="text-xs font-semibold text-blue-400 hover:underline">
                All
              </Link>
            </div>
            {upcomingReminders.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No pending reminders.</p>
            ) : (
              <div className="space-y-2">
                {upcomingReminders.slice(0, 4).map((r) => (
                  <div key={r._id} className="p-2.5 rounded-xl bg-[#131D31] border border-slate-800/80 space-y-1 shadow-xs">
                    <p className="text-xs font-semibold text-white">{r.title}</p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" /> {formatDate(r.remindAt || r.reminderDate)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Goals Snapshot */}
          <div className="bg-[#101726] rounded-2xl p-5 border border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-400" /> Active Milestones
              </h2>
              <Link to="/goals" className="text-xs font-semibold text-blue-400 hover:underline">
                Goals
              </Link>
            </div>
            {activeGoals.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No active goals yet.</p>
            ) : (
              <div className="space-y-3">
                {activeGoals.slice(0, 3).map((g) => {
                  const pct = g.progressPercent ?? 0;
                  return (
                    <div key={g._id} className="space-y-1.5 bg-[#131D31] p-3 rounded-xl border border-slate-800/80 shadow-xs">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-200 truncate">{g.title}</span>
                        <span className="text-blue-400 font-bold">{pct}%</span>
                      </div>
                      <ProgressBar progress={pct} color="bg-gradient-to-r from-blue-600 to-purple-600" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
