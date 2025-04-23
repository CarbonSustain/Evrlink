
import React from 'react';
import { cn } from '@/lib/utils';

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
};

const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className,
  disabled = false,
  type = 'button',
  icon,
  iconPosition = 'right',
  loading = false,
  fullWidth = false,
}: ButtonProps) => {
  const baseStyles = 'relative inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background';
  
  const variants = {
    primary: 'fancy-button-bg text-white shadow-sm hover:shadow-md focus:ring-primary/50',
    secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:shadow-md focus:ring-secondary/50',
    outline: 'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground focus:ring-primary/20',
    ghost: 'hover:bg-accent hover:text-accent-foreground focus:ring-primary/20',
  };
  
  const sizes = {
    sm: 'text-sm py-1.5 px-3',
    md: 'text-base py-2.5 px-5',
    lg: 'text-lg py-3 px-6',
  };
  
  const states = {
    disabled: 'opacity-50 cursor-not-allowed',
    loading: 'cursor-wait',
    fullWidth: 'w-full',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        disabled && states.disabled,
        loading && states.loading,
        fullWidth && states.fullWidth,
        className
      )}
    >
      {loading ? (
        <div className="loading-dots mr-2">
          <span className="inline-block w-1.5 h-1.5 bg-current rounded-full mr-1"></span>
          <span className="inline-block w-1.5 h-1.5 bg-current rounded-full mr-1"></span>
          <span className="inline-block w-1.5 h-1.5 bg-current rounded-full"></span>
        </div>
      ) : iconPosition === 'left' && icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      
      {children}
      
      {!loading && iconPosition === 'right' && icon ? (
        <span className="ml-2">{icon}</span>
      ) : null}
    </button>
  );
};

export default Button;
