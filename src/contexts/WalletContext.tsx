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
  console.log('WalletProvider initialized');
  
  const [address, setAddress] = useState<string | null>(() => {
    const saved = localStorage.getItem('walletAddress');
    console.log('Initial wallet address from storage:', saved);
    return saved || null;
  });

  // Load token and address when component mounts
  useEffect(() => {
    try {
      // Check if we have a token and wallet address in localStorage
      const token = localStorage.getItem('token');
      const savedAddress = localStorage.getItem('walletAddress');
      
      console.log('Checking stored credentials:', { token: !!token, savedAddress });
      
      // If we have both, consider the user already connected
      if (token && savedAddress) {
        setAddress(savedAddress);
        console.log('Wallet reconnected from storage:', savedAddress);
      }
    } catch (error) {
      console.error('Error loading wallet from storage:', error);
    }
  }, []);

  const connect = async (newAddress: string) => {
    console.log('WalletContext: Connecting new address:', newAddress);
    
    if (!newAddress) {
      console.error('Invalid address provided');
      throw new Error('Invalid wallet address');
    }

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
      
      console.log('Successfully connected wallet:', newAddress);
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      // Clear any partial state
      setAddress(null);
      localStorage.removeItem('walletAddress');
      localStorage.removeItem('token');
      throw new Error(error.message || 'Failed to connect wallet');
    }
  };

  const disconnect = () => {
    console.log('Disconnecting wallet');
    try {
      setAddress(null);
      localStorage.removeItem('walletAddress');
      localStorage.removeItem('token');
      console.log('Wallet disconnected successfully');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
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