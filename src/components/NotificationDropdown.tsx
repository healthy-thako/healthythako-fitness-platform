import React from 'react';
import { Bell, Check, CheckCheck, Clock, ShieldCheck, ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { useNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

const NotificationDropdown = () => {
  const { data: notifications = [], isLoading } = useNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAsRead = (notificationId: string, isRead: boolean) => {
    if (!isRead) {
      markAsRead.mutate(notificationId);
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_booking':
        return '📅';
      case 'booking_status':
        return '✅';
      case 'payment':
        return '💰';
      case 'review':
        return '⭐';
      case 'gym_verification':
        return <ShieldCheck className="h-5 w-5 text-green-500" />;
      case 'trainer_verification':
        return <ShieldCheck className="h-5 w-5 text-blue-500" />;
      case 'admin_verification_request':
        return <ShieldX className="h-5 w-5 text-orange-500" />;
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'gym_verification':
      case 'trainer_verification':
        return 'bg-green-50';
      case 'admin_verification_request':
        return 'bg-orange-50';
      default:
        return 'bg-blue-50';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-3 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Notifications</h3>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleMarkAllAsRead}
                className="text-xs h-6"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>
        
        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No notifications yet
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-3 cursor-pointer ${!notification.is_read ? getNotificationColor(notification.type) : ''}`}
                onClick={() => handleMarkAsRead(notification.id, notification.is_read)}
              >
                <div className="flex items-start space-x-3 w-full">
                  <div className="text-lg flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {notification.title}
                      </p>
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 ml-2"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button variant="ghost" className="w-full text-sm" size="sm">
                View all notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
