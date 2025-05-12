
import React from 'react';
import { Bell, Menu, Search } from 'lucide-react';
import { DateRangePicker } from '@/components/dashboard/DateRangePicker';

interface HeaderProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ collapsed, setCollapsed }) => {
  return (
    <header className="bg-background border-b border-border flex items-center justify-between h-16 px-4 sticky top-0 z-30">
      <div className="flex items-center">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="h-10 w-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors lg:hidden"
        >
          <Menu size={20} />
        </button>
        <div className="hidden lg:flex">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`h-10 w-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors ${
              !collapsed ? 'hidden' : 'flex'
            }`}
          >
            <Menu size={20} />
          </button>
        </div>
        <div className="ml-4 lg:ml-0">
          <h1 className="text-lg font-medium">Dashboard de Análise</h1>
          <p className="text-sm text-muted-foreground">Visão geral da performance</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="hidden md:block">
          <DateRangePicker />
        </div>
        <div className="hidden md:flex items-center rounded-full bg-muted/30 px-3 h-10">
          <Search size={16} className="text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar..."
            className="bg-transparent border-none text-sm focus:outline-none text-foreground ml-2 w-36 placeholder:text-muted-foreground"
          />
        </div>
        <button className="h-10 w-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></span>
        </button>
      </div>
    </header>
  );
};

export default Header;
