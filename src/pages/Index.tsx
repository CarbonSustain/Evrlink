import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import GiftCard from '@/components/GiftCard';
import Button from '@/components/Button';
import { Gift, Heart, ArrowRight, Send, Lock } from 'lucide-react';

const Index = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  
  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.6,
        ease: [0.17, 0.67, 0.83, 0.97]
      }
    })
  };
  
  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const scrollY = window.scrollY;
      const parallaxFactor = 0.4;
      
      heroRef.current.style.transform = `translateY(${scrollY * parallaxFactor}px)`;
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0B14] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 grid-pattern opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow"></div>
      <div className="absolute top-40 right-20 w-72 h-72 bg-secondary/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow delay-1000"></div>

      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 overflow-hidden relative">
        <div className="content-container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div 
              ref={heroRef}
              className="space-y-6"
              initial="hidden"
              animate="visible"
              variants={fadeInUpVariants}
              custom={0}
            >
              <div className="inline-block animate-float">
                <div className="w-20 h-20 mx-auto mb-6 relative">
                  <div className="absolute inset-0 bg-secondary/30 rounded-full animate-pulse-slow" />
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Gift className="w-10 h-10 text-white" />
                  </div>
                </div>
              </div>
              
              <motion.h1 
                className="text-4xl sm:text-5xl md:text-6xl font-display font-semibold tracking-tight text-white"
                variants={fadeInUpVariants}
                custom={1}
              >
                Make Gift Giving 
                <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Magical & Memorable</span>
              </motion.h1>
              
              <motion.p 
                className="text-xl text-gray-300 max-w-2xl mx-auto"
                variants={fadeInUpVariants}
                custom={2}
              >
                Send personal gifts with secret messages that can be claimed with a special code. Create memorable experiences for your loved ones.
              </motion.p>
              
              <motion.div 
                className="pt-8 flex flex-col sm:flex-row gap-4 justify-center"
                variants={fadeInUpVariants}
                custom={3}
              >
                <Button 
                  size="lg" 
                  icon={<ArrowRight className="w-5 h-5" />}
                  className="bg-gradient-to-r from-primary/90 to-secondary/90 hover:from-primary hover:to-secondary text-white font-medium shadow-xl shadow-primary/20"
                  onClick={() => window.location.href = '/create'}
                >
                  Create a Gift
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  icon={<ArrowRight className="w-5 h-5" />}
                  className="border-white/30 bg-white/10 text-white hover:bg-white/20 font-medium shadow-xl"
                  onClick={() => window.location.href = '/claim'}
                >
                  Claim a Gift
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20">
        <div className="content-container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl font-display font-medium mb-4 text-white">How It Works</h2>
              <p className="text-gray-300">The simplest way to share and receive gifts online</p>
            </motion.div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <GiftCard 
                title="Claim a Gift"
                description="Enter the secret message to claim your gift and reveal what's been sent to you."
                icon={<Gift className="w-8 h-8" />}
                to="/claim"
                variant="primary"
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <GiftCard 
                title="Create a Gift"
                description="Create a gift pack to send to someone special with a secret message."
                icon={<Heart className="w-8 h-8" />}
                to="/create"
                variant="secondary"
              />
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-20 bg-white/5">
        <div className="content-container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl font-display font-medium mb-4 text-white">Features</h2>
              <p className="text-gray-300">Everything you need for perfect gift-giving experiences</p>
            </motion.div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-xl hover:bg-white/10 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-5 bg-gradient-to-br from-primary/20 to-secondary/20">
                  {React.cloneElement(feature.icon, {
                    className: `w-6 h-6 ${feature.color === 'primary' ? 'text-primary' : 'text-secondary'}`
                  })}
                </div>
                <h3 className="text-xl font-medium mb-2 text-white">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 to-transparent opacity-70 -z-10" />
        
        <div className="content-container relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center bg-white/5 backdrop-blur-xl border border-white/10 py-16 px-8 rounded-3xl"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-display font-medium mb-4 text-white">Ready to share some joy?</h2>
            <p className="text-gray-300 text-lg mb-8">
              Create your first gift pack and surprise someone special today.
            </p>
            <Button 
              size="lg" 
              icon={<ArrowRight className="w-5 h-5" />}
              className="bg-gradient-to-r from-primary/90 to-secondary/90 hover:from-primary hover:to-secondary text-white font-medium shadow-xl shadow-primary/20"
              onClick={() => window.location.href = '/create'}
            >
              Get Started Now
            </Button>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

const features = [
  {
    title: "Easy Gift Creation",
    description: "Create beautiful gift packages in seconds with our intuitive interface.",
    icon: <Gift className="w-6 h-6 text-primary" />,
    color: "primary"
  },
  {
    title: "Secure Messages",
    description: "Your gift messages are encrypted and can only be seen by the recipient.",
    icon: <Lock className="w-6 h-6 text-primary" />,
    color: "primary"
  },
  {
    title: "Instant Delivery",
    description: "Your gifts are delivered instantly to your recipients via a secure link.",
    icon: <Send className="w-6 h-6 text-secondary" />,
    color: "secondary"
  },
  {
    title: "Beautiful Presentation",
    description: "Gifts are presented in a delightful unwrapping experience.",
    icon: <Heart className="w-6 h-6 text-secondary" />,
    color: "secondary"
  },
  {
    title: "Personalization",
    description: "Add personal touches to make your gift truly special and unique.",
    icon: <Gift className="w-6 h-6 text-primary" />,
    color: "primary"
  },
  {
    title: "Gift Tracking",
    description: "Know when your gift has been claimed with real-time notifications.",
    icon: <Send className="w-6 h-6 text-secondary" />,
    color: "secondary"
  },
];

export default Index;
