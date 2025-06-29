
import React from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Terms = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service | HealthyThako</title>
        <meta name="description" content="Read HealthyThako's terms of service to understand the rules and guidelines for using our fitness platform." />
      </Helmet>

      <div className="min-h-screen bg-white">
        <Header />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="prose max-w-none">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
            <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700">
                By accessing and using HealthyThako, you accept and agree to be bound by the terms 
                and provision of this agreement. If you do not agree to abide by the above, please 
                do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Service Description</h2>
              <p className="text-gray-700 mb-4">
                HealthyThako is a platform that connects clients with certified fitness trainers for 
                personal training services. We provide:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Trainer discovery and booking services</li>
                <li>Payment processing and transaction management</li>
                <li>Communication tools between clients and trainers</li>
                <li>Session scheduling and management</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Responsibilities</h2>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">For Clients:</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li>Provide accurate health and fitness information</li>
                  <li>Follow safety guidelines during training sessions</li>
                  <li>Respect trainers and their time</li>
                  <li>Make payments on time</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">For Trainers:</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li>Maintain valid certifications and licenses</li>
                  <li>Provide professional and safe training services</li>
                  <li>Respect client privacy and confidentiality</li>
                  <li>Be punctual and reliable</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Payment Terms</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Payments are processed securely through our payment partners</li>
                <li>HealthyThako charges a service fee on all transactions</li>
                <li>Refunds are subject to our refund policy</li>
                <li>Trainers receive payments after successful service delivery</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Cancellation and Refund Policy</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Sessions can be cancelled up to 24 hours before scheduled time</li>
                <li>Late cancellations may incur charges</li>
                <li>Refunds are processed within 5-7 business days</li>
                <li>Emergency cancellations are handled case-by-case</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Liability and Disclaimers</h2>
              <p className="text-gray-700 mb-4">
                HealthyThako acts as a platform connecting clients and trainers. We are not responsible for:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Injuries occurring during training sessions</li>
                <li>Quality of training services provided by trainers</li>
                <li>Disputes between clients and trainers</li>
                <li>Loss of personal property</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Prohibited Activities</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Harassment or inappropriate behavior</li>
                <li>Fraudulent activities or payment disputes</li>
                <li>Sharing account credentials</li>
                <li>Violating intellectual property rights</li>
                <li>Bypassing platform fees</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Account Termination</h2>
              <p className="text-gray-700">
                We reserve the right to suspend or terminate accounts that violate these terms or 
                engage in prohibited activities. Users may also delete their accounts at any time.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Changes to Terms</h2>
              <p className="text-gray-700">
                We may update these terms from time to time. Users will be notified of significant 
                changes, and continued use of the platform constitutes acceptance of the updated terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact Information</h2>
              <p className="text-gray-700">
                For questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-4 text-gray-700">
                <p>Email: legal@healthythako.com</p>
                <p>Phone: +880 1700-000000</p>
                <p>Address: Dhaka, Bangladesh</p>
              </div>
            </section>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default Terms;
