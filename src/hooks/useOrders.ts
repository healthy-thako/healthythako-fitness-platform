
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useEffect } from 'react';

export const useTrainerOrders = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Set up real-time subscription for orders
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('trainer-orders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trainer_bookings',
          filter: `trainer_user_id=eq.${user.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['trainer-orders'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  return useQuery({
    queryKey: ['trainer-orders', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');

      const { data, error } = await supabase
        .from('trainer_bookings')
        .select(`
          *,
          client:users!trainer_bookings_user_id_fkey(full_name, email, phone_number),
          payment_transactions(*)
        `)
        .eq('trainer_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      orderId, 
      status, 
      notes,
      deliveryNotes
    }: { 
      orderId: string; 
      status: string; 
      notes?: string;
      deliveryNotes?: string;
    }) => {
      if (!user) throw new Error('No user authenticated');

      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      };
      
      if (notes) {
        const { data: existingBooking } = await supabase
          .from('bookings')
          .select('notes')
          .eq('id', orderId)
          .single();
          
        updateData.notes = existingBooking?.notes 
          ? `${existingBooking.notes}\n\n[${new Date().toLocaleString()}] ${notes}`
          : `[${new Date().toLocaleString()}] ${notes}`;
      }

      // Add delivery notes to the main notes if provided
      if (deliveryNotes && status === 'completed') {
        const deliveryNote = `[${new Date().toLocaleString()}] Delivery Notes: ${deliveryNotes}`;
        updateData.notes = updateData.notes 
          ? `${updateData.notes}\n\n${deliveryNote}`
          : deliveryNote;
      }

      const { data, error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', orderId)
        .eq('trainer_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-orders'] });
      toast.success('Order status updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update order status: ' + error.message);
    }
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      bookingId,
      amount,
      paymentMethod
    }: {
      bookingId: string;
      amount: number;
      paymentMethod: string;
    }) => {
      if (!user) throw new Error('No user authenticated');

      const commission = amount * 0.1; // 10% commission
      const netAmount = amount - commission;

      // Get trainer from booking first
      const { data: booking, error: bookingError } = await supabase
        .from('trainer_bookings')
        .select('trainer_id')
        .eq('id', bookingId)
        .single();

      if (bookingError) throw bookingError;

      const { data, error } = await supabase
        .from('payment_transactions')
        .insert({
          user_id: user.id,
          trainer_id: booking.trainer_id,
          amount: amount,
          transaction_type: 'booking_payment',
          payment_method: paymentMethod,
          status: 'completed'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-orders'] });
      queryClient.invalidateQueries({ queryKey: ['trainer-earnings'] });
      toast.success('Transaction created successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to create transaction: ' + error.message);
    }
  });
};

export const useClientOrders = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['client-orders', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          trainer:profiles!bookings_trainer_id_fkey(name, email, phone),
          transaction:transactions(*)
        `)
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });
};

// Simplified delivery tracking using booking notes
export const useOrderDeliveries = (orderId: string) => {
  return useQuery({
    queryKey: ['order-deliveries', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('notes, status, updated_at')
        .eq('id', orderId)
        .single();

      if (error) throw error;
      
      // Parse delivery information from notes
      const deliveries = [];
      if (data.notes) {
        const deliveryMatches = data.notes.match(/\[.*?\] Delivery Notes: .*$/gm);
        if (deliveryMatches) {
          deliveries.push(...deliveryMatches.map(match => ({
            id: Math.random().toString(),
            booking_id: orderId,
            delivery_notes: match.replace(/\[.*?\] Delivery Notes: /, ''),
            delivered_at: data.updated_at
          })));
        }
      }
      
      return deliveries;
    },
    enabled: !!orderId
  });
};
