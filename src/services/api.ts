import axios from 'axios';
import { useWallet } from '@/contexts/WalletContext';
import { eventBus } from './eventBus';

// Get API URL from environment variable or fallback to localhost for development
// Handle different ways Vite might expose environment variables
export const API_BASE_URL = (() => {
  // Try different possible environment variable formats
  const url = import.meta.env?.VITE_API_URL || 
              process.env?.REACT_APP_API_URL || 
              process.env?.VITE_API_URL || 
              (window as any).VITE_API_URL || 
              'http://localhost:3001';
  
  console.log('Using API URL:', url);
  return url;
})();

// Event system for database changes
export class DatabaseEvents {
  private static listeners = {
    backgroundAdded: [] as ((background: Background) => void)[],
    backgroundUpdated: [] as ((background: Background) => void)[],
  };

  // Methods to register listeners
  static onBackgroundAdded(callback: (background: Background) => void) {
    this.listeners.backgroundAdded.push(callback);
    return () => this.offBackgroundAdded(callback); // Return unsubscribe function
  }

  static onBackgroundUpdated(callback: (background: Background) => void) {
    this.listeners.backgroundUpdated.push(callback);
    return () => this.offBackgroundUpdated(callback); // Return unsubscribe function
  }

  // Methods to remove listeners
  static offBackgroundAdded(callback: (background: Background) => void) {
    this.listeners.backgroundAdded = this.listeners.backgroundAdded.filter(cb => cb !== callback);
  }

  static offBackgroundUpdated(callback: (background: Background) => void) {
    this.listeners.backgroundUpdated = this.listeners.backgroundUpdated.filter(cb => cb !== callback);
  }

  // Methods to emit events
  static emitBackgroundAdded(background: Background) {
    this.listeners.backgroundAdded.forEach(callback => callback(background));
  }

  static emitBackgroundUpdated(background: Background) {
    this.listeners.backgroundUpdated.forEach(callback => callback(background));
  }
}

export interface Background {
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

export interface GiftCard {
  id: string;
  creatorAddress: string;
  currentOwner: string;
  price: string;
  message: string;
  secretHash?: string;
  backgroundId: string;
  background?: Background;
  isClaimable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  walletAddress: string;
  username?: string;
  email?: string;
  bio?: string;
  profileImageUrl?: string;
  totalGiftCardsCreated?: number;
  totalGiftCardsSold?: number;
  totalBackgroundsCreated?: number;
}

export interface Transaction {
  id: string;
  giftCardId: string;
  fromAddress: string;
  toAddress: string;
  transactionType: 'purchase' | 'transfer' | 'claim';
  amount: string;
  timestamp: string;
}

// Get token from localStorage
const getToken = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token found');
  }
  return token;
};

// Add token to request headers
export const getAuthHeaders = () => {
  const token = getToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Fetch backgrounds (all or by category)
export const fetchBackgrounds = async (
  category?: string,
  page: number = 1,
  limit: number = 20
): Promise<Background[]> => {
  try {
    const params: any = { page, limit };
    if (category) params.category = category;
    
    const response = await axios.get(`${API_BASE_URL}/api/backgrounds`, { params });
    return response.data.backgrounds || response.data;
  } catch (error) {
    console.error('Fetch backgrounds error:', error);
    throw new Error('Failed to fetch backgrounds');
  }
};

// Get background by ID
export const getBackgroundById = async (id: string): Promise<Background> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/backgrounds/${id}`);
    
    // Emit background updated event
    eventBus.emitBackgroundUpdated({
      background: response.data,
      action: 'updated'
    });
    
    return response.data;
  } catch (error) {
    console.error('Get background error:', error);
    throw new Error('Failed to get background');
  }
};

// Get all background categories
export const getBackgroundCategories = async (): Promise<string[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/backgrounds/categories`);
    return response.data.categories || response.data;
  } catch (error) {
    console.error('Get categories error:', error);
    throw new Error('Failed to get categories');
  }
};

