import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Aurora from '@/components/Aurora';
import Breadcrumb from '@/components/Breadcrumb';
import LoadingSpinner from '@/components/LoadingSpinner';
import { 
  Search, 
  MapPin, 
  Star, 
  Clock, 
  Phone, 
  Dumbbell, 
  Eye, 
  CreditCard, 
  Users,
  Filter,
  X,
  Award,
  Shield,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';
import { useGyms, type Gym } from '@/hooks/useGyms';
import GymCard from '@/components/GymCard';
import { useAllGymMembershipPlans } from '@/hooks/useGymMembershipPlans';

interface GymFilters {
  search: string;
  location: string;
  priceRange: [number, number];
  sortBy: string;
}

const GymMembership = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [filteredGyms, setFilteredGyms] = useState<Gym[]>([]);
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('location') || 'all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'rating');
  const [minRating, setMinRating] = useState(0);
  const [appliedFilters, setAppliedFilters] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Debounce search query to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const locations = [
    'Dhaka',
    'Chittagong',
    'Sylhet',
    'Rajshahi',
    'Khulna',
    'Barisal',
    'Rangpur',
    'Mymensingh'
  ];

  const quickFilters = [
    { name: 'Verified Gyms', value: 'verified', icon: Shield },
    { name: 'Budget Friendly', value: 'budget', icon: CreditCard },
    { name: 'Top Rated', value: 'top-rated', icon: Star },
    { name: 'Premium Facilities', value: 'premium', icon: Award },
  ];

  const sortOptions = [
    { name: 'Rating', value: 'rating', icon: Star },
    { name: 'Location', value: 'location', icon: MapPin },
    { name: 'Premium Facilities', value: 'premium', icon: Award },
  ];

  const { data: gymsData, isLoading: isLoadingGyms, error: gymsError } = useGyms();
  const { data: allMembershipPlans, isLoading: isLoadingPlans } = useAllGymMembershipPlans();

  const isLoading = isLoadingGyms || isLoadingPlans;
  const error = gymsError;

  // Debug logging
  console.log('GymMembership Debug:', { 
    gyms: gymsData, 
    isLoading, 
    error, 
    gymsLength: gymsData?.length,
    membershipPlans: allMembershipPlans
  });

  useEffect(() => {
    if (gymsData) {
      setGyms(gymsData);
    }
  }, [gymsData]);

  useEffect(() => {
    const filtered = filterGyms();
    setFilteredGyms(filtered);

    // Update URL params
    const params = new URLSearchParams();
    if (debouncedSearchQuery) params.set('search', debouncedSearchQuery);
    if (selectedLocation) params.set('location', selectedLocation);
    if (sortBy) params.set('sort', sortBy);
    setSearchParams(params);
  }, [debouncedSearchQuery, selectedLocation, priceRange, sortBy, setSearchParams, gyms, allMembershipPlans]);

  const filterGyms = () => {
    if (!gyms || !allMembershipPlans) return [];

    return gyms.filter(gym => {
      // Get the gym's membership plans
      const gymPlans = allMembershipPlans.filter(plan => plan.gym_id === gym.id);
      const cheapestPlan = gymPlans.length > 0 
        ? gymPlans.reduce((min, plan) => plan.price < min.price ? plan : min, gymPlans[0])
        : null;

      const matchesSearch = !debouncedSearchQuery || 
        gym.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        gym.description?.toLowerCase().includes(debouncedSearchQuery.toLowerCase());

      const matchesLocation = selectedLocation === 'all' || 
        gym.city.toLowerCase() === selectedLocation.toLowerCase();

      const matchesPrice = !cheapestPlan || 
        (Number(cheapestPlan.price) >= priceRange[0] && Number(cheapestPlan.price) <= priceRange[1]);

      return matchesSearch && matchesLocation && matchesPrice;
    }).sort((a, b) => {
      if (sortBy === 'rating') return (Number(b.rating) || 0) - (Number(a.rating) || 0);
      if (sortBy === 'location') return a.city.localeCompare(b.city);
      if (sortBy === 'premium') return ((Number(b.rating) || 0) * (b.review_count || 0)) - ((Number(a.rating) || 0) * (a.review_count || 0));
      return 0;
    });
  };

  const handleQuickFilter = (filterValue: string) => {
    if (appliedFilters.includes(filterValue)) {
      setAppliedFilters(appliedFilters.filter(f => f !== filterValue));
    } else {
      setAppliedFilters([...appliedFilters, filterValue]);
      
      // Apply specific filter logic
      if (filterValue === 'top-rated') {
        setMinRating(4.5);
      } else if (filterValue === 'budget') {
        setPriceRange([0, 3000]);
      } else if (filterValue === 'premium') {
        setPriceRange([6000, 10000]);
      }
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedLocation('all');
    setPriceRange([0, 10000]);
    setSortBy('rating');
    setMinRating(0);
    setAppliedFilters([]);
    setSearchParams(new URLSearchParams());
  };

  const handleJoinGym = (gym: Gym) => {
    navigate(`/join-gym/${gym.id}`);
  };

  const handleViewGymDetails = (gym: Gym) => {
    navigate(`/gym/${gym.id}`);
  };

  const handleFavoriteGym = (gymId: string) => {
    // TODO: Implement favorite functionality
    console.log('Favorite gym:', gymId);
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
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Gyms</h2>
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
                { label: 'Gym Memberships', href: '/gym-memberships' }
              ]}
              variant="light"
            />
          </div>

          <div className="text-center space-y-4 sm:space-y-6">
            <div className="space-y-2 sm:space-y-3">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
                <span className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">Find Your Perfect</span>
                <br />
                <span className="text-pink-600 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">Gym</span>
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-white max-w-2xl mx-auto leading-relaxed font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                Discover and join the best gyms in your area
              </p>
            </div>

            {/* Search Input */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search gyms by name or location..."
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
                    <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{filter.name}</span>
                  </button>
                );
              })}
            </div>
            
            {(appliedFilters.length > 0 || debouncedSearchQuery || selectedLocation || priceRange[0] !== 0 || priceRange[1] !== 10000) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-gray-500 hover:text-gray-700 whitespace-nowrap ml-2 sm:ml-4"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-6 sm:py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search gyms..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Location Filter */}
            <div className="w-full sm:w-48">
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location.toLowerCase()}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort By */}
            <div className="w-full sm:w-48">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="h-4 w-4" />
                        {option.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price Range */}
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Price Range: ৳{priceRange[0]} - ৳{priceRange[1]}</p>
            <Slider
              value={priceRange}
              min={0}
              max={10000}
              step={500}
              onValueChange={(value) => setPriceRange(value as [number, number])}
            />
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <p className="text-sm sm:text-base text-gray-600">
            {filteredGyms.length} gym{filteredGyms.length !== 1 ? 's' : ''} found
          </p>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMobileFilters(true)}
            className="lg:hidden"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Gyms Grid */}
        <section className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-8 sm:py-12">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredGyms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredGyms.map((gym) => (
                <GymCard 
                  key={gym.id} 
                  gym={gym} 
                  onJoinClick={handleJoinGym}
                  onViewDetails={handleViewGymDetails}
                  onFavorite={handleFavoriteGym}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No gyms found matching your criteria.</p>
            </div>
          )}
        </section>

        {/* No Results */}
        {filteredGyms.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No gyms found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or removing some filters
            </p>
            <Button onClick={clearAllFilters} variant="outline">
              Clear All Filters
            </Button>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default GymMembership;
