export const TASK_STATUSES = [
  { id: 'pending', label: 'Pending', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  { id: 'completed', label: 'Completed', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' }
];

export const TASK_PRIORITIES = [
  { id: 'low', label: 'Low', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  { id: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  { id: 'high', label: 'High', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  { id: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' }
];

export const WORKOUT_TYPES = [
  'Strength',
  'Cardio',
  'Yoga',
  'HIIT',
  'Running',
  'Cycling',
  'Swimming',
  'Walking',
  'Other'
];

export const GOAL_CATEGORIES = [
  'Career',
  'Health',
  'Finance',
  'Personal',
  'Education',
  'Other'
];

export const MOOD_EMOJIS = [
  { level: 1, emoji: '😫', label: 'Very Low' },
  { level: 2, emoji: '😕', label: 'Low' },
  { level: 3, emoji: '😐', label: 'Neutral' },
  { level: 4, emoji: '🙂', label: 'Good' },
  { level: 5, emoji: '🤩', label: 'Excellent' }
];
