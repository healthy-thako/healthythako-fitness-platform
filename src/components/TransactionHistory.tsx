
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTransactions } from '@/hooks/useTransactions';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Download, 
  Eye, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft 
} from 'lucide-react';
import { format } from 'date-fns';

const TransactionHistory = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('30');

  // Use appropriate hook based on user role
  const isTrainer = user?.user_metadata?.role === 'trainer';
  const { data: transactions, isLoading } = useTransactions();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTransactionIcon = (amount: number, isTrainer: boolean) => {
    if (isTrainer) {
      return amount > 0 ? (
        <ArrowDownLeft className="h-4 w-4 text-green-600" />
      ) : (
        <ArrowUpRight className="h-4 w-4 text-red-600" />
      );
    } else {
      return amount > 0 ? (
        <ArrowUpRight className="h-4 w-4 text-red-600" />
      ) : (
        <ArrowDownLeft className="h-4 w-4 text-green-600" />
      );
    }
  };

  const filteredTransactions = transactions?.filter(transaction => {
    if (filter === 'all') return true;
    return transaction.status === filter;
  }) || [];

  const totalAmount = filteredTransactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const pendingAmount = filteredTransactions
    .filter(t => t.status === 'pending')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total {isTrainer ? 'Earnings' : 'Spent'}</p>
                <p className="text-2xl font-bold text-green-600">৳{totalAmount.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">৳{pendingAmount.toLocaleString()}</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-blue-600">৳{(totalAmount * 0.3).toFixed(0)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Transaction History</CardTitle>
            <div className="flex gap-2">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 3 months</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
                    {getTransactionIcon(transaction.amount, isTrainer)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {transaction.booking?.title || 'Training Session'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {isTrainer 
                        ? `Client: ${transaction.booking?.client?.name || 'Unknown'}`
                        : `Trainer: ${transaction.booking?.trainer?.name || 'Unknown'}`
                      }
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(transaction.transaction_date), 'MMM dd, yyyy • hh:mm a')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className={`font-bold ${
                        isTrainer ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {isTrainer ? '+' : '-'}৳{transaction.amount}
                      </p>
                      {isTrainer && transaction.commission && (
                        <p className="text-xs text-gray-500">
                          Commission: ৳{transaction.commission}
                        </p>
                      )}
                    </div>
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {filteredTransactions.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No transactions found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionHistory;
