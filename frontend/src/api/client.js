import axios from 'axios';

const MASTER_KEY = 'self_os_master_secret_2026';
const API_BASE = '/api/v1';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
    'x-master-key': MASTER_KEY,
  },
});

export const api = {
  // Habits
  getHabits: (archived = false) => client.get(`/habits?archived=${archived}`),
  createHabit: (data) => client.post('/habits', data),
  updateHabit: (id, data) => client.put(`/habits/${id}`, data),
  archiveHabit: (id) => client.patch(`/habits/${id}/archive`),
  getHabitLogs: (params) => client.get('/habits/logs', { params }),
  toggleHabit: (habitId, date) => client.post('/habits/toggle', { habitId, date }),
  getHabitMatrix: () => client.get('/habits/matrix'),

  // Abstinence Trackers
  getAbstinenceTrackers: () => client.get('/abstinence'),
  createAbstinenceTracker: (data) => client.post('/abstinence', data),
  logRelapse: (id, data) => client.post(`/abstinence/${id}/relapse`, data),
  deleteAbstinenceTracker: (id) => client.delete(`/abstinence/${id}`),

  // Urge Interceptor Logs
  logUrge: (data) => client.post('/urges', data),
  getUrges: () => client.get('/urges'),
  getUrgeStats: () => client.get('/urges/stats'),

  // Pinned Quick-Access Vault
  getVaultItems: (category) => client.get('/vault', { params: { category } }),
  createVaultItem: (data) => client.post('/vault', data),
  updateVaultItem: (id, data) => client.put(`/vault/${id}`, data),
  deleteVaultItem: (id) => client.delete(`/vault/${id}`),

  // Notes & Journal
  getNotes: (params) => client.get('/notes', { params }),
  getNote: (id) => client.get(`/notes/${id}`),
  createNote: (data) => client.post('/notes', data),
  updateNote: (id, data) => client.put(`/notes/${id}`, data),
  deleteNote: (id) => client.delete(`/notes/${id}`),

  // Schedule
  getSchedule: (date) => client.get('/schedule', { params: { date } }),
  createScheduleItem: (data) => client.post('/schedule', data),
  updateScheduleItem: (id, data) => client.put(`/schedule/${id}`, data),
  toggleScheduleItem: (id) => client.patch(`/schedule/${id}/toggle`),
  deleteScheduleItem: (id) => client.delete(`/schedule/${id}`),

  // Reminders
  getReminders: (params) => client.get('/reminders', { params }),
  createReminder: (data) => client.post('/reminders', data),
  toggleReminder: (id) => client.patch(`/reminders/${id}/toggle`),
  deleteReminder: (id) => client.delete(`/reminders/${id}`),

  // Media Upload
  uploadPhoto: (formData) => client.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  // Backup & Import
  exportBackup: () => client.get('/backup/export', { responseType: 'blob' }),
  importBackup: (backupJson) => client.post('/backup/import', backupJson),
};

export default api;
