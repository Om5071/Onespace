import React, { useState, useEffect } from 'react';
import { taskApi } from '../api/taskApi';
import { useNotification } from '../context/NotificationContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { Loader } from '../components/common/Loader';
import { formatDate } from '../utils/formatDate';
import { TASK_STATUSES, TASK_PRIORITIES } from '../utils/constants';
import {
  Plus,
  Search,
  CheckCircle2,
  Circle,
  Trash2,
  Edit2,
  Calendar,
  LayoutList,
  Kanban,
  Tag,
  CheckSquare,
  Clock,
  AlertTriangle
} from 'lucide-react';

export const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'kanban'
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [sortOption, setSortOption] = useState('-createdAt');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    dueDate: '',
    dueTime: '',
    tags: '',
    subtasks: []
  });
  const [newSubtask, setNewSubtask] = useState('');

  const { addToast } = useNotification();

  const fetchTasks = async () => {
    try {
      const res = await taskApi.getTasks({
        search: search || undefined,
        status: selectedStatus || undefined,
        priority: selectedPriority || undefined,
        sort: sortOption
      });
      if (res.success) {
        setTasks(res.data);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [search, selectedStatus, selectedPriority, sortOption]);

  const isTaskOverdue = (task) => {
    if (!task.dueDate || task.status === 'completed') return false;
    const due = new Date(task.dueDate);
    const now = new Date();
    return due < now;
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      dueDate: '',
      dueTime: '18:00',
      tags: '',
      subtasks: []
    });
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      dueTime: task.dueTime || '',
      tags: (task.tags || []).join(', '),
      subtasks: task.subtasks || []
    });
    setIsModalOpen(true);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const payload = {
      ...formData,
      tags: formData.tags
        ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : []
    };

    try {
      if (editingTask) {
        await taskApi.updateTask(editingTask._id, payload);
        addToast('Task updated successfully', 'success');
      } else {
        await taskApi.createTask(payload);
        addToast('Task created successfully', 'success');
      }
      setIsModalOpen(false);
      fetchTasks();
    } catch (err) {
      addToast(err.message || 'Failed to save task', 'error');
    }
  };

  const handleToggleStatus = async (taskId, currentStatus) => {
    const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    try {
      await taskApi.updateStatus(taskId, nextStatus);
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: nextStatus } : t))
      );
      addToast(`Task marked as ${nextStatus}`, 'success');
    } catch (err) {
      addToast('Failed to update status', 'error');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await taskApi.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      addToast('Task deleted', 'success');
    } catch (err) {
      addToast('Failed to delete task', 'error');
    }
  };

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    setFormData((prev) => ({
      ...prev,
      subtasks: [...prev.subtasks, { title: newSubtask.trim(), isCompleted: false }]
    }));
    setNewSubtask('');
  };

  const handleToggleSubtask = (idx) => {
    setFormData((prev) => {
      const updated = [...prev.subtasks];
      updated[idx].isCompleted = !updated[idx].isCompleted;
      return { ...prev, subtasks: updated };
    });
  };

  const handleRemoveSubtask = (idx) => {
    setFormData((prev) => ({
      ...prev,
      subtasks: prev.subtasks.filter((_, i) => i !== idx)
    }));
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Task Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">Organize tasks, subtasks, priorities, and deadlines</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#101726] border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutList className="w-4 h-4" />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Kanban className="w-4 h-4" />
              <span className="hidden sm:inline">Board</span>
            </button>
          </div>

          <Button variant="primary" icon={Plus} onClick={openCreateModal}>
            Add Task
          </Button>
        </div>
      </div>

      {/* Filter, Sort and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-[#101726] p-3 rounded-2xl border border-slate-800 shadow-xs">
        <div className="lg:col-span-2">
          <Input
            icon={Search}
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full h-9 rounded-xl border border-slate-700 bg-[#131D31] px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        <div>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="w-full h-9 rounded-xl border border-slate-700 bg-[#131D31] px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="w-full h-9 rounded-xl border border-slate-700 bg-[#131D31] px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="-createdAt">Newest First</option>
            <option value="dueDate">Due Date (Earliest)</option>
            <option value="-dueDate">Due Date (Latest)</option>
            <option value="priority">Priority</option>
            <option value="title">Title (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <Loader size="lg" text="Loading tasks..." />
      ) : tasks.length === 0 ? (
        <div className="text-center py-16 bg-[#101726] rounded-2xl border border-dashed border-slate-800">
          <CheckSquare className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <h3 className="text-sm font-semibold text-slate-300">No tasks found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Create your first task or adjust your search filter criteria.
          </p>
          <Button variant="primary" size="sm" icon={Plus} className="mt-4" onClick={openCreateModal}>
            Add First Task
          </Button>
        </div>
      ) : viewMode === 'list' ? (
        /* List View */
        <div className="bg-[#101726] rounded-2xl border border-slate-800 shadow-xs divide-y divide-slate-800/80 overflow-hidden">
          {tasks.map((task) => {
            const overdue = isTaskOverdue(task);
            return (
              <div
                key={task._id}
                className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  overdue
                    ? 'bg-rose-950/20 border-l-4 border-l-rose-500'
                    : 'hover:bg-[#131D31]/60'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <button
                    onClick={() => handleToggleStatus(task._id, task.status)}
                    className="mt-0.5 text-slate-400 hover:text-blue-400 transition-colors cursor-pointer shrink-0"
                  >
                    {task.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-sm font-semibold ${
                          task.status === 'completed'
                            ? 'line-through text-slate-500'
                            : 'text-white'
                        }`}
                      >
                        {task.title}
                      </span>
                      <Badge variant={task.priority === 'urgent' ? 'danger' : task.priority === 'high' ? 'warning' : 'brand'}>
                        {task.priority}
                      </Badge>
                      {overdue ? (
                        <Badge variant="danger" size="xs" className="flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Overdue
                        </Badge>
                      ) : (
                        <Badge variant={task.status === 'completed' ? 'success' : task.status === 'in_progress' ? 'info' : 'default'}>
                          {(task.status || 'pending').replace('_', ' ')}
                        </Badge>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-400 line-clamp-1">{task.description}</p>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap pt-0.5">
                      {task.dueDate && (
                        <span className={`flex items-center gap-1 font-medium ${overdue ? 'text-rose-400' : 'text-slate-400'}`}>
                          <Calendar className="w-3 h-3" />
                          {formatDate(task.dueDate)} {task.dueTime ? `@ ${task.dueTime}` : ''}
                        </span>
                      )}
                      {task.subtasks && task.subtasks.length > 0 && (
                        <span className="flex items-center gap-1">
                          <CheckSquare className="w-3 h-3 text-slate-400" />
                          {task.subtasks.filter((s) => s.isCompleted).length}/{task.subtasks.length} subtasks
                        </span>
                      )}
                      {task.tags && task.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Tag className="w-3 h-3 text-slate-400" />
                          {task.tags.map((tg, i) => (
                            <span key={i} className="bg-[#1A243B] border border-slate-700/60 px-1.5 py-0.5 rounded text-[10px] text-slate-300">
                              #{tg}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => openEditModal(task)}
                    className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-[#1A243B] rounded-lg transition-colors cursor-pointer"
                    title="Edit task"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-[#1A243B] rounded-lg transition-colors cursor-pointer"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TASK_STATUSES.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                className="bg-[#101726] rounded-2xl p-4 border border-slate-800 flex flex-col h-full shadow-xs"
              >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
                      {col.label}
                    </h3>
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-[#1A243B] text-slate-300 border border-slate-700/50">
                      {colTasks.length}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colTasks.map((t) => {
                    const overdue = isTaskOverdue(t);
                    return (
                      <div
                        key={t._id}
                        className={`bg-[#131D31] p-4 rounded-xl shadow-xs border space-y-2 hover:border-slate-700 transition-all ${
                          overdue ? 'border-rose-700 bg-rose-950/20' : 'border-slate-800'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-semibold text-white">{t.title}</span>
                          <Badge variant={t.priority === 'urgent' ? 'danger' : t.priority === 'high' ? 'warning' : 'brand'}>
                            {t.priority}
                          </Badge>
                        </div>

                        {t.description && (
                          <p className="text-[11px] text-slate-400 line-clamp-2">{t.description}</p>
                        )}

                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800">
                          <span className={overdue ? 'text-rose-400 font-bold flex items-center gap-1' : ''}>
                            {overdue && <AlertTriangle className="w-3 h-3" />}
                            {t.dueDate ? `${formatDate(t.dueDate)} ${t.dueTime || ''}` : 'No due date'}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEditModal(t)}
                              className="p-1 hover:text-blue-400 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(t._id)}
                              className="p-1 hover:text-rose-400 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? 'Edit Task Details' : 'Create New Task'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveTask} className="space-y-4">
          <Input
            label="Task Title"
            placeholder="e.g. Finish Sprint Deliverables, Review Code..."
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            autoFocus
          />

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Task Description & Objectives
            </label>
            <textarea
              rows={3}
              placeholder="Outline details, context, or acceptance criteria..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="block w-full rounded-xl border border-slate-700 bg-[#131D31] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none leading-relaxed resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Priority Level
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full h-10 rounded-xl border border-slate-700 bg-[#131D31] px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">🔥 Urgent Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Task Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full h-10 rounded-xl border border-slate-700 bg-[#131D31] px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Due Date"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
            <Input
              label="Due Time"
              type="time"
              value={formData.dueTime}
              onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
            />
          </div>

          <Input
            label="Tags (comma-separated)"
            placeholder="e.g. backend, urgent, onespace, design"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          />

          {/* Subtasks Checklist */}
          <div className="space-y-2 pt-3 border-t border-slate-800">
            <label className="block text-xs font-medium text-slate-300">
              Subtasks & Steps Checklist ({formData.subtasks.filter(s => s.isCompleted).length}/{formData.subtasks.length})
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add actionable subtask item..."
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())}
                className="flex-1 rounded-xl border border-slate-700 bg-[#131D31] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
              <Button type="button" size="sm" variant="secondary" onClick={handleAddSubtask}>
                Add Item
              </Button>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {formData.subtasks.map((sub, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#131D31] border border-slate-800 text-xs">
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="checkbox"
                      checked={sub.isCompleted}
                      onChange={() => handleToggleSubtask(idx)}
                      className="rounded text-blue-600 cursor-pointer w-4 h-4"
                    />
                    <span className={sub.isCompleted ? 'line-through text-slate-500' : 'text-slate-200 font-medium'}>
                      {sub.title}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(idx)}
                    className="text-slate-400 hover:text-rose-400 p-1 cursor-pointer"
                    title="Remove subtask"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800 sticky bottom-0 bg-[#101726]/95 py-2">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingTask ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
