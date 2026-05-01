import { Calendar, MoreHorizontal, Trash2, Edit3 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { Task } from '@/types';
import { PriorityBadge, StatusBadge } from './ui/Badge';
import { formatDate, isOverdue, getInitials, avatarColor, cn } from '@/lib/utils';

const PRIORITY_ACCENT = {
  HIGH: 'border-l-rose-500',
  MEDIUM: 'border-l-amber-400',
  LOW: 'border-l-slate-200',
};

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  canManage: boolean;
}

export default function TaskCard({ task, onEdit, onDelete, canManage }: TaskCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const overdue = isOverdue(task.dueDate) && task.status !== 'DONE';

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-l-4 border-gray-100 p-4',
        'hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group cursor-default',
        PRIORITY_ACCENT[task.priority]
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-semibold text-gray-800 leading-snug flex-1">{task.title}</p>

        {canManage && (
          <div ref={menuRef} className="relative shrink-0 -mt-0.5">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-7 z-20 bg-white border border-gray-100 rounded-xl shadow-xl py-1.5 w-36 overflow-hidden">
                <button
                  onClick={() => { onEdit(task); setMenuOpen(false); }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit task
                </button>
                <button
                  onClick={() => { onDelete(task.id); setMenuOpen(false); }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {task.description && (
        <p className="text-xs text-gray-400 mb-2.5 line-clamp-2 leading-relaxed">{task.description}</p>
      )}

      <div className="flex items-center gap-2 flex-wrap mb-3">
        <PriorityBadge priority={task.priority} />
        {task.status === 'DONE' && <StatusBadge status={task.status} />}
      </div>

      <div className="flex items-center justify-between pt-2.5 border-t border-gray-50">
        {task.dueDate ? (
          <span className={cn(
            'flex items-center gap-1 text-xs font-medium',
            overdue ? 'text-rose-500' : 'text-gray-400'
          )}>
            <Calendar className="w-3 h-3" />
            {overdue ? 'Overdue · ' : ''}{formatDate(task.dueDate)}
          </span>
        ) : (
          <span />
        )}

        {task.assignee && (
          <div
            className={cn(
              'w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm',
              avatarColor(task.assignee.id)
            )}
            title={task.assignee.name}
          >
            {getInitials(task.assignee.name)}
          </div>
        )}
      </div>
    </div>
  );
}
