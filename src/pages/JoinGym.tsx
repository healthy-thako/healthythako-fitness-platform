
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlurText from '@/components/BlurText';
import Aurora from '@/components/Aurora';
import { CheckCircle, ArrowRight, Users, TrendingUp, Shield, Clock, Star, Building, Target, DollarSign } from 'lucide-react';

const JoinGym = () => {
  const navigate = useNavigate();

  const handleApplyNow = () => {
    navigate('/auth/gym');
  };

  const benefits = [
    {
      icon: DollarSign,
      title: "New Revenue Stream",
      description: "Earn from pay-per-session users"
    },
    {
      icon: Shield,
      title: "No Upfront Costs",
      description: "We provide NFC entry tech for free"
    },
    {
      icon: Target,
      title: "Local Exposure",
      description: "Get featured in our app and social media"
    },
    {
      icon: Clock,
      title: "Flexible Terms",
      description: "No long-term commitments"
    }
  ];

  const steps = [
    {
      step: "1",
      title: "Submit your gym details",
      description: "Provide basic information about your facility"
    },
    {
      step: "2", 
      title: "We install NFC entry (free setup)",
      description: "Our team handles the technical integration"
    },
    {
      step: "3",
      title: "Start welcoming GymPass users!",
      description: "Begin earning from new members immediately"
    }
  ];

  const faqs = [
    {
      question: "How do payments work?",
      answer: "Monthly deposits to your bank account."
    },
    {
      question: "What if my gym is outside Dhaka?",
      answer: "We're expanding nationwide!"
    },
    {
      question: "Is there a cost to join?",
      answer: "No, it's completely free to list your gym with us."
    },
    {
      question: "How many new members can I expect?",
      answer: "Partner gyms typically see 20-50 new visits per month."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-white py-16 lg:py-20 overflow-hidden">
        {/* Aurora Background */}
        <div className="absolute inset-0 opacity-30">
          <Aurora 
            colorStops={["#8b1538", "#c90e5c", "#8b1538"]}
            amplitude={0.8}
            blend={0.3}
          />
        </div>
        
        {/* Dark overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-black/50"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight drop-shadow-2xl">
                  List Your Gym on HealthyThako!
                </h1>
                <p className="text-xl text-gray-100 leading-relaxed drop-shadow-lg">
                  Attract new members and fill empty slots with our pay-per-visit GymPass.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleApplyNow}
                  className="bg-gradient-to-r from-[#8b1538] to-[#c90e5c] hover:from-[#7a1230] hover:to-[#b50d52] text-white px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 shadow-xl border-0"
                >
                  <BlurText text="Get Listed (Free)" className="flex items-center" />
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" className="px-8 py-4 text-lg font-medium rounded-lg border-2 border-white text-white hover:bg-white hover:text-[#8b1538] bg-white/10 backdrop-blur-sm shadow-xl">
                  <BlurText text="Learn More" />
                </Button>
              </div>
            </div>
            
            {/* Right Image */}
            <div className="relative">
              <img 
                src="/lovable-uploads/a836a3b3-edc3-4bae-bb53-769b09bbd9c7.png" 
                alt="List your gym on HealthyThako"
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Benefits for Gym Owners</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join Bangladesh's leading fitness platform and unlock new opportunities for your business.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} className="border-gray-200 hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#8b1538] to-[#c90e5c] rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                    <p className="text-gray-600 text-sm">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">Simple steps to get your gym listed and start earning</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-[#8b1538] to-[#c90e5c] rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">{step.step}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Can Join */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Who Can Join?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-center space-x-3 p-6 bg-white rounded-lg border border-gray-200">
              <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
              <span className="text-lg text-gray-900">Gyms of all sizes (from small studios to large chains)</span>
            </div>
            <div className="flex items-center justify-center space-x-3 p-6 bg-white rounded-lg border border-gray-200">
              <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
              <span className="text-lg text-gray-900">Women-only and co-ed spaces welcome</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-gray-200">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-16 bg-gradient-to-r from-[#8b1538] to-[#c90e5c] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Limited Slots Available!</h2>
          <p className="text-xl mb-8 opacity-90">
            Join the fastest-growing fitness platform in Bangladesh
          </p>
          <Button 
            onClick={handleApplyNow}
            className="bg-white text-[#8b1538] hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
          >
            <BlurText text="Apply Now" className="flex items-center" />
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default JoinGym;
