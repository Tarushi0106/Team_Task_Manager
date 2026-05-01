import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getTask, updateTask, deleteTask } from '../controllers/taskController';

export const taskRouter = Router();

taskRouter.use(requireAuth);

taskRouter.get('/:id', getTask);
taskRouter.put('/:id', updateTask);
taskRouter.delete('/:id', deleteTask);
