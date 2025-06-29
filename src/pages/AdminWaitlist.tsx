
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdminWaitlist, useUpdateWaitlistEntry, useDeleteWaitlistEntry, useWaitlistStats } from '@/hooks/useAdminWaitlist';
import { useToast } from '@/hooks/use-toast';
import { Users, Mail, Phone, Calendar, Search, Download, Loader2, Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';

const AdminWaitlist = () => {
  const [filters, setFilters] = useState({ status: 'all', search: '' });
  const { data: waitlistEntries, isLoading, error } = useAdminWaitlist({
    status: filters.status === 'all' ? undefined : filters.status,
    search: filters.search
  });
  const { data: stats } = useWaitlistStats();
  const updateEntry = useUpdateWaitlistEntry();
  const deleteEntry = useDeleteWaitlistEntry();
  const { toast } = useToast();

  const updateStatus = async (id: string, newStatus: 'pending' | 'contacted' | 'converted' | 'rejected') => {
    try {
      await updateEntry.mutateAsync({ entryId: id, updates: { status: newStatus } });
      toast({
        title: 'Success',
        description: 'Status updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    
    try {
      await deleteEntry.mutateAsync(id);
      toast({
        title: 'Success',
        description: 'Entry deleted successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete entry',
        variant: 'destructive',
      });
    }
  };

  const exportToCSV = () => {
    if (!waitlistEntries) return;
    
    const headers = ['Name', 'Email', 'Phone', 'Status', 'Joined Date'];
    const csvContent = [
      headers.join(','),
      ...waitlistEntries.map(entry => [
        entry.name,
        entry.email,
        entry.phone || '',
        entry.status,
        new Date(entry.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'healthythako-waitlist.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'default';
      case 'contacted': return 'secondary';
      case 'converted': return 'secondary';
      default: return 'default';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading waitlist...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>Error loading waitlist: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Waitlist Management</h1>
          <p className="text-gray-600">Manage and track waitlist entries</p>
        </div>
        <Button onClick={exportToCSV} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Entries</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.total_entries || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.this_week_entries || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Mail className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Contacted</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.contacted_entries || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Phone className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Converted</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.converted_entries || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Waitlist Table */}
      <Card>
        <CardHeader>
          <CardTitle>Waitlist Entries ({waitlistEntries?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Phone</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Joined</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {waitlistEntries?.map((entry) => (
                  <tr key={entry.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{entry.name}</td>
                    <td className="py-3 px-4 text-gray-600">{entry.email}</td>
                    <td className="py-3 px-4 text-gray-600">{entry.phone || '-'}</td>
                    <td className="py-3 px-4">
                      <Badge variant={getStatusBadgeVariant(entry.status)}>
                        {entry.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {format(new Date(entry.created_at), 'MMM dd, yyyy')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Select
                          value={entry.status}
                          onValueChange={(value) => updateStatus(entry.id, value as any)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="converted">Converted</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(entry.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!waitlistEntries || waitlistEntries.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                No waitlist entries found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminWaitlist;
