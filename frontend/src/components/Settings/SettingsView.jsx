import React, { useState } from 'react';
import { Download, Upload, Moon, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/client';

const SettingsView = () => {
  const { theme, toggleTheme } = useTheme();
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const handleExport = async () => {
    try {
      setExporting(true);
      setStatusMessage(null);
      const res = await api.exportBackup();

      // Trigger browser JSON file download
      const blob = new Blob([res.data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `self_os_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setStatusMessage({ type: 'success', text: 'Database exported successfully to self_os_backup.json' });
    } catch (err) {
      console.error('Export failed:', err);
      setStatusMessage({ type: 'error', text: 'Export failed. Ensure backend API is online.' });
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setImporting(true);
        setStatusMessage(null);

        const parsedJson = JSON.parse(event.target.result);
        if (!parsedJson.habits || !parsedJson.notes) {
          throw new Error('Invalid backup file structure.');
        }

        const res = await api.importBackup(parsedJson);
        setStatusMessage({
          type: 'success',
          text: `Database restored! Habits: ${res.data.stats.habitsRestored}, Notes: ${res.data.stats.notesRestored}, Logs: ${res.data.stats.logsRestored}.`
        });
      } catch (err) {
        console.error('Import failed:', err);
        setStatusMessage({
          type: 'error',
          text: err.message || 'Failed to import JSON file. Please ensure it is a valid self_os_backup.json file.'
        });
      } finally {
        setImporting(false);
        e.target.value = null; // reset input
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="pt-2 border-b border-[#27272a] pb-4">
        <span className="text-[11px] font-medium uppercase tracking-widest text-[#71717a]">
          System Controls
        </span>
        <h1 className="text-xl font-bold text-[#f4f4f5] tracking-tight">System Settings</h1>
      </div>

      {/* Status Notification Toast */}
      {statusMessage && (
        <div
          className={`p-3 rounded-lg border flex items-center space-x-2 text-xs font-medium ${
            statusMessage.type === 'success'
              ? 'bg-[#18181b] border-emerald-500/30 text-emerald-400'
              : 'bg-[#18181b] border-red-500/30 text-red-400'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Theme Settings */}
      <section className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Moon className="w-4 h-4 text-[#e4e4e7]" />
            <div>
              <h3 className="text-xs font-semibold text-[#f4f4f5]">Interface Visual Palette</h3>
              <p className="text-[11px] text-[#71717a]">Switch between editorial themes</p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="px-3 py-1.5 bg-[#27272a] hover:bg-[#3f3f46] text-[#f4f4f5] text-xs font-mono rounded-lg transition-colors capitalize"
          >
            {theme === 'obsidian' ? 'Obsidian Dark' : 'Minimal Slate'}
          </button>
        </div>
      </section>

      {/* Data Security & Permanence */}
      <section className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 space-y-4">
        <div className="flex items-center space-x-2.5 border-b border-[#27272a] pb-3">
          <ShieldCheck className="w-4 h-4 text-[#e4e4e7]" />
          <div>
            <h3 className="text-xs font-semibold text-[#f4f4f5]">Data Permanence Engine</h3>
            <p className="text-[11px] text-[#71717a]">100% Client-Controlled Local Backup & Restore</p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Data Export Button */}
          <div className="flex items-center justify-between p-3 bg-[#09090b]/50 border border-[#27272a] rounded-lg">
            <div>
              <h4 className="text-xs font-medium text-[#f4f4f5]">Export Full Database</h4>
              <p className="text-[10px] text-[#71717a]">Serializes habits, logs, notes & schedules to JSON</p>
            </div>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center space-x-1.5 bg-[#e4e4e7] text-[#09090b] px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-white transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{exporting ? 'Exporting...' : 'Export JSON'}</span>
            </button>
          </div>

          {/* Data Import Button */}
          <div className="flex items-center justify-between p-3 bg-[#09090b]/50 border border-[#27272a] rounded-lg">
            <div>
              <h4 className="text-xs font-medium text-[#f4f4f5]">Restore Database</h4>
              <p className="text-[10px] text-[#71717a]">Validates and restores uploaded JSON file into Mongo</p>
            </div>
            <label className="cursor-pointer flex items-center space-x-1.5 bg-[#27272a] text-[#f4f4f5] px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#3f3f46] transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>{importing ? 'Restoring...' : 'Import JSON'}</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={importing}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </section>

      {/* System Information */}
      <section className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 space-y-2 font-mono text-[11px] text-[#71717a]">
        <div className="flex justify-between">
          <span>Application:</span>
          <span className="text-[#f4f4f5]">Self OS v1.0.0</span>
        </div>
        <div className="flex justify-between">
          <span>Target Device:</span>
          <span className="text-[#f4f4f5]">iPhone 13 (Safari PWA)</span>
        </div>
        <div className="flex justify-between">
          <span>AI Status:</span>
          <span className="text-[#f4f4f5]">Disabled (0 AI calls)</span>
        </div>
        <div className="flex justify-between">
          <span>Security Profile:</span>
          <span className="text-[#f4f4f5]">Single Master Session Token</span>
        </div>
      </section>
    </div>
  );
};

export default SettingsView;
