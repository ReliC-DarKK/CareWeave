import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';
import documentsRouter from './routes/documents.js';
import documentProcessingRouter from './routes/documentProcessing.js';
import medicalExtractionRouter from './routes/medicalExtraction.js';
import patientsRouter from './routes/patients.js';
import { initDatabase } from './database/db.js';

dotenv.config();

// Initialize persistent SQLite database
initDatabase();

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Restrained CORS configuration for Project 2.0
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

// Routes
app.use('/api', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/documents', documentProcessingRouter);
app.use('/api/documents', medicalExtractionRouter);
app.use('/api/patients', patientsRouter);

app.listen(PORT, () => {
  console.log(`CareWeave Project 2.0 backend running on port ${PORT}`);
});
