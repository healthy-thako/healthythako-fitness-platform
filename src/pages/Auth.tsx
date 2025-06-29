import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Loader2, Dumbbell, ArrowLeft, Building } from 'lucide-react';
import AuroraBackground from '@/components/AuroraBackground';
import ForgotPasswordModal from '@/components/ForgotPasswordModal';
import UpdatePasswordForm from '@/components/UpdatePasswordForm';

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, user, loading, resetPassword, updatePassword } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'client' as 'client' | 'trainer'
  });

  const isSignupPage = location.pathname === '/signup';

  useEffect(() => {
    if (user && !loading && !isPasswordRecovery) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate, isPasswordRecovery]);

  useEffect(() => {
    // Check if this is a password recovery session
    const urlParams = new URLSearchParams(location.search);
    const accessToken = urlParams.get('access_token');
    const type = urlParams.get('type');
    
    if (accessToken && type === 'recovery') {
      setIsPasswordRecovery(true);
    }
  }, [location]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await signIn(loginForm.email, loginForm.password);
    
    if (error) {
      toast.error(error.message || 'Login failed');
    } else {
      toast.success('Login successful!');
      navigate('/dashboard');
    }
    
    setIsSubmitting(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupForm.password !== signupForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (signupForm.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);

    const { error } = await signUp(
      signupForm.email,
      signupForm.password,
      signupForm.role,
      signupForm.name
    );
    
    if (error) {
      toast.error(error.message || 'Signup failed');
    } else {
      toast.success('Account created successfully! Please check your email to verify your account.');
      setSignupForm({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        role: 'client'
      });
    }
    
    setIsSubmitting(false);
  };

  const handlePasswordUpdateSuccess = () => {
    setIsPasswordRecovery(false);
    toast.success('Password updated successfully! You can now log in with your new password.');
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
    <>
      <Helmet>
        <title>{isSignupPage ? 'Sign Up' : 'Login'} | HealthyThako</title>
        <meta name="description" content={`${isSignupPage ? 'Create your account' : 'Login to your account'} on HealthyThako`} />
      </Helmet>

      <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
        {/* Aurora Background */}
        <AuroraBackground 
          colorStops={["#3c0747", "#c90e5c", "#3c0747"]}
          amplitude={1.2}
          blend={0.6}
          speed={0.8}
        />
        
        {/* Overlay for better readability */}
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Back to main site link */}
        <Link 
          to="/" 
          className="absolute top-6 left-6 z-20 flex items-center text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to HealthyThako
        </Link>

        <div className="w-full max-w-md relative z-10">
          {isPasswordRecovery ? (
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-[#3c0747] to-[#c90e5c] rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Dumbbell className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Reset Your Password</h1>
              <p className="text-white/80">Create a new password for your account</p>
            </div>
          ) : (
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-[#3c0747] to-[#c90e5c] rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Dumbbell className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                {isSignupPage ? 'Create Your Account' : 'Welcome Back'}
              </h1>
              <p className="text-white/80">
                {isSignupPage 
                  ? 'Join thousands finding their perfect fitness trainer' 
                  : 'Sign in to continue your fitness journey'
                }
              </p>
            </div>
          )}

          {isPasswordRecovery ? (
            <UpdatePasswordForm
              onUpdatePassword={updatePassword}
              onSuccess={handlePasswordUpdateSuccess}
              title="Set New Password"
            />
          ) : (
            <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-2xl">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {isSignupPage ? 'Get Started' : 'Sign In'}
                </CardTitle>
              </CardHeader>
              <CardContent>
              <Tabs defaultValue={isSignupPage ? "signup" : "login"} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        required
                        disabled={isSubmitting}
                        className="h-11"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                        <button
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                          className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        required
                        disabled={isSubmitting}
                        className="h-11"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-11 bg-gradient-to-r from-[#3c0747] to-[#c90e5c] hover:from-[#2a0533] hover:to-[#a50c4e] text-white font-medium"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        'Login'
                      )}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name" className="text-sm font-medium">Full Name</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        value={signupForm.name}
                        onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                        required
                        disabled={isSubmitting}
                        className="h-11"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-sm font-medium">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={signupForm.email}
                        onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                        required
                        disabled={isSubmitting}
                        className="h-11"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">I am a:</Label>
                      <RadioGroup
                        value={signupForm.role}
                        onValueChange={(value: 'client' | 'trainer') => 
                          setSignupForm({ ...signupForm, role: value })
                        }
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="client" id="client" />
                          <Label htmlFor="client">Client (Looking for trainers)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="trainer" id="trainer" />
                          <Label htmlFor="trainer">Trainer (Offering services)</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-sm font-medium">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={signupForm.password}
                        onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                        required
                        disabled={isSubmitting}
                        className="h-11"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password" className="text-sm font-medium">Confirm Password</Label>
                      <Input
                        id="signup-confirm-password"
                        type="password"
                        value={signupForm.confirmPassword}
                        onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                        required
                        disabled={isSubmitting}
                        className="h-11"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-11 bg-gradient-to-r from-[#3c0747] to-[#c90e5c] hover:from-[#2a0533] hover:to-[#a50c4e] text-white font-medium"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-3">Are you a gym owner?</p>
                  <Link to="/auth/gym">
                    <Button variant="outline" className="w-full border-orange-200 text-orange-600 hover:bg-orange-50">
                      <Building className="h-4 w-4 mr-2" />
                      Login as Gym Owner
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
          )}
        </div>
      </div>

      <ForgotPasswordModal
        open={showForgotPassword}
        onOpenChange={setShowForgotPassword}
        onResetPassword={resetPassword}
        title="Reset Password"
        description="Enter your email address and we'll send you a link to reset your password."
      />
    </>
  );
};

export default Auth;
