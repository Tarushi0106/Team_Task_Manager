import { cn } from '@/lib/utils';
import { statusConfig, priorityConfig } from '@/lib/utils';
import type { TaskStatus, Priority } from '@/types';

export function StatusBadge({ status }: { status: TaskStatus }) {
  const { label, color, bg } = statusConfig[status];
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', bg, color)}>
      {label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const { label, color, dot } = priorityConfig[priority];
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', color)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', dot)} />
      {label}
    </span>
  );
}
