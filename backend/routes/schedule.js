import express from 'express';
import ScheduleItem from '../models/ScheduleItem.js';

const router = express.Router();

// GET schedule items for a specific date (defaults to today)
router.get('/', async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const date = req.query.date || todayStr;
    const items = await ScheduleItem.find({ date }).sort({ startTime: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create schedule item
router.post('/', async (req, res) => {
  try {
    const { title, startTime, endTime, date, completed } = req.body;
    if (!title || !startTime || !endTime) {
      return res.status(400).json({ error: 'Title, startTime, and endTime are required' });
    }
    const todayStr = new Date().toISOString().split('T')[0];

    const item = new ScheduleItem({
      title,
      startTime,
      endTime,
      date: date || todayStr,
      completed: completed || false,
    });

    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update schedule item
router.put('/:id', async (req, res) => {
  try {
    const { title, startTime, endTime, date, completed } = req.body;
    const item = await ScheduleItem.findByIdAndUpdate(
      req.params.id,
      { title, startTime, endTime, date, completed },
      { new: true, runValidators: true }
    );
    if (!item) {
      return res.status(404).json({ error: 'Schedule item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH toggle completion
router.patch('/:id/toggle', async (req, res) => {
  try {
    const item = await ScheduleItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Schedule item not found' });
    }
    item.completed = !item.completed;
    await item.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE schedule item
router.delete('/:id', async (req, res) => {
  try {
    const item = await ScheduleItem.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Schedule item not found' });
    }
    res.json({ message: 'Item deleted', id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
