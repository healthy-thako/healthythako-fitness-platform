import React from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import { Users, Target, Award, Globe, Heart, Star, CheckCircle, TrendingUp, Shield, Zap, Brain, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
const About = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About HealthyThako - Bangladesh's Leading Fitness Platform",
    "description": "Learn about HealthyThako's mission to revolutionize fitness in Bangladesh. Connecting 10,000+ clients with certified trainers since 2024.",
    "url": "https://healthythako.com/about",
    "mainEntity": {
      "@type": "Organization",
      "name": "HealthyThako",
      "foundingDate": "2024",
      "founder": [{
        "@type": "Person",
        "name": "Hasibul Asif",
        "jobTitle": "CEO"
      }, {
        "@type": "Person",
        "name": "Azmain Fayek Nilmoy",
        "jobTitle": "CTO"
      }]
    }
  };
  const founders = [{
    name: "Hasibul Asif",
    position: "CEO",
    image: "/lovable-uploads/6f0fb018-ff81-47b9-9b71-b13a8461ed42.png"
  }, {
    name: "Azmain Fayek Nilmoy",
    position: "CTO",
    image: "/lovable-uploads/51a853e7-2d92-4fba-8244-2db42ccb63a1.png"
  }, {
    name: "Mobasshir Hossain Alvi",
    position: "CFO",
    image: "/lovable-uploads/c788c3f8-8e6d-4dd9-9fdb-c561b013c09e.png"
  }, {
    name: "Isteyak Toha",
    position: "COO",
    image: "/lovable-uploads/71af39b0-5a60-4da8-baf9-efba2fe999f7.png"
  }];
  return <>
      <Helmet>
        <title>About HealthyThako - Bangladesh's Leading AI-Powered Fitness Marketplace</title>
        <meta name="description" content="Discover how HealthyThako revolutionizes fitness in Bangladesh with AI-powered trainer matching, 10,000+ clients, and 500+ certified trainers across 50+ cities." />
        <meta name="keywords" content="HealthyThako about, fitness platform Bangladesh, AI trainer matching, certified personal trainers BD, fitness marketplace, health technology" />
        
        <meta property="og:title" content="About HealthyThako - Bangladesh's Leading AI-Powered Fitness Marketplace" />
        <meta property="og:description" content="Discover how HealthyThako revolutionizes fitness in Bangladesh with AI-powered trainer matching and certified professionals." />
        <meta property="og:url" content="https://healthythako.com/about" />
        
        <link rel="canonical" href="https://healthythako.com/about" />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-white">
        <Header />
        
        {/* Breadcrumb Navigation */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <Breadcrumb 
              items={[
                { label: 'About', current: true }
              ]}
              showBackButton={false}
            />
          </div>
        </div>
        
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              About <span className="text-pink-600">HealthyThako</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
              Revolutionizing fitness in Bangladesh through AI-powered technology, 
              connecting people with certified trainers for personalized wellness journeys.
            </p>
            
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission & Vision</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Democratizing fitness access through technology and human connection
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Target className="h-8 w-8 text-pink-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Mission</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  To make quality fitness training accessible to every person in Bangladesh through 
                  AI-powered matching and certified professionals.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-center text-gray-700">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    Democratizing fitness access
                  </div>
                  <div className="flex items-center justify-center text-gray-700">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    Building health communities
                  </div>
                  <div className="flex items-center justify-center text-gray-700">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    Promoting holistic wellness
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Globe className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Vision</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  To become South Asia's leading AI-powered fitness platform, 
                  empowering millions to achieve their health goals.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-center text-gray-700">
                    <Star className="h-5 w-5 text-yellow-500 mr-3" />
                    1M+ clients by 2030
                  </div>
                  <div className="flex items-center justify-center text-gray-700">
                    <Star className="h-5 w-5 text-yellow-500 mr-3" />
                    10K+ certified trainers
                  </div>
                  <div className="flex items-center justify-center text-gray-700">
                    <Star className="h-5 w-5 text-yellow-500 mr-3" />
                    100+ cities coverage
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Founders Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Founders</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                The visionary leaders driving HealthyThako's mission to transform fitness in Bangladesh
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {founders.map((founder, index) => <div key={index} className="text-center group">
                  <div className="relative mb-6">
                    <div className="w-32 h-32 mx-auto rounded-2xl overflow-hidden bg-gray-200 ring-4 ring-white shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      <img src={founder.image} alt={founder.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={e => {
                    e.currentTarget.src = '/placeholder.svg';
                  }} />
                    </div>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{founder.name}</h3>
                  <p className="text-pink-600 font-medium">{founder.position}</p>
                </div>)}
            </div>
          </div>
        </section>

        {/* AI Technology */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">AI-Powered Innovation</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Cutting-edge technology meets personalized fitness solutions
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Brain className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Smart Matching</h3>
                <p className="text-gray-600">AI analyzes preferences and goals for perfect trainer-client matches.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Real-time Optimization</h3>
                <p className="text-gray-600">Dynamic scheduling and workout adjustments based on progress.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Predictive Analytics</h3>
                <p className="text-gray-600">Forecast outcomes and suggest personalized improvement strategies.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Statistics */}
        

        {/* Service Excellence */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Service Excellence</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Quality standards that set us apart in the fitness industry
              </p>
            </div>
            <div className="grid md:grid-cols-4 gap-8">
              {[{
              icon: Shield,
              title: "Verified Trainers",
              desc: "Rigorous certification process"
            }, {
              icon: Star,
              title: "Quality Assurance",
              desc: "Continuous performance monitoring"
            }, {
              icon: Heart,
              title: "Client-First",
              desc: "Personalized fitness journeys"
            }, {
              icon: Award,
              title: "Industry Recognition",
              desc: "Award-winning platform design"
            }].map((item, index) => <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <item.icon className="h-8 w-8 text-pink-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>)}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        

        <Footer />
      </div>
    </>;
};
export default About;