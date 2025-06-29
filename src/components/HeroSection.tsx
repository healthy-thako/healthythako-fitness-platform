import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, Star, Users, MapPin, Sparkles, TrendingUp, ChevronDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import BlurText from '@/components/BlurText';

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('trainer');
  const [currentText, setCurrentText] = useState('Perfect Trainer');
  const navigate = useNavigate();

  // Dynamic suggested keywords based on search type
  const getSuggestedKeywords = () => {
    switch (searchType) {
      case 'trainer':
        return ['Weight Loss Trainer', 'Yoga Instructor', 'Female Trainer', 'Home Workout', 'HIIT Training', 'Strength Coach'];
      case 'fitness-center':
        return ['24/7 Gym', 'Women Only Gym', 'Swimming Pool', 'CrossFit Box', 'Yoga Studio', 'Premium Gym'];
      case 'service':
        return ['Personal Training', 'Group Classes', 'Nutrition Coaching', 'Online Training', 'Yoga Classes', 'Weight Loss Program'];
      default:
        return ['Weight Loss Trainer', 'Yoga Instructor', 'Female Trainer', 'Home Workout', 'HIIT Training', 'Strength Coach'];
    }
  };

  // Animation cycle for text change
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentText(prev => prev === 'Perfect Trainer' ? 'Perfect Gym' : 'Perfect Trainer');
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = () => {
    const query = searchQuery.trim();
    
    if (searchType === 'fitness-center') {
      navigate(query ? `/gym-membership?search=${encodeURIComponent(query)}` : '/gym-membership');
    } else if (searchType === 'trainer') {
      navigate(query ? `/find-trainers?search=${encodeURIComponent(query)}` : '/find-trainers');
    } else if (searchType === 'service') {
      navigate(query ? `/browse-services?search=${encodeURIComponent(query)}` : '/browse-services');
    }
  };

  const handleKeywordClick = (keyword: string) => {
    setSearchQuery(keyword);
    if (searchType === 'fitness-center') {
      navigate(`/gym-membership?search=${encodeURIComponent(keyword)}`);
    } else if (searchType === 'trainer') {
      navigate(`/find-trainers?search=${encodeURIComponent(keyword)}`);
    } else if (searchType === 'service') {
      navigate(`/browse-services?search=${encodeURIComponent(keyword)}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getPlaceholder = () => {
    switch (searchType) {
      case 'fitness-center':
        return 'What fitness center can I help you find?';
      case 'trainer':
        return 'What trainer can I help you find?';
      case 'service':
        return 'What fitness service can I help you with?';
      default:
        return 'What can I help you with?';
    }
  };

  const getTypeDisplayName = () => {
    switch (searchType) {
      case 'fitness-center':
        return 'Fitness Center';
      case 'trainer':
        return 'Trainer';
      case 'service':
        return 'Service';
      default:
        return 'Select Type';
    }
  };

  const getPopularSearchLabel = () => {
    switch (searchType) {
      case 'fitness-center':
        return 'Popular gyms & fitness centers:';
      case 'trainer':
        return 'Popular trainer searches:';
      case 'service':
        return 'Popular fitness services:';
      default:
        return 'Popular searches:';
    }
  };

  return (
    <section className="relative min-h-[85vh] sm:min-h-screen flex items-center justify-center overflow-hidden font-inter">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="/lovable-uploads/d0606518-d795-44c8-bd32-9fef6e95ccfc.png" 
          alt="HealthyThako - Find certified fitness trainers and premium gyms in Bangladesh" 
          className="w-full h-full object-cover object-center" 
        />
      </div>
      
      <div className="relative max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-8 sm:py-12 lg:py-16 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Side - Content */}
          <div className="text-left space-y-4 sm:space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 bg-white/90 backdrop-blur-sm rounded-full border border-slate-200/50 shadow-sm">
              <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-slate-600 mr-1.5 sm:mr-2" />
              <span className="text-slate-700 text-xs font-medium tracking-wide">
                Bangladesh's First One-Stop Fitness Platform
              </span>
            </div>

            {/* Main Heading */}
            <div className="space-y-2 sm:space-y-3">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight tracking-tight">
                <span className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] text-xl sm:text-2xl">Find Your</span>
                <br />
                <BlurText 
                  key={currentText} 
                  text={currentText} 
                  className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-pink-600 font-bold" 
                  delay={100} 
                  animateBy="words" 
                  direction="top" 
                  stepDuration={0.3} 
                />
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-white max-w-xl leading-relaxed font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                Find Trainer and Gym in Bangladesh. Book certified trainers for home, gym, or virtual sessions. Transform your fitness journey with Bangladesh's top trainers.
              </p>
            </div>
            
            {/* Compact Beautiful Animated Search Bar */}
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Category Dropdown - LEFT */}
                <div className="flex-shrink-0">
                  <Select value={searchType} onValueChange={setSearchType}>
                    <SelectTrigger className="w-28 sm:w-36 h-12 sm:h-14 bg-white/95 backdrop-blur-sm border-4 border-transparent rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 focus:ring-0 focus:ring-offset-0 bg-gradient-to-r from-white to-gray-50 text-gray-800 font-semibold text-xs sm:text-sm">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse"></div>
                        <span className="hidden sm:inline">{getTypeDisplayName()}</span>
                        <span className="sm:hidden text-xs">{searchType === 'fitness-center' ? 'Gym' : searchType === 'trainer' ? 'Trainer' : 'Service'}</span>
                      </div>
                      <ChevronDown className="h-3 w-3 text-gray-600" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-0 bg-white shadow-2xl">
                      <SelectItem value="trainer" className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"></div>
                          <span className="font-medium">Trainer</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="fitness-center" className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full"></div>
                          <span className="font-medium">Fitness Center</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="service" className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-teal-400 rounded-full"></div>
                          <span className="font-medium">Service</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Compact Animated Search Input - MIDDLE */}
                <div className="flex-1 relative group">
                  {/* Animated Sparkle Icons */}
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                    <svg 
                      className="w-5 h-5 text-gray-400 group-hover:text-purple-500 group-focus-within:text-purple-500 transition-colors duration-300" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        className="sparkle-path-1" 
                        fillRule="evenodd" 
                        clipRule="evenodd" 
                        d="M11.5 6C11.3949 6.00006 11.2925 5.96705 11.2073 5.90565C11.1221 5.84425 11.0583 5.75758 11.0251 5.65792L10.7623 4.86908C10.6623 4.57101 10.4288 4.33629 10.13 4.23693L9.34102 3.97354C9.24166 3.94019 9.1553 3.87649 9.09411 3.79142C9.03292 3.70635 9 3.60421 9 3.49943C9 3.39465 9.03292 3.29252 9.09411 3.20745C9.1553 3.12238 9.24166 3.05867 9.34102 3.02532L10.13 2.76193C10.4282 2.66191 10.663 2.42852 10.7623 2.12979L11.0258 1.34094C11.0591 1.24161 11.1229 1.15526 11.2079 1.09409C11.293 1.03291 11.3952 1 11.5 1C11.6048 1 11.707 1.03291 11.7921 1.09409C11.8771 1.15526 11.9409 1.24161 11.9742 1.34094L12.2377 2.12979C12.2868 2.27697 12.3695 2.4107 12.4792 2.52041C12.589 2.63013 12.7227 2.71281 12.87 2.76193L13.659 3.02532C13.7583 3.05867 13.8447 3.12238 13.9059 3.20745C13.9671 3.29252 14 3.39465 14 3.49943C14 3.60421 13.9671 3.70635 13.9059 3.79142C13.8447 3.87649 13.7583 3.94019 13.659 3.97354L12.87 4.23693C12.5718 4.33696 12.337 4.57034 12.2377 4.86908L11.9742 5.65792C11.9411 5.75747 11.8774 5.84406 11.7923 5.90545C11.7072 5.96684 11.6049 5.99992 11.5 6Z" 
                        fill="currentColor" 
                      />
                      <path 
                        className="sparkle-path-2" 
                        fillRule="evenodd" 
                        clipRule="evenodd" 
                        d="M6 13C5.85133 13.0001 5.7069 12.9504 5.58969 12.859C5.47247 12.7675 5.38921 12.6395 5.35313 12.4952L5.12388 11.5745C4.91418 10.7391 4.26198 10.0868 3.42674 9.87703L2.50619 9.64774C2.36169 9.61194 2.23333 9.52878 2.14159 9.41151C2.04985 9.29425 2 9.14964 2 9.00075C2 8.85185 2.04985 8.70724 2.14159 8.58998C2.23333 8.47272 2.36169 8.38955 2.50619 8.35376L3.42674 8.12446C4.26198 7.91473 4.91418 7.2624 5.12388 6.427L5.35313 5.50629C5.38892 5.36176 5.47207 5.23338 5.58931 5.14162C5.70655 5.04986 5.85113 5 6 5C6.14887 5 6.29345 5.04986 6.41069 5.14162C6.52793 5.23338 6.61108 5.36176 6.64687 5.50629L6.87612 6.427C6.97865 6.83721 7.19071 7.21184 7.48965 7.51082C7.78858 7.80981 8.16313 8.02192 8.57326 8.12446L9.49381 8.35376C9.63831 8.38955 9.76667 8.47272 9.85841 8.58998C9.95015 8.70724 10 8.85185 10 9.00075C10 9.14964 9.95015 9.29425 9.85841 9.41151C9.76667 9.52878 9.63831 9.61194 9.49381 9.64774L8.57326 9.87703C8.16313 9.97957 7.78858 10.1917 7.48965 10.4907C7.19071 10.7897 6.97865 11.1643 6.87612 11.5745L6.64687 12.4952C6.61079 12.6395 6.52753 12.7675 6.41031 12.859C6.2931 12.9504 6.14867 13.0001 6 13Z" 
                        fill="currentColor" 
                      />
                      <path 
                        className="sparkle-path-3" 
                        fillRule="evenodd" 
                        clipRule="evenodd" 
                        d="M13.5005 23C13.3376 23 13.1791 22.9469 13.049 22.8487C12.9189 22.7505 12.8243 22.6127 12.7795 22.456L11.9665 19.61C11.7915 18.9971 11.4631 18.4389 11.0124 17.9882C10.5616 17.5374 10.0035 17.209 9.39054 17.034L6.54454 16.221C6.38795 16.1761 6.25021 16.0815 6.15216 15.9514C6.05411 15.8214 6.00108 15.6629 6.00108 15.5C6.00108 15.3371 6.05411 15.1786 6.15216 15.0486C6.25021 14.9185 6.38795 14.8239 6.54454 14.779L9.39054 13.966C10.0035 13.791 10.5616 13.4626 11.0124 13.0118C11.4631 12.5611 11.7915 12.0029 11.9665 11.39L12.7795 8.544C12.8244 8.38741 12.919 8.24967 13.0491 8.15162C13.1792 8.05357 13.3376 8.00054 13.5005 8.00054C13.6634 8.00054 13.8219 8.05357 13.952 8.15162C14.0821 8.24967 14.1767 8.38741 14.2215 8.544L15.0345 11.39C15.2096 12.0029 15.538 12.5611 15.9887 13.0118C16.4394 13.4626 16.9976 13.791 17.6105 13.966L20.4565 14.779C20.6131 14.8239 20.7509 14.9185 20.8489 15.0486C20.947 15.1786 21 15.3371 21 15.5C21 15.6629 20.947 15.8214 20.8489 15.9514C20.7509 16.0815 20.6131 16.1761 20.4565 16.221L17.6105 17.034C16.9976 17.209 16.4394 17.5374 15.9887 17.9882C15.538 18.4389 15.2096 18.9971 15.0345 19.61L14.2215 22.456C14.1768 22.6127 14.0822 22.7505 13.9521 22.8487C13.822 22.9469 13.6635 23 13.5005 23Z" 
                        fill="currentColor" 
                      />
                    </svg>
                  </div>

                  <input 
                    type="text" 
                    value={searchQuery} 
                    onChange={e => setSearchQuery(e.target.value)} 
                    onKeyPress={handleKeyPress} 
                    placeholder={getPlaceholder()}
                    className="search-input w-full h-12 sm:h-14 pl-10 pr-4 text-gray-800 font-medium text-sm sm:text-base rounded-xl outline-none transition-all duration-300 min-w-[280px] placeholder-gray-400"
                  />
                </div>

                {/* Search Button - RIGHT (Styled exactly like Header's Start Journey) */}
                <div className="flex-shrink-0">
                  <div className="relative inline-flex items-center justify-center group">
                    <div className="absolute inset-0 duration-1000 opacity-60 transition-all bg-gradient-to-r from-indigo-500 via-pink-500 to-yellow-400 rounded-lg blur-lg filter group-hover:opacity-100 group-hover:duration-200"></div>
                    <button 
                      onClick={handleSearch}
                      className="relative text-white rounded-lg px-3 sm:px-4 py-3 sm:py-3.5 shadow-md hover:shadow-lg transition-all duration-200 font-medium text-xs sm:text-sm bg-gray-900 hover:bg-gray-800 hover:-translate-y-0.5 hover:shadow-gray-600/30 flex items-center gap-1.5"
                    >
                      <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Search</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Search type indicator */}
              <div className="mt-2 flex items-center gap-2 text-white/70 text-xs font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse"></div>
                <span>Searching in: {getTypeDisplayName()}</span>
              </div>
            </div>

            {/* Dynamic Popular searches */}
            <div className="max-w-xl">
              <p className="text-white text-xs mb-1.5 font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{getPopularSearchLabel()}</p>
              <div className="flex flex-wrap gap-1.5">
                {getSuggestedKeywords().map((keyword, index) => (
                  <button 
                    key={`${searchType}-${keyword}-${index}`} 
                    onClick={() => handleKeywordClick(keyword)} 
                    className="px-2 py-0.5 backdrop-blur-sm rounded-full text-xs hover:scale-105 transition-all duration-300 border border-white/40 font-medium shadow-sm hover:shadow-md bg-white/[0.14] text-slate-50 hover:bg-white/[0.25] cursor-pointer"
                  >
                    {keyword}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-4 sm:pt-6">
              {[{
                icon: Users,
                number: '10,000+',
                label: 'Happy Clients'
              }, {
                icon: Star,
                number: '500+',
                label: 'Verified Trainers'
              }, {
                icon: MapPin,
                number: '50+',
                label: 'Cities Covered'
              }].map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-white/20 backdrop-blur-sm rounded-full mb-1 sm:mb-2">
                      <IconComponent className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    </div>
                    <div className="text-white">
                      <div className="text-sm sm:text-lg font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{stat.number}</div>
                      <div className="text-xs drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{stat.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Side - Reserved for background image models */}
          <div className="hidden lg:block">
            {/* This space is reserved for the models in the background image */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
