
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateWithdrawalRequest } from '@/hooks/useWithdrawals';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { toast } from 'sonner';
import { Loader2, CreditCard, Plus } from 'lucide-react';

interface WithdrawalRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
}

const WithdrawalRequestModal: React.FC<WithdrawalRequestModalProps> = ({ 
  isOpen, 
  onClose, 
  availableBalance 
}) => {
  const [formData, setFormData] = useState({
    amount: '',
    payment_method_id: '',
    admin_notes: '',
  });

  const createWithdrawal = useCreateWithdrawalRequest();
  const { data: paymentMethods } = usePaymentMethods();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount);
    
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amount > availableBalance) {
      toast.error('Amount cannot exceed available balance');
      return;
    }

    if (!formData.payment_method_id) {
      toast.error('Please select a payment method');
      return;
    }

    try {
      await createWithdrawal.mutateAsync({
        amount,
        payment_method_id: formData.payment_method_id,
        admin_notes: formData.admin_notes || undefined,
      });
      
      onClose();
      
      // Reset form
      setFormData({
        amount: '',
        payment_method_id: '',
        admin_notes: '',
      });
    } catch (error) {
      console.error('Error creating withdrawal request:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request Withdrawal</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="amount">Withdrawal Amount (৳)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="1"
              max={availableBalance}
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              placeholder="Enter amount"
              required
            />
            <p className="text-sm text-gray-600 mt-1">
              Available: ৳{availableBalance.toLocaleString()}
            </p>
          </div>

          <div>
            <Label htmlFor="payment_method">Payment Method</Label>
            {paymentMethods && paymentMethods.length > 0 ? (
              <Select 
                value={formData.payment_method_id} 
                onValueChange={(value) => handleInputChange('payment_method_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.id} value={method.id}>
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4" />
                        <span>
                          {method.provider} ({method.type})
                          {method.is_default && (
                            <span className="text-xs text-green-600 ml-1">(Default)</span>
                          )}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-center py-4 border border-dashed border-gray-300 rounded-lg">
                <CreditCard className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">No payment methods found</p>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Payment Method
                </Button>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="admin_notes">Notes (Optional)</Label>
            <Textarea
              id="admin_notes"
              value={formData.admin_notes}
              onChange={(e) => handleInputChange('admin_notes', e.target.value)}
              placeholder="Add any special instructions or notes..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createWithdrawal.isPending || !paymentMethods || paymentMethods.length === 0}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {createWithdrawal.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Requesting...
                </>
              ) : (
                'Request Withdrawal'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawalRequestModal;
