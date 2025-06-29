
import React from 'react';
import { Facebook, Instagram, Youtube, Mail } from 'lucide-react';

const TrainerFooter = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Left Section */}
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-600">© 2025 HealthyThako Trainers</p>
            <p className="text-xs text-gray-500">Version 1.0.3</p>
          </div>

          {/* Center Section */}
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">Terms of Service</a>
            <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">Refund Policy</a>
            <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">Support Center</a>
            <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">FAQs</a>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="h-4 w-4 mr-1" />
              <span className="hidden md:inline">support@healthythako.com</span>
            </div>
            <div className="flex items-center space-x-2">
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="text-gray-400 hover:text-pink-600 transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-600 transition-colors">
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default TrainerFooter;
