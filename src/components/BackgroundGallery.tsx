import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Button from '@/components/Button';
import { Background } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@/config';

interface BackgroundGalleryProps {
  backgrounds: Background[];
  isLoading: boolean;
  error: string | null;
  onSelectBackground: (background: Background) => void;
  emptyStateMessage?: string;
}

// Helper function to get proper image URL
const getImageUrl = (imageURI: string): string => {
  if (!imageURI) return '';
  
  if (imageURI.startsWith('http')) {
    return imageURI;
  } else if (imageURI.startsWith('/')) {
    return `${API_BASE_URL}${imageURI}`;
  } else {
    return `${API_BASE_URL}/${imageURI}`;
  }
};

const BackgroundGallery: React.FC<BackgroundGalleryProps> = ({
  backgrounds,
  isLoading,
  error,
  onSelectBackground,
  emptyStateMessage = 'No backgrounds found in this category'
}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="ml-3 text-white">Loading backgrounds...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <div className="text-red-400 mb-3">{error}</div>
        <Button 
          onClick={() => window.location.reload()}
          variant="outline"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (backgrounds.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-300 text-lg mb-6">{emptyStateMessage}</p>
        <Button
          onClick={() => navigate('/create-background')}
          className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3"
        >
          Create the First One
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {backgrounds.map((background, index) => {
        const imageUrl = getImageUrl(background.imageURI);
          
        return (
          <motion.div
            key={background.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group cursor-pointer"
            onClick={() => onSelectBackground(background)}
          >
            <div className="relative rounded-xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
              <div className="relative h-48">
                <img
                  src={imageUrl}
                  alt={background.category}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.jpg'; // Fallback image
                    console.error(`Failed to load image: ${imageUrl}`);
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm font-medium">
                  {background.price} ETH
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-medium text-white mb-2 group-hover:text-primary transition-colors">
                  {background.category}
                </h3>
                <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                  Beautiful background for creating unique gift cards.
                </p>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">
                    By {background.artistAddress.slice(0, 6)}...{background.artistAddress.slice(-4)}
                  </span>
                  <span className="text-primary font-medium">
                    Used {background.usageCount} time{background.usageCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default BackgroundGallery; 