import mongoose from 'mongoose';

const urgeLogSchema = new mongoose.Schema({
  target: {
    type: String,
    enum: ['porn', 'social_media', 'procrastination', 'other'],
    default: 'other',
  },
  state: {
    type: String,
    enum: ['survived', 'relapsed'],
    required: true,
  },
  triggerEmotion: {
    type: String,
    enum: ['Boredom', 'Loneliness', 'Stress', 'Fatigue', 'Anxiety', 'Other'],
    default: 'Boredom',
  },
  delayCompletedMinutes: {
    type: Number,
    default: 3,
  },
  reflection: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('UrgeLog', urgeLogSchema);
