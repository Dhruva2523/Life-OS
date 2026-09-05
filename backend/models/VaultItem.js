import mongoose from 'mongoose';

const vaultItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: ['document', 'identity', 'routine', 'emergency'],
    default: 'emergency',
  },
  content: {
    type: String,
    default: '',
  },
  fileUrls: [{
    type: String,
  }],
  pinned: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

export default mongoose.model('VaultItem', vaultItemSchema);
