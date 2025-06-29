
import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, CreditCard, Users, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OneStopPlatform = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Smartphone className="h-4 md:h-5 w-4 md:w-5" />,
      title: "Mobile App",
      description: "Book sessions on-the-go"
    },
    {
      icon: <CreditCard className="h-4 md:h-5 w-4 md:w-5" />,
      title: "Digital Payments",
      description: "Secure & convenient payments"
    },
    {
      icon: <Users className="h-4 md:h-5 w-4 md:w-5" />,
      title: "Expert Trainers",
      description: "Certified professionals"
    },
    {
      icon: <Zap className="h-4 md:h-5 w-4 md:w-5" />,
      title: "Instant Booking",
      description: "Quick & easy scheduling"
    }
  ];

  return (
    <section className="py-12 md:py-16 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 md:top-20 left-5 md:left-10 w-32 md:w-48 h-32 md:h-48 bg-pink-100/30 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute bottom-10 md:bottom-20 right-5 md:right-10 w-40 md:w-64 h-40 md:h-64 bg-pink-200/20 rounded-full mix-blend-multiply filter blur-xl"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left Content */}
          <motion.div
            className="space-y-4 md:space-y-6"
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
                🏆 First in Bangladesh
              </motion.div>
              
              <motion.h2 
                className="text-xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-pink-900 bg-clip-text text-transparent mb-3 md:mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                Bangladesh's First One-Stop Fitness Platform
              </motion.h2>
              
              <motion.p 
                className="text-gray-600 text-sm md:text-base leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Experience the future of fitness with our revolutionary platform that connects you to certified trainers, premium gyms, and personalized wellness solutions all in one place.
              </motion.p>
            </div>

            {/* Features Grid */}
            <motion.div 
              className="grid grid-cols-2 gap-2 md:gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-2 md:gap-3 p-2 md:p-3 bg-pink-50/50 rounded-lg border border-pink-100/50"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                >
                  <div className="p-1 md:p-1.5 bg-pink-100 rounded-md text-pink-600 flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-xs md:text-sm mb-1">{feature.title}</h4>
                    <p className="text-gray-600 text-xs">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div 
              className="pt-2 md:pt-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <button 
                onClick={() => navigate('/find-trainers')}
                className="bg-gradient-to-r from-pink-800 via-pink-700 to-pink-600 hover:from-pink-900 hover:via-pink-800 hover:to-pink-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium text-xs md:text-sm transition-all duration-300"
              >
                Explore Platform
              </button>
            </motion.div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="/lovable-uploads/7f175883-3232-4d11-9314-417a46e31c3c.png"
                alt="Happy fitness enthusiasts using HealthyThako platform"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-2 md:-top-4 -right-2 md:-right-4 w-8 md:w-16 h-8 md:h-16 bg-pink-500 rounded-full flex items-center justify-center shadow-lg">
              <Zap className="h-4 md:h-8 w-4 md:w-8 text-white" />
            </div>
            <div className="absolute -bottom-2 md:-bottom-4 -left-2 md:-left-4 w-6 md:w-12 h-6 md:h-12 bg-white rounded-full flex items-center justify-center shadow-lg border border-pink-100">
              <Users className="h-3 md:h-6 w-3 md:w-6 text-pink-600" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default OneStopPlatform;
