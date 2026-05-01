import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, LogOut, CheckSquare, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getInitials, avatarColor, cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <aside className="w-60 flex flex-col h-screen fixed left-0 top-0 bg-slate-900 border-r border-slate-800/60">
      {/* logo */}
      <div className="px-4 py-5">
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/40">
            <CheckSquare className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-base tracking-tight">TaskFlow</span>
        </Link>
      </div>

      {/* nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
                active
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </div>
              {active && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* bottom */}
      <div className="px-3 pb-4 space-y-1">
        <div className="px-3 py-3 rounded-xl bg-slate-800/60 mb-2">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0',
                user ? avatarColor(user.id) : 'bg-slate-600'
              )}
            >
              {user ? getInitials(user.name) : '?'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-slate-100 text-xs font-semibold truncate">{user?.name}</p>
              <p className="text-slate-500 text-xs truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-all duration-150"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
