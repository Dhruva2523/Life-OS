import mongoose from 'mongoose';

const scheduleItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  startTime: {
    type: String, // HH:mm format, e.g., "09:00"
    required: true,
  },
  endTime: {
    type: String, // HH:mm format, e.g., "10:30"
    required: true,
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true,
    index: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

export default mongoose.model('ScheduleItem', scheduleItemSchema);
