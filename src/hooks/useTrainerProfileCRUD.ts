
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useTrainerProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['trainer-profile', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');

      // Get both user profile and trainer profile from new schema
      const [userResult, trainerResult] = await Promise.all([
        supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single(),
        supabase
          .from('trainers')
          .select('*')
          .eq('user_id', user.id)
          .single()
      ]);

      if (userResult.error && userResult.error.code !== 'PGRST116') {
        throw userResult.error;
      }

      if (trainerResult.error && trainerResult.error.code !== 'PGRST116') {
        throw trainerResult.error;
      }

      return {
        profile: userResult.data,
        trainerProfile: trainerResult.data
      };
    },
    enabled: !!user
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (updates: {
      name?: string;
      phone?: string;
      location?: string;
      gender?: string;
      date_of_birth?: string;
    }) => {
      if (!user) throw new Error('No user authenticated');

      // Map old field names to new schema
      const mappedUpdates: any = {
        updated_at: new Date().toISOString()
      };

      if (updates.name) mappedUpdates.full_name = updates.name;
      if (updates.phone) mappedUpdates.phone_number = updates.phone;
      // Note: location, gender, date_of_birth might need to go to user_profiles table

      const { data, error } = await supabase
        .from('users')
        .update(mappedUpdates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-profile'] });
      toast.success('Profile updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update profile: ' + error.message);
    }
  });
};

export const useUpdateTrainerProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (updates: {
      bio?: string;
      experience_years?: number;
      rate_per_hour?: number;
      specializations?: string[];
      languages?: string[];
      certifications?: any[];
      services?: any[];
      profile_image?: string;
      availability?: any;
    }) => {
      if (!user) throw new Error('No user authenticated');

      // Map old field names to new schema
      const mappedUpdates: any = {
        updated_at: new Date().toISOString()
      };

      if (updates.bio) mappedUpdates.bio = updates.bio;
      if (updates.experience_years) mappedUpdates.experience = updates.experience_years.toString();
      if (updates.rate_per_hour) {
        mappedUpdates.pricing = { hourly_rate: updates.rate_per_hour };
      }
      if (updates.specializations) mappedUpdates.specialties = updates.specializations;
      if (updates.certifications) mappedUpdates.certifications = updates.certifications;
      if (updates.profile_image) mappedUpdates.image_url = updates.profile_image;

      // First check if trainer profile exists
      const { data: existingProfile } = await supabase
        .from('trainers')
        .select('user_id')
        .eq('user_id', user.id)
        .single();

      if (!existingProfile) {
        // Create trainer profile if it doesn't exist
        const { data, error } = await supabase
          .from('trainers')
          .insert({
            user_id: user.id,
            name: user.user_metadata?.name || 'Trainer',
            ...mappedUpdates
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Update existing trainer profile
        const { data, error } = await supabase
          .from('trainers')
          .update(mappedUpdates)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-profile'] });
      toast.success('Trainer profile updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update trainer profile: ' + error.message);
    }
  });
};

export const useTrainerStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['trainer-stats', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');

      // Get trainer statistics from new schema
      const [bookingsResult, reviewsResult, earningsResult] = await Promise.all([
        supabase
          .from('trainer_bookings')
          .select('status')
          .eq('trainer_id', user.id),
        supabase
          .from('trainer_reviews')
          .select('rating')
          .eq('trainer_id', user.id),
        supabase
          .from('payment_transactions')
          .select('amount, status')
          .eq('trainer_id', user.id)
      ]);

      const bookings = bookingsResult.data || [];
      const reviews = reviewsResult.data || [];
      const transactions = earningsResult.data || [];

      const totalBookings = bookings.length;
      const completedBookings = bookings.filter(b => b.status === 'completed').length;
      const averageRating = reviews.length > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
        : 0;
      const totalEarnings = transactions
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      return {
        totalBookings,
        completedBookings,
        averageRating: Number(averageRating.toFixed(1)),
        totalReviews: reviews.length,
        totalEarnings,
        completionRate: totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0
      };
    },
    enabled: !!user
  });
};
