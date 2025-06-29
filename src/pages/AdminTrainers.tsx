import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAdminTrainers, useVerifyTrainer, useRejectTrainer, useSuspendTrainer } from '@/hooks/useAdminTrainers';
import { useToast } from '@/hooks/use-toast';
import { Search, UserCheck, Shield, Clock, Loader2, UserX, User, Star, DollarSign, Plus, Eye, Filter, MapPin, Phone, Mail, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AddTrainerWizard from '@/components/AddTrainerWizard';
import TrainerVerificationModal from '@/components/TrainerVerificationModal';
import AdminBreadcrumb from '@/components/AdminBreadcrumb';

const AdminTrainers = () => {
  const [filters, setFilters] = useState({ search: '', verification_status: 'all' });
  const [showAddWizard, setShowAddWizard] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<any>(null);
  const { data: trainers, isLoading, error, refetch } = useAdminTrainers({ search: filters.search, verification_status: filters.verification_status !== 'all' ? filters.verification_status as any : undefined });
  const verifyTrainer = useVerifyTrainer();
  const rejectTrainer = useRejectTrainer();
  const suspendTrainer = useSuspendTrainer();
  const { toast } = useToast();

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('trainer-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trainer_profiles',
        },
        (payload) => {
          console.log('Trainer profile change:', payload);
          refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: 'role=eq.trainer',
        },
        (payload) => {
          console.log('Profile change:', payload);
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  // Trainers are already filtered by the hook based on verification status
  const filteredTrainers = trainers;

  const handleVerifyTrainer = async (userId: string, notes: string = '') => {
    try {
      await verifyTrainer.mutateAsync({ trainerId: userId, notes });
      toast({
        title: 'Success',
        description: 'Trainer has been verified successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to verify trainer',
        variant: 'destructive',
      });
    }
  };

  const handleRejectTrainer = async (userId: string, notes: string = '') => {
    try {
      await rejectTrainer.mutateAsync({ trainerId: userId, notes });
      toast({
        title: 'Success',
        description: 'Trainer has been rejected',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject trainer',
        variant: 'destructive',
      });
    }
  };

  const handleSuspendTrainer = async (userId: string) => {
    if (window.confirm('Are you sure you want to suspend this trainer?')) {
      try {
        await suspendTrainer.mutateAsync(userId);
        toast({
          title: 'Success',
          description: 'Trainer has been suspended successfully',
        });
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to suspend trainer',
          variant: 'destructive',
        });
      }
    }
  };

  const handleViewTrainer = (trainer: any) => {
    setSelectedTrainer(trainer);
    setShowVerificationModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6 sm:p-8">
        <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-purple-600" />
        <span className="ml-2 text-sm sm:text-base text-gray-600">Loading trainers...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 sm:p-8 text-center text-red-600">
        <p className="text-sm sm:text-base">Error loading trainers: {error.message}</p>
        <Button onClick={() => refetch()} className="mt-4" size="sm">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Breadcrumb Navigation */}
      <AdminBreadcrumb 
        items={[
          { label: 'Trainer Management', current: true }
        ]}
        showBackButton={false}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Trainer Management</h2>
          <p className="text-sm sm:text-base text-gray-600">Manage trainer verifications and profiles</p>
        </div>
        <Button 
          onClick={() => setShowAddWizard(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Trainer
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search trainers by name or email..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10 h-9 text-sm"
                />
              </div>
            </div>
            <Select
              value={filters.verification_status}
              onValueChange={(value) => setFilters({ ...filters, verification_status: value })}
            >
              <SelectTrigger className="w-full sm:w-48 h-9">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Verification Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Trainers</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="pending">Pending Verification</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Total</p>
                <p className="text-lg font-bold">{filteredTrainers?.length || 0}</p>
              </div>
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Verified</p>
                <p className="text-lg font-bold text-green-600">
                  {filteredTrainers?.filter((t: any) => t.trainer_profiles?.[0]?.is_verified).length || 0}
                </p>
              </div>
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Pending</p>
                <p className="text-lg font-bold text-orange-600">
                  {filteredTrainers?.filter((t: any) => !t.trainer_profiles?.[0]?.is_verified).length || 0}
                </p>
              </div>
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Suspended</p>
                <p className="text-lg font-bold text-red-600">
                  {filteredTrainers?.filter((t: any) => !t.is_active).length || 0}
                </p>
              </div>
              <UserX className="h-6 w-6 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trainers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredTrainers?.map((trainer: any) => (
          <Card key={trainer.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={trainer.trainer_profiles?.[0]?.profile_image} />
                  <AvatarFallback className="bg-purple-100 text-purple-600 text-sm">
                    {trainer.name?.charAt(0)?.toUpperCase() || 'T'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate text-sm">{trainer.name || 'Unnamed Trainer'}</h3>
                  <p className="text-xs text-gray-500 truncate">{trainer.email}</p>
                  
                  <div className="flex items-center gap-1 mt-2">
                    <Badge
                      variant={trainer.trainer_profiles?.[0]?.is_verified ? 'default' : 'outline'}
                      className={`text-xs ${trainer.trainer_profiles?.[0]?.is_verified ? 'bg-green-100 text-green-800' : ''}`}
                    >
                      {trainer.trainer_profiles?.[0]?.is_verified ? 'Verified' : 'Pending'}
                    </Badge>
                    <Badge variant={trainer.is_active ? 'default' : 'destructive'} className="text-xs">
                      {trainer.is_active ? 'Active' : 'Suspended'}
                    </Badge>
                  </div>

                  {trainer.trainer_profiles?.[0] && (
                    <div className="mt-2 space-y-1">
                      {trainer.trainer_profiles[0].rate_per_hour && (
                        <div className="flex items-center text-xs text-gray-600">
                          <DollarSign className="h-3 w-3 mr-1" />
                          <span>৳{trainer.trainer_profiles[0].rate_per_hour}/hour</span>
                        </div>
                      )}
                      {trainer.trainer_profiles[0].experience_years && (
                        <div className="text-xs text-gray-600">
                          {trainer.trainer_profiles[0].experience_years} years experience
                        </div>
                      )}
                      {trainer.location && (
                        <div className="flex items-center text-xs text-gray-600">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{trainer.location}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewTrainer(trainer)}
                      className="text-xs h-7 px-2"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    
                    {trainer.trainer_profiles?.[0] && !trainer.trainer_profiles[0].is_verified && (
                      <Button
                        size="sm"
                        onClick={() => handleVerifyTrainer(trainer.id)}
                        disabled={verifyTrainer.isPending}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs h-7 px-2"
                      >
                        {verifyTrainer.isPending ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <>
                            <UserCheck className="w-3 h-3 mr-1" />
                            Verify
                          </>
                        )}
                      </Button>
                    )}

                    {trainer.is_active ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSuspendTrainer(trainer.id)}
                        disabled={suspendTrainer.isPending}
                        className="text-red-600 hover:text-red-700 text-xs h-7 px-2"
                      >
                        <UserX className="w-3 h-3" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // Add activate functionality
                        }}
                        className="text-green-600 hover:text-green-700 text-xs h-7 px-2"
                      >
                        <UserCheck className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {(!filteredTrainers || filteredTrainers.length === 0) && (
          <div className="col-span-full text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No trainers found matching your criteria</p>
            <Button 
              onClick={() => setShowAddWizard(true)}
              className="mt-4"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Trainer
            </Button>
          </div>
        )}
      </div>

      {/* Add Trainer Wizard */}
      <AddTrainerWizard
        open={showAddWizard}
        onOpenChange={setShowAddWizard}
        onSuccess={() => refetch()}
      />

      {/* Trainer Verification Modal */}
      <TrainerVerificationModal
        trainer={selectedTrainer}
        open={showVerificationModal}
        onOpenChange={setShowVerificationModal}
        onVerify={handleVerifyTrainer}
        onReject={handleRejectTrainer}
      />
    </div>
  );
};

export default AdminTrainers;
