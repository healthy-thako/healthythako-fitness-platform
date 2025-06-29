
import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, Star } from 'lucide-react';
import Aurora from '@/components/Aurora';

const LocationCoverage = () => {
  const locations = [
    {
      city: 'Dhaka',
      areas: ['Banani', 'Gulshan', 'Dhanmondi', 'Uttara'],
      trainers: 180,
      rating: 4.9
    },
    {
      city: 'Chittagong',
      areas: ['Panchlaish', 'Khulshi', 'Agrabad'],
      trainers: 85,
      rating: 4.8
    },
    {
      city: 'Sylhet',
      areas: ['Zindabazar', 'Lamabazar', 'Tilagarh'],
      trainers: 45,
      rating: 4.9
    },
    {
      city: 'Rajshahi',
      areas: ['New Market', 'Court Area'],
      trainers: 35,
      rating: 4.8
    },
    {
      city: 'Khulna',
      areas: ['Boyra', 'Sonadanga'],
      trainers: 28,
      rating: 4.7
    },
    {
      city: 'Barisal',
      areas: ['Sadar', 'Band Road'],
      trainers: 22,
      rating: 4.8
    }
  ];

  return (
    <section className="relative py-12 md:py-16 overflow-hidden">
      {/* Aurora Background */}
      <div className="absolute inset-0">
        <Aurora 
          colorStops={["#3c0747", "#7c3aed", "#ec4899"]}
          amplitude={1.2}
          blend={0.7}
          speed={0.8}
        />
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-purple-800/80 to-pink-800/90"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div 
          className="text-center mb-8 md:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center px-2 md:px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full text-xs font-medium text-purple-200 mb-3 md:mb-4 backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <MapPin className="w-3 h-3 mr-1" />
            Location Coverage
          </motion.div>
          
          <h2 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent mb-2 md:mb-3">
            Fitness Network Across Bangladesh
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-xs md:text-sm leading-relaxed">
            Connect with certified trainers in major cities nationwide
          </p>
        </motion.div>

        {/* Location Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {locations.map((location, index) => (
            <motion.div
              key={index}
              className="group relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-sm border border-purple-500/30 rounded-xl p-3 md:p-4 h-full transition-all duration-300 group-hover:border-purple-500/50 group-hover:bg-gradient-to-br group-hover:from-purple-900/30 group-hover:to-pink-900/30">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2 md:mb-3">
                    <h3 className="text-sm md:text-lg font-bold text-white">{location.city}</h3>
                    <div className="p-1 md:p-1.5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg">
                      <MapPin className="h-3 md:h-4 w-3 md:w-4 text-purple-300" />
                    </div>
                  </div>

                  <div className="space-y-1 md:space-y-2 mb-2 md:mb-3">
                    <div className="flex items-center space-x-2">
                      <Users className="h-2.5 md:h-3 w-2.5 md:w-3 text-purple-300" />
                      <span className="text-gray-200 text-xs">{location.trainers} trainers</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="h-2.5 md:h-3 w-2.5 md:w-3 text-yellow-400 fill-current" />
                      <span className="text-gray-200 text-xs">{location.rating}/5 rating</span>
                    </div>
                  </div>

                  <div className="mb-2 md:mb-3">
                    <div className="flex flex-wrap gap-1">
                      {location.areas.slice(0, 3).map((area, idx) => (
                        <span 
                          key={idx} 
                          className="px-1.5 md:px-2 py-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-200 text-xs rounded-full border border-purple-500/30"
                        >
                          {area}
                        </span>
                      ))}
                      {location.areas.length > 3 && (
                        <span className="px-1.5 md:px-2 py-0.5 text-gray-300 text-xs">
                          +{location.areas.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  <motion.button 
                    className="w-full bg-gradient-to-r from-pink-800 via-pink-700 to-pink-600 hover:from-pink-900 hover:via-pink-800 hover:to-pink-700 text-white py-1.5 md:py-2 rounded-lg transition-all duration-300 font-medium text-xs md:text-sm backdrop-blur-sm border border-purple-500/30"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Explore {location.city}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div 
          className="text-center mt-6 md:mt-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="text-gray-300 mb-2 md:mb-3 text-xs md:text-sm">Expanding to new cities monthly</p>
          <motion.button 
            className="bg-gradient-to-r from-pink-800 via-pink-700 to-pink-600 hover:from-pink-900 hover:via-pink-800 hover:to-pink-700 text-white px-4 md:px-6 py-2 rounded-lg font-medium text-xs md:text-sm transition-all duration-300 backdrop-blur-sm border border-purple-500/30"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Request Your City
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default LocationCoverage;