// Create gift card
export const createGiftCard = async (data: {
  backgroundId: string | number;
  price: string;
  message: string;
}): Promise<any> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/gift-cards/create`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error: any) {
    console.error('Create gift card error:', error.response?.data || error);
    throw new Error(error.response?.data?.error || 'Failed to create gift card');
  }
};

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/images/upload`, formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.imageUrl || response.data;
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error('Failed to upload image');
  }
};

export const createBackground = async (data: { image: File; category: string; price: string }) => {
  try {
    const formData = new FormData();
    formData.append('image', data.image);
    formData.append('category', data.category);
    formData.append('price', data.price);
    formData.append('artistAddress', localStorage.getItem('walletAddress') || '');
    
    // Log the request details for debugging
    console.log('Sending background creation request:', {
      category: data.category,
      price: data.price,
      artistAddress: localStorage.getItem('walletAddress')
    });
    
    const response = await axios.post(`${API_BASE_URL}/api/backgrounds`, formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('Background created successfully:', response.data);
    
    // Emit background added event
    if (response.data && response.data.background) {
      DatabaseEvents.emitBackgroundAdded(response.data.background);
    }
    
    return response.data;
  } catch (error) {
    console.error('Create background error:', error);
    throw new Error('Failed to create background');
  }
};

export const mintBackgroundNFT = async (data: { 
  image: File; 
  category: string; 
  price: string;
}): Promise<any> => {
  try {
    const walletAddress = localStorage.getItem('walletAddress');
    if (!walletAddress) {
      throw new Error('No wallet address found - please connect your wallet');
    }
    
    const formData = new FormData();
    formData.append('image', data.image);
    formData.append('category', data.category);
    formData.append('price', data.price);
    formData.append('artistAddress', walletAddress);
    
    console.log('Sending mint request with wallet address:', walletAddress);
    
    const response = await axios.post(`${API_BASE_URL}/api/backgrounds/mint`, formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // Emit background added event if successful
    if (response.data && response.data.success) {
      const backgroundData = response.data.background || response.data;
      eventBus.emitBackgroundUpdated({
        background: backgroundData,
        action: 'added'
      });
    }
    
    return response.data;
  } catch (error) {
    console.error('Mint background NFT error:', error);
    
    // Provide more specific error message from the server response when available
    if (error.response && error.response.data && error.response.data.error) {
      throw new Error(error.response.data.error);
    }
    
    // Otherwise throw a generic error
    throw new Error('Failed to mint background NFT');
  }
};

export const verifyBackgroundStatus = async (backgroundId: string): Promise<any> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/backgrounds/verify/${backgroundId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('Verify background status error:', error);
    throw new Error('Failed to verify background status');
  }
};

// =====================
// GIFT CARD ENDPOINTS
// =====================

// Get all gift cards with filtering
export const fetchGiftCards = async (
  page: number = 1,
  limit: number = 20,
  status?: string,
  minPrice?: string,
  maxPrice?: string
): Promise<GiftCard[]> => {
  try {
    const params: any = { page, limit };
    if (status) params.status = status;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    
    const response = await axios.get(`${API_BASE_URL}/api/giftcards`, { 
      params,
      headers: getAuthHeaders() 
    });
    return response.data.giftCards || response.data;
  } catch (error) {
    console.error('Fetch gift cards error:', error);
    throw new Error('Failed to fetch gift cards');
  }
};

// Transfer a gift card
export const transferGiftCard = async (data: {
  giftCardId: string | number;
  recipient: string;
}): Promise<any> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/giftcard/transfer`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('Transfer gift card error:', error);
    throw new Error('Failed to transfer gift card');
  }
};

// Set secret key for a gift card
export const setGiftCardSecret = async (data: {
  giftCardId: string | number;
  secret: string;
}): Promise<any> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/giftcard/set-secret`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('Set gift card secret error:', error);
    throw new Error('Failed to set gift card secret');
  }
};

