import React, { useState, useEffect } from 'react';
import { Plus, Check, Clock, Calendar as CalendarIcon, Trash2, Settings } from 'lucide-react';
import api from '../../api/client';
import Modal from '../Common/Modal';
import SettingsView from '../Settings/SettingsView';

const PlannerView = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduleItems, setScheduleItems] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('planner'); // 'planner' | 'settings'

  // Modal states
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);

  // Form states - Schedule
  const [schedTitle, setSchedTitle] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');

  // Form states - Reminder
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderPriority, setReminderPriority] = useState('medium');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [schedRes, remRes] = await Promise.all([
        api.getSchedule(selectedDate),
        api.getReminders({ date: selectedDate })
      ]);
      setScheduleItems(schedRes.data);
      setReminders(remRes.data);
    } catch (err) {
      console.error('Error fetching planner data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const handleToggleSchedule = async (id) => {
    setScheduleItems(prev => prev.map(item => item._id === id ? { ...item, completed: !item.completed } : item));
    try {
      await api.toggleScheduleItem(id);
    } catch (err) {
      fetchData();
    }
  };

  const handleToggleReminder = async (id) => {
    setReminders(prev => prev.map(r => r._id === id ? { ...r, completed: !r.completed } : r));
    try {
      await api.toggleReminder(id);
    } catch (err) {
      fetchData();
    }
  };

  const handleDeleteSchedule = async (id) => {
    try {
      await api.deleteScheduleItem(id);
      fetchData();
    } catch (err) {
      console.error('Error deleting schedule item:', err);
    }
  };

  const handleDeleteReminder = async (id) => {
    try {
      await api.deleteReminder(id);
      fetchData();
    } catch (err) {
      console.error('Error deleting reminder:', err);
    }
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    if (!schedTitle.trim()) return;

    try {
      await api.createScheduleItem({
        title: schedTitle.trim(),
        startTime,
        endTime,
        date: selectedDate,
      });
      setSchedTitle('');
      setIsScheduleModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Error creating schedule item:', err);
    }
  };

  const handleSaveReminder = async (e) => {
    e.preventDefault();
    if (!reminderTitle.trim()) return;

    try {
      await api.createReminder({
        title: reminderTitle.trim(),
        priority: reminderPriority,
        date: selectedDate,
      });
      setReminderTitle('');
      setIsReminderModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Error creating reminder:', err);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top Header with Date & Settings Switcher */}
      <div className="flex items-center justify-between pt-2 border-b border-[#27272a] pb-4">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-widest text-[#71717a]">
            Schedule & System
          </span>
          <h1 className="text-xl font-bold text-[#f4f4f5] tracking-tight">
            {activeSubTab === 'planner' ? 'Day Planner' : 'System Settings'}
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center p-1 bg-[#18181b] border border-[#27272a] rounded-lg">
            <button
              onClick={() => setActiveSubTab('planner')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                activeSubTab === 'planner' ? 'bg-[#e4e4e7] text-[#09090b]' : 'text-[#71717a] hover:text-[#f4f4f5]'
              }`}
            >
              Planner
            </button>
            <button
              onClick={() => setActiveSubTab('settings')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                activeSubTab === 'settings' ? 'bg-[#e4e4e7] text-[#09090b]' : 'text-[#71717a] hover:text-[#f4f4f5]'
              }`}
            >
              Settings
            </button>
          </div>
        </div>
      </div>

      {activeSubTab === 'settings' ? (
        <SettingsView />
      ) : (
        <>
          {/* Date Picker Bar */}
          <div className="flex items-center justify-between bg-[#18181b] border border-[#27272a] rounded-xl p-3">
            <span className="text-xs text-[#a1a1aa] font-medium">Select Schedule Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-[#09090b] border border-[#27272a] rounded-lg px-2.5 py-1 text-xs font-mono text-[#f4f4f5] outline-none"
            />
          </div>

          {/* Section 1: Time-Blocked Chronological Schedule */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#71717a]">
                Time-Blocked Schedule
              </h2>
              <button
                onClick={() => setIsScheduleModalOpen(true)}
                className="flex items-center space-x-1 text-[11px] bg-[#27272a] hover:bg-[#3f3f46] text-[#f4f4f5] px-2.5 py-1 rounded-md transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Add Block</span>
              </button>
            </div>

            {scheduleItems.length === 0 ? (
              <div className="p-4 bg-[#18181b] border border-[#27272a] rounded-xl text-center text-xs text-[#71717a]">
                No time blocks scheduled for this date.
              </div>
            ) : (
              <div className="space-y-2">
                {scheduleItems.map((item) => (
                  <div
                    key={item._id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                      item.completed ? 'bg-[#18181b]/50 border-[#27272a] opacity-50' : 'bg-[#18181b] border-[#27272a]'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleToggleSchedule(item._id)}
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          item.completed ? 'bg-[#e4e4e7] border-[#e4e4e7] text-[#09090b]' : 'border-[#3f3f46]'
                        }`}
                      >
                        {item.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                      <div>
                        <h4 className={`text-xs font-medium ${item.completed ? 'line-through text-[#71717a]' : 'text-[#f4f4f5]'}`}>
                          {item.title}
                        </h4>
                        <p className="text-[10px] font-mono text-[#71717a] flex items-center space-x-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{item.startTime} &ndash; {item.endTime}</span>
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteSchedule(item._id)}
                      className="p-1 text-[#71717a] hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section 2: Reminders List */}
          <section className="space-y-3 pt-2 border-t border-[#27272a]">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#71717a]">
                Reminders & Priorities
              </h2>
              <button
                onClick={() => setIsReminderModalOpen(true)}
                className="flex items-center space-x-1 text-[11px] bg-[#27272a] hover:bg-[#3f3f46] text-[#f4f4f5] px-2.5 py-1 rounded-md transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Add Reminder</span>
              </button>
            </div>

            {reminders.length === 0 ? (
              <div className="p-4 bg-[#18181b] border border-[#27272a] rounded-xl text-center text-xs text-[#71717a]">
                No reminders logged for this date.
              </div>
            ) : (
              <div className="space-y-2">
                {reminders.map((r) => (
                  <div
                    key={r._id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                      r.completed ? 'bg-[#18181b]/50 border-[#27272a] opacity-50' : 'bg-[#18181b] border-[#27272a]'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleToggleReminder(r._id)}
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          r.completed ? 'bg-[#e4e4e7] border-[#e4e4e7] text-[#09090b]' : 'border-[#3f3f46]'
                        }`}
                      >
                        {r.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${
                          r.priority === 'high' ? 'bg-red-400' : r.priority === 'medium' ? 'bg-amber-400' : 'bg-slate-400'
                        }`} />
                        <span className={`text-xs font-medium ${r.completed ? 'line-through text-[#71717a]' : 'text-[#f4f4f5]'}`}>
                          {r.title}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteReminder(r._id)}
                      className="p-1 text-[#71717a] hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* Add Schedule Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Add Schedule Time Block"
      >
        <form onSubmit={handleSaveSchedule} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[#71717a] mb-1">
              Block Title
            </label>
            <input
              type="text"
              value={schedTitle}
              onChange={(e) => setSchedTitle(e.target.value)}
              placeholder="e.g. Deep Work: System Architecture"
              className="w-full bg-[#09090b] border border-[#27272a] rounded-lg p-2.5 text-xs text-[#f4f4f5] outline-none focus:border-[#e4e4e7]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-[#71717a] mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-[#09090b] border border-[#27272a] rounded-lg p-2.5 text-xs font-mono text-[#f4f4f5] outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-[#71717a] mb-1">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-[#09090b] border border-[#27272a] rounded-lg p-2.5 text-xs font-mono text-[#f4f4f5] outline-none"
                required
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(false)}
              className="px-3 py-1.5 text-xs text-[#a1a1aa]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#e4e4e7] text-[#09090b] rounded-lg text-xs font-semibold hover:bg-white"
            >
              Add Block
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Reminder Modal */}
      <Modal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        title="Add Reminder"
      >
        <form onSubmit={handleSaveReminder} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[#71717a] mb-1">
              Reminder Title
            </label>
            <input
              type="text"
              value={reminderTitle}
              onChange={(e) => setReminderTitle(e.target.value)}
              placeholder="e.g. Review server metrics"
              className="w-full bg-[#09090b] border border-[#27272a] rounded-lg p-2.5 text-xs text-[#f4f4f5] outline-none focus:border-[#e4e4e7]"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[#71717a] mb-1">
              Priority Level
            </label>
            <select
              value={reminderPriority}
              onChange={(e) => setReminderPriority(e.target.value)}
              className="w-full bg-[#09090b] border border-[#27272a] rounded-lg p-2.5 text-xs text-[#f4f4f5] outline-none"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsReminderModalOpen(false)}
              className="px-3 py-1.5 text-xs text-[#a1a1aa]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#e4e4e7] text-[#09090b] rounded-lg text-xs font-semibold hover:bg-white"
            >
              Add Reminder
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PlannerView;
