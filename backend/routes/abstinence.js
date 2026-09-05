import express from 'express';
import AbstinenceTracker from '../models/AbstinenceTracker.js';

const router = express.Router();

// GET all abstinence trackers with computed clean duration stats
router.get('/', async (req, res) => {
  try {
    const trackers = await AbstinenceTracker.find({ active: true }).sort({ createdAt: 1 });
    const now = new Date();

    const result = trackers.map(t => {
      const start = new Date(t.startDate);
      const diffMs = Math.max(0, now - start);
      const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
      const days = Math.floor(totalHours / 24);
      const hours = totalHours % 24;

      return {
        ...t.toObject(),
        cleanDays: days,
        cleanHours: hours,
        totalCleanHours: totalHours,
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new tracker
router.post('/', async (req, res) => {
  try {
    const { name, category, startDate } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Tracker name is required' });
    }

    const tracker = new AbstinenceTracker({
      name,
      category: category || 'custom',
      startDate: startDate || new Date(),
    });

    await tracker.save();
    res.status(201).json(tracker);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST log relapse & post-mortem
router.post('/:id/relapse', async (req, res) => {
  try {
    const { trigger, postMortem, correctiveAction } = req.body;
    const tracker = await AbstinenceTracker.findById(req.params.id);
    if (!tracker) {
      return res.status(404).json({ error: 'Abstinence tracker not found' });
    }

    const now = new Date();
    const start = new Date(tracker.startDate);
    const cleanDurationHours = Math.floor(Math.max(0, now - start) / (1000 * 60 * 60));

    // Append relapse entry to history
    tracker.history.push({
      relapsedAt: now,
      cleanDurationHours,
      trigger: trigger || 'Unspecified',
      postMortem: postMortem || '',
      correctiveAction: correctiveAction || '',
    });

    // Reset clean start date to current timestamp
    tracker.startDate = now;
    await tracker.save();

    res.json(tracker);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE tracker
router.delete('/:id', async (req, res) => {
  try {
    const tracker = await AbstinenceTracker.findByIdAndDelete(req.params.id);
    if (!tracker) {
      return res.status(404).json({ error: 'Tracker not found' });
    }
    res.json({ message: 'Tracker deleted', id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
