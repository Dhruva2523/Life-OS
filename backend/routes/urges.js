import express from 'express';
import UrgeLog from '../models/UrgeLog.js';

const router = express.Router();

// GET list of urge logs
router.get('/', async (req, res) => {
  try {
    const logs = await UrgeLog.find().sort({ createdAt: -1 }).limit(50);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET urge statistics
router.get('/stats', async (req, res) => {
  try {
    const totalCount = await UrgeLog.countDocuments();
    const survivedCount = await UrgeLog.countDocuments({ state: 'survived' });
    const relapsedCount = await UrgeLog.countDocuments({ state: 'relapsed' });

    // Emotion breakdown
    const emotionAggregation = await UrgeLog.aggregate([
      { $group: { _id: '$triggerEmotion', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      totalCount,
      survivedCount,
      relapsedCount,
      successRate: totalCount > 0 ? Math.round((survivedCount / totalCount) * 100) : 100,
      emotionBreakdown: emotionAggregation,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST log urge intercept event
router.post('/', async (req, res) => {
  try {
    const { target, state, triggerEmotion, delayCompletedMinutes, reflection } = req.body;
    if (!state) {
      return res.status(400).json({ error: 'Urge state (survived/relapsed) is required' });
    }

    const urge = new UrgeLog({
      target: target || 'other',
      state,
      triggerEmotion: triggerEmotion || 'Boredom',
      delayCompletedMinutes: delayCompletedMinutes || 3,
      reflection: reflection || '',
    });

    await urge.save();
    res.status(201).json(urge);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
