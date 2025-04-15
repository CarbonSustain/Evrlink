import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../services/api';

interface WalletContextType {
  address: string | null;
  connect: (address: string) => Promise<void>;
  disconnect: () => void;
  isConnected: boolean;
  getToken: () => string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(() => {
    const saved = localStorage.getItem('walletAddress');
    return saved || null;
  });

  // Load token and address when component mounts
  useEffect(() => {
    // Check if we have a token and wallet address in localStorage
    const token = localStorage.getItem('token');
    const savedAddress = localStorage.getItem('walletAddress');
    
    // If we have both, consider the user already connected
    if (token && savedAddress) {
      setAddress(savedAddress);
      console.log('Wallet reconnected from storage:', savedAddress);
    }
  }, []);

  const connect = async (newAddress: string) => {
    try {
      console.log('Connecting wallet address:', newAddress);
      console.log('Using API URL:', API_BASE_URL);
      
      // For Web3Auth, we'll use the address itself as the authentication token
      // In a production environment, you should implement proper JWT-based authentication
      const token = `web3auth_${newAddress}`;
      
      // Save address and token
      setAddress(newAddress);
      localStorage.setItem('walletAddress', newAddress);
      localStorage.setItem('token', token);
      
      console.log('Connected with address:', newAddress);
      return;
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      throw new Error(error.message || 'Failed to connect wallet');
    }
  };

  const disconnect = () => {
    setAddress(null);
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('token');
  };

  const getToken = () => {
    const token = localStorage.getItem('token');
    return token;
  };

  const value = {
    address,
    connect,
    disconnect,
    isConnected: !!address,
    getToken
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
