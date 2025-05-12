
import React from 'react';
import { BarChart3, GaugeCircle, Home, LayoutDashboard, Settings, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  return (
    <div 
      className={cn(
        'h-screen bg-sidebar fixed left-0 top-0 z-40 flex flex-col border-r border-border transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className={cn('flex items-center', collapsed ? 'justify-center w-full' : '')}>
          {!collapsed && (
            <span className="text-xl font-semibold text-white ml-2">PixelTrack</span>
          )}
          {collapsed && (
            <span className="text-xl font-bold text-primary">PT</span>
          )}
        </div>
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'h-6 w-6 rounded-full flex items-center justify-center text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors',
            collapsed ? 'hidden' : 'block'
          )}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-1">
        <SidebarLink icon={<LayoutDashboard />} label="Dashboard" to="/" collapsed={collapsed} active />
        <SidebarLink icon={<BarChart3 />} label="Campanhas" to="/campaigns" collapsed={collapsed} />
        <SidebarLink icon={<GaugeCircle />} label="Pixels" to="/pixels" collapsed={collapsed} />
        <SidebarLink icon={<Users />} label="Clientes" to="/clients" collapsed={collapsed} />
        <SidebarLink icon={<Settings />} label="Configurações" to="/settings" collapsed={collapsed} />
      </nav>
      
      <div className="p-4 border-t border-border">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
            U
          </div>
          {!collapsed && (
            <div className="ml-3">
              <p className="text-sm font-medium text-sidebar-foreground">User Name</p>
              <p className="text-xs text-sidebar-foreground/60">user@example.com</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface SidebarLinkProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  collapsed: boolean;
  active?: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ icon, label, to, collapsed, active }) => {
  return (
    <Link
      to={to}
      className={cn(
        'flex items-center p-2 rounded-md transition-colors',
        active 
          ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
        collapsed ? 'justify-center' : ''
      )}
    >
      <span className="w-5 h-5">{icon}</span>
      {!collapsed && <span className="ml-3 text-sm">{label}</span>}
    </Link>
  );
};

export default Sidebar;
