import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Button from '@/components/Button';
import { Background } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@/config';
import { getSignedS3Url, extractFilenameFromUrl } from '@/utils/s3Helpers';

interface BackgroundGalleryProps {
  backgrounds: Background[];
  isLoading: boolean;
  error: string | null;
  onSelectBackground: (background: Background) => void;
  emptyStateMessage?: string;
}

interface ImageUrlCache {
  [key: string]: {
    url: string;
    expiresAt: number;
  };
}

// URL cache to avoid generating new signed URLs unnecessarily
const urlCache: ImageUrlCache = {};

const getImageUrl = async (imageURI: string): Promise<string> => {
  if (!imageURI) return '';

  // Check if we have a cached URL that hasn't expired
  if (urlCache[imageURI] && urlCache[imageURI].expiresAt > Date.now()) {
    return urlCache[imageURI].url;
  }

  try {
    let filename = '';
    
    if (imageURI.startsWith('http')) {
      // Extract filename from URL
      filename = extractFilenameFromUrl(imageURI);
      if (!filename) return imageURI; // If we can't extract the filename, return the original URL
    } else {
      // For relative paths (e.g., just the filename)
      filename = imageURI.split('/').pop() || '';
      if (!filename) return '';
      
      // If no extension, default to jpeg
      filename = filename.includes('.') ? filename : `${filename}.jpeg`;
    }

    // Generate signed URL for S3 access
    const signedUrl = await getSignedS3Url(filename);
    
    // Cache the URL with an expiry time slightly shorter than the actual signed URL expiry
    // (default is 1 hour, so we cache for 50 minutes)
    urlCache[imageURI] = {
      url: signedUrl,
      expiresAt: Date.now() + 50 * 60 * 1000 // 50 minutes
    };
    
    return signedUrl;
  } catch (error) {
    console.error('Error getting signed URL:', error);
    
    // Fallback to API URL if S3 URL generation fails
    const filename = extractFilenameFromUrl(imageURI);
    if (filename) {
      return `${API_BASE_URL}/uploads/${filename}`;
    }
    
    return '';
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
  const [imageUrls, setImageUrls] = useState<{ [key: string]: string }>({});
  const [loadingImages, setLoadingImages] = useState(true);

  // Load signed URLs for all backgrounds when component mounts or backgrounds change
  useEffect(() => {
    const loadImageUrls = async () => {
      if (!backgrounds.length) {
        setLoadingImages(false);
        return;
      }

      setLoadingImages(true);
      
      try {
        const urlPromises = backgrounds.map(async (background) => {
          if (!background.imageURI) return [background.id, ''];
          
          const url = await getImageUrl(background.imageURI);
          return [background.id, url];
        });
        
        const urlResults = await Promise.all(urlPromises);
        const urlMap = Object.fromEntries(urlResults);
        
        setImageUrls(urlMap);
      } catch (error) {
        console.error('Error loading image URLs:', error);
      } finally {
        setLoadingImages(false);
      }
    };

    loadImageUrls();
  }, [backgrounds]);

  if (isLoading || loadingImages) {
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
        const imageUrl = imageUrls[background.id] || '/placeholder-loading.jpg';
          
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
                    const currentSrc = target.src;
                  
                    // If all fails, use placeholder
                    target.onerror = null; // Prevent infinite loop
                    target.src = '/placeholder.jpg';
                    console.error(`Failed to load image: ${currentSrc}`);
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