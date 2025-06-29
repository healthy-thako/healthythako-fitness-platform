
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlurText from '@/components/BlurText';
import AuroraBackground from '@/components/AuroraBackground';
import { CheckCircle, ArrowRight, Users, TrendingUp, Shield, Clock, Star, Target, DollarSign, Zap } from 'lucide-react';

const JoinTrainer = () => {
  const navigate = useNavigate();

  const handleApplyNow = () => {
    navigate('/auth');
  };

  const benefits = [
    {
      icon: Users,
      title: "Reach More Clients",
      description: "Be listed on Bangladesh's first AI-powered fitness platform"
    },
    {
      icon: DollarSign,
      title: "Zero Fees",
      description: "No upfront costs—earn directly from clients"
    },
    {
      icon: Clock,
      title: "Flexibility",
      description: "Work in-person or online, full-time or part-time"
    },
    {
      icon: Shield,
      title: "Support",
      description: "Get help building your profile and attracting clients"
    }
  ];

  const steps = [
    {
      step: "1",
      title: "Submit your certification (required)",
      description: "Upload your fitness credentials and qualifications"
    },
    {
      step: "2", 
      title: "Get verified (within 48 hours)",
      description: "Our team reviews and approves your application"
    },
    {
      step: "3",
      title: "Create your profile and set your rates",
      description: "Build your professional profile and pricing"
    },
    {
      step: "4",
      title: "Start accepting bookings!",
      description: "Begin training clients and earning income"
    }
  ];

  const eligibleTrainers = [
    "Certified personal trainers",
    "Yoga/Pilates instructors", 
    "Nutritionists and wellness coaches",
    "Sports coaches and fitness specialists"
  ];

  const faqs = [
    {
      question: "How do I get paid?",
      answer: "Direct bank transfers, no middlemen."
    },
    {
      question: "Is there a cost to join?",
      answer: "Free to sign up. You keep 100% of your earnings."
    },
    {
      question: "What certifications do I need?",
      answer: "Any recognized fitness certification from accredited institutions."
    },
    {
      question: "Can I work part-time?",
      answer: "Yes! Set your own schedule and availability."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-white py-16 lg:py-20 overflow-hidden">
        {/* Aurora Background */}
        <div className="absolute inset-0 opacity-20">
          <AuroraBackground 
            colorStops={["#8b1538", "#c90e5c", "#8b1538"]}
            amplitude={0.6}
            blend={0.2}
          />
        </div>
        
        {/* Dark overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-black/40"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight drop-shadow-2xl">
                  Launch Your Training Business with HealthyThako!
                </h1>
                <p className="text-xl text-gray-100 leading-relaxed drop-shadow-lg">
                  Get discovered by fitness seekers across Bangladesh. Set your schedule, set your rates, and grow your client base.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleApplyNow}
                  className="bg-gradient-to-r from-[#8b1538] to-[#c90e5c] hover:from-[#7a1230] hover:to-[#b50d52] text-white px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 shadow-xl border-0"
                >
                  <BlurText text="Apply Now (Free)" className="flex items-center" />
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
                src="/lovable-uploads/b398319d-af9c-4a38-b89a-2802130ba789.png" 
                alt="Join HealthyThako as a trainer"
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Partner with Us?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join Bangladesh's leading fitness platform and unlock unlimited earning potential.
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
            <p className="text-lg text-gray-600">Simple steps to start your training business</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-[#8b1538] to-[#c90e5c] rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">{step.step}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Can Apply */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Who Can Apply?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {eligibleTrainers.map((trainer, index) => (
              <div key={index} className="flex items-center justify-center space-x-3 p-6 bg-white rounded-lg border border-gray-200">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                <span className="text-lg text-gray-900">{trainer}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">What Our Trainers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"I love the flexibility of setting my own hours!"</p>
                <p className="font-semibold text-gray-900">Rashida Khan, Dhaka</p>
              </CardContent>
            </Card>
            
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"HealthyThako helped me grow my client base significantly."</p>
                <p className="font-semibold text-gray-900">Ahmed Hassan, Chittagong</p>
              </CardContent>
            </Card>
            
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"The platform makes it easy to connect with serious clients."</p>
                <p className="font-semibold text-gray-900">Fatima Ahmed, Sylhet</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
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
          <h2 className="text-3xl font-bold mb-4">Ready to Start?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of successful trainers on HealthyThako
          </p>
          <Button 
            onClick={handleApplyNow}
            className="bg-white text-[#8b1538] hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
          >
            <BlurText text="Join as a Trainer" className="flex items-center" />
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default JoinTrainer;
