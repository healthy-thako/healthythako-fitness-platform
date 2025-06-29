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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAddPaymentMethod } from '@/hooks/usePaymentMethods';
import { CreditCard, Smartphone, Building } from 'lucide-react';

interface AddPaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddPaymentMethodModal: React.FC<AddPaymentMethodModalProps> = ({
  isOpen,
  onClose
}) => {
  const [methodType, setMethodType] = useState<'card' | 'mobile' | 'bank'>('card');
  const [isDefault, setIsDefault] = useState(false);
  const [formData, setFormData] = useState({
    // Card fields
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    // Mobile fields
    mobileNumber: '',
    mobileProvider: '',
    // Bank fields
    accountNumber: '',
    bankName: '',
    accountHolderName: ''
  });

  const addPaymentMethod = useAddPaymentMethod();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let details: any = {};
    let provider = '';
    let dbType: 'bank_account' | 'mobile_wallet' | 'paypal';

    switch (methodType) {
      case 'card':
        if (!formData.cardNumber || !formData.expiryDate || !formData.cvv) {
          return;
        }
        details = {
          account_number: formData.cardNumber.slice(-4),
          account_name: formData.cardholderName,
          expiry_month: formData.expiryDate.split('/')[0],
          expiry_year: formData.expiryDate.split('/')[1]
        };
        provider = 'visa'; // Default to visa, could be dynamic
        dbType = 'bank_account'; // Treating cards as bank accounts for now
        break;
      case 'mobile':
        if (!formData.mobileNumber || !formData.mobileProvider) {
          return;
        }
        details = {
          wallet_number: formData.mobileNumber
        };
        provider = formData.mobileProvider;
        dbType = 'mobile_wallet';
        break;
      case 'bank':
        if (!formData.accountNumber || !formData.bankName) {
          return;
        }
        details = {
          account_number: formData.accountNumber,
          account_name: formData.accountHolderName,
          bank_name: formData.bankName
        };
        provider = formData.bankName;
        dbType = 'bank_account';
        break;
    }

    try {
      await addPaymentMethod.mutateAsync({
        type: dbType,
        provider,
        details,
        is_default: isDefault
      });
      onClose();
      resetForm();
    } catch (error) {
      console.error('Failed to add payment method:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: '',
      mobileNumber: '',
      mobileProvider: '',
      accountNumber: '',
      bankName: '',
      accountHolderName: ''
    });
    setIsDefault(false);
    setMethodType('card');
  };

  const renderForm = () => {
    switch (methodType) {
      case 'card':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={formData.cardNumber}
                onChange={(e) => {
                  let value = e.target.value.replace(/\s/g, '');
                  value = value.replace(/(.{4})/g, '$1 ').trim();
                  setFormData(prev => ({ ...prev, cardNumber: value }));
                }}
                maxLength={19}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  placeholder="MM/YY"
                  value={formData.expiryDate}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length >= 2) {
                      value = value.slice(0, 2) + '/' + value.slice(2, 4);
                    }
                    setFormData(prev => ({ ...prev, expiryDate: value }));
                  }}
                  maxLength={5}
                />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={formData.cvv}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    cvv: e.target.value.replace(/\D/g, '').slice(0, 4) 
                  }))}
                  maxLength={4}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="cardholderName">Cardholder Name</Label>
              <Input
                id="cardholderName"
                placeholder="John Doe"
                value={formData.cardholderName}
                onChange={(e) => setFormData(prev => ({ ...prev, cardholderName: e.target.value }))}
              />
            </div>
          </div>
        );
      case 'mobile':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="mobileProvider">Mobile Payment Provider</Label>
              <Select 
                value={formData.mobileProvider} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, mobileProvider: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bkash">bKash</SelectItem>
                  <SelectItem value="nagad">Nagad</SelectItem>
                  <SelectItem value="rocket">Rocket</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="mobileNumber">Mobile Number</Label>
              <Input
                id="mobileNumber"
                placeholder="01XXXXXXXXX"
                value={formData.mobileNumber}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  mobileNumber: e.target.value.replace(/\D/g, '').slice(0, 11) 
                }))}
              />
            </div>
          </div>
        );
      case 'bank':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                placeholder="Bank Name"
                value={formData.bankName}
                onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                placeholder="Account Number"
                value={formData.accountNumber}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  accountNumber: e.target.value.replace(/\D/g, '') 
                }))}
              />
            </div>
            <div>
              <Label htmlFor="accountHolderName">Account Holder Name</Label>
              <Input
                id="accountHolderName"
                placeholder="Account Holder Name"
                value={formData.accountHolderName}
                onChange={(e) => setFormData(prev => ({ ...prev, accountHolderName: e.target.value }))}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Payment Method</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>Payment Type</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <Button
                type="button"
                variant={methodType === 'card' ? 'default' : 'outline'}
                onClick={() => setMethodType('card')}
                className="flex flex-col items-center p-4 h-auto"
              >
                <CreditCard className="h-5 w-5 mb-1" />
                <span className="text-xs">Card</span>
              </Button>
              <Button
                type="button"
                variant={methodType === 'mobile' ? 'default' : 'outline'}
                onClick={() => setMethodType('mobile')}
                className="flex flex-col items-center p-4 h-auto"
              >
                <Smartphone className="h-5 w-5 mb-1" />
                <span className="text-xs">Mobile</span>
              </Button>
              <Button
                type="button"
                variant={methodType === 'bank' ? 'default' : 'outline'}
                onClick={() => setMethodType('bank')}
                className="flex flex-col items-center p-4 h-auto"
              >
                <Building className="h-5 w-5 mb-1" />
                <span className="text-xs">Bank</span>
              </Button>
            </div>
          </div>

          {renderForm()}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isDefault"
              checked={isDefault}
              onCheckedChange={(checked) => setIsDefault(checked as boolean)}
            />
            <Label htmlFor="isDefault" className="text-sm">
              Set as default payment method
            </Label>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={addPaymentMethod.isPending}
              className="flex-1"
            >
              {addPaymentMethod.isPending ? 'Adding...' : 'Add Method'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPaymentMethodModal;
