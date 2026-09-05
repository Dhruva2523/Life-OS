import express from 'express';
import Reminder from '../models/Reminder.js';

const router = express.Router();

// GET reminders with optional date / completion filters
router.get('/', async (req, res) => {
  try {
    const { date, completed } = req.query;
    let filter = {};

    if (date) {
      filter.date = date;
    }
    if (completed !== undefined) {
      filter.completed = completed === 'true';
    }

    const reminders = await Reminder.find(filter).sort({ completed: 1, priority: -1, createdAt: -1 });
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create reminder
router.post('/', async (req, res) => {
  try {
    const { title, date, priority, completed } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    const todayStr = new Date().toISOString().split('T')[0];

    const reminder = new Reminder({
      title,
      date: date || todayStr,
      priority: priority || 'medium',
      completed: completed || false,
    });

    await reminder.save();
    res.status(201).json(reminder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH toggle completion status
router.patch('/:id/toggle', async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }
    reminder.completed = !reminder.completed;
    await reminder.save();
    res.json(reminder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE reminder
router.delete('/:id', async (req, res) => {
  try {
    const reminder = await Reminder.findByIdAndDelete(req.params.id);
    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }
    res.json({ message: 'Reminder deleted', id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
