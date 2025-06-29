
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: 'How do I find the right trainer for my fitness goals?',
      answer: 'Use our advanced filters to search by specialization (weight loss, yoga, strength training), location, price range, and ratings. You can also read trainer profiles and reviews to find the perfect match for your specific goals and preferences.'
    },
    {
      question: 'Are all trainers on HealthyThako certified and verified?',
      answer: 'Yes, every trainer undergoes a strict verification process. We check their certifications, experience, background, and conduct interviews. Only qualified, professional trainers with proper credentials are approved to join our platform.'
    },
    {
      question: 'What types of training sessions are available?',
      answer: 'We offer home visits, gym sessions, and online virtual training. You can choose individual or group sessions, with durations ranging from 60 to 90 minutes. Training types include yoga, strength training, HIIT, weight loss programs, and specialized fitness coaching.'
    },
    {
      question: 'How much do training sessions cost in Bangladesh?',
      answer: 'Prices start from ৳600 per session and vary based on trainer experience, session type, and location. We offer transparent pricing with no hidden fees. Package deals are available with discounts up to 20% for multiple sessions.'
    },
    {
      question: 'Can I cancel or reschedule my training sessions?',
      answer: 'Yes, you can cancel or reschedule sessions up to 24 hours before the scheduled time without any penalty. Cancellations within 24 hours may incur a 50% charge. We understand that schedules can change and offer flexible policies.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all popular payment methods in Bangladesh including bKash, Nagad, Rocket, credit/debit cards, and bank transfers. All payments are processed securely through our encrypted payment system.'
    },
    {
      question: 'Do you offer a money-back guarantee?',
      answer: 'Yes, we offer a satisfaction guarantee. If you\'re not happy with your first session, we\'ll provide a full refund or help you find a different trainer that better matches your needs. Your satisfaction is our priority.'
    },
    {
      question: 'How do I track my fitness progress?',
      answer: 'Most of our trainers provide progress tracking tools including workout logs, body measurements, progress photos, and performance metrics. Many also offer nutrition guidance and lifestyle coaching to support your overall wellness journey.'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about HealthyThako fitness training services
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="card-professional rounded-xl border border-gray-100">
              <button
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors rounded-xl"
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
              >
                <span className="text-lg font-semibold text-gray-900">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="h-5 w-5 text-[#c90e5c]" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-[#c90e5c]" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <button className="btn-custom text-white px-6 py-3 rounded-xl font-medium">
            Contact Support
          </button>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
