import express from 'express';
import Note from '../models/Note.js';

const router = express.Router();

// GET notes with optional filtering (type, tag, search query, date)
router.get('/', async (req, res) => {
  try {
    const { type, tag, search, date } = req.query;
    let filter = {};

    if (type && type !== 'all') {
      filter.type = type;
    }
    if (tag) {
      filter.tags = tag;
    }
    if (date) {
      filter.date = date;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const notes = await Note.find(filter).sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single note by ID
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new note / journal entry
router.post('/', async (req, res) => {
  try {
    const { title, content, type, tags, photoUrls, date } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const note = new Note({
      title,
      content: content || '',
      type: type || 'note',
      tags: tags || [],
      photoUrls: photoUrls || [],
      date: date || todayStr,
    });

    await note.save();
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update note
router.put('/:id', async (req, res) => {
  try {
    const { title, content, type, tags, photoUrls, date } = req.body;
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { title, content, type, tags, photoUrls, date },
      { new: true, runValidators: true }
    );
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE note
router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json({ message: 'Note deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
