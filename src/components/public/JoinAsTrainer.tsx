
import React from 'react';
import { motion } from 'framer-motion';
import { Users, Star, TrendingUp, Shield, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const JoinAsTrainer = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: <DollarSign className="h-4 md:h-5 w-4 md:w-5" />,
      title: "Earn More",
      description: "Set your rates, earn 90% commission"
    },
    {
      icon: <Users className="h-4 md:h-5 w-4 md:w-5" />,
      title: "More Clients",
      description: "Access to 10,000+ fitness enthusiasts"
    },
    {
      icon: <Shield className="h-4 md:h-5 w-4 md:w-5" />,
      title: "Verified Profile",
      description: "Build trust with certification badges"
    },
    {
      icon: <Clock className="h-4 md:h-5 w-4 md:w-5" />,
      title: "Flexible Schedule",
      description: "Work when you want, where you want"
    }
  ];

  const stats = [
    { number: "500+", label: "Active Trainers" },
    { number: "৳50K+", label: "Avg Monthly Earning" },
    { number: "4.9★", label: "Trainer Rating" },
    { number: "95%", label: "Client Retention" }
  ];

  return (
    <section className="py-12 md:py-20 bg-gradient-to-br from-pink-50 via-white to-pink-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-5 md:top-10 left-5 md:left-10 w-40 md:w-64 h-40 md:h-64 bg-pink-100/30 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute bottom-5 md:bottom-10 right-5 md:right-10 w-48 md:w-80 h-48 md:h-80 bg-pink-200/20 rounded-full mix-blend-multiply filter blur-xl"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 md:mb-16">
          <motion.div
            className="inline-flex items-center px-3 md:px-4 py-1 md:py-2 bg-gradient-to-r from-pink-100 to-pink-200 rounded-full text-xs md:text-sm font-medium text-pink-800 mb-4 md:mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            💼 Career Opportunity
          </motion.div>
          
          <motion.h2 
            className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-pink-900 bg-clip-text text-transparent mb-3 md:mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Join as a Fitness Trainer
          </motion.h2>
          
          <motion.p 
            className="text-gray-600 text-sm md:text-lg max-w-3xl mx-auto mb-6 md:mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Transform lives and build your fitness career with HealthyThako. Hire fitness trainer opportunities across Bangladesh await certified professionals ready to make an impact.
          </motion.p>

          {/* Stats */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-lg md:text-2xl font-bold text-pink-600 mb-1">{stat.number}</div>
                <div className="text-xs md:text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left - Benefits */}
          <motion.div
            className="space-y-4 md:space-y-6"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Why Choose HealthyThako?</h3>
            
            <div className="grid grid-cols-1 gap-3 md:gap-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-white rounded-lg border border-pink-100/50 shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
                >
                  <div className="p-1.5 md:p-2 bg-pink-100 rounded-lg text-pink-600 flex-shrink-0">
                    {benefit.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1 text-sm md:text-base">{benefit.title}</h4>
                    <p className="text-gray-600 text-xs md:text-sm">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div 
              className="pt-4 md:pt-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Button 
                onClick={() => navigate('/auth')}
                size="lg"
                className="bg-gradient-to-r from-pink-800 via-pink-700 to-pink-600 hover:from-pink-900 hover:via-pink-800 hover:to-pink-700 text-white px-6 md:px-8 text-sm md:text-base py-2 md:py-3"
              >
                Start Your Trainer Journey
              </Button>
            </motion.div>
          </motion.div>

          {/* Right - Image/Card */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="bg-white/90 backdrop-blur-sm border-pink-100/50 shadow-xl">
              <CardContent className="p-6 md:p-8">
                <div className="text-center mb-4 md:mb-6">
                  <div className="w-12 md:w-16 h-12 md:h-16 bg-gradient-to-r from-pink-600 to-pink-700 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <Star className="h-6 md:h-8 w-6 md:w-8 text-white" />
                  </div>
                  <h4 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Become a Certified Trainer</h4>
                  <p className="text-gray-600 text-xs md:text-sm">Join Bangladesh's leading fitness platform</p>
                </div>
                
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center gap-3 text-xs md:text-sm">
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    <span className="text-gray-700">Quick verification process</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs md:text-sm">
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    <span className="text-gray-700">Professional profile creation</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs md:text-sm">
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    <span className="text-gray-700">Marketing support included</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs md:text-sm">
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    <span className="text-gray-700">24/7 platform support</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default JoinAsTrainer;
