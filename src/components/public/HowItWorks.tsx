
import React from 'react';
import { Search, UserCheck, Calendar, Star } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: Search,
      title: 'Find Your Trainer',
      description: 'Browse certified trainers by location, specialty, price, and ratings. Use filters to find the perfect match for your goals.',
      step: '01'
    },
    {
      icon: UserCheck,
      title: 'Review & Choose',
      description: 'Read reviews, check credentials, and view trainer profiles. Message trainers directly to discuss your requirements.',
      step: '02'
    },
    {
      icon: Calendar,
      title: 'Book Sessions',
      description: 'Schedule sessions at your convenience. Choose between home visits, gym sessions, or virtual training. Secure payment options.',
      step: '03'
    },
    {
      icon: Star,
      title: 'Train & Progress',
      description: 'Start your fitness journey with personalized training. Track progress, achieve goals, and leave reviews for future clients.',
      step: '04'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How HealthyThako Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Getting started with professional fitness training has never been easier. Follow these simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={index} className="relative">
                <div className="card-professional rounded-2xl p-8 text-center group">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="w-8 h-8 custom-gradient rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-sm font-bold">{step.step}</span>
                    </div>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-[#3c0747]/10 to-[#c90e5c]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 mt-4 group-hover:shadow-lg transition-all duration-300">
                    <IconComponent className="h-8 w-8 text-[#3c0747]" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-[#3c0747]/20 to-[#c90e5c]/20 transform -translate-y-1/2"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
