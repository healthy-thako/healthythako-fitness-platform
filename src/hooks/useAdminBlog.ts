import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  status: 'draft' | 'published' | 'archived';
  author_id: string;
  meta_title?: string;
  meta_description?: string;
  tags?: string[];
  views_count?: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
  author?: {
    username: string;
    email: string;
  };
  read_time?: number;
}

interface BlogStats {
  total_posts: number;
  published_posts: number;
  draft_posts: number;
  total_views: number;
  posts_today: number;
}

export const useAdminBlog = (filters?: { status?: string; search?: string }) => {
  const { profile, hasPermission } = useAuth();
  const queryClient = useQueryClient();

  // Check if user has admin permissions
  const isAuthorized = profile && (
    profile.primary_role === 'admin' || 
    hasPermission('moderate_content') ||
    hasPermission('system_admin')
  );

  return useQuery({
    queryKey: ['admin-blog', filters],
    queryFn: async () => {
      console.log('Fetching blog posts');
      
      const sessionToken = localStorage.getItem('admin_session_token');
      if (!sessionToken) {
        throw new Error('No admin session found');
      }

      const response = await fetch('https://gecymswohvloxinrevsr.supabase.co/functions/v1/admin-blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          action: 'getPosts',
          filters: filters
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Error fetching blog posts:', error);
        throw new Error(`Failed to fetch blog posts: ${error}`);
      }

      const data = await response.json();
      console.log('Blog posts fetched successfully:', data.length);
      return data as BlogPost[];
    },
    retry: 2,
    refetchInterval: 30000, // Refresh every 30 seconds
    enabled: isAuthorized
  });
};

export const useCreateBlogPost = () => {
  const queryClient = useQueryClient();
  const { profile, hasPermission } = useAuth();

  // Check if user has admin permissions
  const isAuthorized = profile && (
    profile.primary_role === 'admin' || 
    hasPermission('moderate_content') ||
    hasPermission('system_admin')
  );

  return useMutation({
    mutationFn: async (postData: Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'author'>) => {
      console.log('Creating blog post:', postData);
      
      const sessionToken = localStorage.getItem('admin_session_token');
      if (!sessionToken) {
        throw new Error('No admin session found');
      }

      const response = await fetch('https://gecymswohvloxinrevsr.supabase.co/functions/v1/admin-blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          action: 'createPost',
          postData
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Error creating blog post:', error);
        throw new Error(`Failed to create blog post: ${error}`);
      }

      const data = await response.json();
      console.log('Blog post created successfully:', data);
      return data as BlogPost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog'] });
      queryClient.invalidateQueries({ queryKey: ['blog-stats'] });
    }
  });
};

export const useUpdateBlogPost = () => {
  const queryClient = useQueryClient();
  const { profile, hasPermission } = useAuth();

  // Check if user has admin permissions
  const isAuthorized = profile && (
    profile.primary_role === 'admin' || 
    hasPermission('moderate_content') ||
    hasPermission('system_admin')
  );

  return useMutation({
    mutationFn: async ({ postId, postData }: { postId: string; postData: Partial<BlogPost> }) => {
      console.log('Updating blog post:', postId, postData);
      
      const sessionToken = localStorage.getItem('admin_session_token');
      if (!sessionToken) {
        throw new Error('No admin session found');
      }

      const response = await fetch('https://gecymswohvloxinrevsr.supabase.co/functions/v1/admin-blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          action: 'updatePost',
          postId,
          postData
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Error updating blog post:', error);
        throw new Error(`Failed to update blog post: ${error}`);
      }

      const data = await response.json();
      console.log('Blog post updated successfully:', data);
      return data as BlogPost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog'] });
      queryClient.invalidateQueries({ queryKey: ['blog-stats'] });
    }
  });
};

export const useDeleteBlogPost = () => {
  const queryClient = useQueryClient();
  const { profile, hasPermission } = useAuth();

  // Check if user has admin permissions
  const isAuthorized = profile && (
    profile.primary_role === 'admin' || 
    hasPermission('moderate_content') ||
    hasPermission('system_admin')
  );

  return useMutation({
    mutationFn: async (postId: string) => {
      console.log('Deleting blog post:', postId);
      
      const sessionToken = localStorage.getItem('admin_session_token');
      if (!sessionToken) {
        throw new Error('No admin session found');
      }

      const response = await fetch('https://gecymswohvloxinrevsr.supabase.co/functions/v1/admin-blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          action: 'deletePost',
          postId
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Error deleting blog post:', error);
        throw new Error(`Failed to delete blog post: ${error}`);
      }

      const data = await response.json();
      console.log('Blog post deleted successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog'] });
      queryClient.invalidateQueries({ queryKey: ['blog-stats'] });
    }
  });
};

export const useBlogStats = () => {
  const { profile, hasPermission } = useAuth();

  // Check if user has admin permissions
  const isAuthorized = profile && (
    profile.primary_role === 'admin' || 
    hasPermission('moderate_content') ||
    hasPermission('system_admin')
  );

  return useQuery({
    queryKey: ['blog-stats'],
    queryFn: async () => {

      
      const sessionToken = localStorage.getItem('admin_session_token');
      if (!sessionToken) {
        throw new Error('No admin session found');
      }

      const response = await fetch('https://gecymswohvloxinrevsr.supabase.co/functions/v1/admin-blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          action: 'getStats'
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        // Error fetching blog stats
        throw new Error(`Failed to fetch blog stats: ${error}`);
      }

      const data = await response.json();
      console.log('Blog stats fetched successfully:', data);
      return data as BlogStats;
    },
    retry: 2,
    refetchInterval: 60000, // Refresh every minute
    enabled: isAuthorized
  });
}; 