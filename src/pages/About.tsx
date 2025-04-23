import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Gift, Heart, Shield, Sparkles } from 'lucide-react';

const About = () => {
  const features = [
    {
      icon: <Gift className="w-8 h-8" />,
      title: "Personalized Gifts",
      description: "Create unique, meaningful gifts that tell your story and show how much you care."
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Thoughtful Experience",
      description: "Every gift is crafted with love and attention to detail, making the experience special for both sender and receiver."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure & Private",
      description: "Your gifts and messages are protected with advanced encryption, ensuring your personal moments stay private."
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Magical Moments",
      description: "Transform ordinary gift-giving into extraordinary experiences with our innovative platform."
    }
  ];

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
          {/* Hero Section */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-display font-medium mb-6 text-white bg-gradient-to-r from-primary to-secondary bg-clip-text">
              About Evrlink
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              We're on a mission to revolutionize gift-giving by creating meaningful, personalized experiences that bring joy to both sender and receiver.
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center mb-4">
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-display font-medium mb-2 text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Mission Statement */}
          <motion.div 
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8 max-w-3xl mx-auto">
              <h2 className="text-2xl font-display font-medium mb-4 text-white">
                Our Mission
              </h2>
              <p className="text-gray-300 text-lg">
                At Evrlink, we believe that every gift should be more than just an object - it should be a moment, a memory, and a message of love. We're dedicated to making gift-giving more meaningful, personal, and magical for everyone.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default About; 