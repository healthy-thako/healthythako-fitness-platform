
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useAdminUsers, useUpdateUser, useSuspendUser, useCreateUser, useDeleteUser, useVerifyTrainer } from '@/hooks/useAdminUsers';
import { useToast } from '@/hooks/use-toast';
import { Search, User, Calendar, UserX, Loader2, Mail, Phone, Plus, Trash2, UserCheck } from 'lucide-react';
import { format } from 'date-fns';
import AdminBreadcrumb from '@/components/AdminBreadcrumb';

const AdminUsers = () => {
  const [filters, setFilters] = useState({ role: 'all', search: '' });
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'client' as 'client' | 'trainer' | 'gym_owner',
    location: '',
    gender: ''
  });

  const { data: users, isLoading, error } = useAdminUsers(filters.role === 'all' ? {} : filters);
  const updateUser = useUpdateUser();
  const suspendUser = useSuspendUser();
  const createUser = useCreateUser();
  const deleteUser = useDeleteUser();
  const verifyTrainer = useVerifyTrainer();
  const { toast } = useToast();

  const handleSuspendUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to suspend this user?')) {
      try {
        await suspendUser.mutateAsync(userId);
        toast({
          title: 'Success',
          description: 'User has been suspended successfully',
        });
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to suspend user',
          variant: 'destructive',
        });
      }
    }
  };

  const handleActivateUser = async (userId: string) => {
    try {
      await updateUser.mutateAsync({ 
        userId, 
        updates: { is_active: true } 
      });
      toast({
        title: 'Success',
        description: 'User has been activated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to activate user',
        variant: 'destructive',
      });
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser.mutateAsync(newUser);
      setNewUser({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'client',
        location: '',
        gender: ''
      });
      setShowCreateDialog(false);
      toast({
        title: 'Success',
        description: 'User created successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create user',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) return;
    
    try {
      await deleteUser.mutateAsync(userId);
      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  const handleVerifyTrainer = async (userId: string) => {
    try {
      await verifyTrainer.mutateAsync(userId);
      toast({
        title: 'Success',
        description: 'Trainer verified successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to verify trainer',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading users...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>Error loading users: {error.message}</p>
        <p className="text-sm text-gray-500 mt-2">Please check the console for more details.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Breadcrumb Navigation */}
      <AdminBreadcrumb 
        items={[
          { label: 'User Management', current: true }
        ]}
        showBackButton={false}
      />

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">User Management</h2>
          <p className="text-sm sm:text-base text-gray-600">Manage all platform users and their accounts</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Create User</span>
              <span className="sm:hidden">Create</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value) => setNewUser({ ...newUser, role: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="trainer">Trainer</SelectItem>
                    <SelectItem value="gym_owner">Gym Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={newUser.location}
                  onChange={(e) => setNewUser({ ...newUser, location: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createUser.isPending}>
                  {createUser.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Create User
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users by name or email..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10 text-sm sm:text-base"
                />
              </div>
            </div>
            <Select
              value={filters.role}
              onValueChange={(value) => setFilters({ ...filters, role: value })}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="client">Clients</SelectItem>
                <SelectItem value="trainer">Trainers</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold">{users?.length || 0}</div>
            <p className="text-xs sm:text-sm text-gray-600">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">
              {users?.filter((u: any) => u.role === 'client').length || 0}
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Clients</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600">
              {users?.filter((u: any) => u.role === 'trainer').length || 0}
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Trainers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600">
              {users?.filter((u: any) => !u.is_active).length || 0}
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Suspended</p>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Users ({users?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            {users?.map((user: any) => (
              <div key={user.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-gray-50 gap-3 sm:gap-4">
                <div className="flex items-start space-x-3 sm:space-x-4 flex-1">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-medium text-sm sm:text-lg">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-base sm:text-lg truncate">{user.name || 'Unnamed User'}</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm text-gray-500 mt-1 gap-1 sm:gap-0">
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        <span>{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge
                        variant={user.role === 'trainer' ? 'default' : 'outline'}
                        className={user.role === 'trainer' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}
                      >
                        {user.role}
                      </Badge>
                      <Badge variant={user.is_active ? 'default' : 'destructive'}>
                        {user.is_active ? 'Active' : 'Suspended'}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1 inline" />
                        Joined {format(new Date(user.created_at), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    {user.location && (
                      <div className="text-sm text-gray-600 mt-1">
                        Location: {user.location}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 sm:space-x-2">
                  {user.role === 'trainer' && !user.trainer_profiles?.[0]?.is_verified && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVerifyTrainer(user.id)}
                      disabled={verifyTrainer.isPending}
                      className="text-green-600 hover:text-green-700"
                    >
                      {verifyTrainer.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4 mr-1" />
                          Verify
                        </>
                      )}
                    </Button>
                  )}
                  {user.is_active ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuspendUser(user.id)}
                      disabled={suspendUser.isPending}
                      className="text-red-600 hover:text-red-700"
                    >
                      {suspendUser.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <UserX className="w-4 h-4 mr-1" />
                          Suspend
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleActivateUser(user.id)}
                      disabled={updateUser.isPending}
                      className="text-green-600 hover:text-green-700"
                    >
                      {updateUser.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <User className="w-4 h-4 mr-1" />
                          Activate
                        </>
                      )}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteUser(user.id, user.name || user.email)}
                    disabled={deleteUser.isPending}
                    className="text-red-600 hover:text-red-700"
                  >
                    {deleteUser.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
            {(!users || users.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                No users found matching your criteria
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
