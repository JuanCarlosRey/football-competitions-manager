import express from "express";
import competitionRoutes from './routes/competition.routes.js';

const app = express();

app.use(express.json());

app.use('/api/competitions', competitionRoutes);

export default app;