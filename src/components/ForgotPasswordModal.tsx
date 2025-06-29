import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';

interface ForgotPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResetPassword: (email: string) => Promise<{ error: any }>;
  title?: string;
  description?: string;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  open,
  onOpenChange,
  onResetPassword,
  title = "Reset Password",
  description = "Enter your email address and we'll send you a link to reset your password."
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await onResetPassword(email);
      
      if (error) {
        toast.error(error.message || 'Failed to send reset email');
      } else {
        setIsEmailSent(true);
        toast.success('Password reset email sent! Check your inbox.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setIsEmailSent(false);
    setIsSubmitting(false);
    onOpenChange(false);
  };

  const handleBackToLogin = () => {
    setIsEmailSent(false);
    setEmail('');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEmailSent ? (
              <>
                <Mail className="h-5 w-5 text-green-600" />
                Email Sent
              </>
            ) : (
              <>
                <Mail className="h-5 w-5" />
                {title}
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {isEmailSent ? (
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Check your email</h3>
              <p className="text-sm text-gray-600 mb-4">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="text-xs text-gray-500">
                Didn't receive the email? Check your spam folder or try again.
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleBackToLogin}
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleClose}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">{description}</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email Address</Label>
              <Input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                disabled={isSubmitting}
                className="h-11"
              />
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordModal; 