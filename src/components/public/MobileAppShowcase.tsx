
import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Download, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MobileAppShowcase = () => {
  return (
    <section className="py-12 md:py-20 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 right-10 w-32 md:w-64 h-32 md:h-64 bg-pink-100/20 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute bottom-10 left-10 w-40 md:w-80 h-40 md:h-80 bg-pink-200/20 rounded-full mix-blend-multiply filter blur-xl"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left - Content */}
          <motion.div
            className="space-y-4 md:space-y-6 order-2 lg:order-1"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <motion.div
                className="inline-flex items-center px-2 md:px-3 py-1 bg-gradient-to-r from-pink-50 to-pink-100 rounded-full text-xs font-medium text-pink-800 mb-3 md:mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Smartphone className="w-3 h-3 mr-1" />
                Mobile App
              </motion.div>
              
              <motion.h2 
                className="text-xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-pink-900 bg-clip-text text-transparent mb-3 md:mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                HealthyThako Mobile App
              </motion.h2>
              
              <motion.p 
                className="text-gray-600 text-sm md:text-base leading-relaxed mb-4 md:mb-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Access thousands of certified trainers and premium gyms right from your pocket. Book sessions, track progress, and achieve your fitness goals with our intuitive mobile app.
              </motion.p>
            </div>

            {/* Features */}
            <motion.div 
              className="space-y-2 md:space-y-3 mb-4 md:mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {[
                "Instant trainer booking",
                "Real-time session tracking",
                "Secure payment processing",
                "Progress analytics"
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                  <div className="w-1.5 h-1.5 bg-pink-500 rounded-full flex-shrink-0"></div>
                  <span>{feature}</span>
                </div>
              ))}
            </motion.div>

            {/* App Store Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-3 md:gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Button 
                size="sm"
                className="bg-gradient-to-r from-pink-800 via-pink-700 to-pink-600 hover:from-pink-900 hover:via-pink-800 hover:to-pink-700 text-white border-none shadow-lg text-xs md:text-sm px-4 md:px-6 py-2 md:py-3"
              >
                <Download className="w-3 md:w-4 h-3 md:h-4 mr-2" />
                Download for iOS
              </Button>
              <Button 
                variant="outline"
                size="sm"
                className="border-pink-200 text-pink-700 hover:bg-pink-50 text-xs md:text-sm px-4 md:px-6 py-2 md:py-3"
              >
                <Download className="w-3 md:w-4 h-3 md:h-4 mr-2" />
                Download for Android
              </Button>
            </motion.div>

            {/* Rating */}
            <motion.div 
              className="flex items-center gap-2 text-xs md:text-sm text-gray-600"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 md:w-4 h-3 md:h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span>4.9/5 rating from 2,000+ users</span>
            </motion.div>
          </motion.div>

          {/* Right - Mobile Image */}
          <motion.div
            className="relative order-1 lg:order-2 flex justify-center"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="relative max-w-sm md:max-w-md lg:max-w-lg">
              <img 
                src="/lovable-uploads/eeca6568-b7ac-49ed-a999-80549965e7ba.png"
                alt="HealthyThako mobile app interface showing gym and trainer listings"
                className="w-full h-auto object-contain"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default MobileAppShowcase;
