import React from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Avatar,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardMedia,
  Tabs,
  Tab
} from '@mui/material';
import { useUserData } from '../hooks/useUserData';

interface ProfileProps {
  address: string;
}

export const Profile: React.FC<ProfileProps> = ({ address }) => {
  const [activeTab, setActiveTab] = React.useState(0);
  const { profile, inventory, activities, isLoading, error } = useUserData(address);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container>
        <Alert severity="info" sx={{ mt: 2 }}>
          No profile data found
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      {/* Profile Header */}
      <Paper sx={{ p: 3, mt: 3, mb: 3 }}>
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'auto 1fr auto' },
          gap: 3,
          alignItems: 'center'
        }}>
          <Avatar
            src={profile.profileImageUrl}
            alt={profile.username}
            sx={{ width: 100, height: 100 }}
          />
          <Box>
            <Typography variant="h4">{profile.username}</Typography>
            <Typography color="textSecondary">{profile.walletAddress}</Typography>
            {profile.bio && (
              <Typography sx={{ mt: 1 }}>{profile.bio}</Typography>
            )}
          </Box>
          <Box sx={{ 
            p: 2, 
            bgcolor: 'background.paper', 
            borderRadius: 1,
            gridColumn: { xs: '1 / -1', md: 'auto' },
            minWidth: { md: '300px' }
          }}>
            <Typography variant="h6" gutterBottom>Stats</Typography>
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 2
            }}>
              <Box>
                <Typography color="textSecondary">Gift Cards Created</Typography>
                <Typography variant="h6">{profile.stats.totalGiftCardsCreated}</Typography>
              </Box>
              <Box>
                <Typography color="textSecondary">Gift Cards Sent</Typography>
                <Typography variant="h6">{profile.stats.totalGiftCardsSent}</Typography>
              </Box>
              <Box>
                <Typography color="textSecondary">Gift Cards Received</Typography>
                <Typography variant="h6">{profile.stats.totalGiftCardsReceived}</Typography>
              </Box>
              <Box>
                <Typography color="textSecondary">Backgrounds Minted</Typography>
                <Typography variant="h6">{profile.stats.totalBackgroundsMinted}</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="NFTs" />
        <Tab label="Gift Cards" />
        <Tab label="Backgrounds" />
        <Tab label="Activity" />
      </Tabs>

      {/* NFTs Tab */}
      {activeTab === 0 && inventory && (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)'
          },
          gap: 3
        }}>
          {inventory.nfts.map((nft) => (
            <Card key={nft.tokenId}>
              <CardMedia
                component="img"
                height="200"
                image={nft.image}
                alt={nft.name}
              />
              <CardContent>
                <Typography variant="h6">{nft.name}</Typography>
                <Typography color="textSecondary">{nft.description}</Typography>
              </CardContent>
            </Card>
          ))}
          {inventory.nfts.length === 0 && (
            <Alert severity="info" sx={{ gridColumn: '1 / -1' }}>No NFTs found</Alert>
          )}
        </Box>
      )}

      {/* Gift Cards Tab */}
      {activeTab === 1 && inventory && (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)'
          },
          gap: 3
        }}>
          {inventory.giftCards.map((card) => (
            <Card key={card.id} sx={{ display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="200"
                image={card.image}
                alt={card.name}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>{card.name}</Typography>
                
                {/* Card Details */}
                <Box sx={{ mb: 2 }}>
                  <Typography color="textSecondary" gutterBottom>{card.description}</Typography>
                  <Typography variant="body2" color="primary" gutterBottom>
                    Value: {card.value} ETH
                  </Typography>
                  <Typography variant="body2" 
                    color={card.status === 'redeemed' ? 'error' : 'success'}
                    gutterBottom
                  >
                    Status: {card.status}
                  </Typography>
                </Box>

                {/* Blockchain Info */}
                <Box sx={{ 
                  bgcolor: 'background.paper', 
                  p: 1.5, 
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider'
                }}>
                  <Typography variant="subtitle2" gutterBottom color="primary">
                    Blockchain Details
                  </Typography>
                  
                  {card.blockchainId && (
                    <Typography variant="body2" sx={{ wordBreak: 'break-all' }} gutterBottom>
                      ID: {card.blockchainId}
                    </Typography>
                  )}

                  {card.secretKey && card.status !== 'redeemed' && (
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        wordBreak: 'break-all',
                        bgcolor: 'warning.light',
                        color: 'warning.contrastText',
                        p: 1,
                        borderRadius: 0.5,
                        mt: 1
                      }}
                    >
                      Secret Key: {card.secretKey}
                    </Typography>
                  )}

                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" display="block" color="text.secondary">
                      From: {card.senderAddress?.slice(0, 6)}...{card.senderAddress?.slice(-4)}
                    </Typography>
                    {card.recipientAddress && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        To: {card.recipientAddress?.slice(0, 6)}...{card.recipientAddress?.slice(-4)}
                      </Typography>
                    )}
                    <Typography variant="caption" display="block" color="text.secondary">
                      Created: {new Date(card.createdAt).toLocaleDateString()}
                    </Typography>
                    {card.expiresAt && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        Expires: {new Date(card.expiresAt).toLocaleDateString()}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
          {inventory.giftCards.length === 0 && (
            <Alert severity="info" sx={{ gridColumn: '1 / -1' }}>No gift cards found</Alert>
          )}
        </Box>
      )}

      {/* Backgrounds Tab */}
      {activeTab === 2 && inventory && (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)'
          },
          gap: 3
        }}>
          {inventory.backgrounds.map((bg) => (
            <Card key={bg.id}>
              <CardMedia
                component="img"
                height="200"
                image={bg.image}
                alt={bg.name}
              />
              <CardContent>
                <Typography variant="h6">{bg.name}</Typography>
              </CardContent>
            </Card>
          ))}
          {inventory.backgrounds.length === 0 && (
            <Alert severity="info" sx={{ gridColumn: '1 / -1' }}>No backgrounds found</Alert>
          )}
        </Box>
      )}

      {/* Activity Tab */}
      {activeTab === 3 && activities && (
        <Paper sx={{ p: 2 }}>
          {activities.map((activity) => (
            <Box
              key={activity.id}
              sx={{
                p: 2,
                mb: 2,
                borderRadius: 1,
                bgcolor: 'background.paper',
                borderLeft: 4,
                borderColor: 
                  activity.type === 'mint' ? 'success.main' :
                  activity.type === 'transfer' ? 'primary.main' : 'secondary.main'
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
              </Typography>
              <Typography color="textSecondary">
                {new Date(activity.timestamp).toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {JSON.stringify(activity.details)}
              </Typography>
            </Box>
          ))}
          {activities.length === 0 && (
            <Alert severity="info">No activity found</Alert>
          )}
        </Paper>
      )}
    </Container>
  );
}; 