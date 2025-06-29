import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Shield, Loader2, ArrowLeft } from 'lucide-react';
import AuroraBackground from '@/components/AuroraBackground';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, profile, adminSignIn } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (user && profile && profile.primary_role === 'admin') {
      navigate('/admin');
    }
  }, [user, profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await adminSignIn(username, password);
      if (error) {
        toast.error(error.message || "Invalid credentials");
      } else {
        toast.success("Welcome back, Admin!");
        navigate('/admin');
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <AuroraBackground />
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <Link 
              to="/" 
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Home
            </Link>
            <div className="flex justify-center">
              <div className="p-3 bg-primary/10 rounded-full">
                <Shield className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Portal</h1>
            <p className="text-muted-foreground">
              Secure admin access to HealthyThako platform
            </p>
          </div>

          <Card className="border-0 shadow-2xl backdrop-blur-sm bg-background/80">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-xl">Sign In</CardTitle>
              <CardDescription>
                Enter your admin credentials to access the dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              This is a secure admin area. All access attempts are logged.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
