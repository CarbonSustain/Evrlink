import { ethers } from 'ethers';
import { Web3Auth } from '@web3auth/modal';
import { CHAIN_NAMESPACES, WALLET_ADAPTERS } from '@web3auth/base';
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk';
import type { CoinbaseWalletProvider } from '@coinbase/wallet-sdk';
import type { Web3AuthOptions } from '@web3auth/modal';
import { ADAPTER_EVENTS, CONNECTED_EVENT_DATA } from '@web3auth/base';
import { OpenloginAdapter } from '@web3auth/openlogin-adapter';

// Update RPC Configuration with better defaults
const RPC_URL = import.meta.env.VITE_RPC_URL || 'https://mainnet.infura.io/v3/your-infura-id';
const CHAIN_ID = parseInt(import.meta.env.VITE_CHAIN_ID || '1', 10);
const APP_NAME = 'OnChain-GiftPack';
const APP_LOGO_URL = '/logo.png';

// Initialize Coinbase Wallet SDK with better configuration
let coinbaseWalletInstance: CoinbaseWalletSDK | null = null;

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

// Enhanced Coinbase Wallet provider initialization
const getCoinbaseWalletProvider = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    console.log('Initializing Coinbase Wallet SDK...');
    
    // Create a single instance if not exists
    if (!coinbaseWalletInstance) {
      coinbaseWalletInstance = new CoinbaseWalletSDK({
        appName: APP_NAME,
        appLogoUrl: APP_LOGO_URL
      });
      console.log('Created new Coinbase Wallet instance');
    }

    // Create Web3 provider
    const provider = coinbaseWalletInstance.makeWeb3Provider();
    
    console.log('Created Coinbase Web3 provider:', provider);
    return provider as CoinbaseWalletProvider;
  } catch (error) {
    console.error('Error in getCoinbaseWalletProvider:', error);
    return null;
  }
};

// Helper function to get chain name
const getChainName = (chainId: number): string => {
  switch (chainId) {
    case 1:
      return 'Ethereum Mainnet';
    case 5:
      return 'Goerli Testnet';
    case 11155111:
      return 'Sepolia Testnet';
    default:
      return 'Ethereum Network';
  }
};

