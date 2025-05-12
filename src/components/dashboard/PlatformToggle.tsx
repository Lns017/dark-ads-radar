
import React from 'react';
import { cn } from '@/lib/utils';

interface PlatformToggleProps {
  activeTab: 'all' | 'facebook' | 'google';
  setActiveTab: (tab: 'all' | 'facebook' | 'google') => void;
}

const PlatformToggle: React.FC<PlatformToggleProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex items-center gap-2 p-1 bg-secondary rounded-lg">
      <button
        className={cn(
          'flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all',
          activeTab === 'all'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
        onClick={() => setActiveTab('all')}
      >
        Todos
      </button>
      
      <button
        className={cn(
          'flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all',
          activeTab === 'facebook'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
        onClick={() => setActiveTab('facebook')}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 mr-1.5 fill-facebook">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        Facebook Ads
      </button>
      
      <button
        className={cn(
          'flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all',
          activeTab === 'google'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
        onClick={() => setActiveTab('google')}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 mr-1.5">
          <path d="M22.5 12c0-.786-.07-1.557-.195-2.306h-10.11v4.363h5.88c-.252 1.367-1.04 2.53-2.215 3.3v2.745h3.588C21.284 18.092 22.5 15.3 22.5 12z" fill="#4285F4" />
          <path d="M12.195 22.5c2.998 0 5.508-.99 7.353-2.678l-3.588-2.745c-.99.66-2.26 1.05-3.765 1.05-2.893 0-5.34-1.935-6.218-4.527H2.265v2.835C4.095 20.115 7.785 22.5 12.195 22.5z" fill="#34A853" />
          <path d="M5.977 13.6c-.225-.66-.345-1.365-.345-2.1s.12-1.44.345-2.1V6.565H2.265C1.485 8.1 1.05 9.975 1.05 12s.435 3.9 1.215 5.435l3.712-2.835z" fill="#FBBC05" />
          <path d="M12.195 5.373c1.635 0 3.09.57 4.245 1.665l3.180-3.135C17.655 1.95 15.15.75 12.195.75c-4.41 0-8.1 2.385-10.155 5.85l3.712 2.835c.885-2.595 3.323-4.527 6.218-4.527z" fill="#EA4335" />
        </svg>
        Google Ads
      </button>
    </div>
  );
};

export default PlatformToggle;
