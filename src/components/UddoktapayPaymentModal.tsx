import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useCreatePayment } from '@/hooks/useUddoktapayPayment';
import { toast } from 'sonner';
import { CreditCard, Smartphone, Building, Zap } from 'lucide-react';

interface UddoktapayPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  bookingId?: string;
  gymMembershipData?: {
    gym_id: string;
    gym_name: string;
    plan_id: string;
    start_date: string;
    end_date: string;
  };
  onSuccess?: () => void;
}

const UddoktapayPaymentModal: React.FC<UddoktapayPaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  bookingId,
  gymMembershipData,
  onSuccess
}) => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerName, setCustomerName] = useState(user?.user_metadata?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const createPayment = useCreatePayment();

  const handlePayment = async () => {
    if (!customerName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!customerEmail.trim()) {
      toast.error('Please enter your email');
      return;
    }

    if (amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsProcessing(true);
    
    try {
      await createPayment.mutateAsync({
        amount: amount,
        currency: 'BDT',
        booking_id: bookingId,
        customer_name: customerName,
        customer_email: customerEmail,
        // URLs will be dynamically resolved in the hook
        metadata: gymMembershipData ? {
          gym_membership_data: JSON.stringify({
            gym_id: gymMembershipData.gym_id,
            gym_name: gymMembershipData.gym_name,
            plan_id: gymMembershipData.plan_id,
            start_date: gymMembershipData.start_date,
            end_date: gymMembershipData.end_date,
            amount: amount
          }),
          user_id: user?.id
        } : undefined
      });

      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error('Payment failed: ' + (error.message || 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-purple-600" />
            <span>Quick Payment with Uddoktapay</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Info */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-purple-700 mb-2">Supported Payment Methods</h3>
            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              <div className="flex flex-col items-center space-y-1">
                <Smartphone className="h-6 w-6 text-green-600" />
                <span>Mobile Banking</span>
                <span className="text-xs text-gray-600">bKash, Nagad, Rocket</span>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <CreditCard className="h-6 w-6 text-blue-600" />
                <span>Cards</span>
                <span className="text-xs text-gray-600">Visa, Mastercard</span>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <Building className="h-6 w-6 text-purple-600" />
                <span>Net Banking</span>
                <span className="text-xs text-gray-600">All major banks</span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="customer-name">Full Name</Label>
              <Input
                id="customer-name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your full name"
                className="text-lg"
              />
            </div>
            <div>
              <Label htmlFor="customer-email">Email</Label>
              <Input
                id="customer-email"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="Enter your email"
                className="text-lg"
              />
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Amount:</span>
              <span className="text-2xl font-bold text-green-600">
                ৳{amount.toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Secure payment powered by Uddoktapay
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePayment}
              disabled={isProcessing || !customerName.trim() || !customerEmail.trim()}
              className="flex-1 mesh-gradient-overlay text-white"
            >
              {isProcessing ? 'Processing...' : `Pay ৳${amount.toLocaleString()}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UddoktapayPaymentModal;
