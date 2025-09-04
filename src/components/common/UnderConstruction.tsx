import { Construction, Hammer } from 'lucide-react';
import { Typography } from './Typography';

interface UnderConstructionProps {
  title?: string;
  message?: string;
  className?: string;
}

export const UnderConstruction = ({ 
  title = "Coming Soon", 
  message = "This feature is under construction and will be available in a future update.",
  className = ""
}: UnderConstructionProps) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center space-y-4 ${className}`}>
      <div className="relative">
        {/* Construction Icon */}
        <Construction className="w-16 h-16 text-yellow-500 mb-2" />
        {/* Animated Hammer */}
        <Hammer className="w-6 h-6 text-orange-500 absolute -top-1 -right-1 animate-pulse" />
      </div>
      
      <div className="space-y-2">
        <Typography variant="title1" className="text-foreground">
          {title}
        </Typography>
        <Typography variant="body" className="text-muted-foreground max-w-md">
          {message}
        </Typography>
      </div>
      
      <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-4">
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
        <span>In Development</span>
        <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse delay-75"></div>
      </div>
    </div>
  );
};

export default UnderConstruction;
