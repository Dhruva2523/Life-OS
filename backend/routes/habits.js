import express from 'express';
import Habit from '../models/Habit.js';
import HabitLog from '../models/HabitLog.js';

const router = express.Router();

// Helper to format date as YYYY-MM-DD
const formatDate = (dateObj) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// GET all habits (active by default, optionally all)
router.get('/', async (req, res) => {
  try {
    const includeArchived = req.query.archived === 'true';
    const filter = includeArchived ? {} : { active: true };
    const habits = await Habit.find(filter).sort({ order: 1, createdAt: 1 });
    res.json(habits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new habit
router.post('/', async (req, res) => {
  try {
    const { name, description, frequency } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Habit name is required' });
    }
    const count = await Habit.countDocuments();
    const habit = new Habit({
      name,
      description: description || '',
      frequency: frequency || 'daily',
      order: count,
    });
    await habit.save();
    res.status(201).json(habit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update habit
router.put('/:id', async (req, res) => {
  try {
    const { name, description, frequency, active } = req.body;
    const habit = await Habit.findByIdAndUpdate(
      req.params.id,
      { name, description, frequency, active },
      { new: true, runValidators: true }
    );
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }
    res.json(habit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH toggle soft-archive
router.patch('/:id/archive', async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }
    habit.active = !habit.active;
    await habit.save();
    res.json(habit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET logs for a specific date or date range
router.get('/logs', async (req, res) => {
  try {
    const { date, startDate, endDate } = req.query;
    let query = {};
    if (date) {
      query.date = date;
    } else if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }
    const logs = await HabitLog.find(query);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST toggle binary 0/1 status for a habit on a date
router.post('/toggle', async (req, res) => {
  try {
    const { habitId, date } = req.body;
    const targetDate = date || formatDate(new Date());

    if (!habitId) {
      return res.status(400).json({ error: 'habitId is required' });
    }

    let log = await HabitLog.findOne({ habitId, date: targetDate });

    if (!log) {
      log = new HabitLog({ habitId, date: targetDate, value: 1 });
    } else {
      log.value = log.value === 1 ? 0 : 1;
    }

    await log.save();
    res.json({ habitId, date: targetDate, value: log.value, logId: log._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET 7-day rolling matrix & streak metrics
router.get('/matrix', async (req, res) => {
  try {
    const activeHabits = await Habit.find({ active: true }).sort({ order: 1 });
    
    // Generate last 7 dates [today-6, today-5, ... today]
    const dates = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dates.push(formatDate(d));
    }

    // Fetch logs for last 30 days for metrics computation
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDateStr = formatDate(thirtyDaysAgo);
    const todayStr = formatDate(today);

    const logs = await HabitLog.find({
      date: { $gte: startDateStr, $lte: todayStr }
    });

    // Map logs by `${habitId}_${date}`
    const logMap = new Map();
    logs.forEach(l => {
      logMap.set(`${l.habitId.toString()}_${l.date}`, l.value);
    });

    const result = activeHabits.map(habit => {
      const habitIdStr = habit._id.toString();

      // 7-day matrix values
      const last7Days = dates.map(d => ({
        date: d,
        value: logMap.get(`${habitIdStr}_${d}`) || 0
      }));

      // Calculate continuous streak (working backwards from today or yesterday)
      let currentStreak = 0;
      let checkDate = new Date(today);
      
      // If today is incomplete, allow yesterday to maintain streak
      const todayVal = logMap.get(`${habitIdStr}_${formatDate(checkDate)}`) || 0;
      if (todayVal === 0) {
        checkDate.setDate(checkDate.getDate() - 1);
      }

      while (true) {
        const dStr = formatDate(checkDate);
        const val = logMap.get(`${habitIdStr}_${dStr}`) || 0;
        if (val === 1) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }

      // Calculate best streak over 30 day window
      let bestStreak = 0;
      let tempStreak = 0;
      for (let i = 30; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const val = logMap.get(`${habitIdStr}_${formatDate(d)}`) || 0;
        if (val === 1) {
          tempStreak++;
          if (tempStreak > bestStreak) bestStreak = tempStreak;
        } else {
          tempStreak = 0;
        }
      }

      // 30 day completion percentage
      let completedIn30Days = 0;
      for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        if ((logMap.get(`${habitIdStr}_${formatDate(d)}`) || 0) === 1) {
          completedIn30Days++;
        }
      }
      const monthlyConsistency = Math.round((completedIn30Days / 30) * 100);

      return {
        habit,
        last7Days,
        currentStreak,
        bestStreak,
        monthlyConsistency,
      };
    });

    res.json({
      dates,
      matrix: result,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
