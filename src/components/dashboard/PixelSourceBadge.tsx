
import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Facebook } from 'lucide-react';

interface PixelSourceBadgeProps {
  source: 'manual' | 'facebook';
  className?: string;
}

const PixelSourceBadge: React.FC<PixelSourceBadgeProps> = ({ source, className }) => {
  if (source === 'facebook') {
    return (
      <Badge 
        variant="outline" 
        className={cn("flex items-center gap-1 bg-facebook/5 text-facebook border-facebook/20", className)}
      >
        <Facebook className="h-3 w-3" />
        Meta Ads
      </Badge>
    );
  }
  
  return (
    <Badge 
      variant="outline" 
      className={cn("bg-muted/30", className)}
    >
      Manual
    </Badge>
  );
};

export default PixelSourceBadge;
