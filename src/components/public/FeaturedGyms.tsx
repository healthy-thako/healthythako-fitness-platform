import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const FeaturedGyms = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-pink-50 via-white to-pink-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-100/30 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-pink-200/20 rounded-full mix-blend-multiply filter blur-xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-100 to-pink-200 rounded-full text-sm font-medium text-pink-800 mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            🏋️ Premium Facilities
          </motion.div>
          
          <motion.h2 
            className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-pink-900 bg-clip-text text-transparent mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Featured Gyms
          </motion.h2>
          
          <motion.p 
            className="text-gray-600 text-lg max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Discover premium fitness facilities with state-of-the-art equipment and exceptional services
          </motion.p>
        </div>

        {/* CTA */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Button 
            className="bg-white text-pink-700 border-2 border-pink-200 hover:bg-pink-50 hover:border-pink-300 transition-all duration-300 text-sm md:text-base px-4 md:px-6 py-2 md:py-3"
          >
            View All Gyms
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedGyms;
