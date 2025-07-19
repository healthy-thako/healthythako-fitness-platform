import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface TrainerEarningsData {
  id: string;
  trainer_id: string;
  booking_id?: string;
  gig_order_id?: string;
  amount: number;
  commission_rate: number;
  commission_amount: number;
  net_amount: number;
  payment_status: 'pending' | 'paid' | 'failed' | 'cancelled';
  payment_date?: string;
  payment_method?: string;
  transaction_id?: string;
  created_at: string;
  updated_at: string;
}

export interface EarningsSummary {
  total_earnings: number;
  pending_earnings: number;
  paid_earnings: number;
  total_bookings: number;
  total_gig_orders: number;
  average_commission_rate: number;
  current_month_earnings: number;
  last_month_earnings: number;
}

// Hook to get trainer's earnings
export const useTrainerEarnings = (filters?: { 
  status?: string; 
  date_range?: string; 
  payment_status?: string; 
}) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['trainer-earnings', user?.id, filters],
    queryFn: async () => {
      if (!user) throw new Error('No user authenticated');

      // Get trainer ID first
      const { data: trainer } = await supabase
        .from('trainers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!trainer) throw new Error('Trainer profile not found');

      let query = supabase
        .from('trainer_earnings')
        .select(`
          *,
          booking:trainer_bookings(
            id,
            session_type,
            session_date,
            total_amount,
            user:users!trainer_bookings_user_id_fkey(full_name, email)
          ),
          gig_order:gig_orders(
            id,
            order_type,
            total_amount,
            user:users!gig_orders_user_id_fkey(full_name, email)
          )
        `)
        .eq('trainer_id', trainer.id)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.payment_status) {
        query = query.eq('payment_status', filters.payment_status);
      }

      if (filters?.date_range) {
        const today = new Date();
        let startDate = new Date();
        
        switch (filters.date_range) {
          case 'today':
            startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            break;
          case 'week':
            startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            break;
          case 'year':
            startDate = new Date(today.getFullYear(), 0, 1);
            break;
        }
        
        query = query.gte('created_at', startDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as TrainerEarningsData[];
    },
    enabled: !!user
  });
};

// Hook to get trainer earnings summary
export const useTrainerEarningsSummary = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['trainer-earnings-summary', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user authenticated');

      // Get trainer ID first
      const { data: trainer } = await supabase
        .from('trainers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!trainer) throw new Error('Trainer profile not found');

      // Get all earnings data
      const { data: earnings, error } = await supabase
        .from('trainer_earnings')
        .select('*')
        .eq('trainer_id', trainer.id);

      if (error) throw error;

      // Calculate summary
      const now = new Date();
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const summary: EarningsSummary = {
        total_earnings: earnings?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0,
        pending_earnings: earnings?.filter(e => e.payment_status === 'pending').reduce((sum, e) => sum + (e.net_amount || 0), 0) || 0,
        paid_earnings: earnings?.filter(e => e.payment_status === 'paid').reduce((sum, e) => sum + (e.net_amount || 0), 0) || 0,
        total_bookings: earnings?.filter(e => e.booking_id).length || 0,
        total_gig_orders: earnings?.filter(e => e.gig_order_id).length || 0,
        average_commission_rate: earnings?.length ? earnings.reduce((sum, e) => sum + (e.commission_rate || 0), 0) / earnings.length : 0,
        current_month_earnings: earnings?.filter(e => {
          const earningDate = new Date(e.created_at);
          return earningDate >= currentMonth && earningDate < nextMonth;
        }).reduce((sum, e) => sum + (e.net_amount || 0), 0) || 0,
        last_month_earnings: earnings?.filter(e => {
          const earningDate = new Date(e.created_at);
          return earningDate >= lastMonth && earningDate < currentMonth;
        }).reduce((sum, e) => sum + (e.net_amount || 0), 0) || 0
      };

      return summary;
    },
    enabled: !!user
  });
};

// Hook to create earnings record (usually called by system)
export const useCreateEarningsRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (earningsData: Omit<TrainerEarningsData, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('trainer_earnings')
        .insert(earningsData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-earnings'] });
      queryClient.invalidateQueries({ queryKey: ['trainer-earnings-summary'] });
    }
  });
};

// Hook to update earnings payment status
export const useUpdateEarningsPaymentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      earningsId, 
      paymentStatus, 
      paymentDate, 
      paymentMethod, 
      transactionId 
    }: { 
      earningsId: string; 
      paymentStatus: string; 
      paymentDate?: string; 
      paymentMethod?: string; 
      transactionId?: string; 
    }) => {
      const updateData: any = {
        payment_status: paymentStatus,
        updated_at: new Date().toISOString()
      };

      if (paymentDate) updateData.payment_date = paymentDate;
      if (paymentMethod) updateData.payment_method = paymentMethod;
      if (transactionId) updateData.transaction_id = transactionId;

      const { data, error } = await supabase
        .from('trainer_earnings')
        .update(updateData)
        .eq('id', earningsId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-earnings'] });
      queryClient.invalidateQueries({ queryKey: ['trainer-earnings-summary'] });
      toast.success('Payment status updated successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to update payment status: ' + error.message);
    }
  });
};

// Hook to get earnings by date range
export const useEarningsByDateRange = (startDate: string, endDate: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['earnings-by-date-range', user?.id, startDate, endDate],
    queryFn: async () => {
      if (!user) throw new Error('No user authenticated');

      // Get trainer ID first
      const { data: trainer } = await supabase
        .from('trainers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!trainer) throw new Error('Trainer profile not found');

      const { data, error } = await supabase
        .from('trainer_earnings')
        .select('*')
        .eq('trainer_id', trainer.id)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TrainerEarningsData[];
    },
    enabled: !!user && !!startDate && !!endDate
  });
};

// Hook to get monthly earnings chart data
export const useMonthlyEarningsChart = (year: number) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['monthly-earnings-chart', user?.id, year],
    queryFn: async () => {
      if (!user) throw new Error('No user authenticated');

      // Get trainer ID first
      const { data: trainer } = await supabase
        .from('trainers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!trainer) throw new Error('Trainer profile not found');

      const startDate = new Date(year, 0, 1).toISOString();
      const endDate = new Date(year + 1, 0, 1).toISOString();

      const { data, error } = await supabase
        .from('trainer_earnings')
        .select('net_amount, created_at, payment_status')
        .eq('trainer_id', trainer.id)
        .gte('created_at', startDate)
        .lt('created_at', endDate);

      if (error) throw error;

      // Group by month
      const monthlyData = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        monthName: new Date(year, i, 1).toLocaleString('default', { month: 'long' }),
        total: 0,
        paid: 0,
        pending: 0
      }));

      data?.forEach(earning => {
        const month = new Date(earning.created_at).getMonth();
        monthlyData[month].total += earning.net_amount || 0;
        
        if (earning.payment_status === 'paid') {
          monthlyData[month].paid += earning.net_amount || 0;
        } else if (earning.payment_status === 'pending') {
          monthlyData[month].pending += earning.net_amount || 0;
        }
      });

      return monthlyData;
    },
    enabled: !!user && !!year
  });
};
