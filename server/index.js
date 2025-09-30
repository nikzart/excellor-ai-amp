import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from './routes/chat.js';
import embeddingRoutes from './routes/embedding.js';
import fileRoutes from './routes/file.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api/embedding', embeddingRoutes);
app.use('/api/file', fileRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Excellor AI Server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Excellor AI Server running on http://localhost:${PORT}`);
});
