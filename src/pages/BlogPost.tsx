
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, User, ArrowLeft, Share2, BookmarkPlus, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BrandLoadingSpinner from '@/components/BrandLoadingSpinner';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<any>(null);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;

      try {
        // Fetch the main post
        const { data: postData, error: postError } = await supabase
          .from('blog_posts')
          .select(`
            *,
            author:admin_users(username, email)
          `)
          .eq('slug', slug)
          .eq('status', 'published')
          .single();

        if (postError) {
          console.error('Error fetching post:', postError);
          return;
        }

        setPost(postData);

        // Fetch related posts from the same category
        if (postData?.category) {
          const { data: relatedData } = await supabase
            .from('blog_posts')
            .select('id, title, slug, excerpt, featured_image, created_at, category')
            .eq('category', postData.category)
            .eq('status', 'published')
            .neq('id', postData.id)
            .limit(3);

          setRelatedPosts(relatedData || []);
        }
      } catch (error) {
        console.error('Error fetching blog post:', error);
        toast.error('Failed to load blog post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt || post.meta_description,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <BrandLoadingSpinner size="lg" showText={true} />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
        <Header />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center text-white">
            <div className="text-6xl mb-4">📄</div>
            <h2 className="text-3xl font-bold mb-4">Article Not Found</h2>
            <p className="text-gray-300 mb-6">The article you're looking for doesn't exist or has been removed.</p>
            <Link to="/blog">
              <Button className="bg-purple-600 hover:bg-purple-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{post.meta_title || post.title} | HealthyThako Blog</title>
        <meta name="description" content={post.meta_description || post.excerpt || post.content.substring(0, 155)} />
        <meta name="keywords" content={post.tags?.join(', ') || 'fitness, health, wellness'} />
        
        {/* Open Graph */}
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt || post.content.substring(0, 155)} />
        <meta property="og:image" content={post.featured_image || '/placeholder.svg'} />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="article" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt || post.content.substring(0, 155)} />
        <meta name="twitter:image" content={post.featured_image || '/placeholder.svg'} />
        
        {/* Article specific */}
        <meta property="article:published_time" content={post.created_at} />
        <meta property="article:author" content={post.author?.username || 'HealthyThako Team'} />
        {post.tags?.map((tag: string) => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": post.title,
            "description": post.excerpt || post.content.substring(0, 155),
            "image": post.featured_image,
            "datePublished": post.created_at,
            "dateModified": post.updated_at,
            "author": {
              "@type": "Person",
              "name": post.author?.username || 'HealthyThako Team'
            },
            "publisher": {
              "@type": "Organization",
              "name": "HealthyThako",
              "logo": {
                "@type": "ImageObject",
                "url": "/placeholder.svg"
              }
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
        <Header />
        
        <article className="max-w-4xl mx-auto px-4 py-8">
          {/* Back Button */}
          <div className="mb-8">
            <Link to="/blog">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>

          {/* Article Header */}
          <header className="mb-8">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              {post.category && (
                <Badge className="mb-4 bg-purple-600/30 text-purple-200 border-purple-400/30">
                  {post.category}
                </Badge>
              )}
              
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                {post.title}
              </h1>
              
              {post.excerpt && (
                <p className="text-xl text-gray-300 mb-6 leading-relaxed">
                  {post.excerpt}
                </p>
              )}
              
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-6 text-sm text-purple-300">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {format(new Date(post.created_at), 'MMMM dd, yyyy')}
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    {post.author?.username || 'HealthyThako Team'}
                  </div>
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-2" />
                    Article
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    <BookmarkPlus className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {post.featured_image && (
            <div className="mb-8">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-64 md:h-96 object-cover rounded-2xl shadow-2xl"
              />
            </div>
          )}

          {/* Article Content */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-8">
            <div 
              className="prose prose-lg prose-invert max-w-none text-gray-100 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/>') }}
            />
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mb-8">
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary" className="bg-purple-600/20 text-purple-300">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-6">Related Articles</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Card key={relatedPost.id} className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all duration-300">
                    {relatedPost.featured_image && (
                      <img
                        src={relatedPost.featured_image}
                        alt={relatedPost.title}
                        className="w-full h-32 object-cover rounded-t-lg"
                      />
                    )}
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-white mb-2 line-clamp-2">
                        {relatedPost.title}
                      </h4>
                      <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                      <Link to={`/blog/${relatedPost.slug}`}>
                        <Button variant="ghost" size="sm" className="text-purple-300 hover:text-white hover:bg-purple-600/30 p-0">
                          Read More →
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </article>
        
        <Footer />
      </div>
    </>
  );
};

export default BlogPost;
