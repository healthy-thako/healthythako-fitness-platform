
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useCreateEmailCampaign, useUpdateEmailCampaign } from '@/hooks/useEmailCampaigns';
import { useToast } from '@/hooks/use-toast';

interface EmailCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign?: any;
  currentAdminId: string;
}

const EmailCampaignModal: React.FC<EmailCampaignModalProps> = ({ 
  isOpen, 
  onClose, 
  campaign, 
  currentAdminId 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    status: 'draft',
    scheduled_at: '',
  });
  
  const [recipientFilter, setRecipientFilter] = useState({
    include_trainers: true,
    include_clients: true,
    include_active_only: true,
    location_filter: '',
  });

  const createCampaign = useCreateEmailCampaign();
  const updateCampaign = useUpdateEmailCampaign();
  const { toast } = useToast();

  useEffect(() => {
    if (campaign) {
      setFormData({
        name: campaign.name || '',
        subject: campaign.subject || '',
        content: campaign.content || '',
        status: campaign.status || 'draft',
        scheduled_at: campaign.scheduled_at ? campaign.scheduled_at.slice(0, 16) : '',
      });
      setRecipientFilter(campaign.recipient_filter || {
        include_trainers: true,
        include_clients: true,
        include_active_only: true,
        location_filter: '',
      });
    } else {
      setFormData({
        name: '',
        subject: '',
        content: '',
        status: 'draft',
        scheduled_at: '',
      });
      setRecipientFilter({
        include_trainers: true,
        include_clients: true,
        include_active_only: true,
        location_filter: '',
      });
    }
  }, [campaign]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const campaignData = {
        ...formData,
        recipient_filter: recipientFilter,
        created_by: currentAdminId,
        scheduled_at: formData.scheduled_at || null,
      };

      if (campaign) {
        await updateCampaign.mutateAsync({ 
          campaignId: campaign.id, 
          updates: campaignData 
        });
        toast({
          title: 'Success',
          description: 'Email campaign updated successfully',
        });
      } else {
        await createCampaign.mutateAsync(campaignData);
        toast({
          title: 'Success',
          description: 'Email campaign created successfully',
        });
      }
      
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save email campaign',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {campaign ? 'Edit Email Campaign' : 'Create New Email Campaign'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Campaign Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter campaign name"
                required
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="sent">Send Now</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="subject">Email Subject *</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Enter email subject"
              required
            />
          </div>

          {formData.status === 'scheduled' && (
            <div>
              <Label htmlFor="scheduled_at">Schedule Date & Time</Label>
              <Input
                id="scheduled_at"
                type="datetime-local"
                value={formData.scheduled_at}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduled_at: e.target.value }))}
              />
            </div>
          )}

          <div>
            <Label htmlFor="content">Email Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Write your email content here... You can use HTML tags."
              rows={10}
              required
            />
          </div>

          <div className="space-y-4">
            <Label className="text-base font-semibold">Recipient Filters</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include_trainers"
                    checked={recipientFilter.include_trainers}
                    onCheckedChange={(checked) => 
                      setRecipientFilter(prev => ({ ...prev, include_trainers: !!checked }))
                    }
                  />
                  <Label htmlFor="include_trainers">Include Trainers</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include_clients"
                    checked={recipientFilter.include_clients}
                    onCheckedChange={(checked) => 
                      setRecipientFilter(prev => ({ ...prev, include_clients: !!checked }))
                    }
                  />
                  <Label htmlFor="include_clients">Include Clients</Label>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include_active_only"
                    checked={recipientFilter.include_active_only}
                    onCheckedChange={(checked) => 
                      setRecipientFilter(prev => ({ ...prev, include_active_only: !!checked }))
                    }
                  />
                  <Label htmlFor="include_active_only">Active Users Only</Label>
                </div>
                
                <div>
                  <Label htmlFor="location_filter">Location Filter (Optional)</Label>
                  <Input
                    id="location_filter"
                    value={recipientFilter.location_filter}
                    onChange={(e) => 
                      setRecipientFilter(prev => ({ ...prev, location_filter: e.target.value }))
                    }
                    placeholder="e.g., Dhaka, Bangladesh"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createCampaign.isPending || updateCampaign.isPending}
            >
              {campaign ? 'Update Campaign' : 'Create Campaign'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmailCampaignModal;
