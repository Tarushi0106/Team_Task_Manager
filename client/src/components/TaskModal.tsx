import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from './ui/Modal';
import type { Task, ProjectMember, TaskStatus, Priority } from '@/types';

interface TaskFormData {
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: string;
  assigneeId: string;
}

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<TaskFormData>) => Promise<void>;
  members: ProjectMember[];
  task?: Task | null;
  loading?: boolean;
}

export default function TaskModal({ open, onClose, onSubmit, members, task, loading }: TaskModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>();

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
        assigneeId: task.assigneeId || '',
      });
    } else {
      reset({ title: '', description: '', status: 'TODO', priority: 'MEDIUM', dueDate: '', assigneeId: '' });
    }
  }, [task, open, reset]);

  async function handleFormSubmit(data: TaskFormData) {
    await onSubmit({
      ...data,
      dueDate: data.dueDate || undefined,
      assigneeId: data.assigneeId || undefined,
    });
  }

  return (
    <Modal open={open} onClose={onClose} title={task ? 'Edit Task' : 'New Task'}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            {...register('title', { required: 'Title is required' })}
            className="input-field"
            placeholder="What needs to be done?"
            autoFocus
          />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            {...register('description')}
            rows={3}
            className="input-field resize-none"
            placeholder="Add some context..."
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select {...register('status')} className="input-field bg-white">
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select {...register('priority')} className="input-field bg-white">
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input type="date" {...register('dueDate')} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
            <select {...register('assigneeId')} className="input-field bg-white">
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.user.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : task ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
