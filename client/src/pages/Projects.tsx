import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, FolderOpen, ArrowRight, Users, CheckCircle2, Crown } from 'lucide-react';
import api from '@/lib/axios';
import Layout from '@/components/Layout';
import CreateProjectModal from '@/components/CreateProjectModal';
import type { Project } from '@/types';
import { formatDate, cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const PROJECT_GRADIENTS = [
  'from-indigo-500 to-violet-500',
  'from-blue-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-rose-500 to-pink-500',
  'from-amber-500 to-orange-500',
  'from-purple-500 to-indigo-500',
];

function projectGradient(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return PROJECT_GRADIENTS[Math.abs(hash) % PROJECT_GRADIENTS.length];
}

export default function Projects() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () => api.get('/projects').then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      api.post<Project>('/projects', data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setCreating(false);
    },
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-[3px] border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8 animate-fade-up">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500 text-sm mt-1">
            {projects.length === 0
              ? 'No projects yet — create one to get started'
              : `${projects.length} ${projects.length === 1 ? 'project' : 'projects'}`}
          </p>
        </div>
        <button onClick={() => setCreating(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 animate-fade-up">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-3xl flex items-center justify-center mb-5 shadow-inner">
            <FolderOpen className="w-9 h-9 text-indigo-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">Create your first project</h3>
          <p className="text-gray-400 text-sm mb-6 text-center max-w-xs">
            Projects keep your tasks organized. Invite your team and start collaborating.
          </p>
          <button onClick={() => setCreating(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {projects.map((project, i) => {
            const gradient = projectGradient(project.id);
            const totalTasks = project._count?.tasks ?? 0;
            const doneTasks = project.tasks?.filter((t) => t.status === 'DONE').length ?? 0;
            const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
            const isOwner = project.ownerId === user?.id;
            const myRole = project.members.find((m) => m.userId === user?.id)?.role;

            return (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className={cn(
                  'card-hover block p-5 animate-fade-up group',
                  i % 4 === 0 && 'animate-fade-up-1',
                  i % 4 === 1 && 'animate-fade-up-2',
                  i % 4 === 2 && 'animate-fade-up-3',
                  i % 4 === 3 && 'animate-fade-up-4',
                )}
              >
                {/* top bar with gradient */}
                <div className={`h-1.5 rounded-full bg-gradient-to-r ${gradient} mb-4 opacity-80`} />

                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 shadow-sm`}>
                      <FolderOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">
                        {project.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {isOwner ? (
                          <span className="flex items-center gap-1 text-xs text-amber-500 font-medium">
                            <Crown className="w-3 h-3" /> Owner
                          </span>
                        ) : myRole === 'ADMIN' ? (
                          <span className="text-xs text-indigo-500 font-medium">Admin</span>
                        ) : (
                          <span className="text-xs text-gray-400">Member</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-all group-hover:translate-x-0.5 mt-1 shrink-0" />
                </div>

                {project.description && (
                  <p className="text-xs text-gray-400 mb-3 line-clamp-2 leading-relaxed">{project.description}</p>
                )}

                {/* progress */}
                {totalTasks > 0 && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                      <span>{doneTasks} / {totalTasks} tasks done</span>
                      <span className="font-medium text-gray-600">{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-500`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {totalTasks} tasks
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {project.members.length}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(project.updatedAt)}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <CreateProjectModal
        open={creating}
        onClose={() => setCreating(false)}
        onSubmit={async (data) => { await createMutation.mutateAsync(data); }}
        loading={createMutation.isPending}
      />
    </Layout>
  );
}
