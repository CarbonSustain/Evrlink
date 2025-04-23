import React, { useState, useEffect } from 'react';
import { Box, Typography, Tabs, Tab, Card, CardContent, CardMedia, Button, Divider, CircularProgress, Alert, Chip } from '@mui/material';
import { useWallet } from '../contexts/WalletContext';
import { getUserGiftCards, getUserBackgrounds, getUserTransactions, getUserProfile } from '../utils/api';
import { formatAddress, formatDate, formatPrice } from '../utils/format';
import GiftCardDetailsModal from './GiftCardDetailsModal';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const UserProfile: React.FC = () => {
  const { address, isConnected } = useWallet();
  const [tabValue, setTabValue] = useState(0);
  const [profile, setProfile] = useState<any>(null);
  const [giftCards, setGiftCards] = useState<any[]>([]);
  const [backgrounds, setBackgrounds] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState({
    profile: false,
    giftCards: false,
    backgrounds: false,
    transactions: false
  });
  const [error, setError] = useState<{
    profile: string | null,
    giftCards: string | null,
    backgrounds: string | null,
    transactions: string | null
  }>({
    profile: null,
    giftCards: null,
    backgrounds: null,
    transactions: null
  });
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGiftCardId, setSelectedGiftCardId] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'transfer' | 'secret'>('view');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    if (isConnected && address) {
      loadUserData();
    }
  }, [isConnected, address]);

  const loadUserData = async () => {
    if (!address) return;
    
    // Clear previous errors
    setError({
      profile: null,
      giftCards: null,
      backgrounds: null,
      transactions: null
    });
    
    // Load profile data
    setLoading(prev => ({ ...prev, profile: true }));
    try {
      const profileResult = await getUserProfile(address);
      if (profileResult.success) {
        setProfile(profileResult.data);
      } else {
        // Check if error property exists in the response
        const profileErrorMessage = 'error' in profileResult && typeof profileResult.error === 'string' 
          ? profileResult.error 
          : 'Failed to load profile';
        setError(prev => ({ ...prev, profile: profileErrorMessage }));
        console.error('Profile error:', profileErrorMessage);
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError(prev => ({ ...prev, profile: 'Failed to connect to server. Please try again later.' }));
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
    
    // Load gift cards
    setLoading(prev => ({ ...prev, giftCards: true }));
    try {
      const giftCardsResult = await getUserGiftCards(address);
      if (giftCardsResult.success) {
        setGiftCards(giftCardsResult.data);
      } else {
        // Check if error property exists in the response
        const giftCardsErrorMessage = 'error' in giftCardsResult && typeof giftCardsResult.error === 'string' 
          ? giftCardsResult.error 
          : 'Failed to load gift cards';
        setError(prev => ({ ...prev, giftCards: giftCardsErrorMessage }));
        console.error('Gift cards error:', giftCardsErrorMessage);
      }
    } catch (err) {
      console.error('Gift cards fetch error:', err);
      setError(prev => ({ ...prev, giftCards: 'Failed to connect to server. Please try again later.' }));
    } finally {
      setLoading(prev => ({ ...prev, giftCards: false }));
    }
    
    // Load backgrounds
    setLoading(prev => ({ ...prev, backgrounds: true }));
    try {
      const backgroundsResult = await getUserBackgrounds(address);
      if (backgroundsResult.success) {
        setBackgrounds(backgroundsResult.data);
      } else {
        // Check if error property exists in the response
        const backgroundsErrorMessage = 'error' in backgroundsResult && typeof backgroundsResult.error === 'string' 
          ? backgroundsResult.error 
          : 'Failed to load backgrounds';
        setError(prev => ({ ...prev, backgrounds: backgroundsErrorMessage }));
        console.error('Backgrounds error:', backgroundsErrorMessage);
      }
    } catch (err) {
      console.error('Backgrounds fetch error:', err);
      setError(prev => ({ ...prev, backgrounds: 'Failed to connect to server. Please try again later.' }));
    } finally {
      setLoading(prev => ({ ...prev, backgrounds: false }));
    }
    
    // Load transactions
    setLoading(prev => ({ ...prev, transactions: true }));
    try {
      const transactionsResult = await getUserTransactions(address);
      if (transactionsResult.success) {
        setTransactions(transactionsResult.data);
      } else {
        // Check if error property exists in the response
        const transactionsErrorMessage = 'error' in transactionsResult && typeof transactionsResult.error === 'string' 
          ? transactionsResult.error 
          : 'Failed to load transactions';
        setError(prev => ({ ...prev, transactions: transactionsErrorMessage }));
        console.error('Transactions error:', transactionsErrorMessage);
      }
    } catch (err) {
      console.error('Transactions fetch error:', err);
      setError(prev => ({ ...prev, transactions: 'Failed to connect to server. Please try again later.' }));
    } finally {
      setLoading(prev => ({ ...prev, transactions: false }));
    }
  };
  
  const handleOpenModal = (id: string, mode: 'view' | 'transfer' | 'secret' = 'view') => {
    setSelectedGiftCardId(id);
    setModalMode(mode);
    setModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedGiftCardId(null);
  };

  if (!isConnected) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="info">
          Please connect your wallet to view your profile
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Profile Header */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, gap: 3 }}>
        <Box 
          sx={{ 
            width: 100, 
            height: 100, 
            borderRadius: '50%', 
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '2rem',
            fontWeight: 'bold'
          }}
        >
          {address ? address.slice(2, 4).toUpperCase() : ''}
        </Box>
        
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ mb: 1 }}>
            {profile?.username || (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {address}
          </Typography>
          
          {loading.profile ? (
            <CircularProgress size={24} />
          ) : error.profile ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Alert severity="error" sx={{ flex: 1 }}>{error.profile}</Alert>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={loadUserData}
                size="small"
              >
                Retry
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip 
                label={`${profile?.stats?.totalGiftCardsCreated || 0} Gift Cards Created`} 
                variant="outlined" 
                color="primary"
              />
              <Chip 
                label={`${profile?.stats?.totalGiftCardsSent || 0} Gift Cards Sent`} 
                variant="outlined" 
                color="success"
              />
              <Chip 
                label={`${profile?.stats?.totalGiftCardsReceived || 0} Gift Cards Received`} 
                variant="outlined" 
                color="info"
              />
              <Chip 
                label={`${profile?.stats?.totalBackgroundsMinted || 0} Backgrounds Created`} 
                variant="outlined" 
                color="secondary"
              />
            </Box>
          )}
        </Box>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      {/* Tabs Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
          <Tab label="Gift Cards" />
          <Tab label="Backgrounds" />
          <Tab label="Transactions" />
        </Tabs>
      </Box>
      
      {/* Gift Cards Tab */}
      <TabPanel value={tabValue} index={0}>
        {loading.giftCards ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error.giftCards ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Alert severity="error" sx={{ flex: 1 }}>{error.giftCards}</Alert>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={loadUserData}
              size="small"
            >
              Retry
            </Button>
          </Box>
        ) : giftCards.length === 0 ? (
          <Alert severity="info">You don't have any gift cards yet</Alert>
        ) : (
          <>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Your Gift Cards ({giftCards.length})
              </Typography>
              <Button variant="contained" color="primary" size="small">
                Create New Gift Card
              </Button>
            </Box>
            
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { 
                xs: '1fr', 
                sm: 'repeat(2, 1fr)', 
                md: 'repeat(3, 1fr)' 
              },
              gap: 3 
            }}>
              {giftCards.map(card => (
                <Card 
                  key={card.id}
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'visible',
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: 6
                    }
                  }}
                  onClick={() => handleOpenModal(card.id, 'view')}
                >
                  {card.hasSecretKey && (
                    <Chip 
                      label="Secret Key" 
                      color="primary" 
                      size="small" 
                      sx={{ 
                        position: 'absolute',
                        top: -10,
                        right: 10,
                        zIndex: 1
                      }} 
                    />
                  )}
                  <CardMedia
                    component="img"
                    height="180"
                    image={card.imageURI}
                    alt="Gift Card"
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                      Gift Card
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        <strong>ID:</strong> {formatAddress(card.id, 4)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        <strong>Price:</strong> {formatPrice(card.price)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        <strong>Created:</strong> {formatDate(card.createdAt, { dateStyle: 'medium' })}
                      </Typography>
                    </Box>
                    
                    {card.message && (
                      <Box 
                        sx={{ 
                          p: 1.5, 
                          bgcolor: 'rgba(0,0,0,0.04)', 
                          borderRadius: 1,
                          mb: 2,
                          maxHeight: '80px',
                          overflow: 'auto'
                        }}
                      >
                        <Typography variant="body2" fontStyle="italic">
                          "{card.message}"
                        </Typography>
                      </Box>
                    )}
                    
                    <Box sx={{ mt: 'auto', display: 'flex', gap: 1 }}>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        fullWidth
                        sx={{ mt: 1 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModal(card.id, 'transfer');
                        }}
                      >
                        Transfer
                      </Button>
                      {card.hasSecretKey && (
                        <Button 
                          variant="contained" 
                          size="small" 
                          color="secondary"
                          fullWidth
                          sx={{ mt: 1 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenModal(card.id, 'secret');
                          }}
                        >
                          View Secret
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </>
        )}
      </TabPanel>
      
      {/* Backgrounds Tab */}
      <TabPanel value={tabValue} index={1}>
        {loading.backgrounds ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error.backgrounds ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Alert severity="error" sx={{ flex: 1 }}>{error.backgrounds}</Alert>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={loadUserData}
              size="small"
            >
              Retry
            </Button>
          </Box>
        ) : backgrounds.length === 0 ? (
          <Alert severity="info">You haven't created any backgrounds yet</Alert>
        ) : (
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: '1fr', 
              sm: 'repeat(2, 1fr)', 
              md: 'repeat(3, 1fr)' 
            },
            gap: 3 
          }}>
            {backgrounds.map(bg => (
              <Card key={bg.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={bg.imageURI}
                  alt={bg.category}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {bg.category.charAt(0).toUpperCase() + bg.category.slice(1)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Price: {bg.price} ETH
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Used in {bg.usageCount} gift cards
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Created: {new Date(bg.createdAt).toLocaleDateString()}
                  </Typography>
                  <Button 
                    variant="contained" 
                    size="small" 
                    sx={{ mt: 2 }}
                  >
                    Create Gift Card
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </TabPanel>
      
      {/* Transactions Tab */}
      <TabPanel value={tabValue} index={2}>
        {loading.transactions ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error.transactions ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Alert severity="error" sx={{ flex: 1 }}>{error.transactions}</Alert>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={loadUserData}
              size="small"
            >
              Retry
            </Button>
          </Box>
        ) : transactions.length === 0 ? (
          <Alert severity="info">You don't have any transactions yet</Alert>
        ) : (
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr',
            gap: 3 
          }}>
            {transactions.map(tx => (
              <Card key={tx.id} sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
                <CardMedia
                  component="img"
                  sx={{ width: { xs: '100%', sm: 150 }, height: { xs: 140, sm: 150 } }}
                  image={tx.backgroundImage}
                  alt="Transaction"
                />
                <CardContent sx={{ flex: '1 0 auto', display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" component="div">
                    {tx.type === 'send' ? 'Sent Gift Card' : 'Received Gift Card'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {new Date(tx.timestamp).toLocaleString()}
                  </Typography>
                  <Box sx={{ mt: 'auto' }}>
                    <Typography variant="body1">
                      {tx.type === 'send' ? 'To:' : 'From:'} {tx.type === 'send' ? formatAddress(tx.to) : formatAddress(tx.from)}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1 }}>
                      Amount: {formatPrice(tx.amount)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </TabPanel>
      
      {/* Gift Card Details Modal */}
      <GiftCardDetailsModal
        open={modalOpen}
        onClose={handleCloseModal}
        giftCardId={selectedGiftCardId}
        mode={modalMode}
      />
    </Box>
  );
};

export default UserProfile; 