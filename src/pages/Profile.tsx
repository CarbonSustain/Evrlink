import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Share2 } from 'lucide-react';
import MyGiftCards from './MyGiftCards';
import OwnedNFTs from '@/components/OwnedNFTs';
import { useWallet } from '@/contexts/WalletContext';
import { getUserProfile, getDetailedProfile, getUserBackgrounds } from '@/utils/api';
import { CircularProgress, Alert, Card, CardContent, Typography } from '@mui/material';

interface UserProfile {
  id: string;
  walletAddress: string;
  username?: string;
  email?: string;
  bio?: string;
  profileImageUrl?: string;
  totalGiftCardsCreated?: number;
  totalGiftCardsSent?: number;
  totalGiftCardsReceived?: number;
  totalBackgroundsMinted?: number;
  stats?: {
    // Add any other necessary properties here
  };
}

interface GiftCard {
  id: string;
  tokenId: string;
  price: number;
  status: 'available' | 'sold' | 'redeemed';
  backgroundUrl: string;
  message?: string;
  Background?: {
    id: string;
    imageURI: string;
    category: string;
  };
}

interface Background {
  id: string;
  category: string;
  imageUrl: string;
  price: number;
  artist: string;
}

const Profile = () => {
  const { address, isConnected } = useWallet();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [receivedCards, setReceivedCards] = useState<GiftCard[]>([]);
  const [sentCards, setSentCards] = useState<GiftCard[]>([]);
  const [backgrounds, setBackgrounds] = useState<Background[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!address || !isConnected) {
        console.log('No address or not connected, skipping profile fetch');
        setLoading(false);
        return;
      }

      console.log('Starting profile data fetch for address:', address);
      try {
        setLoading(true);
        setError(null);

        // Log API base URL and endpoints being called
        console.log('API calls starting with following endpoints:');
        console.log(`- getUserProfile: ${process.env.VITE_API_URL}/api/user/${address}`);
        console.log(`- getDetailedProfile: ${process.env.VITE_API_URL}/api/profile/${address}`);
        console.log(`- getUserBackgrounds: ${process.env.VITE_API_URL}/backgrounds?creator=${address}`);

        // Fetch user profile and detailed profile data in parallel
        const [profileData, detailedProfile, backgroundsData] = await Promise.all([
          getUserProfile(address).catch(err => {
            console.error('getUserProfile error:', err);
            throw new Error(`Failed to fetch basic profile: ${err.message}`);
          }),
          getDetailedProfile(address).catch(err => {
            console.error('getDetailedProfile error:', err);
            throw new Error(`Failed to fetch detailed profile: ${err.message}`);
          }),
          getUserBackgrounds(address).catch(err => {
            console.error('getUserBackgrounds error:', err);
            throw new Error(`Failed to fetch backgrounds: ${err.message}`);
          })
        ]);

        console.log('Profile Data Response:', profileData);
        console.log('Detailed Profile Response:', detailedProfile);
        console.log('Backgrounds Data Response:', backgroundsData);

        if (!profileData.data) {
          throw new Error('Profile data is missing or invalid');
        }

        if (!detailedProfile.profile) {
          throw new Error('Detailed profile data is missing or invalid');
        }

        setUserProfile(profileData.data);
        setReceivedCards(detailedProfile.profile.receivedCards || []);
        setSentCards(detailedProfile.profile.sentCards || []);
        setBackgrounds(backgroundsData.data || []);

      } catch (err) {
        console.error('Error in profile data fetch:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [address, isConnected]);

  const renderGiftCardGrid = (cards: GiftCard[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {cards.map((card) => (
        <Card key={card.id} className="bg-[#1a1a1a] text-white">
          <img 
            src={card.Background?.imageURI || card.backgroundUrl} 
            alt="Gift Card" 
            className="w-full h-48 object-cover"
          />
          <CardContent>
            <Typography variant="h6" component="div">
              Gift Card #{card.tokenId}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Price: {card.price} ETH
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Status: {card.status}
            </Typography>
            {card.message && (
              <Typography variant="body2" color="text.secondary" className="mt-2">
                Message: {card.message}
              </Typography>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (!isConnected || !address) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Alert severity="info">Please connect your wallet to view your profile</Alert>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Navbar />
        <main className="container mx-auto px-4 py-8 flex justify-center items-center">
          <CircularProgress />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />
      <main>
        {/* Profile Header */}
        <div className="w-full h-48 bg-gradient-to-br from-amber-500/20 to-purple-600/20" />
        
        <div className="container mx-auto px-4 -mt-20">
          {/* Profile Info */}
          <div className="bg-[#1a1a1a] rounded-xl p-6 mb-8 relative">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {userProfile?.username || `${address.slice(0, 6)}...${address.slice(-4)}`}
                </h2>
                {userProfile?.bio && (
                  <p className="text-gray-400 mb-4">{userProfile.bio}</p>
                )}
                <div className="flex gap-4 text-sm text-gray-400">
                  <span>Created: {userProfile?.totalGiftCardsCreated || 0} cards</span>
                  <span>Sent: {userProfile?.totalGiftCardsSent || 0}</span>
                  <span>Received: {userProfile?.totalGiftCardsReceived || 0}</span>
                  <span>Backgrounds: {userProfile?.totalBackgroundsMinted || 0}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                  <Share2 className="w-5 h-5 text-gray-400" />
                </button>
                <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                  <Settings className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          {error && (
            <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>
          )}

          <Tabs defaultValue="inventory" className="w-full">
            <TabsList className="border-b border-white/10 bg-transparent w-full justify-start h-auto p-0 mb-8">
              <TabsTrigger 
                value="inventory" 
                className="px-6 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent"
              >
                Inventory
              </TabsTrigger>
              <TabsTrigger 
                value="received" 
                className="px-6 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent"
              >
                Received Cards
              </TabsTrigger>
              <TabsTrigger 
                value="sent" 
                className="px-6 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent"
              >
                Sent Cards
              </TabsTrigger>
              <TabsTrigger 
                value="backgrounds" 
                className="px-6 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent"
              >
                Backgrounds
              </TabsTrigger>
            </TabsList>

            <TabsContent value="inventory">
              <div className="mb-8">
                <h3 className="text-xl font-medium text-white mb-4">Your NFTs</h3>
                <OwnedNFTs />
              </div>
            </TabsContent>

            <TabsContent value="received">
              <div className="mb-8">
                <h3 className="text-xl font-medium text-white mb-4">Received Gift Cards</h3>
                {receivedCards.length > 0 ? (
                  renderGiftCardGrid(receivedCards)
                ) : (
                  <p className="text-gray-400">No received gift cards yet.</p>
                )}
                </div>
            </TabsContent>

            <TabsContent value="sent">
              <div className="mb-8">
                <h3 className="text-xl font-medium text-white mb-4">Sent Gift Cards</h3>
                {sentCards.length > 0 ? (
                  renderGiftCardGrid(sentCards)
                ) : (
                  <p className="text-gray-400">No sent gift cards yet.</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="backgrounds">
              <div className="mb-8">
                <h3 className="text-xl font-medium text-white mb-4">Available Backgrounds</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {backgrounds.map((bg) => (
                    <Card key={bg.id} className="bg-[#1a1a1a] text-white">
                      <img 
                        src={bg.imageUrl} 
                        alt={`${bg.category} Background`} 
                        className="w-full h-48 object-cover"
                      />
                      <CardContent>
                        <Typography variant="h6" component="div">
                          {bg.category}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Artist: {bg.artist}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Price: {bg.price} ETH
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
