import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, ChevronDown, ExternalLink } from "lucide-react"

const Header = () => {
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-12 sm:h-14 lg:h-16 max-w-screen-2xl items-center px-3 sm:px-4 lg:px-6">
        {/* Desktop Logo and Navigation */}
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-4 lg:mr-6 flex items-center space-x-2">
            <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 mesh-gradient-overlay rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs sm:text-sm">HT</span>
            </div>
            <span className="hidden font-bold sm:inline-block text-sm lg:text-base">
              HealthyThako
            </span>
          </Link>
          <nav className="flex items-center gap-3 lg:gap-4 xl:gap-6 text-xs sm:text-sm">
            <Link
              to="/find-trainers"
              className="transition-colors hover:text-foreground/80 text-foreground/60 whitespace-nowrap"
            >
              Find Trainers
            </Link>
            <Link
              to="/browse-services"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Services
            </Link>
            <Link
              to="/gym-membership"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Gyms
            </Link>
            <Link
              to="/gympass"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              GymPass
            </Link>
            
            {/* Free Tools Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 transition-colors hover:text-foreground/80 text-foreground/60 whitespace-nowrap">
                Free Tools
                <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <a 
                    href="https://workoutroutineplanner.fit" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 w-full"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Workout Routine Planner
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a 
                    href="https://calculator.healthythako.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 w-full"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Fitness Calculators
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/blog" className="flex items-center gap-2 w-full">
                    Blog
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <a
              href="https://healthythako.shop"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 transition-colors hover:text-foreground/80 text-foreground/60 whitespace-nowrap"
            >
              Shop
              <ExternalLink className="h-3 w-3" />
            </a>
            
            <a
              href="https://ai.healthythako.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 transition-colors hover:text-foreground/80 text-foreground/60 whitespace-nowrap"
            >
              AI Assistant
              <ExternalLink className="h-3 w-3" />
            </a>
          </nav>
        </div>

        {/* Mobile Logo */}
        <div className="flex md:hidden">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-6 h-6 mesh-gradient-overlay rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">HT</span>
            </div>
            <span className="font-bold text-sm">
              HealthyThako
            </span>
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[320px]">
              <SheetHeader className="text-left">
                <SheetTitle className="text-lg">Menu</SheetTitle>
                <SheetDescription className="text-sm">
                  Explore HealthyThako
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-3 py-4">
                <Link
                  to="/find-trainers"
                  className="block py-2 text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Find Trainers
                </Link>
                <Link
                  to="/browse-services"
                  className="block py-2 text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Services
                </Link>
                <Link
                  to="/gym-membership"
                  className="block py-2 text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Gyms
                </Link>
                <Link
                  to="/gympass"
                  className="block py-2 text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  GymPass
                </Link>
                
                {/* Free Tools Section for Mobile */}
                <div className="pt-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Free Tools</p>
                  <div className="space-y-2">
                    <a
                      href="https://workoutroutineplanner.fit"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 py-2 text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <ExternalLink className="h-4 w-4" />
                      Workout Routine Planner
                    </a>
                    <a
                      href="https://calculator.healthythako.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 py-2 text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <ExternalLink className="h-4 w-4" />
                      Fitness Calculators
                    </a>
                    <Link
                      to="/blog"
                      className="block py-2 text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Blog
                    </Link>
                  </div>
                </div>
                
                <a
                  href="https://healthythako.shop"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 py-2 text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ExternalLink className="h-4 w-4" />
                  Shop
                </a>
                
                <a
                  href="https://ai.healthythako.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 py-2 text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ExternalLink className="h-4 w-4" />
                  AI Assistant
                </a>
                
                <hr className="my-2" />
                
                {!user ? (
                  <div className="space-y-2">
                    <Link to="/auth" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full justify-start text-sm h-9">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/auth" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="default" size="sm" className="w-full justify-start text-sm h-9">
                        Start Journey
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link to="/dashboard" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full justify-start text-sm h-9">
                        Dashboard
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        handleSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full justify-start text-sm h-9"
                    >
                      Sign Out
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Desktop Actions */}
          {!user ? (
            <div className="hidden md:flex items-center gap-2 lg:gap-3">
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="text-foreground/80 hover:text-foreground text-xs lg:text-sm px-2 lg:px-3 h-8 lg:h-9">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth">
                <div className="relative inline-flex items-center justify-center group">
                  <div className="absolute inset-0 duration-1000 opacity-60 transition-all bg-gradient-to-r from-indigo-500 via-pink-500 to-yellow-400 rounded-md blur-lg filter group-hover:opacity-100 group-hover:duration-200"></div>
                  <button className="relative text-white rounded-md px-2 lg:px-4 py-1.5 lg:py-2 shadow-md hover:shadow-lg transition-all duration-200 font-medium text-xs lg:text-sm bg-gray-900 hover:bg-gray-800 hover:-translate-y-0.5 hover:shadow-gray-600/30">
                    Start Journey
                  </button>
                </div>
              </Link>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/dashboard">
                <Button variant="secondary" size="sm" className="text-xs lg:text-sm px-2 lg:px-3 h-8 lg:h-9">
                  Dashboard
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleSignOut} className="text-xs lg:text-sm px-2 lg:px-3 h-8 lg:h-9">
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
