import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbProps {
  items?: { label: string; href: string }[];
  variant?: 'light' | 'dark';
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, variant = 'dark', className = '' }) => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  const defaultItems = [
    { label: 'Home', href: '/' },
    ...pathSegments.map((segment, index) => ({
      label: segment.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      href: '/' + pathSegments.slice(0, index + 1).join('/')
    }))
  ];

  const breadcrumbItems = items || defaultItems;

  const textColorClass = variant === 'light' 
    ? 'text-white/80 hover:text-white' 
    : 'text-gray-500 hover:text-gray-700';

  const currentTextColorClass = variant === 'light'
    ? 'text-white font-medium'
    : 'text-gray-900 font-medium';

  return (
    <nav className={`flex items-center space-x-1 text-sm ${className}`}>
      {breadcrumbItems.map((item, index) => (
        <div key={item.href} className="flex items-center">
          {index > 0 && (
            <ChevronRight
              className={`h-4 w-4 mr-1 ${variant === 'light' ? 'text-white/60' : 'text-gray-400'}`}
            />
          )}
          {index === breadcrumbItems.length - 1 ? (
            <span className={currentTextColorClass}>{item.label}</span>
          ) : (
            <Link
              to={item.href}
              className={`${textColorClass} hover:underline transition-colors duration-200`}
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumb; 