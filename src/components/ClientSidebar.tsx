
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
  SidebarFooter,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  Search, 
  Calendar, 
  MessageSquare, 
  Heart, 
  Star, 
  Settings, 
  LogOut,
  CreditCard,
  History,
  Dumbbell
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const ClientSidebar = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const menuItems = [
    {
      title: "Dashboard",
      url: "/client-dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Find Trainers",
      url: "/find-trainers",
      icon: Search,
    },
    {
      title: "My Sessions",
      url: "/client-dashboard/sessions",
      icon: Calendar,
    },
    {
      title: "Gym Memberships",
      url: "/client-dashboard/memberships",
      icon: Dumbbell,
    },
    {
      title: "Messages",
      url: "/client-dashboard/messages",
      icon: MessageSquare,
    },
    {
      title: "Favorites",
      url: "/client-dashboard/favorites",
      icon: Heart,
    },
    {
      title: "Reviews",
      url: "/client-dashboard/reviews",
      icon: Star,
    },
    {
      title: "Order History",
      url: "/client-dashboard/history",
      icon: History,
    },
    {
      title: "Payments",
      url: "/client-dashboard/payments",
      icon: CreditCard,
    },
    {
      title: "Settings",
      url: "/client-dashboard/settings",
      icon: Settings,
    },
  ];

  const isActiveRoute = (url: string) => {
    if (url === "/client-dashboard") {
      return location.pathname === "/client-dashboard" || location.pathname === "/client-dashboard/";
    }
    return location.pathname === url;
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-gray-200 bg-white">
      <SidebarHeader className="px-4 py-4 border-b border-gray-100 bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 mesh-gradient-overlay rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">HT</span>
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <span className="text-base font-bold text-gray-900">Client Portal</span>
            <p className="text-xs text-gray-500 mt-0.5">Fitness Dashboard</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-2 py-4 bg-white">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-2">
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => {
                const isActive = isActiveRoute(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      size="sm"
                      className={cn(
                        "w-full justify-start px-3 py-2.5 rounded-lg transition-all duration-200",
                        "hover:bg-gray-100 hover:shadow-sm text-gray-700 hover:text-gray-900",
                        "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2",
                        isActive && "bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200/50 shadow-sm text-pink-700 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50"
                      )}
                    >
                      <Link to={item.url} className="flex items-center space-x-3 w-full">
                        <item.icon className={cn(
                          "h-4 w-4 flex-shrink-0 transition-colors",
                          isActive ? "text-pink-600" : "text-gray-500"
                        )} />
                        <span className={cn(
                          "text-sm font-medium truncate group-data-[collapsible=icon]:hidden",
                          isActive ? "text-pink-700" : "text-gray-700"
                        )}>
                          {item.title}
                        </span>
                        {isActive && (
                          <div className="w-1.5 h-1.5 bg-pink-500 rounded-full ml-auto group-data-[collapsible=icon]:hidden" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-2 py-4 border-t border-gray-100 bg-gray-50">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleSignOut} 
              size="sm"
              className="w-full justify-start px-3 py-2.5 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        
        <div className="mt-3 px-3 group-data-[collapsible=icon]:hidden">
          <div className="text-xs text-gray-400 text-center space-y-1">
            <p className="font-medium">© 2025 HealthyThako</p>
            <p>Client Portal v1.0</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default ClientSidebar;
