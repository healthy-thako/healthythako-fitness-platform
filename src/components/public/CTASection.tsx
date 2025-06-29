import React from 'react';
import { Users, Star, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
const CTASection = () => {
  const navigate = useNavigate();
  return <section className="py-12 md:py-20 bg-gradient-to-br from-pink-900 via-pink-800 to-pink-700 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-pink-600/20 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-xl"></div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 md:mb-6">
          Ready to Start Your Fitness Journey?
        </h2>
        <p className="text-lg md:text-xl text-pink-100 mb-6 md:mb-8 max-w-2xl mx-auto">
          Join thousands of satisfied clients who have transformed their lives with HealthyThako - Bangladesh's First One-Stop Fitness Platform
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={() => navigate('/find-trainers')} className="bg-white text-pink-800 hover:bg-pink-50 font-semibold px-6 md:px-8 py-3 md:py-4 text-sm md:text-base">
            <Users className="w-4 md:w-5 h-4 md:h-5 mr-2" />
            Find Your Trainer
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/gym-membership')} className="border-white font-semibold px-6 md:px-8 py-3 md:py-4 text-sm md:text-base text-zinc-50 bg-pink-950 hover:bg-pink-800">
            <MapPin className="w-4 md:w-5 h-4 md:h-5 mr-2" />
            Browse Gyms
          </Button>
        </div>
        
        <div className="flex items-center justify-center gap-4 mt-6 md:mt-8 text-pink-100">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
          </div>
          <span className="text-sm md:text-base">Rated 4.9/5 by 10,000+ users</span>
        </div>
        
        <div className="mt-6 text-pink-100 text-sm">
          <p>Find Trainer and Gym in Bangladesh | HealthyThako</p>
        </div>
      </div>
    </section>;
};
export default CTASection;