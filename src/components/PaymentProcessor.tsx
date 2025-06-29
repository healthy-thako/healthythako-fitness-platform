
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { usePaymentMethods, useAddPaymentMethod } from '@/hooks/usePaymentMethods';
import { useCreatePayment } from '@/hooks/useUddoktapayPayment';
import { toast } from 'sonner';
import { CreditCard, Smartphone, Building, Plus, Check, Shield } from 'lucide-react';

interface PaymentProcessorProps {
  amount: number;
  bookingId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Type interfaces for payment method details
interface CardDetails {
  cardNumber: string;
  expiryDate: string;
  holderName: string;
  last4: string;
}

interface MobileDetails {
  phoneNumber: string;
}

interface BankDetails {
  accountNumber: string;
  bankName: string;
}

const PaymentProcessor: React.FC<PaymentProcessorProps> = ({
  amount,
  bookingId,
  onSuccess,
  onCancel
}) => {
  const { user } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newMethodType, setNewMethodType] = useState<'card' | 'mobile' | 'bank'>('card');
  const [newMethodData, setNewMethodData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    holderName: '',
    mobileNumber: '',
    provider: '',
    bankAccount: '',
    bankName: ''
  });

  const { data: paymentMethods, isLoading: methodsLoading } = usePaymentMethods();
  const addPaymentMethod = useAddPaymentMethod();
  const createPayment = useCreatePayment();

  const paymentProviders = [
    { id: 'bkash', name: 'bKash', icon: '🟢' },
    { id: 'nagad', name: 'Nagad', icon: '🔴' },
    { id: 'rocket', name: 'Rocket', icon: '🟣' },
    { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
    { id: 'bank', name: 'Bank Transfer', icon: '🏦' }
  ];

  const handleAddPaymentMethod = async () => {
    if (!user) return;

    try {
      const methodData: any = {
        type: newMethodType,
        details: {}
      };

      switch (newMethodType) {
        case 'card':
          if (!newMethodData.cardNumber || !newMethodData.expiryDate || !newMethodData.cvv) {
            toast.error('Please fill in all card details');
            return;
          }
          methodData.details = {
            cardNumber: newMethodData.cardNumber.replace(/\s/g, ''),
            expiryDate: newMethodData.expiryDate,
            holderName: newMethodData.holderName,
            last4: newMethodData.cardNumber.slice(-4)
          };
          methodData.provider = 'card';
          break;

        case 'mobile':
          if (!newMethodData.mobileNumber || !newMethodData.provider) {
            toast.error('Please fill in mobile payment details');
            return;
          }
          methodData.details = {
            phoneNumber: newMethodData.mobileNumber
          };
          methodData.provider = newMethodData.provider;
          break;

        case 'bank':
          if (!newMethodData.bankAccount || !newMethodData.bankName) {
            toast.error('Please fill in bank details');
            return;
          }
          methodData.details = {
            accountNumber: newMethodData.bankAccount,
            bankName: newMethodData.bankName
          };
          methodData.provider = 'bank';
          break;
      }

      await addPaymentMethod.mutateAsync(methodData);
      setShowAddMethod(false);
      setNewMethodData({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        holderName: '',
        mobileNumber: '',
        provider: '',
        bankAccount: '',
        bankName: ''
      });
      toast.success('Payment method added successfully');
    } catch (error: any) {
      toast.error('Failed to add payment method: ' + error.message);
    }
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast.error('Please select a payment method');
      return;
    }

    setIsProcessing(true);
    try {
      await createPayment.mutateAsync({
        amount: amount * 100, // Convert to paisa
        booking_id: bookingId,
        // URLs will be dynamically resolved in the hook
      });

      onSuccess?.();
    } catch (error: any) {
      toast.error('Payment failed: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPaymentMethodForm = () => {
    switch (newMethodType) {
      case 'card':
        return (
          <div className="space-y-4">
            <div>
              <Label>Card Number</Label>
              <Input
                placeholder="1234 5678 9012 3456"
                value={newMethodData.cardNumber}
                onChange={(e) => {
                  let value = e.target.value.replace(/\s/g, '');
                  value = value.replace(/(.{4})/g, '$1 ').trim();
                  setNewMethodData(prev => ({ ...prev, cardNumber: value }));
                }}
                maxLength={19}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Expiry Date</Label>
                <Input
                  placeholder="MM/YY"
                  value={newMethodData.expiryDate}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length >= 2) {
                      value = value.slice(0, 2) + '/' + value.slice(2, 4);
                    }
                    setNewMethodData(prev => ({ ...prev, expiryDate: value }));
                  }}
                  maxLength={5}
                />
              </div>
              <div>
                <Label>CVV</Label>
                <Input
                  placeholder="123"
                  value={newMethodData.cvv}
                  onChange={(e) => setNewMethodData(prev => ({ 
                    ...prev, 
                    cvv: e.target.value.replace(/\D/g, '').slice(0, 4) 
                  }))}
                  maxLength={4}
                />
              </div>
            </div>
            <div>
              <Label>Cardholder Name</Label>
              <Input
                placeholder="John Doe"
                value={newMethodData.holderName}
                onChange={(e) => setNewMethodData(prev => ({ ...prev, holderName: e.target.value }))}
              />
            </div>
          </div>
        );

      case 'mobile':
        return (
          <div className="space-y-4">
            <div>
              <Label>Mobile Payment Provider</Label>
              <Select 
                value={newMethodData.provider} 
                onValueChange={(value) => setNewMethodData(prev => ({ ...prev, provider: value }))}
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
              <Label>Mobile Number</Label>
              <Input
                placeholder="01XXXXXXXXX"
                value={newMethodData.mobileNumber}
                onChange={(e) => setNewMethodData(prev => ({ 
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
              <Label>Bank Name</Label>
              <Input
                placeholder="Bank Name"
                value={newMethodData.bankName}
                onChange={(e) => setNewMethodData(prev => ({ ...prev, bankName: e.target.value }))}
              />
            </div>
            <div>
              <Label>Account Number</Label>
              <Input
                placeholder="Account Number"
                value={newMethodData.bankAccount}
                onChange={(e) => setNewMethodData(prev => ({ 
                  ...prev, 
                  bankAccount: e.target.value.replace(/\D/g, '') 
                }))}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Helper function to safely get payment method display text
  const getPaymentMethodDisplayText = (method: any) => {
    const details = method.details as any;
    
    if (method.type === 'card') {
      const cardDetails = details as CardDetails;
      return `****${cardDetails?.last4 || '****'}`;
    } else if (method.type === 'mobile') {
      const mobileDetails = details as MobileDetails;
      return mobileDetails?.phoneNumber || 'N/A';
    } else if (method.type === 'bank') {
      const bankDetails = details as BankDetails;
      return bankDetails?.bankName || 'N/A';
    }
    return 'N/A';
  };

  return (
    <div className="space-y-6">
      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Payment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Total Amount:</span>
            <span className="text-2xl text-green-600">৳{amount.toLocaleString()}</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Secure payment powered by UddoktaPay
          </p>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Payment Method</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddMethod(!showAddMethod)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Method
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {methodsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {paymentMethods?.map((method) => (
                <div
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedMethod === method.id 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {method.type === 'card' && <CreditCard className="h-5 w-5" />}
                      {method.type === 'mobile' && <Smartphone className="h-5 w-5" />}
                      {method.type === 'bank' && <Building className="h-5 w-5" />}
                      <div>
                        <p className="font-medium capitalize">{method.provider}</p>
                        <p className="text-sm text-gray-600">
                          {getPaymentMethodDisplayText(method)}
                        </p>
                      </div>
                    </div>
                    {selectedMethod === method.id && (
                      <Check className="h-5 w-5 text-purple-600" />
                    )}
                    {method.is_default && (
                      <Badge variant="secondary">Default</Badge>
                    )}
                  </div>
                </div>
              ))}

              {paymentMethods?.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No payment methods added yet</p>
                </div>
              )}
            </div>
          )}

          {/* Add Payment Method Form */}
          {showAddMethod && (
            <div className="mt-6 p-4 border rounded-lg bg-gray-50">
              <h4 className="font-medium mb-4">Add New Payment Method</h4>
              
              <div className="mb-4">
                <Label>Payment Type</Label>
                <Select 
                  value={newMethodType} 
                  onValueChange={(value: any) => setNewMethodType(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                    <SelectItem value="mobile">Mobile Payment</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {renderPaymentMethodForm()}

              <div className="flex gap-2 mt-4">
                <Button onClick={handleAddPaymentMethod} disabled={addPaymentMethod.isPending}>
                  {addPaymentMethod.isPending ? 'Adding...' : 'Add Method'}
                </Button>
                <Button variant="outline" onClick={() => setShowAddMethod(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Actions */}
      <div className="flex gap-4">
        <Button
          onClick={handlePayment}
          disabled={!selectedMethod || isProcessing}
          className="flex-1 h-12 text-lg"
        >
          {isProcessing ? 'Processing...' : `Pay ৳${amount.toLocaleString()}`}
        </Button>
        <Button variant="outline" onClick={onCancel} className="h-12">
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default PaymentProcessor;
