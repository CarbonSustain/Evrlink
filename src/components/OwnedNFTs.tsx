import React, { useEffect, useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { Box, Card, CardContent, CardMedia, Typography, CircularProgress, Alert, Chip } from '@mui/material';
import { getOwnedNFTs, testApiConnection } from '@/utils/api';

interface NFT {
  id: string;
  tokenId: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  price: string;
  usageCount: number;
  isMinted: boolean;
  createdAt: string;
  contractAddress: string;
  tokenURI: string;
}

const OwnedNFTs: React.FC = () => {
  const { address, isConnected } = useWallet();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!address || !isConnected) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // First test the API connection
        const connectionTest = await testApiConnection();
        if (!connectionTest.success) {
          setError(`API Connection Error: ${connectionTest.message}`);
          return;
        }

        // Then fetch the NFTs
        const data = await getOwnedNFTs(address);
        
        if (data.success) {
          const formattedNFTs = data.nfts.map((nft: NFT) => ({
            ...nft,
            imageUrl: nft.imageUrl.startsWith('http') 
              ? nft.imageUrl 
              : `${import.meta.env.VITE_API_URL}${nft.imageUrl}`
          }));
          setNfts(formattedNFTs);
        } else {
          setError(data.error || 'Failed to fetch NFTs');
        }
      } catch (err) {
        console.error('Error fetching NFTs:', err);
        setError(err instanceof Error ? err.message : 'Error connecting to the server');
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, [address, isConnected]);

  if (!isConnected || !address) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          Please connect your wallet to view your NFTs
        </Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Typography variant="body2" color="text.secondary">
          Please check that:
        </Typography>
        <Typography variant="body2" color="text.secondary" component="ul" sx={{ textAlign: 'left', maxWidth: 400, mx: 'auto', mt: 1 }}>
          <li>The backend server is running at {import.meta.env.VITE_API_URL}</li>
          <li>Your wallet is connected to the Sepolia network</li>
          <li>You have NFTs minted to your address</li>
        </Typography>
      </Box>
    );
  }

  if (nfts.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No NFTs found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          You don't have any NFTs in your wallet yet
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ 
        display: 'grid', 
        gap: 3, 
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(4, 1fr)'
        }
      }}>
        {nfts.map((nft) => (
          <Card key={nft.tokenId} sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            bgcolor: 'background.paper',
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <CardMedia
              component="img"
              height="200"
              image={nft.imageUrl}
              alt={nft.name}
              sx={{ objectFit: 'cover' }}
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography gutterBottom variant="h6" component="h2" sx={{ color: 'text.primary' }}>
                {nft.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {nft.description}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Category: {nft.category}
              </Typography>
              <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 'medium' }}>
                Price: {nft.price} ETH
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default OwnedNFTs; 