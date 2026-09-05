import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import fs from 'fs';
import path from 'path';

const router = express.Router();

const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

let uploadMiddleware;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'self_os_journal',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'heic'],
      transformation: [{ width: 1200, height: 1200, crop: 'limit' }],
    },
  });

  uploadMiddleware = multer({ storage });
} else {
  // Local disk storage fallback
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname) || '.jpg';
      cb(null, `photo-${uniqueSuffix}${ext}`);
    },
  });

  uploadMiddleware = multer({ storage: diskStorage });
}

// POST /api/v1/upload (single image file)
router.post('/', uploadMiddleware.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    let url;
    if (isCloudinaryConfigured && req.file.path) {
      url = req.file.path; // Cloudinary CDN URL
    } else {
      // Local host URL relative endpoint
      url = `/uploads/${req.file.filename}`;
    }

    res.json({
      url,
      provider: isCloudinaryConfigured ? 'cloudinary' : 'local',
      filename: req.file.filename || req.file.originalname,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
