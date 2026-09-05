import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

import { requireMasterKey } from './middleware/authMiddleware.js';
import habitsRouter from './routes/habits.js';
import notesRouter from './routes/notes.js';
import scheduleRouter from './routes/schedule.js';
import remindersRouter from './routes/reminders.js';
import uploadRouter from './routes/upload.js';
import backupRouter from './routes/backup.js';
import abstinenceRouter from './routes/abstinence.js';
import urgesRouter from './routes/urges.js';
import vaultRouter from './routes/vault.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/self_os';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure local uploads directory exists & serve statically
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Health check endpoint (public)
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'Self OS API',
    time: new Date().toISOString(),
    mongoConnected: mongoose.connection.readyState === 1,
  });
});

// Single-user Auth Protection Middleware
app.use('/api/v1', requireMasterKey);

// Mount API Routers
app.use('/api/v1/habits', habitsRouter);
app.use('/api/v1/notes', notesRouter);
app.use('/api/v1/schedule', scheduleRouter);
app.use('/api/v1/reminders', remindersRouter);
app.use('/api/v1/upload', uploadRouter);
app.use('/api/v1/backup', backupRouter);
app.use('/api/v1/abstinence', abstinenceRouter);
app.use('/api/v1/urges', urgesRouter);
app.use('/api/v1/vault', vaultRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Self OS API Error]:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// MongoDB Connection & Server Start
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log(`[Self OS] Connected to MongoDB at ${MONGO_URI}`);
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Self OS] API Server running on http://0.0.0.0:${PORT}`);
    });
  })
  .catch(err => {
    console.error('[Self OS] MongoDB Connection Error:', err);
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Self OS] API Server running on port ${PORT} (MongoDB pending connection)`);
    });
  });
