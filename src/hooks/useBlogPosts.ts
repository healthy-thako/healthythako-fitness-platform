
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useBlogPosts = (filters?: { status?: string; category?: string; search?: string }) => {
  const queryClient = useQueryClient();

  // Real-time subscription - Temporarily disabled to fix WebSocket issues
  useEffect(() => {
    // TODO: Re-enable realtime subscriptions after fixing WebSocket connection issues
    // const channel = supabase
    //   .channel('blog-posts-changes')
    //   .on(
    //     'postgres_changes',
    //     {
    //       event: '*',
    //       schema: 'public',
    //       table: 'blog_posts'
    //     },
    //     (payload) => {
    //       console.log('Blog post change detected:', payload);
    //       // Invalidate and refetch blog posts
    //       queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    //     }
    //   )
    //   .subscribe();

    // return () => {
    //   supabase.removeChannel(channel);
    // };
  }, [queryClient]);

  return useQuery({
    queryKey: ['blog-posts', filters],
    queryFn: async () => {
      console.log('Fetching blog posts with filters:', filters);
      
      let query = supabase
        .from('blog_posts')
        .select(`
          *,
          author:admin_users(username, email)
        `)
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching blog posts:', error);
        throw new Error(`Failed to fetch blog posts: ${error.message}`);
      }
      
      console.log('Blog posts fetched successfully:', data?.length);
      return data || [];
    },
    retry: 2,
    staleTime: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
};

export const useCreateBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postData: {
      title: string;
      slug: string;
      content: string;
      excerpt?: string;
      featured_image?: string;
      status: string;
      author_id: string;
      category?: string;
      tags?: string[];
      meta_title?: string;
      meta_description?: string;
    }) => {
      console.log('Creating blog post:', postData);
      
      const { data, error } = await supabase
        .from('blog_posts')
        .insert([postData])
        .select()
        .single();
      
      if (error) {
        console.error('Create blog post error:', error);
        throw new Error(`Failed to create blog post: ${error.message}`);
      }
      
      console.log('Blog post created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    },
    onError: (error) => {
      console.error('Create blog post mutation error:', error);
    }
  });
};

export const useUpdateBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, updates }: { postId: string; updates: any }) => {
      console.log('Updating blog post:', postId, updates);
      
      const { data, error } = await supabase
        .from('blog_posts')
        .update(updates)
        .eq('id', postId)
        .select()
        .single();
      
      if (error) {
        console.error('Update blog post error:', error);
        throw new Error(`Failed to update blog post: ${error.message}`);
      }
      
      console.log('Blog post updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    },
    onError: (error) => {
      console.error('Update blog post mutation error:', error);
    }
  });
};

export const useDeleteBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      console.log('Deleting blog post:', postId);
      
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (error) {
        console.error('Delete blog post error:', error);
        throw new Error(`Failed to delete blog post: ${error.message}`);
      }
      
      console.log('Blog post deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    },
    onError: (error) => {
      console.error('Delete blog post mutation error:', error);
    }
  });
};

export const useBlogCategories = () => {
  return useQuery({
    queryKey: ['blog-categories'],
    queryFn: async () => {
      console.log('Fetching blog categories');
      
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching blog categories:', error);
        throw new Error(`Failed to fetch blog categories: ${error.message}`);
      }
      
      console.log('Blog categories fetched successfully:', data?.length);
      return data || [];
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
