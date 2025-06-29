
import React from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import { MessageCircle, Phone, Mail, Clock, Search, BookOpen } from 'lucide-react';

const Support = () => {
  const faqs = [
    {
      question: "How do I find the right fitness trainer?",
      answer: "Use our advanced search filters to find trainers by location, specialization, price range, and availability. You can also read reviews and check trainer certifications."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, debit cards, mobile banking (bKash, Nagad, Rocket), and bank transfers for your convenience."
    },
    {
      question: "How do I cancel or reschedule a session?",
      answer: "You can cancel or reschedule sessions up to 24 hours in advance through your dashboard without any charges. Late cancellations may incur fees."
    },
    {
      question: "Are all trainers verified and certified?",
      answer: "Yes, all trainers undergo a thorough verification process including background checks, certification validation, and skill assessments."
    },
    {
      question: "Can I get a refund if I'm not satisfied?",
      answer: "We offer a satisfaction guarantee. If you're not happy with your first session, contact our support team within 24 hours for a full refund."
    }
  ];

  return (
    <>
      <Helmet>
        <title>Support & Help Center | HealthyThako - Hire Fitness Trainers & Buy Gym Memberships</title>
        <meta name="description" content="Get help with HealthyThako fitness platform. Find answers to common questions about hiring fitness trainers, buying gym memberships, and using our services in Bangladesh." />
        <meta name="keywords" content="HealthyThako support, fitness trainer help, gym membership support, Bangladesh fitness platform help, customer service" />
      </Helmet>

      <div className="min-h-screen bg-white">
        <Header />
        
        {/* Breadcrumb Navigation */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Breadcrumb 
              items={[
                { label: 'Support', current: true }
              ]}
              showBackButton={false}
            />
          </div>
        </div>
        
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-purple-50 to-blue-50 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How can we help you?
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Find answers to common questions or get in touch with our support team
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search for help articles..."
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
              />
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Live Chat</h3>
                <p className="text-gray-600 mb-6">Get instant help from our support team</p>
                <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">
                  Start Chat
                </button>
              </div>

              <div className="text-center p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Phone className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Call Us</h3>
                <p className="text-gray-600 mb-6">Speak directly with our support team</p>
                <a href="tel:+8801700000000" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block">
                  +880 1700-000000
                </a>
              </div>

              <div className="text-center p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Email Support</h3>
                <p className="text-gray-600 mb-6">Send us an email for detailed help</p>
                <a href="mailto:support@healthythako.com" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors inline-block">
                  Email Us
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <BookOpen className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-gray-600">Quick answers to common questions</p>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Support Hours */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Clock className="h-12 w-12 text-purple-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Support Hours</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Phone & Live Chat</h3>
                <p className="text-gray-600">Monday - Friday: 9:00 AM - 8:00 PM</p>
                <p className="text-gray-600">Saturday: 10:00 AM - 6:00 PM</p>
                <p className="text-gray-600">Sunday: 10:00 AM - 4:00 PM</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Email Support</h3>
                <p className="text-gray-600">24/7 - We'll respond within 24 hours</p>
                <p className="text-gray-600 mt-4">Emergency issues: Within 2 hours</p>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Support;
