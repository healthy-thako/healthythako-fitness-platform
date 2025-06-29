
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications, useMarkAllNotificationsAsRead } from '@/hooks/useNotifications';
import { 
  Bell, 
  Search, 
  User, 
  Settings, 
  LogOut,
  Calendar,
  MessageSquare,
  Eye
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const TrainerHeader = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: notifications } = useNotifications();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount > 0) {
      await markAllAsRead.mutateAsync();
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_booking':
      case 'booking_update':
        return <Calendar className="h-4 w-4" />;
      case 'new_message':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <SidebarTrigger />
          
          {/* Search */}
          <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-2 w-96">
            <Search className="h-4 w-4 text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search clients, orders, messages..."
              className="bg-transparent border-none outline-none flex-1 text-sm"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {/* Today's Schedule */}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/trainer-dashboard/schedule')}
            className="hidden md:flex"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Today's Schedule
          </Button>

          {/* Notifications */}
          <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Notifications</h3>
                  {unreadCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleMarkAllAsRead}
                      className="text-xs"
                    >
                      Mark all read
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                {notifications && notifications.length > 0 ? (
                  notifications.slice(0, 10).map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${
                        !notification.is_read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{notification.title}</p>
                          <p className="text-sm text-gray-600 truncate">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {format(new Date(notification.created_at), 'MMM dd, HH:mm')}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 text-sm">No notifications yet</p>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-purple-600" />
                </div>
                <span className="hidden md:block text-sm font-medium">
                  {user?.email?.split('@')[0] || 'Trainer'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate(`/trainer/${user?.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                <span>View Public Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/trainer-dashboard/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>My Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/trainer-dashboard/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default TrainerHeader;
