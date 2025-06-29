import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminSettings, useUpdateAdminSettings } from '@/hooks/useAdminSettings';
import { useAdminAdminUsers, useCreateAdminUser, useUpdateAdminUser, useDeleteAdminUser } from '@/hooks/useAdminAdminUsers';
import { useToast } from '@/hooks/use-toast';
import { Search, User, UserPlus, Edit, Trash2, Shield, Loader2, FileText, Mail } from 'lucide-react';
import { format } from 'date-fns';
import AdminBlog from '@/pages/AdminBlog';
import AdminEmail from '@/pages/AdminEmail';

const AdminSettings = () => {
  const [filters, setFilters] = useState({ role: 'all', search: '' });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    username: '',
    email: '',
    password: '',
    role: 'admin'
  });

  const { data: adminUsers, isLoading, error } = useAdminAdminUsers(filters.role === 'all' ? {} : filters);
  const createAdminUser = useCreateAdminUser();
  const updateAdminUser = useUpdateAdminUser();
  const deleteAdminUser = useDeleteAdminUser();
  const { toast } = useToast();

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAdminUser.mutateAsync(newAdmin);
      setNewAdmin({ username: '', email: '', password: '', role: 'admin' });
      setShowCreateForm(false);
      toast({
        title: 'Success',
        description: 'Admin user created successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create admin user',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (window.confirm('Are you sure you want to delete this admin user?')) {
      try {
        await deleteAdminUser.mutateAsync(adminId);
        toast({
          title: 'Success',
          description: 'Admin user deleted successfully',
        });
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to delete admin user',
          variant: 'destructive',
        });
      }
    }
  };

  const handleToggleStatus = async (adminId: string, isActive: boolean) => {
    try {
      await updateAdminUser.mutateAsync({ adminId, updates: { is_active: !isActive } });
      toast({
        title: 'Success',
        description: `Admin user ${!isActive ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update admin user',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Admin Settings</h2>
        <p className="text-gray-600">Manage admin users, blog system, and email campaigns</p>
      </div>

      <Tabs defaultValue="admin-users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="admin-users" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Admin Users
          </TabsTrigger>
          <TabsTrigger value="blog-system" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Blog System
          </TabsTrigger>
          <TabsTrigger value="email-system" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="admin-users" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold">Admin User Management</h3>
              <p className="text-gray-600">Manage admin users and their permissions</p>
            </div>
            <Button onClick={() => setShowCreateForm(!showCreateForm)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Admin User
            </Button>
          </div>

          {/* Create Admin Form */}
          {showCreateForm && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Admin User</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateAdmin} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Username</label>
                      <Input
                        value={newAdmin.username}
                        onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                        placeholder="Enter username"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <Input
                        type="email"
                        value={newAdmin.email}
                        onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                        placeholder="Enter email"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Password</label>
                      <Input
                        type="password"
                        value={newAdmin.password}
                        onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                        placeholder="Enter password"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Role</label>
                      <Select
                        value={newAdmin.role}
                        onValueChange={(value) => setNewAdmin({ ...newAdmin, role: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={createAdminUser.isPending}>
                      {createAdminUser.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Create Admin User
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search admin users..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select
                  value={filters.role}
                  onValueChange={(value) => setFilters({ ...filters, role: value })}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Admin Users List */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Users ({adminUsers?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading admin users...</span>
                </div>
              ) : error ? (
                <div className="p-8 text-center text-red-600">
                  <p>Error loading admin users: {error.message}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {adminUsers?.map((admin: any) => (
                    <div key={admin.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <Shield className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-lg">{admin.username}</h3>
                          <p className="text-sm text-gray-500">{admin.email}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant={admin.role === 'super_admin' ? 'default' : 'outline'}>
                              {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                            </Badge>
                            <Badge variant={admin.is_active ? 'default' : 'destructive'}>
                              {admin.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              Created {format(new Date(admin.created_at), 'MMM dd, yyyy')}
                            </span>
                          </div>
                          {admin.last_login && (
                            <div className="text-sm text-gray-600 mt-1">
                              Last login: {format(new Date(admin.last_login), 'MMM dd, yyyy HH:mm')}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(admin.id, admin.is_active)}
                          disabled={updateAdminUser.isPending}
                        >
                          {admin.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAdmin(admin.id)}
                          disabled={deleteAdminUser.isPending}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {(!adminUsers || adminUsers.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      No admin users found matching your criteria
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blog-system">
          <AdminBlog />
        </TabsContent>

        <TabsContent value="email-system">
          <AdminEmail />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
