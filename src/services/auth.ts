import { ethers } from 'ethers';
import { API_BASE_URL, loginWithWallet, getCurrentUser, logout } from './api';

// Auth service to handle wallet authentication
class AuthService {
  private ethereum: any;
  private provider: any;
  private signer: any;

  constructor() {
    // Check if window.ethereum is available (MetaMask)
    if (typeof window !== 'undefined' && window.ethereum) {
      this.ethereum = window.ethereum;
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      this.signer = this.provider.getSigner();
    }
  }

  // Get the current wallet address from local storage
  getWalletAddress(): string | null {
    return localStorage.getItem('walletAddress');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  // Connect wallet and authenticate
  async connectWallet(): Promise<string> {
    if (!this.ethereum) {
      throw new Error('No Ethereum wallet detected. Please install MetaMask.');
    }

    try {
      // Request account access
      const accounts = await this.ethereum.request({ method: 'eth_requestAccounts' });
      const walletAddress = accounts[0];

      // Sign a message to authenticate
      await this.authenticate(walletAddress);

      return walletAddress;
    } catch (error) {
      console.error('Wallet connection error:', error);
      throw new Error('Failed to connect wallet');
    }
  }

  // Sign message and authenticate with backend
  async authenticate(walletAddress: string): Promise<void> {
    try {
      // For development, use a simplified mock signature that the backend will accept
      // In the crypto.js file, there's special handling for mock signatures in the format: mock_signature_for_ADDRESS
      const signature = `mock_signature_for_${walletAddress}`;
      console.log('Using development mock signature for wallet:', walletAddress);
      
      // Send to backend for verification
      const response = await loginWithWallet(walletAddress, signature);
      
      // Store authentication data
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('walletAddress', walletAddress);
      } else {
        throw new Error('Authentication failed - no token received');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      throw new Error('Failed to authenticate wallet');
    }
  }

  // Disconnect wallet
  disconnectWallet(): void {
    logout();
  }

  // Get current user profile
  async getCurrentUser(): Promise<any> {
    return getCurrentUser();
  }

  // Listen for account changes
  listenForAccountChanges(callback: (accounts: string[]) => void): void {
    if (this.ethereum) {
      this.ethereum.on('accountsChanged', callback);
    }
  }

  // Listen for chain/network changes
  listenForChainChanges(callback: (chainId: string) => void): void {
    if (this.ethereum) {
      this.ethereum.on('chainChanged', callback);
    }
  }
}

export default new AuthService();
