import React from 'react';
import { cn } from '@/lib/utils';
import Button from './Button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface GiftCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  to: string;
  variant?: 'primary' | 'secondary';
  className?: string;
}

const GiftCard = ({
  title,
  description,
  icon,
  to,
  variant = 'primary',
  className,
}: GiftCardProps) => {
  return (
    <div 
      className={cn(
        'bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 transition-all duration-300 hover:bg-white/10 hover-lift',
        className
      )}
    >
      <div className="flex flex-col items-center text-center space-y-6">
        <div 
          className={cn(
            'w-16 h-16 rounded-xl flex items-center justify-center transform transition-transform hover:rotate-6',
            variant === 'primary' 
              ? 'bg-gradient-to-br from-primary/20 to-primary/10 text-primary' 
              : 'bg-gradient-to-br from-secondary/20 to-secondary/10 text-secondary'
          )}
        >
          {icon}
        </div>
        
        <div className="space-y-3">
          <h3 className="text-2xl font-display font-medium text-white">{title}</h3>
          <p className="text-gray-300">{description}</p>
        </div>
        
        <Link to={to} className="w-full">
          <Button 
            variant={variant === 'primary' ? 'primary' : 'secondary'} 
            fullWidth
            className={cn(
              'bg-gradient-to-r text-white font-medium shadow-xl',
              variant === 'primary' 
                ? 'from-primary/90 to-secondary/90 hover:from-primary hover:to-secondary shadow-primary/20' 
                : 'from-secondary/90 to-primary/90 hover:from-secondary hover:to-primary shadow-secondary/20'
            )}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            {variant === 'primary' ? 'Claim Now' : 'Create Now'}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default GiftCard;
