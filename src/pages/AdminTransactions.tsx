
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAdminTransactions, useUpdateTransactionStatus, useTransactionStats } from '@/hooks/useAdminTransactions';
import { useToast } from '@/hooks/use-toast';
import { Search, DollarSign, TrendingUp, Clock, User, Calendar, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const AdminTransactions = () => {
  const [filters, setFilters] = useState({ status: 'all', date_range: 'all' });
  const { data: transactions, isLoading, error } = useAdminTransactions({
    status: filters.status === 'all' ? undefined : filters.status,
    date_range: filters.date_range === 'all' ? undefined : filters.date_range
  });
  const { data: stats } = useTransactionStats();
  const updateStatus = useUpdateTransactionStatus();
  const { toast } = useToast();

  const handleStatusUpdate = async (transactionId: string, newStatus: 'pending' | 'completed' | 'withdrawn' | 'failed') => {
    try {
      await updateStatus.mutateAsync({ transactionId, status: newStatus });
      toast({
        title: 'Success',
        description: 'Transaction status updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update transaction status',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'withdrawn': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading transactions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>Error loading transactions: {error.message}</p>
        <p className="text-sm text-gray-500 mt-2">Please check the console for more details.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Transaction Management</h2>
        <p className="text-gray-600">Monitor payments and financial transactions</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              ৳{stats?.total_revenue?.toLocaleString() || 0}
            </div>
            <p className="text-sm text-gray-600">Total Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              ৳{stats?.total_commission?.toLocaleString() || 0}
            </div>
            <p className="text-sm text-gray-600">Platform Commission</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              ৳{stats?.pending_amount?.toLocaleString() || 0}
            </div>
            <p className="text-sm text-gray-600">Pending Amount</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              ৳{stats?.completed_amount?.toLocaleString() || 0}
            </div>
            <p className="text-sm text-gray-600">Completed Amount</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {stats?.total_transactions || 0}
            </div>
            <p className="text-sm text-gray-600">Total Transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="withdrawn">Withdrawn</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.date_range}
              onValueChange={(value) => setFilters({ ...filters, date_range: value })}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions ({transactions?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions?.map((transaction: any) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-lg">
                      {transaction.booking?.title || 'Payment Transaction'}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        <span>Trainer: {transaction.trainer?.name || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-3 w-3 mr-1" />
                        <span>Amount: ৳{Number(transaction.amount).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        <span>Commission: ৳{Number(transaction.commission).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(new Date(transaction.transaction_date), 'MMM dd, yyyy HH:mm')}
                      </div>
                      {transaction.payment_method && (
                        <Badge variant="outline">
                          {transaction.payment_method}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Net Amount: ৳{Number(transaction.net_amount).toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Select
                    value={transaction.status}
                    onValueChange={(value: 'pending' | 'completed' | 'withdrawn' | 'failed') => 
                      handleStatusUpdate(transaction.id, value)
                    }
                    disabled={updateStatus.isPending}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="withdrawn">Withdrawn</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
            {(!transactions || transactions.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                No transactions found matching your criteria
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTransactions;
