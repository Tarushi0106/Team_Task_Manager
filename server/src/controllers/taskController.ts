import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

async function getProjectMembership(projectId: string, userId: string) {
  return prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
}

export async function createTask(req: AuthRequest, res: Response) {
  const { projectId } = req.params;
  const { title, description, status, priority, dueDate, assigneeId } = req.body;

  try {
    const membership = await getProjectMembership(projectId, req.userId!);
    if (!membership) {
      return res.status(403).json({ message: 'You are not a member of this project' });
    }

    // only admins can assign to others, members can only self-assign
    if (assigneeId && assigneeId !== req.userId && membership.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can assign tasks to others' });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        assigneeId: assigneeId || null,
        creatorId: req.userId!,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create task' });
  }
}

export async function updateTask(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { title, description, status, priority, dueDate, assigneeId } = req.body;

  try {
    const task = await prisma.task.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!task) return res.status(404).json({ message: 'Task not found' });

    const membership = await getProjectMembership(task.projectId, req.userId!);
    if (!membership) {
      return res.status(403).json({ message: 'Not a project member' });
    }

    // members can only update their own tasks (or tasks assigned to them)
    // admins can update any task
    if (membership.role !== 'ADMIN' && task.creatorId !== req.userId && task.assigneeId !== req.userId) {
      return res.status(403).json({ message: 'You can only update your own tasks' });
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(assigneeId !== undefined && { assigneeId: assigneeId || null }),
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } },
      },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update task' });
  }
}

export async function deleteTask(req: AuthRequest, res: Response) {
  const { id } = req.params;

  try {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const membership = await getProjectMembership(task.projectId, req.userId!);
    if (!membership) return res.status(403).json({ message: 'Not a project member' });

    if (membership.role !== 'ADMIN' && task.creatorId !== req.userId) {
      return res.status(403).json({ message: 'You can only delete your own tasks' });
    }

    await prisma.task.delete({ where: { id } });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete task' });
  }
}

export async function getTask(req: AuthRequest, res: Response) {
  const { id } = req.params;

  try {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    });

    if (!task) return res.status(404).json({ message: 'Task not found' });

    const membership = await getProjectMembership(task.projectId, req.userId!);
    if (!membership) return res.status(403).json({ message: 'Not a project member' });

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch task' });
  }
}
