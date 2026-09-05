import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    enum: ['note', 'journal', 'todo'],
    default: 'note',
    index: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  photoUrls: [{
    type: String,
  }],
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true,
    index: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Note', noteSchema);
