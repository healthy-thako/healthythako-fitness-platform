import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Menu,
  Building2, 
  Users, 
  BarChart3, 
  Settings, 
  Plus,
  Edit,
  Save,
  Eye,
  Star,
  DollarSign,
  Loader2,
  AlertCircle,
  Home,
  CreditCard,
  Calendar,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronRight as ChevronRightIcon,
  MessageSquare,
  Activity
} from 'lucide-react';
import CreateGymWizard from '@/components/CreateGymWizard';
import CreateGymModal from '@/components/CreateGymModal';
import EditGymModal from '@/components/EditGymModal';

interface Gym {
  id: string;
  name: string;
  description?: string;
  address: string;
  area: string;
  city: string;
  phone: string;
  email: string;
  website?: string;
  logo_url?: string;
  image_url?: string;
  gym_owner_id: string;
  rating: number;
  review_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  gym_owner?: {
    name: string;
    email: string;
  };
}

interface GymOwner {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  business_name?: string;
  is_active: boolean;
  is_verified: boolean;
  onboarding_completed: boolean;
  status: string;
}

interface OverviewTabProps {
  gym: Gym | null;
  members: any[];
  gymOwner: GymOwner | null;
  onCreateGym: () => void;
  setActiveTab: (tab: string) => void;
}

interface SidebarContentProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

interface GymTabProps {
  gym: Gym | null;
  gymOwner: GymOwner | null;
  onUpdate: () => void;
  onCreateGym: () => void;
  setActiveTab: (tab: string) => void;
}

