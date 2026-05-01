import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { CheckSquare, ArrowRight, Users, BarChart3, Zap } from 'lucide-react';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import type { User } from '@/types';

interface FormData {
  email: string;
  password: string;
}

const features = [
  { icon: Users, text: 'Invite teammates and assign roles' },
  { icon: BarChart3, text: 'Track progress with live dashboards' },
  { icon: Zap, text: 'Kanban boards with priority labels' },
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>();

  async function onSubmit(data: FormData) {
    setError('');
    try {
      const res = await api.post<{ token: string; user: User }>('/auth/login', data);
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || 'Invalid email or password.';
      setError(msg);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* left panel */}
      <div className="hidden lg:flex w-[52%] bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 flex-col justify-between p-12 relative overflow-hidden">
        {/* background blobs */}
        <div className="absolute top-[-80px] right-[-80px] w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-60px] left-[-60px] w-64 h-64 bg-white/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-16">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <CheckSquare className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-semibold text-lg">TaskFlow</span>
          </div>

          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Build better<br />with your team.
          </h1>
          <p className="text-indigo-200 text-base leading-relaxed max-w-sm">
            Manage projects, track tasks, and ship faster — all in one place.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {features.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center shrink-0 backdrop-blur-sm">
                <Icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-indigo-100 text-sm">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-slate-50">
        <div className="w-full max-w-sm animate-fade-up">
          {/* mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <CheckSquare className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900">TaskFlow</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-500 text-sm mt-1">Sign in to continue to your workspace</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                {...register('email', { required: 'Email is required' })}
                type="email"
                className="input-field"
                placeholder="you@company.com"
                autoComplete="email"
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input
                {...register('password', { required: 'Password is required' })}
                type="password"
                className="input-field"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 mt-2"
            >
              {isSubmitting ? 'Signing in...' : (
                <><span>Sign in</span><ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
