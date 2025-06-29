import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminBlog, useCreateBlogPost, useUpdateBlogPost, useDeleteBlogPost, useBlogStats } from '@/hooks/useAdminBlog';
import BlogPostModal from '@/components/BlogPostModal';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  TrendingUp, 
  FileText,
  Users,
  Calendar,
  Loader2
} from 'lucide-react';

const AdminBlog = () => {
  const [filters, setFilters] = useState({ status: 'all', search: '' });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  
  const { profile } = useAuth();
  const { data: posts, isLoading, error } = useAdminBlog(filters);
  const { data: stats } = useBlogStats();
  const createPost = useCreateBlogPost();
  const updatePost = useUpdateBlogPost();
  const deletePost = useDeleteBlogPost();

  const handleDeletePost = async (postId: string) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        await deletePost.mutateAsync(postId);
      } catch (error: any) {
        console.error('Delete post error:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading blog posts...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>Error loading blog posts: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Management</h1>
          <p className="text-gray-600">Create and manage blog posts for the platform</p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Post</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_posts || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.published_posts || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_views || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft Posts</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.draft_posts || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search posts..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Posts</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Blog Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Blog Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {!posts || posts.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No blog posts found</p>
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="mt-4"
              >
                Create Your First Post
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post: any) => (
                <div key={post.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-lg">{post.title}</h3>
                        <Badge variant={
                          post.status === 'published' ? 'default' :
                          post.status === 'draft' ? 'secondary' : 'outline'
                        }>
                          {post.status}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-2">{post.excerpt}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                        {post.published_at && (
                          <div className="flex items-center space-x-1">
                            <Eye className="h-4 w-4" />
                            <span>Published {new Date(post.published_at).toLocaleDateString()}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{post.views || 0} views</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingPost(post)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this post?')) {
                            deletePost.mutate(post.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {showCreateModal && (
        <BlogPostModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          currentAdminId={profile?.id || ''}
        />
      )}

      {editingPost && (
        <BlogPostModal
          isOpen={!!editingPost}
          onClose={() => setEditingPost(null)}
          post={editingPost}
          currentAdminId={profile?.id || ''}
        />
      )}
    </div>
  );
};

export default AdminBlog;
