import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser, logout } from '../services/db';
import { UserRole } from '../types';
import { LogOut, BookOpen, Users, CheckSquare, LayoutDashboard, GraduationCap } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
    <button
      onClick={() => navigate(to)}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
        isActive(to)
          ? 'bg-blue-600 text-white shadow-md'
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold flex items-center gap-2 text-blue-400">
            <GraduationCap />
            Team21
          </h1>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">Learning Platform</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {user.role === UserRole.ADMIN && (
            <>
              <NavItem to="/dashboard" icon={LayoutDashboard} label="Overview" />
              <NavItem to="/admin/users" icon={Users} label="User Management" />
              <NavItem to="/admin/courses" icon={BookOpen} label="Course Manager" />
            </>
          )}

          {user.role === UserRole.MENTOR && (
            <>
              <NavItem to="/dashboard" icon={Users} label="My Students" />
              <NavItem to="/mentor/grading" icon={CheckSquare} label="Grading Queue" />
            </>
          )}

          {user.role === UserRole.STUDENT && (
            <>
              <NavItem to="/dashboard" icon={BookOpen} label="My Courses" />
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
             <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold">
                {user.fullName.charAt(0)}
             </div>
             <div className="overflow-hidden">
                 <p className="text-sm font-medium truncate">{user.fullName}</p>
                 <p className="text-xs text-slate-500 truncate">{user.role}</p>
             </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-2 text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="p-8 max-w-7xl mx-auto">
            {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
