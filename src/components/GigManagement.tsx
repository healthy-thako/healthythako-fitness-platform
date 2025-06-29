import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTrainerGigs, useUpdateGig, useDeleteGig } from '@/hooks/useGigsCRUD';
import { CreateGigWizard } from '@/components/CreateGigWizard';
import GigStats from '@/components/GigStats';
import { 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  DollarSign,
  Clock,
  Target,
  MoreVertical,
  Image as ImageIcon
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const GigManagement = () => {
  const navigate = useNavigate();
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const { data: gigs, isLoading } = useTrainerGigs();
  const updateGig = useUpdateGig();
  const deleteGig = useDeleteGig();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleToggleStatus = async (gigId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      await updateGig.mutateAsync({ gigId, updates: { status: newStatus } });
      toast.success(`Gig ${newStatus === 'active' ? 'activated' : 'paused'} successfully`);
    } catch (error: any) {
      toast.error('Error updating gig status: ' + error.message);
    }
  };

  const handleDeleteGig = async (gigId: string) => {
    if (confirm('Are you sure you want to delete this gig?')) {
      try {
        await deleteGig.mutateAsync(gigId);
        toast.success('Gig deleted successfully');
      } catch (error: any) {
        toast.error('Error deleting gig: ' + error.message);
      }
    }
  };

  const handleViewGig = (gigId: string) => {
    navigate(`/gig/${gigId}`);
  };

  const handlePreviewGig = (gigId: string) => {
    navigate(`/gig/${gigId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Gigs</h2>
          <p className="text-gray-600">Manage your fitness training services</p>
        </div>
        <Button 
          onClick={() => setShowCreateWizard(true)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Gig
        </Button>
      </div>

      <GigStats gigs={gigs || []} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gigs?.map((gig) => (
          <Card key={gig.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">{gig.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={`${getStatusColor(gig.status)}`}>
                      {gig.status}
                    </Badge>
                    {gig.images && gig.images.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        <ImageIcon className="h-3 w-3 mr-1" />
                        {gig.images.length}
                      </Badge>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewGig(gig.id)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Gig
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleToggleStatus(gig.id, gig.status)}
                    >
                      {gig.status === 'active' ? 'Pause Gig' : 'Activate Gig'}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => handleDeleteGig(gig.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              {gig.images && gig.images.length > 0 && (
                <img
                  src={gig.images[0]}
                  alt={gig.title}
                  className="w-full h-32 object-cover rounded-lg mb-4"
                />
              )}
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {gig.description}
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center text-gray-600">
                    <DollarSign className="h-4 w-4 mr-1" />
                    Starting at
                  </span>
                  <span className="font-medium text-green-600">
                    ৳{gig.basic_price}
                  </span>
                </div>
                
                {gig.basic_delivery_days && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-1" />
                      Delivery
                    </span>
                    <span className="text-gray-900">
                      {gig.basic_delivery_days} days
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-xs text-gray-500 pt-2 border-t">
                  <span>{gig.view_count || 0} views</span>
                  <span>{gig.order_count || 0} orders</span>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleToggleStatus(gig.id, gig.status)}
                  disabled={updateGig.isPending}
                >
                  {gig.status === 'active' ? 'Pause' : 'Activate'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handlePreviewGig(gig.id)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {(!gigs || gigs.length === 0) && (
          <div className="col-span-full">
            <Card>
              <CardContent className="text-center py-12">
                <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No gigs yet</h3>
                <p className="text-gray-600 mb-4">
                  Create your first gig to start offering your training services
                </p>
                <Button 
                  onClick={() => setShowCreateWizard(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Gig
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <CreateGigWizard 
        isOpen={showCreateWizard}
        onClose={() => setShowCreateWizard(false)}
      />
    </div>
  );
};

export default GigManagement;
