import React, { useState } from 'react';
import { useGigSearch, useGigCategories, GigSearchFilters } from '@/hooks/useGigSearch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, User, Star, MapPin, Clock, Shield, Award, Users, TrendingUp, Heart, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GigCard from '@/components/GigCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import Aurora from '@/components/Aurora';
import Breadcrumb from '@/components/Breadcrumb';
import { useDebounce } from '@/hooks/useDebounce';

const BrowseServices = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [deliveryTime, setDeliveryTime] = useState('all');
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('rating');
  const [appliedFilters, setAppliedFilters] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { data: categories } = useGigCategories();

  // Define getPriceRange function before using it
  const getPriceRange = (range: string): { min: number; max: number } => {
    switch (range) {
      case 'budget': return { min: 0, max: 2000 };
      case 'mid': return { min: 2000, max: 5000 };
      case 'premium': return { min: 5000, max: 20000 };
      default: return { min: 0, max: 20000 };
    }
  };

  // Build search filters
  const searchFilters: GigSearchFilters = {
    search: debouncedSearchTerm || undefined,
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    priceRange: priceRange !== 'all' ? getPriceRange(priceRange) : undefined,
    deliveryTime: deliveryTime !== 'all' ? parseInt(deliveryTime) : undefined,
    rating: minRating > 0 ? minRating : undefined,
    sortBy: sortBy as any,
  };

  const { data: gigs, isLoading, error } = useGigSearch(searchFilters);

  // Debug logging
  console.log('BrowseServices Debug:', { 
    gigs, 
    isLoading, 
    error, 
    searchFilters,
    gigsLength: gigs?.length
  });

  const quickFilters = [
    { name: 'Fast Delivery', value: 'fast', icon: Clock },
    { name: 'Top Rated', value: 'top-rated', icon: Star },
    { name: 'Budget Friendly', value: 'budget', icon: MapPin },
    { name: 'Premium Services', value: 'premium', icon: Award },
  ];

  const handleQuickFilter = (filterValue: string) => {
    if (appliedFilters.includes(filterValue)) {
      setAppliedFilters(appliedFilters.filter(f => f !== filterValue));
    } else {
      setAppliedFilters([...appliedFilters, filterValue]);
      
      // Apply filter logic
      if (filterValue === 'fast') {
        setDeliveryTime('3');
      } else if (filterValue === 'top-rated') {
        setMinRating(4.5);
      } else if (filterValue === 'budget') {
        setPriceRange('budget');
      } else if (filterValue === 'premium') {
        setPriceRange('premium');
      }
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setPriceRange('all');
    setDeliveryTime('all');
    setMinRating(0);
    setSortBy('rating');
    setAppliedFilters([]);
  };

  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      // Search is automatically triggered by debounced term
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Services</h2>
            <p className="text-gray-600 mb-4">{error.message}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section with Aurora Background */}
      <section className="relative min-h-[50vh] sm:min-h-[60vh] flex items-center justify-center overflow-hidden font-inter">
        {/* Aurora Background */}
        <div className="absolute inset-0">
          <Aurora 
            colorStops={["#8b1538", "#c90e5c", "#8b1538"]}
            amplitude={1.2}
            blend={0.6}
            speed={0.8}
          />
        </div>
        
        <div className="relative max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-8 sm:py-12 lg:py-16 z-10 w-full">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Breadcrumb 
              items={[
                { label: 'Home', href: '/' },
                { label: 'Services', href: '/browse-services' }
              ]}
              variant="light"
            />
          </div>

          <div className="text-center space-y-4 sm:space-y-6">
            <div className="space-y-2 sm:space-y-3">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
                <span className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">Browse Fitness</span>
                <br />
                <span className="text-pink-600 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">Services</span>
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-white max-w-2xl mx-auto leading-relaxed font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                Find the perfect trainer for your fitness goals. Browse through our certified professionals.
              </p>
            </div>

            {/* Search Input */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 pr-4 py-3 w-full rounded-full border-2 border-white/20 bg-white/10 text-white placeholder-white/60 backdrop-blur-sm focus:border-white/40 focus:ring-0"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Filters */}
      <section className="bg-white border-b border-gray-200 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 overflow-x-auto scrollbar-hide">
              {quickFilters.map((filter) => {
                const Icon = filter.icon;
                const isActive = appliedFilters.includes(filter.value);
                return (
                  <button
                    key={filter.value}
                    onClick={() => handleQuickFilter(filter.value)}
                    className={`flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full whitespace-nowrap transition-all text-xs sm:text-sm ${
                      isActive 
                        ? 'bg-pink-100 text-pink-700 border border-pink-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="font-medium">{filter.name}</span>
                  </button>
                );
              })}
            </div>
            <Button
              variant="outline"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="md:hidden h-8 w-8 p-0"
              size="sm"
            >
              <Filter className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </section>

      {/* Applied Filters */}
      {(appliedFilters.length > 0 || searchTerm || selectedCategory !== 'all' || priceRange !== 'all' || deliveryTime !== 'all' || minRating > 0) && (
        <section className="bg-gray-50 border-b border-gray-200 py-2 sm:py-3">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <span className="text-xs sm:text-sm text-gray-600 font-medium">Active filters:</span>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {searchTerm && (
                  <Badge variant="secondary" className="bg-pink-100 text-pink-700 text-xs">
                    Search: {searchTerm}
                    <X className="h-2.5 w-2.5 sm:h-3 sm:w-3 ml-1 cursor-pointer" onClick={() => setSearchTerm('')} />
                  </Badge>
                )}
                {selectedCategory !== 'all' && (
                  <Badge variant="secondary" className="bg-pink-100 text-pink-700 text-xs">
                    Category: {selectedCategory}
                    <X className="h-2.5 w-2.5 sm:h-3 sm:w-3 ml-1 cursor-pointer" onClick={() => setSelectedCategory('all')} />
                  </Badge>
                )}
                {appliedFilters.map((filter) => (
                  <Badge
                    key={filter}
                    variant="secondary"
                    className="bg-pink-100 text-pink-700 cursor-pointer text-xs"
                    onClick={() => handleQuickFilter(filter)}
                  >
                    {filter}
                    <X className="h-2.5 w-2.5 sm:h-3 sm:w-3 ml-1" />
                  </Badge>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-gray-500 hover:text-gray-700 text-xs sm:text-sm px-2 py-1 h-auto"
              >
                Clear all
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Desktop Filters */}
      <section className={`bg-white border-b border-gray-200 ${showMobileFilters ? 'block' : 'hidden md:block'}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 sm:gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
              />
            </div>
            
            <div className="w-full sm:w-48">
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger>
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="budget">Budget (৳0 - ৳2,000)</SelectItem>
                <SelectItem value="mid">Mid-Range (৳2,000 - ৳5,000)</SelectItem>
                <SelectItem value="premium">Premium (৳5,000+)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={deliveryTime} onValueChange={setDeliveryTime}>
              <SelectTrigger>
                <SelectValue placeholder="Delivery Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Time</SelectItem>
                <SelectItem value="1">Up to 1 day</SelectItem>
                <SelectItem value="3">Up to 3 days</SelectItem>
                <SelectItem value="7">Up to 7 days</SelectItem>
                <SelectItem value="14">Up to 14 days</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={clearAllFilters}
              className="text-gray-600 border-gray-300 hover:bg-gray-50"
            >
              Clear All
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-6 sm:py-8">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Available Services</h2>
            <p className="text-sm sm:text-base text-gray-600">
              {gigs?.length || 0} service{(gigs?.length || 0) !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>

        {/* Services Grid */}
        <section className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-8 sm:py-12">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : gigs && gigs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {gigs.map((gig) => (
                <GigCard key={gig.id} gig={gig} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No services found matching your criteria.</p>
            </div>
          )}
        </section>

        {/* Empty State */}
        {gigs && gigs.length === 0 && (
          <div className="text-center py-12 mb-16">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or browse all categories
            </p>
            <Button
              onClick={clearAllFilters}
              variant="outline"
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* SEO Sections */}
        {/* Section 1: Why Choose Our Fitness Services */}
        <section className="py-8 sm:py-12 lg:py-16 bg-white rounded-lg mb-6 sm:mb-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">Why Choose HealthyThako Fitness Services?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-pink-600 mx-auto mb-2 sm:mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Verified Trainers</h3>
                <p className="text-xs sm:text-sm text-gray-600">All trainers are certified and background-checked for your safety.</p>
              </div>
              <div className="text-center">
                <Award className="h-6 w-6 sm:h-8 sm:w-8 text-pink-600 mx-auto mb-2 sm:mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Expert Guidance</h3>
                <p className="text-xs sm:text-sm text-gray-600">Professional trainers with years of experience in fitness.</p>
              </div>
              <div className="text-center">
                <Star className="h-6 w-6 sm:h-8 sm:w-8 text-pink-600 mx-auto mb-2 sm:mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">5-Star Rated</h3>
                <p className="text-xs sm:text-sm text-gray-600">Highly rated services by thousands of satisfied clients.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Popular Fitness Categories */}
        <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg mb-6 sm:mb-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">Popular Fitness Categories in Bangladesh</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {['Weight Loss', 'Muscle Gain', 'Yoga', 'Cardio', 'Strength Training', 'Sports Fitness', 'Nutrition', 'Rehabilitation'].map((category) => (
                <Card key={category} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm font-medium text-gray-700">{category}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: How Our Service Works */}
        <section className="py-16 bg-white rounded-lg mb-8">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How HealthyThako Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-pink-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Browse Services</h3>
                <p className="text-sm text-gray-600">Search and filter through our verified trainers.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-pink-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Choose Trainer</h3>
                <p className="text-sm text-gray-600">Select the perfect trainer for your fitness goals.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-pink-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Book Session</h3>
                <p className="text-sm text-gray-600">Schedule your training session at your convenience.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-pink-600 font-bold">4</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Start Training</h3>
                <p className="text-sm text-gray-600">Begin your fitness journey with expert guidance.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Training Locations */}
        <section className="py-16 bg-gradient-to-r from-gray-50 to-pink-50 rounded-lg mb-8">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Available Training Locations</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <MapPin className="h-8 w-8 text-pink-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Home Training</h3>
                <p className="text-sm text-gray-600">Personal trainers come to your home for convenient workouts.</p>
              </div>
              <div className="text-center">
                <MapPin className="h-8 w-8 text-pink-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Gym Sessions</h3>
                <p className="text-sm text-gray-600">Train at premium gyms with professional equipment.</p>
              </div>
              <div className="text-center">
                <MapPin className="h-8 w-8 text-pink-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Online Training</h3>
                <p className="text-sm text-gray-600">Virtual sessions from the comfort of your home.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Pricing & Packages */}
        <section className="py-16 bg-white rounded-lg mb-8">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Affordable Fitness Training Packages</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardContent className="p-6">
                  <h3 className="font-bold text-gray-900 mb-2">Basic Package</h3>
                  <p className="text-2xl font-bold text-pink-600 mb-3">৳1,500/month</p>
                  <p className="text-sm text-gray-600">4 sessions per month with certified trainers</p>
                </CardContent>
              </Card>
              <Card className="text-center border-pink-200">
                <CardContent className="p-6">
                  <h3 className="font-bold text-gray-900 mb-2">Premium Package</h3>
                  <p className="text-2xl font-bold text-pink-600 mb-3">৳2,800/month</p>
                  <p className="text-sm text-gray-600">8 sessions per month with nutrition guidance</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <h3 className="font-bold text-gray-900 mb-2">Elite Package</h3>
                  <p className="text-2xl font-bold text-pink-600 mb-3">৳4,500/month</p>
                  <p className="text-sm text-gray-600">Unlimited sessions with premium trainers</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Section 6: Success Stories */}
        <section className="py-16 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg mb-8">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Success Stories from Bangladesh</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center mb-3">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <Star className="h-4 w-4 text-yellow-400" />
                  </div>
                  <p className="text-sm text-gray-600 mb-3">"Lost 15kg in 6 months with my trainer. Amazing experience!"</p>
                  <p className="text-xs font-medium text-gray-900">- Sarah Ahmed, Dhaka</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center mb-3">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <Star className="h-4 w-4 text-yellow-400" />
                  </div>
                  <p className="text-sm text-gray-600 mb-3">"Built muscle and strength with professional guidance. Highly recommend!"</p>
                  <p className="text-xs font-medium text-gray-900">- Rahul Khan, Chittagong</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Section 7: Health Benefits */}
        <section className="py-16 bg-white rounded-lg mb-8">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Health Benefits of Personal Training</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <Heart className="h-5 w-5 text-pink-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">Improved Cardiovascular Health</h3>
                    <p className="text-xs text-gray-600">Regular exercise strengthens your heart and improves circulation.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <TrendingUp className="h-5 w-5 text-pink-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">Increased Strength & Endurance</h3>
                    <p className="text-xs text-gray-600">Build muscle strength and improve overall endurance.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Users className="h-5 w-5 text-pink-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">Better Mental Health</h3>
                    <p className="text-xs text-gray-600">Exercise releases endorphins that improve mood and reduce stress.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-pink-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">Long-term Health</h3>
                    <p className="text-xs text-gray-600">Prevent chronic diseases and maintain healthy aging.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 8: Training Specializations */}
        <section className="py-16 bg-gradient-to-r from-gray-50 to-purple-50 rounded-lg mb-8">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Training Specializations Available</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                'Weight Loss Training',
                'Muscle Building',
                'Functional Fitness',
                'Sports Performance',
                'Injury Rehabilitation',
                'Senior Fitness',
                'Women\'s Fitness',
                'Youth Training',
                'Flexibility & Mobility'
              ].map((specialization) => (
                <div key={specialization} className="bg-white rounded-lg p-4 text-center shadow-sm">
                  <p className="text-xs font-medium text-gray-700">{specialization}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 9: Frequently Asked Questions */}
        <section className="py-16 bg-white rounded-lg mb-8">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">How do I book a fitness trainer?</h3>
                <p className="text-xs text-gray-600">Simply browse our services, select your preferred trainer, and book a session through our platform.</p>
              </div>
              <div className="border-b pb-4">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">Are all trainers certified?</h3>
                <p className="text-xs text-gray-600">Yes, all our trainers are certified professionals with verified credentials and experience.</p>
              </div>
              <div className="border-b pb-4">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">Can I cancel or reschedule sessions?</h3>
                <p className="text-xs text-gray-600">Yes, you can cancel or reschedule sessions up to 24 hours before the scheduled time.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">What payment methods are accepted?</h3>
                <p className="text-xs text-gray-600">We accept bKash, Nagad, Rocket, bank transfers, and credit/debit cards.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 10: Get Started Today */}
        <section className="py-16 bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Start Your Fitness Journey Today</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join thousands of satisfied clients who have transformed their lives with our professional fitness trainers across Bangladesh.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2">
                Browse All Services
              </Button>
              <Button variant="outline" className="border-pink-600 text-pink-600 hover:bg-pink-50 px-6 py-2">
                Contact Support
              </Button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default BrowseServices;
