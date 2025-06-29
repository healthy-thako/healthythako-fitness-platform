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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, MapPin, Phone, Mail, Star, Shield, CheckCircle, XCircle, Dumbbell } from 'lucide-react';
import { format } from 'date-fns';

interface TrainerVerificationModalProps {
  trainer: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerify: (trainerId: string, notes: string) => Promise<void>;
  onReject: (trainerId: string, notes: string) => Promise<void>;
  isLoading?: boolean;
}

const TrainerVerificationModal = ({
  trainer,
  open,
  onOpenChange,
  onVerify,
  onReject,
  isLoading = false,
}: TrainerVerificationModalProps) => {
  const [verificationNotes, setVerificationNotes] = React.useState('');

  if (!trainer) return null;

  const handleVerify = async () => {
    await onVerify(trainer.id, verificationNotes);
    setVerificationNotes('');
  };

  const handleReject = async () => {
    await onReject(trainer.id, verificationNotes);
    setVerificationNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Verify Trainer</DialogTitle>
          <DialogDescription>
            Review trainer details and verify or reject the application
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
              <div className="flex items-start gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={trainer.trainer_profiles?.[0]?.profile_image} />
                  <AvatarFallback className="bg-purple-100 text-purple-600">
                    {trainer.name?.charAt(0)?.toUpperCase() || 'T'}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Name</p>
                      <p className="text-base">{trainer.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <Badge 
                        variant={
                          trainer.trainer_profiles?.[0]?.verification_status === 'verified' ? 'default' :
                          trainer.trainer_profiles?.[0]?.verification_status === 'rejected' ? 'destructive' :
                          'outline'
                        }
                        className="mt-1"
                      >
                        {trainer.trainer_profiles?.[0]?.verification_status?.charAt(0).toUpperCase() + 
                         trainer.trainer_profiles?.[0]?.verification_status?.slice(1)}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Contact</p>
                      <div className="space-y-1">
                        {trainer.phone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-4 w-4" />
                            <span>{trainer.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-4 w-4" />
                          <span>{trainer.email}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Location</p>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-4 w-4" />
                        <span>{trainer.trainer_profiles?.[0]?.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Specializations */}
            {trainer.trainer_profiles?.[0]?.specializations && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Specializations</h3>
                <div className="flex flex-wrap gap-2">
                  {trainer.trainer_profiles[0].specializations.map((spec: string) => (
                    <Badge key={spec} variant="secondary">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {trainer.trainer_profiles?.[0]?.experience && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Experience</h3>
                <p className="text-sm text-gray-600">
                  {trainer.trainer_profiles[0].experience}
                </p>
              </div>
            )}

            {/* Certifications */}
            {trainer.trainer_profiles?.[0]?.certifications && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Certifications</h3>
                <div className="space-y-2">
                  {trainer.trainer_profiles[0].certifications.map((cert: any) => (
                    <div key={cert.name} className="p-3 border rounded">
                      <h4 className="font-medium">{cert.name}</h4>
                      <p className="text-sm text-gray-600">{cert.issuer}</p>
                      {cert.year && (
                        <p className="text-xs text-gray-500">Year: {cert.year}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">Rating</span>
                  </div>
                  <p className="text-lg font-semibold mt-1">
                    {Number(trainer.trainer_profiles?.[0]?.rating || 0).toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {trainer.trainer_profiles?.[0]?.review_count || 0} reviews
                  </p>
                </div>

                <div className="p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium">Sessions</span>
                  </div>
                  <p className="text-lg font-semibold mt-1">
                    {trainer.trainer_profiles?.[0]?.session_count || 0}
                  </p>
                  <p className="text-xs text-gray-500">completed</p>
                </div>

                <div className="p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Experience</span>
                  </div>
                  <p className="text-lg font-semibold mt-1">
                    {trainer.trainer_profiles?.[0]?.years_of_experience || 0}
                  </p>
                  <p className="text-xs text-gray-500">years</p>
                </div>
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
            {trainer.trainer_profiles?.[0]?.verification_notes && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Previous Verification Notes</h3>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm">{trainer.trainer_profiles[0].verification_notes}</p>
                  {trainer.trainer_profiles[0].verified_at && (
                    <p className="text-xs text-gray-500 mt-2">
                      Last updated: {format(new Date(trainer.trainer_profiles[0].verified_at), 'PPpp')}
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

export default TrainerVerificationModal;
