
import React from 'react';
import BrandLoadingSpinner from './BrandLoadingSpinner';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
  useBrandLogo?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '',
  showText = false,  // Changed default from false to false (keeping consistent)
  useBrandLogo = false
}) => {
  // Use brand logo for better user experience
  if (useBrandLogo) {
    return (
      <BrandLoadingSpinner 
        size={size} 
        className={className} 
        showText={showText}
      />
    );
  }

  // Fallback to simple spinner
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-brand-primary ${sizeClasses[size]}`}></div>
    </div>
  );
};

export default LoadingSpinner;
