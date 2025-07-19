import React from 'react';
import TrainerCard from './TrainerCard';
import { useTrainerSearch } from '@/hooks/useTrainerSearch';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const TrainerGrid = () => {
  // Fetch real trainer data
  const { data: trainers, isLoading, error } = useTrainerSearch({
    limit: 6 // Show 6 trainers on homepage
  });

  if (isLoading) {
    return (
      <section className="relative py-16 bg-gradient-to-br from-slate-50 via-white to-pink-50/30">
        {/* Background pattern */}
        <div className="absolute inset-0 pattern-dots opacity-40 py-0"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    console.error('Error loading trainers:', error);
    return (
      <section className="relative py-16 bg-gradient-to-br from-slate-50 via-white to-pink-50/30">
        {/* Background pattern */}
        <div className="absolute inset-0 pattern-dots opacity-40 py-0"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg mb-4">Unable to load trainers at the moment.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!trainers || trainers.length === 0) {
    return (
      <section className="relative py-16 bg-gradient-to-br from-slate-50 via-white to-pink-50/30">
        {/* Background pattern */}
        <div className="absolute inset-0 pattern-dots opacity-40 py-0"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No trainers available.</p>
          </div>
        </div>
      </section>
    );
  }

  // Check if we're using fallback data for subtle notification
  const isFallbackData = trainers.some(trainer => trainer.id.startsWith('fallback-'));

  return (
    <section className="relative py-16 bg-gradient-to-br from-slate-50 via-white to-pink-50/30">
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
            Meet Our <span className="text-custom-gradient">Expert Trainers</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Connect with certified fitness professionals who are passionate about helping you achieve your health and wellness goals
          </p>
        </div>

        {/* Subtle fallback data notice */}
        {isFallbackData && (
          <div className="mb-8 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-sm text-blue-700">
              <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
              Showing sample profiles
            </div>
          </div>
        )}

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
          {trainers.map(trainer => (
            <div key={trainer.id} className="group">
              <TrainerCard trainer={trainer} />
            </div>
          ))}
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
        }].map((stat, index) => (
            <div key={index} className="text-center p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-gray-100">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <div className="w-5 h-5 text-pink-700">
                  {stat.icon === 'shield' && (
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  )}
                  {stat.icon === 'trophy' && (
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  )}
                  {stat.icon === 'star' && (
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  )}
                  {stat.icon === 'clock' && (
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
              </div>
              <div className="text-lg font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-xs font-medium text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrainerGrid;