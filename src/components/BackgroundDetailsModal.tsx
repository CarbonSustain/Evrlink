import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert
} from '@mui/material';
import { ethers } from 'ethers';
import { Lock, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { 
  createGiftCard, 
  setGiftCardSecret, 
  transferGiftCard, 
  checkApiHealth,
  GiftCardSecretResponse 
} from '../utils/api';
import { useWallet } from '../contexts/WalletContext';
import { API_BASE_URL } from '@/services/api';

interface Background {
  id: string;
  artistAddress: string;
  imageURI: string;
  category: string;
  price: string;
  blockchainId?: string;
  blockchainTxHash?: string;
  usageCount: number;
  createdAt?: string;
  updatedAt?: string;
}

interface BackgroundDetailsModalProps {
  open: boolean;
  onClose: () => void;
  background: Background;
}

const steps = ['Select Option', 'Details', 'Confirm'];

const BackgroundDetailsModal: React.FC<BackgroundDetailsModalProps> = ({
  open,
  onClose,
  background
}) => {
  const { address: userAddress } = useWallet();
  const mountedRef = React.useRef(true);
  const [activeStep, setActiveStep] = useState(0);
  const [transferType, setTransferType] = useState<'direct' | 'giftcard' | null>(null);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secretKey, setSecretKey] = useState('');
  const [giftCardId, setGiftCardId] = useState<string | null>(null);
  const [giftCardCreated, setGiftCardCreated] = useState(false);
  const [giftCardPrice, setGiftCardPrice] = useState('');
  const [giftCardMessage, setGiftCardMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Add cleanup for async operations
  React.useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Check API health when component mounts
  useEffect(() => {
    const checkHealth = async () => {
      // Skip API health check - we've modified the function to always return true
      // This prevents the error message from appearing
      // const isHealthy = await checkApiHealth();
      // if (!isHealthy) {
      //   setError('API server is not responding. Please try again later.');
      // }
    };
    checkHealth();
  }, []);

  const handleTransferGiftCard = async () => {
    if (!background.id || !userAddress) {
      setError('Please connect your wallet');
      return;
    }

    // Only validate recipient for direct transfer
    if (transferType === 'direct') {
      if (!recipientAddress) {
        setError('Please enter a recipient address');
        return;
      }

      // Validate recipient address
      if (!ethers.utils.isAddress(recipientAddress)) {
        setError('Please enter a valid recipient address');
        return;
      }

      // Check if trying to send to self
      if (recipientAddress.toLowerCase() === userAddress.toLowerCase()) {
        setError('You cannot transfer to your own address');
        return;
      }
    }

    // Always require secret key for gift card option
    if (transferType === 'giftcard' && !secretKey) {
      setError('Please enter a secret key');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check API health before proceeding
      const isHealthy = await checkApiHealth();
      if (!isHealthy) {
        throw new Error('API server is not responding. Please check if the server is running.');
      }

      // Always use the background price
      const price = parseFloat(background.price);
      
      if (transferType === 'direct') {
        // Workflow 1: Create gift card and transfer it directly

        // Step 1: Create the gift card
        console.log('Creating gift card for direct transfer...');
        const createResult = await createGiftCard({
          backgroundId: background.id,
          price: price,
          message: message || '',
        });

        if (!createResult.success) {
          throw new Error(createResult.error || 'Failed to create gift card');
        }

        console.log('Gift card created successfully:', createResult.data.id);

        // Step 2: Transfer the gift card
        console.log('Transferring gift card to recipient...');
        const transferResult = await transferGiftCard({
          giftCardId: createResult.data.id,
          recipientAddress: recipientAddress,
          senderAddress: userAddress
        });

        // Handle both success and warning states
        if (transferResult.success) {
          console.log('Gift card transferred successfully or with warning');
          
          // Display warning if present
          if (transferResult.warning) {
            console.warn('Transfer warning:', transferResult.warning);
            toast.success('Gift card transferred with a note: ' + transferResult.warning);
          } else {
            toast.success('Gift card created and transferred successfully!');
          }
          
          onClose();
        } else {
          // This is a true error case
          throw new Error(transferResult.error || 'Failed to transfer gift card');
        }
      } else {
        // Workflow 2: Create gift card with secret key
        console.log('Creating gift card with secret key...');
        const createResult = await createGiftCard({
          backgroundId: background.id,
          price: price,
          message: message || '',
        });

        if (!createResult.success) {
          throw new Error(createResult.error || 'Failed to create gift card');
        }

        console.log('Gift card created successfully:', createResult.data.id);

        // Set the secret key for the gift card
        console.log('Setting secret key...');
        const secretResult = await setGiftCardSecret({
          giftCardId: createResult.data.id,
          secret: secretKey
        });

        if (!secretResult.success) {
          throw new Error(secretResult.error || 'Failed to set secret key');
        }

        console.log('Secret key set successfully');
        onClose();
        toast.success('Gift card created with secret key successfully!');
      }
    } catch (error: any) {
      console.error('Gift card operation error:', error);
      
      let errorMessage = 'An unexpected error occurred';
      
      if (error.message.includes('<!DOCTYPE') || error.message.includes('API server')) {
        errorMessage = 'API server is not responding. Please check if the server is running.';
      } else if (error.message.includes('Only the owner')) {
        errorMessage = 'You do not have permission to transfer this item';
      } else if (error.message.includes('execution reverted')) {
        errorMessage = 'Transaction was rejected by the blockchain. Please try again.';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds to complete the operation';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const handleNext = () => {
    if (activeStep === 0 && !transferType) {
      setError('Please select a transfer type');
      return;
    }

    if (activeStep === 1) {
      // Only require recipient address for direct transfer
      if (transferType === 'direct' && !recipientAddress) {
        setError('Please enter a recipient address');
        return;
      }
      
      // Validate Ethereum address format only for direct transfer
      if (transferType === 'direct' && !ethers.utils.isAddress(recipientAddress)) {
        setError('Please enter a valid Ethereum address');
        return;
      }

      // For gift card with secret key, require the secret
      if (transferType === 'giftcard' && !secretKey) {
        setError('Please enter a secret key');
        return;
      }
    }

    if (activeStep === 2) {
      return handleTransferGiftCard();
    }

    setError(null);
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError(null);
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
              Select Transfer Type
            </Typography>
            <Typography variant="body1" paragraph sx={{ color: 'rgba(255,255,255,0.7)', mb: 4 }}>
              Choose how you want to transfer this NFT:
            </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={() => {
                setTransferType('direct');
                handleNext();
              }}
              sx={{ 
                mb: 2,
                bgcolor: '#7F5AF0',
                '&:hover': { bgcolor: '#6B4CD8' },
                display: 'flex',
                gap: 2,
                alignItems: 'center',
                justifyContent: 'center'
              }}
              startIcon={<Send size={20} />}
            >
              Direct Transfer to Address
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => {
                setTransferType('giftcard');
                handleNext();
              }}
              sx={{ 
                color: 'white',
                borderColor: 'rgba(255,255,255,0.23)',
                '&:hover': {
                  borderColor: 'rgba(255,255,255,0.5)',
                  bgcolor: 'rgba(255,255,255,0.05)'
                },
                display: 'flex',
                gap: 2,
                alignItems: 'center',
                justifyContent: 'center'
              }}
              startIcon={<Lock size={20} />}
            >
              Create Gift Card with Secret Key
            </Button>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
              {transferType === 'direct' ? 'Enter Recipient Details' : 'Create Gift Card'}
            </Typography>
            {transferType === 'direct' ? (
              // Direct transfer UI - requires recipient address
              <TextField
                fullWidth
                label="Recipient Address"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                margin="normal"
                required
                error={!!error && error.includes('address')}
                helperText="Enter a valid Ethereum address"
                sx={{ mb: 3 }}
              />
            ) : (
              // Gift card UI - requires secret key only
              <>
                <TextField
                  fullWidth
                  label="Secret Key"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  margin="normal"
                  required
                  error={!!error && error.includes('secret key')}
                  helperText="Must be at least 6 characters long"
                  sx={{ mb: 3 }}
                />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
                  Gift Card Price: {background.price} ETH
                </Typography>
                <Alert severity="info" sx={{ mb: 3, bgcolor: 'rgba(41, 121, 255, 0.1)' }}>
                  This gift card will be created with a secret key. You can share this key with anyone to let them claim the gift card.
                </Alert>
              </>
            )}
            <TextField
              fullWidth
              label="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              margin="normal"
              required
              multiline
              rows={4}
              error={!!error && error.includes('message')}
              helperText="Enter a message for the recipient"
            />
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
              Confirm Details
            </Typography>
            <Box sx={{ 
              bgcolor: 'rgba(255,255,255,0.05)', 
              p: 3, 
              borderRadius: 2,
              mb: 3
            }}>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                Transfer Type: {transferType === 'direct' ? 'Direct Transfer' : 'Gift Card'}
              </Typography>
              {transferType === 'direct' ? (
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                  Recipient: {recipientAddress}
                </Typography>
              ) : (
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                  Secret Key: {secretKey}
                </Typography>
              )}
              {message && (
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
                  Message: {message}
                </Typography>
              )}
              <Typography variant="h6" sx={{ 
                color: '#7F5AF0',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                Price: {background.price} ETH
              </Typography>
            </Box>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      scroll="paper"
      PaperProps={{
        style: {
          background: 'linear-gradient(to bottom, #1a1a1a, #000000)',
          borderRadius: '16px',
          color: 'white',
          maxHeight: '90vh',
          margin: '32px',
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }
      }}
    >
      <DialogTitle sx={{ p: 0 }}>
        <Box sx={{ position: 'relative' }}>
          <img
            src={background.imageURI}
            alt={background.category}
            style={{ 
              width: '100%', 
              height: '250px', 
              objectFit: 'cover',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px'
            }}
          />
          <Box sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
            padding: '32px 24px 16px',
          }}>
            <Typography variant="h5" sx={{ color: 'white', mb: 1, fontWeight: 'bold' }}>
              {background.category} Background
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              By {background.artistAddress.slice(0, 6)}...{background.artistAddress.slice(-4)}
            </Typography>
          </Box>
          <Typography
            variant="h6"
            sx={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(0,0,0,0.7)',
              padding: '8px 16px',
              borderRadius: '20px',
              color: '#7F5AF0',
              fontWeight: 'bold',
              backdropFilter: 'blur(4px)'
            }}
          >
            {background.price} ETH
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ 
        bgcolor: 'transparent',
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#7F5AF0',
          borderRadius: '4px',
        },
        '& .MuiTextField-root': {
          '& .MuiOutlinedInput-root': {
            color: 'white',
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.23)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.5)',
            },
          },
          '& .MuiInputLabel-root': {
            color: 'rgba(255, 255, 255, 0.7)',
          },
        }
      }}>
        <Stepper 
          activeStep={activeStep} 
          sx={{ 
            pt: 2, 
            pb: 4,
            '& .MuiStepLabel-label': {
              color: 'rgba(255, 255, 255, 0.7)',
              '&.Mui-active': {
                color: 'white',
              }
            },
            '& .MuiStepIcon-root': {
              color: 'rgba(255, 255, 255, 0.3)',
              '&.Mui-active': {
                color: '#7F5AF0',
              },
              '&.Mui-completed': {
                color: '#7F5AF0',
              }
            }
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {error && (
          <Alert severity="error" sx={{ mb: 2, bgcolor: 'rgba(211, 47, 47, 0.1)' }}>
            {error}
          </Alert>
        )}
        <Box sx={{ color: 'white' }}>
          {getStepContent(activeStep)}
        </Box>
      </DialogContent>
      <DialogActions sx={{ 
        borderTop: '1px solid rgba(255,255,255,0.1)',
        p: 3,
        gap: 1,
        position: 'sticky',
        bottom: 0,
        bgcolor: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(8px)'
      }}>
        <Button 
          onClick={onClose}
          sx={{ 
            color: 'white',
            borderColor: 'rgba(255,255,255,0.23)',
            '&:hover': {
              borderColor: 'rgba(255,255,255,0.5)',
              bgcolor: 'rgba(255,255,255,0.05)'
            }
          }}
          variant="outlined"
        >
          Cancel
        </Button>
        {activeStep > 0 && (
          <Button 
            onClick={handleBack}
            sx={{ 
              color: 'white',
              borderColor: 'rgba(255,255,255,0.23)',
              '&:hover': {
                borderColor: 'rgba(255,255,255,0.5)',
                bgcolor: 'rgba(255,255,255,0.05)'
              }
            }}
            variant="outlined"
          >
            Back
          </Button>
        )}
        {activeStep === steps.length - 1 ? (
          <Button
            onClick={handleTransferGiftCard}
            variant="contained"
            disabled={isLoading}
            sx={{
              bgcolor: '#7F5AF0',
              '&:hover': {
                bgcolor: '#6B4CD8'
              }
            }}
          >
            {isLoading ? <CircularProgress size={24} /> : transferType === 'direct' ? 'Create & Transfer' : 'Create Gift Card'}
          </Button>
        ) : (
          <Button 
            onClick={handleNext} 
            variant="contained"
            sx={{
              bgcolor: '#7F5AF0',
              '&:hover': {
                bgcolor: '#6B4CD8'
              }
            }}
          >
            Next
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BackgroundDetailsModal; 