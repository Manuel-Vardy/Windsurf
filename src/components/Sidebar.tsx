import React from 'react';
import { useSchool } from '@/contexts/SchoolContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  GraduationCap, 
  Users, 
  LayoutDashboard, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  currentView: 'dashboard' | 'class';
  onViewChange: (view: 'dashboard' | 'class') => void;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, className }) => {
  const { classes, selectedClass, setSelectedClass } = useSchool();
  const { logout, user } = useAuth();

  const handleClassClick = (classId: number) => {
    setSelectedClass(classId);
    onViewChange('class');
  };

  return (
    <aside className={cn("w-64 min-h-screen gradient-sidebar text-sidebar-foreground flex flex-col", className)}>
      {/* Logo Section */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg">School Canteen</h1>
            <p className="text-xs text-white/70">Management System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {/* Dashboard */}
        <button
          onClick={() => onViewChange('dashboard')}
          className={cn(
            'sidebar-item w-full text-left',
            currentView === 'dashboard' && 'active'
          )}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </button>

        {/* Classes Section */}
        <div className="pt-4">
          <p className="text-xs uppercase tracking-wider text-white/50 px-4 mb-2">Classes</p>
          {classes.map((classInfo) => (
            <button
              key={classInfo.id}
              onClick={() => handleClassClick(classInfo.id)}
              className={cn(
                'sidebar-item w-full text-left',
                currentView === 'class' && selectedClass === classInfo.id && 'active'
              )}
            >
              <Users className="w-5 h-5" />
              <span className="flex-1">{classInfo.name}</span>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>
          ))}
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">{user?.name.charAt(0)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-white/70">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="sidebar-item w-full text-left text-white/80 hover:text-white"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
