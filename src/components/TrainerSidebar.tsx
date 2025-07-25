
import React from 'react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  Target, 
  ShoppingBag, 
  MessageSquare, 
  Calendar, 
  BarChart3, 
  DollarSign, 
  FileText,
  User,
  CreditCard,
  Settings, 
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const TrainerSidebar = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActiveRoute = (url: string) => {
    // Handle exact matches and nested routes
    if (url === "/trainer-dashboard") {
      return location.pathname === "/trainer-dashboard" || location.pathname === "/trainer-dashboard/";
    }
    // For nested routes, check if current path starts with the URL
    return location.pathname === url || location.pathname.startsWith(url + '/');
  };

  const handleSignOut = async () => {
    try {
      console.log('TrainerSidebar: Initiating signout...');

      // Add loading state to prevent multiple clicks
      const button = document.querySelector('[data-signout-button]');
      if (button) {
        button.textContent = 'Signing out...';
        button.disabled = true;
      }

      // Call signOut which handles navigation
      await signOut();
      console.log('TrainerSidebar: Signout completed');

    } catch (error) {
      console.error('TrainerSidebar: Signout error:', error);

      // Reset button state on error
      const button = document.querySelector('[data-signout-button]');
      if (button) {
        button.textContent = 'Sign Out';
        button.disabled = false;
      }

      // Fallback navigation
      console.log('TrainerSidebar: Using fallback navigation...');
      window.location.href = '/';
    }
  };

  const menuItems = [
    {
      title: "Dashboard",
      url: "/trainer-dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "My Gigs",
      url: "/trainer-dashboard/gigs",
      icon: Target,
    },
    {
      title: "Orders",
      url: "/trainer-dashboard/orders",
      icon: ShoppingBag,
    },
    {
      title: "Messages",
      url: "/trainer-dashboard/messages",
      icon: MessageSquare,
    },
    {
      title: "Schedule",
      url: "/trainer-dashboard/schedule",
      icon: Calendar,
    },
    {
      title: "Analytics",
      url: "/trainer-dashboard/analytics",
      icon: BarChart3,
    },
    {
      title: "Earnings",
      url: "/trainer-dashboard/earnings",
      icon: DollarSign,
    },
    {
      title: "Client Requests",
      url: "/trainer-dashboard/requests",
      icon: FileText,
    },
    {
      title: "My Profile",
      url: "/trainer-dashboard/profile",
      icon: User,
    },
    {
      title: "Withdraw Earnings",
      url: "/trainer-dashboard/withdraw",
      icon: CreditCard,
    },
    {
      title: "Settings",
      url: "/trainer-dashboard/settings",
      icon: Settings,
    },
  ];

  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarHeader className="p-4 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 mesh-gradient-overlay rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">HT</span>
          </div>
          <span className="text-lg font-bold text-gray-900">Trainer Hub</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = isActiveRoute(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        "text-sm transition-colors",
                        isActive && "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50 shadow-sm text-blue-700"
                      )}
                    >
                      <Link to={item.url} className="flex items-center space-x-3 px-3 py-2 rounded-lg">
                        <item.icon className={cn(
                          "h-4 w-4",
                          isActive ? "text-blue-600" : "text-gray-500"
                        )} />
                        <span className={cn(
                          isActive ? "text-blue-700 font-medium" : "text-gray-700"
                        )}>
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-gray-100">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleSignOut}
              data-signout-button
              className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full text-sm"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default TrainerSidebar;
