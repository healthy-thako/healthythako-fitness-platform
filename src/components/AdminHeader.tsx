import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Bell, Menu, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useSidebar } from '@/components/ui/sidebar';

interface AdminHeaderProps {
  title?: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title = 'Admin Dashboard' }) => {
  const { profile, signOut } = useAuth();
  const { toggleSidebar } = useSidebar();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        {/* Mobile menu toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden mr-2"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Page title */}
        <div className="flex items-center space-x-2">
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right side items */}
        <div className="flex items-center space-x-4">
          {/* Home link */}
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <Home className="h-5 w-5" />
            </Link>
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {profile?.name ? profile.name.charAt(0).toUpperCase() : 'A'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-medium leading-none">
                  {profile?.name || 'Admin User'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {profile?.email || 'admin@healthythako.com'}
                </p>
                <p className="text-xs leading-none text-muted-foreground capitalize">
                  Role: {profile?.primary_role || 'admin'}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
