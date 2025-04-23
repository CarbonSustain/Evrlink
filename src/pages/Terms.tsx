import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Terms = () => {
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
              Terms of Service
            </h1>
            
            <div className="space-y-8 text-gray-300">
              <section>
                <h2 className="text-2xl font-display font-medium mb-4 text-white">1. Acceptance of Terms</h2>
                <p>
                  Welcome to Evrlink! These Terms of Service ("Terms") govern your use of Evrlink's website, services, and products.
                </p>
                <p>
                  By using Evrlink's services, you agree to these Terms. Please read them carefully.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display font-medium mb-4 text-white">2. Use of Service</h2>
                <p>
                  You agree to use Evrlink only for lawful purposes and in accordance with these terms. You are responsible for:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Maintaining the confidentiality of your account</li>
                  <li>All activities that occur under your account</li>
                  <li>Ensuring your content complies with our guidelines</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-display font-medium mb-4 text-white">3. Gift Content</h2>
                <p>
                  When creating gifts, you agree not to:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Include harmful or malicious content</li>
                  <li>Violate intellectual property rights</li>
                  <li>Share personal or sensitive information</li>
                  <li>Use the service for spam or harassment</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-display font-medium mb-4 text-white">4. Payment Terms</h2>
                <p>
                  All payments are processed securely through our payment partners. You agree to:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Provide accurate payment information</li>
                  <li>Pay all fees associated with your gifts</li>
                  <li>Accept our refund policy</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-display font-medium mb-4 text-white">5. Limitation of Liability</h2>
                <p>
                  Evrlink is provided "as is" without warranties of any kind. We are not liable for:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Service interruptions or errors</li>
                  <li>Loss of data or content</li>
                  <li>Third-party actions or content</li>
                  <li>Consequential or indirect damages</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-display font-medium mb-4 text-white">6. Changes to Terms</h2>
                <p>
                  Evrlink reserves the right to modify these Terms at any time. Continued use of Evrlink after changes constitutes acceptance of the new terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display font-medium mb-4 text-white">7. Contact</h2>
                <p>
                  For any questions about these Terms, please contact us at legal@evrlink.com.
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

export default Terms; 