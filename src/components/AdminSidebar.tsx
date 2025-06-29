import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  Users,
  Dumbbell,
  Building2,
  Calendar,
  CreditCard,
  Mail,
  MessageSquare,
  Settings,
  Home,
  FileText,
  UserCheck,
  X,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';

const AdminSidebar = () => {
  const location = useLocation();
  const { 
    isMobile, 
    openMobile, 
    setOpenMobile, 
    open: desktopOpen,
    toggleSidebar 
  } = useSidebar();
  
  const menuItems = [
    { icon: Home, label: 'Overview', path: '/admin' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: Dumbbell, label: 'Trainers', path: '/admin/trainers' },
    { icon: Building2, label: 'Gyms', path: '/admin/gyms' },
    { icon: Calendar, label: 'Bookings', path: '/admin/bookings' },
    { icon: CreditCard, label: 'Transactions', path: '/admin/transactions' },
    { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
    { icon: UserCheck, label: 'Waitlist', path: '/admin/waitlist' },
    { icon: FileText, label: 'Blog', path: '/admin/blog' },
    { icon: Mail, label: 'Email', path: '/admin/email' },
    { icon: MessageSquare, label: 'Support', path: '/admin/support' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  const handleLinkClick = () => {
    // Close sidebar on mobile when a link is clicked
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleCloseMobile = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  // Determine if sidebar should be visible
  const isVisible = isMobile ? openMobile : desktopOpen;

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && openMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={handleCloseMobile}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 min-h-screen transition-transform duration-300 ease-in-out",
        // Mobile behavior
        isMobile 
          ? (openMobile ? 'translate-x-0' : '-translate-x-full')
          // Desktop behavior  
          : (desktopOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')
      )}>
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg"></div>
              <span className="text-lg sm:text-xl font-bold text-gray-900">Admin Panel</span>
            </div>
            
            {/* Mobile close button */}
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseMobile}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="px-3 sm:px-6 py-4">
          {/* Main Site Link */}
          <div className="mb-4 pb-4 border-b border-gray-100">
            <Link
              to="/"
              onClick={handleLinkClick}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Go to Main Site</span>
            </Link>
          </div>

          {/* Admin Menu */}
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleLinkClick}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>
    </>
  );
};

export default AdminSidebar;
