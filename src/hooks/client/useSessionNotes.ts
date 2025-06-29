import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';

export type SessionNotes = Tables<'session_notes'>;

export const useSessionNotes = (bookingId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['session-notes', bookingId],
    queryFn: async () => {
      if (!user || !bookingId) throw new Error('No user or booking ID');

      const { data, error } = await supabase
        .from('session_notes')
        .select('*')
        .eq('booking_id', bookingId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
      return data;
    },
    enabled: !!user && !!bookingId
  });
};

export const useClientSessionNotes = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['client-session-notes', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');

      const { data, error } = await supabase
        .from('session_notes')
        .select(`
          *,
          booking:bookings(
            id, title, scheduled_date, scheduled_time,
            trainer:profiles!bookings_trainer_id_fkey(name)
          )
        `)
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });
};

export const useCreateSessionNotes = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (notesData: {
      booking_id: string;
      trainer_id: string;
      client_notes?: string;
      trainer_notes?: string;
      session_rating?: number;
    }) => {
      if (!user) throw new Error('No user authenticated');

      const { data, error } = await supabase
        .from('session_notes')
        .insert({
          client_id: user.id,
          ...notesData
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session-notes'] });
      queryClient.invalidateQueries({ queryKey: ['client-session-notes'] });
      toast.success('Session notes saved successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to save session notes: ' + error.message);
    }
  });
};

export const useUpdateSessionNotes = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      notesId, 
      updates 
    }: { 
      notesId: string; 
      updates: {
        client_notes?: string;
        trainer_notes?: string;
        session_rating?: number;
      };
    }) => {
      if (!user) throw new Error('No user authenticated');

      const { data, error } = await supabase
        .from('session_notes')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', notesId)
        .eq('client_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session-notes'] });
      queryClient.invalidateQueries({ queryKey: ['client-session-notes'] });
      toast.success('Session notes updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update session notes: ' + error.message);
    }
  });
}; 