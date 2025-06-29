import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClientGymMemberships, useCancelGymMembership } from '@/hooks/useGymMemberships';
import { usePauseMembership, useResumeMembership, useTransferMembership, useRenewMembership, useMembershipActions } from '@/hooks/useClientData';
import { MapPin, Calendar, CreditCard, Phone, Mail, Dumbbell, Users, CheckCircle, Clock, XCircle, AlertTriangle, Pause, Play, UserPlus, RefreshCw, MoreHorizontal } from 'lucide-react';
import { format, parseISO, differenceInDays, addMonths } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';

const ClientMemberships = () => {
  const { data: memberships, isLoading } = useClientGymMemberships();
  const cancelMembership = useCancelGymMembership();
  const pauseMembership = usePauseMembership();
  const resumeMembership = useResumeMembership();
  const transferMembership = useTransferMembership();
  const renewMembership = useRenewMembership();

  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedMembership, setSelectedMembership] = useState<any>(null);
  const [actionType, setActionType] = useState<'pause' | 'resume' | 'transfer' | 'renewal'>('pause');
  const [actionForm, setActionForm] = useState({
    reason: '',
    transferEmail: '',
    renewalMonths: 1
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'expired':
        return <Clock className="h-3 w-3 text-orange-500" />;
      case 'cancelled':
        return <XCircle className="h-3 w-3 text-red-500" />;
      case 'suspended':
        return <AlertTriangle className="h-3 w-3 text-yellow-500" />;
      case 'paused':
        return <Pause className="h-3 w-3 text-blue-500" />;
      default:
        return <Clock className="h-3 w-3 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-orange-100 text-orange-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800';
      case 'paused':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysRemaining = (endDate: string) => {
    const days = differenceInDays(parseISO(endDate), new Date());
    return days > 0 ? days : 0;
  };

  const handleCancelMembership = async (membershipId: string) => {
    await cancelMembership.mutateAsync(membershipId);
  };

  const openActionModal = (membership: any, action: 'pause' | 'resume' | 'transfer' | 'renewal') => {
    setSelectedMembership(membership);
    setActionType(action);
    setActionForm({ reason: '', transferEmail: '', renewalMonths: 1 });
    setShowActionModal(true);
  };

  const handleMembershipAction = async () => {
    if (!selectedMembership) return;

    try {
      switch (actionType) {
        case 'pause':
          await pauseMembership.mutateAsync({
            membershipId: selectedMembership.id,
            reason: actionForm.reason
          });
          break;
        case 'resume':
          await resumeMembership.mutateAsync({
            membershipId: selectedMembership.id,
            reason: actionForm.reason
          });
          break;
        case 'transfer':
          // In a real app, you'd need to find the user by email first
          await transferMembership.mutateAsync({
            membershipId: selectedMembership.id,
            transferToUserId: 'temp-user-id', // This would be resolved from email
            reason: actionForm.reason
          });
          break;
        case 'renewal':
          const newEndDate = addMonths(parseISO(selectedMembership.end_date), actionForm.renewalMonths);
          await renewMembership.mutateAsync({
            membershipId: selectedMembership.id,
            newEndDate: newEndDate.toISOString(),
            reason: actionForm.reason
          });
          break;
      }
      setShowActionModal(false);
    } catch (error) {
      console.error('Failed to perform membership action:', error);
    }
  };

  const getActionTitle = () => {
    switch (actionType) {
      case 'pause': return 'Pause Membership';
      case 'resume': return 'Resume Membership';
      case 'transfer': return 'Transfer Membership';
      case 'renewal': return 'Renew Membership';
      default: return 'Membership Action';
    }
  };

  if (isLoading) {
    return (
      <div className="p-3 sm:p-4">
        <div className="flex items-center justify-center py-8 sm:py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <SidebarTrigger />
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">My Gym Memberships</h1>
              <p className="text-xs sm:text-base text-gray-600">Manage your active gym memberships and access details</p>
            </div>
          </div>
          <Button 
            onClick={() => window.open('/gym-membership', '_blank')}
            className="mesh-gradient-overlay text-white text-xs sm:text-sm"
            size="sm"
          >
            <Dumbbell className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Find New Gyms</span>
            <span className="sm:hidden">Find Gyms</span>
          </Button>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        {!memberships || memberships.length === 0 ? (
          <Card className="text-center py-8 sm:py-12">
            <CardContent>
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Dumbbell className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No Gym Memberships</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-4 max-w-md mx-auto">
                You haven't purchased any gym memberships yet. Browse our verified gyms and find the perfect fit for your fitness journey.
              </p>
              <Button 
                onClick={() => window.open('/gym-membership', '_blank')}
                className="mesh-gradient-overlay text-white text-sm"
                size="sm"
              >
                Browse Gyms
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {memberships.map((membership) => (
              <Card key={membership.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  {membership.gym?.featured_image && (
                    <img
                      src={membership.gym.featured_image}
                      alt={membership.gym.name}
                      className="w-full h-24 sm:h-32 object-cover"
                    />
                  )}
                  <div className="absolute top-2 right-2 flex items-center gap-2">
                    <Badge className={`${getStatusColor(membership.status)} flex items-center gap-1 text-xs`}>
                      {getStatusIcon(membership.status)}
                      {membership.status.charAt(0).toUpperCase() + membership.status.slice(1)}
                    </Badge>
                    {membership.status === 'active' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-6 w-6 p-0 bg-white/90">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                                                 <DropdownMenuContent align="end">
                           <DropdownMenuItem onClick={() => openActionModal(membership, 'pause')}>
                             <Pause className="h-3 w-3 mr-2" />
                             Pause Membership
                           </DropdownMenuItem>
                           <DropdownMenuItem onClick={() => openActionModal(membership, 'transfer')}>
                             <UserPlus className="h-3 w-3 mr-2" />
                             Transfer Membership
                           </DropdownMenuItem>
                           <DropdownMenuItem onClick={() => openActionModal(membership, 'renewal')}>
                             <RefreshCw className="h-3 w-3 mr-2" />
                             Renew Membership
                           </DropdownMenuItem>
                         </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>

                <CardHeader className="p-3 sm:p-4">
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-base sm:text-lg font-bold truncate mr-2">{membership.gym?.name}</span>
                    <span className="text-sm sm:text-base font-semibold mesh-gradient-overlay bg-clip-text text-transparent">
                      ৳{membership.amount_paid.toLocaleString()}
                    </span>
                  </CardTitle>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="text-xs truncate">{membership.gym?.address}, {membership.gym?.city}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 p-3 sm:p-4 pt-0">
                  {/* Plan Details */}
                  <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                    <h4 className="font-semibold text-gray-900 mb-1 text-xs sm:text-sm">{membership.plan?.name}</h4>
                    <p className="text-xs text-gray-600 mb-2">{membership.plan?.description}</p>
                    
                    {membership.plan?.features && (
                      <div className="space-y-1">
                        {membership.plan.features.slice(0, 2).map((feature, index) => (
                          <div key={index} className="flex items-center text-xs text-gray-600">
                            <CheckCircle className="h-2 w-2 text-green-500 mr-1 flex-shrink-0" />
                            <span className="truncate">{feature}</span>
                          </div>
                        ))}
                        {membership.plan.features.length > 2 && (
                          <p className="text-xs text-gray-500">
                            +{membership.plan.features.length - 2} more features
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Membership Period */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div>
                      <div className="flex items-center text-xs text-gray-600 mb-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        Start Date
                      </div>
                      <p className="font-medium text-xs sm:text-sm">{format(parseISO(membership.start_date), 'MMM dd, yyyy')}</p>
                    </div>
                    <div>
                      <div className="flex items-center text-xs text-gray-600 mb-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        End Date
                      </div>
                      <p className="font-medium text-xs sm:text-sm">{format(parseISO(membership.end_date), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>

                  {/* Days Remaining */}
                  {membership.status === 'active' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-green-800">Days Remaining</span>
                        <span className="text-sm sm:text-base font-bold text-green-600">
                          {getDaysRemaining(membership.end_date)} days
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Payment Details */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center text-gray-600">
                      <CreditCard className="h-3 w-3 mr-1" />
                      Payment: {membership.payment_method || 'Card'}
                    </div>
                    <Badge variant={membership.payment_status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                      {membership.payment_status}
                    </Badge>
                  </div>

                  {/* Gym Contact */}
                  <div className="flex justify-between text-xs">
                    {membership.gym?.phone && (
                      <a 
                        href={`tel:${membership.gym.phone}`}
                        className="flex items-center text-pink-600 hover:text-pink-700"
                      >
                        <Phone className="h-3 w-3 mr-1" />
                        Call Gym
                      </a>
                    )}
                    {membership.gym?.email && (
                      <a 
                        href={`mailto:${membership.gym.email}`}
                        className="flex items-center text-pink-600 hover:text-pink-700"
                      >
                        <Mail className="h-3 w-3 mr-1" />
                        Email Gym
                      </a>
                    )}
                  </div>

                  {/* Actions */}
                  {membership.status === 'active' && (
                    <div className="pt-2 border-t">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="w-full text-red-600 border-red-200 hover:bg-red-50 text-xs"
                            disabled={cancelMembership.isPending}
                            size="sm"
                          >
                            Cancel Membership
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="max-w-sm sm:max-w-md">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-base">Cancel Membership</AlertDialogTitle>
                            <AlertDialogDescription className="text-sm">
                              Are you sure you want to cancel your membership at {membership.gym?.name}? 
                              This action cannot be undone and you may lose access to the gym immediately.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="text-sm">Keep Membership</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleCancelMembership(membership.id)}
                              className="bg-red-600 hover:bg-red-700 text-sm"
                            >
                              Yes, Cancel
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Membership Action Modal */}
      <Dialog open={showActionModal} onOpenChange={setShowActionModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{getActionTitle()}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {actionType === 'transfer' && (
              <div>
                <Label>Transfer to Email</Label>
                <Input
                  value={actionForm.transferEmail}
                  onChange={(e) => setActionForm({ ...actionForm, transferEmail: e.target.value })}
                  placeholder="Enter recipient's email"
                  type="email"
                />
              </div>
            )}
            
            {actionType === 'renewal' && (
              <div>
                <Label>Renewal Period</Label>
                <Select 
                  value={actionForm.renewalMonths.toString()} 
                  onValueChange={(value) => setActionForm({ ...actionForm, renewalMonths: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Month</SelectItem>
                    <SelectItem value="3">3 Months</SelectItem>
                    <SelectItem value="6">6 Months</SelectItem>
                    <SelectItem value="12">12 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>Reason (Optional)</Label>
              <Textarea
                value={actionForm.reason}
                onChange={(e) => setActionForm({ ...actionForm, reason: e.target.value })}
                placeholder="Please provide a reason for this action..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleMembershipAction} 
                disabled={
                  pauseMembership.isPending || 
                  resumeMembership.isPending || 
                  transferMembership.isPending || 
                  renewMembership.isPending ||
                  (actionType === 'transfer' && !actionForm.transferEmail.trim())
                }
                className="flex-1"
              >
                {(pauseMembership.isPending || resumeMembership.isPending || transferMembership.isPending || renewMembership.isPending) 
                  ? 'Processing...' 
                  : `Confirm ${actionType.charAt(0).toUpperCase() + actionType.slice(1)}`}
              </Button>
              <Button variant="outline" onClick={() => setShowActionModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientMemberships;
