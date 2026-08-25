import express from "express";
import cors from 'cors';
import competitionRoutes from './routes/competition.routes.js';

const app = express();

app.use(cors({
    origin: 'http://localhost:5173'
}));

app.use(express.json());

app.use('/api/competitions', competitionRoutes);

export default app;