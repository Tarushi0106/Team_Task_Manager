import { Router } from 'express';
import { body } from 'express-validator';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  updateMemberRole,
} from '../controllers/projectController';
import { createTask } from '../controllers/taskController';

export const projectRouter = Router();

projectRouter.use(requireAuth);

projectRouter.get('/', getProjects);

projectRouter.post(
  '/',
  [body('name').trim().notEmpty().withMessage('Project name is required')],
  validate,
  createProject
);

projectRouter.get('/:id', getProject);
projectRouter.put('/:id', updateProject);
projectRouter.delete('/:id', deleteProject);

// members
projectRouter.post(
  '/:id/members',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('role').optional().isIn(['ADMIN', 'MEMBER']).withMessage('Role must be ADMIN or MEMBER'),
  ],
  validate,
  addMember
);

projectRouter.delete('/:id/members/:userId', removeMember);
projectRouter.patch('/:id/members/:userId', updateMemberRole);

// tasks within a project
projectRouter.post(
  '/:projectId/tasks',
  [body('title').trim().notEmpty().withMessage('Task title is required')],
  validate,
  createTask
);
