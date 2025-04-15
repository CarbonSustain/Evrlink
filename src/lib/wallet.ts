import { ethers } from 'ethers';
import { Web3Auth } from '@web3auth/modal';
import { CHAIN_NAMESPACES } from '@web3auth/base';

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      isCoinbaseWallet?: boolean;
      providers?: any[];
      request?: (args: { method: string; params?: any[] }) => Promise<any>;
      on?: (event: string, callback: any) => void;
      removeListener?: (event: string, callback: any) => void;
    };
    coinbaseWalletExtension?: any;
  }
}

// Get MetaMask provider
const getMetaMaskProvider = () => {
  // Check if we have multiple providers (like MetaMask + Web3Auth)
  if (typeof window.ethereum !== 'undefined') {
    // If we have multiple providers, find MetaMask
    if (window.ethereum.providers) {
      const provider = window.ethereum.providers.find(
        (p: any) => p.isMetaMask && !p.isCoinbaseWallet
      );
      if (provider) return provider;
    }
    // If we only have one provider and it's MetaMask
    if (window.ethereum.isMetaMask && !window.ethereum.isCoinbaseWallet) {
      return window.ethereum;
    }
  }
  return null;
};

// Check if MetaMask is installed
export const isMetaMaskInstalled = (): boolean => {
  return getMetaMaskProvider() !== null;
};

// Check if Coinbase Wallet is installed
export const isCoinbaseWalletInstalled = (): boolean => {
  return typeof window.coinbaseWalletExtension !== 'undefined' || (typeof window.ethereum !== 'undefined' && window.ethereum.isCoinbaseWallet === true);
};

// Get Coinbase Wallet provider
const getCoinbaseProvider = () => {
  if (window.coinbaseWalletExtension) {
    return window.coinbaseWalletExtension;
  } else if (window.ethereum && window.ethereum.isCoinbaseWallet) {
    return window.ethereum;
  }
  return null;
};

// Get MetaMask network
export const getMetaMaskChainId = async (): Promise<string> => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }
  
  try {
    const provider = getMetaMaskProvider();
    if (!provider) {
      throw new Error('Failed to get MetaMask provider');
    }
    const chainId = await provider.request({ method: 'eth_chainId' });
    return chainId;
  } catch (error) {
    console.error('Error getting chain ID:', error);
    throw error;
  }
};

// Connect to MetaMask
export const connectMetaMask = async (): Promise<string> => {
  if (!isMetaMaskInstalled()) {
    window.open('https://metamask.io/download/', '_blank');
    throw new Error('Please install MetaMask to continue.');
  }

  // Force Coinbase Wallet
  if (walletType === 'coinbase' && !window.ethereum.isCoinbaseWallet) {
    window.open('https://www.coinbase.com/wallet', '_blank');
    throw new Error('Please install Coinbase Wallet to continue.');
  }

  // Clean up Web3Auth if it exists to prevent interference
  if (currentWeb3AuthInstance) {
    try {
      await currentWeb3AuthInstance.logout();
      currentWeb3AuthInstance = null;
    } catch (error) {
      console.warn('Error cleaning up Web3Auth:', error);
    }
  }
  
  try {
    const provider = getMetaMaskProvider();
    if (!provider) {
      throw new Error('Failed to get MetaMask provider');
    }

    const accounts = await provider.request({ method: 'eth_requestAccounts' });
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please unlock your wallet.');
    }
    
    const address = accounts[0];
    
    console.log('MetaMask connected with address:', address);
    
    // Remove any existing listeners first
    const handleAccountsChanged = function (accounts: string[]) {
      if (accounts.length === 0) {
        console.log('MetaMask disconnected, reloading page');
        localStorage.removeItem('walletAddress');
        localStorage.removeItem('token');
        window.location.reload();
      } else {
        console.log('Account changed:', accounts[0]);
        localStorage.setItem('walletAddress', accounts[0]);
      }
      window.location.reload();
    };

    const handleChainChanged = function (chainId: string) {
      console.log('MetaMask chain changed, reloading page');
      window.location.reload();
    };

    provider.removeListener?.('accountsChanged', handleAccountsChanged);
    provider.removeListener?.('chainChanged', handleChainChanged);

    // Add new listeners
    provider.on('accountsChanged', handleAccountsChanged);
    provider.on('chainChanged', handleChainChanged);

    return address;
  } catch (error: any) {
    console.error('Error connecting to MetaMask', error);
    
    if (error.code === 4001) {
      throw new Error('User rejected the connection request');
    } else if (error.code === -32002) {
      throw new Error('MetaMask is already processing a connection request');
    }
    
    throw error;
  }
};

// Disconnect existing Web3Auth instance if it exists
let currentWeb3AuthInstance: Web3Auth | null = null;

