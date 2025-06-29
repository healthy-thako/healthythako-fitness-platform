
import React from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Shield, Clock, AlertCircle, CheckCircle } from 'lucide-react';

const RefundPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Refund Policy | HealthyThako - Hire Fitness Trainers & Buy Gym Memberships</title>
        <meta name="description" content="Learn about HealthyThako's refund policy for fitness training sessions and gym memberships. Fair and transparent refund terms for customers in Bangladesh." />
        <meta name="keywords" content="HealthyThako refund policy, fitness trainer refund, gym membership refund, Bangladesh fitness platform refund" />
      </Helmet>

      <div className="min-h-screen bg-white">
        <Header />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <Shield className="h-16 w-16 text-green-600 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Refund Policy</h1>
            <p className="text-xl text-gray-600">Fair and transparent refund terms</p>
            <p className="text-gray-500 mt-4">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="prose max-w-none">
            {/* Satisfaction Guarantee */}
            <section className="mb-12 bg-green-50 rounded-2xl p-8">
              <div className="flex items-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                <h2 className="text-2xl font-semibold text-gray-900 mb-0">100% Satisfaction Guarantee</h2>
              </div>
              <p className="text-gray-700 text-lg">
                We stand behind the quality of our services. If you're not completely satisfied with your first training session or gym experience, we'll make it right or provide a full refund.
              </p>
            </section>

            {/* Training Sessions Refunds */}
            <section className="mb-12">
              <h2 className="text-3xl font-semibold text-gray-900 mb-6">Training Session Refunds</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Full Refund Eligible</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      Trainer cancels the session
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      First session dissatisfaction
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      Service not delivered as promised
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      Technical issues preventing session
                    </li>
                  </ul>
                </div>

                <div className="bg-yellow-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Partial Refund (50%)</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                      Cancellation 12-24 hours before
                    </li>
                    <li className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                      Emergency cancellation by client
                    </li>
                    <li className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                      Session interrupted by client
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-red-50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">No Refund</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                    Cancellation less than 12 hours before session
                  </li>
                  <li className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                    No-show without prior notice
                  </li>
                  <li className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                    Session completed as scheduled
                  </li>
                  <li className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                    Violation of terms and conditions
                  </li>
                </ul>
              </div>
            </section>

            {/* Gym Membership Refunds */}
            <section className="mb-12">
              <h2 className="text-3xl font-semibold text-gray-900 mb-6">Gym Membership Refunds</h2>
              
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-8 mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Cooling-off Period</h3>
                <p className="text-gray-700 mb-4">
                  You have 7 days from purchase to cancel your gym membership for a full refund, provided you haven't used the facilities more than twice.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Monthly Memberships</h4>
                  <p className="text-gray-600">Prorated refund available up to 15 days into the billing cycle</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Quarterly Memberships</h4>
                  <p className="text-gray-600">Refund available within first month, minus usage fees</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Annual Memberships</h4>
                  <p className="text-gray-600">Partial refund available within first 30 days</p>
                </div>
              </div>
            </section>

            {/* Refund Process */}
            <section className="mb-12">
              <div className="flex items-center mb-6">
                <Clock className="h-8 w-8 text-blue-600 mr-3" />
                <h2 className="text-3xl font-semibold text-gray-900">Refund Process</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Submit Request</h4>
                  <p className="text-gray-600 text-sm">Contact support or use dashboard</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-blue-600 font-bold">2</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Review Process</h4>
                  <p className="text-gray-600 text-sm">24-48 hours review time</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-blue-600 font-bold">3</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Approval</h4>
                  <p className="text-gray-600 text-sm">Notification sent via email</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-blue-600 font-bold">4</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Refund Issued</h4>
                  <p className="text-gray-600 text-sm">3-7 business days</p>
                </div>
              </div>
            </section>

            {/* Special Circumstances */}
            <section className="mb-8">
              <h2 className="text-3xl font-semibold text-gray-900 mb-6">Special Circumstances</h2>
              <div className="bg-gray-50 rounded-xl p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Medical or Emergency Situations</h3>
                <p className="text-gray-700 mb-4">
                  We understand that life can be unpredictable. In case of medical emergencies, family emergencies, 
                  or other extraordinary circumstances, we will review refund requests on a case-by-case basis.
                </p>
                <p className="text-gray-700">
                  Documentation may be required for verification purposes. Contact our support team to discuss your situation.
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section className="mb-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
              <h2 className="text-2xl font-semibold mb-4">Need Help with a Refund?</h2>
              <p className="mb-6">Our support team is here to help you with any refund-related questions.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="font-semibold">Email</p>
                  <p>refunds@healthythako.com</p>
                </div>
                <div>
                  <p className="font-semibold">Phone</p>
                  <p>+880 1700-000000</p>
                </div>
                <div>
                  <p className="font-semibold">Live Chat</p>
                  <p>Available 9 AM - 8 PM</p>
                </div>
              </div>
            </section>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default RefundPolicy;
