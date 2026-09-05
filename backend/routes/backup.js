import express from 'express';
import Habit from '../models/Habit.js';
import HabitLog from '../models/HabitLog.js';
import Note from '../models/Note.js';
import ScheduleItem from '../models/ScheduleItem.js';
import Reminder from '../models/Reminder.js';
import AbstinenceTracker from '../models/AbstinenceTracker.js';
import UrgeLog from '../models/UrgeLog.js';
import VaultItem from '../models/VaultItem.js';

const router = express.Router();

// GET /api/v1/backup/export
router.get('/export', async (req, res) => {
  try {
    const [
      habits,
      habitLogs,
      notes,
      scheduleItems,
      reminders,
      abstinenceTrackers,
      urgeLogs,
      vaultItems
    ] = await Promise.all([
      Habit.find().lean(),
      HabitLog.find().lean(),
      Note.find().lean(),
      ScheduleItem.find().lean(),
      Reminder.find().lean(),
      AbstinenceTracker.find().lean(),
      UrgeLog.find().lean(),
      VaultItem.find().lean()
    ]);

    const backupData = {
      meta: {
        appName: 'Self OS',
        version: '2.0.0',
        exportedAt: new Date().toISOString(),
      },
      habits,
      habitLogs,
      notes,
      scheduleItems,
      reminders,
      abstinenceTrackers,
      urgeLogs,
      vaultItems,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="self_os_backup.json"');
    res.send(JSON.stringify(backupData, null, 2));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/backup/import
router.post('/import', async (req, res) => {
  try {
    const backupData = req.body;

    if (!backupData || typeof backupData !== 'object') {
      return res.status(400).json({ error: 'Invalid backup file format' });
    }

    const {
      habits,
      habitLogs,
      notes,
      scheduleItems,
      reminders,
      abstinenceTrackers,
      urgeLogs,
      vaultItems
    } = backupData;

    if (!Array.isArray(habits) || !Array.isArray(notes)) {
      return res.status(400).json({ error: 'Backup JSON missing required collection arrays' });
    }

    // Clear existing collections safely
    await Promise.all([
      Habit.deleteMany({}),
      HabitLog.deleteMany({}),
      Note.deleteMany({}),
      ScheduleItem.deleteMany({}),
      Reminder.deleteMany({}),
      AbstinenceTracker.deleteMany({}),
      UrgeLog.deleteMany({}),
      VaultItem.deleteMany({}),
    ]);

    // Restore collections if data exists
    if (habits && habits.length > 0) await Habit.insertMany(habits);
    if (habitLogs && habitLogs.length > 0) await HabitLog.insertMany(habitLogs);
    if (notes && notes.length > 0) await Note.insertMany(notes);
    if (scheduleItems && scheduleItems.length > 0) await ScheduleItem.insertMany(scheduleItems);
    if (reminders && reminders.length > 0) await Reminder.insertMany(reminders);
    if (abstinenceTrackers && abstinenceTrackers.length > 0) await AbstinenceTracker.insertMany(abstinenceTrackers);
    if (urgeLogs && urgeLogs.length > 0) await UrgeLog.insertMany(urgeLogs);
    if (vaultItems && vaultItems.length > 0) await VaultItem.insertMany(vaultItems);

    res.json({
      message: 'Database successfully restored from backup',
      stats: {
        habitsRestored: habits ? habits.length : 0,
        logsRestored: habitLogs ? habitLogs.length : 0,
        notesRestored: notes ? notes.length : 0,
        scheduleRestored: scheduleItems ? scheduleItems.length : 0,
        remindersRestored: reminders ? reminders.length : 0,
        abstinenceRestored: abstinenceTrackers ? abstinenceTrackers.length : 0,
        urgesRestored: urgeLogs ? urgeLogs.length : 0,
        vaultRestored: vaultItems ? vaultItems.length : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
