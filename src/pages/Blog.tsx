
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useBlogPosts, useBlogCategories } from '@/hooks/useBlogPosts';
import { Search, Calendar, User, ArrowRight, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const { data: posts, isLoading } = useBlogPosts({ 
    status: 'published',
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    search: searchTerm 
  });
  const { data: categories } = useBlogCategories();

  const featuredPost = posts?.[0];
  const regularPosts = posts?.slice(1) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
        <Header />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center text-white">
            <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading amazing content...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      <Header />
      
      {/* Breadcrumb Navigation */}
      <div className="bg-black/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Breadcrumb 
            items={[
              { label: 'Blog', current: true }
            ]}
            showBackButton={false}
            className="text-white"
          />
        </div>
      </div>
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Fitness & Wellness Blog</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            HealthyThako
            <span className="block text-3xl md:text-4xl mt-2">Insights</span>
          </h1>
          <p className="text-xl text-purple-100 max-w-2xl mx-auto">
            Discover expert tips, workout routines, nutrition advice, and success stories to transform your fitness journey.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        {/* Search and Filter */}
        <div className="mb-12">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-gray-300"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('all')}
                  className={selectedCategory === 'all' ? 'bg-purple-600 hover:bg-purple-700' : 'border-white/30 text-white hover:bg-white/10'}
                >
                  All
                </Button>
                {categories?.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.slug ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(category.slug)}
                    className={selectedCategory === category.slug ? 'bg-purple-600 hover:bg-purple-700' : 'border-white/30 text-white hover:bg-white/10'}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Featured Article */}
        {featuredPost && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
              <Sparkles className="w-8 h-8 mr-3 text-purple-400" />
              Featured Article
            </h2>
            <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-md border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
              <div className="md:flex">
                {featuredPost.featured_image && (
                  <div className="md:w-1/2">
                    <img 
                      src={featuredPost.featured_image} 
                      alt={featuredPost.title}
                      className="w-full h-64 md:h-full object-cover"
                    />
                  </div>
                )}
                <CardContent className="p-8 md:w-1/2">
                  <div className="flex items-center gap-4 text-sm text-purple-300 mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {format(new Date(featuredPost.created_at), 'MMM dd, yyyy')}
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {featuredPost.author?.username || 'HealthyThako Team'}
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4 leading-tight">
                    {featuredPost.title}
                  </h3>
                  
                  <p className="text-gray-300 mb-6 line-clamp-3">
                    {featuredPost.excerpt || featuredPost.content.substring(0, 200) + '...'}
                  </p>
                  
                  {featuredPost.category && (
                    <Badge className="mb-4 bg-purple-600/30 text-purple-200 border-purple-400/30">
                      {categories?.find(c => c.slug === featuredPost.category)?.name || featuredPost.category}
                    </Badge>
                  )}
                  
                  <Link to={`/blog/${featuredPost.slug}`}>
                    <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                      Read Article
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </div>
            </Card>
          </div>
        )}

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {regularPosts.map((post: any) => (
            <Card key={post.id} className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-xl group">
              {post.featured_image && (
                <div className="relative overflow-hidden">
                  <img 
                    src={post.featured_image} 
                    alt={post.title}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
              )}
              <CardContent className="p-6">
                <div className="flex items-center gap-3 text-xs text-purple-300 mb-3">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(new Date(post.created_at), 'MMM dd')}
                  </div>
                  <div className="flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    {post.author?.username || 'Team'}
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-3 line-clamp-2 group-hover:text-purple-300 transition-colors">
                  {post.title}
                </h3>
                
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                  {post.excerpt || post.content.substring(0, 120) + '...'}
                </p>
                
                <div className="flex items-center justify-between">
                  {post.category && (
                    <Badge variant="secondary" className="bg-purple-600/20 text-purple-300 text-xs">
                      {categories?.find(c => c.slug === post.category)?.name || post.category}
                    </Badge>
                  )}
                  
                  <Link to={`/blog/${post.slug}`}>
                    <Button variant="ghost" size="sm" className="text-purple-300 hover:text-white hover:bg-purple-600/30">
                      Read More
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Posts Found */}
        {(!posts || posts.length === 0) && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-bold text-white mb-2">No articles found</h3>
            <p className="text-gray-400">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filters.' 
                : 'New content is coming soon!'}
            </p>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Blog;
