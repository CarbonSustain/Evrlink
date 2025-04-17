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
  if (typeof window === 'undefined') return null;
  
  // First check if we have a direct MetaMask provider
  if (window.ethereum?.isMetaMask && !window.ethereum?.isCoinbaseWallet) {
    return window.ethereum;
  }
  
  // Then check if we have MetaMask in the providers list
  if (window.ethereum?.providers?.length > 0) {
    const provider = window.ethereum.providers.find(
      (p: any) => p.isMetaMask && !p.isCoinbaseWallet
    );
    if (provider) return provider;
  }
  
  // Fallback: check for provider with name or id
  if (window.ethereum?.providers?.length > 0) {
    const provider = window.ethereum.providers.find(
      (p: any) => p.name === 'MetaMask' || p.id === 'metamask'
    );
    if (provider) return provider;
  }
  
  return null;
};

// Get Coinbase Wallet provider
const getCoinbaseWalletProvider = () => {
  if (typeof window === 'undefined') return null;
  
  // Check for Coinbase Wallet extension
  if (window.coinbaseWalletExtension) {
    return window.coinbaseWalletExtension;
  }

  // Check if we have a direct Coinbase provider
  if (window.ethereum?.isCoinbaseWallet) {
    return window.ethereum;
  }
  
  // Check if we have Coinbase in the providers list
  if (window.ethereum?.providers?.length > 0) {
    const provider = window.ethereum.providers.find(
      (p: any) => p.isCoinbaseWallet
    );
    if (provider) return provider;
  }
  
  // Fallback: check for provider with name or id
  if (window.ethereum?.providers?.length > 0) {
    const provider = window.ethereum.providers.find(
      (p: any) => p.name === 'CoinbaseWallet' || p.id === 'coinbase'
    );
    if (provider) return provider;
  }
  
  return null;
};

export const isMetaMaskInstalled = (): boolean => {
  if (typeof window === 'undefined') return false;
  if (window.ethereum?.isMetaMask) return true;
  if (window.ethereum?.providers?.some((p: any) => p.isMetaMask)) return true;
  if ((window as any).metamask) return true;
  // Fallback: check for provider with name or id
  if (window.ethereum?.providers?.some((p: any) => p.name === 'MetaMask' || p.id === 'metamask')) return true;
  return false;
};

export const isCoinbaseWalletInstalled = (): boolean => {
  if (typeof window === 'undefined') return false;
  if (window.coinbaseWalletExtension) return true;
  if (window.ethereum?.isCoinbaseWallet) return true;
  if (window.ethereum?.providers?.some((p: any) => p.isCoinbaseWallet)) return true;
  if ((window as any).coinbaseWallet) return true;
  // Fallback: check for provider with name or id
  if (window.ethereum?.providers?.some((p: any) => p.name === 'CoinbaseWallet' || p.id === 'coinbase')) return true;
  return false;
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
    throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
  }

  try {
    // Get the provider
    let provider = window.ethereum;
    if (window.ethereum.providers) {
      provider = window.ethereum.providers.find(p => p.isMetaMask);
    }

    if (!provider) {
      throw new Error('MetaMask provider not found');
    }

    // Request accounts
    const accounts = await provider.request({ method: 'eth_requestAccounts' });
    if (!accounts || accounts.length === 0) {
      throw new Error('Please connect to MetaMask.');
    }

    const address = accounts[0];
    console.log('Connected to MetaMask:', address);

    // Set up event listeners
    provider.on('accountsChanged', (newAccounts: string[]) => {
      if (newAccounts.length === 0) {
        localStorage.removeItem('walletAddress');
        localStorage.removeItem('token');
      }
      window.location.reload();
    });

    provider.on('chainChanged', () => {
      window.location.reload();
    });

    return address;
  } catch (error: any) {
    console.error('MetaMask connection error:', error);
    if (error.code === 4001) {
      throw new Error('Please connect to MetaMask.');
    }
    throw new Error(error.message || 'Failed to connect to MetaMask');
  }
};

// Connect to Coinbase Wallet
export const connectCoinbaseWallet = async (): Promise<string> => {
  if (!isCoinbaseWalletInstalled()) {
    window.open('https://www.coinbase.com/wallet/downloads', '_blank');
    throw new Error('Coinbase Wallet is not installed. Please install Coinbase Wallet to continue.');
  }

  try {
    // Get the provider
    const provider = getCoinbaseWalletProvider();

    if (!provider) {
      throw new Error('Coinbase Wallet provider not found');
    }

    // Request accounts
    const accounts = await provider.request({ method: 'eth_requestAccounts' });
    if (!accounts || accounts.length === 0) {
      throw new Error('Please connect to Coinbase Wallet.');
    }

    const address = accounts[0];
    console.log('Connected to Coinbase Wallet:', address);

    // Set up event listeners
    provider.on('accountsChanged', (newAccounts: string[]) => {
      if (newAccounts.length === 0) {
        localStorage.removeItem('walletAddress');
        localStorage.removeItem('token');
      }
      window.location.reload();
    });

    provider.on('chainChanged', () => {
      window.location.reload();
    });

    return address;
  } catch (error: any) {
    console.error('Coinbase Wallet connection error:', error);
    if (error.code === 4001) {
      throw new Error('Please connect to Coinbase Wallet.');
    }
    throw new Error(error.message || 'Failed to connect to Coinbase Wallet');
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
export const disconnectWeb3Auth = async () => {
  if (currentWeb3AuthInstance) {
    try {
      await currentWeb3AuthInstance.logout();
      currentWeb3AuthInstance = null;
    } catch (error) {
      console.error('Error disconnecting Web3Auth:', error);
    }
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