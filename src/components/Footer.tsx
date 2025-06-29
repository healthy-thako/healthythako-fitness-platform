import React from 'react';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="relative overflow-hidden bg-white border-t border-gray-100">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-white"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(139,21,56,0.1)_1px,transparent_0)] bg-[length:20px_20px] opacity-30"></div>
      
      <div className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="sm:col-span-2 lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-[#8b1538] to-[#c90e5c] rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
                <span className="text-white font-bold text-sm sm:text-lg">HT</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-[#8b1538] to-[#c90e5c] bg-clip-text text-transparent">
                  HealthyThako
                </span>
                <span className="text-xs sm:text-sm text-gray-600 font-medium">Fitness Marketplace</span>
              </div>
            </div>
            
            <p className="text-gray-700 text-sm sm:text-base lg:text-lg leading-relaxed max-w-md">
              Bangladesh's leading fitness marketplace connecting clients with certified trainers for personalized fitness solutions.
            </p>
            
            {/* Contact Info - Compact */}
            <div className="grid grid-cols-1 gap-2 sm:gap-3">
              <div className="flex items-center space-x-2 sm:space-x-3 text-gray-700">
                <div className="p-1.5 sm:p-2 bg-gray-50 rounded-lg">
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-[#c90e5c]" />
                </div>
                <span className="text-xs sm:text-sm">info@healthythako.com</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 text-gray-700">
                <div className="p-1.5 sm:p-2 bg-gray-50 rounded-lg">
                  <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-[#c90e5c]" />
                </div>
                <span className="text-xs sm:text-sm">+880 1886-102806</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 text-gray-700">
                <div className="p-1.5 sm:p-2 bg-gray-50 rounded-lg">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-[#c90e5c]" />
                </div>
                <span className="text-xs sm:text-sm">Dhaka, Bangladesh</span>
              </div>
            </div>

            {/* Social Links - Compact */}
            <div className="flex space-x-2 sm:space-x-3 pt-2">
              {[
                {
                  icon: Facebook,
                  color: 'hover:text-blue-600',
                  bgColor: 'hover:bg-blue-50',
                  label: 'Facebook'
                },
                {
                  icon: Instagram,
                  color: 'hover:text-pink-600',
                  bgColor: 'hover:bg-pink-50',
                  label: 'Instagram'
                },
                {
                  icon: Twitter,
                  color: 'hover:text-blue-400',
                  bgColor: 'hover:bg-blue-50',
                  label: 'Twitter'
                },
                {
                  icon: Youtube,
                  color: 'hover:text-red-600',
                  bgColor: 'hover:bg-red-50',
                  label: 'YouTube'
                }
              ].map(({ icon: Icon, color, bgColor, label }) => (
                <a
                  key={label}
                  href="#"
                  className={`p-2 sm:p-2.5 bg-gray-50 hover:bg-white rounded-lg sm:rounded-xl text-gray-600 ${color} ${bgColor} transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-md`}
                  aria-label={label}
                >
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* For Clients */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-bold bg-gradient-to-r from-[#8b1538] to-[#c90e5c] bg-clip-text text-transparent">
              For Clients
            </h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {[
                { name: 'Find Trainers', href: '/find-trainers' },
                { name: 'Browse Services', href: '/browse-services' },
                { name: 'Gym Membership', href: '/gym-membership' },
                { name: 'GymPass', href: '/gympass' },
                { name: 'AI Assistant', href: 'https://ai.healthythako.com', external: true }
              ].map(item => (
                <li key={item.name}>
                  {item.external ? (
                    <a 
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-900 transition-colors duration-300 flex items-center group text-xs sm:text-sm"
                    >
                      <ArrowRight className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1.5 sm:mr-2 text-[#c90e5c] opacity-0 group-hover:opacity-100 transform -translate-x-1 group-hover:translate-x-0 transition-all duration-200" />
                      <span className="group-hover:translate-x-1 transition-transform duration-200">{item.name}</span>
                    </a>
                  ) : (
                    <Link 
                      to={item.href} 
                      className="text-gray-600 hover:text-gray-900 transition-colors duration-300 flex items-center group text-xs sm:text-sm"
                    >
                      <ArrowRight className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1.5 sm:mr-2 text-[#c90e5c] opacity-0 group-hover:opacity-100 transform -translate-x-1 group-hover:translate-x-0 transition-all duration-200" />
                      <span className="group-hover:translate-x-1 transition-transform duration-200">{item.name}</span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* For Trainers & Gyms */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-bold bg-gradient-to-r from-[#8b1538] to-[#c90e5c] bg-clip-text text-transparent">
              For Partners
            </h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <Link to="/join-trainer" className="text-gray-600 hover:text-gray-900 transition-colors duration-300 flex items-center group text-xs sm:text-sm">
                  <ArrowRight className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1.5 sm:mr-2 text-[#c90e5c] opacity-0 group-hover:opacity-100 transform -translate-x-1 group-hover:translate-x-0 transition-all duration-200" />
                  <span className="group-hover:translate-x-1 transition-transform duration-200">Join as Trainer</span>
                </Link>
              </li>
              <li>
                <Link to="/join-gym" className="text-gray-600 hover:text-gray-900 transition-colors duration-300 flex items-center group text-xs sm:text-sm">
                  <ArrowRight className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1.5 sm:mr-2 text-[#c90e5c] opacity-0 group-hover:opacity-100 transform -translate-x-1 group-hover:translate-x-0 transition-all duration-200" />
                  <span className="group-hover:translate-x-1 transition-transform duration-200">Join as Gym</span>
                </Link>
              </li>
              {['Trainer Dashboard', 'Earnings', 'Resources', 'Success Tips'].map(item => (
                <li key={item}>
                  <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors duration-300 flex items-center group text-xs sm:text-sm">
                    <ArrowRight className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1.5 sm:mr-2 text-[#c90e5c] opacity-0 group-hover:opacity-100 transform -translate-x-1 group-hover:translate-x-0 transition-all duration-200" />
                    <span className="group-hover:translate-x-1 transition-transform duration-200">{item}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 mt-6 sm:mt-8 lg:mt-12 pt-4 sm:pt-6 lg:pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
            <p className="text-gray-600 text-xs sm:text-sm text-center sm:text-left">
              © 2025 HealthyThako. All rights reserved. Built with ❤️ in Bangladesh.
            </p>
            <div className="flex flex-wrap justify-center sm:justify-end gap-3 sm:gap-4 lg:gap-6">
              {[
                { name: 'Privacy Policy', href: '/privacy' },
                { name: 'Terms of Service', href: '/terms' },
                { name: 'Support', href: '/support' },
                { name: 'Contact', href: '/contact' },
                { name: 'Blog', href: '/blog' }
              ].map(link => (
                <Link 
                  key={link.name} 
                  to={link.href} 
                  className="text-gray-600 hover:text-gray-900 text-xs sm:text-sm transition-colors duration-300 relative group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#8b1538] to-[#c90e5c] group-hover:w-full transition-all duration-300"></span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
