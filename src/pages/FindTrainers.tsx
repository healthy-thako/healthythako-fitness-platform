import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useAddToFavorites, useRemoveFromFavorites, useClientFavorites } from '@/hooks/useClientData';
import { useTrainerSearch, useTrainerSpecializations, TrainerSearchFilters } from '@/hooks/useTrainerSearch';
import TrainerProfileCard from '@/components/TrainerProfileCard';
import TrainerProfileModal from '@/components/TrainerProfileModal';
import BookingModal from '@/components/BookingModal';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Aurora from '@/components/Aurora';
import Breadcrumb from '@/components/Breadcrumb';
import BlurText from '@/components/BlurText';
import { Search, Filter, MapPin, Loader2, X, Star, Users, Zap, ArrowRight, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';
import HowItWorksSection from '@/components/seo/HowItWorksSection';
import BenefitsSection from '@/components/seo/BenefitsSection';
import LocationsSection from '@/components/seo/LocationsSection';
import FAQSection from '@/components/seo/FAQSection';
import { Heart, Shield, Clock, Award, MessageCircle, Calendar, CheckCircle as Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const FindTrainers = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('location') || 'all');
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>(
    searchParams.get('specialization') ? [searchParams.get('specialization')!] : []
  );
  const [priceRange, setPriceRange] = useState(searchParams.get('price') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'rating');
  const [selectedGender, setSelectedGender] = useState(searchParams.get('gender') || 'all');
  const [experienceLevel, setExperienceLevel] = useState('all');
  const [minRating, setMinRating] = useState(0);
  const [selectedTrainer, setSelectedTrainer] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<string[]>([]);

  // Debounce search query to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { data: favorites } = useClientFavorites();
  const addToFavorites = useAddToFavorites();
  const removeFromFavorites = useRemoveFromFavorites();
  const { data: specializations } = useTrainerSpecializations();

  const locations = [
    "Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna", "Barisal",
    "Rangpur", "Mymensingh", "Cumilla", "Gazipur", "Narayanganj", "Jessore"
  ];

  const quickFilters = [
    { name: 'Female Trainers', value: 'female', icon: Users },
    { name: 'Online Sessions', value: 'online', icon: MapPin },
    { name: 'Top Rated', value: 'top-rated', icon: Star },
    { name: 'Affordable', value: 'budget', icon: MapPin },
  ];

  // Define getPriceRange function before using it
  const getPriceRange = (range: string): { min: number; max: number } => {
    switch (range) {
      case '0-500': return { min: 0, max: 500 };
      case '500-1000': return { min: 500, max: 1000 };
      case '1000-2000': return { min: 1000, max: 2000 };
      case '2000+': return { min: 2000, max: 10000 };
      default: return { min: 0, max: 10000 };
    }
  };

  // Build search filters
  const searchFilters: TrainerSearchFilters = {
    search: debouncedSearchQuery || undefined,
    location: selectedLocation !== 'all' ? selectedLocation : undefined,
    specializations: selectedSpecializations.length > 0 ? selectedSpecializations : undefined,
    gender: selectedGender !== 'all' ? selectedGender : undefined,
    experienceLevel: experienceLevel !== 'all' ? experienceLevel : undefined,
    rating: minRating > 0 ? minRating : undefined,
    isOnline: appliedFilters.includes('online'),
    isVerified: appliedFilters.includes('verified'),
    sortBy: sortBy as any,
    priceRange: priceRange !== 'all' ? getPriceRange(priceRange) : undefined,
  };

  // Apply quick filters
  if (appliedFilters.includes('female')) {
    searchFilters.gender = 'female';
  }
  if (appliedFilters.includes('top-rated')) {
    searchFilters.rating = 4.5;
  }
  if (appliedFilters.includes('budget')) {
    searchFilters.priceRange = { min: 0, max: 800 };
  }

  const { data: trainers, isLoading } = useTrainerSearch(searchFilters);

  // Update search params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearchQuery) params.set('search', debouncedSearchQuery);
    if (selectedLocation !== 'all') params.set('location', selectedLocation);
    if (selectedSpecializations.length > 0) params.set('specialization', selectedSpecializations.join(','));
    if (priceRange !== 'all') params.set('price', priceRange);
    if (sortBy !== 'rating') params.set('sort', sortBy);
    if (selectedGender !== 'all') params.set('gender', selectedGender);
    setSearchParams(params);
  }, [debouncedSearchQuery, selectedLocation, selectedSpecializations, priceRange, sortBy, selectedGender, setSearchParams]);

  const handleSearch = () => {
    // Search is automatically triggered by the debounced search term
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedLocation('all');
    setSelectedSpecializations([]);
    setPriceRange('all');
    setSortBy('rating');
    setSelectedGender('all');
    setExperienceLevel('all');
    setMinRating(0);
    setAppliedFilters([]);
    setSearchParams(new URLSearchParams());
  };

  const handleQuickFilter = (filterValue: string) => {
    if (appliedFilters.includes(filterValue)) {
      setAppliedFilters(appliedFilters.filter(f => f !== filterValue));
    } else {
      setAppliedFilters([...appliedFilters, filterValue]);
    }
  };

  const handleFavorite = async (trainerId: string) => {
    if (!user) {
      toast.error('Please login to add favorites');
      return;
    }

    const isFavorited = favorites?.some(fav => fav.trainer_id === trainerId);
    
    try {
      if (isFavorited) {
        await removeFromFavorites.mutateAsync(trainerId);
        toast.success('Removed from favorites');
      } else {
        await addToFavorites.mutateAsync(trainerId);
        toast.success('Added to favorites');
      }
    } catch (error) {
      toast.error('Failed to update favorites');
    }
  };

  const handleBook = (trainer: any) => {
    if (!user) {
      toast.error('Please login to book a trainer');
      return;
    }
    setSelectedTrainer(trainer);
    setShowBookingModal(true);
  };

  const handleViewProfile = (trainer: any) => {
    setSelectedTrainer(trainer);
    setShowProfileModal(true);
  };

  const handleMessage = (trainerId: string) => {
    if (!user) {
      toast.error('Please login to message trainers');
      return;
    }
    
    // Navigate to the correct dashboard messages route based on user role
    const userRole = user.user_metadata?.role || 'client';
    const dashboardRoute = userRole === 'trainer' ? '/trainer-dashboard/messages' : '/client-dashboard/messages';
    
    navigate(dashboardRoute, {
      state: {
        startConversation: true,
        trainerId: trainerId,
        trainerName: trainers?.find(t => t.id === trainerId)?.name || 'Trainer'
      }
    });
  };

  // Define constants for SEO sections
  const howItWorksSteps = [
    {
      icon: Search,
      title: "Search Trainers",
      description: "Browse through our verified fitness professionals using advanced filters"
    },
    {
      icon: MessageCircle,
      title: "Connect & Chat",
      description: "Message trainers directly to discuss your fitness goals and requirements"
    },
    {
      icon: Calendar,
      title: "Book Sessions",
      description: "Schedule training sessions at your convenience with secure payment"
    },
    {
      icon: CheckCircle,
      title: "Start Training",
      description: "Begin your fitness journey with expert guidance and support"
    }
  ];

  const benefits = [
    {
      icon: Shield,
      title: "Verified Professionals",
      description: "All trainers are certified and background-checked for your safety and success"
    },
    {
      icon: Award,
      title: "Expert Guidance",
      description: "Get personalized training programs from experienced fitness professionals"
    },
    {
      icon: Clock,
      title: "Flexible Scheduling",
      description: "Book sessions that fit your schedule with 24/7 online booking system"
    },
    {
      icon: Heart,
      title: "Proven Results",
      description: "Join thousands who have achieved their fitness goals with our trainers"
    },
    {
      icon: Users,
      title: "Community Support",
      description: "Access to a supportive fitness community and ongoing motivation"
    },
    {
      icon: Zap,
      title: "Instant Booking",
      description: "Book and start training immediately with our streamlined process"
    }
  ];

  const faqs = [
    {
      question: "How do I choose the right personal trainer?",
      answer: "Consider their certifications, experience, specializations, and reviews. Use our filters to find trainers who match your specific fitness goals and preferences."
    },
    {
      question: "What are the rates for personal trainers in Bangladesh?",
      answer: "Rates vary from ৳500-2000+ per session depending on the trainer's experience, location, and service type. You can filter by price range to find options within your budget."
    },
    {
      question: "Can I book online or in-person sessions?",
      answer: "Yes! Many trainers offer both online and in-person sessions. You can filter by session type to find trainers who offer your preferred training method."
    },
    {
      question: "Are the trainers certified and verified?",
      answer: "Yes, all trainers on HealthyThako are certified professionals. Look for the verified badge and check their certifications and experience in their profiles."
    },
    {
      question: "What if I'm not satisfied with my trainer?",
      answer: "We offer a satisfaction guarantee. You can switch trainers anytime, and we'll help you find a better match for your fitness goals."
    }
  ];

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
                { label: 'Find Trainers', href: '/find-trainers' }
              ]}
              variant="light"
            />
          </div>

          <div className="text-center space-y-4 sm:space-y-6">
            <div className="space-y-2 sm:space-y-3">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
                <span className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">Find Your Perfect</span>
                <br />
                <span className="text-pink-600 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">Trainer</span>
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-white max-w-2xl mx-auto leading-relaxed font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                Connect with certified fitness professionals across Bangladesh
              </p>
            </div>

            {/* Search Input */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by name, specialization, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 pr-4 py-3 w-full rounded-full border-2 border-white/20 bg-white/10 text-white placeholder-white/60 backdrop-blur-sm focus:border-white/40 focus:ring-0"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Filters */}
      <section className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 overflow-x-auto scrollbar-hide">
              {quickFilters.map((filter) => {
                const Icon = filter.icon;
                const isActive = appliedFilters.includes(filter.value);
                return (
                  <button
                    key={filter.value}
                    onClick={() => handleQuickFilter(filter.value)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                      isActive 
                        ? 'bg-pink-100 text-pink-700 border border-pink-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{filter.name}</span>
                  </button>
                );
              })}
            </div>
            <Button
              variant="outline"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="md:hidden"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Applied Filters */}
      {(appliedFilters.length > 0 || searchQuery || selectedLocation !== 'all' || selectedSpecializations.length > 0 || priceRange !== 'all' || selectedGender !== 'all' || experienceLevel !== 'all' || minRating > 0) && (
        <section className="bg-gray-50 border-b border-gray-200 py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600 font-medium">Active filters:</span>
              <div className="flex flex-wrap items-center gap-2">
                {searchQuery && (
                  <Badge variant="secondary" className="bg-pink-100 text-pink-700">
                    Search: {searchQuery}
                    <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setSearchQuery('')} />
                  </Badge>
                )}
                {selectedLocation !== 'all' && (
                  <Badge variant="secondary" className="bg-pink-100 text-pink-700">
                    Location: {selectedLocation}
                    <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setSelectedLocation('all')} />
                  </Badge>
                )}
                {selectedSpecializations.map((spec) => (
                  <Badge key={spec} variant="secondary" className="bg-pink-100 text-pink-700">
                    {spec}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => setSelectedSpecializations(selectedSpecializations.filter(s => s !== spec))} 
                    />
                  </Badge>
                ))}
                {priceRange !== 'all' && (
                  <Badge variant="secondary" className="bg-pink-100 text-pink-700">
                    Price: ৳{priceRange}
                    <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setPriceRange('all')} />
                  </Badge>
                )}
                {selectedGender !== 'all' && (
                  <Badge variant="secondary" className="bg-pink-100 text-pink-700">
                    Gender: {selectedGender}
                    <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setSelectedGender('all')} />
                  </Badge>
                )}
                {experienceLevel !== 'all' && (
                  <Badge variant="secondary" className="bg-pink-100 text-pink-700">
                    Experience: {experienceLevel}
                    <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setExperienceLevel('all')} />
                  </Badge>
                )}
                {minRating > 0 && (
                  <Badge variant="secondary" className="bg-pink-100 text-pink-700">
                    Rating: {minRating}
                    <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setMinRating(0)} />
                  </Badge>
                )}
                {appliedFilters.map((filter) => (
                  <Badge
                    key={filter}
                    variant="secondary"
                    className="bg-pink-100 text-pink-700 cursor-pointer"
                    onClick={() => handleQuickFilter(filter)}
                  >
                    {filter}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                Clear all
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Enhanced Desktop Filters */}
      <section className={`bg-white border-b border-gray-200 ${showMobileFilters ? 'block' : 'hidden md:block'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map(location => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={selectedSpecializations[0] || 'all'} 
              onValueChange={(value) => setSelectedSpecializations(value === 'all' ? [] : [value])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Specialization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specializations</SelectItem>
                {specializations?.map(spec => (
                  <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger>
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Price</SelectItem>
                <SelectItem value="0-500">৳0 - ৳500</SelectItem>
                <SelectItem value="500-1000">৳500 - ৳1000</SelectItem>
                <SelectItem value="1000-2000">৳1000 - ৳2000</SelectItem>
                <SelectItem value="2000+">৳2000+</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedGender} onValueChange={setSelectedGender}>
              <SelectTrigger>
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Gender</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>

            <Select value={experienceLevel} onValueChange={setExperienceLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Experience</SelectItem>
                <SelectItem value="beginner">Beginner (0-2 years)</SelectItem>
                <SelectItem value="intermediate">Intermediate (3-5 years)</SelectItem>
                <SelectItem value="expert">Expert (5+ years)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
                <SelectItem value="experience">Most Experienced</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Available Trainers</h2>
            <p className="text-gray-600 mt-2 text-lg">
              {isLoading ? 'Loading...' : `${trainers?.length || 0} professional trainers found`}
            </p>
          </div>
        </div>

        {/* Trainers Grid - 4 columns as requested */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-16 w-16 animate-spin text-pink-600 mb-6" />
            <p className="text-gray-600 text-xl">Finding the best trainers for you...</p>
          </div>
        ) : trainers && trainers.length === 0 ? (
          <Card className="text-center py-20">
            <CardContent>
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <Search className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">No trainers found</h3>
              <p className="text-gray-600 mb-8 text-lg">Try adjusting your search criteria or filters</p>
              <Button onClick={clearAllFilters} className="bg-pink-600 hover:bg-pink-700 px-8 py-3 text-lg">
                Clear all filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {trainers?.map((trainer) => (
              <TrainerProfileCard
                key={trainer.id}
                trainer={{
                  id: trainer.id,
                  name: trainer.name,
                  email: trainer.email,
                  location: trainer.location,
                  trainer_profiles: trainer.trainer_profiles,
                  average_rating: trainer.average_rating || 0,
                  total_reviews: trainer.total_reviews || 0,
                  completed_bookings: trainer.completed_bookings || 0,
                  active_gigs: trainer.active_gigs || 0
                }}
                onBook={handleBook}
                onMessage={handleMessage}
                onFavorite={handleFavorite}
                onViewProfile={handleViewProfile}
                isFavorited={favorites?.some(fav => fav.id === trainer.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* SEO Sections */}
      <HowItWorksSection 
        title="How to Find Personal Trainers in Bangladesh"
        description="Getting started with HealthyThako is simple. Follow these easy steps to connect with certified fitness professionals near you."
        steps={howItWorksSteps}
      />

      <BenefitsSection 
        title="Why Choose HealthyThako for Personal Training?"
        description="Experience the best fitness training platform in Bangladesh with verified professionals and proven results."
        benefits={benefits}
      />

      <LocationsSection 
        title="Personal Trainers Available Across Bangladesh"
        description="Find certified fitness trainers in major cities and districts throughout Bangladesh."
        locations={locations}
      />

      <FAQSection 
        title="Frequently Asked Questions"
        description="Get answers to common questions about finding and hiring personal trainers in Bangladesh."
        faqs={faqs}
      />

      {/* Join as Trainer Section */}
      <section className="bg-gradient-to-br from-pink-50 to-rose-50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-gray-900">
                  Launch Your Training Business
                </h2>
                <p className="text-lg text-gray-600">
                  Join Bangladesh's fastest-growing fitness platform and connect with clients who need your expertise.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center mt-0.5">
                    <Check className="h-3 w-3 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Reach More Clients</h3>
                    <p className="text-sm text-gray-600">Get discovered by fitness seekers across Bangladesh</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center mt-0.5">
                    <Check className="h-3 w-3 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Flexible Schedule</h3>
                    <p className="text-sm text-gray-600">Work in-person or online, full-time or part-time</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center mt-0.5">
                    <Check className="h-3 w-3 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Zero Fees</h3>
                    <p className="text-sm text-gray-600">No upfront costs—earn directly from clients</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/join-trainer">
                  <Button className="bg-gradient-to-r from-[#8b1538] to-[#c90e5c] hover:from-[#7a1230] hover:to-[#b50d52] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
                    Join as a Trainer
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="outline" className="border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium">
                  Learn More
                </Button>
              </div>
            </div>
            
            {/* Right Stats */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="text-2xl font-bold text-gray-900 mb-1">500+</div>
                <div className="text-sm text-gray-600">Active Trainers</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="text-2xl font-bold text-gray-900 mb-1">10K+</div>
                <div className="text-sm text-gray-600">Happy Clients</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="text-2xl font-bold text-gray-900 mb-1">₹15K+</div>
                <div className="text-sm text-gray-600">Avg. Monthly Earnings</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="text-2xl font-bold text-gray-900 mb-1">4.9/5</div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Modals */}
      {selectedTrainer && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedTrainer(null);
          }}
          trainer={{
            id: selectedTrainer.id,
            name: selectedTrainer.name,
            trainer_profile: {
              rate_per_hour: parseFloat(String(selectedTrainer.trainer_profiles?.rate_per_hour)) || 1200,
              specializations: selectedTrainer.trainer_profiles?.specializations || []
            }
          }}
        />
      )}

      {selectedTrainer && (
        <TrainerProfileModal
          trainer={selectedTrainer}
          isOpen={showProfileModal}
          onClose={() => {
            setShowProfileModal(false);
            setSelectedTrainer(null);
          }}
          onBook={() => {
            setShowProfileModal(false);
            setShowBookingModal(true);
          }}
          onMessage={() => handleMessage(selectedTrainer.id)}
        />
      )}
    </div>
  );
};

export default FindTrainers;
