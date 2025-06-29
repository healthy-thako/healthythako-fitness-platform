import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface AdminBreadcrumbProps {
  items: BreadcrumbItem[];
  showBackButton?: boolean;
  showHomeButton?: boolean;
  className?: string;
}

const AdminBreadcrumb: React.FC<AdminBreadcrumbProps> = ({ 
  items, 
  showBackButton = true, 
  showHomeButton = true,
  className = "" 
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className={`flex items-center justify-between mb-4 sm:mb-6 ${className}`}>
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-1 text-sm text-gray-600 flex-1">
        {/* Home Button */}
        {showHomeButton && (
          <>
            <Link 
              to="/admin" 
              className="flex items-center hover:text-purple-600 transition-colors"
              title="Go to Admin Dashboard"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Admin</span>
            </Link>
            {items.length > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
          </>
        )}

        {/* Breadcrumb Items */}
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {item.href && !item.current ? (
              <Link 
                to={item.href} 
                className="hover:text-purple-600 transition-colors truncate max-w-[120px] sm:max-w-[200px]"
                title={item.label}
              >
                {item.label}
              </Link>
            ) : (
              <span 
                className={`${item.current ? 'text-gray-900 font-medium' : 'text-gray-500'} truncate max-w-[120px] sm:max-w-[200px]`}
                title={item.label}
              >
                {item.label}
              </span>
            )}
            {index < items.length - 1 && <ChevronRight className="h-4 w-4 text-gray-400" />}
          </React.Fragment>
        ))}
      </nav>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        {/* Back Button */}
        {showBackButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="text-gray-600 hover:text-gray-900 flex-shrink-0"
            title="Go back"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        )}

        {/* Main Site Link */}
        <Link to="/">
          <Button
            variant="outline"
            size="sm"
            className="text-gray-600 hover:text-gray-900 flex-shrink-0"
            title="Go to Main Site"
          >
            <Home className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Main Site</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default AdminBreadcrumb; 