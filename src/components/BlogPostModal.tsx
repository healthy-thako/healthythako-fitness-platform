
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useCreateBlogPost, useUpdateBlogPost, useBlogCategories } from '@/hooks/useBlogPosts';
import { useToast } from '@/hooks/use-toast';
import { X, Plus, Loader2 } from 'lucide-react';

interface BlogPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post?: any;
  currentAdminId: string;
}

const BlogPostModal: React.FC<BlogPostModalProps> = ({ isOpen, onClose, post, currentAdminId }) => {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featured_image: '',
    status: 'draft',
    category: '',
    meta_title: '',
    meta_description: '',
  });
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: categories } = useBlogCategories();
  const createPost = useCreateBlogPost();
  const updatePost = useUpdateBlogPost();
  const { toast } = useToast();

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || '',
        slug: post.slug || '',
        content: post.content || '',
        excerpt: post.excerpt || '',
        featured_image: post.featured_image || '',
        status: post.status || 'draft',
        category: post.category || '',
        meta_title: post.meta_title || '',
        meta_description: post.meta_description || '',
      });
      setTags(post.tags || []);
    } else {
      setFormData({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        featured_image: '',
        status: 'draft',
        category: '',
        meta_title: '',
        meta_description: '',
      });
      setTags([]);
    }
  }, [post]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags(prev => [...prev, newTag]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content || !formData.slug) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields (title, content, and slug)',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const postData = {
        ...formData,
        tags,
        author_id: currentAdminId,
        published_at: formData.status === 'published' ? new Date().toISOString() : null,
      };

      console.log('Submitting blog post:', postData);

      if (post) {
        await updatePost.mutateAsync({ postId: post.id, updates: postData });
        toast({
          title: 'Success',
          description: 'Blog post updated successfully',
        });
      } else {
        await createPost.mutateAsync(postData);
        toast({
          title: 'Success',
          description: 'Blog post created successfully',
        });
      }
      
      onClose();
    } catch (error: any) {
      console.error('Blog post submission error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save blog post',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{post ? 'Edit Blog Post' : 'Create New Blog Post'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter post title"
                required
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="post-url-slug"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
              placeholder="Brief description of the post"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Write your blog post content here..."
              rows={10}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="featured_image">Featured Image URL</Label>
              <Input
                id="featured_image"
                value={formData.featured_image}
                onChange={(e) => setFormData(prev => ({ ...prev, featured_image: e.target.value }))}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div>
            <Label>Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="meta_title">Meta Title (SEO)</Label>
              <Input
                id="meta_title"
                value={formData.meta_title}
                onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                placeholder="SEO title"
              />
            </div>
            <div>
              <Label htmlFor="meta_description">Meta Description (SEO)</Label>
              <Input
                id="meta_description"
                value={formData.meta_description}
                onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                placeholder="SEO description"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {post ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                post ? 'Update Post' : 'Create Post'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BlogPostModal;
