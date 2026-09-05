import React, { useState, useEffect } from 'react';
import { Check, Plus, Clock, ArrowRight, ShieldAlert, Zap, Flame } from 'lucide-react';
import api from '../../api/client';
import UrgeInterceptorModal from './UrgeInterceptorModal';

const DashboardView = ({ onNavigate }) => {
  const [habits, setHabits] = useState([]);
  const [todayLogs, setTodayLogs] = useState({});
  const [scheduleItems, setScheduleItems] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [urgeStats, setUrgeStats] = useState(null);
  const [quickCaptureText, setQuickCaptureText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUrgeModalOpen, setIsUrgeModalOpen] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const dateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [habitsRes, logsRes, scheduleRes, remindersRes, urgeStatsRes] = await Promise.all([
        api.getHabits(false),
        api.getHabitLogs({ date: todayStr }),
        api.getSchedule(todayStr),
        api.getReminders({ date: todayStr }),
        api.getUrgeStats(),
      ]);

      setHabits(habitsRes.data);

      const logsMap = {};
      logsRes.data.forEach(log => {
        logsMap[log.habitId] = log.value;
      });
      setTodayLogs(logsMap);

      setScheduleItems(scheduleRes.data);
      setReminders(remindersRes.data);
      setUrgeStats(urgeStatsRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleHabit = async (habitId) => {
    const currentVal = todayLogs[habitId] || 0;
    const newVal = currentVal === 1 ? 0 : 1;

    setTodayLogs(prev => ({
      ...prev,
      [habitId]: newVal
    }));

    try {
      await api.toggleHabit(habitId, todayStr);
    } catch (err) {
      setTodayLogs(prev => ({
        ...prev,
        [habitId]: currentVal
      }));
    }
  };

  const handleQuickCapture = async (e) => {
    e.preventDefault();
    if (!quickCaptureText.trim()) return;

    try {
      setIsSubmitting(true);
      await api.createNote({
        title: quickCaptureText.trim(),
        content: '',
        type: 'note',
        tags: ['quick-capture'],
        date: todayStr,
      });
      setQuickCaptureText('');
    } catch (err) {
      console.error('Error in quick capture:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const totalHabitsCount = habits.length;
  const completedHabitsCount = habits.filter(h => todayLogs[h._id] === 1).length;
  const habitCompletionPct = totalHabitsCount > 0 ? Math.round((completedHabitsCount / totalHabitsCount) * 100) : 0;

  return (
    <div className="space-y-6 pb-24">
      {/* Prominent High-Friction Calm Action Button: Urge Intercept */}
      <div className="pt-2">
        <button
          onClick={() => setIsUrgeModalOpen(true)}
          className="w-full py-3.5 px-4 bg-[#18181b] border-2 border-[#27272a] hover:border-[#e4e4e7] rounded-xl flex items-center justify-between shadow-lg transition-all active:scale-[0.99] group"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-[#27272a] group-hover:bg-[#e4e4e7] group-hover:text-[#09090b] text-[#f4f4f5] transition-colors">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-[#f4f4f5] block">
                Urge Intercept Protocol
              </span>
              <span className="text-[11px] text-[#71717a] block">
                Compulsion wave spike? Tap to activate 180s calm delay
              </span>
            </div>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-[#27272a] text-[#e4e4e7]">
            Intercept &rarr;
          </span>
        </button>
      </div>

      {/* Editorial Header */}
      <div className="border-b border-[#27272a] pb-4">
        <span className="text-[11px] font-medium uppercase tracking-widest text-[#71717a]">
          Self OS &bull; Daily Overview
        </span>
        <h1 className="text-xl font-bold text-[#f4f4f5] mt-1 tracking-tight">
          {dateFormatted}
        </h1>

        {/* Anti-Dopamine & Habit Stats Grid */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-3">
            <span className="text-[10px] uppercase font-mono text-[#71717a] block">Daily Protocol</span>
            <span className="text-sm font-mono font-bold text-[#f4f4f5] mt-0.5 block">
              {completedHabitsCount}/{totalHabitsCount} ({habitCompletionPct}%)
            </span>
          </div>

          <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-3">
            <span className="text-[10px] uppercase font-mono text-[#71717a] block">Urges Survived</span>
            <span className="text-sm font-mono font-bold text-[#f4f4f5] mt-0.5 block">
              {urgeStats ? `${urgeStats.survivedCount} Defeated (${urgeStats.successRate}%)` : '0 Defeated'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Capture Bar */}
      <form onSubmit={handleQuickCapture} className="relative">
        <input
          type="text"
          value={quickCaptureText}
          onChange={(e) => setQuickCaptureText(e.target.value)}
          placeholder="Quick capture thought or task..."
          className="w-full bg-[#18181b] border border-[#27272a] focus:border-[#e4e4e7] rounded-lg px-3.5 py-2.5 text-xs text-[#f4f4f5] placeholder-[#71717a] outline-none transition-colors pr-10"
        />
        <button
          type="submit"
          disabled={isSubmitting || !quickCaptureText.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#71717a] hover:text-[#f4f4f5] disabled:opacity-30 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </form>

      {/* Today's Habits Checklist */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#71717a]">
            Today's Habits
          </h2>
          <button
            onClick={() => onNavigate('habits')}
            className="text-[11px] text-[#a1a1aa] hover:text-[#f4f4f5] flex items-center space-x-1"
          >
            <span>View Matrix</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {habits.length === 0 ? (
          <div className="p-4 bg-[#18181b] border border-[#27272a] rounded-lg text-center text-xs text-[#71717a]">
            No active habits. Create one in the Habits tab.
          </div>
        ) : (
          <div className="space-y-1.5">
            {habits.map((habit) => {
              const isCompleted = todayLogs[habit._id] === 1;
              return (
                <div
                  key={habit._id}
                  onClick={() => handleToggleHabit(habit._id)}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                    isCompleted
                      ? 'bg-[#18181b]/50 border-[#27272a] text-[#71717a]'
                      : 'bg-[#18181b] border-[#27272a] text-[#f4f4f5] hover:border-[#3f3f46]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                        isCompleted
                          ? 'bg-[#e4e4e7] border-[#e4e4e7] text-[#09090b]'
                          : 'border-[#3f3f46] bg-transparent'
                      }`}
                    >
                      {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                    </div>
                    <span className={`text-xs font-medium ${isCompleted ? 'line-through' : ''}`}>
                      {habit.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#71717a] uppercase">
                    {isCompleted ? '1' : '0'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Today's Agenda */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#71717a]">
            Today's Agenda
          </h2>
          <button
            onClick={() => onNavigate('planner')}
            className="text-[11px] text-[#a1a1aa] hover:text-[#f4f4f5] flex items-center space-x-1"
          >
            <span>Planner</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {scheduleItems.length === 0 && reminders.length === 0 ? (
          <div className="p-4 bg-[#18181b] border border-[#27272a] rounded-lg text-center text-xs text-[#71717a]">
            No schedule blocks or reminders set for today.
          </div>
        ) : (
          <div className="space-y-2">
            {scheduleItems.map((item) => (
              <div
                key={item._id}
                onClick={() => handleToggleSchedule(item._id)}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                  item.completed ? 'bg-[#18181b]/50 border-[#27272a] opacity-50' : 'bg-[#18181b] border-[#27272a]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-[#71717a]" />
                  <div>
                    <p className={`text-xs font-medium ${item.completed ? 'line-through text-[#71717a]' : 'text-[#f4f4f5]'}`}>
                      {item.title}
                    </p>
                    <p className="text-[10px] font-mono text-[#71717a]">
                      {item.startTime} &ndash; {item.endTime}
                    </p>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${item.completed ? 'bg-[#e4e4e7] border-[#e4e4e7] text-[#09090b]' : 'border-[#3f3f46]'}`}>
                  {item.completed && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
            ))}

            {reminders.map((r) => (
              <div
                key={r._id}
                onClick={() => handleToggleReminder(r._id)}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                  r.completed ? 'bg-[#18181b]/50 border-[#27272a] opacity-50' : 'bg-[#18181b] border-[#27272a]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-1.5 h-1.5 rounded-full ${r.priority === 'high' ? 'bg-red-400' : r.priority === 'medium' ? 'bg-amber-400' : 'bg-slate-400'}`} />
                  <span className={`text-xs font-medium ${r.completed ? 'line-through text-[#71717a]' : 'text-[#f4f4f5]'}`}>
                    {r.title}
                  </span>
                </div>
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${r.completed ? 'bg-[#e4e4e7] border-[#e4e4e7] text-[#09090b]' : 'border-[#3f3f46]'}`}>
                  {r.completed && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Urge Interceptor Full Screen Modal */}
      <UrgeInterceptorModal
        isOpen={isUrgeModalOpen}
        onClose={() => setIsUrgeModalOpen(false)}
        onOpenPostMortem={() => onNavigate('habits')}
      />
    </div>
  );
};

export default DashboardView;
