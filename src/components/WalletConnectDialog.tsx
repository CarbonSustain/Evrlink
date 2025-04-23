import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { X, Wallet, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { connectMetaMask, connectCoinbaseWallet, isMetaMaskInstalled } from '@/lib/wallet';
import { toast } from 'react-hot-toast';

interface WalletOption {
  id: 'metamask' | 'coinbase';
  name: string;
  icon: string;
  description: string;
  status: 'installed' | 'not-installed';
  downloadUrl: string;
}

interface WalletConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect?: (address: string) => void;
}

const getWalletOptions = (): WalletOption[] => [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '/metamask.svg',
    description: 'Popular browser wallet for DeFi & NFTs',
    status: isMetaMaskInstalled() ? 'installed' : 'not-installed',
    downloadUrl: 'https://metamask.io/download/'
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '/coinbase.svg',
    description: 'The gateway to the decentralized crypto economy',
    status: 'installed', // Always installed since we're using the SDK
    downloadUrl: 'https://www.coinbase.com/wallet'
  }
];

const WalletConnectDialog: React.FC<WalletConnectDialogProps> = ({
  open,
  onOpenChange,
  onConnect,
}) => {
  const [connecting, setConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [walletOptions, setWalletOptions] = useState<WalletOption[]>([]);

  useEffect(() => {
    if (open) {
      console.log('WalletConnectDialog opened');
      // DEBUG: Log provider state
      console.log('window.ethereum:', window.ethereum);
      console.log('window.ethereum.providers:', window.ethereum?.providers);
      console.log('window.coinbaseWalletExtension:', window.coinbaseWalletExtension);
      setWalletOptions(getWalletOptions());
      setConnectionError(null);
    }
  }, [open]);

  const handleWalletConnect = async (wallet: WalletOption) => {
    console.log('Attempting to connect wallet:', wallet.id);
    setConnectionError(null);
    setConnecting(true);
    
    try {
      let address: string;
      
      if (wallet.id === 'metamask') {
        // For MetaMask, we still need to check installation
        if (wallet.status === 'not-installed') {
          window.open(wallet.downloadUrl, '_blank');
          throw new Error(`${wallet.name} is not installed. Please install it and try again.`);
        }
        address = await connectMetaMask();
      } else if (wallet.id === 'coinbase') {
        // For Coinbase, we use the SDK directly
        console.log('Connecting to Coinbase Wallet...');
        address = await connectCoinbaseWallet();
      } else {
        throw new Error('Unknown wallet type');
      }
      
      if (!address) {
        throw new Error('No address returned from wallet');
      }
      
      console.log('Wallet connected successfully:', address);
      toast.success(`Connected to ${wallet.name}!`);
      onConnect?.(address);
      onOpenChange(false);
      
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      
      // Handle specific error cases
      let errorMessage = error.message || 'Failed to connect wallet';
      
      if (error.code === 4001) {
        errorMessage = 'Connection rejected. Please approve the connection in your wallet.';
      } else if (error.code === -32002) {
        errorMessage = 'Connection pending. Please check your wallet for pending requests.';
      }
      
      setConnectionError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setConnecting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 text-white border-none p-0 max-w-md w-full overflow-hidden rounded-xl">
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-pink-500 to-orange-500 w-6 h-6 rounded-md flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <DialogTitle className="text-xl font-bold">Connect Wallet</DialogTitle>
          </div>
          <button 
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {connectionError && (
          <div className="p-4 bg-red-500/10 border-b border-red-500/20 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-200">{connectionError}</div>
          </div>
        )}
        
        <div className="max-h-[60vh] overflow-y-auto">
          <div className="grid gap-4 p-4">
            {walletOptions.map((wallet) => (
              <button
                key={wallet.id}
                className={cn(
                  'flex items-center gap-3 w-full p-4 rounded-xl text-left',
                  'bg-gray-800 hover:bg-gray-700/80',
                  'transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-pink-500',
                  connecting && 'opacity-50 cursor-not-allowed'
                )}
                onClick={() => handleWalletConnect(wallet)}
                disabled={connecting}
              >
                <div className="bg-gray-700 w-12 h-12 rounded-lg flex items-center justify-center p-2">
                  <img
                    src={wallet.icon}
                    alt={wallet.name}
                    className="w-full h-full"
                  />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-lg">{wallet.name}</div>
                  <div className="text-sm text-gray-400">{wallet.description}</div>
                  {wallet.status === 'not-installed' && (
                    <div className="text-sm text-yellow-400 flex items-center gap-1 mt-1">
                      <span>Not installed</span> 
                      <span className="underline">Click to install</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
            
            <button
              className="flex items-center gap-3 w-full p-4 hover:bg-gray-800/50 transition-colors text-left"
              onClick={() => window.open('https://ethereum.org/en/wallets/find-wallet/', '_blank')}
            >
              <div className="bg-gray-700 w-12 h-12 rounded-lg flex items-center justify-center">
                <div className="text-gray-400 text-2xl">••</div>
              </div>
              <div className="flex-1">
                <div className="font-semibold">All Wallets</div>
                <div className="text-sm text-gray-400">Browse all available wallets</div>
              </div>
              <div className="text-sm text-gray-500 px-2 py-0.5 bg-gray-800 rounded">500+</div>
            </button>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-800 flex justify-between items-center">
          <div className="text-gray-400">New to wallets?</div>
          <button 
            className="text-blue-400 font-medium"
            onClick={() => window.open('https://ethereum.org/en/wallets/', '_blank')}
          >
            Get started
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletConnectDialog;