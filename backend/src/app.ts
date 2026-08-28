import express from "express";
import cors from 'cors';
import competitionRoutes from './routes/competition.routes.js';
import organizationRoutes from "./routes/organization.routes.js";
import seasonRoutes from "./routes/season.routes.js";

const app = express();

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost',
    'http://localhost:80'
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Bloqueado por CORS'));
        }
    },
    credentials: true
}));

app.use(express.json());

app.use('/api/organizations', organizationRoutes);
app.use('/api/competitions', competitionRoutes);
app.use('/api/seasons', seasonRoutes);

export default app;