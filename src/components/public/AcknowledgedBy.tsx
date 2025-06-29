
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const AcknowledgedBy = () => {
  const logos = [{
    name: 'AMENA Center for Entrepreneurship and Development',
    src: '/lovable-uploads/597b3327-6baf-431f-a80f-8abb6697d940.png'
  }, {
    name: 'The World Bank',
    src: '/lovable-uploads/27232c0a-4a41-4d2d-874d-cfc44e022ce7.png'
  }, {
    name: 'Accelerating Bangladesh',
    src: '/lovable-uploads/5e45b5bb-81be-4c3c-955a-3c2c2f6b180e.png'
  }, {
    name: 'ICT Division',
    src: '/lovable-uploads/f5364a9c-0be4-49e5-9514-d90a0e07d813.png'
  }, {
    name: 'Department of Anthropology, University of Dhaka',
    src: '/lovable-uploads/e1efe41c-9123-45ff-a2b5-54be44369817.png'
  }, {
    name: 'Digital Entrepreneurship And Innovation Eco System Development Project',
    src: '/lovable-uploads/8f5075cc-7cbb-4a4c-bf6d-3def366a57c3.png'
  }, {
    name: 'Bangladesh Hi-Tech Park Authority',
    src: '/lovable-uploads/7fa83c4d-27e3-426f-864d-6c4a56f97b25.png'
  }, {
    name: 'Berkeley University of California',
    src: '/lovable-uploads/072479f5-24ab-404d-8c10-b13324f48469.png'
  }];

  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 4; // Show 4 logos at a time on desktop
  const itemsPerPageMobile = 2; // Show 2 logos at a time on mobile

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex + itemsPerPage >= logos.length ? 0 : prevIndex + itemsPerPage
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? Math.floor(logos.length / itemsPerPage) * itemsPerPage : prevIndex - itemsPerPage
    );
  };

  // Auto slide functionality
  useEffect(() => {
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-12 md:py-20 bg-gradient-to-br from-slate-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-48 md:w-72 h-48 md:h-72 bg-purple-100/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-64 md:w-96 h-64 md:h-96 bg-blue-100/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-16">
          <motion.div className="inline-flex items-center px-3 md:px-4 py-1 md:py-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full text-xs md:text-sm font-medium text-purple-800 mb-4 md:mb-6" initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.6
        }}>
            ✨ Trusted Partnerships
          </motion.div>
          
          <motion.h2 initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.6,
          delay: 0.1
        }} className="text-xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-blue-900 bg-clip-text text-transparent mb-3 md:mb-4">
            Acknowledged by Industry Leaders
          </motion.h2>
          
          <motion.p initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.6,
          delay: 0.2
        }} className="text-gray-600 max-w-2xl mx-auto leading-relaxed text-sm md:text-base">
            Recognized and trusted by leading organizations worldwide for our commitment to innovation and excellence in fitness technology
          </motion.p>
        </div>

        {/* Carousel Container */}
        <div className="relative overflow-hidden bg-white/60 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/20 shadow-lg p-4 md:p-8">
          {/* Desktop View */}
          <div className="hidden md:block">
            <div className="grid grid-cols-4 gap-6">
              {logos.slice(currentIndex, currentIndex + itemsPerPage).map((logo, index) => (
                <motion.div 
                  key={`${logo.name}-${currentIndex + index}`} 
                  className="flex items-center justify-center h-32 p-4 rounded-xl bg-white/40 backdrop-blur-sm border border-white/30 shadow-sm"
                  whileHover={{
                    scale: 1.05,
                    y: -5,
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
                  }}
                  transition={{
                    duration: 0.3
                  }}
                >
                  <img 
                    src={logo.src} 
                    alt={logo.name} 
                    className="max-w-full max-h-full object-contain transition-all duration-500 hover:scale-110" 
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mobile View */}
          <div className="md:hidden">
            <div className="grid grid-cols-2 gap-3">
              {logos.slice(currentIndex, currentIndex + itemsPerPageMobile).map((logo, index) => (
                <motion.div 
                  key={`mobile-${logo.name}-${currentIndex + index}`} 
                  className="flex items-center justify-center h-24 p-3 rounded-lg bg-white/40 backdrop-blur-sm border border-white/30 shadow-sm"
                  whileHover={{
                    scale: 1.02
                  }}
                  transition={{
                    duration: 0.3
                  }}
                >
                  <img 
                    src={logo.src} 
                    alt={logo.name} 
                    className="max-w-full max-h-full object-contain" 
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <button 
            onClick={prevSlide}
            className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
          </button>
          
          <button 
            onClick={nextSlide}
            className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-colors"
          >
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-4 md:mt-6 gap-2">
            {Array.from({ length: Math.ceil(logos.length / itemsPerPage) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index * itemsPerPage)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  Math.floor(currentIndex / itemsPerPage) === index 
                    ? 'bg-purple-600' 
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AcknowledgedBy;
