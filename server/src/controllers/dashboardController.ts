import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export async function getDashboard(req: AuthRequest, res: Response) {
  const userId = req.userId!;
  const now = new Date();

  try {
    const [
      totalProjects,
      myTasks,
      overdueTasks,
      recentProjects,
      upcomingTasks,
      tasksByStatus,
    ] = await Promise.all([
      // projects the user belongs to
      prisma.project.count({
        where: {
          OR: [{ ownerId: userId }, { members: { some: { userId } } }],
        },
      }),

      // tasks assigned to me
      prisma.task.count({
        where: { assigneeId: userId },
      }),

      // tasks assigned to me that are past due and not done
      prisma.task.count({
        where: {
          assigneeId: userId,
          dueDate: { lt: now },
          status: { not: 'DONE' },
        },
      }),

      // last 5 projects
      prisma.project.findMany({
        where: {
          OR: [{ ownerId: userId }, { members: { some: { userId } } }],
        },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        include: {
          _count: { select: { tasks: true } },
          owner: { select: { id: true, name: true } },
        },
      }),

      // upcoming tasks (next 7 days, not done)
      prisma.task.findMany({
        where: {
          assigneeId: userId,
          status: { not: 'DONE' },
          dueDate: {
            gte: now,
            lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
          },
        },
        orderBy: { dueDate: 'asc' },
        take: 5,
        include: {
          project: { select: { id: true, name: true } },
        },
      }),

      // task counts by status for tasks assigned to me
      prisma.task.groupBy({
        by: ['status'],
        where: { assigneeId: userId },
        _count: { status: true },
      }),
    ]);

    const statusMap = { TODO: 0, IN_PROGRESS: 0, DONE: 0 } as Record<string, number>;
    tasksByStatus.forEach((t) => {
      statusMap[t.status] = t._count.status;
    });

    res.json({
      totalProjects,
      myTasks,
      overdueTasks,
      recentProjects,
      upcomingTasks,
      tasksByStatus: statusMap,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load dashboard' });
  }
}
