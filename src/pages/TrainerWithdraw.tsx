
import React, { useState } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTrainerWithdrawals, useAvailableBalance } from '@/hooks/useWithdrawals';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import WithdrawalRequestModal from '@/components/WithdrawalRequestModal';
import { DollarSign, CreditCard, Clock, CheckCircle, XCircle, Plus } from 'lucide-react';

const TrainerWithdraw = () => {
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const { data: withdrawals, isLoading: withdrawalsLoading } = useTrainerWithdrawals();
  const { data: balanceData, isLoading: balanceLoading } = useAvailableBalance();
  const { data: paymentMethods } = usePaymentMethods();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'processed':
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-3 w-3 text-red-600" />;
      default:
        return <Clock className="h-3 w-3 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'processed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (withdrawalsLoading || balanceLoading) {
    return (
      <div className="flex items-center justify-center p-3">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50">
      <div className="bg-white border-b px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <SidebarTrigger />
            <div>
              <h1 className="text-base sm:text-lg font-bold text-gray-900">Withdraw Earnings</h1>
              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Request withdrawals and manage your earnings</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowWithdrawalModal(true)}
            className="bg-pink-600 hover:bg-pink-700"
            size="sm"
            disabled={!balanceData?.availableBalance || balanceData.availableBalance <= 0}
          >
            <Plus className="h-3 w-3 mr-1" />
            <span className="hidden sm:inline">Request Withdrawal</span>
            <span className="sm:hidden">Request</span>
          </Button>
        </div>
      </div>

      <div className="p-2 sm:p-3 space-y-2 sm:space-y-3">
        {/* Balance Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          <Card>
            <CardHeader className="pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex items-center">
                <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Total Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-base sm:text-xl font-bold text-gray-900">
                ৳{balanceData?.totalEarnings.toLocaleString() || 0}
              </div>
              <p className="text-xs text-gray-600 mt-1">All time earnings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex items-center">
                <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Available Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-base sm:text-xl font-bold text-green-600">
                ৳{balanceData?.availableBalance.toLocaleString() || 0}
              </div>
              <p className="text-xs text-gray-600 mt-1">Ready to withdraw</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex items-center">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Total Withdrawn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-base sm:text-xl font-bold text-gray-900">
                ৳{balanceData?.totalWithdrawn.toLocaleString() || 0}
              </div>
              <p className="text-xs text-gray-600 mt-1">Already withdrawn</p>
            </CardContent>
          </Card>
        </div>

        {/* Withdrawal History */}
        <Card>
          <CardHeader className="pb-1 sm:pb-2">
            <CardTitle className="text-sm">Withdrawal History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {withdrawals && withdrawals.length > 0 ? (
                withdrawals.map((withdrawal) => (
                  <div key={withdrawal.id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      {getStatusIcon(withdrawal.status)}
                      <div>
                        <p className="font-medium text-sm">৳{withdrawal.amount.toLocaleString()}</p>
                        <p className="text-xs text-gray-600">
                          {new Date(withdrawal.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(withdrawal.status)} variant="secondary">
                        {withdrawal.status}
                      </Badge>
                      {withdrawal.payment_method && (
                        <p className="text-xs text-gray-600 mt-1">
                          {withdrawal.payment_method.provider} ({withdrawal.payment_method.type})
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 sm:py-6">
                  <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-sm font-medium text-gray-900 mb-2">No withdrawals yet</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Your withdrawal requests will appear here</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <WithdrawalRequestModal
          isOpen={showWithdrawalModal}
          onClose={() => setShowWithdrawalModal(false)}
          availableBalance={balanceData?.availableBalance || 0}
        />
      </div>
    </div>
  );
};

export default TrainerWithdraw;
