import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import api from '../../api/client';

const UrgeInterceptorModal = ({ isOpen, onClose, onOpenPostMortem }) => {
  const [phase, setPhase] = useState(1); // 1: Delay Timer, 2: Emotion Interrogation, 3: Outcome
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(180); // 3 minutes (180s)
  const [selectedTarget, setSelectedTarget] = useState('porn');
  const [selectedEmotion, setSelectedEmotion] = useState('Boredom');
  const [reflectionText, setReflectionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let timer;
    if (isOpen && phase === 1 && timeLeftSeconds > 0) {
      timer = setInterval(() => {
        setTimeLeftSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, phase, timeLeftSeconds]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = String(timeLeftSeconds % 60).padStart(2, '0');
  const progressPct = Math.round(((180 - timeLeftSeconds) / 180) * 100);

  const handleReset = () => {
    setPhase(1);
    setTimeLeftSeconds(180);
    setSelectedTarget('porn');
    setSelectedEmotion('Boredom');
    setReflectionText('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleLogSurvived = async () => {
    try {
      setIsSubmitting(true);
      await api.logUrge({
        target: selectedTarget,
        state: 'survived',
        triggerEmotion: selectedEmotion,
        delayCompletedMinutes: Math.ceil((180 - timeLeftSeconds) / 60),
        reflection: reflectionText.trim(),
      });
      handleClose();
    } catch (err) {
      console.error('Error logging survived urge:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLaunchRelapse = () => {
    handleClose();
    if (onOpenPostMortem) {
      onOpenPostMortem();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#09090b] border border-[#27272a] rounded-2xl p-6 space-y-6 shadow-2xl relative overflow-hidden">
        
        {/* Serene Subdued Background Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-950/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-[#e4e4e7]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#f4f4f5]">
              Urge Intercept Protocol
            </span>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-md text-[#71717a] hover:text-[#f4f4f5] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Phase Indicator Stepper */}
        <div className="flex items-center justify-between text-[10px] font-mono text-[#71717a] border-b border-[#27272a]/60 pb-2">
          <span className={phase === 1 ? 'text-[#e4e4e7] font-semibold' : ''}>1. Calm Delay</span>
          <span className={phase === 2 ? 'text-[#e4e4e7] font-semibold' : ''}>2. Trigger Interrogation</span>
          <span className={phase === 3 ? 'text-[#e4e4e7] font-semibold' : ''}>3. Resolution</span>
        </div>

        {/* PHASE 1: Mandatory Calm Breathing / Countdown Timer */}
        {phase === 1 && (
          <div className="space-y-6 text-center py-2">
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              Dopamine spike detected. Pause. Do not react. Allow your nervous system 180 seconds to clear the compulsion wave.
            </p>

            {/* Breathing Ring Pulse & Timer */}
            <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-[#27272a] animate-ping opacity-25" />
              <div className="w-32 h-32 rounded-full border-2 border-[#e4e4e7]/20 flex flex-col items-center justify-center bg-[#18181b] space-y-1">
                <Clock className="w-4 h-4 text-[#71717a]" />
                <span className="text-2xl font-mono font-bold text-[#f4f4f5]">
                  {minutes}:{seconds}
                </span>
                <span className="text-[9px] font-mono uppercase text-[#71717a]">
                  {timeLeftSeconds > 0 ? 'Breathe Deeply' : 'Wave Passed'}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#18181b] h-1.5 rounded-full overflow-hidden border border-[#27272a]">
              <div
                className="bg-[#e4e4e7] h-full transition-all duration-1000 ease-linear"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            <div className="pt-2 flex items-center justify-center space-x-3">
              <button
                onClick={() => setPhase(2)}
                className="w-full py-2.5 bg-[#e4e4e7] text-[#09090b] rounded-lg text-xs font-semibold hover:bg-white transition-colors"
              >
                Proceed to Trigger Analysis &rarr;
              </button>
            </div>
          </div>
        )}

        {/* PHASE 2: Trigger Interrogation (Emotion & Target) */}
        {phase === 2 && (
          <div className="space-y-5 py-1">
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-[#71717a] mb-2">
                What compulsion are you intercepting?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'porn', label: 'Adult Media' },
                  { id: 'social_media', label: 'Doomscrolling' },
                  { id: 'procrastination', label: 'Procrastination' },
                  { id: 'other', label: 'Other Impulse' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTarget(t.id)}
                    className={`p-2.5 rounded-lg border text-xs font-medium text-left transition-colors ${
                      selectedTarget === t.id
                        ? 'bg-[#18181b] border-[#e4e4e7] text-[#f4f4f5]'
                        : 'bg-[#09090b] border-[#27272a] text-[#71717a] hover:text-[#a1a1aa]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-[#71717a] mb-2">
                Identify Underlying Emotional Driver
              </label>
              <div className="flex flex-wrap gap-2">
                {['Boredom', 'Loneliness', 'Stress', 'Fatigue', 'Anxiety'].map((emotion) => (
                  <button
                    key={emotion}
                    type="button"
                    onClick={() => setSelectedEmotion(emotion)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
                      selectedEmotion === emotion
                        ? 'bg-[#e4e4e7] text-[#09090b] font-bold border-[#e4e4e7]'
                        : 'bg-[#18181b] border-[#27272a] text-[#71717a] hover:text-[#f4f4f5]'
                    }`}
                  >
                    [{emotion}]
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-[#71717a] mb-1">
                Friction Reflection (Optional)
              </label>
              <textarea
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                placeholder="What environment trigger caused this surge? What countermeasure can you deploy right now?"
                rows={2}
                className="w-full bg-[#18181b] border border-[#27272a] rounded-lg p-2.5 text-xs text-[#f4f4f5] outline-none focus:border-[#e4e4e7]"
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setPhase(1)}
                className="px-3 py-2 text-xs text-[#71717a] hover:text-[#f4f4f5]"
              >
                Back
              </button>
              <button
                onClick={() => setPhase(3)}
                className="flex-1 py-2.5 bg-[#e4e4e7] text-[#09090b] rounded-lg text-xs font-semibold hover:bg-white transition-colors"
              >
                Review Resolution &rarr;
              </button>
            </div>
          </div>
        )}

        {/* PHASE 3: Resolution & Exit Action */}
        {phase === 3 && (
          <div className="space-y-5 text-center py-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#18181b] border border-[#27272a] flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-[#e4e4e7]" />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#f4f4f5]">Compulsion Defused</h3>
              <p className="text-xs text-[#71717a] mt-1">
                Target: <span className="text-[#f4f4f5] font-mono">{selectedTarget}</span> &bull; Driver: <span className="text-[#f4f4f5] font-mono">{selectedEmotion}</span>
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={handleLogSurvived}
                disabled={isSubmitting}
                className="w-full py-3 bg-[#e4e4e7] text-[#09090b] rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors"
              >
                Log as Defeated & Clear
              </button>

              <button
                onClick={handleLaunchRelapse}
                className="w-full py-2 bg-[#18181b] border border-red-500/30 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/10 transition-colors flex items-center justify-center space-x-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>I Relapsed &ndash; Open Post-Mortem</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UrgeInterceptorModal;
