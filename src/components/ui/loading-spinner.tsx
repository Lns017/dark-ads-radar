
import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  withText?: boolean;
  text?: string;
}

const LoadingSpinner = ({
  size = 'md',
  withText = true,
  text = 'Carregando...',
  className,
  ...props
}: LoadingSpinnerProps) => {
  const spinnerSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center', className)} {...props}>
      <div 
        className={cn(
          'rounded-full border-4 border-primary/20 border-t-primary animate-spin', 
          spinnerSizeClasses[size]
        )} 
      />
      {withText && <p className="mt-2 text-muted-foreground text-sm">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
