import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAdminSupport, useCreateSupportTicket, useUpdateSupportTicket } from '@/hooks/useAdminSupport';
import { useToast } from '@/hooks/use-toast';
import { Search, MessageCircle, AlertTriangle, CheckCircle, Clock, Plus, User, Calendar, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const AdminSupport = () => {
  const [filters, setFilters] = useState({ status: 'all', type: 'all', search: '' });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    type: 'general',
    priority: 'medium'
  });

  const { data: tickets, isLoading, error } = useAdminSupport({
    status: filters.status === 'all' ? undefined : filters.status,
    type: filters.type === 'all' ? undefined : filters.type,
    search: filters.search
  });
  const createTicket = useCreateSupportTicket();
  const updateTicket = useUpdateSupportTicket();
  const { toast } = useToast();

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTicket.mutateAsync(newTicket);
      setNewTicket({ title: '', description: '', type: 'general', priority: 'medium' });
      setShowCreateForm(false);
      toast({
        title: 'Success',
        description: 'Support ticket created successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create support ticket',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateStatus = async (ticketId: string, status: string) => {
    try {
      await updateTicket.mutateAsync({ ticketId, updates: { status } });
      toast({
        title: 'Success',
        description: 'Ticket status updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update ticket status',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'open': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading support tickets...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>Error loading support tickets: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Support Management</h2>
          <p className="text-gray-600">Handle support tickets and user disputes</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Ticket
        </Button>
      </div>

      {/* Create Ticket Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Support Ticket</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <Input
                    value={newTicket.title}
                    onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                    placeholder="Enter ticket title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <Select
                    value={newTicket.type}
                    onValueChange={(value) => setNewTicket({ ...newTicket, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Support</SelectItem>
                      <SelectItem value="technical">Technical Issue</SelectItem>
                      <SelectItem value="billing">Billing Issue</SelectItem>
                      <SelectItem value="dispute">User Dispute</SelectItem>
                      <SelectItem value="verification">Verification Issue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Priority</label>
                <Select
                  value={newTicket.priority}
                  onValueChange={(value) => setNewTicket({ ...newTicket, priority: value })}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  placeholder="Describe the issue or request"
                  rows={4}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createTicket.isPending}>
                  {createTicket.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Create Ticket
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
                  placeholder="Search tickets..."
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
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.type}
              onValueChange={(value) => setFilters({ ...filters, type: value })}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
                <SelectItem value="dispute">Dispute</SelectItem>
                <SelectItem value="verification">Verification</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{tickets?.length || 0}</div>
            <p className="text-sm text-gray-600">Total Tickets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {tickets?.filter(t => t.status === 'open').length || 0}
            </div>
            <p className="text-sm text-gray-600">Open</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {tickets?.filter(t => t.status === 'in-progress').length || 0}
            </div>
            <p className="text-sm text-gray-600">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {tickets?.filter(t => t.status === 'resolved').length || 0}
            </div>
            <p className="text-sm text-gray-600">Resolved</p>
          </CardContent>
        </Card>
      </div>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle>Support Tickets ({tickets?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tickets?.map((ticket: any) => (
              <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MessageCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-lg truncate">{ticket.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{ticket.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                      <Badge className={getPriorityColor(ticket.priority)} variant="outline">
                        {ticket.priority} priority
                      </Badge>
                      <Badge variant="outline">
                        {ticket.type}
                      </Badge>
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(new Date(ticket.created_at), 'MMM dd, yyyy')}
                      </div>
                    </div>
                    {ticket.assigned_admin && (
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <User className="h-3 w-3 mr-1" />
                        Assigned to: {ticket.assigned_admin}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Select
                    value={ticket.status}
                    onValueChange={(value) => handleUpdateStatus(ticket.id, value)}
                    disabled={updateTicket.isPending}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
            {(!tickets || tickets.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                No support tickets found matching your criteria
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSupport;
