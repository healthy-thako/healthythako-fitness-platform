
import React from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

interface LocationsSectionProps {
  title: string;
  description: string;
  locations: string[];
}

const LocationsSection = ({ title, description, locations }: LocationsSectionProps) => {
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
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {locations.map((location, index) => (
            <motion.div
              key={index}
              className="bg-gray-50 p-3 md:p-4 rounded-lg border border-gray-100 text-center hover:bg-pink-50 hover:border-pink-200 transition-colors"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
            >
              <MapPin className="w-4 md:w-5 h-4 md:h-5 text-pink-600 mx-auto mb-1 md:mb-2" />
              <p className="font-medium text-gray-900 text-xs md:text-sm">{location}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LocationsSection;
