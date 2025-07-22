import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { ConversationProvider } from '@/contexts/ConversationContext';

// Import unified protection components
import { 
  ClientProtectedRoute, 
  TrainerProtectedRoute, 
  GymOwnerProtectedRoute, 
  AdminProtectedRoute 
} from '@/components/UnifiedProtectedRoute';
import UnifiedProtectedRoute from '@/components/UnifiedProtectedRoute';
import PaymentProtectedRoute from '@/components/PaymentProtectedRoute';
import ProfileProtectedRoute from '@/components/ProfileProtectedRoute';
import RoleBasedRedirect from '@/components/RoleBasedRedirect';
import ErrorBoundary from '@/components/ErrorBoundary';
import AuthErrorHandler from '@/components/AuthErrorHandler';

import BrandLoadingSpinner from '@/components/BrandLoadingSpinner';

// Lazy load pages for better performance
import { lazy, Suspense } from 'react';

// Lazy load all pages
const Index = lazy(() => import('@/pages/Index'));
const Auth = lazy(() => import('@/pages/Auth'));
const FindTrainers = lazy(() => import('@/pages/FindTrainers'));
const BrowseServices = lazy(() => import('@/pages/BrowseServices'));
const GigDetail = lazy(() => import('@/pages/GigDetail'));
const ServiceBooking = lazy(() => import('@/pages/ServiceBooking'));
const BookingFlow = lazy(() => import('@/pages/BookingFlow'));
const GymMembership = lazy(() => import('@/pages/GymMembership'));
const PublicTrainerProfile = lazy(() => import('@/pages/PublicTrainerProfile'));
const PublicGymProfile = lazy(() => import('@/pages/PublicGymProfile'));
const PaymentSuccess = lazy(() => import('@/pages/PaymentSuccess'));
const PaymentCancelled = lazy(() => import('@/pages/PaymentCancelled'));
const PaymentRedirectHandler = lazy(() => import('@/pages/PaymentRedirectHandler'));
const About = lazy(() => import('@/pages/About'));
const Contact = lazy(() => import('@/pages/Contact'));
const Help = lazy(() => import('@/pages/Help'));
const Terms = lazy(() => import('@/pages/Terms'));
const Privacy = lazy(() => import('@/pages/Privacy'));
const MVPStatus = lazy(() => import('@/pages/MVPStatus'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const Onboarding = lazy(() => import('@/pages/Onboarding'));

// Debug components are now minimal and only render in development

const Support = lazy(() => import('@/pages/Support'));
const RefundPolicy = lazy(() => import('@/pages/RefundPolicy'));
const JoinGym = lazy(() => import('@/pages/JoinGym'));
const JoinTrainer = lazy(() => import('@/pages/JoinTrainer'));
const GymPass = lazy(() => import('@/pages/GymPass'));

// Add new lazy loaded pages
const Blog = lazy(() => import('@/pages/Blog'));
const BlogPost = lazy(() => import('@/pages/BlogPost'));


// Removed test components

// Dashboard pages
const TrainerDashboard = lazy(() => import('@/pages/TrainerDashboard'));
const ClientDashboard = lazy(() => import('@/pages/ClientDashboard'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const AdminLogin = lazy(() => import('@/pages/AdminLogin'));
const GymOwnerDashboard = lazy(() => import('@/pages/GymOwnerDashboard'));
const GymAuth = lazy(() => import('@/pages/GymAuth'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false, // Prevent unnecessary refetches
    },
  },
});

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <BrandLoadingSpinner size="lg" showText={false} />
    </div>
  }>
    {children}
  </Suspense>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <ConversationProvider>
            <AuthErrorHandler>
              <ErrorBoundary>
                <div className="min-h-screen bg-background">
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<PageWrapper><Index /></PageWrapper>} />
                    <Route path="/auth" element={
                      <UnifiedProtectedRoute requireAuth={false}>
                        <PageWrapper><Auth /></PageWrapper>
                      </UnifiedProtectedRoute>
                    } />
                    <Route path="/auth/gym" element={
                      <UnifiedProtectedRoute requireAuth={false}>
                        <PageWrapper><GymAuth /></PageWrapper>
                      </UnifiedProtectedRoute>
                    } />
                    <Route path="/find-trainers" element={<PageWrapper><FindTrainers /></PageWrapper>} />
                    <Route path="/browse-services" element={<PageWrapper><BrowseServices /></PageWrapper>} />
                    <Route path="/gig/:gigId" element={<PageWrapper><GigDetail /></PageWrapper>} />
                    <Route path="/service-booking" element={
                      <ClientProtectedRoute>
                        <PageWrapper><ServiceBooking /></PageWrapper>
                      </ClientProtectedRoute>
                    } />
                    <Route path="/gym-membership" element={<PageWrapper><GymMembership /></PageWrapper>} />
      
                    
                    {/* Blog routes */}
                    <Route path="/blog" element={<PageWrapper><Blog /></PageWrapper>} />
                    <Route path="/blog/:slug" element={<PageWrapper><BlogPost /></PageWrapper>} />
                    
                    {/* Public profile routes */}
                    <Route path="/trainer/:trainerId" element={
                      <PageWrapper><PublicTrainerProfile /></PageWrapper>
                    } />
                    <Route path="/gym/:gymId" element={
                      <PageWrapper><PublicGymProfile /></PageWrapper>
                    } />
                    
                    {/* Protected booking flow */}
                    <Route path="/booking-flow" element={
                      <UnifiedProtectedRoute requireAuth={true}>
                        <PageWrapper><BookingFlow /></PageWrapper>
                      </UnifiedProtectedRoute>
                    } />
                    
                    {/* Payment redirect handler - No protection needed */}
                    <Route path="/payment-redirect" element={<PageWrapper><PaymentRedirectHandler /></PageWrapper>} />

                    {/* Protected payment routes */}
                    <Route path="/payment-success" element={
                      <PaymentProtectedRoute type="success">
                        <PageWrapper><PaymentSuccess /></PageWrapper>
                      </PaymentProtectedRoute>
                    } />
                    <Route path="/payment-cancelled" element={
                      <PaymentProtectedRoute type="cancelled">
                        <PageWrapper><PaymentCancelled /></PageWrapper>
                      </PaymentProtectedRoute>
                    } />
                    
                    {/* Other public routes */}
                    <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
                    <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
                    <Route path="/help" element={<PageWrapper><Help /></PageWrapper>} />
                    <Route path="/support" element={<PageWrapper><Support /></PageWrapper>} />
                    <Route path="/terms" element={<PageWrapper><Terms /></PageWrapper>} />
                    <Route path="/privacy" element={<PageWrapper><Privacy /></PageWrapper>} />
                    <Route path="/refund-policy" element={<PageWrapper><RefundPolicy /></PageWrapper>} />
                    <Route path="/mvp-status" element={<PageWrapper><MVPStatus /></PageWrapper>} />
                    <Route path="/join-gym" element={<PageWrapper><JoinGym /></PageWrapper>} />
                    <Route path="/join-trainer" element={<PageWrapper><JoinTrainer /></PageWrapper>} />
                    <Route path="/gympass" element={<PageWrapper><GymPass /></PageWrapper>} />



                    {/* Onboarding route - requires authentication */}
                    <Route path="/onboarding" element={
                      <UnifiedProtectedRoute requireAuth={true}>
                        <PageWrapper><Onboarding /></PageWrapper>
                      </UnifiedProtectedRoute>
                    } />

                    {/* Role-based dashboard redirect - requires authentication */}
                    <Route path="/dashboard" element={
                      <UnifiedProtectedRoute requireAuth={true}>
                        <RoleBasedRedirect />
                      </UnifiedProtectedRoute>
                    } />

                    {/* PROTECTED ROUTES - Now properly secured */}
                    
                    {/* Trainer Dashboard Routes - Only accessible by trainers */}
                    <Route path="/trainer-dashboard/*" element={
                      <TrainerProtectedRoute>
                        <PageWrapper><TrainerDashboard /></PageWrapper>
                      </TrainerProtectedRoute>
                    } />

                    {/* Client Dashboard Routes - Only accessible by clients */}
                    <Route path="/client-dashboard/*" element={
                      <ClientProtectedRoute>
                        <PageWrapper><ClientDashboard /></PageWrapper>
                      </ClientProtectedRoute>
                    } />

                    {/* Gym Owner Dashboard Routes - Only accessible by gym owners */}
                    <Route path="/gym-dashboard/*" element={
                      <GymOwnerProtectedRoute>
                        <PageWrapper><GymOwnerDashboard /></PageWrapper>
                      </GymOwnerProtectedRoute>
                    } />

                    {/* Admin routes - Unified authentication system */}
                    <Route path="/admin/login" element={
                      <UnifiedProtectedRoute requireAuth={false}>
                        <PageWrapper><AdminLogin /></PageWrapper>
                      </UnifiedProtectedRoute>
                    } />
                    <Route path="/admin/*" element={
                      <AdminProtectedRoute>
                        <PageWrapper><AdminDashboard /></PageWrapper>
                      </AdminProtectedRoute>
                    } />

                    {/* Debug/Test routes - Removed for production readiness */}

                    {/* 404 route */}
                    <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
                  </Routes>
                </div>
                <Toaster />

              </ErrorBoundary>
            </AuthErrorHandler>
            </ConversationProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
