import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Lock, CheckCircle } from 'lucide-react';

interface UpdatePasswordFormProps {
  onUpdatePassword: (password: string) => Promise<{ error: any }>;
  onSuccess: () => void;
  title?: string;
}

const UpdatePasswordForm: React.FC<UpdatePasswordFormProps> = ({
  onUpdatePassword,
  onSuccess,
  title = "Set New Password"
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await onUpdatePassword(password);
      
      if (error) {
        toast.error(error.message || 'Failed to update password');
      } else {
        toast.success('Password updated successfully!');
        onSuccess();
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">{title}</CardTitle>
          <p className="text-sm text-gray-600">Enter your new password below</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-sm font-medium">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
                disabled={isSubmitting}
                className="h-11"
                minLength={6}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-sm font-medium">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                disabled={isSubmitting}
                className="h-11"
                minLength={6}
              />
            </div>
            
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-gradient-to-r from-[#3c0747] to-[#c90e5c] hover:from-[#2a0533] hover:to-[#a50c4e] text-white font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Update Password
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpdatePasswordForm; 