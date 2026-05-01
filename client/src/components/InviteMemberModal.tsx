import { useForm } from 'react-hook-form';
import Modal from './ui/Modal';

interface FormData {
  email: string;
  role: 'ADMIN' | 'MEMBER';
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  loading?: boolean;
}

export default function InviteMemberModal({ open, onClose, onSubmit, loading }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ defaultValues: { role: 'MEMBER' } });

  function handleClose() {
    reset();
    onClose();
  }

  async function handleFormSubmit(data: FormData) {
    await onSubmit(data);
    reset();
  }

  return (
    <Modal open={open} onClose={handleClose} title="Invite Member" size="sm">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
          <input
            {...register('email', { required: 'Email is required' })}
            type="email"
            className="input-field"
            placeholder="teammate@company.com"
            autoFocus
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select {...register('role')} className="input-field bg-white">
            <option value="MEMBER">Member</option>
            <option value="ADMIN">Admin</option>
          </select>
          <p className="text-xs text-gray-400 mt-1">
            Admins can manage tasks, members, and project settings.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={handleClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Inviting...' : 'Send Invite'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
