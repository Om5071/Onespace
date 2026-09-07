import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../api/analyticsApi';
import { Loader } from '../components/common/Loader';
import { ProgressBar } from '../components/common/ProgressBar';
import { formatDate } from '../utils/formatDate';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Smile,
  Moon,
  Droplets,
  Award,
  DollarSign,
  PieChart as PieChartIcon,
  Calendar,
  Wallet
} from 'lucide-react';

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899'];

export const AnalyticsPage = () => {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await analyticsApi.getAnalytics(days);
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [days]);

  if (loading) {
    return <Loader size="lg" text="Computing personal productivity & expense intelligence..." />;
  }

  const { compositeScore, productivity, dailyMetrics, financialAnalytics } = data || {};

  const taskStatusData = [
    { name: 'Pending', value: productivity?.statusMap?.pending || 0 },
    { name: 'In Progress', value: productivity?.statusMap?.in_progress || 0 },
    { name: 'Completed', value: productivity?.statusMap?.completed || 0 }
  ];

  const totalExpense = financialAnalytics?.totalExpenses || 0;
  const dailyAvg = financialAnalytics?.dailyAverage || 0;
  const projectedNextMonth = financialAnalytics?.projectedNextMonth || (dailyAvg * 30);
  const categoryBreakdown = Array.isArray(financialAnalytics?.categoryBreakdown) ? financialAnalytics.categoryBreakdown : [];
  const recentExpenses = Array.isArray(financialAnalytics?.recentExpenses) ? financialAnalytics.recentExpenses : [];

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto text-slate-100 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics & Executive Insights</h1>
          <p className="text-xs text-slate-400 mt-0.5">Comprehensive intelligence on your productivity, spending, habits, and wellbeing</p>
        </div>

        {/* Time range selector */}
        <div className="flex items-center gap-1 bg-[#101726] p-1 rounded-xl border border-slate-800 shadow-xs">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                days === d
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Last {d} Days
            </button>
          ))}
        </div>
      </div>

      {/* Top Composite Score & High-Level KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Composite Score Card */}
        <div className="md:col-span-2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg border border-white/10 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-200 flex items-center gap-1.5">
              <Award className="w-4 h-4" /> Overall Life Balance Score
            </span>
            <div className="flex items-baseline gap-2 pt-2">
              <span className="text-4xl font-extrabold">{compositeScore ?? 85}</span>
              <span className="text-blue-200 text-sm">/ 100</span>
            </div>
            <p className="text-xs text-blue-100 pt-1">
              Derived from task completion, habit consistency, sleep averages, and financial pacing.
            </p>
          </div>

          <div className="w-20 h-20 rounded-full border-4 border-white/30 flex items-center justify-center text-xl font-bold bg-white/10 shrink-0">
            {compositeScore ?? 85}%
          </div>
        </div>

        {/* Task Completion Rate */}
        <div className="bg-[#101726] p-5 rounded-2xl border border-slate-800 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Task Completion
          </span>
          <div className="my-2">
            <p className="text-2xl font-bold text-white">
              {productivity?.completionRate || 0}%
            </p>
            <p className="text-[11px] text-slate-400">
              {productivity?.statusMap?.completed || 0} of {productivity?.totalTasks || 0} tasks done
            </p>
          </div>
          <ProgressBar progress={productivity?.completionRate || 0} color="bg-emerald-500" />
        </div>

        {/* Average Sleep & Mood */}
        <div className="bg-[#101726] p-5 rounded-2xl border border-slate-800 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Moon className="w-4 h-4 text-purple-400" /> Average Sleep & Mood
          </span>
          <div className="my-2 space-y-1">
            <p className="text-2xl font-bold text-white">
              {dailyMetrics?.avgSleep || 7} <span className="text-xs font-normal text-slate-400">hrs/night</span>
            </p>
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              Avg Mood: <span className="font-semibold text-slate-200">{dailyMetrics?.avgMood || 4.2}/5.0</span>
            </p>
          </div>
          <span className="text-[10px] text-slate-500">{dailyMetrics?.daysLogged || days} days tracked</span>
        </div>
      </div>

      {/* Financial Analytics & Next Month Planning Section */}
      <div className="bg-[#101726] p-6 rounded-3xl border border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-400" /> Financial Intelligence & Expense Planning
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Analyze spending patterns across the last {days} days and projected next-month budget requirements
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-800/50 self-start sm:self-auto">
            Live Expense Pacing
          </span>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[#131D31] border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Total Period Expenses
            </span>
            <p className="text-2xl font-extrabold text-white">${totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-[10px] text-slate-500">Across {days} tracked days</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#131D31] border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-blue-400" /> Daily Run-Rate (Average)
            </span>
            <p className="text-2xl font-extrabold text-blue-400">${dailyAvg.toFixed(2)}</p>
            <p className="text-[10px] text-slate-500">Average spending per day</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#131D31] border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-purple-400" /> Projected Next-Month Spend
            </span>
            <p className="text-2xl font-extrabold text-purple-400">${projectedNextMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-[10px] text-slate-500">Recommended budget for next 30 days</p>
          </div>
        </div>

        {/* Category Breakdown & Recent Expenses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* Category Distribution */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <PieChartIcon className="w-4 h-4 text-amber-400" /> Category Breakdown
            </h3>

            {categoryBreakdown.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-[#131D31]/40 rounded-xl border border-dashed border-slate-800">
                Log daily expenses in Daily Tracker to see your breakdown.
              </div>
            ) : (
              <div className="space-y-2.5">
                {categoryBreakdown.map((cat, idx) => (
                  <div key={idx} className="space-y-1 bg-[#131D31] p-3 rounded-xl border border-slate-800/80">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-200">{cat.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white">${cat.value.toFixed(2)}</span>
                        <span className="text-[10px] text-slate-400">({cat.percentage}%)</span>
                      </div>
                    </div>
                    <ProgressBar progress={cat.percentage} color="bg-gradient-to-r from-emerald-500 to-blue-500" height="h-1.5" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Expense Entries */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" /> Recent Expense Entries
            </h3>

            {recentExpenses.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-[#131D31]/40 rounded-xl border border-dashed border-slate-800">
                No expense entries found in this period.
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {recentExpenses.map((exp, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[#131D31] border border-slate-800/80 text-xs">
                    <div>
                      <p className="font-semibold text-white">{exp.description}</p>
                      <p className="text-[10px] text-slate-400">{formatDate(exp.date)} • <span className="text-slate-300">{exp.category}</span></p>
                    </div>
                    <span className="font-bold text-emerald-400">${exp.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sleep & Water Intake Trend */}
        <div className="bg-[#101726] p-5 rounded-2xl border border-slate-800 shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" /> Daily Sleep & Water Trend
          </h2>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyMetrics?.trend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#94A3B8' }} />
                <YAxis yAxisId="left" tick={{ fontSize: 9, fill: '#94A3B8' }} domain={[0, 12]} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9, fill: '#94A3B8' }} />
                <Tooltip contentStyle={{ backgroundColor: '#131D31', borderRadius: '12px', border: '1px solid #1E293B', color: '#fff', fontSize: '11px' }} />
                <Line yAxisId="left" type="monotone" dataKey="sleep" stroke="#3B82F6" strokeWidth={2} name="Sleep (hrs)" />
                <Line yAxisId="right" type="monotone" dataKey="water" stroke="#8B5CF6" strokeWidth={2} name="Water (ml)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Status Distribution */}
        <div className="bg-[#101726] p-5 rounded-2xl border border-slate-800 shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-400" /> Task Status Distribution
          </h2>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#131D31', borderRadius: '12px', border: '1px solid #1E293B', color: '#fff', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Habit Success Rate List */}
      <div className="bg-[#101726] p-5 rounded-2xl border border-slate-800 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Smile className="w-4 h-4 text-emerald-400" /> Habit Consistency & Success Rates
        </h2>

        {(!dailyMetrics?.habitSummary || dailyMetrics.habitSummary.length === 0) ? (
          <p className="text-xs text-slate-400 py-4 text-center">No habit tracking data in this period.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dailyMetrics.habitSummary.map((habit, idx) => (
              <div key={idx} className="space-y-1.5 p-3.5 rounded-xl bg-[#131D31] border border-slate-800/80">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-200">{habit.name}</span>
                  <span className="text-blue-400 font-bold">{habit.successRate}%</span>
                </div>
                <ProgressBar progress={habit.successRate} color={habit.successRate > 70 ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-600 to-purple-600'} />
                <p className="text-[10px] text-slate-400">{habit.completed} / {habit.total} days completed</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
