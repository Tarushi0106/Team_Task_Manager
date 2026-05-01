import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

// list all projects the user is part of
export async function getProjects(req: AuthRequest, res: Response) {
  try {
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: req.userId },
          { members: { some: { userId: req.userId } } },
        ],
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
}

export async function createProject(req: AuthRequest, res: Response) {
  const { name, description } = req.body;

  try {
    const project = await prisma.project.create({
      data: {
        name,
        description,
        ownerId: req.userId!,
        // automatically add the creator as an admin member
        members: {
          create: { userId: req.userId!, role: 'ADMIN' },
        },
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        _count: { select: { tasks: true } },
      },
    });

    res.status(201).json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create project' });
  }
}

export async function getProject(req: AuthRequest, res: Response) {
  const { id } = req.params;

  try {
    const project = await prisma.project.findFirst({
      where: {
        id,
        OR: [
          { ownerId: req.userId },
          { members: { some: { userId: req.userId } } },
        ],
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, email: true } },
            creator: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch project' });
  }
}

export async function updateProject(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    // only admins or owner can update
    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId: req.userId! } },
    });

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.ownerId !== req.userId && membership?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updated = await prisma.project.update({
      where: { id },
      data: { name, description },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update project' });
  }
}

export async function deleteProject(req: AuthRequest, res: Response) {
  const { id } = req.params;

  try {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.ownerId !== req.userId) {
      return res.status(403).json({ message: 'Only the owner can delete this project' });
    }

    await prisma.project.delete({ where: { id } });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete project' });
  }
}

export async function addMember(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { email, role = 'MEMBER' } = req.body;

  try {
    // check if requester is admin/owner
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const requesterMembership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId: req.userId! } },
    });

    if (project.ownerId !== req.userId && requesterMembership?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can add members' });
    }

    const userToAdd = await prisma.user.findUnique({ where: { email } });
    if (!userToAdd) return res.status(404).json({ message: 'User not found with that email' });

    const existing = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId: userToAdd.id } },
    });
    if (existing) return res.status(400).json({ message: 'User is already a member' });

    const member = await prisma.projectMember.create({
      data: { projectId: id, userId: userToAdd.id, role: role as 'ADMIN' | 'MEMBER' },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    res.status(201).json(member);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add member' });
  }
}

export async function removeMember(req: AuthRequest, res: Response) {
  const { id, userId } = req.params;

  try {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const requesterMembership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId: req.userId! } },
    });

    if (project.ownerId !== req.userId && requesterMembership?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can remove members' });
    }

    // can't remove the owner
    if (project.ownerId === userId) {
      return res.status(400).json({ message: "Can't remove the project owner" });
    }

    await prisma.projectMember.delete({
      where: { projectId_userId: { projectId: id, userId } },
    });

    res.json({ message: 'Member removed' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove member' });
  }
}

export async function updateMemberRole(req: AuthRequest, res: Response) {
  const { id, userId } = req.params;
  const { role } = req.body;

  try {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.ownerId !== req.userId) {
      return res.status(403).json({ message: 'Only the owner can change roles' });
    }

    const updated = await prisma.projectMember.update({
      where: { projectId_userId: { projectId: id, userId } },
      data: { role: role as 'ADMIN' | 'MEMBER' },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update role' });
  }
}
