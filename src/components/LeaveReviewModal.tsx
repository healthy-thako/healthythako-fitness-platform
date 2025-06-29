
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { useCreateReview } from '@/hooks/useClientData';
import { toast } from 'sonner';

interface LeaveReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    id: string;
    trainer_id: string;
    trainer?: {
      name: string;
    };
    title: string;
  };
}

const LeaveReviewModal: React.FC<LeaveReviewModalProps> = ({
  isOpen,
  onClose,
  booking
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const createReview = useCreateReview();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      await createReview.mutateAsync({
        bookingId: booking.id,
        trainerId: booking.trainer_id,
        rating,
        comment: comment.trim() || undefined
      });
      
      toast.success('Review submitted successfully!');
      onClose();
      setRating(0);
      setComment('');
    } catch (error) {
      toast.error('Failed to submit review');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Leave a Review</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              How was your session with {booking.trainer?.name || 'your trainer'}?
            </p>
            <p className="text-sm font-medium text-gray-900">{booking.title}</p>
          </div>

          {/* Star Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating *
            </label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comment (Optional)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this trainer..."
              rows={3}
              className="w-full"
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={rating === 0 || createReview.isPending}
              className="flex-1 mesh-gradient-overlay text-white"
            >
              {createReview.isPending ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeaveReviewModal;
