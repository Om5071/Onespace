import React, { useState, useEffect } from 'react';
import { fitnessApi } from '../api/fitnessApi';
import { useNotification } from '../context/NotificationContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { Loader } from '../components/common/Loader';
import { ProgressBar } from '../components/common/ProgressBar';
import { formatDate } from '../utils/formatDate';
import {
  Dumbbell,
  Footprints,
  Flame,
  Droplets,
  Plus,
  Trash2,
  TrendingUp,
  Activity,
  Heart,
  Scale
} from 'lucide-react';

export const FitnessPage = () => {
  const [todayRecord, setTodayRecord] = useState(null);
  const [todayWorkouts, setTodayWorkouts] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick Metric Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stepInput, setStepInput] = useState('8500');
  const [waterInput, setWaterInput] = useState('2500');
  const [calorieInput, setCalorieInput] = useState('450');
  const [weightInput, setWeightInput] = useState('74.5');

  // Workout Log Form
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [workoutForm, setWorkoutForm] = useState({
    type: 'Strength Training',
    durationMinutes: 45,
    caloriesBurned: 320,
    intensity: 'medium',
    notes: ''
  });

  const { addToast } = useNotification();
  const todayStr = new Date().toISOString().split('T')[0];

  const fetchFitnessData = async () => {
    try {
      const res = await fitnessApi.getRecords({ limit: 50 });
      if (res.success && Array.isArray(res.data)) {
        const allRecords = res.data;
        const todaysList = allRecords.filter((r) => r.date === todayStr);

        // Separate workouts from base metric record
        const workouts = todaysList.filter((r) => r.type === 'workout' || (r.workoutType && r.durationMinutes > 0));
        setTodayWorkouts(workouts);

        // Find primary record for steps/water/weight
        const metricRec = todaysList.find((r) => r.type !== 'workout') || todaysList[0] || {};
        const totalCalories = todaysList.reduce((sum, r) => sum + (Number(r.caloriesBurned) || 0), 0);

        const currentSteps = metricRec.steps || (todaysList[0]?.steps) || 8500;
        const currentWater = metricRec.waterIntakeMl || 2500;
        const currentWeight = metricRec.bodyWeightKg || metricRec.bodyWeight || 74.5;

        setTodayRecord({
          steps: currentSteps,
          waterIntakeMl: currentWater,
          caloriesBurned: totalCalories || 450,
          weightKg: currentWeight
        });

        setStepInput(String(currentSteps));
        setWaterInput(String(currentWater));
        setCalorieInput(String(totalCalories || 450));
        setWeightInput(String(currentWeight));

        // Group history by date
        const dateMap = {};
        allRecords.forEach((r) => {
          if (!dateMap[r.date]) {
            dateMap[r.date] = { date: r.date, steps: r.steps || 0, caloriesBurned: 0, waterIntakeMl: 2500 };
          }
          dateMap[r.date].caloriesBurned += (Number(r.caloriesBurned) || 0);
          if (r.steps) dateMap[r.date].steps = Math.max(dateMap[r.date].steps, r.steps);
        });

        setHistory(Object.values(dateMap).sort((a, b) => b.date.localeCompare(a.date)));
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load fitness logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFitnessData();
  }, []);

  const handleUpdateMetrics = async (e) => {
    e.preventDefault();
    try {
      await fitnessApi.createRecord({
        date: todayStr,
        type: 'metrics',
        steps: Number(stepInput) || 0,
        waterIntakeMl: Number(waterInput) || 0,
        caloriesBurned: Number(calorieInput) || 0,
        bodyWeightKg: weightInput ? Number(weightInput) : undefined
      });
      addToast('Daily health metrics saved! 🎯', 'success');
      setIsModalOpen(false);
      fetchFitnessData();
    } catch (err) {
      addToast(err.message || 'Failed to update metrics', 'error');
    }
  };

  const handleAddWorkout = async (e) => {
    e.preventDefault();
    try {
      await fitnessApi.createRecord({
        date: todayStr,
        type: 'workout',
        workoutType: workoutForm.type,
        durationMinutes: Number(workoutForm.durationMinutes) || 30,
        caloriesBurned: Number(workoutForm.caloriesBurned) || 200,
        notes: workoutForm.notes
      });
      addToast('Workout session logged! 💪', 'success');
      setIsWorkoutModalOpen(false);
      setWorkoutForm({
        type: 'Running',
        durationMinutes: 30,
        caloriesBurned: 250,
        intensity: 'medium',
        notes: ''
      });
      fetchFitnessData();
    } catch (err) {
      addToast(err.message || 'Failed to log workout', 'error');
    }
  };

  const handleDeleteWorkout = async (id) => {
    try {
      await fitnessApi.deleteRecord(id);
      addToast('Workout log removed', 'success');
      fetchFitnessData();
    } catch (err) {
      addToast('Failed to delete workout', 'error');
    }
  };

  const stepGoal = 10000;
  const waterGoal = 3000;
  const currentSteps = todayRecord?.steps || 0;
  const currentWater = todayRecord?.waterIntakeMl || 2500;
  const currentCalories = todayRecord?.caloriesBurned || 0;

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Fitness & Health Tracker</h1>
          <p className="text-xs text-slate-400 mt-0.5">Track daily workouts, steps, hydration, and body weight metrics</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" icon={Activity} onClick={() => setIsModalOpen(true)}>
            Update Metrics
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsWorkoutModalOpen(true)}>
            Log Workout
          </Button>
        </div>
      </div>

      {loading ? (
        <Loader size="lg" text="Loading fitness data..." />
      ) : (
        <div className="space-y-6">
          {/* Today's KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#101726] rounded-2xl p-5 border border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Daily Steps</span>
                <div className="p-2 bg-blue-950 text-blue-400 rounded-xl border border-blue-800/50">
                  <Footprints className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{currentSteps.toLocaleString()}</p>
              <ProgressBar progress={(currentSteps / stepGoal) * 100} color="bg-blue-500" height="h-1.5" />
              <p className="text-[10px] text-slate-400">Goal: {stepGoal.toLocaleString()} steps</p>
            </div>

            <div className="bg-[#101726] rounded-2xl p-5 border border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Water Intake</span>
                <div className="p-2 bg-sky-950 text-sky-400 rounded-xl border border-sky-800/50">
                  <Droplets className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{currentWater} ml</p>
              <ProgressBar progress={(currentWater / waterGoal) * 100} color="bg-sky-500" height="h-1.5" />
              <p className="text-[10px] text-slate-400">Goal: {waterGoal} ml</p>
            </div>

            <div className="bg-[#101726] rounded-2xl p-5 border border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Calories Burned</span>
                <div className="p-2 bg-amber-950 text-amber-400 rounded-xl border border-amber-800/50">
                  <Flame className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{currentCalories} kcal</p>
              <ProgressBar progress={Math.min(100, (currentCalories / 600) * 100)} color="bg-amber-500" height="h-1.5" />
              <p className="text-[10px] text-slate-400">Active burn today</p>
            </div>

            <div className="bg-[#101726] rounded-2xl p-5 border border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Body Weight</span>
                <div className="p-2 bg-purple-950 text-purple-400 rounded-xl border border-purple-800/50">
                  <Scale className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">
                {todayRecord?.weightKg ? `${todayRecord.weightKg} kg` : '74.5 kg'}
              </p>
              <p className="text-[10px] text-slate-400">Tracked weight</p>
            </div>
          </div>

          {/* Workouts Logged Today & Activity History */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#101726] rounded-2xl p-5 border border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-blue-400" />
                  <h2 className="font-bold text-sm text-white">Today's Workout Sessions ({todayWorkouts.length})</h2>
                </div>
                <Button size="sm" variant="secondary" icon={Plus} onClick={() => setIsWorkoutModalOpen(true)}>
                  Log Workout
                </Button>
              </div>

              {todayWorkouts.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-xl bg-[#131D31]/40">
                  <Dumbbell className="w-8 h-8 mx-auto mb-2 opacity-30 text-blue-400" />
                  No workout logged today yet. Click "Log Workout" to record your session!
                </div>
              ) : (
                <div className="space-y-2">
                  {todayWorkouts.map((w) => (
                    <div
                      key={w._id}
                      className="p-3.5 rounded-xl bg-[#131D31] border border-slate-800 flex items-center justify-between shadow-xs hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-950 text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-800/60">
                          <Dumbbell className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white">{w.workoutType || 'Workout Session'}</p>
                          <p className="text-[11px] text-slate-400">
                            {w.durationMinutes || 30} mins • {w.caloriesBurned || 0} kcal {w.notes ? `• ${w.notes}` : ''}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteWorkout(w._id)}
                        className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-[#1A243B] transition-colors cursor-pointer"
                        title="Delete workout"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 14-Day History List */}
            <div className="bg-[#101726] rounded-2xl p-5 border border-slate-800 shadow-xs space-y-3">
              <h2 className="font-bold text-sm text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400" /> Recent Daily Totals
              </h2>
              <div className="divide-y divide-slate-800 max-h-72 overflow-y-auto">
                {history.slice(0, 7).map((h, i) => (
                  <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-200">{formatDate(h.date)}</p>
                      <p className="text-[10px] text-slate-400">{(h.steps || 0).toLocaleString()} steps</p>
                    </div>
                    <span className="font-bold text-blue-400">{h.caloriesBurned || 0} kcal</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Update Daily Health Metrics">
        <form onSubmit={handleUpdateMetrics} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Daily Steps"
              type="number"
              value={stepInput}
              onChange={(e) => setStepInput(e.target.value)}
            />
            <Input
              label="Water Intake (ml)"
              type="number"
              value={waterInput}
              onChange={(e) => setWaterInput(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Calories Burned (kcal)"
              type="number"
              value={calorieInput}
              onChange={(e) => setCalorieInput(e.target.value)}
            />
            <Input
              label="Current Weight (kg)"
              type="number"
              step="0.1"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Metrics
            </Button>
          </div>
        </form>
      </Modal>

      {/* Workout Modal */}
      <Modal isOpen={isWorkoutModalOpen} onClose={() => setIsWorkoutModalOpen(false)} title="Log Workout Session">
        <form onSubmit={handleAddWorkout} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Workout Activity
            </label>
            <select
              value={workoutForm.type}
              onChange={(e) => setWorkoutForm({ ...workoutForm, type: e.target.value })}
              className="w-full h-10 rounded-xl border border-slate-700 bg-[#131D31] px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="Strength Training">Strength Training</option>
              <option value="Running">Running</option>
              <option value="Cycling">Cycling</option>
              <option value="HIIT Cardio">HIIT Cardio</option>
              <option value="Swimming">Swimming</option>
              <option value="Yoga & Mobility">Yoga & Mobility</option>
              <option value="Walking">Walking</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Duration (minutes)"
              type="number"
              value={workoutForm.durationMinutes}
              onChange={(e) => setWorkoutForm({ ...workoutForm, durationMinutes: e.target.value })}
              required
            />
            <Input
              label="Calories Burned (kcal)"
              type="number"
              value={workoutForm.caloriesBurned}
              onChange={(e) => setWorkoutForm({ ...workoutForm, caloriesBurned: e.target.value })}
              required
            />
          </div>

          <Input
            label="Notes / Exercises Done (optional)"
            placeholder="e.g. Bench press 4x10, Squats 4x8..."
            value={workoutForm.notes}
            onChange={(e) => setWorkoutForm({ ...workoutForm, notes: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsWorkoutModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Log Workout Session
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FitnessPage;
