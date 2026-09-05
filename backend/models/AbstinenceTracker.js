import mongoose from 'mongoose';

const relapseHistorySchema = new mongoose.Schema({
  relapsedAt: {
    type: Date,
    default: Date.now,
  },
  cleanDurationHours: {
    type: Number,
    required: true,
  },
  trigger: {
    type: String,
    trim: true,
    default: 'Unspecified',
  },
  postMortem: {
    type: String,
    default: '',
  },
  correctiveAction: {
    type: String,
    default: '',
  },
}, { _id: true });

const abstinenceTrackerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: ['porn', 'social_media', 'procrastination', 'custom'],
    default: 'custom',
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  history: [relapseHistorySchema],
  active: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model('AbstinenceTracker', abstinenceTrackerSchema);