interface BreadcrumbProps {
  activeTab: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ activeTab }) => {
  const items = [
    { label: 'Home', href: '/' },
    { label: 'Dashboard', href: '/gym-owner/dashboard' },
    { 
      label: activeTab.charAt(0).toUpperCase() + activeTab.slice(1), 
      href: `/gym-owner/dashboard/${activeTab}` 
    }
  ];

  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-500">
      {items.map((item, index) => (
        <React.Fragment key={item.href}>
          {index > 0 && <ChevronRight className="h-4 w-4" />}
          {index === items.length - 1 ? (
            <span className="font-medium text-gray-900">{item.label}</span>
          ) : (
            <Link
              to={item.href}
              className="hover:text-gray-700 hover:underline"
            >
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

const GymOwnerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gymOwner, setGymOwner] = useState<GymOwner | null>(null);
  const [gym, setGym] = useState<Gym | null>(null);
  const [members, setMembers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showCreateGym, setShowCreateGym] = useState(false);
  const [showEditGym, setShowEditGym] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // In new schema, gym ownership is direct through owner_id
      // Fetch gym data directly
      const { data: gymData, error: gymError } = await supabase
        .from('gyms')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (!gymError && gymData) {
        setGym(gymData);
        // Set gym owner data from user info
        setGymOwner({ id: user.id, user_id: user.id });

        // Fetch members data (check if user_memberships table exists)
        const { data: membersData, error: membersError } = await supabase
          .from('user_memberships')
          .select(`
            *,
            users!user_memberships_user_id_fkey(full_name, email, phone_number)
          `)
          .eq('gym_id', gymData.id);

        if (!membersError) {
          setMembers(membersData || []);
        }
      } else {
        // No gym found for this user
        setGym(null);
        setGymOwner(null);
        setMembers([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGym = () => {
    setShowCreateGym(true);
  };

  const handleEditGym = () => {
    setShowEditGym(true);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab 
            gym={gym} 
            members={members} 
            gymOwner={gymOwner} 
            onCreateGym={handleCreateGym}
            setActiveTab={setActiveTab}
          />
        );
      case 'gym':
        return (
          <GymTab 
            gym={gym} 
            gymOwner={gymOwner} 
            onUpdate={handleEditGym} 
            onCreateGym={handleCreateGym}
            setActiveTab={setActiveTab}
          />
        );
      case 'members':
        return <MembersTab members={members} gym={gym} />;
      case 'analytics':
        return <AnalyticsTab gym={gym} />;
      case 'payments':
        return <PaymentsTab gym={gym} />;
      case 'schedule':
        return <ScheduleTab gym={gym} />;
      case 'notifications':
        return <NotificationsTab />;
      case 'settings':
        return <SettingsTab gymOwner={gymOwner} onUpdate={fetchData} />;
      default:
        return null;
    }
  };

  const SidebarContent: React.FC<SidebarContentProps> = ({ collapsed, onToggleCollapse, activeTab, setActiveTab }) => {
    const navigate = useNavigate();
    const { signOut } = useAuth();

    const sidebarItems = [
      { id: 'overview', label: 'Overview', icon: Home },
      { id: 'gym', label: 'My Gym', icon: Building2 },
      { id: 'members', label: 'Members', icon: Users },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      { id: 'payments', label: 'Payments', icon: DollarSign },
      { id: 'schedule', label: 'Schedule', icon: Calendar },
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'settings', label: 'Settings', icon: Settings }
    ];

    return (
      <div className="flex flex-col h-full bg-white">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <Link to="/" className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-2'}`}>
            <img src="/logo.png" alt="Logo" className="h-8 w-8" />
            {!collapsed && <span className="font-bold text-xl">ThakoFit</span>}
          </Link>
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="hidden lg:flex"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          {sidebarItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className={`w-full justify-start mb-1 ${collapsed ? 'px-2' : 'px-4'}`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon className={`h-5 w-5 ${collapsed ? 'mr-0' : 'mr-2'}`} />
              {!collapsed && <span>{item.label}</span>}
            </Button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <Button
            variant="ghost"
            className={`w-full justify-start ${collapsed ? 'px-2' : 'px-4'}`}
            onClick={async () => {
              await signOut();
              navigate('/auth/gym');
            }}
          >
            <LogOut className={`h-5 w-5 ${collapsed ? 'mr-0' : 'mr-2'}`} />
            {!collapsed && <span>Sign Out</span>}
          </Button>
        </div>
      </div>
    );
  };

  if (!user) {
    return <Navigate to="/auth/gym" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b">
        <div className="flex items-center justify-between px-4 py-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <SidebarContent
                activeTab={activeTab}
                setActiveTab={(tab) => {
                  setActiveTab(tab);
                  // Close sheet on mobile when tab changes
                  const sheet = document.querySelector('[data-state="open"]');
                  if (sheet) {
                    const event = new Event('keydown');
                    Object.defineProperty(event, 'keyCode', { value: 27 });
                    Object.defineProperty(event, 'which', { value: 27 });
                    document.dispatchEvent(event);
                  }
                }}
              />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="h-8" />
            <span className="font-semibold">Thako Fit</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <Home className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-56px)] lg:h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 bg-white border-r">
          <SidebarContent
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-6">
            {/* Breadcrumb & Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <Breadcrumb activeTab={activeTab} />
              <div className="flex items-center gap-2">
                {!gym && (
                  <Button onClick={handleCreateGym} className="bg-[#8b1538] hover:bg-[#6b1029]">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Gym
                  </Button>
                )}
                <Button variant="outline" onClick={() => navigate('/')}>
                  <Home className="h-4 w-4 mr-2" />
                  Main Site
                </Button>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                {error}
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="flex items-center justify-center h-[60vh]">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-[#8b1538]" />
                  <p className="text-gray-500">Loading dashboard...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {renderContent()}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <CreateGymWizard
        open={showCreateGym}
        onOpenChange={setShowCreateGym}
        onSubmit={async (gymData, amenities, membershipPlans, userData) => {
          try {
            // ... existing submit logic ...
          } catch (error) {
            console.error('Error creating gym:', error);
            toast.error('Failed to create gym. Please try again.');
          }
        }}
        isLoading={loading}
      />

      {gym && (
        <EditGymModal
          open={showEditGym}
          onOpenChange={setShowEditGym}
          gym={gym}
          onSubmit={async (gymData) => {
            try {
              // ... existing submit logic ...
            } catch (error) {
              console.error('Error updating gym:', error);
              toast.error('Failed to update gym. Please try again.');
            }
          }}
          isLoading={loading}
        />
      )}
    </div>
  );
};

const OverviewTab: React.FC<OverviewTabProps> = ({ gym, members, gymOwner, onCreateGym, setActiveTab }) => (
  <div className="space-y-6">
    {!gym ? (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">No Gym Found</h2>
        <p className="text-gray-500 mb-6">Get started by creating your gym profile</p>
        <Button onClick={onCreateGym} className="bg-[#8b1538] hover:bg-[#6b1029]">
          <Plus className="h-4 w-4 mr-2" />
          Add New Gym
        </Button>
      </div>
    ) : (
      <>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-[#8b1538] mr-2" />
                <span className="text-2xl font-bold">{members.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-500 mr-2" />
                <span className="text-2xl font-bold">{gym.rating.toFixed(1)}</span>
                <span className="text-sm text-gray-500 ml-2">({gym.review_count} reviews)</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={gym.is_active ? "default" : "secondary"}>
                {gym.is_active ? "Active" : "Inactive"}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Last Updated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">
                {new Date(gym.updated_at).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => setActiveTab('members')}>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Users className="h-5 w-5 mr-2" />
                Manage Members
              </CardTitle>
              <CardDescription>View and manage gym memberships</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => setActiveTab('payments')}>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <CreditCard className="h-5 w-5 mr-2" />
                Payments
              </CardTitle>
              <CardDescription>Track payments and subscriptions</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => setActiveTab('schedule')}>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Calendar className="h-5 w-5 mr-2" />
                Schedule
              </CardTitle>
              <CardDescription>Manage classes and appointments</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Gym Profile Preview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Gym Profile</CardTitle>
              <CardDescription>Your gym's public profile information</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => window.open(`/gym/${gym.id}`, '_blank')}>
                <Eye className="h-4 w-4 mr-2" />
                View Public Profile
              </Button>
              <Button variant="outline" onClick={() => setActiveTab('gym')}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Name</h4>
                  <p className="text-lg">{gym.name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Location</h4>
                  <p>{gym.area}, {gym.city}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Contact</h4>
                  <p>{gym.phone}</p>
                  <p className="text-sm text-gray-500">{gym.email}</p>
                </div>
              </div>
              <div className="space-y-4">
                {gym.image_url && (
                  <img
                    src={gym.image_url}
                    alt={gym.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}
                {gym.logo_url && (
                  <img
                    src={gym.logo_url}
                    alt={`${gym.name} logo`}
                    className="h-12 object-contain"
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </>
    )}
  </div>
);

const GymTab: React.FC<GymTabProps> = ({ gym, gymOwner, onUpdate, onCreateGym, setActiveTab }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {gym ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>My Gym</CardTitle>
              <CardDescription>Manage your gym's information and settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">{gym.name}</h3>
                    <p className="text-sm text-gray-500">{gym.address}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" onClick={() => window.open(`/gym/${gym.id}`, '_blank')}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Public Profile
                    </Button>
                    <Button onClick={onUpdate}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Details
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Contact Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-500">Phone:</span> {gym.phone || 'Not provided'}</p>
                      <p><span className="text-gray-500">Email:</span> {gym.email || 'Not provided'}</p>
                      <p><span className="text-gray-500">Website:</span> {gym.website || 'Not provided'}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Status</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant={gym.is_active ? "default" : "destructive"} className={gym.is_active ? "bg-green-100 text-green-800" : ""}>
                          {gym.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Membership Plans</CardTitle>
                <CardDescription>Manage your gym's membership plans</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => setActiveTab('memberships')}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Manage Plans
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Operating Hours</CardTitle>
                <CardDescription>Set your gym's working hours</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => setActiveTab('schedule')}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Manage Schedule
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Analytics</CardTitle>
                <CardDescription>View detailed gym statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => setActiveTab('analytics')}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Create Your Gym</CardTitle>
            <CardDescription>Get started by setting up your gym profile</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              You haven't set up your gym yet. Create your gym profile to start managing your business and attracting new members.
            </p>
            <Button onClick={onCreateGym}>
              <Plus className="h-4 w-4 mr-2" />
              Create My Gym
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const MembersTab = ({ members, gym }: { members: any[]; gym: Gym | null }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Members ({members.length})</CardTitle>
        <CardDescription>Manage your gym members</CardDescription>
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <p className="text-gray-600">No members yet. Share your gym profile to attract members!</p>
        ) : (
          <div className="space-y-4">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{member.profiles.name}</h4>
                  <p className="text-sm text-gray-600">{member.profiles.email}</p>
                </div>
                <Badge>{member.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  </div>
);

const AnalyticsTab = ({ gym }: { gym: Gym | null }) => (
  <Card>
    <CardHeader>
      <CardTitle>Analytics</CardTitle>
      <CardDescription>View your gym's performance metrics</CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-gray-600">Analytics features coming soon...</p>
    </CardContent>
  </Card>
);

const PaymentsTab = ({ gym }: { gym: Gym | null }) => (
  <Card>
    <CardHeader>
      <CardTitle>Payments</CardTitle>
      <CardDescription>Manage payments and transactions</CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-gray-600">Payment management features coming soon...</p>
    </CardContent>
  </Card>
);

const ScheduleTab = ({ gym }: { gym: Gym | null }) => (
  <Card>
    <CardHeader>
      <CardTitle>Schedule</CardTitle>
      <CardDescription>Manage your gym schedule and classes</CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-gray-600">Schedule management features coming soon...</p>
    </CardContent>
  </Card>
);

const NotificationsTab = () => (
  <Card>
    <CardHeader>
      <CardTitle>Notifications</CardTitle>
      <CardDescription>Stay updated with important notifications</CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-gray-600">No notifications at the moment.</p>
    </CardContent>
  </Card>
);

const SettingsTab = ({ gymOwner, onUpdate }: { gymOwner: GymOwner | null; onUpdate: () => void }) => (
  <Card>
    <CardHeader>
      <CardTitle>Account Settings</CardTitle>
      <CardDescription>Manage your account preferences</CardDescription>
    </CardHeader>
    <CardContent>
      {gymOwner && (
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Profile Information</h4>
            <div className="space-y-1 text-sm">
              <p><strong>Name:</strong> {gymOwner.name}</p>
              <p><strong>Email:</strong> {gymOwner.email}</p>
              <p><strong>Phone:</strong> {gymOwner.phone || 'Not provided'}</p>
              <p><strong>Business:</strong> {gymOwner.business_name || 'Not provided'}</p>
            </div>
          </div>
          
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      )}
    </CardContent>
  </Card>
);

export default GymOwnerDashboard; 