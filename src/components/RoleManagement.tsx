import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  User, 
  Shield, 
  Building2, 
  Dumbbell, 
  UserCheck, 
  Clock, 
  CheckCircle, 
  XCircle,
  ArrowRight,
  Plus,
  Eye,
  FileText
} from 'lucide-react';

interface RoleChangeRequest {
  id: string;
  from_role: string;
  to_role: string;
  additional_data: any;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  created_at: string;
  processed_at?: string;
}

const RoleManagement: React.FC = () => {
  const { user, profile, switchPrimaryRole, requestRoleChange, hasRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [roleChangeRequests, setRoleChangeRequests] = useState<RoleChangeRequest[]>([]);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'trainer' | 'gym_owner' | ''>('');
  const [requestData, setRequestData] = useState({
    reason: '',
    business_name: '',
    business_license: '',
    certifications: '',
    experience: ''
  });

  useEffect(() => {
    if (user) {
      fetchRoleChangeRequests();
    }
  }, [user]);

  const fetchRoleChangeRequests = async () => {
    try {
      // Use Edge Function to fetch role change requests since the table might not be in TypeScript types yet
      const { data, error } = await supabase.functions.invoke('unified-auth', {
        body: {
          action: 'get_role_change_requests',
          user_id: user?.id
        }
      });

      if (error) throw error;
      
      if (data?.success && data?.requests) {
        setRoleChangeRequests(data.requests);
      }
    } catch (error) {
      console.error('Error fetching role change requests:', error);
    }
  };

  const handleRoleSwitching = async (newRole: 'client' | 'trainer' | 'gym_owner') => {
    setLoading(true);
    try {
      const { error } = await switchPrimaryRole(newRole);
      if (error) {
        toast.error(`Failed to switch to ${newRole}: ${error.message}`);
      } else {
        toast.success(`Successfully switched to ${newRole} role!`);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleRequest = async () => {
    if (!selectedRole) {
      toast.error('Please select a role to request');
      return;
    }

    setLoading(true);
    try {
      const additionalData: any = {
        reason: requestData.reason
      };

      if (selectedRole === 'gym_owner') {
        additionalData.business_name = requestData.business_name;
        additionalData.business_license = requestData.business_license;
      } else if (selectedRole === 'trainer') {
        additionalData.certifications = requestData.certifications;
        additionalData.experience = requestData.experience;
      }

      const { error } = await requestRoleChange(selectedRole, additionalData);
      
      if (error) {
        toast.error(`Failed to request ${selectedRole} role: ${error.message}`);
      } else {
        toast.success(`${selectedRole} role request submitted successfully! It will be reviewed by our admin team.`);
        setShowRequestDialog(false);
        setSelectedRole('');
        setRequestData({
          reason: '',
          business_name: '',
          business_license: '',
          certifications: '',
          experience: ''
        });
        fetchRoleChangeRequests();
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'client':
        return <User className="h-4 w-4" />;
      case 'trainer':
        return <Dumbbell className="h-4 w-4" />;
      case 'gym_owner':
        return <Building2 className="h-4 w-4" />;
      case 'admin':
        return <Shield className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'client':
        return 'bg-blue-100 text-blue-800';
      case 'trainer':
        return 'bg-green-100 text-green-800';
      case 'gym_owner':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const availableRolesToRequest = ['trainer', 'gym_owner'].filter(role => !hasRole(role));

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Current Roles Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Your Roles
          </CardTitle>
          <CardDescription>
            Manage your current roles and switch between them
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {profile.roles?.map((role: string) => (
              <Badge 
                key={role} 
                className={`${getRoleBadgeColor(role)} flex items-center gap-1`}
                variant={role === profile.primary_role ? "default" : "secondary"}
              >
                {getRoleIcon(role)}
                {role}
                {role === profile.primary_role && <span className="text-xs">(Primary)</span>}
              </Badge>
            ))}
          </div>

          {profile.roles && profile.roles.length > 1 && (
            <div className="pt-4 border-t">
              <Label className="text-sm font-medium">Switch Primary Role</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.roles
                  .filter((role: string) => role !== profile.primary_role && role !== 'admin')
                  .map((role: string) => (
                    <Button
                      key={role}
                      variant="outline"
                      size="sm"
                      onClick={() => handleRoleSwitching(role as any)}
                      disabled={loading}
                      className="flex items-center gap-2"
                    >
                      {getRoleIcon(role)}
                      Switch to {role}
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Request New Role Section */}
      {availableRolesToRequest.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Request Additional Roles
            </CardTitle>
            <CardDescription>
              Request additional roles to expand your capabilities on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Request New Role
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Request Additional Role</DialogTitle>
                  <DialogDescription>
                    Select the role you'd like to request and provide the required information
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="role-select">Select Role</Label>
                    <Select value={selectedRole} onValueChange={(value: any) => setSelectedRole(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a role to request" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRolesToRequest.map(role => (
                          <SelectItem key={role} value={role} className="flex items-center gap-2">
                            <span className="flex items-center gap-2">
                              {getRoleIcon(role)}
                              {role}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="reason">Reason for Request</Label>
                    <Textarea
                      id="reason"
                      placeholder="Please explain why you want this role..."
                      value={requestData.reason}
                      onChange={(e) => setRequestData(prev => ({ ...prev, reason: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  {selectedRole === 'gym_owner' && (
                    <>
                      <div>
                        <Label htmlFor="business-name">Business Name</Label>
                        <Input
                          id="business-name"
                          placeholder="Your gym/business name"
                          value={requestData.business_name}
                          onChange={(e) => setRequestData(prev => ({ ...prev, business_name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="business-license">Business License Number</Label>
                        <Input
                          id="business-license"
                          placeholder="Your business license number"
                          value={requestData.business_license}
                          onChange={(e) => setRequestData(prev => ({ ...prev, business_license: e.target.value }))}
                        />
                      </div>
                    </>
                  )}

                  {selectedRole === 'trainer' && (
                    <>
                      <div>
                        <Label htmlFor="certifications">Certifications</Label>
                        <Textarea
                          id="certifications"
                          placeholder="List your fitness certifications..."
                          value={requestData.certifications}
                          onChange={(e) => setRequestData(prev => ({ ...prev, certifications: e.target.value }))}
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label htmlFor="experience">Experience</Label>
                        <Textarea
                          id="experience"
                          placeholder="Describe your training experience..."
                          value={requestData.experience}
                          onChange={(e) => setRequestData(prev => ({ ...prev, experience: e.target.value }))}
                          rows={2}
                        />
                      </div>
                    </>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleRoleRequest}
                      disabled={loading || !selectedRole}
                      className="flex-1"
                    >
                      {loading ? 'Submitting...' : 'Submit Request'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowRequestDialog(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {/* Role Change Requests History */}
      {roleChangeRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Role Change Requests
            </CardTitle>
            <CardDescription>
              View the status of your role change requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {roleChangeRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getRoleIcon(request.from_role)}
                      <span className="text-sm font-medium">{request.from_role}</span>
                      <ArrowRight className="h-3 w-3 text-gray-400" />
                      {getRoleIcon(request.to_role)}
                      <span className="text-sm font-medium">{request.to_role}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusIcon(request.status)}
                    <Badge 
                      variant={
                        request.status === 'approved' ? 'default' :
                        request.status === 'rejected' ? 'destructive' : 'secondary'
                      }
                    >
                      {request.status}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(request.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RoleManagement; 