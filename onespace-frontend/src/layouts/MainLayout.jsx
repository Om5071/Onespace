import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
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
  ChevronLeft,
  ChevronRight,
  Bell,
  UserRound,
} from 'lucide-react';

export const MainLayout = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare },
    { to: '/calendar', label: 'Calendar', icon: Calendar },
    { to: '/notes', label: 'Notes', icon: FileText },
    { to: '/documents', label: 'Documents', icon: FolderArchive },
    { to: '/reminders', label: 'Reminders', icon: Clock },
    { to: '/daily-tracker', label: 'Daily Tracker', icon: Smile },
    { to: '/fitness', label: 'Fitness', icon: Dumbbell },
    { to: '/goals', label: 'Goals', icon: Target },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const pageLabel = navItems.find((item) => item.to === location.pathname)?.label || 'OneSpace';
  const initials = user?.name ? user.name.split(' ').map((part) => part[0]).slice(0, 2).join('') : 'U';

  return (
    <div className="min-h-screen bg-[#0b0d0f] text-slate-100 selection:bg-slate-600 selection:text-white">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-white/[0.08] bg-[#111417] shadow-[12px_0_36px_rgba(2,6,23,0.2)] transition-all duration-300 ${
          collapsed ? 'w-[76px]' : 'w-[252px]'
        } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex h-[78px] items-center justify-between border-b border-white/[0.07] px-4">
          <NavLink to="/" className="flex min-w-0 items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-500/30 bg-[#20352f] text-[#b5f2d2] shadow-[0_8px_22px_rgba(2,6,23,0.25)]">
              <Layers className="h-[18px] w-[18px]" strokeWidth={1.8} />
            </div>
            {!collapsed && (
              <div className="min-w-0 leading-tight">
                <div className="truncate text-[15px] font-semibold tracking-[-0.03em] text-slate-50">OneSpace</div>
                <div className="mt-1 truncate text-[9px] font-medium uppercase tracking-[0.13em] text-[#82908d]">Personal OS</div>
              </div>
            )}
          </NavLink>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden rounded-lg p-1.5 text-[#82908d] transition-colors hover:bg-slate-800/80 hover:text-slate-200 lg:flex"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <div className={`px-3 pt-6 ${collapsed ? 'px-2' : ''}`}>
          {!collapsed && <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#82908d]">Workspace</p>}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-lg border px-3 py-2.5 text-[12px] font-medium transition-all duration-150 ${
                      isActive
                        ? 'border-slate-600/50 bg-[#20352f] text-slate-50 shadow-[inset_3px_0_0_#99e5c2]'
                        : 'border-transparent text-[#9aa9a5] hover:border-white/[0.07] hover:bg-[#1b2024] hover:text-slate-100'
                    } ${collapsed ? 'justify-center px-2' : ''}`
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="h-[17px] w-[17px] shrink-0" strokeWidth={1.8} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className={`mt-auto border-t border-white/[0.07] p-3 ${collapsed ? 'px-2' : ''}`}>
          {!collapsed && <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#82908d]">Account</p>}
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `mb-2 flex items-center gap-3 rounded-lg border px-3 py-2.5 text-[12px] font-medium transition-colors ${
                isActive ? 'border-slate-600/50 bg-[#20352f] text-slate-50' : 'border-transparent text-[#9aa9a5] hover:bg-[#1b2024] hover:text-slate-100'
              } ${collapsed ? 'justify-center px-2' : ''}`
            }
            title={collapsed ? 'Settings' : undefined}
          >
            <Settings className="h-[17px] w-[17px] shrink-0" strokeWidth={1.8} />
            {!collapsed && <span>Settings</span>}
          </NavLink>
          <div className={`flex items-center gap-3 rounded-xl border border-white/[0.08] bg-[#15191c] p-2.5 ${collapsed ? 'justify-center' : ''}`}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2b5144] text-[10px] font-semibold uppercase text-[#e4f4ed]">
              {initials}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-semibold text-slate-100">{user?.name || 'User'}</p>
                <p className="truncate text-[10px] text-[#82908d]">{user?.email || 'Account'}</p>
              </div>
            )}
            {!collapsed && (
              <button onClick={logout} className="rounded-md p-1.5 text-[#82908d] transition-colors hover:bg-slate-800 hover:text-slate-200" title="Logout">
                <LogOut className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>

      <div className={`flex min-h-screen flex-1 flex-col transition-all duration-300 ${collapsed ? 'lg:pl-[76px]' : 'lg:pl-[252px]'}`}>
        <header className="sticky top-0 z-30 flex h-[78px] items-center justify-between border-b border-white/[0.07] bg-[#111417]/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 text-[#9aa9a5] transition-colors hover:bg-slate-800/80 hover:text-slate-100 lg:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden min-w-0 sm:block">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#82908d]">Workspace / {pageLabel}</p>
              <h1 className="mt-1 truncate text-[15px] font-semibold text-slate-100">{pageLabel}</h1>
            </div>
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex w-44 items-center gap-2.5 rounded-lg border border-white/[0.09] bg-[#15191c] px-3 py-2 text-xs text-[#9aa9a5] transition-colors hover:border-slate-600 hover:text-slate-200 sm:w-64 lg:w-72"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="truncate">Search OneSpace</span>
              <kbd className="ml-auto hidden rounded border border-slate-700 bg-[#0b0d0f] px-1.5 py-0.5 text-[9px] text-[#82908d] sm:inline-block">⌘K</kbd>
            </button>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden h-5 w-px bg-slate-700/50 sm:block" />
            <NotificationDropdown />
            <div className="hidden items-center gap-2.5 border-l border-slate-700/50 pl-3 sm:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2b5144] text-[10px] font-semibold uppercase text-[#e4f4ed]">{initials}</div>
              <div className="hidden leading-tight lg:block">
                <p className="max-w-[120px] truncate text-[11px] font-semibold text-slate-200">{user?.name || 'User'}</p>
                <p className="mt-0.5 text-[10px] text-[#82908d]">Personal workspace</p>
              </div>
              <UserRound className="h-3.5 w-3.5 text-slate-600" />
            </div>
            <Bell className="sr-only" aria-hidden="true" />
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1480px] flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      <CommandPaletteModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <ToastContainer />
    </div>
  );
};
