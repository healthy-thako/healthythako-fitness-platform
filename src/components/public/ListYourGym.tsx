
import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, TrendingUp, Star, MapPin, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const ListYourGym = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: <Users className="h-4 md:h-5 w-4 md:w-5" />,
      title: "More Members",
      description: "Access to thousands of fitness seekers"
    },
    {
      icon: <TrendingUp className="h-4 md:h-5 w-4 md:w-5" />,
      title: "Increase Revenue",
      description: "Boost membership sales by 300%"
    },
    {
      icon: <Star className="h-4 md:h-5 w-4 md:w-5" />,
      title: "Build Reputation",
      description: "Get reviews and build credibility"
    },
    {
      icon: <Zap className="h-4 md:h-5 w-4 md:w-5" />,
      title: "Digital Presence",
      description: "Professional online profile"
    }
  ];

  const features = [
    "Professional gym listing",
    "Membership management system",
    "Online booking platform",
    "Payment processing",
    "Member analytics dashboard",
    "Marketing support"
  ];

  return (
    <section className="py-12 md:py-20 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 md:top-20 right-5 md:right-10 w-40 md:w-64 h-40 md:h-64 bg-pink-100/20 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute bottom-10 md:bottom-20 left-5 md:left-10 w-48 md:w-80 h-48 md:h-80 bg-pink-200/20 rounded-full mix-blend-multiply filter blur-xl"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left - Image */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="/lovable-uploads/7915384b-a111-49fe-945d-5c14755bde00.png"
                alt="Happy gym owner using HealthyThako platform to manage their fitness business"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-2 md:-top-4 -right-2 md:-right-4 w-8 md:w-16 h-8 md:h-16 bg-pink-500 rounded-full flex items-center justify-center shadow-lg">
              <Building2 className="h-4 md:h-8 w-4 md:w-8 text-white" />
            </div>
            <div className="absolute -bottom-2 md:-bottom-4 -left-2 md:-left-4 w-6 md:w-12 h-6 md:h-12 bg-white rounded-full flex items-center justify-center shadow-lg border border-pink-100">
              <Star className="h-3 md:h-6 w-3 md:w-6 text-pink-600" />
            </div>
          </motion.div>

          {/* Right - Content */}
          <motion.div
            className="space-y-4 md:space-y-6"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div>
              <motion.div
                className="inline-flex items-center px-2 md:px-3 py-1 bg-gradient-to-r from-pink-50 to-pink-100 rounded-full text-xs font-medium text-pink-800 mb-3 md:mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                🏢 For Gym Owners
              </motion.div>
              
              <motion.h2 
                className="text-xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-pink-900 bg-clip-text text-transparent mb-3 md:mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                List Your Gym on HealthyThako
              </motion.h2>
              
              <motion.p 
                className="text-gray-600 text-sm md:text-base leading-relaxed mb-4 md:mb-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Expand your gym's reach and help more people buy gym membership through Bangladesh's most trusted fitness platform. Connect with fitness enthusiasts actively seeking quality gyms.
              </motion.p>
            </div>

            {/* Benefits */}
            <motion.div 
              className="grid grid-cols-2 gap-2 md:gap-4 mb-4 md:mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-2 md:gap-3 p-2 md:p-3 bg-pink-50/50 rounded-lg border border-pink-100/50"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                >
                  <div className="p-1 md:p-1.5 bg-pink-100 rounded-md text-pink-600 flex-shrink-0">
                    {benefit.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-xs md:text-sm mb-1">{benefit.title}</h4>
                    <p className="text-gray-600 text-xs">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Features List */}
            <motion.div
              className="mb-4 md:mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h4 className="font-semibold text-gray-900 mb-2 md:mb-3 text-sm md:text-base">What you get:</h4>
              <div className="grid grid-cols-1 gap-1 md:gap-2">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-pink-500 rounded-full flex-shrink-0"></div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              className="flex flex-col sm:flex-row gap-3 md:gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Button 
                onClick={() => navigate('/auth/gym')}
                size="lg"
                className="bg-gradient-to-r from-pink-800 via-pink-700 to-pink-600 hover:from-pink-900 hover:via-pink-800 hover:to-pink-700 text-white text-sm md:text-base px-4 md:px-6 py-2 md:py-3"
              >
                List Your Gym Now
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="border-pink-200 text-pink-700 hover:bg-pink-50 text-sm md:text-base px-4 md:px-6 py-2 md:py-3"
              >
                Learn More
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ListYourGym;
