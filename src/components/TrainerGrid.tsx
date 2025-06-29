import React from 'react';
import TrainerCard from './TrainerCard';
const TrainerGrid = () => {
  // Sample trainer data
  const trainers = [{
    id: '1',
    name: 'Misha Rahman',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    specialization: 'Yoga & Flexibility',
    rating: 4.9,
    reviewCount: 127,
    location: 'Dhaka, Banani',
    pricePerHour: 1200,
    responseTime: '1 hour',
    isVerified: true,
    services: ['Hatha Yoga', 'Power Yoga', 'Meditation', 'Flexibility Training']
  }, {
    id: '2',
    name: 'Rakib Ahmed',
    image: 'https://images.unsplash.com/photo-1583500178690-500ac2991c3d?w=400&h=300&fit=crop',
    specialization: 'Strength Training',
    rating: 4.8,
    reviewCount: 89,
    location: 'Dhaka, Gulshan',
    pricePerHour: 1500,
    responseTime: '30 min',
    isVerified: true,
    services: ['Weight Training', 'Muscle Building', 'Powerlifting', 'Nutrition']
  }, {
    id: '3',
    name: 'Fatima Khatun',
    image: 'https://images.unsplash.com/photo-1594736797933-d0201ba2fe65?w=400&h=300&fit=crop',
    specialization: 'Weight Loss',
    rating: 4.7,
    reviewCount: 156,
    location: 'Online & Dhaka',
    pricePerHour: 1000,
    responseTime: '2 hours',
    isVerified: true,
    services: ['HIIT', 'Cardio', 'Diet Planning', 'Body Transformation']
  }, {
    id: '4',
    name: 'Karim Hassan',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=300&fit=crop',
    specialization: 'Functional Training',
    rating: 4.9,
    reviewCount: 98,
    location: 'Chittagong',
    pricePerHour: 1300,
    responseTime: '1 hour',
    isVerified: true,
    services: ['CrossFit', 'Functional Movement', 'Athletic Training', 'Injury Prevention']
  }, {
    id: '5',
    name: 'Nadia Islam',
    image: 'https://images.unsplash.com/photo-1506629905061-bbd87d7d4a1a?w=400&h=300&fit=crop',
    specialization: 'Pilates & Core',
    rating: 4.8,
    reviewCount: 73,
    location: 'Online Only',
    pricePerHour: 900,
    responseTime: '45 min',
    isVerified: true,
    services: ['Pilates', 'Core Strengthening', 'Posture Correction', 'Rehabilitation']
  }, {
    id: '6',
    name: 'Arif Rahman',
    image: 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=400&h=300&fit=crop',
    specialization: 'Boxing & Cardio',
    rating: 4.6,
    reviewCount: 112,
    location: 'Dhaka, Dhanmondi',
    pricePerHour: 1400,
    responseTime: '1.5 hours',
    isVerified: false,
    services: ['Boxing', 'Kickboxing', 'HIIT', 'Endurance Training']
  }];
  return <section className="relative py-16 bg-gradient-to-br from-slate-50 via-white to-pink-50/30">
      {/* Background pattern */}
      <div className="absolute inset-0 pattern-dots opacity-40 py-0"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 py-0">
          <div className="inline-flex items-center justify-center p-2 bg-pink-100 rounded-full mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-700 to-pink-800 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Meet Our <span className="text-brand-gradient">Expert Trainers</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Connect with certified fitness professionals who are passionate about helping you achieve your health and wellness goals
          </p>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center justify-between mb-10 p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-pink-100/50 shadow-lg">
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-700">{trainers.length}+</div>
              <div className="text-sm font-medium text-gray-600">Featured Trainers</div>
            </div>
            <div className="w-px h-12 bg-gray-200"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">500+</div>
              <div className="text-sm font-medium text-gray-600">Total Professionals</div>
            </div>
            <div className="w-px h-12 bg-gray-200"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">4.8</div>
              <div className="text-sm font-medium text-gray-600">Average Rating</div>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              All trainers verified
            </div>
          </div>
        </div>
        
        {/* Trainers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trainers.map(trainer => <div key={trainer.id} className="group">
              <TrainerCard trainer={trainer} />
            </div>)}
        </div>

        {/* Load More Section */}
        <div className="text-center mt-16">
          <div className="inline-flex flex-col items-center gap-4">
            <button className="relative group px-8 py-4 bg-gradient-to-r from-pink-700 via-pink-800 to-pink-900 text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <span className="relative flex items-center gap-2">
                Explore More Trainers
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
            <p className="text-sm text-gray-500 font-medium">
              Join thousands of satisfied clients in their fitness journey
            </p>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[{
          label: 'Verified Professionals',
          value: '100%',
          icon: 'shield'
        }, {
          label: 'Success Rate',
          value: '95%',
          icon: 'trophy'
        }, {
          label: 'Client Satisfaction',
          value: '4.9/5',
          icon: 'star'
        }, {
          label: 'Response Time',
          value: '<1hr',
          icon: 'clock'
        }].map((stat, index) => <div key={index} className="text-center p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-gray-100">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <div className="w-5 h-5 text-pink-700">
                  {stat.icon === 'shield' && <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>}
                  {stat.icon === 'trophy' && <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>}
                  {stat.icon === 'star' && <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>}
                  {stat.icon === 'clock' && <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>}
                </div>
              </div>
              <div className="text-lg font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-xs font-medium text-gray-600">{stat.label}</div>
            </div>)}
        </div>
      </div>
    </section>;
};
export default TrainerGrid;