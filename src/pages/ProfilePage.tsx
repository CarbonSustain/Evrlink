import { Box, Typography, Button } from '@mui/material';
import { useWallet } from '../contexts/WalletContext';
import { Profile } from '../components/Profile';

export const ProfilePage = () => {
  const { address, isConnected, connect } = useWallet();

  const handleConnect = async () => {
    try {
      await connect('mock_signature'); // Add a mock signature for development
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  if (!isConnected) {
    return (
      <Box 
        sx={{ 
          minHeight: '60vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <Typography variant="h5" color="text.secondary">
          Please connect your wallet to view your profile
        </Typography>
        <Button variant="contained" onClick={handleConnect}>
          Connect Wallet
        </Button>
      </Box>
    );
  }

  if (!address) {
    return (
      <Box 
        sx={{ 
          minHeight: '60vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
      >
        <Typography variant="h5" color="text.secondary">
          No wallet address found. Please try reconnecting.
        </Typography>
      </Box>
    );
  }

  return <Profile address={address} />;
};

export default ProfilePage; 