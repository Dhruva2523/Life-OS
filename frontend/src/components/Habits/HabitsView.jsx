import React, { useState, useEffect } from 'react';
import { Plus, Check, Edit2, Archive } from 'lucide-react';
import api from '../../api/client';
import Modal from '../Common/Modal';
import AbstinenceSection from '../Abstinence/AbstinenceSection';

const HabitsView = () => {
  const [matrixData, setMatrixData] = useState({ dates: [], matrix: [] });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

  // Form state
  const [habitName, setHabitName] = useState('');
  const [habitDesc, setHabitDesc] = useState('');
  const [habitFreq, setHabitFreq] = useState('daily');

  const todayStr = new Date().toISOString().split('T')[0];

  const fetchMatrix = async () => {
    try {
      setLoading(true);
      const res = await api.getHabitMatrix();
      setMatrixData(res.data);
    } catch (err) {
      console.error('Error fetching habit matrix:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatrix();
  }, []);

  const handleToggle = async (habitId, dateStr) => {
    setMatrixData(prev => {
      const updatedMatrix = prev.matrix.map(item => {
        if (item.habit._id === habitId) {
          const updatedLast7 = item.last7Days.map(day => {
            if (day.date === dateStr) {
              return { ...day, value: day.value === 1 ? 0 : 1 };
            }
            return day;
          });
          return { ...item, last7Days: updatedLast7 };
        }
        return item;
      });
      return { ...prev, matrix: updatedMatrix };
    });

    try {
      await api.toggleHabit(habitId, dateStr);
      fetchMatrix();
    } catch (err) {
      fetchMatrix();
    }
  };

  const handleOpenCreate = () => {
    setEditingHabit(null);
    setHabitName('');
    setHabitDesc('');
    setHabitFreq('daily');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (habit) => {
    setEditingHabit(habit);
    setHabitName(habit.name);
    setHabitDesc(habit.description || '');
    setHabitFreq(habit.frequency || 'daily');
    setIsModalOpen(true);
  };

  const handleSaveHabit = async (e) => {
    e.preventDefault();
    if (!habitName.trim()) return;

    try {
      if (editingHabit) {
        await api.updateHabit(editingHabit._id, {
          name: habitName.trim(),
          description: habitDesc.trim(),
          frequency: habitFreq,
        });
      } else {
        await api.createHabit({
          name: habitName.trim(),
          description: habitDesc.trim(),
          frequency: habitFreq,
        });
      }
      setIsModalOpen(false);
      fetchMatrix();
    } catch (err) {
      console.error('Error saving habit:', err);
    }
  };

  const handleArchiveToggle = async (habitId) => {
    try {
      await api.archiveHabit(habitId);
      fetchMatrix();
    } catch (err) {
      console.error('Error archiving habit:', err);
    }
  };

  const getDayLetter = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'narrow' });
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between pt-2 border-b border-[#27272a] pb-4">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-widest text-[#71717a]">
            Protocol Engine
          </span>
          <h1 className="text-xl font-bold text-[#f4f4f5] tracking-tight">Habits & Abstinence</h1>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center space-x-1.5 bg-[#e4e4e7] text-[#09090b] px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-white transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Habit</span>
        </button>
      </div>

      {/* 7-Day Positive Habit Matrix Table */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
          <span className="text-xs font-semibold text-[#f4f4f5] uppercase tracking-wider">
            Positive Habits 0/1 Matrix
          </span>
          <div className="flex items-center space-x-3 text-[10px] text-[#71717a] font-mono">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-[#e4e4e7] inline-block" />
              <span>1 = Done</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-[#27272a] inline-block" />
              <span>0 = Pending</span>
            </span>
          </div>
        </div>

        {matrixData.matrix.length === 0 ? (
          <div className="text-center py-6 text-xs text-[#71717a]">
            No positive habits logged yet. Click "New Habit" to start your protocol.
          </div>
        ) : (
          <div className="space-y-3">
            {matrixData.matrix.map(({ habit, last7Days, currentStreak, bestStreak, monthlyConsistency }) => (
              <div
                key={habit._id}
                className="bg-[#09090b]/40 border border-[#27272a] rounded-lg p-3 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-semibold text-[#f4f4f5]">{habit.name}</h3>
                    {habit.description && (
                      <p className="text-[11px] text-[#71717a] mt-0.5">{habit.description}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenEdit(habit)}
                      className="p-1 text-[#71717a] hover:text-[#a1a1aa] transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleArchiveToggle(habit._id)}
                      className="p-1 text-[#71717a] hover:text-red-400 transition-colors"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 7-Day Grid Buttons */}
                <div className="grid grid-cols-7 gap-1.5 pt-1">
                  {last7Days.map((day) => {
                    const isToday = day.date === todayStr;
                    const isDone = day.value === 1;
                    return (
                      <div key={day.date} className="flex flex-col items-center space-y-1">
                        <span className={`text-[9px] font-mono ${isToday ? 'text-[#e4e4e7] font-bold' : 'text-[#71717a]'}`}>
                          {getDayLetter(day.date)}
                        </span>
                        <button
                          onClick={() => handleToggle(habit._id, day.date)}
                          className={`w-full aspect-square rounded-md flex items-center justify-center font-mono text-[11px] transition-all ${
                            isDone
                              ? 'bg-[#e4e4e7] text-[#09090b] font-bold shadow-sm'
                              : 'bg-[#18181b] border border-[#27272a] text-[#71717a] hover:border-[#3f3f46]'
                          } ${isToday ? 'ring-1 ring-[#e4e4e7]/40' : ''}`}
                        >
                          {isDone ? '1' : '0'}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Consistency Metrics Banner */}
                <div className="pt-2 border-t border-[#27272a]/60 flex items-center justify-between text-[10px] font-mono text-[#a1a1aa]">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[#71717a]">Streak:</span>
                    <span className="text-[#f4f4f5] font-semibold">{currentStreak}d</span>
                    <span className="text-[#71717a]">(Best: {bestStreak}d)</span>
                  </div>
                  <div>
                    <span className="text-[#71717a]">Monthly:</span>{' '}
                    <span className="text-[#f4f4f5] font-semibold">{monthlyConsistency}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Abstinence & Avoidance Trackers Section */}
      <AbstinenceSection />

      {/* Habit Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingHabit ? 'Edit Habit' : 'Create New Habit'}
      >
        <form onSubmit={handleSaveHabit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[#71717a] mb-1">
              Habit Name
            </label>
            <input
              type="text"
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
              placeholder="e.g., Deep Work (90 Mins)"
              className="w-full bg-[#09090b] border border-[#27272a] rounded-lg p-2.5 text-xs text-[#f4f4f5] outline-none focus:border-[#e4e4e7]"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[#71717a] mb-1">
              Description / Notes
            </label>
            <textarea
              value={habitDesc}
              onChange={(e) => setHabitDesc(e.target.value)}
              placeholder="Optional habit protocol context..."
              rows={2}
              className="w-full bg-[#09090b] border border-[#27272a] rounded-lg p-2.5 text-xs text-[#f4f4f5] outline-none focus:border-[#e4e4e7]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[#71717a] mb-1">
              Frequency
            </label>
            <select
              value={habitFreq}
              onChange={(e) => setHabitFreq(e.target.value)}
              className="w-full bg-[#09090b] border border-[#27272a] rounded-lg p-2.5 text-xs text-[#f4f4f5] outline-none focus:border-[#e4e4e7]"
            >
              <option value="daily">Daily</option>
              <option value="weekdays">Weekdays</option>
              <option value="weekends">Weekends</option>
            </select>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-1.5 text-xs text-[#a1a1aa] hover:text-[#f4f4f5]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#e4e4e7] text-[#09090b] rounded-lg text-xs font-semibold hover:bg-white transition-colors"
            >
              Save Habit
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HabitsView;
