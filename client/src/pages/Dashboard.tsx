import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, FolderOpen, ListTodo, ArrowRight, Calendar, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import type { DashboardData } from '@/types';
import { formatDate, priorityConfig } from '@/lib/utils';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

const STATUS_COLORS = { TODO: '#e2e8f0', IN_PROGRESS: '#6366f1', DONE: '#22c55e' };

const STAT_CARDS = [
  {
    key: 'totalProjects',
    label: 'Total Projects',
    icon: FolderOpen,
    gradient: 'from-indigo-500 to-violet-600',
    shadow: 'shadow-indigo-200',
  },
  {
    key: 'myTasks',
    label: 'My Tasks',
    icon: ListTodo,
    gradient: 'from-blue-500 to-cyan-500',
    shadow: 'shadow-blue-200',
  },
  {
    key: 'done',
    label: 'Completed',
    icon: CheckCircle2,
    gradient: 'from-emerald-500 to-green-500',
    shadow: 'shadow-emerald-200',
  },
  {
    key: 'overdueTasks',
    label: 'Overdue',
    icon: AlertCircle,
    gradient: 'from-rose-500 to-red-500',
    shadow: 'shadow-rose-200',
  },
] as const;

export default function Dashboard() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/dashboard').then((r) => r.data),
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

  const statValues = {
    totalProjects: data?.totalProjects ?? 0,
    myTasks: data?.myTasks ?? 0,
    done: data?.tasksByStatus?.DONE ?? 0,
    overdueTasks: data?.overdueTasks ?? 0,
  };

  const chartData = [
    { name: 'To Do', value: data?.tasksByStatus?.TODO ?? 0, key: 'TODO' },
    { name: 'In Progress', value: data?.tasksByStatus?.IN_PROGRESS ?? 0, key: 'IN_PROGRESS' },
    { name: 'Done', value: data?.tasksByStatus?.DONE ?? 0, key: 'DONE' },
  ];

  const totalChartTasks = chartData.reduce((s, d) => s + d.value, 0);

  return (
    <Layout>
      {/* header */}
      <div className="mb-8 animate-fade-up">
        <p className="text-sm font-medium text-indigo-600 mb-1">{getGreeting()} 👋</p>
        <h1 className="text-3xl font-bold text-gray-900">{user?.name?.split(' ')[0]}&apos;s Workspace</h1>
        <p className="text-gray-500 text-sm mt-1">Here&apos;s what&apos;s happening across your projects today.</p>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map(({ key, label, icon: Icon, gradient, shadow }, i) => (
          <div
            key={key}
            className={`animate-fade-up animate-fade-up-${i + 1} card overflow-hidden relative`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-[0.07]`} />
            <div className="relative p-5">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg ${shadow} mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-0.5">
                {statValues[key]}
              </p>
              <p className="text-xs font-medium text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* recent projects */}
        <div className="lg:col-span-2 card p-6 animate-fade-up animate-fade-up-2">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              <h2 className="font-semibold text-gray-900">Recent Projects</h2>
            </div>
            <Link
              to="/projects"
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {!data?.recentProjects?.length ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <FolderOpen className="w-6 h-6 text-indigo-400" />
              </div>
              <p className="text-sm text-gray-400 mb-2">No projects yet</p>
              <Link to="/projects" className="text-sm text-indigo-600 font-medium hover:underline">
                Create your first →
              </Link>
            </div>
          ) : (
            <div className="space-y-1.5">
              {data.recentProjects.map((p) => (
                <Link
                  key={p.id}
                  to={`/projects/${p.id}`}
                  className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-xl flex items-center justify-center shrink-0">
                      <FolderOpen className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
                        {p.name}
                      </p>
                      <p className="text-xs text-gray-400">{p._count.tasks} tasks</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-all group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* task status chart */}
        <div className="card p-6 animate-fade-up animate-fade-up-3">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-2 h-4 bg-indigo-500 rounded-full" />
            <h2 className="font-semibold text-gray-900">Task Breakdown</h2>
          </div>

          {totalChartTasks === 0 ? (
            <div className="flex flex-col items-center justify-center h-44 text-gray-300">
              <ListTodo className="w-10 h-10 mb-2" />
              <p className="text-sm text-gray-400">No tasks yet</p>
            </div>
          ) : (
            <>
              <div className="relative">
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie
                      data={chartData.filter((d) => d.value > 0)}
                      cx="50%" cy="50%"
                      innerRadius={45} outerRadius={65}
                      paddingAngle={4}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {chartData.filter((d) => d.value > 0).map((entry) => (
                        <Cell key={entry.key} fill={STATUS_COLORS[entry.key as keyof typeof STATUS_COLORS]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => [`${val} tasks`]}
                      contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-xl font-bold text-gray-900">{totalChartTasks}</p>
                    <p className="text-xs text-gray-400">total</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mt-2">
                {chartData.map((d) => (
                  <div key={d.key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm" style={{ background: STATUS_COLORS[d.key as keyof typeof STATUS_COLORS] }} />
                      <span className="text-xs text-gray-600">{d.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-800">{d.value}</span>
                      <span className="text-xs text-gray-400">
                        {totalChartTasks ? `${Math.round((d.value / totalChartTasks) * 100)}%` : '—'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* upcoming tasks */}
      {!!data?.upcomingTasks?.length && (
        <div className="card p-6 mt-6 animate-fade-up animate-fade-up-4">
          <div className="flex items-center gap-2 mb-5">
            <Calendar className="w-4 h-4 text-amber-500" />
            <h2 className="font-semibold text-gray-900">Due This Week</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {data.upcomingTasks.map((task) => {
              const pcfg = priorityConfig[task.priority];
              return (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${pcfg.dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{task.title}</p>
                    <p className="text-xs text-gray-400 truncate">{task.project.name}</p>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0 tabular-nums">{formatDate(task.dueDate)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Layout>
  );
}
