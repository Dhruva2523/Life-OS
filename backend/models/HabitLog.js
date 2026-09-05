import mongoose from 'mongoose';

const habitLogSchema = new mongoose.Schema({
  habitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    required: true,
    index: true,
  },
  date: {
    type: String, // Format: YYYY-MM-DD for timezone immunity
    required: true,
    index: true,
  },
  value: {
    type: Number, // 0 = incomplete, 1 = completed
    enum: [0, 1],
    default: 0,
  },
}, {
  timestamps: true,
});

// Ensure a habit can only have one log entry per date
habitLogSchema.index({ habitId: 1, date: 1 }, { unique: true });

export default mongoose.model('HabitLog', habitLogSchema);
