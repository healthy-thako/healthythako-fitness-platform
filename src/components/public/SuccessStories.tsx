import React from 'react';
import { motion } from 'motion/react';
import { TestimonialsColumn } from "@/components/ui/testimonials-columns";
import { useNavigate } from 'react-router-dom';

const testimonials = [
  {
    text: "HealthyThako helped me hire fitness trainer in Bangladesh easily. Lost 12kg in 4 months with my amazing trainer Sarah. The platform made everything so convenient!",
    image: "https://images.unsplash.com/photo-1494790108755-2616c78d5ea1?w=150&h=150&fit=crop&crop=face",
    name: "Rashida Khatun",
    role: "Weight Loss Success Story",
  },
  {
    text: "Found the perfect gym membership through HealthyThako. The gym in Gulshan has excellent facilities and the booking process was seamless. Highly recommend!",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    name: "Fahim Ahmed",
    role: "Gym Member in Dhaka",
  },
  {
    text: "As a trainer on HealthyThako, I've connected with amazing clients. The platform's support for fitness professionals in Bangladesh is outstanding!",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    name: "Nafisa Rahman",
    role: "Certified Yoga Trainer",
  },
  {
    text: "Buy gym membership was never this easy! HealthyThako showed me all the best gyms in Chittagong with transparent pricing. Love the convenience!",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    name: "Rakib Hassan",
    role: "Fitness Enthusiast",
  },
  {
    text: "HealthyThako's trainer verification process gave me confidence. My home fitness sessions with trainer Misha have been incredible. 5 stars!",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    name: "Zainab Hussain",
    role: "Home Fitness Client",
  },
  {
    text: "The best platform to hire fitness trainer in Bangladesh! Professional trainers, easy booking, and great results. Gained 8kg muscle mass in 6 months.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    name: "Omar Raza",
    role: "Strength Training Success",
  },
  {
    text: "HealthyThako made my gym owner journey smooth. Listed my gym and got 50+ new members in first month. Excellent platform for gym business!",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
    name: "Sana Sheikh",
    role: "Gym Owner in Dhaka",
  },
  {
    text: "Online fitness sessions through HealthyThako saved my fitness routine during busy schedule. Quality trainers and flexible timing!",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=face",
    name: "Hassan Ali",
    role: "Online Training Client",
  },
  {
    text: "Buy gym membership feature helped me compare gyms in Banani area. Found the perfect gym with swimming pool and modern equipment!",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
    name: "Fatima Begum",
    role: "Swimming & Fitness",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

const SuccessStories = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-gradient-to-br from-gray-50 via-white to-purple-50 py-12 md:py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 md:top-20 left-5 md:left-10 w-40 md:w-64 h-40 md:h-64 bg-purple-100/20 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute bottom-10 md:bottom-20 right-5 md:right-10 w-48 md:w-80 h-48 md:h-80 bg-pink-100/20 rounded-full mix-blend-multiply filter blur-xl"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-[640px] mx-auto mb-8 md:mb-16"
        >
          <motion.div
            className="inline-flex items-center px-3 md:px-4 py-1 md:py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full text-xs md:text-sm font-medium text-purple-800 mb-4 md:mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            ⭐ Success Stories
          </motion.div>

          <h2 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent mb-3 md:mb-4 text-center">
            Real Results from Real People
          </h2>
          <p className="text-center text-gray-600 text-sm md:text-lg leading-relaxed">
            Discover how HealthyThako helped thousands hire fitness trainer in Bangladesh and buy gym membership to achieve their fitness goals
          </p>
        </motion.div>

        <div className="flex justify-center gap-4 md:gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[400px] md:max-h-[640px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
        </div>

        {/* Bottom CTA */}
        <motion.div 
          className="text-center mt-8 md:mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-gray-900">Ready to Start Your Fitness Journey?</h3>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <button 
              onClick={() => navigate('/find-trainers')}
              className="bg-gradient-to-r from-pink-800 via-pink-700 to-pink-600 hover:from-pink-900 hover:via-pink-800 hover:to-pink-700 text-white px-6 md:px-8 py-2 md:py-3 rounded-xl text-sm md:text-lg font-semibold transition-all duration-300"
            >
              Hire Fitness Trainer
            </button>
            <button 
              onClick={() => navigate('/gym-membership')}
              className="border-2 border-pink-600 text-pink-600 hover:bg-pink-600 hover:text-white px-6 md:px-8 py-2 md:py-3 rounded-xl text-sm md:text-lg font-semibold transition-all duration-300"
            >
              Buy Gym Membership
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SuccessStories;
