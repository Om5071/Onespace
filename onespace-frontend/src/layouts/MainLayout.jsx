import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NotificationDropdown } from '../components/notifications/NotificationDropdown';
import { CommandPaletteModal } from '../components/search/CommandPaletteModal';
import { ToastContainer } from '../components/common/Toast';
import {
  Layers,
  LayoutDashboard,
  CheckSquare,
  FileText,
  Calendar,
  Clock,
  FolderArchive,
  Smile,
  Dumbbell,
  Target,
  BarChart3,
  Settings,
  Search,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Bell
} from 'lucide-react';

export const MainLayout = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();

  // Listen for Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare },
    { to: '/notes', label: 'Notes', icon: FileText },
    { to: '/calendar', label: 'Calendar', icon: Calendar },
    { to: '/reminders', label: 'Reminders', icon: Clock },
    { to: '/daily-tracker', label: 'Daily Tracker', icon: Smile },
    { to: '/fitness', label: 'Fitness', icon: Dumbbell },
    { to: '/goals', label: 'Goals', icon: Target },
    { to: '/documents', label: 'Documents', icon: FolderArchive },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen flex bg-[#0B0F19] text-slate-100 selection:bg-blue-600 selection:text-white">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#0B0F19]/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-[#0F172A]/95 border-r border-slate-800/80 shadow-[8px_0_30px_rgba(2,6,23,0.24)] backdrop-blur-xl transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/80">
          <NavLink to="/" className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-[0_10px_24px_rgba(59,130,246,0.35)] border border-white/10">
              <Layers className="w-5 h-5" />
            </div>
            {!collapsed && (
              <span className="font-bold text-lg tracking-[-0.04em] whitespace-nowrap text-white">
                One<span className="bg-gradient-to-r from-blue-300 via-indigo-300 to-violet-300 bg-clip-text text-transparent">Space</span>
              </span>
            )}
          </NavLink>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 cursor-pointer transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-violet-600/20 text-white border border-blue-500/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_20px_rgba(59,130,246,0.12)]'
                      : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-100 border border-transparent'
                  } ${collapsed ? 'justify-center px-2' : ''}`
                }
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-800/80">
          <div className={`flex items-center gap-3 p-2 rounded-xl bg-[#131D31]/80 border border-slate-800/60 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0 uppercase shadow-[0_8px_18px_rgba(99,102,241,0.35)]">
              {user?.name ? user.name[0] : 'U'}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate text-slate-100">{user?.name || 'User'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${collapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        <header className="sticky top-0 z-30 h-16 bg-[#101726]/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-slate-300 hover:bg-slate-800/80 rounded-xl lg:hidden cursor-pointer transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-300 bg-[#131D31]/80 hover:bg-[#1A243B] border border-slate-800 hover:border-slate-700 rounded-xl transition-all w-48 sm:w-72 cursor-pointer shadow-[0_0_0_1px_rgba(148,163,184,0.04)]"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">Search OneSpace...</span>
              <kbd className="hidden sm:inline-block ml-auto text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
                Ctrl+K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <NotificationDropdown />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      <CommandPaletteModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <ToastContainer />
    </div>
  );
};
