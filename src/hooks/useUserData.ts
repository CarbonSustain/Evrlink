import { useState, useEffect } from 'react';
import { getUserProfile, getUserInventory, getUserActivity } from '../utils/api';

interface UserStats {
  totalGiftCardsCreated: number;
  totalGiftCardsSent: number;
  totalGiftCardsReceived: number;
  totalBackgroundsMinted: number;
}

interface UserProfile {
  id: string;
  walletAddress: string;
  username: string;
  bio?: string;
  profileImageUrl?: string;
  stats: UserStats;
}

interface NFT {
  tokenId: string;
  name: string;
  description: string;
  image: string;
}

interface GiftCard {
  id: string;
  tokenId: string;
  name: string;
  description: string;
  image: string;
  value: number;
  status: 'available' | 'redeemed';
}

interface Background {
  id: string;
  tokenId: string;
  name: string;
  image: string;
}

interface UserInventory {
  nfts: NFT[];
  giftCards: GiftCard[];
  backgrounds: Background[];
}

interface Activity {
  id: string;
  type: 'mint' | 'transfer' | 'redeem';
  timestamp: string;
  details: Record<string, any>;
}

interface UserData {
  profile: UserProfile | null;
  inventory: UserInventory | null;
  activities: Activity[];
  isLoading: boolean;
  error: string | null;
}

export const useUserData = (address: string | undefined) => {
  const [userData, setUserData] = useState<UserData>({
    profile: null,
    inventory: null,
    activities: [],
    isLoading: false,
    error: null
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!address) {
        setUserData(prev => ({ ...prev, error: 'No wallet address provided' }));
        return;
      }

      setUserData(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const [profileRes, inventoryRes, activityRes] = await Promise.all([
          getUserProfile(address),
          getUserInventory(address),
          getUserActivity(address)
        ]);

        // Check for any errors
        if (!profileRes.success || !inventoryRes.success || !activityRes.success) {
          throw new Error(profileRes.error || inventoryRes.error || activityRes.error);
        }

        setUserData({
          profile: profileRes.data,
          inventory: inventoryRes.data,
          activities: activityRes.data.activities,
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserData(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch user data'
        }));
      }
    };

    fetchUserData();
  }, [address]);

  return userData;
}; 