// Claim a gift card
export const claimGiftCard = async (data: {
  giftCardId: string | number;
  secret: string;
}): Promise<any> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/giftcard/claim`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('Claim gift card error:', error);
    throw new Error('Failed to claim gift card');
  }
};

// Buy a gift card
export const buyGiftCard = async (data: {
  giftCardId: string | number;
  message?: string;
  price: string;
}): Promise<any> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/giftcard/buy`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('Buy gift card error:', error);
    throw new Error('Failed to buy gift card');
  }
};

// =====================
// USER ENDPOINTS
// =====================

// Create or update a user profile
export const updateUserProfile = async (data: {
  username?: string;
  email?: string;
  bio?: string;
  profileImageUrl?: string;
}): Promise<User> => {
  try {
    const walletAddress = localStorage.getItem('walletAddress');
    if (!walletAddress) {
      throw new Error('No wallet address found - please connect your wallet');
    }
    
    const userData = {
      walletAddress,
      ...data
    };
    
    const response = await axios.post(`${API_BASE_URL}/api/user`, userData, {
      headers: getAuthHeaders(),
    });
    return response.data.user || response.data;
  } catch (error) {
    console.error('Update user profile error:', error);
    throw new Error('Failed to update user profile');
  }
};

// Get user profile
export const getUserProfile = async (walletAddress: string): Promise<User> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/user/${walletAddress}`, {
      headers: getAuthHeaders(),
    });
    return response.data.user || response.data;
  } catch (error) {
    console.error('Get user profile error:', error);
    throw new Error('Failed to get user profile');
  }
};

// Get all users with pagination and sorting
export const fetchUsers = async (
  page: number = 1,
  limit: number = 20,
  sortBy?: string,
  sortOrder?: 'ASC' | 'DESC'
): Promise<User[]> => {
  try {
    const params: any = { page, limit };
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;
    
    const response = await axios.get(`${API_BASE_URL}/api/users`, { 
      params,
      headers: getAuthHeaders() 
    });
    return response.data.users || response.data;
  } catch (error) {
    console.error('Fetch users error:', error);
    throw new Error('Failed to fetch users');
  }
};

// Get top users
export const getTopUsers = async (limit: number = 10): Promise<User[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/users/top?limit=${limit}`, {
      headers: getAuthHeaders(),
    });
    return response.data.users || response.data;
  } catch (error) {
    console.error('Get top users error:', error);
    throw new Error('Failed to get top users');
  }
};

// Search users
export const searchUsers = async (query: string): Promise<User[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/users/search?query=${encodeURIComponent(query)}`, {
      headers: getAuthHeaders(),
    });
    return response.data.users || response.data;
  } catch (error) {
    console.error('Search users error:', error);
    throw new Error('Failed to search users');
  }
};

// Get user activity
export const getUserActivity = async (walletAddress: string): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/users/${walletAddress}/activity`, {
      headers: getAuthHeaders(),
    });
    return response.data.activity || response.data;
  } catch (error) {
    console.error('Get user activity error:', error);
    throw new Error('Failed to get user activity');
  }
};

// =====================
// TRANSACTION ENDPOINTS
// =====================

// Get recent transactions
export const getRecentTransactions = async (limit: number = 10): Promise<Transaction[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/transactions/recent?limit=${limit}`, {
      headers: getAuthHeaders(),
    });
    return response.data.transactions || response.data;
  } catch (error) {
    console.error('Get recent transactions error:', error);
    throw new Error('Failed to get recent transactions');
  }
};

// =====================
// AUTHENTICATION
// =====================

// Login with wallet
export const loginWithWallet = async (walletAddress: string, signature: string): Promise<any> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      walletAddress,
      signature
    });
    
    // Store token for future requests
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('walletAddress', walletAddress);
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw new Error('Failed to login');
  }
};

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
      headers: getAuthHeaders(),
    });
    return response.data.user || response.data;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

// Logout
export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('walletAddress');
};
