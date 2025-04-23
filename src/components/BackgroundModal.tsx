import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { X } from 'lucide-react';
import { Background as GridBackground } from './BackgroundsGrid';
import { Background as ApiBackground } from '@/services/api'; 
import { motion } from 'framer-motion';

// Support both types of Background interfaces
interface BackgroundModalProps {
  background: GridBackground | ApiBackground;
  isOpen: boolean;
  onClose: () => void;
  onSelect: () => void;
}

const BackgroundModal: React.FC<BackgroundModalProps> = ({
  background,
  isOpen,
  onClose,
  onSelect
}) => {
  // Check which type of background we're dealing with
  const isApiBackground = 'imageURI' in background;
  
  // Handle both imageUrl and imageURI
  const imageSource = isApiBackground 
    ? (background as ApiBackground).imageURI 
    : (background as GridBackground).imageUrl;
  
  // Handle price being string or number
  const price = typeof background.price === 'string' ? background.price : background.price.toString();
  
  // Get either artist or artistAddress
  const artist = isApiBackground
    ? `${(background as ApiBackground).artistAddress.slice(0, 6)}...${(background as ApiBackground).artistAddress.slice(-4)}`
    : (background as GridBackground).artist || 'Unknown Artist';
  
  // Use name or category for title
  const title = isApiBackground 
    ? (background as ApiBackground).category
    : (background as GridBackground).name;

  return (
    <>
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-[#0A0B14] rounded-2xl shadow-2xl z-50 overflow-hidden border border-white/10"
          >
            <div className="relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white/80 hover:text-white transition-colors z-10 hover:bg-black/60"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="h-72 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0B14] to-transparent z-10" />
                <img
                  src={imageSource}
                  alt={title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/400x400?text=Image+Not+Found';
                  }}
                />
              </div>

              <div className="p-8 -mt-16 relative z-20">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-3xl font-display font-medium text-white mb-2">
                      {title}
                    </h3>
                    <p className="text-gray-400 text-lg">
                      By {artist}
                    </p>
                  </div>
                  <div className="bg-indigo-600/20 px-6 py-3 rounded-full">
                    <span className="text-indigo-400 font-medium text-lg">{price} ETH</span>
                  </div>
                </div>

                {!isApiBackground && (background as GridBackground).description && (
                  <p className="text-gray-300 text-lg leading-relaxed mb-8">
                    {(background as GridBackground).description}
                  </p>
                )}

                <div className="bg-white/5 rounded-xl p-6 mb-8">
                  <h4 className="text-white font-medium mb-4 text-lg">Background Details</h4>
                  <ul className="space-y-3 text-base text-gray-300">
                    <li className="flex justify-between items-center">
                      <span>Category</span>
                      <span className="text-indigo-400 font-medium">{background.category}</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span>Price</span>
                      <span className="text-indigo-400 font-medium">{price} ETH</span>
                    </li>
                    {isApiBackground && (background as ApiBackground).usageCount !== undefined && (
                      <li className="flex justify-between items-center">
                        <span>Used</span>
                        <span className="text-indigo-400 font-medium">{(background as ApiBackground).usageCount} times</span>
                      </li>
                    )}
                    {isApiBackground && (background as ApiBackground).blockchainId && (
                      <li className="flex justify-between items-center">
                        <span>Blockchain ID</span>
                        <span className="text-indigo-400 font-medium">#{(background as ApiBackground).blockchainId}</span>
                      </li>
                    )}
                  </ul>
                </div>

                <button
                  onClick={onSelect}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl text-lg font-medium hover:opacity-90 transition-opacity shadow-lg shadow-indigo-600/20"
                >
                  Purchase Background
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </>
  );
};

export default BackgroundModal; 