import React, { useState, useEffect } from 'react';
import { Plus, ShieldAlert, AlertTriangle, History, Trash2, Clock } from 'lucide-react';
import api from '../../api/client';
import Modal from '../Common/Modal';

const AbstinenceSection = () => {
  const [trackers, setTrackers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHistory, setSelectedHistory] = useState(null);

  // Modal state - Create Tracker
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [trackerName, setTrackerName] = useState('');
  const [trackerCategory, setTrackerCategory] = useState('porn');

  // Modal state - Relapse Post-Mortem
  const [relapseTracker, setRelapseTracker] = useState(null);
  const [relapseTrigger, setRelapseTrigger] = useState('Boredom');
  const [postMortemText, setPostMortemText] = useState('');
  const [correctiveActionText, setCorrectiveActionText] = useState('');

  const fetchTrackers = async () => {
    try {
      setLoading(true);
      const res = await api.getAbstinenceTrackers();
      setTrackers(res.data);
    } catch (err) {
      console.error('Error fetching abstinence trackers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackers();
  }, []);

  const handleCreateTracker = async (e) => {
    e.preventDefault();
    if (!trackerName.trim()) return;

    try {
      await api.createAbstinenceTracker({
        name: trackerName.trim(),
        category: trackerCategory,
        startDate: new Date(),
      });
      setTrackerName('');
      setIsCreateOpen(false);
      fetchTrackers();
    } catch (err) {
      console.error('Error creating tracker:', err);
    }
  };

  const handleOpenRelapseModal = (tracker) => {
    setRelapseTracker(tracker);
    setRelapseTrigger('Boredom');
    setPostMortemText('');
    setCorrectiveActionText('');
  };

  const handleSaveRelapse = async (e) => {
    e.preventDefault();
    if (!relapseTracker) return;

    try {
      await api.logRelapse(relapseTracker._id, {
        trigger: relapseTrigger,
        postMortem: postMortemText.trim(),
        correctiveAction: correctiveActionText.trim(),
      });
      setRelapseTracker(null);
      fetchTrackers();
    } catch (err) {
      console.error('Error logging relapse:', err);
    }
  };

  const handleDeleteTracker = async (id) => {
    try {
      await api.deleteAbstinenceTracker(id);
      fetchTrackers();
    } catch (err) {
      console.error('Error deleting tracker:', err);
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t border-[#27272a]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#71717a]">
            Abstinence & Avoidance Trackers
          </h2>
          <p className="text-[11px] text-[#a1a1aa]">Clinical clean-run counters and environment post-mortems</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center space-x-1 text-[11px] bg-[#27272a] hover:bg-[#3f3f46] text-[#f4f4f5] px-2.5 py-1 rounded-md transition-colors"
        >
          <Plus className="w-3 h-3" />
          <span>Add Protocol</span>
        </button>
      </div>

      {trackers.length === 0 ? (
        <div className="p-4 bg-[#18181b] border border-[#27272a] rounded-xl text-center text-xs text-[#71717a]">
          No active avoidance protocols set up. Add a protocol (e.g. "Porn-Free", "Zero Doomscrolling").
        </div>
      ) : (
        <div className="space-y-3">
          {trackers.map((t) => (
            <div
              key={t._id}
              className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#27272a] text-[#a1a1aa]">
                      {t.category}
                    </span>
                    <span className="text-[10px] font-mono text-[#71717a]">
                      Started: {new Date(t.startDate).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-[#f4f4f5] mt-1">{t.name}</h3>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenRelapseModal(t)}
                    className="flex items-center space-x-1 px-2.5 py-1 bg-red-500/10 border border-red-500/30 text-red-400 rounded-md text-[11px] font-medium hover:bg-red-500/20 transition-colors"
                  >
                    <AlertTriangle className="w-3 h-3" />
                    <span>Log Relapse</span>
                  </button>
                  <button
                    onClick={() => handleDeleteTracker(t._id)}
                    className="p-1 text-[#71717a] hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Clean Time High-Precision Display */}
              <div className="flex items-center justify-between p-3 bg-[#09090b]/60 border border-[#27272a] rounded-lg">
                <span className="text-xs text-[#a1a1aa] font-medium">Clean Duration:</span>
                <span className="text-base font-mono font-bold text-[#f4f4f5] tracking-tight">
                  {t.cleanDays}d {t.cleanHours}h clean
                </span>
              </div>

              {/* Relapse History Accordion Link */}
              {t.history && t.history.length > 0 && (
                <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-[#71717a]">
                  <span>Total Relapses Logged: {t.history.length}</span>
                  <button
                    onClick={() => setSelectedHistory(selectedHistory === t._id ? null : t._id)}
                    className="text-[#a1a1aa] hover:text-[#f4f4f5] flex items-center space-x-1"
                  >
                    <History className="w-3 h-3" />
                    <span>{selectedHistory === t._id ? 'Hide History' : 'View Post-Mortems'}</span>
                  </button>
                </div>
              )}

              {/* Relapse History Drawer */}
              {selectedHistory === t._id && t.history && (
                <div className="space-y-2 pt-2 border-t border-[#27272a]/60">
                  {t.history.map((item, idx) => (
                    <div key={idx} className="p-2.5 bg-[#09090b] border border-[#27272a] rounded-lg space-y-1 text-xs">
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#71717a]">
                        <span>Relapsed on: {new Date(item.relapsedAt).toLocaleDateString()}</span>
                        <span>Streak was: {item.cleanDurationHours}h</span>
                      </div>
                      <p className="text-[#f4f4f5] font-medium text-[11px]">Trigger: {item.trigger}</p>
                      {item.postMortem && (
                        <p className="text-[#a1a1aa] text-[11px]"><span className="text-[#71717a]">Post-Mortem:</span> {item.postMortem}</p>
                      )}
                      {item.correctiveAction && (
                        <p className="text-emerald-400 text-[11px]"><span className="text-[#71717a]">Countermeasure:</span> {item.correctiveAction}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Avoidance Protocol Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add Avoidance Protocol"
      >
        <form onSubmit={handleCreateTracker} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[#71717a] mb-1">
              Protocol Name
            </label>
            <input
              type="text"
              value={trackerName}
              onChange={(e) => setTrackerName(e.target.value)}
              placeholder="e.g. Porn-Free Clean Run"
              className="w-full bg-[#09090b] border border-[#27272a] rounded-lg p-2.5 text-xs text-[#f4f4f5] outline-none focus:border-[#e4e4e7]"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[#71717a] mb-1">
              Category
            </label>
            <select
              value={trackerCategory}
              onChange={(e) => setTrackerCategory(e.target.value)}
              className="w-full bg-[#09090b] border border-[#27272a] rounded-lg p-2.5 text-xs text-[#f4f4f5] outline-none"
            >
              <option value="porn">Adult Content / Porn</option>
              <option value="social_media">Doomscrolling / Social Media</option>
              <option value="procrastination">Chronic Procrastination</option>
              <option value="custom">Custom Avoidance</option>
            </select>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-3 py-1.5 text-xs text-[#a1a1aa]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#e4e4e7] text-[#09090b] rounded-lg text-xs font-semibold hover:bg-white"
            >
              Start Protocol
            </button>
          </div>
        </form>
      </Modal>

      {/* Relapse Post-Mortem Modal */}
      <Modal
        isOpen={Boolean(relapseTracker)}
        onClose={() => setRelapseTracker(null)}
        title="Clinical Relapse Post-Mortem"
      >
        <form onSubmit={handleSaveRelapse} className="space-y-4">
          <p className="text-xs text-[#a1a1aa]">
            Non-judgmental analysis. Identify what environment friction was missing and define a concrete countermeasure rule.
          </p>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[#71717a] mb-1">
              Primary Emotional / Environmental Trigger
            </label>
            <select
              value={relapseTrigger}
              onChange={(e) => setRelapseTrigger(e.target.value)}
              className="w-full bg-[#09090b] border border-[#27272a] rounded-lg p-2.5 text-xs text-[#f4f4f5] outline-none"
            >
              <option value="Boredom">Boredom & Idle Time</option>
              <option value="Late Night Phone">Late Night Unmonitored Phone Usage</option>
              <option value="Stress / Work Pressure">Stress & Work Pressure</option>
              <option value="Loneliness">Loneliness & Isolation</option>
              <option value="Fatigue / Exhaustion">Fatigue & Exhaustion</option>
              <option value="Social Media Cue">Social Media Cue / Trigger Image</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[#71717a] mb-1">
              Honest Post-Mortem (What failed?)
            </label>
            <textarea
              value={postMortemText}
              onChange={(e) => setPostMortemText(e.target.value)}
              placeholder="e.g., Brought iPhone into bedroom after 11 PM without phone lock..."
              rows={3}
              className="w-full bg-[#09090b] border border-[#27272a] rounded-lg p-2.5 text-xs text-[#f4f4f5] outline-none focus:border-[#e4e4e7]"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[#71717a] mb-1">
              Corrective Action / Rule for Next Time
            </label>
            <textarea
              value={correctiveActionText}
              onChange={(e) => setCorrectiveActionText(e.target.value)}
              placeholder="e.g., Charge phone in kitchen at 10 PM permanently."
              rows={2}
              className="w-full bg-[#09090b] border border-[#27272a] rounded-lg p-2.5 text-xs text-[#f4f4f5] outline-none focus:border-[#e4e4e7]"
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={() => setRelapseTracker(null)}
              className="px-3 py-1.5 text-xs text-[#a1a1aa]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600"
            >
              Save Post-Mortem & Reset Counter
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AbstinenceSection;
