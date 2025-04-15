import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
    coinbaseWalletExtension?: any;
  }
}

// Check if MetaMask is installed
export const isMetaMaskInstalled = (): boolean => {
  return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
};

// Check if Coinbase Wallet is installed
export const isCoinbaseWalletInstalled = (): boolean => {
  return typeof window.ethereum !== 'undefined' && window.ethereum.isCoinbaseWallet;
};

// Get provider based on wallet type
const getProvider = async (walletType: string): Promise<any> => {
  if (!window.ethereum) {
    throw new Error('No Web3 provider found. Please install a wallet.');
  }

  // Force MetaMask
  if (walletType === 'metamask' && !window.ethereum.isMetaMask) {
    window.open('https://metamask.io/download/', '_blank');
    throw new Error('Please install MetaMask to continue.');
  }

  // Force Coinbase Wallet
  if (walletType === 'coinbase' && !window.ethereum.isCoinbaseWallet) {
    window.open('https://www.coinbase.com/wallet', '_blank');
    throw new Error('Please install Coinbase Wallet to continue.');
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts',
      params: [] // Empty params array to prevent redirect
    });
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please unlock your wallet.');
    }

    // Get the provider
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    return { provider, address: accounts[0] };
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error('Please accept the connection request in your wallet.');
    } else if (error.code === -32002) {
      throw new Error('Wallet is already processing a request. Please check your wallet extension.');
    }
    throw error;
  }
};

export const connectWallet = async (walletId: string): Promise<string> => {
  try {
    // Get provider and address
    const { provider, address } = await getProvider(walletId);

    // Set up event listeners
    window.ethereum.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length === 0) {
        console.log('Wallet disconnected');
        localStorage.removeItem('walletAddress');
        localStorage.removeItem('token');
        window.location.reload();
      } else {
        console.log('Account changed:', accounts[0]);
        localStorage.setItem('walletAddress', accounts[0]);
      }
    });

    window.ethereum.on('chainChanged', () => {
      console.log('Network changed, reloading...');
      window.location.reload();
    });

    window.ethereum.on('disconnect', () => {
      console.log('Wallet disconnected');
      localStorage.removeItem('walletAddress');
      localStorage.removeItem('token');
      window.location.reload();
    });

    return address;
  } catch (error: any) {
    console.error('Wallet connection error:', error);
    throw new Error(error.message || 'Failed to connect wallet. Please try again.');
  }
};

// Disconnect wallet
export const disconnectWallet = (): void => {
  localStorage.removeItem('walletAddress');
  localStorage.removeItem('token');
  window.location.reload();
};
