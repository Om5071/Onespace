import React, { useState, useEffect } from 'react';
import { calendarApi } from '../api/calendarApi';
import { useNotification } from '../context/NotificationContext';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Loader } from '../components/common/Loader';
import { formatDate, formatTime } from '../utils/formatDate';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Trash2,
  Edit2
} from 'lucide-react';

export const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [tasksWithDueDates, setTasksWithDueDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState('monthly'); // 'daily', 'weekly', 'monthly'
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [selectedEventDetail, setSelectedEventDetail] = useState(null);

  // Event Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    category: 'General',
    location: '',
    color: '#3B82F6'
  });

  const { addToast } = useNotification();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0);

  const fetchEvents = async () => {
    try {
      const res = await calendarApi.getEvents({
        from: startOfMonth.toISOString(),
        to: endOfMonth.toISOString(),
        view: viewType
      });
      if (res.success) {
        const evtList = Array.isArray(res.data) ? res.data : (res.data?.events || []);
        const taskList = Array.isArray(res.data?.tasksWithDueDates) ? res.data.tasksWithDueDates : [];
        setEvents(evtList);
        setTasksWithDueDates(taskList);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load events', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentDate, viewType]);

  const navigateDate = (step) => {
    if (viewType === 'monthly') {
      setCurrentDate(new Date(year, month + step, 1));
    } else if (viewType === 'weekly') {
      const newD = new Date(currentDate);
      newD.setDate(newD.getDate() + step * 7);
      setCurrentDate(newD);
    } else {
      const newD = new Date(currentDate);
      newD.setDate(newD.getDate() + step);
      setCurrentDate(newD);
      setSelectedDay(newD.getDate());
    }
  };

  const openCreateModal = (day = selectedDay) => {
    setEditingEvent(null);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setFormData({
      title: '',
      description: '',
      startTime: `${dateStr}T09:00`,
      endTime: `${dateStr}T10:00`,
      category: 'General',
      location: '',
      color: '#3B82F6'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      startTime: new Date(event.startDateTime || event.startTime).toISOString().slice(0, 16),
      endTime: new Date(event.endDateTime || event.endTime).toISOString().slice(0, 16),
      category: event.category || 'General',
      location: event.location || '',
      color: event.color || '#3B82F6'
    });
    setIsModalOpen(true);
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.startTime || !formData.endTime) return;

    try {
      if (editingEvent) {
        await calendarApi.updateEvent(editingEvent._id, formData);
        addToast('Event updated', 'success');
      } else {
        await calendarApi.createEvent(formData);
        addToast('Event scheduled', 'success');
      }
      setIsModalOpen(false);
      fetchEvents();
    } catch (err) {
      addToast(err.message || 'Failed to save event', 'error');
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await calendarApi.deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e._id !== id));
      if (selectedEventDetail?._id === id) setSelectedEventDetail(null);
      addToast('Event deleted', 'success');
    } catch (err) {
      addToast('Failed to delete event', 'error');
    }
  };

  const daysInMonth = endOfMonth.getDate();
  const startDayOfWeek = startOfMonth.getDay();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blankDays = Array.from({ length: startDayOfWeek }, (_, i) => i);

  const getEventDateString = (e) => {
    const raw = e.startDateTime || e.startTime || e.startDate;
    if (!raw) return '';
    const parsed = new Date(raw);
    return isNaN(parsed.getTime()) ? '' : parsed.toISOString().split('T')[0];
  };

  const selectedDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
  const dayEvents = (Array.isArray(events) ? events : []).filter((e) => {
    return getEventDateString(e) === selectedDateStr;
  });

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Calendar & Events</h1>
          <p className="text-xs text-slate-400 mt-0.5">Teams-style calendar views and schedule management</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-[#101726] border border-slate-800 p-1 rounded-xl">
            {['daily', 'weekly', 'monthly'].map((v) => (
              <button
                key={v}
                onClick={() => setViewType(v)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                  viewType === v
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Date Navigator */}
          <div className="flex items-center bg-[#101726] border border-slate-800 rounded-xl p-1 shadow-xs">
            <button
              onClick={() => navigateDate(-1)}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-[#1A243B] hover:text-white cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-white">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={() => navigateDate(1)}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-[#1A243B] hover:text-white cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <Button variant="primary" icon={Plus} onClick={() => openCreateModal()}>
            Schedule Event
          </Button>
        </div>
      </div>

      {/* Main View Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid / Schedule Table */}
        <div className="lg:col-span-2 bg-[#101726] rounded-2xl p-5 border border-slate-800 shadow-xs">
          {viewType === 'monthly' ? (
            <>
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 text-center font-semibold text-xs text-slate-400 mb-2">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>

              {/* Month Cells */}
              <div className="grid grid-cols-7 gap-1.5">
                {blankDays.map((_, i) => (
                  <div key={`blank-${i}`} className="h-20 sm:h-24 rounded-xl bg-[#0B0F19]/40 border border-slate-800/40" />
                ))}

                {daysArray.map((day) => {
                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const dayEvts = (Array.isArray(events) ? events : []).filter(
                    (e) => getEventDateString(e) === dateStr
                  );
                  const isSelected = selectedDay === day;
                  const isToday =
                    new Date().getDate() === day &&
                    new Date().getMonth() === month &&
                    new Date().getFullYear() === year;

                  return (
                    <div
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`h-20 sm:h-24 p-1.5 rounded-xl border flex flex-col justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-500 bg-blue-950/30 ring-2 ring-blue-500/20'
                          : isToday
                          ? 'border-indigo-500/60 bg-indigo-950/20'
                          : 'border-slate-800/80 hover:bg-[#131D31] bg-[#131D31]/70'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                            isToday
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-slate-300'
                          }`}
                        >
                          {day}
                        </span>
                      </div>

                      <div className="space-y-1 overflow-hidden">
                        {dayEvts.slice(0, 2).map((e) => (
                          <div
                            key={e._id}
                            onClick={(ev) => {
                              ev.stopPropagation();
                              setSelectedEventDetail(e);
                            }}
                            className="text-[10px] truncate px-1.5 py-0.5 rounded font-medium text-white shadow-xs bg-gradient-to-r from-blue-600 to-indigo-600"
                          >
                            {e.title}
                          </div>
                        ))}
                        {dayEvts.length > 2 && (
                          <span className="text-[9px] text-slate-400 font-bold block text-right">
                            +{dayEvts.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Teams Style Daily/Weekly Timeline */
            <div className="space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                {viewType === 'weekly' ? 'Weekly Schedule Overview' : `Schedule for ${selectedDateStr}`}
              </h3>
              <div className="divide-y divide-slate-800">
                {events.map((e) => (
                  <div
                    key={e._id}
                    onClick={() => setSelectedEventDetail(e)}
                    className="py-3 px-2 flex items-center justify-between hover:bg-[#131D31] rounded-xl cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full shrink-0 bg-blue-500" />
                      <div>
                        <p className="text-xs font-bold text-white">{e.title}</p>
                        <p className="text-[11px] text-slate-400">
                          {formatDate(e.startDateTime || e.startTime)} • {formatTime(e.startDateTime || e.startTime)} - {formatTime(e.endDateTime || e.endTime)}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">{e.location || e.category}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Selected Day Agenda / Event Detail Slideover */}
        <div className="bg-[#101726] rounded-2xl p-5 border border-slate-800 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div>
              <h2 className="font-bold text-sm text-white">
                {monthNames[month]} {selectedDay}, {year}
              </h2>
              <p className="text-[11px] text-slate-400">Agenda & commitments</p>
            </div>
            <Button variant="secondary" size="sm" icon={Plus} onClick={() => openCreateModal(selectedDay)}>
              Add
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3">
            {selectedEventDetail ? (
              <div className="p-4 rounded-xl border border-blue-800/80 bg-blue-950/20 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-sm text-white">{selectedEventDetail.title}</h3>
                  <button onClick={() => setSelectedEventDetail(null)} className="text-xs text-slate-400 hover:text-white">
                    ✕
                  </button>
                </div>
                {selectedEventDetail.description && (
                  <p className="text-xs text-slate-300">{selectedEventDetail.description}</p>
                )}
                <div className="text-xs text-slate-400 space-y-1">
                  <p className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-blue-400" /> {formatTime(selectedEventDetail.startDateTime || selectedEventDetail.startTime)} - {formatTime(selectedEventDetail.endDateTime || selectedEventDetail.endTime)}</p>
                  {selectedEventDetail.location && <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-purple-400" /> {selectedEventDetail.location}</p>}
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <Button size="sm" variant="secondary" icon={Edit2} onClick={() => openEditModal(selectedEventDetail)}>Edit</Button>
                  <Button size="sm" variant="danger" icon={Trash2} onClick={() => handleDeleteEvent(selectedEventDetail._id)}>Delete</Button>
                </div>
              </div>
            ) : null}

            {dayEvents.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No events scheduled for this day.
              </div>
            ) : (
              dayEvents.map((evt) => (
                <div
                  key={evt._id}
                  onClick={() => setSelectedEventDetail(evt)}
                  className="p-3 rounded-xl border border-slate-800 bg-[#131D31] space-y-1.5 cursor-pointer hover:border-slate-700 transition-colors shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      <h4 className="font-semibold text-xs text-white">{evt.title}</h4>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {formatTime(evt.startDateTime || evt.startTime)} - {formatTime(evt.endDateTime || evt.endTime)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingEvent ? 'Edit Event' : 'Schedule Event'}>
        <form onSubmit={handleSaveEvent} className="space-y-4">
          <Input
            label="Event Title"
            placeholder="Meeting, Workshop, Session..."
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Time"
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              required
            />
            <Input
              label="End Time"
              type="datetime-local"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Category"
              placeholder="Work, Social, Personal..."
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
            <Input
              label="Location"
              placeholder="Google Meet / Room 302..."
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingEvent ? 'Save Changes' : 'Schedule Event'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
