import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import BackgroundDetailsModal from './BackgroundDetailsModal';

// Interface used in this component
interface Background {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  price: string;
}

// Interface expected by BackgroundDetailsModal
interface BackgroundModalProps {
  id: string;
  artistAddress: string;
  imageURI: string;
  category: string;
  price: string;
  usageCount: number;
  blockchainId?: string;
  blockchainTxHash?: string;
  createdAt?: string;
  updatedAt?: string;
}

const Marketplace: React.FC = () => {
  const [backgrounds, setBackgrounds] = useState<Background[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBackground, setSelectedBackground] = useState<Background | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchBackgrounds();
  }, []);

  const fetchBackgrounds = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('https://api.evrlink.com/api/backgrounds');
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch backgrounds');
      }

      setBackgrounds(data.backgrounds);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch backgrounds');
    } finally {
      setLoading(false);
    }
  };

  const handleBackgroundClick = (background: Background) => {
    setSelectedBackground(background);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedBackground(null);
  };

  // Transform Background to BackgroundModalProps
  const transformBackground = (bg: Background): BackgroundModalProps => {
    return {
      id: bg.id,
      artistAddress: '0x0000000000000000000000000000000000000000', // Default value
      imageURI: bg.imageUrl,
      category: bg.category,
      price: bg.price,
      usageCount: 0, // Default value
      createdAt: new Date().toISOString(), // Default value
    };
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        NFT Background Marketplace
      </Typography>
      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: {
        xs: '1fr',
        sm: 'repeat(2, 1fr)',
        md: 'repeat(3, 1fr)',
        lg: 'repeat(4, 1fr)'
      }}}>
        {backgrounds.map((background) => (
          <Box key={background.id}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)'
                }
              }}
              onClick={() => handleBackgroundClick(background)}
            >
              <CardMedia
                component="img"
                height="200"
                image={background.imageUrl}
                alt={background.name}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent>
                <Typography variant="h6" noWrap>
                  {background.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {background.description}
                </Typography>
                <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                  {background.price} ETH
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {selectedBackground && (
        <BackgroundDetailsModal
          open={modalOpen}
          onClose={handleCloseModal}
          background={transformBackground(selectedBackground)}
        />
      )}
    </Box>
  );
};

export default Marketplace; 