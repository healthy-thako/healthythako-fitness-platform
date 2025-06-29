import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useEmailCampaigns, useDeleteEmailCampaign, useEmailStats } from '@/hooks/useEmailCampaigns';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Edit, Trash2, Send, Calendar, User, Loader2, Mail, Users } from 'lucide-react';
import { format } from 'date-fns';
import EmailCampaignModal from '@/components/EmailCampaignModal';

const AdminEmail = () => {
  const [filters, setFilters] = useState({ status: 'all', search: '' });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  
  const { data: campaigns, isLoading, error } = useEmailCampaigns(filters);
  const { data: stats } = useEmailStats();
  const deleteCampaign = useDeleteEmailCampaign();
  const { toast } = useToast();

  // Mock current admin ID - in real app, get from auth context
  const currentAdminId = 'admin-user-id';

  const handleDeleteCampaign = async (campaignId: string) => {
    if (window.confirm('Are you sure you want to delete this email campaign?')) {
      try {
        await deleteCampaign.mutateAsync(campaignId);
        toast({
          title: 'Success',
          description: 'Email campaign deleted successfully',
        });
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to delete email campaign',
          variant: 'destructive',
        });
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'sending': return 'bg-orange-100 text-orange-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading email campaigns...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>Error loading email campaigns: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Mass Email System</h2>
          <p className="text-gray-600">Create and manage email campaigns for users</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats?.total_campaigns || 0}</div>
            <p className="text-sm text-gray-600">Total Campaigns</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">
              {stats?.draft_campaigns || 0}
            </div>
            <p className="text-sm text-gray-600">Draft</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {stats?.sent_campaigns || 0}
            </div>
            <p className="text-sm text-gray-600">Sent</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {stats?.total_recipients || 0}
            </div>
            <p className="text-sm text-gray-600">Total Recipients</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {stats?.sent_emails || 0}
            </div>
            <p className="text-sm text-gray-600">Emails Sent</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {stats?.failed_emails || 0}
            </div>
            <p className="text-sm text-gray-600">Failed</p>
          </CardContent>
        </Card>
      </div>

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
                  placeholder="Search campaigns..."
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
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="sending">Sending</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Email Campaigns List */}
      <Card>
        <CardHeader>
          <CardTitle>Email Campaigns ({campaigns?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns?.map((campaign: any) => (
              <div key={campaign.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-lg">{campaign.name}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                      Subject: {campaign.subject}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        <span>{campaign.creator?.username || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{format(new Date(campaign.created_at), 'MMM dd, yyyy')}</span>
                      </div>
                      {campaign.scheduled_at && (
                        <div className="flex items-center">
                          <Send className="h-3 w-3 mr-1" />
                          <span>Scheduled: {format(new Date(campaign.scheduled_at), 'MMM dd, yyyy HH:mm')}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                      {campaign.recipients && (
                        <div className="flex items-center text-xs text-gray-500">
                          <Users className="h-3 w-3 mr-1" />
                          <span>{campaign.recipients.length} recipients</span>
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Filters: {Object.entries(campaign.recipient_filter || {})
                        .filter(([_, value]) => value === true)
                        .map(([key]) => key.replace('include_', '').replace('_', ' '))
                        .join(', ') || 'No filters'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {campaign.status === 'draft' && (
                    <Button variant="outline" size="sm">
                      <Send className="w-4 h-4 mr-1" />
                      Send Now
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedCampaign(campaign)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCampaign(campaign.id)}
                    disabled={deleteCampaign.isPending}
                    className="text-red-600 hover:text-red-700"
                  >
                    {deleteCampaign.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
            {(!campaigns || campaigns.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                No email campaigns found. Create your first campaign to get started!
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Email Campaign Modal */}
      <EmailCampaignModal
        isOpen={showCreateModal || !!selectedCampaign}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedCampaign(null);
        }}
        campaign={selectedCampaign}
        currentAdminId={currentAdminId}
      />
    </div>
  );
};

export default AdminEmail;
