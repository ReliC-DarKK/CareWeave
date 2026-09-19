import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRouter from './routes/health.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', healthRouter);

app.listen(PORT, () => {
  console.log(`CareWeave Project 2.0 backend running on port ${PORT}`);
});
