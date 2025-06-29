import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Plus, Calendar, DollarSign, CheckCircle, Clock, AlertCircle, RefreshCw, Trash2 } from 'lucide-react';
import { useClientTransactions, useClientPaymentMethods, useRefundRequests, useCreateBookingRefundRequest } from '@/hooks/useClientData';
import { usePaymentMethods, useCreatePaymentMethod, useDeletePaymentMethod } from '@/hooks/usePaymentMethods';
import { format } from 'date-fns';
import { toast } from 'sonner';

const ClientPayments = () => {
  const { data: transactions, isLoading } = useClientTransactions();
  const { data: paymentMethods } = useClientPaymentMethods();
  const { data: refundRequests } = useRefundRequests();
  const createPaymentMethod = useCreatePaymentMethod();
  const deletePaymentMethod = useDeletePaymentMethod();
  const createRefundRequest = useCreateBookingRefundRequest();

  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [paymentMethodForm, setPaymentMethodForm] = useState({
    type: 'card',
    provider: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    mobileNumber: '',
    accountNumber: '',
    bankName: '',
    isDefault: false
  });
  const [refundForm, setRefundForm] = useState({
    reason: '',
    amount: 0
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />;
      case 'pending': return <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />;
      case 'failed': return <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />;
      default: return <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddPaymentMethod = async () => {
    try {
      let details: any = {};
      let provider = paymentMethodForm.provider;

      switch (paymentMethodForm.type) {
        case 'card':
          details = {
            last4: paymentMethodForm.cardNumber.slice(-4),
            expiry_month: paymentMethodForm.expiryDate.split('/')[0],
            expiry_year: paymentMethodForm.expiryDate.split('/')[1],
            cardholder_name: paymentMethodForm.cardholderName
          };
          provider = 'card';
          break;
        case 'mobile_wallet':
          details = {
            phone_number: paymentMethodForm.mobileNumber
          };
          break;
        case 'bank_account':
          details = {
            account_number: paymentMethodForm.accountNumber.slice(-4),
            bank_name: paymentMethodForm.bankName
          };
          provider = paymentMethodForm.bankName;
          break;
      }

      await createPaymentMethod.mutateAsync({
        type: paymentMethodForm.type,
        provider,
        details,
        is_default: paymentMethodForm.isDefault
      });

      setShowAddPaymentModal(false);
      setPaymentMethodForm({
        type: 'card',
        provider: '',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: '',
        mobileNumber: '',
        accountNumber: '',
        bankName: '',
        isDefault: false
      });
    } catch (error) {
      console.error('Failed to add payment method:', error);
    }
  };

  const handleRequestRefund = async () => {
    if (!selectedBooking) return;

    try {
      await createRefundRequest.mutateAsync({
        bookingId: selectedBooking.id,
        amount: refundForm.amount,
        reason: refundForm.reason
      });

      setShowRefundModal(false);
      setSelectedBooking(null);
      setRefundForm({ reason: '', amount: 0 });
    } catch (error) {
      console.error('Failed to request refund:', error);
    }
  };

  const openRefundModal = (booking: any) => {
    setSelectedBooking(booking);
    setRefundForm({ reason: '', amount: booking.amount });
    setShowRefundModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
            <SidebarTrigger />
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Payments</h1>
              <p className="text-xs sm:text-base text-gray-600 hidden sm:block">Manage your payment methods and transaction history</p>
            </div>
          </div>
          <Dialog open={showAddPaymentModal} onOpenChange={setShowAddPaymentModal}>
            <DialogTrigger asChild>
              <Button className="mesh-gradient-overlay text-white text-xs sm:text-sm" size="sm">
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Add Payment Method</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Payment Method</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Payment Type</Label>
                  <Select 
                    value={paymentMethodForm.type} 
                    onValueChange={(value) => setPaymentMethodForm({ ...paymentMethodForm, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                      <SelectItem value="mobile_wallet">Mobile Wallet</SelectItem>
                      <SelectItem value="bank_account">Bank Account</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {paymentMethodForm.type === 'card' && (
                  <>
                    <div>
                      <Label>Card Number</Label>
                      <Input
                        value={paymentMethodForm.cardNumber}
                        onChange={(e) => setPaymentMethodForm({ ...paymentMethodForm, cardNumber: e.target.value })}
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Expiry Date</Label>
                        <Input
                          value={paymentMethodForm.expiryDate}
                          onChange={(e) => setPaymentMethodForm({ ...paymentMethodForm, expiryDate: e.target.value })}
                          placeholder="MM/YY"
                        />
                      </div>
                      <div>
                        <Label>CVV</Label>
                        <Input
                          value={paymentMethodForm.cvv}
                          onChange={(e) => setPaymentMethodForm({ ...paymentMethodForm, cvv: e.target.value })}
                          placeholder="123"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Cardholder Name</Label>
                      <Input
                        value={paymentMethodForm.cardholderName}
                        onChange={(e) => setPaymentMethodForm({ ...paymentMethodForm, cardholderName: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>
                  </>
                )}

                {paymentMethodForm.type === 'mobile_wallet' && (
                  <>
                    <div>
                      <Label>Provider</Label>
                      <Select 
                        value={paymentMethodForm.provider} 
                        onValueChange={(value) => setPaymentMethodForm({ ...paymentMethodForm, provider: value })}
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
                        value={paymentMethodForm.mobileNumber}
                        onChange={(e) => setPaymentMethodForm({ ...paymentMethodForm, mobileNumber: e.target.value })}
                        placeholder="+880 1234 567890"
                      />
                    </div>
                  </>
                )}

                {paymentMethodForm.type === 'bank_account' && (
                  <>
                    <div>
                      <Label>Bank Name</Label>
                      <Input
                        value={paymentMethodForm.bankName}
                        onChange={(e) => setPaymentMethodForm({ ...paymentMethodForm, bankName: e.target.value })}
                        placeholder="Bank Name"
                      />
                    </div>
                    <div>
                      <Label>Account Number</Label>
                      <Input
                        value={paymentMethodForm.accountNumber}
                        onChange={(e) => setPaymentMethodForm({ ...paymentMethodForm, accountNumber: e.target.value })}
                        placeholder="Account Number"
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-2">
                  <Button 
                    onClick={handleAddPaymentMethod} 
                    disabled={createPaymentMethod.isPending}
                    className="flex-1"
                  >
                    {createPaymentMethod.isPending ? 'Adding...' : 'Add Method'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddPaymentModal(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-6 max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Payment Methods */}
        <Card>
          <CardHeader className="p-3 sm:p-4">
            <CardTitle className="text-base sm:text-lg">Payment Methods</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            {paymentMethods && paymentMethods.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="border rounded-lg p-3 sm:p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-gray-600" />
                      <div>
                        <p className="font-medium text-sm sm:text-base capitalize">{method.provider}</p>
                        <p className="text-xs sm:text-sm text-gray-600 capitalize">{method.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {method.is_default && (
                        <Badge variant="outline" className="text-xs">Default</Badge>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deletePaymentMethod.mutate(method.id)}
                        disabled={deletePaymentMethod.isPending}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <CreditCard className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No payment methods</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">Add a payment method to book sessions easily</p>
                <Button 
                  className="mesh-gradient-overlay text-white text-sm"
                  onClick={() => setShowAddPaymentModal(true)}
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Add Payment Method
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Refund Requests */}
        {refundRequests && refundRequests.length > 0 && (
          <Card>
            <CardHeader className="p-3 sm:p-4">
              <CardTitle className="text-base sm:text-lg">Refund Requests</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="space-y-3">
                {refundRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="h-4 w-4 text-blue-500" />
                        <span className="font-medium text-sm">
                          {request.booking ? `Booking: ${request.booking.title}` : 
                           request.membership ? `Membership: ${request.membership.plan.name}` : 'Refund Request'}
                        </span>
                      </div>
                      <Badge className={getStatusColor(request.status || 'pending')}>
                        {request.status || 'pending'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Amount: ৳{request.amount}</p>
                    <p className="text-sm text-gray-600">Reason: {request.reason}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Requested on {format(new Date(request.created_at), 'MMM dd, yyyy')}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transaction History */}
        <Card>
          <CardHeader className="p-3 sm:p-4">
            <CardTitle className="text-base sm:text-lg">Transaction History</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
              </div>
            ) : transactions && transactions.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="border rounded-lg p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        {getStatusIcon(transaction.status)}
                        <div>
                          <p className="font-medium text-sm sm:text-base">{transaction.title}</p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {transaction.trainer?.name && `with ${transaction.trainer.name}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm sm:text-base">৳{transaction.amount}</p>
                                                 <Badge className={getStatusColor(transaction.status)}>
                           {transaction.status}
                         </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
                      <span>{format(new Date(transaction.created_at), 'MMM dd, yyyy')}</span>
                      {transaction.status === 'completed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openRefundModal(transaction)}
                          className="text-xs"
                        >
                          Request Refund
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <DollarSign className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
                <p className="text-sm sm:text-base text-gray-600">Your payment history will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Refund Request Modal */}
      <Dialog open={showRefundModal} onOpenChange={setShowRefundModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Refund</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Refund Amount</Label>
              <Input
                type="number"
                value={refundForm.amount}
                onChange={(e) => setRefundForm({ ...refundForm, amount: parseFloat(e.target.value) })}
                placeholder="Enter amount"
              />
            </div>
            <div>
              <Label>Reason for Refund</Label>
              <Textarea
                value={refundForm.reason}
                onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })}
                placeholder="Please explain why you're requesting a refund..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleRequestRefund} 
                disabled={createRefundRequest.isPending || !refundForm.reason.trim()}
                className="flex-1"
              >
                {createRefundRequest.isPending ? 'Submitting...' : 'Submit Request'}
              </Button>
              <Button variant="outline" onClick={() => setShowRefundModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientPayments;
