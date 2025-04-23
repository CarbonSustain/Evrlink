import React from 'react';
import { Link } from 'react-router-dom';
import { Gift, Heart, Twitter, Github } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white/5 backdrop-blur-xl border-t border-white/10 py-12 mt-auto">
      <div className="content-container">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                <Gift className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-display font-medium text-white">Evrlink</span>
            </div>
            
            <p className="text-gray-300 max-w-md">
              A beautiful way to share and receive gifts. Send love, surprise, and joy to your friends and loved ones.
            </p>
            
            <div className="flex items-center space-x-6">
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          {/* Links Section */}
          <div className="space-y-4">
            <h4 className="text-base font-medium mb-3 text-white">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/create" className="text-gray-300 hover:text-white transition-colors">
                  Create a Gift
                </Link>
              </li>
              <li>
                <Link to="/claim" className="text-gray-300 hover:text-white transition-colors">
                  Claim a Gift
                </Link>
              </li>
            </ul>
          </div>
          
          {/* More Links Section */}
          <div className="space-y-4">
            <h4 className="text-base font-medium mb-3 text-white">Company</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-300 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Evrlink. All rights reserved.
          </p>
          
          <div className="mt-4 sm:mt-0 flex items-center">
            
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
