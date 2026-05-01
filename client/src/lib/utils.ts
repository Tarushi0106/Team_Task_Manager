import { clsx, type ClassValue } from 'clsx';
import { format, isAfter, isBefore, parseISO, startOfDay } from 'date-fns';
import type { Priority, TaskStatus } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'MMM d, yyyy');
  } catch {
    return '—';
  }
}

export function isOverdue(dueDate: string | null | undefined): boolean {
  if (!dueDate) return false;
  return isBefore(parseISO(dueDate), startOfDay(new Date()));
}

export function isDueSoon(dueDate: string | null | undefined): boolean {
  if (!dueDate) return false;
  const due = parseISO(dueDate);
  const soon = new Date();
  soon.setDate(soon.getDate() + 3);
  return isAfter(due, startOfDay(new Date())) && isBefore(due, soon);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export const statusConfig: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  TODO: { label: 'To Do', color: 'text-gray-600', bg: 'bg-gray-100' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-blue-700', bg: 'bg-blue-100' },
  DONE: { label: 'Done', color: 'text-green-700', bg: 'bg-green-100' },
};

export const priorityConfig: Record<Priority, { label: string; color: string; dot: string }> = {
  LOW: { label: 'Low', color: 'text-gray-500', dot: 'bg-gray-400' },
  MEDIUM: { label: 'Medium', color: 'text-amber-600', dot: 'bg-amber-400' },
  HIGH: { label: 'High', color: 'text-red-600', dot: 'bg-red-500' },
};

const avatarColors = [
  'bg-violet-500',
  'bg-blue-500',
  'bg-emerald-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-cyan-500',
  'bg-pink-500',
  'bg-indigo-500',
];

export function avatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}
