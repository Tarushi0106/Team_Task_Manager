import { useForm } from 'react-hook-form';
import Modal from './ui/Modal';

interface FormData {
  name: string;
  description: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  loading?: boolean;
}

export default function CreateProjectModal({ open, onClose, onSubmit, loading }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  function handleClose() {
    reset();
    onClose();
  }

  async function handleFormSubmit(data: FormData) {
    await onSubmit(data);
    reset();
  }

  return (
    <Modal open={open} onClose={handleClose} title="Create Project" size="sm">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
          <input
            {...register('name', { required: 'Project name is required' })}
            className="input-field"
            placeholder="e.g. Website Redesign"
            autoFocus
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            {...register('description')}
            rows={3}
            className="input-field resize-none"
            placeholder="What's this project about?"
          />
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={handleClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
