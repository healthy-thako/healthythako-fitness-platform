import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const FeaturedTrainers = () => {
  const navigate = useNavigate();

  return (
    <section className="py-12 md:py-20 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-5 md:top-10 right-5 md:right-10 w-40 md:w-64 h-40 md:h-64 bg-pink-100/20 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute bottom-5 md:bottom-10 left-5 md:left-10 w-48 md:w-80 h-48 md:h-80 bg-pink-200/20 rounded-full mix-blend-multiply filter blur-xl"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 md:mb-16">
          <motion.div
            className="inline-flex items-center px-3 md:px-4 py-1 md:py-2 bg-gradient-to-r from-pink-50 to-pink-100 rounded-full text-xs md:text-sm font-medium text-pink-800 mb-4 md:mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            ⭐ Top Performers
          </motion.div>
          
          <motion.h2 
            className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-pink-900 bg-clip-text text-transparent mb-3 md:mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Featured Trainers
          </motion.h2>
          
          <motion.p 
            className="text-gray-600 text-sm md:text-lg max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Meet our top-rated fitness professionals who are transforming lives across Bangladesh
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
            onClick={() => navigate('/find-trainers')}
            size="lg"
            className="bg-white text-pink-700 border-2 border-pink-200 hover:bg-pink-50 hover:border-pink-300 transition-all duration-300 text-sm md:text-base px-4 md:px-6 py-2 md:py-3"
          >
            View All Trainers
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedTrainers;
