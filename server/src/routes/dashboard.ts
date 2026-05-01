import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getDashboard } from '../controllers/dashboardController';

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);
dashboardRouter.get('/', getDashboard);
