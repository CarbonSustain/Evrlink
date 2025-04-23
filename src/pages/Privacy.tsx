import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0A0B14] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 grid-pattern opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow"></div>
      <div className="absolute top-40 right-20 w-72 h-72 bg-secondary/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow delay-1000"></div>

      <Navbar />
      
      <div className="flex-1 pt-32 pb-24 relative z-10">
        <div className="content-container">
          <motion.div 
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-display font-medium mb-8 text-white bg-gradient-to-r from-primary to-secondary bg-clip-text">
              Privacy Policy
            </h1>
            
            <div className="space-y-8 text-gray-300">
              <section>
                <h2 className="text-2xl font-display font-medium mb-4 text-white">1. Information We Collect</h2>
                <p>
                  We collect information that you provide directly to us when creating or claiming gifts, including:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Name and contact information</li>
                  <li>Gift messages and content</li>
                  <li>Payment information (processed securely through our payment partners)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-display font-medium mb-4 text-white">2. How We Use Your Information</h2>
                <p>
                  We use the information we collect to:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Process your gift transactions</li>
                  <li>Send gift notifications and updates</li>
                  <li>Improve our services and user experience</li>
                  <li>Communicate with you about your account and our services</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-display font-medium mb-4 text-white">3. Data Security</h2>
                <p>
                  We implement appropriate security measures to protect your personal information, including:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Encryption of sensitive data</li>
                  <li>Regular security assessments</li>
                  <li>Secure data storage and transmission</li>
                  <li>Access controls and authentication</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-display font-medium mb-4 text-white">4. Your Rights</h2>
                <p>
                  You have the right to:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Opt-out of marketing communications</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-display font-medium mb-4 text-white">5. Contact Us</h2>
                <p>
                  If you have any questions about this Privacy Policy, please contact us at:
                </p>
                <p className="mt-2">
                  Email: privacy@evrlink.com
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Privacy; 