import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Dumbbell, Mail, Lock, User, Phone, Building2, ArrowLeft, Loader2 } from 'lucide-react';
import AuroraBackground from '@/components/AuroraBackground';

const GymAuth = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  const [signupForm, setSignupForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    businessName: ''
  });

  // Check if already authenticated and has gym owner profile
  useEffect(() => {
    const checkGymOwner = async () => {
      if (user) {
        try {
          const { data: gymOwner } = await supabase
            .from('gym_owners')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (gymOwner) {
            navigate('/gym-dashboard');
          }
        } catch (error) {
          console.error('Error checking gym owner status:', error);
        }
      }
    };

    checkGymOwner();
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password. Please check your credentials.');
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Please check your email and confirm your account before signing in.');
        } else {
          toast.error(`Login failed: ${error.message}`);
        }
        return;
      }

      if (data.user) {
        // Check if user has gym owner profile
        const { data: gymOwner, error: gymOwnerError } = await supabase
          .from('gym_owners')
          .select('*')
          .eq('user_id', data.user.id)
          .single();

        if (gymOwnerError && gymOwnerError.code !== 'PGRST116') {
          console.error('Error checking gym owner profile:', gymOwnerError);
          toast.error('Error accessing gym owner profile. Please try again.');
          return;
        }

        if (gymOwner) {
          toast.success(`Welcome back, ${gymOwner.name}!`);
          navigate('/gym-dashboard');
        } else {
          toast.error('No gym owner profile found. Please create a new account or contact support.');
          await supabase.auth.signOut();
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupForm.email || !signupForm.password || !signupForm.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (signupForm.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      // Step 1: Sign up user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: signupForm.email,
        password: signupForm.password,
        options: {
          data: {
            name: signupForm.name,
            role: 'gym_owner',
            phone: signupForm.phone,
            business_name: signupForm.businessName
          }
        }
      });

      if (error) {
        console.error('Supabase auth error:', error);
        if (error.message.includes('User already registered')) {
          toast.error('An account with this email already exists. Please sign in instead.');
        } else {
          toast.error(`Signup failed: ${error.message}`);
        }
        return;
      }

      if (!data.user) {
        toast.error('User creation failed. Please try again.');
        return;
      }

      console.log('User created successfully:', data.user.id);

      // Step 2: If email confirmation is not required, proceed with profile creation
      if (data.session) {
        await createGymOwnerProfile(data.user, data.session);
      } else {
        // Email confirmation required
        toast.success('Account created! Please check your email to confirm your account, then sign in.');
        // Clear form and switch to login
        setSignupForm({
          email: '',
          password: '',
          confirmPassword: '',
          name: '',
          phone: '',
          businessName: ''
        });
        const loginTab = document.querySelector('[value="login"]') as HTMLButtonElement;
        loginTab?.click();
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Account creation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createGymOwnerProfile = async (user: any, session: any) => {
    try {
      // Wait a moment for session to be fully established
      await new Promise(resolve => setTimeout(resolve, 500));

      const { error: profileError } = await supabase
        .from('gym_owners')
        .insert({
          user_id: user.id,
          email: signupForm.email,
          name: signupForm.name,
          phone: signupForm.phone || null,
          business_name: signupForm.businessName || null,
          is_active: true,
          is_verified: false,
          onboarding_completed: false,
          status: 'active'
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        
        if (profileError.code === '42501') {
          toast.error('Permission denied creating profile. Please contact support.');
        } else if (profileError.code === '23505') {
          toast.error('A gym owner profile with this email already exists.');
        } else {
          toast.error(`Database error: ${profileError.message}`);
        }
        return;
      }

      console.log('Gym owner profile created successfully');
      toast.success('Account created successfully! Welcome to Thako Fit Connect!');
      
      // Clear form
      setSignupForm({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        phone: '',
        businessName: ''
      });

      // Redirect to dashboard
      setTimeout(() => {
        navigate('/gym-dashboard');
      }, 1000);

    } catch (error) {
      console.error('Error creating gym owner profile:', error);
      toast.error('Failed to create gym owner profile. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
        <AuroraBackground 
          colorStops={["#3c0747", "#c90e5c", "#3c0747"]}
          amplitude={1.2}
          blend={0.6}
          speed={0.8}
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="text-center relative z-10">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <AuroraBackground />
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Back to main auth */}
          <div className="mb-6">
            <Link 
              to="/auth" 
              className="inline-flex items-center text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Main Login
            </Link>
          </div>

          <Card className="backdrop-blur-md bg-gray-900/90 border-gray-700/50 shadow-2xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="flex items-center space-x-2">
                  <Dumbbell className="h-8 w-8 text-pink-400" />
                  <span className="text-2xl font-bold text-white">Gym Partner</span>
                </div>
              </div>
              <CardTitle className="text-2xl text-white">
                Welcome to Thako Fit Connect
              </CardTitle>
              <CardDescription className="text-white/90">
                Partner with us to grow your fitness business
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 backdrop-blur-sm border border-gray-600/30">
                  <TabsTrigger value="login" className="text-gray-200 data-[state=active]:bg-gray-700 data-[state=active]:text-white data-[state=active]:font-semibold">
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="text-gray-200 data-[state=active]:bg-gray-700 data-[state=active]:text-white data-[state=active]:font-semibold">
                    Get Started
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4 mt-6">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-white font-medium">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="your@email.com"
                          value={loginForm.email}
                          onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                          className="pl-10 bg-gray-800/60 border-gray-600/40 text-white placeholder:text-gray-400 backdrop-blur-sm focus:bg-gray-700/60 focus:border-gray-500/60"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-white font-medium">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="Enter your password"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                          className="pl-10 bg-gray-800/60 border-gray-600/40 text-white placeholder:text-gray-400 backdrop-blur-sm focus:bg-gray-700/60 focus:border-gray-500/60"
                          required
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 shadow-lg"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing In...
                        </>
                      ) : (
                        'Sign In to Dashboard'
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4 mt-6">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name" className="text-white font-medium">Full Name *</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="signup-name"
                            type="text"
                            placeholder="Your full name"
                            value={signupForm.name}
                            onChange={(e) => setSignupForm(prev => ({ ...prev, name: e.target.value }))}
                            className="pl-10 bg-gray-800/60 border-gray-600/40 text-white placeholder:text-gray-400 backdrop-blur-sm focus:bg-gray-700/60 focus:border-gray-500/60"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="text-white font-medium">Email Address *</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="your@email.com"
                            value={signupForm.email}
                            onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                            className="pl-10 bg-gray-800/60 border-gray-600/40 text-white placeholder:text-gray-400 backdrop-blur-sm focus:bg-gray-700/60 focus:border-gray-500/60"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-phone" className="text-white font-medium">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="signup-phone"
                            type="tel"
                            placeholder="+880 1234 567890"
                            value={signupForm.phone}
                            onChange={(e) => setSignupForm(prev => ({ ...prev, phone: e.target.value }))}
                            className="pl-10 bg-gray-800/60 border-gray-600/40 text-white placeholder:text-gray-400 backdrop-blur-sm focus:bg-gray-700/60 focus:border-gray-500/60"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-business" className="text-white font-medium">Business Name</Label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="signup-business"
                            type="text"
                            placeholder="Your gym/fitness center name"
                            value={signupForm.businessName}
                            onChange={(e) => setSignupForm(prev => ({ ...prev, businessName: e.target.value }))}
                            className="pl-10 bg-gray-800/60 border-gray-600/40 text-white placeholder:text-gray-400 backdrop-blur-sm focus:bg-gray-700/60 focus:border-gray-500/60"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className="text-white font-medium">Password *</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="signup-password"
                            type="password"
                            placeholder="Create a secure password"
                            value={signupForm.password}
                            onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                            className="pl-10 bg-gray-800/60 border-gray-600/40 text-white placeholder:text-gray-400 backdrop-blur-sm focus:bg-gray-700/60 focus:border-gray-500/60"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-confirm" className="text-white font-medium">Confirm Password *</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="signup-confirm"
                            type="password"
                            placeholder="Confirm your password"
                            value={signupForm.confirmPassword}
                            onChange={(e) => setSignupForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className="pl-10 bg-gray-800/60 border-gray-600/40 text-white placeholder:text-gray-400 backdrop-blur-sm focus:bg-gray-700/60 focus:border-gray-500/60"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 shadow-lg"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        'Create Gym Partner Account'
                      )}
                    </Button>

                    <p className="text-xs text-white/80 text-center font-medium">
                      By creating an account, you agree to our Terms of Service and Privacy Policy
                    </p>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-white/90 text-sm font-medium">
              Need help? Contact us at{' '}
              <a href="mailto:support@thakofit.com" className="text-pink-300 hover:text-pink-200 underline font-semibold">
                support@thakofit.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GymAuth; 