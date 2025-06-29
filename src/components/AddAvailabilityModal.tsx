
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { Clock, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface AddAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (availability: any) => void;
}

const AddAvailabilityModal: React.FC<AddAvailabilityModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave 
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [timeSlots, setTimeSlots] = useState({
    startTime: '',
    endTime: '',
    type: 'available'
  });

  const handleSave = () => {
    if (!selectedDate || !timeSlots.startTime || !timeSlots.endTime) {
      toast.error('Please fill in all fields');
      return;
    }

    const availability = {
      date: format(selectedDate, 'yyyy-MM-dd'),
      startTime: timeSlots.startTime,
      endTime: timeSlots.endTime,
      type: timeSlots.type
    };

    onSave(availability);
    onClose();
    
    // Reset form
    setSelectedDate(new Date());
    setTimeSlots({
      startTime: '',
      endTime: '',
      type: 'available'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2" />
            Add Availability
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Select Date</Label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              disabled={(date) => date < new Date()}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={timeSlots.startTime}
                onChange={(e) => setTimeSlots(prev => ({ ...prev, startTime: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={timeSlots.endTime}
                onChange={(e) => setTimeSlots(prev => ({ ...prev, endTime: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label>Status</Label>
            <Select 
              value={timeSlots.type} 
              onValueChange={(value) => setTimeSlots(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
              <Clock className="h-4 w-4 mr-1" />
              Save Availability
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddAvailabilityModal;
