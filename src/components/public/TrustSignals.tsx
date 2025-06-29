import React from 'react';
import { Shield, Award, Users, Clock, Star, CheckCircle } from 'lucide-react';
const TrustSignals = () => {
  return <section className="bg-white border-b border-gray-100 px-[118px] py-[38px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 items-center">
          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-[#3c0747]/10 to-[#c90e5c]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition-all duration-300">
              <Shield className="h-8 w-8 text-[#3c0747]" />
            </div>
            <p className="text-sm font-semibold text-[#3c0747]">Verified Trainers</p>
          </div>
          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-[#c90e5c]/10 to-[#57001a]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition-all duration-300">
              <Award className="h-8 w-8 text-[#c90e5c]" />
            </div>
            <p className="text-sm font-semibold text-[#3c0747]">Certified Professionals</p>
          </div>
          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-[#57001a]/10 to-[#3c0747]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition-all duration-300">
              <Users className="h-8 w-8 text-[#57001a]" />
            </div>
            <p className="text-sm font-semibold text-[#3c0747]">10K+ Happy Clients</p>
          </div>
          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-[#3c0747]/10 to-[#c90e5c]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition-all duration-300">
              <Clock className="h-8 w-8 text-[#3c0747]" />
            </div>
            <p className="text-sm font-semibold text-[#3c0747]">24/7 Support</p>
          </div>
          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-[#c90e5c]/10 to-[#57001a]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition-all duration-300">
              <Star className="h-8 w-8 text-[#c90e5c]" />
            </div>
            <p className="text-sm font-semibold text-[#3c0747]">4.9★ Average Rating</p>
          </div>
          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-[#57001a]/10 to-[#3c0747]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition-all duration-300">
              <CheckCircle className="h-8 w-8 text-[#57001a]" />
            </div>
            <p className="text-sm font-semibold text-[#3c0747]">Money-back Guarantee</p>
          </div>
        </div>
      </div>
    </section>;
};
export default TrustSignals;