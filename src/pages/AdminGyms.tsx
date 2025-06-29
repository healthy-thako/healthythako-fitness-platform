import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAdminGyms, useUpdateGymStatus, useDeleteGym, useVerifyGym, useRejectGym, useCreateGym } from '@/hooks/useAdminGyms';
import { useCreateUser } from '@/hooks/useAdminUsers';
import { useToast } from '@/hooks/use-toast';
import CreateGymWizard from '@/components/CreateGymWizard';
import EditGymModal from '@/components/EditGymModal';
import GymVerificationModal from '@/components/GymVerificationModal';
import { 
  Search, 
  Dumbbell, 
  MapPin, 
  Star, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Phone, 
  Mail, 
  Eye, 
  Plus,
  Edit,
  Users,
  TrendingUp,
  Building,
  Filter,
  Shield
} from 'lucide-react';
import { useCreateGymAmenities } from '@/hooks/useGymAmenities';
import { useCreateGymMembershipPlan } from '@/hooks/useGymMembershipPlans';
import { useAuth } from '@/contexts/AuthContext';

const AdminGyms = () => {
  const [filters, setFilters] = useState({ 
    status: 'all', 
    search: '', 
    city: 'all',
    verification_status: 'all' 
  });
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [editingGym, setEditingGym] = useState<any>(null);
  const [selectedGym, setSelectedGym] = useState<any>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  
  const { data: gyms, isLoading, error } = useAdminGyms({
    status: filters.status === 'all' ? undefined : filters.status,
    search: filters.search,
    city: filters.city === 'all' ? undefined : filters.city,
    verification_status: filters.verification_status === 'all' ? undefined : filters.verification_status as any
  });
  
  const { profile } = useAuth();
  
  const createGym = useCreateGym();
  const createUser = useCreateUser();
  const createGymAmenities = useCreateGymAmenities();
  const createGymMembershipPlan = useCreateGymMembershipPlan();
  const updateStatus = useUpdateGymStatus();
  const deleteGym = useDeleteGym();
  const verifyGym = useVerifyGym();
  const rejectGym = useRejectGym();
  const { toast } = useToast();

  const handleCreateGym = async (gymData: any, amenities: string[] = [], membershipPlans: any[] = [], userData?: any) => {
    try {
      // Create user account first if provided
      let createdUser = null;
      if (userData) {
        createdUser = await createUser.mutateAsync(userData);
        
        // Update gym data with the created user's ID
        gymData.gym_owner_id = createdUser.id;
      }
      
      const createdGym = await createGym.mutateAsync(gymData);
      
      // Create amenities if provided
      if (amenities.length > 0) {
        await createGymAmenities.mutateAsync({
          gymId: createdGym.id,
          amenities: amenities
        });
      }
      
      // Create membership plans if provided
      if (membershipPlans.length > 0) {
        for (const plan of membershipPlans) {
          await createGymMembershipPlan.mutateAsync({
            ...plan,
            gym_id: createdGym.id
          });
        }
      }
      
      setShowCreateWizard(false);
      toast({
        title: 'Success',
        description: userData 
          ? 'Gym, user account, amenities, and membership plans have been created successfully'
          : 'Gym, amenities, and membership plans have been created successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create gym',
        variant: 'destructive',
      });
    }
  };

  const handleVerifyGym = async (gymId: string, notes: string) => {
    try {
      await verifyGym.mutateAsync({ gymId, notes });
      setShowVerificationModal(false);
      setSelectedGym(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to verify gym',
        variant: 'destructive',
      });
    }
  };

  const handleRejectGym = async (gymId: string, notes: string) => {
    try {
      await rejectGym.mutateAsync({ gymId, notes });
      setShowVerificationModal(false);
      setSelectedGym(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject gym',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteGym = async (gymId: string) => {
    if (window.confirm('Are you sure you want to delete this gym? This action cannot be undone.')) {
      try {
        await deleteGym.mutateAsync(gymId);
        toast({
          title: 'Success',
          description: 'Gym has been deleted successfully',
        });
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to delete gym',
          variant: 'destructive',
        });
      }
    }
  };

  const handleEditGym = async (gymData: any) => {
    try {
      await updateStatus.mutateAsync({ 
        gymId: editingGym.id, 
        updates: gymData
      });
      setEditingGym(null);
      toast({
        title: 'Success',
        description: 'Gym has been updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update gym',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading gyms...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>Error loading gyms: {error.message}</p>
        <p className="text-sm text-gray-500 mt-2">Please check the console for more details.</p>
      </div>
    );
  }

  const totalGyms = gyms?.length || 0;
  const verifiedGyms = gyms?.filter((g: any) => g.verification_status === 'verified').length || 0;
  const activeGyms = gyms?.filter((g: any) => g.is_active).length || 0;
  const pendingGyms = gyms?.filter((g: any) => g.verification_status === 'pending').length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gym Management</h2>
          <p className="text-sm text-gray-600">Manage gym listings, verifications, and memberships</p>
        </div>
        <Button 
          onClick={() => setShowCreateWizard(true)}
          className="bg-[#8b1538] hover:bg-[#6b1029] shrink-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Gym
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Gyms</p>
                <p className="text-2xl font-bold text-gray-900">{totalGyms}</p>
              </div>
              <Building className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-green-600">{verifiedGyms}</p>
              </div>
              <Shield className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-blue-600">{activeGyms}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{pendingGyms}</p>
              </div>
              <Users className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search gyms by name, area, or description..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Gyms</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.verification_status}
              onValueChange={(value) => setFilters({ ...filters, verification_status: value })}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by verification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Gyms List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Gyms ({totalGyms})</span>
            <div className="text-sm text-gray-500">
              Showing {gyms?.length || 0} results
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-200">
            {gyms?.map((gym: any) => (
              <div key={gym.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start space-x-4 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                      <Dumbbell className="h-6 w-6 text-orange-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-base text-gray-900 truncate">{gym.name}</h3>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1 shrink-0" />
                          <span className="truncate">{gym.area}, {gym.city}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <Star className="h-3 w-3 mr-1 shrink-0" />
                          <span>{Number(gym.rating || 0).toFixed(1)} ({gym.review_count || 0} reviews)</span>
                        </div>
                        
                        {gym.phone && (
                          <div className="flex items-center">
                            <Phone className="h-3 w-3 mr-1 shrink-0" />
                            <span className="truncate">{gym.phone}</span>
                          </div>
                        )}
                        
                        {gym.email && (
                          <div className="flex items-center">
                            <Mail className="h-3 w-3 mr-1 shrink-0" />
                            <span className="truncate">{gym.email}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge
                          variant={
                            gym.verification_status === 'verified' ? 'default' :
                            gym.verification_status === 'rejected' ? 'destructive' :
                            'outline'
                          }
                          className={
                            gym.verification_status === 'verified' ? 'bg-green-100 text-green-800 border-green-200' :
                            gym.verification_status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' :
                            'border-gray-300'
                          }
                        >
                          {gym.verification_status === 'verified' ? (
                            <>
                              <Shield className="w-3 h-3 mr-1" />
                              Verified
                            </>
                          ) : gym.verification_status === 'rejected' ? (
                            <>
                              <XCircle className="w-3 h-3 mr-1" />
                              Rejected
                            </>
                          ) : (
                            'Pending Verification'
                          )}
                        </Badge>
                        
                        <Badge variant={gym.is_active ? 'default' : 'destructive'}>
                          {gym.is_active ? 'Active' : 'Suspended'}
                        </Badge>
                      </div>
                      
                      {gym.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{gym.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {gym.verification_status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedGym(gym);
                          setShowVerificationModal(true);
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Shield className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditingGym(gym)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteGym(gym.id)}
                      disabled={deleteGym.isPending}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {(!gyms || gyms.length === 0) && (
              <div className="text-center py-12 text-gray-500">
                <Dumbbell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No gyms found</h3>
                <p className="text-gray-500">No gyms match your current filters.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {showCreateWizard && (
        <CreateGymWizard 
          open={showCreateWizard} 
          onOpenChange={setShowCreateWizard}
          onSubmit={handleCreateGym}
        />
      )}

      {editingGym && (
        <EditGymModal
          open={!!editingGym}
          onOpenChange={(open) => !open && setEditingGym(null)}
          gym={editingGym}
          onSubmit={handleEditGym}
          isLoading={updateStatus.isPending}
        />
      )}

      {selectedGym && (
        <GymVerificationModal
          gym={selectedGym}
          open={showVerificationModal}
          onOpenChange={setShowVerificationModal}
          onVerify={handleVerifyGym}
          onReject={handleRejectGym}
          isLoading={verifyGym.isPending || rejectGym.isPending}
        />
      )}
    </div>
  );
};

export default AdminGyms;
