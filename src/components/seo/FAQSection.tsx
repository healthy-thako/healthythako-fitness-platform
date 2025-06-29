
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title: string;
  description: string;
  faqs: FAQ[];
}

const FAQSection = ({ title, description, faqs }: FAQSectionProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
            {title}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
            {description}
          </p>
        </div>
        
        <div className="space-y-3 md:space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <button
                className="w-full px-4 md:px-6 py-3 md:py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <h3 className="font-semibold text-gray-900 text-sm md:text-base pr-4">
                  {faq.question}
                </h3>
                <ChevronDown className={`w-4 md:w-5 h-4 md:h-5 text-gray-400 transition-transform ${
                  openIndex === index ? 'rotate-180' : ''
                }`} />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-gray-200"
                  >
                    <div className="px-4 md:px-6 py-3 md:py-4">
                      <p className="text-gray-600 text-xs md:text-sm">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
