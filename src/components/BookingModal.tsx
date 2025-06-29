
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainer: {
    id: string;
    name: string;
    trainer_profile: {
      rate_per_hour: number;
      specializations: string[];
    };
  };
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, trainer }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduled_date: '',
    scheduled_time: '',
    mode: 'online' as 'online' | 'home' | 'gym',
    session_count: 1,
    package_type: 'basic'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title || !formData.scheduled_date || !formData.scheduled_time) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Redirect to booking flow with trainer and form data
    const searchParams = new URLSearchParams({
      trainer: trainer.id,
      title: formData.title,
      description: formData.description,
      scheduled_date: formData.scheduled_date,
      scheduled_time: formData.scheduled_time,
      mode: formData.mode,
      session_count: formData.session_count.toString(),
      package_type: formData.package_type
    });
    
    navigate(`/booking-flow?${searchParams.toString()}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Book Session with {trainer.name}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Session Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Personal Training Session"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your fitness goals..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.scheduled_date}
                onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={formData.scheduled_time}
                onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label>Session Mode</Label>
            <Select value={formData.mode} onValueChange={(value: 'online' | 'home' | 'gym') => setFormData({ ...formData, mode: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Online Session
                  </div>
                </SelectItem>
                <SelectItem value="home">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Home Visit
                  </div>
                </SelectItem>
                <SelectItem value="gym">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Gym Session
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="sessions">Number of Sessions</Label>
            <Input
              id="sessions"
              type="number"
              min="1"
              max="10"
              value={formData.session_count}
              onChange={(e) => setFormData({ ...formData, session_count: parseInt(e.target.value) })}
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Cost:</span>
              <span className="text-xl font-bold text-green-600">
                ৳{trainer.trainer_profile.rate_per_hour * formData.session_count}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Continue to Payment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
