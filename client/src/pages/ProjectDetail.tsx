import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  UserPlus,
  Settings,
  ChevronLeft,
  Trash2,
  Crown,
  Users,
} from 'lucide-react';
import api from '@/lib/axios';
import Layout from '@/components/Layout';
import TaskCard from '@/components/TaskCard';
import TaskModal from '@/components/TaskModal';
import InviteMemberModal from '@/components/InviteMemberModal';
import { StatusBadge } from '@/components/ui/Badge';
import type { Project, Task, TaskStatus } from '@/types';
import { getInitials, avatarColor, cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const COLUMNS: { status: TaskStatus; label: string; dot: string; headerBg: string; countBg: string }[] = [
  { status: 'TODO',        label: 'To Do',       dot: 'bg-slate-400',   headerBg: 'bg-slate-50 border-slate-200',    countBg: 'bg-slate-200 text-slate-600' },
  { status: 'IN_PROGRESS', label: 'In Progress', dot: 'bg-indigo-500',  headerBg: 'bg-indigo-50 border-indigo-200',  countBg: 'bg-indigo-200 text-indigo-700' },
  { status: 'DONE',        label: 'Done',        dot: 'bg-emerald-500', headerBg: 'bg-emerald-50 border-emerald-200',countBg: 'bg-emerald-200 text-emerald-700' },
];

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [taskModal, setTaskModal] = useState<{ open: boolean; task: Task | null }>({
    open: false,
    task: null,
  });
  const [inviteModal, setInviteModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'ALL'>('ALL');

  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ['project', id],
    queryFn: () => api.get(`/projects/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  const myMembership = project?.members.find((m) => m.userId === user?.id);
  const isAdmin = project?.ownerId === user?.id || myMembership?.role === 'ADMIN';

  const createTaskMutation = useMutation({
    mutationFn: (data: Partial<Task>) => api.post(`/projects/${id}/tasks`, data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setTaskModal({ open: false, task: null });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: Partial<Task> }) =>
      api.put(`/tasks/${taskId}`, data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setTaskModal({ open: false, task: null });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => api.delete(`/tasks/${taskId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const inviteMutation = useMutation({
    mutationFn: (data: { email: string; role: 'ADMIN' | 'MEMBER' }) =>
      api.post(`/projects/${id}/members`, data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      setInviteModal(false);
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => api.delete(`/projects/${id}/members/${userId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project', id] }),
  });

  const deleteProjectMutation = useMutation({
    mutationFn: () => api.delete(`/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      navigate('/projects');
    },
  });

  async function handleTaskSubmit(data: Partial<Task>) {
    if (taskModal.task) {
      await updateTaskMutation.mutateAsync({ taskId: taskModal.task.id, data });
    } else {
      await createTaskMutation.mutateAsync(data);
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="w-7 h-7 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="text-center py-20">
          <p className="text-gray-500">Project not found.</p>
          <Link to="/projects" className="text-indigo-600 text-sm mt-2 inline-block">
            ← Back to projects
          </Link>
        </div>
      </Layout>
    );
  }

  const tasks = project.tasks || [];
  const filteredTasks = filterStatus === 'ALL' ? tasks : tasks.filter((t) => t.status === filterStatus);

  const tasksByStatus = (status: TaskStatus) =>
    filteredTasks.filter((t) => t.status === status);

  const doneTasks = tasks.filter((t) => t.status === 'DONE').length;
  const progress = tasks.length ? Math.round((doneTasks / tasks.length) * 100) : 0;

  return (
    <Layout>
      {/* breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link to="/projects" className="hover:text-gray-600 flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" />
          Projects
        </Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">{project.name}</span>
      </div>

      {/* project header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          {project.description && (
            <p className="text-gray-500 text-sm mt-1">{project.description}</p>
          )}
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              {project.members.slice(0, 5).map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    'w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-semibold -ml-1 first:ml-0',
                    avatarColor(m.userId)
                  )}
                  title={`${m.user.name} (${m.role})`}
                >
                  {getInitials(m.user.name)}
                </div>
              ))}
              {project.members.length > 5 && (
                <span className="text-xs text-gray-400 ml-1">+{project.members.length - 5} more</span>
              )}
            </div>
            <span className="text-xs text-gray-400">{tasks.length} tasks · {progress}% complete</span>
          </div>

          {tasks.length > 0 && (
            <div className="mt-3 max-w-xs">
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isAdmin && (
            <>
              <button
                onClick={() => setInviteModal(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Invite
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="btn-secondary p-2"
                title="Project settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            onClick={() => setTaskModal({ open: true, task: null })}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* settings panel */}
      {showSettings && isAdmin && (
        <div className="card p-5 mb-6 border-amber-200 bg-amber-50/50">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Team Members
          </h3>
          <div className="space-y-2">
            {project.members.map((m) => {
              const isOwner = m.userId === project.ownerId;
              const isMe = m.userId === user?.id;
              return (
                <div key={m.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-white border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold',
                        avatarColor(m.userId)
                      )}
                    >
                      {getInitials(m.user.name)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {m.user.name} {isMe && <span className="text-gray-400">(you)</span>}
                      </p>
                      <p className="text-xs text-gray-400">{m.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isOwner ? (
                      <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                        <Crown className="w-3 h-3" /> Owner
                      </span>
                    ) : (
                      <StatusBadge status={m.role === 'ADMIN' ? 'IN_PROGRESS' : 'TODO'} />
                    )}
                    {!isOwner && !isMe && project.ownerId === user?.id && (
                      <button
                        onClick={() => removeMemberMutation.mutate(m.userId)}
                        className="p-1.5 text-gray-300 hover:text-red-500 transition-colors rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {project.ownerId === user?.id && (
            <div className="mt-4 pt-4 border-t border-amber-200">
              <p className="text-xs font-medium text-gray-700 mb-2">Danger Zone</p>
              <button
                onClick={() => {
                  if (confirm('Delete this project and all its tasks? This cannot be undone.')) {
                    deleteProjectMutation.mutate();
                  }
                }}
                className="btn-danger flex items-center gap-2 text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Delete Project
              </button>
            </div>
          )}
        </div>
      )}

      {/* filter pills */}
      <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
        {(['ALL', 'TODO', 'IN_PROGRESS', 'DONE'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap',
              filterStatus === s
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
            )}
          >
            {s === 'ALL' ? 'All Tasks' : s === 'IN_PROGRESS' ? 'In Progress' : s === 'TODO' ? 'To Do' : 'Done'}
            <span className="ml-1.5 opacity-70">
              {s === 'ALL' ? tasks.length : tasks.filter((t) => t.status === s).length}
            </span>
          </button>
        ))}
      </div>

      {/* kanban board */}
      {tasks.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Plus className="w-6 h-6 text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium mb-1">No tasks yet</p>
          <p className="text-gray-400 text-sm mb-4">Add your first task to get this project moving</p>
          <button
            onClick={() => setTaskModal({ open: true, task: null })}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {COLUMNS.map(({ status, label, dot, headerBg, countBg }) => {
            const colTasks = tasksByStatus(status);
            return (
              <div key={status} className="flex flex-col gap-3">
                <div className={cn('flex items-center justify-between px-3 py-2.5 rounded-xl border', headerBg)}>
                  <div className="flex items-center gap-2">
                    <span className={cn('w-2 h-2 rounded-full', dot)} />
                    <h3 className="text-sm font-semibold text-gray-700">{label}</h3>
                    <span className={cn('text-xs px-1.5 py-0.5 rounded-md font-semibold', countBg)}>
                      {colTasks.length}
                    </span>
                  </div>
                  {status === 'TODO' && (
                    <button
                      onClick={() => setTaskModal({ open: true, task: null })}
                      className="p-1 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-white transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-2.5 min-h-[4rem]">
                  {colTasks.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-100 rounded-xl p-6 text-center">
                      <p className="text-xs text-gray-300">No tasks here</p>
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onEdit={(t) => setTaskModal({ open: true, task: t })}
                        onDelete={(taskId) => {
                          if (confirm('Delete this task?')) {
                            deleteTaskMutation.mutate(taskId);
                          }
                        }}
                        canManage={
                          isAdmin ||
                          task.creatorId === user?.id ||
                          task.assigneeId === user?.id
                        }
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TaskModal
        open={taskModal.open}
        onClose={() => setTaskModal({ open: false, task: null })}
        onSubmit={handleTaskSubmit}
        members={project.members}
        task={taskModal.task}
        loading={createTaskMutation.isPending || updateTaskMutation.isPending}
      />

      <InviteMemberModal
        open={inviteModal}
        onClose={() => setInviteModal(false)}
        onSubmit={async (data) => { await inviteMutation.mutateAsync(data); }}
        loading={inviteMutation.isPending}
      />
    </Layout>
  );
}
