import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Types for review operations
export interface TrainerReviewData {
  trainer_id: string;
  booking_id?: string;
  rating: number;
  comment?: string;
  session_type?: string;
  would_recommend?: boolean;
  communication_rating?: number;
  expertise_rating?: number;
  punctuality_rating?: number;
  value_rating?: number;
}

export interface GymReviewData {
  gym_id: string;
  rating: number;
  comment?: string;
  cleanliness_rating?: number;
  equipment_rating?: number;
  staff_rating?: number;
  value_rating?: number;
  would_recommend?: boolean;
  visit_date?: string;
}

// Hook to create trainer review
export const useCreateTrainerReview = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (reviewData: TrainerReviewData) => {
      if (!user) throw new Error('No user authenticated');

      // Check if user has already reviewed this trainer
      const { data: existingReview } = await supabase
        .from('trainer_reviews')
        .select('id')
        .eq('user_id', user.id)
        .eq('trainer_id', reviewData.trainer_id)
        .eq('booking_id', reviewData.booking_id || '')
        .single();

      if (existingReview) {
        throw new Error('You have already reviewed this trainer for this session');
      }

      const { data, error } = await supabase
        .from('trainer_reviews')
        .insert({
          user_id: user.id,
          ...reviewData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Update trainer's average rating
      await updateTrainerRating(reviewData.trainer_id);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['trainer-profile'] });
      queryClient.invalidateQueries({ queryKey: ['trainers'] });
      toast.success('Review submitted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to submit review: ' + error.message);
    }
  });
};

// Hook to get trainer reviews
export const useTrainerReviews = (trainerId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['trainer-reviews', trainerId || user?.id],
    queryFn: async () => {
      if (!trainerId && !user) throw new Error('No trainer ID or user provided');

      let query = supabase
        .from('trainer_reviews')
        .select(`
          *,
          reviewer:users!trainer_reviews_user_id_fkey(full_name, avatar_url),
          trainer:trainers!trainer_reviews_trainer_id_fkey(name, image_url)
        `)
        .order('created_at', { ascending: false });

      if (trainerId) {
        query = query.eq('trainer_id', trainerId);
      } else {
        // Get reviews for current user's trainer profile
        const { data: trainer } = await supabase
          .from('trainers')
          .select('id')
          .eq('user_id', user!.id)
          .single();

        if (!trainer) throw new Error('Trainer profile not found');
        query = query.eq('trainer_id', trainer.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: !!(trainerId || user)
  });
};

// Hook to update trainer review
export const useUpdateTrainerReview = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      reviewId, 
      updates 
    }: { 
      reviewId: string; 
      updates: Partial<TrainerReviewData>;
    }) => {
      if (!user) throw new Error('No user authenticated');

      const { data, error } = await supabase
        .from('trainer_reviews')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', reviewId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Update trainer's average rating if rating changed
      if (updates.rating) {
        const { data: review } = await supabase
          .from('trainer_reviews')
          .select('trainer_id')
          .eq('id', reviewId)
          .single();

        if (review) {
          await updateTrainerRating(review.trainer_id);
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['trainer-profile'] });
      toast.success('Review updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update review: ' + error.message);
    }
  });
};

// Hook to delete trainer review
export const useDeleteTrainerReview = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      if (!user) throw new Error('No user authenticated');

      // Get trainer ID before deleting
      const { data: review } = await supabase
        .from('trainer_reviews')
        .select('trainer_id')
        .eq('id', reviewId)
        .eq('user_id', user.id)
        .single();

      if (!review) throw new Error('Review not found');

      const { error } = await supabase
        .from('trainer_reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update trainer's average rating
      await updateTrainerRating(review.trainer_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['trainer-profile'] });
      toast.success('Review deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to delete review: ' + error.message);
    }
  });
};

// Hook to create gym review
export const useCreateGymReview = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (reviewData: GymReviewData) => {
      if (!user) throw new Error('No user authenticated');

      // Check if user has already reviewed this gym
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('user_id', user.id)
        .eq('gym_id', reviewData.gym_id)
        .single();

      if (existingReview) {
        throw new Error('You have already reviewed this gym');
      }

      const { data, error } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          ...reviewData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Update gym's average rating
      await updateGymRating(reviewData.gym_id);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['gyms'] });
      toast.success('Gym review submitted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to submit gym review: ' + error.message);
    }
  });
};

// Hook to get gym reviews
export const useGymReviews = (gymId: string) => {
  return useQuery({
    queryKey: ['gym-reviews', gymId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer:users!reviews_user_id_fkey(full_name, avatar_url),
          gym:gyms!reviews_gym_id_fkey(name)
        `)
        .eq('gym_id', gymId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!gymId
  });
};

// Hook to update gym review
export const useUpdateGymReview = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      reviewId, 
      updates 
    }: { 
      reviewId: string; 
      updates: Partial<GymReviewData>;
    }) => {
      if (!user) throw new Error('No user authenticated');

      const { data, error } = await supabase
        .from('reviews')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', reviewId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Update gym's average rating if rating changed
      if (updates.rating) {
        const { data: review } = await supabase
          .from('reviews')
          .select('gym_id')
          .eq('id', reviewId)
          .single();

        if (review) {
          await updateGymRating(review.gym_id);
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['gyms'] });
      toast.success('Gym review updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update gym review: ' + error.message);
    }
  });
};

// Hook to delete gym review
export const useDeleteGymReview = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      if (!user) throw new Error('No user authenticated');

      // Get gym ID before deleting
      const { data: review } = await supabase
        .from('reviews')
        .select('gym_id')
        .eq('id', reviewId)
        .eq('user_id', user.id)
        .single();

      if (!review) throw new Error('Review not found');

      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update gym's average rating
      await updateGymRating(review.gym_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['gyms'] });
      toast.success('Gym review deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to delete gym review: ' + error.message);
    }
  });
};

// Hook to get user's reviews
export const useUserReviews = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-reviews', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user authenticated');

      const [trainerReviews, gymReviews] = await Promise.all([
        supabase
          .from('trainer_reviews')
          .select(`
            *,
            trainer:trainers!trainer_reviews_trainer_id_fkey(name, image_url)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('reviews')
          .select(`
            *,
            gym:gyms!reviews_gym_id_fkey(name)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      ]);

      return {
        trainerReviews: trainerReviews.data || [],
        gymReviews: gymReviews.data || []
      };
    },
    enabled: !!user
  });
};

// Helper function to update trainer rating
async function updateTrainerRating(trainerId: string) {
  const { data: reviews } = await supabase
    .from('trainer_reviews')
    .select('rating')
    .eq('trainer_id', trainerId);

  if (reviews && reviews.length > 0) {
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    
    await supabase
      .from('trainers')
      .update({
        rating: Number(averageRating.toFixed(1)),
        total_reviews: reviews.length
      })
      .eq('id', trainerId);
  }
}

// Helper function to update gym rating
async function updateGymRating(gymId: string) {
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('gym_id', gymId);

  if (reviews && reviews.length > 0) {
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    
    await supabase
      .from('gyms')
      .update({
        rating: Number(averageRating.toFixed(1)),
        total_reviews: reviews.length
      })
      .eq('id', gymId);
  }
}
