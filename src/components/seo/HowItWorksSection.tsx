
import React from 'react';
import { motion } from 'framer-motion';
import { Search, MessageCircle, Calendar, CheckCircle } from 'lucide-react';

interface Step {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

interface HowItWorksSectionProps {
  title: string;
  description: string;
  steps: Step[];
}

const HowItWorksSection = ({ title, description, steps }: HowItWorksSectionProps) => {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
            {title}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
            {description}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                className="text-center p-4 md:p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="w-12 md:w-16 h-12 md:h-16 bg-gradient-to-r from-pink-800 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <Icon className="w-6 md:w-8 h-6 md:h-8 text-white" />
                </div>
                <div className="w-6 md:w-8 h-6 md:h-8 bg-pink-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 text-xs md:text-sm font-bold">
                  {index + 1}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-xs md:text-sm">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
