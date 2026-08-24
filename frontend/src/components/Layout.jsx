import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  User,
  MessageSquare,
  LogOut,
  Menu,
  X,
  PlusCircle,
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Feed', path: '/dashboard', icon: Home },
    { name: 'Profile', path: `/profile/${user?.username}`, icon: User },
    { name: 'Feedback', path: '/feedback', icon: MessageSquare },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#050b14] text-gray-100 flex">
      {/* ========== DESKTOP SIDEBAR ========== */}
      <aside
        className={`hidden md:flex flex-col bg-[#0b1329] border-r border-slate-800 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo / Toggle */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          {sidebarOpen && (
            <span className="font-bold text-sky-400 tracking-wide text-sm">
              COMMUNITY HUB
            </span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition ${
                  isActive(item.path)
                    ? 'bg-sky-500/15 text-sky-400'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={22} />
                {sidebarOpen && (
                  <span className="font-medium text-sm">{item.name}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="p-4 border-t border-slate-800">
          <div
            className={`flex items-center gap-3 mb-4 cursor-pointer ${
              !sidebarOpen && 'justify-center'
            }`}
            onClick={() => navigate(`/profile/${user?.username}`)}
          >
            <img
              src={user?.avatar}
              alt={user?.displayName}
              className="w-10 h-10 rounded-full object-cover border border-sky-500/40"
            />
            {sidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.displayName}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  @{user?.username}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition ${
              !sidebarOpen && 'justify-center'
            }`}
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* ========== MAIN CONTENT ========== */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Top Bar */}
        <header className="md:hidden sticky top-0 z-40 bg-[#050b14]/95 backdrop-blur border-b border-slate-800 px-4 py-3 flex items-center justify-between">
          <span className="font-bold text-sky-400 text-sm tracking-wide">
            COMMUNITY HUB
          </span>
          <img
            src={user?.avatar}
            alt=""
            className="w-8 h-8 rounded-full object-cover border border-sky-500/40"
            onClick={() => navigate(`/profile/${user?.username}`)}
          />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-6">
          {children}
        </main>

        {/* ========== MOBILE BOTTOM NAV ========== */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0b1329] border-t border-slate-800 z-50">
          <div className="flex items-center justify-around py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition ${
                    isActive(item.path)
                      ? 'text-sky-400'
                      : 'text-slate-400'
                  }`}
                >
                  <Icon size={22} />
                  <span className="text-[10px] font-medium">{item.name}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Layout;