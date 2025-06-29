import React, { useState } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Plus, Users, Trash2 } from 'lucide-react';
import { useTrainerStats } from '@/hooks/useTrainerData';
import { useTrainerAvailability, useCreateAvailability, useDeleteAvailability } from '@/hooks/useTrainerAvailability';
import AddAvailabilityModal from '@/components/AddAvailabilityModal';
import { toast } from 'sonner';
import { format } from 'date-fns';

const TrainerSchedule = () => {
  const { data: stats, isLoading: statsLoading } = useTrainerStats();
  const { data: availabilitySlots, isLoading: availabilityLoading } = useTrainerAvailability();
  const createAvailability = useCreateAvailability();
  const deleteAvailability = useDeleteAvailability();
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddAvailability = async (availability: any) => {
    try {
      await createAvailability.mutateAsync({
        date: availability.date,
        start_time: availability.startTime,
        end_time: availability.endTime,
        status: availability.type,
        notes: availability.notes
      });
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to add availability:', error);
    }
  };

  const handleDeleteAvailability = (id: string) => {
    deleteAvailability.mutate(id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
      case 'in_progress':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (statsLoading || availabilityLoading) {
    return (
      <div className="flex items-center justify-center p-3">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50">
      <div className="bg-white border-b px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <SidebarTrigger />
            <div>
              <h1 className="text-base sm:text-lg font-bold text-gray-900">Schedule</h1>
              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Manage your availability and upcoming sessions</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowAddModal(true)}
            className="bg-pink-600 hover:bg-pink-700"
            size="sm"
          >
            <Plus className="h-3 w-3 mr-1" />
            <span className="hidden sm:inline">Add Availability</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      <div className="p-2 sm:p-3 space-y-2 sm:space-y-3">
        {/* Today's Sessions */}
        <Card>
          <CardHeader className="pb-1 sm:pb-2">
            <CardTitle className="text-sm flex items-center">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Today's Sessions ({stats?.todaySessions || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats?.upcomingSessions && stats.upcomingSessions.length > 0 ? (
                stats.upcomingSessions.map((session: any) => (
                  <div key={session.id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-gray-500" />
                        <span className="text-xs font-medium">
                          {session.scheduled_time || 'Time TBD'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{session.title}</p>
                        <p className="text-xs text-gray-600">{session.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(session.status)} variant="secondary">
                        {session.status}
                      </Badge>
                      <p className="text-xs text-gray-600 mt-1">
                        ৳{session.amount}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 sm:py-6">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-sm font-medium text-gray-900 mb-2">No sessions today</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Your upcoming sessions will appear here</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Availability Slots */}
        <Card>
          <CardHeader className="pb-1 sm:pb-2">
            <CardTitle className="text-sm flex items-center">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Your Availability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {availabilitySlots && availabilitySlots.length > 0 ? (
                availabilitySlots.map((slot: any) => (
                  <div key={slot.id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div>
                        <p className="font-medium text-sm">
                          {format(new Date(slot.date), 'MMM dd, yyyy')}
                        </p>
                        <p className="text-xs text-gray-600">
                          {slot.start_time} - {slot.end_time}
                        </p>
                        {slot.notes && (
                          <p className="text-xs text-gray-500 mt-1">{slot.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        className={getStatusColor(slot.status)} 
                        variant="secondary"
                      >
                        {slot.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAvailability(slot.id)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 sm:py-6">
                  <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-sm font-medium text-gray-900 mb-2">No availability set</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Add your available time slots to let clients book sessions</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <AddAvailabilityModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddAvailability}
        />
      </div>
    </div>
  );
};

export default TrainerSchedule;