// Helper function to get block explorer URL
const getBlockExplorer = (chainId: number): string => {
  switch (chainId) {
    case 1:
      return 'https://etherscan.io';
    case 5:
      return 'https://goerli.etherscan.io';
    case 11155111:
      return 'https://sepolia.etherscan.io';
    default:
      return 'https://etherscan.io';
  }
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
  // Always return true since we're using the SDK which doesn't require installation
  return true;
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
    provider.on('accountsChanged', (newAccounts: unknown) => {
      if (Array.isArray(newAccounts)) {
        const accounts = newAccounts;
        if (accounts.length > 0) {
          const account = accounts[0];
          localStorage.removeItem('walletAddress');
          localStorage.removeItem('token');
        }
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

// Enhanced Coinbase Wallet connection
export const connectCoinbaseWallet = async (): Promise<string> => {
  console.log('Starting Coinbase Wallet connection...');
  try {
    const provider = getCoinbaseWalletProvider();
    if (!provider) {
      throw new Error('Failed to initialize Coinbase Wallet');
    }

    console.log('Requesting accounts...');
    
    // Request account access
    const accounts = await provider.request({
      method: 'eth_requestAccounts'
    }) as string[];

    console.log('Received accounts:', accounts);
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found');
    }

    const address = accounts[0];
    console.log('Connected with address:', address);

    // Create ethers provider
    const ethersProvider = new ethers.providers.Web3Provider(provider);
    
    // Verify network and switch if needed
    const network = await ethersProvider.getNetwork();
    console.log('Connected to network:', network.name);

    if (network.chainId !== CHAIN_ID) {
      console.log('Switching to correct network...');
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${CHAIN_ID.toString(16)}` }],
        });
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to Coinbase Wallet
        if (switchError.code === 4902) {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${CHAIN_ID.toString(16)}`,
                chainName: getChainName(CHAIN_ID),
                nativeCurrency: {
                  name: 'Ethereum',
                  symbol: 'ETH',
                  decimals: 18
                },
                rpcUrls: [RPC_URL],
                blockExplorerUrls: [getBlockExplorer(CHAIN_ID)]
              },
            ],
          });
        } else {
          throw switchError;
        }
      }
    }

    // Set up event listeners
    provider.on('accountsChanged', (newAccounts: unknown) => {
      if (Array.isArray(newAccounts)) {
        const accounts = newAccounts;
        if (accounts.length > 0) {
          const account = accounts[0];
          console.log('Coinbase Wallet accounts changed:', accounts);
          localStorage.removeItem('walletAddress');
          localStorage.removeItem('token');
          window.location.reload();
        }
      }
    });

    provider.on('chainChanged', (chainId: string) => {
      console.log('Coinbase Wallet chain changed:', chainId);
      window.location.reload();
    });

    provider.on('disconnect', () => {
      console.log('Coinbase Wallet disconnected');
      localStorage.removeItem('walletAddress');
      localStorage.removeItem('token');
      window.location.reload();
    });

    return address;
  } catch (error: any) {
    console.error('Coinbase Wallet connection error:', error);
    if (error.code === 4001) {
      throw new Error('Please approve the connection request in Coinbase Wallet');
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

    const openloginAdapter = new OpenloginAdapter({
      adapterSettings: {
        network: 'mainnet',
        uxMode: 'popup',
      },
    });

    const web3AuthOptions: Web3AuthOptions = {
      clientId: import.meta.env.VITE_WEB3AUTH_CLIENT_ID || 'YOUR_WEB3AUTH_CLIENT_ID',
      web3AuthNetwork: CHAIN_ID === 1 ? 'mainnet' : 'testnet',
      chainConfig: {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: `0x${CHAIN_ID.toString(16)}`,
        rpcTarget: RPC_URL,
        displayName: getChainName(CHAIN_ID),
        blockExplorerUrl: getBlockExplorer(CHAIN_ID),
        ticker: 'ETH',
        tickerName: 'Ethereum',
      },
      uiConfig: {
        appName: 'Evrlink',
        mode: 'light',
        loginMethodsOrder: ['google', 'facebook', 'twitter', 'discord', 'github'],
        logoLight: APP_LOGO_URL,
        logoDark: APP_LOGO_URL,
        defaultLanguage: 'en',
      },
      enableLogging: import.meta.env.DEV,
      privateKeyProvider: openloginAdapter,
    };

    const web3auth = new Web3Auth(web3AuthOptions);
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
      if (accounts && accounts.length > 0) {
        console.log('Smart Wallet account changed, reloading page');
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
    if (currentWeb3AuthInstance) {
      await currentWeb3AuthInstance.logout();
      currentWeb3AuthInstance = null;
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

export const disconnectCoinbaseWallet = async (): Promise<void> => {
  try {
    if (coinbaseWalletInstance) {
      const provider = coinbaseWalletInstance.makeWeb3Provider();
      if (provider) {
        // Remove all event listeners
        provider.removeAllListeners?.('accountsChanged');
        provider.removeAllListeners?.('chainChanged');
        provider.removeAllListeners?.('disconnect');
        
        // Clear any provider state
        await provider.close?.();
      }
      
      // Clear the instance
      coinbaseWalletInstance = null;
      
      // Clear all local storage
      localStorage.clear();
      
      // Force a page reload to clear any cached data
      window.location.reload();
    }
  } catch (error) {
    console.error('Error disconnecting Coinbase Wallet:', error);
    throw new Error('Failed to disconnect Coinbase Wallet');
  }
};

// Create a new Coinbase Wallet
export const createCoinbaseWallet = async (): Promise<string> => {
  console.log('Starting Coinbase Wallet creation...');
  try {
    // Initialize the Coinbase Wallet SDK if not already initialized
    if (!coinbaseWalletInstance) {
      coinbaseWalletInstance = new CoinbaseWalletSDK({
        appName: APP_NAME,
        appLogoUrl: APP_LOGO_URL,
        darkMode: true
      });
    }

    // Get the provider
    const provider = coinbaseWalletInstance.makeWeb3Provider();
    
    // Request wallet creation
    const accounts = await provider.request({
      method: 'eth_requestAccounts',
      params: [{ createNewWallet: true }]
    }) as string[];

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found after wallet creation');
    }

    const address = accounts[0];
    console.log('New wallet created with address:', address);

    // Set up event listeners
    provider.on('accountsChanged', (newAccounts: unknown) => {
      if (Array.isArray(newAccounts)) {
        const accounts = newAccounts;
        if (accounts.length > 0) {
          const account = accounts[0];
          console.log('Wallet accounts changed:', accounts);
          localStorage.removeItem('walletAddress');
          localStorage.removeItem('token');
          window.location.reload();
        }
      }
    });

    provider.on('chainChanged', (chainId: string) => {
      console.log('Wallet chain changed:', chainId);
      window.location.reload();
    });

    provider.on('disconnect', () => {
      console.log('Wallet disconnected');
      localStorage.removeItem('walletAddress');
      localStorage.removeItem('token');
      window.location.reload();
    });

    return address;
  } catch (error: any) {
    console.error('Coinbase Wallet creation error:', error);
    if (error.code === 4001) {
      throw new Error('Wallet creation was rejected by the user');
    }
    throw new Error(error.message || 'Failed to create Coinbase Wallet');
  }
};