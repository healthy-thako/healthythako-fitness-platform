
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlurText from '@/components/BlurText';
import Aurora from '@/components/Aurora';
import { CheckCircle, ArrowRight, Users, MapPin, Clock, Star, Zap, Shield, Heart, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

const GymPass = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !name || !phone) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Mock submission for now since the table doesn't exist yet
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Successfully joined the waitlist! We\'ll notify you when GymPass launches.');
      setEmail('');
      setName('');
      setPhone('');
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    {
      icon: MapPin,
      title: "Access Partnered Gyms Accross the Nation",
      description: "One pass, unlimited gyms across Bangladesh"
    },
    {
      icon: CreditCard,
      title: "Pay-As-You-Go",
      description: "No advance payment or membership, pay only when you go"
    },
    {
      icon: Clock,
      title: "Flexible Hours",
      description: "Use any time, any day at participating gyms"
    },
    {
      icon: Shield,
      title: "Verified Facilities",
      description: "All gyms are verified for quality and safety"
    }
  ];

  const benefits = [
    "No monthly gym fees",
    "Access premium facilities",
    "Try different workout styles",
    "Perfect for Busy Professionals & travelers",
    "Cancel anytime",
    "Mobile app convenience"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section with Waitlist */}
      <section className="relative py-20 overflow-hidden">
        {/* Animated Aurora Background */}
        <div className="absolute inset-0 opacity-40">
          <Aurora 
            colorStops={["#8b1538", "#c90e5c", "#8b1538"]}
            amplitude={1.2}
            blend={0.4}
            speed={0.8}
          />
        </div>
        
        {/* Dark overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium text-white">
                  <Zap className="h-4 w-4 mr-2" />
                  <BlurText text="Coming Soon" />
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-white drop-shadow-2xl">
                  <BlurText text="GymPass Bangladesh" />
                </h1>
                <p className="text-xl opacity-90 leading-relaxed text-gray-100 drop-shadow-lg">
                  <BlurText text="One pass, unlimited access to all partnered gyms across Bangladesh. Pay-As-You-Go, No Gym Membership Needed." />
                </p>
              </div>
            </div>
            
            {/* Right Waitlist Form */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  <BlurText text="Join the Waitlist" />
                </h2>
                <p className="text-gray-600">Be the first to get GymPass when we launch</p>
              </div>
              
              <form onSubmit={handleWaitlistSubmit} className="space-y-4">
                <div>
                  <Input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8b1538] focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <Input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8b1538] focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <Input
                    type="tel"
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8b1538] focus:border-transparent"
                    required
                  />
                </div>
                
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#8b1538] to-[#c90e5c] hover:from-[#7a1230] hover:to-[#b50d52] text-white py-3 text-lg font-semibold rounded-lg transition-all duration-200 hover:shadow-lg"
                >
                  {isSubmitting ? 'Joining...' : <BlurText text="Join Waitlist" />}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>
              
              <p className="text-xs text-gray-500 text-center mt-4">
                We'll notify you as soon as GymPass launches in your area
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              <BlurText text="How GymPass Works" />
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Revolutionary gym access system that gives you freedom and flexibility
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-gray-200 hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#8b1538] to-[#c90e5c] rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">
                <BlurText text="Why Choose GymPass?" />
              </h2>
              <p className="text-lg text-gray-600">
                Perfect for busy professionals, travelers, and anyone who wants gym flexibility without the commitment.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-6">
              <Card className="border-gray-200 bg-gradient-to-br from-green-50 to-blue-50">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <Heart className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Early Bird Offer</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Join the waitlist and get 50% off your first month when GymPass launches!
                  </p>
                  <div className="text-2xl font-bold text-green-600">
                    ৳99 <span className="text-sm font-normal text-gray-500">per visit (first month)</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-gray-200">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Launching Soon In:</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Dhaka</span>
                      <span className="text-sm text-green-600 font-medium">Q1 2025</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Chittagong</span>
                      <span className="text-sm text-blue-600 font-medium">Q2 2025</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Sylhet</span>
                      <span className="text-sm text-blue-600 font-medium">Q2 2025</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#8b1538] to-[#c90e5c] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            <BlurText text="Ready to Transform Your Fitness Journey?" />
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands on the waitlist and be the first to experience GymPass
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-[#8b1538] hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-200 hover:shadow-lg"
            >
              <BlurText text="Join Waitlist Now" />
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-[#8b1538] px-8 py-4 text-lg font-medium rounded-lg"
            >
              <BlurText text="Learn More" />
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default GymPass;
