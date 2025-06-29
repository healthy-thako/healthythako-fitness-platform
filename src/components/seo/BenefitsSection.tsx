
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface Benefit {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

interface BenefitsSectionProps {
  title: string;
  description: string;
  benefits: Benefit[];
}

const BenefitsSection = ({ title, description, benefits }: BenefitsSectionProps) => {
  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
            {title}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
            {description}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={index}
                className="bg-white p-4 md:p-6 rounded-xl border border-gray-100 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="w-10 md:w-12 h-10 md:h-12 bg-gradient-to-r from-pink-800 to-pink-600 rounded-lg flex items-center justify-center mb-3 md:mb-4">
                  <Icon className="w-5 md:w-6 h-5 md:h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 text-xs md:text-sm">
                  {benefit.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
