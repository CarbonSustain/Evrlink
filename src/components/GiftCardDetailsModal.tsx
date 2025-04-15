import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  TextField,
  Chip,
  Divider,
} from '@mui/material';
import { getGiftCardDetails } from '../utils/api';
import { formatAddress, formatDate, formatPrice } from '../utils/format';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { ContentCopy, Check } from '@mui/icons-material';

interface GiftCardDetailsModalProps {
  open: boolean;
  onClose: () => void;
  giftCardId: string | null;
  mode?: 'view' | 'transfer' | 'secret';
}

const GiftCardDetailsModal: React.FC<GiftCardDetailsModalProps> = ({
  open,
  onClose,
  giftCardId,
  mode = 'view'
}) => {
  const [giftCard, setGiftCard] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [recipientAddress, setRecipientAddress] = useState<string>('');

  useEffect(() => {
    if (open && giftCardId) {
      loadGiftCardDetails();
    } else {
      // Reset state when modal closes
      setGiftCard(null);
      setLoading(false);
      setError(null);
    }
  }, [open, giftCardId]);

  const loadGiftCardDetails = async () => {
    if (!giftCardId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getGiftCardDetails(giftCardId);
      if (response.success) {
        setGiftCard(response.data);
      } else {
        setError(response.error || 'Failed to load gift card details');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error loading gift card:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTransfer = () => {
    // Implement transfer functionality
    console.log('Transferring gift card', giftCardId, 'to', recipientAddress);
    // Call the transfer API here
    onClose();
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'transfer':
        return 'Transfer Gift Card';
      case 'secret':
        return 'Secret Key';
      default:
        return 'Gift Card Details';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{ 
        sx: { 
          borderRadius: 2,
          overflow: 'hidden'
        } 
      }}
    >
      {loading ? (
        <DialogContent sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </DialogContent>
      ) : error ? (
        <DialogContent>
          <Alert severity="error">{error}</Alert>
        </DialogContent>
      ) : giftCard ? (
        <>
          <Box sx={{ position: 'relative' }}>
            <img 
              src={giftCard.imageURI}
              alt="Gift Card"
              style={{ 
                width: '100%',
                height: 180,
                objectFit: 'cover'
              }}
            />
            <Box 
              sx={{ 
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                p: 2,
                background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                color: 'white'
              }}
            >
              <Typography variant="h6">
                Gift Card
              </Typography>
              <Typography variant="body2">
                ID: {formatAddress(giftCard.id)}
              </Typography>
            </Box>
            {giftCard.hasSecretKey && (
              <Chip 
                label="Secret Key" 
                color="primary" 
                size="small" 
                sx={{ 
                  position: 'absolute',
                  top: 12,
                  right: 12
                }} 
              />
            )}
          </Box>
          
          <DialogContent>
            <Box sx={{ mt: 1, mb: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                <strong>Owner:</strong> {formatAddress(giftCard.owner)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                <strong>Price:</strong> {formatPrice(giftCard.price)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                <strong>Status:</strong> {giftCard.status?.charAt(0).toUpperCase() + giftCard.status?.slice(1) || 'Unknown'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Created:</strong> {formatDate(giftCard.createdAt)}
              </Typography>
            </Box>
            
            {giftCard.message && (
              <Box 
                sx={{ 
                  p: 2, 
                  bgcolor: 'rgba(0,0,0,0.04)', 
                  borderRadius: 1,
                  mb: 3
                }}
              >
                <Typography variant="body1" fontStyle="italic">
                  "{giftCard.message}"
                </Typography>
              </Box>
            )}
            
            {mode === 'secret' && giftCard.secretKey && (
              <>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Secret Key
                </Typography>
                <Box 
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 2
                  }}
                >
                  <TextField
                    fullWidth
                    value={giftCard.secretKey || ''}
                    variant="outlined"
                    size="small"
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                  <CopyToClipboard text={giftCard.secretKey || ''} onCopy={handleCopy}>
                    <Button 
                      variant="contained" 
                      color={copied ? "success" : "primary"}
                      startIcon={copied ? <Check /> : <ContentCopy />}
                    >
                      {copied ? "Copied" : "Copy"}
                    </Button>
                  </CopyToClipboard>
                </Box>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Keep this secret key secure. Anyone with this key can claim this gift card.
                </Alert>
              </>
            )}
            
            {mode === 'transfer' && (
              <>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Transfer to Address
                </Typography>
                <TextField
                  fullWidth
                  label="Recipient Address"
                  placeholder="0x..."
                  variant="outlined"
                  margin="normal"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  helperText="Enter the Ethereum address of the recipient"
                />
              </>
            )}
          </DialogContent>
          
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button onClick={onClose} color="inherit">
              Close
            </Button>
            {mode === 'view' && giftCard.hasSecretKey && (
              <Button 
                color="primary"
                variant="outlined"
                onClick={() => {
                  // You would implement logic to show the secret key
                  console.log('Show secret key for gift card', giftCardId);
                }}
              >
                View Secret Key
              </Button>
            )}
            {mode === 'view' && (
              <Button 
                color="primary"
                variant="contained"
                onClick={() => {
                  // You would implement logic to transfer the gift card
                  console.log('Transfer gift card', giftCardId);
                }}
              >
                Transfer
              </Button>
            )}
            {mode === 'transfer' && (
              <Button 
                color="primary"
                variant="contained"
                onClick={handleTransfer}
                disabled={!recipientAddress}
              >
                Transfer
              </Button>
            )}
          </DialogActions>
        </>
      ) : (
        <DialogContent>
          <Alert severity="info">No gift card selected</Alert>
        </DialogContent>
      )}
    </Dialog>
  );
};

export default GiftCardDetailsModal; 