// Connect to Web3Auth Smart Wallet
export const connectSmartWallet = async (): Promise<string> => {
  try {
    // Clean up any existing instance
    if (currentWeb3AuthInstance) {
      await currentWeb3AuthInstance.logout();
    }

    const web3auth = new Web3Auth({
      clientId: 'YOUR_WEB3AUTH_CLIENT_ID', // Replace with your Web3Auth client ID from https://dashboard.web3auth.io
      chainConfig: {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: '0x1', // Ethereum Mainnet (0xaa36a7 for Sepolia, 0x89 for Polygon)
        rpcTarget: 'https://rpc.ankr.com/eth', // Use your own RPC endpoint in production
      },
    });

    await web3auth.initModal();
    currentWeb3AuthInstance = web3auth;
    const provider = await web3auth.connect();
    
    if (!provider) throw new Error('Failed to get provider');
    
    // Create a fresh Web3Provider instance for this connection
    const ethersProvider = new ethers.providers.Web3Provider(provider, 'any');
    const signer = await ethersProvider.getSigner();
    const address = await signer.getAddress();

    console.log('Smart Wallet connected with address:', address);

    // Add event listeners for the Web3Auth provider
    provider.on('accountsChanged', (accounts: string[]) => {
      if (!accounts.length) {
        console.log('Smart Wallet disconnected, reloading page');
        localStorage.removeItem('walletAddress');
        localStorage.removeItem('token');
        window.location.reload();
      }
    });

    provider.on('chainChanged', (chainId: string) => {
      console.log('Smart Wallet chain changed, reloading page');
      window.location.reload();
    });

    return address;
  } catch (error: any) {
    console.error('Error connecting to Smart Wallet:', error);
    throw new Error('Failed to connect Smart Wallet: ' + error.message);
  }
};

// Disconnect Web3Auth Smart Wallet
// Connect to Coinbase Wallet
export const connectCoinbaseWallet = async (): Promise<string> => {
  if (!isCoinbaseWalletInstalled()) {
    window.open('https://www.coinbase.com/wallet/downloads', '_blank');
    throw new Error('Coinbase Wallet is not installed. Please install Coinbase Wallet to continue.');
  }

  const provider = getCoinbaseProvider();
  if (!provider) {
    throw new Error('Failed to get Coinbase Wallet provider');
  }
  
  try {
    const accounts = await provider.request({ method: 'eth_requestAccounts' });
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please unlock your Coinbase Wallet.');
    }
    
    const address = accounts[0];
    
    console.log('Coinbase Wallet connected with address:', address);
    
    provider.on('accountsChanged', function (accounts: string[]) {
      if (accounts.length === 0) {
        console.log('Coinbase Wallet disconnected, reloading page');
        localStorage.removeItem('walletAddress');
        localStorage.removeItem('token');
      }
      window.location.reload();
    });
    
    provider.on('chainChanged', function (chainId: string) {
      console.log('Coinbase Wallet chain changed, reloading page');
      window.location.reload();
    });

    return address;
  } catch (error: any) {
    console.error('Error connecting to Coinbase Wallet', error);
    
    if (error.code === 4001) {
      throw new Error('User rejected the connection request');
    } else if (error.code === -32002) {
      throw new Error('Coinbase Wallet is already processing a connection request');
    }
    
    throw error;
  }
};

export const disconnectSmartWallet = async (): Promise<void> => {
  try {
    const web3auth = new Web3Auth({
      clientId: 'YOUR_WEB3AUTH_CLIENT_ID',
      chainConfig: {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: '0x1',
        rpcTarget: 'https://rpc.ankr.com/eth',
      },
    });
    await web3auth.initModal();
    if (web3auth.connect) {
      await web3auth.logout();
      console.log('Smart Wallet disconnected');
      localStorage.removeItem('walletAddress');
      localStorage.removeItem('token');
    }
  } catch (error: any) {
    console.error('Error disconnecting Smart Wallet:', error);
    throw new Error('Failed to disconnect Smart Wallet: ' + error.message);
  }
};

// Connect wallet based on walletId
export const connectWallet = async (walletId: string): Promise<string> => {
  switch (walletId) {
    case 'metamask':
      return await connectMetaMask();
    case 'smartwallet':
      return await connectSmartWallet();
    case 'coinbase':
      return await connectCoinbaseWallet();
    case 'walletconnect':
      throw new Error('WalletConnect integration coming soon');
    case 'brave':
      return await connectMetaMask(); // Brave browser uses the same provider interface
    case 'rainbow':
      throw new Error('Rainbow Wallet integration coming soon');
    default:
      throw new Error('Wallet not supported');
  }
};