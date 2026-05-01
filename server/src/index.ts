import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { authRouter } from './routes/auth';
import { projectRouter } from './routes/projects';
import { taskRouter } from './routes/tasks';
import { dashboardRouter } from './routes/dashboard';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.CORS_ORIGIN
          ? process.env.CORS_ORIGIN.split(',')
          : true
        : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:7000'],
    credentials: true,
  })
);

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/projects', projectRouter);
app.use('/api/tasks', taskRouter);
app.use('/api/dashboard', dashboardRouter);

// serve the built frontend in prod
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server listening on 0.0.0.0:${PORT}`);
});
