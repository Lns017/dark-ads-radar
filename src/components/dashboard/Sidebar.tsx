import React, { useState } from 'react';
import { 
  BarChart3, 
  Building2, 
  Facebook,
  LayoutDashboard, 
  Settings, 
  Tag, 
  Users 
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const menuItems = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard size={18} />,
      href: "/",
    },
    {
      name: "Pixels",
      icon: <Tag size={18} />,
      href: "/pixels",
    },
    {
      name: "Campanhas",
      icon: <BarChart3 size={18} />,
      href: "/campaigns",
    },
    {
      name: "Facebook Ads",
      icon: <Facebook size={18} />,
      href: "/facebook-integration",
    },
    {
      name: "Clientes",
      icon: <Users size={18} />,
      href: "/customers",
    },
    {
      name: "Empresa",
      icon: <Building2 size={18} />,
      href: "/company",
    },
    {
      name: "Configurações",
      icon: <Settings size={18} />,
      href: "/settings",
    },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full flex-col bg-secondary border-r border-r-border transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="flex items-center justify-center py-3">
          <Link to="/" className="flex items-center">
            <span className="font-semibold text-xl">PixelTrack</span>
          </Link>
        </div>

        <nav className="flex-grow px-3 py-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`flex items-center space-x-3 rounded-md p-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground ${
                    location.pathname === item.href ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {item.icon}
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-3">
          {!collapsed && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex h-8 w-full items-center justify-center rounded-md">
                  <Avatar className="mr-2 h-8 w-8">
                    <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.full_name} />
                    <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span>{user?.user_metadata?.full_name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40" align="end" forceMount>
                <DropdownMenuItem>
                  Meu Perfil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={async () => {
                  await signOut();
                }}>
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="absolute left-4 top-4 md:hidden">
            <LayoutDashboard size={20} />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <SheetHeader className="text-left">
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav className="flex-grow px-3 py-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`flex items-center space-x-3 rounded-md p-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground ${
                      location.pathname === item.href ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                    }`}
                    onClick={() => setIsSheetOpen(false)}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="p-3">
            <Button variant="outline" className="w-full" onClick={async () => {
              await signOut();
              setIsSheetOpen(false);
            }}>
              Sair
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Sidebar;
