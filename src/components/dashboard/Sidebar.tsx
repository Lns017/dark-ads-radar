
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  LayoutDashboard, 
  Menu, 
  ChevronLeft,
  Code,
  Settings,
  LineChart,
  Facebook
} from 'lucide-react';
import UserProfile from './UserProfile';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  
  const navItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: 'Pixels',
      path: '/pixels',
      icon: <Code size={20} />,
    },
    {
      name: 'Campanhas',
      path: '/campaigns',
      icon: <LineChart size={20} />,
    },
    {
      name: 'Facebook Ads',
      path: '/facebook',
      icon: <Facebook size={20} />,
    },
    {
      name: 'Google Ads',
      path: '/google',
      icon: <BarChart3 size={20} />,
    },
    {
      name: 'Configurações',
      path: '/settings',
      icon: <Settings size={20} />,
    },
  ];

  return (
    <div 
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-border bg-background transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        <div className={cn("flex items-center", collapsed && "justify-center pl-2")}>
          {!collapsed && (
            <span className="text-xl font-bold">PixelTrack</span>
          )}
          {collapsed && (
            <span className="text-xl font-bold">PT</span>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors hidden lg:flex"
        >
          {collapsed ? <Menu size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <div className="py-4 flex flex-col h-[calc(100vh-4rem-1px)] justify-between">
        <div>
          <div className="px-3 pb-2">
            {!collapsed && <p className="text-xs font-medium text-muted-foreground mb-1 ml-2">MENU</p>}
          </div>
          <nav className="grid gap-1 px-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors",
                  location.pathname === item.path && "bg-muted/50 text-foreground",
                  collapsed && "justify-center px-0"
                )}
              >
                {item.icon}
                {!collapsed && <span>{item.name}</span>}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="mt-auto border-t border-border pt-2">
          <UserProfile />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
