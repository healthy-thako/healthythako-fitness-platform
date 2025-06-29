
import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTrainerEarnings } from '@/hooks/useTrainerEarnings';
import { DollarSign, CreditCard, Clock, TrendingUp } from 'lucide-react';

const TrainerEarnings = () => {
  const { data: earnings, isLoading } = useTrainerEarnings();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-3">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50">
      <div className="bg-white border-b px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <SidebarTrigger />
          <div>
            <h1 className="text-base sm:text-lg font-bold text-gray-900">Earnings</h1>
            <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Track your income and manage withdrawals</p>
          </div>
        </div>
      </div>

      <div className="p-2 sm:p-3 space-y-2 sm:space-y-3">
        {/* Summary Cards */}
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
                ৳{earnings?.totalEarnings.toLocaleString() || 0}
              </div>
              <p className="text-xs text-green-600 mt-1">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex items-center">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-base sm:text-xl font-bold text-gray-900">
                ৳{earnings?.thisMonthEarnings.toLocaleString() || 0}
              </div>
              <p className="text-xs text-gray-600 mt-1">Current month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex items-center">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-base sm:text-xl font-bold text-gray-900">
                ৳{earnings?.pendingEarnings.toLocaleString() || 0}
              </div>
              <p className="text-xs text-yellow-600 mt-1">Processing</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card>
          <CardHeader className="pb-1 sm:pb-2">
            <CardTitle className="text-sm">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <Button className="bg-pink-600 hover:bg-pink-700 text-xs sm:text-sm" size="sm">
                <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Request Withdrawal
              </Button>
              <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                View Payment History
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader className="pb-1 sm:pb-2">
            <CardTitle className="text-sm">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {earnings?.transactions.slice(0, 10).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">৳{transaction.net_amount}</p>
                    <p className="text-xs text-gray-600">
                      {new Date(transaction.transaction_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      transaction.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </div>
                </div>
              ))}
              
              {(!earnings?.transactions || earnings.transactions.length === 0) && (
                <div className="text-center py-4 sm:py-6">
                  <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mx-auto mb-2 sm:mb-3" />
                  <p className="text-gray-600 text-xs sm:text-sm">No transactions yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrainerEarnings;
