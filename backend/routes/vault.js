import express from 'express';
import VaultItem from '../models/VaultItem.js';

const router = express.Router();

// GET vault items
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let filter = {};
    if (category && category !== 'all') {
      filter.category = category;
    }
    const items = await VaultItem.find(filter).sort({ pinned: -1, order: 1, createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create vault item
router.post('/', async (req, res) => {
  try {
    const { title, category, content, fileUrls, pinned, order } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Vault item title is required' });
    }

    const item = new VaultItem({
      title,
      category: category || 'emergency',
      content: content || '',
      fileUrls: fileUrls || [],
      pinned: pinned !== undefined ? pinned : true,
      order: order || 0,
    });

    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update vault item
router.put('/:id', async (req, res) => {
  try {
    const { title, category, content, fileUrls, pinned, order } = req.body;
    const item = await VaultItem.findByIdAndUpdate(
      req.params.id,
      { title, category, content, fileUrls, pinned, order },
      { new: true, runValidators: true }
    );
    if (!item) {
      return res.status(404).json({ error: 'Vault item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE vault item
router.delete('/:id', async (req, res) => {
  try {
    const item = await VaultItem.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Vault item not found' });
    }
    res.json({ message: 'Vault item deleted', id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
