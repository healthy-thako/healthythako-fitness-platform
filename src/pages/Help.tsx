
import React from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, HelpCircle, Book, MessageSquare, Phone } from 'lucide-react';

const Help = () => {
  const faqs = [
    {
      question: "How do I book a trainer?",
      answer: "Browse trainers, select your preferred trainer, choose a service package, and proceed with payment. You'll receive confirmation and can schedule your sessions."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, mobile banking (bKash, Nagad, Rocket), and bank transfers through our secure payment partners."
    },
    {
      question: "Can I cancel or reschedule a session?",
      answer: "Yes, you can cancel or reschedule sessions up to 24 hours before the scheduled time without any penalty."
    },
    {
      question: "How do online sessions work?",
      answer: "Online sessions are conducted via video call platforms like Zoom or Google Meet. Your trainer will send you the meeting link before the session."
    },
    {
      question: "Are trainers verified?",
      answer: "Yes, all trainers go through a verification process including certification checks and background verification before being approved on our platform."
    }
  ];

  const helpCategories = [
    {
      title: "Getting Started",
      description: "Learn the basics of using HealthyThako",
      icon: Book,
      topics: ["Creating an account", "Setting up your profile", "Finding trainers", "Booking your first session"]
    },
    {
      title: "Booking & Payments",
      description: "Everything about bookings and payments",
      icon: HelpCircle,
      topics: ["Payment methods", "Refund policy", "Rescheduling sessions", "Cancellation policy"]
    },
    {
      title: "Sessions & Training",
      description: "Guidelines for training sessions",
      icon: MessageSquare,
      topics: ["Online vs in-person", "Session preparation", "Equipment needed", "Communication with trainers"]
    },
    {
      title: "Account & Support",
      description: "Account management and support",
      icon: Phone,
      topics: ["Account settings", "Privacy & security", "Technical support", "Feedback & reviews"]
    }
  ];

  return (
    <>
      <Helmet>
        <title>Help Center | HealthyThako</title>
        <meta name="description" content="Find answers to frequently asked questions and get help with using HealthyThako fitness platform." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
            <p className="text-xl text-gray-600 mb-8">Find answers to your questions and get support</p>
            
            {/* Search */}
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input 
                  placeholder="Search for help..." 
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Help Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {helpCategories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                      <IconComponent className="h-6 w-6 text-purple-600" />
                    </div>
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.topics.map((topic, topicIndex) => (
                        <li key={topicIndex} className="text-sm text-gray-600 hover:text-purple-600 cursor-pointer">
                          • {topic}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* FAQ Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h2>
            <div className="max-w-4xl mx-auto space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Contact Support */}
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle>Still need help?</CardTitle>
              <p className="text-gray-600">Our support team is here to help you</p>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button variant="outline" className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Live Chat
                </Button>
                <Button variant="outline" className="w-full">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Support
                </Button>
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Contact Support Team
              </Button>
            </CardContent>
          </Card>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default Help;
