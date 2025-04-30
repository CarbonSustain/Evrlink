import { Box, Typography, Button } from '@mui/material';
import { useWallet } from '../contexts/WalletContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Gift as GiftIcon, Send, Download, User } from 'lucide-react';
import GiftCardDetailsDialog from '@/components/GiftCardDetailsDialog';
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const ProfilePage = () => {
  const { address, isConnected, connect } = useWallet();
  const [selectedGift, setSelectedGift] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [sentGifts, setSentGifts] = useState([]);
  const [receivedGifts, setReceivedGifts] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    if (isConnected && address) {
      // TODO: Replace with actual API calls
      const mockProfile = {
        username: address.slice(0, 6) + '...' + address.slice(-4),
        stats: {
          totalGiftCardsCreated: 5,
          totalGiftCardsSent: 3,
          totalGiftCardsReceived: 2,
          totalBackgroundsMinted: 1
        }
      };

      const mockData = {
        sent: [
          {
            id: '1',
            imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=500&auto=format&fit=crop',
            recipientName: 'Alice Smith',
            message: 'Happy Birthday!',
            amount: '50 USDC',
            date: '2024-03-28',
            status: 'Sent'
          },
          {
            id: '2',
            imageUrl: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=500&auto=format&fit=crop',
            recipientName: 'Bob Johnson',
            message: 'Congratulations!',
            amount: '100 USDC',
            date: '2024-03-27',
            status: 'Sent'
          }
        ],
        received: [
          {
            id: '3',
            imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=500&auto=format&fit=crop',
            senderName: 'Alice Smith',
            message: 'Thank you for your help!',
            amount: '50 USDC',
            date: '2024-03-28',
            status: 'Received'
          },
          {
            id: '4',
            imageUrl: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=500&auto=format&fit=crop',
            senderName: 'Bob Johnson',
            message: 'For being awesome!',
            amount: '100 USDC',
            date: '2024-03-27',
            status: 'Received'
          }
        ]
      };

      setUserProfile(mockProfile);
      setSentGifts(mockData.sent);
      setReceivedGifts(mockData.received);
    }
  }, [isConnected, address]);

  const handleConnect = async () => {
    try {
      await connect('mock_signature');
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleGiftClick = (gift) => {
    setSelectedGift(gift);
    setDetailsOpen(true);
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

  const GiftCardItem = ({ gift }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative"
    >
      <Card 
        onClick={() => handleGiftClick(gift)}
        className="cursor-pointer bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-200 overflow-hidden"
      >
        <CardContent className="p-0">
          <div className="aspect-video relative">
            {gift.imageUrl ? (
              <>
                <img 
                  src={gift.imageUrl} 
                  alt={`Gift Card`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <GiftIcon className="w-12 h-12 text-white/50" />
              </div>
            )}
            
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/90">
                    {gift.status === 'Sent' ? `To: ${gift.recipientName}` : `From: ${gift.senderName}`}
                  </p>
                  <p className="text-xs text-white/60">{gift.date}</p>
                </div>
                <p className="text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                  {gift.amount}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Profile Header */}
      <div className="w-full h-48 bg-gradient-to-br from-amber-500/20 to-purple-600/20 rounded-xl relative overflow-hidden mb-8">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative h-full flex items-center px-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center">
              <User className="w-12 h-12 text-white/70" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {userProfile?.username || address}
              </h2>
              <div className="flex gap-4 text-sm text-white/70">
                <span>{userProfile?.stats.totalGiftCardsCreated || 0} Created</span>
                <span>{userProfile?.stats.totalGiftCardsSent || 0} Sent</span>
                <span>{userProfile?.stats.totalGiftCardsReceived || 0} Received</span>
                <span>{userProfile?.stats.totalBackgroundsMinted || 0} Backgrounds</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gift Cards Tabs */}
      <Tabs defaultValue="received" className="w-full">
        <TabsList className="w-full bg-white/5 border-b border-white/10 p-0 h-auto">
          <div className="max-w-7xl mx-auto w-full flex">
            <TabsTrigger 
              value="received" 
              className="flex-1 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-white/5"
            >
              <Download className="w-4 h-4 mr-2" />
              Received ({receivedGifts.length})
            </TabsTrigger>
            <TabsTrigger 
              value="sent" 
              className="flex-1 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-white/5"
            >
              <Send className="w-4 h-4 mr-2" />
              Sent ({sentGifts.length})
            </TabsTrigger>
          </div>
        </TabsList>

        <div className="py-8">
          <TabsContent value="received" className="m-0">
            <AnimatePresence>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {receivedGifts.map((gift) => (
                  <GiftCardItem key={gift.id} gift={gift} />
                ))}
              </div>
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="sent" className="m-0">
            <AnimatePresence>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sentGifts.map((gift) => (
                  <GiftCardItem key={gift.id} gift={gift} />
                ))}
              </div>
            </AnimatePresence>
          </TabsContent>
        </div>
      </Tabs>

      {selectedGift && (
        <GiftCardDetailsDialog
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          gift={selectedGift}
        />
      )}
    </div>
  );
};

export default ProfilePage; 