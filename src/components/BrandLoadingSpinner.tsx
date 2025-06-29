
import React from 'react';

interface BrandLoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

const BrandLoadingSpinner: React.FC<BrandLoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '',
  showText = false  // Changed default from true to false
}) => {
  const sizeClasses = {
    sm: 'h-8 w-12',
    md: 'h-12 w-18',
    lg: 'h-16 w-24',
    xl: 'h-20 w-30'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`relative ${sizeClasses[size]} mb-4`}>
        <img 
          src="/lovable-uploads/8c3f6626-839f-4025-8d47-eb634c778219.png"
          alt="HealthyThako Logo"
          className="w-full h-full object-contain animate-pulse"
        />
        {/* Shining overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine"></div>
      </div>
      {showText && (
        <div className="text-center">
          <p className="text-gray-600 text-sm font-medium">Loading...</p>
        </div>
      )}
    </div>
  );
};

export default BrandLoadingSpinner;
