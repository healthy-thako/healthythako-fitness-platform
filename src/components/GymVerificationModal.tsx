import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, MapPin, Phone, Mail, Clock, DollarSign, Shield, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface GymVerificationModalProps {
  gym: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerify: (gymId: string, notes: string) => Promise<void>;
  onReject: (gymId: string, notes: string) => Promise<void>;
  isLoading?: boolean;
}

const GymVerificationModal = ({
  gym,
  open,
  onOpenChange,
  onVerify,
  onReject,
  isLoading = false,
}: GymVerificationModalProps) => {
  const [verificationNotes, setVerificationNotes] = React.useState('');

  if (!gym) return null;

  const handleVerify = async () => {
    await onVerify(gym.id, verificationNotes);
    setVerificationNotes('');
  };

  const handleReject = async () => {
    await onReject(gym.id, verificationNotes);
    setVerificationNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Verify Gym</DialogTitle>
          <DialogDescription>
            Review gym details and verify or reject the application
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-base">{gym.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <Badge 
                    variant={
                      gym.verification_status === 'verified' ? 'default' :
                      gym.verification_status === 'rejected' ? 'destructive' :
                      'outline'
                    }
                    className="mt-1"
                  >
                    {gym.verification_status?.charAt(0).toUpperCase() + gym.verification_status?.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Location</p>
                  <div className="flex items-center gap-1 text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>{gym.area}, {gym.city}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Contact</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm">
                      <Phone className="h-4 w-4" />
                      <span>{gym.phone}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Mail className="h-4 w-4" />
                      <span>{gym.email}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Operating Hours */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Operating Hours</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {gym.operating_hours?.map((hours: any) => (
                  <div key={hours.day} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="font-medium">{hours.day}</span>
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-4 w-4" />
                      <span>
                        {hours.is_closed ? 'Closed' : `${hours.open_time} - ${hours.close_time}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Membership Plans */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Membership Plans</h3>
              <div className="grid grid-cols-1 gap-3">
                {gym.membership_plans?.map((plan: any) => (
                  <div key={plan.id} className="p-3 border rounded">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">{plan.name}</h4>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>৳{plan.price}/month</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification Notes */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Verification Notes</h3>
              <Textarea
                placeholder="Add notes about the verification decision..."
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            {/* Previous Verification History */}
            {gym.verification_notes && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Previous Verification Notes</h3>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm">{gym.verification_notes}</p>
                  {gym.verified_at && (
                    <p className="text-xs text-gray-500 mt-2">
                      Last updated: {format(new Date(gym.verified_at), 'PPpp')}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </>
            )}
          </Button>
          <Button
            onClick={handleVerify}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-1" />
                Verify
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GymVerificationModal; 