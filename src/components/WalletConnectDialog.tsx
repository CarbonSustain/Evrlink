import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X, Wallet, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { connectWallet, isMetaMaskInstalled, isCoinbaseWalletInstalled } from '@/lib/wallet';
import { toast } from 'react-hot-toast';

interface WalletOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  status?: 'recommended' | 'installed' | 'not-installed';
  downloadUrl: string;
  description?: string;
}

interface WalletConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect?: (address: string) => void;
}

const getWalletOptions = (): WalletOption[] => {
  // Check installed wallets
  const metamaskInstalled = isMetaMaskInstalled();
  const coinbaseInstalled = isCoinbaseWalletInstalled();
  
  return [
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: <div className="text-orange-500 text-2xl">🦊</div>,
      status: metamaskInstalled ? 'installed' : 'not-installed',
      downloadUrl: 'https://metamask.io/download/',
      description: 'The most popular Web3 wallet'
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      icon: <div className="text-blue-500 text-2xl">📱</div>,
      status: coinbaseInstalled ? 'installed' : 'not-installed',
      downloadUrl: 'https://www.coinbase.com/wallet',
      description: 'Secure crypto wallet for storing and trading crypto'
    },
    {
      id: 'brave',
      name: 'Brave Wallet',
      icon: <div className="text-orange-500 text-2xl">🦁</div>,
      downloadUrl: 'https://brave.com/wallet/',
      description: 'Built into the Brave browser'
    },
    {
      id: 'rainbow',
      name: 'Rainbow',
      icon: <div className="text-blue-500 text-2xl">🌈</div>,
      downloadUrl: 'https://rainbow.me/',
      description: 'Beautiful, simple, and secure'
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      icon: <Wallet className="w-6 h-6 text-blue-500" />,
      downloadUrl: 'https://walletconnect.com/',
      description: 'Connect to any wallet'
    }
  ];
};

const WalletConnectDialog: React.FC<WalletConnectDialogProps> = ({
  open,
  onOpenChange,
  onConnect
}) => {
  const [connecting, setConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [walletOptions, setWalletOptions] = useState<WalletOption[]>([]);
  
  // Update wallet options when dialog opens
  useEffect(() => {
    if (open) {
      setWalletOptions(getWalletOptions());
      setConnectionError(null);
    }
  }, [open]);

  const handleWalletConnect = async (wallet: WalletOption) => {
    setConnectionError(null);
    setConnecting(true);
    
    try {
      // If wallet is not installed, open in new tab and show instructions
      if (wallet.status === 'not-installed') {
        window.open(wallet.downloadUrl, '_blank');
        setConnectionError(`Please install ${wallet.name} and refresh the page after installation.`);
        return;
      }
      
      // Connect to wallet
      const address = await connectWallet(wallet.id);
      
      if (address) {
        toast.success(`Connected to ${wallet.name}!`);
        onConnect?.(address);
        onOpenChange(false);
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      setConnectionError(error.message || 'Failed to connect wallet');
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
            <h2 className="text-xl font-bold">Connect Wallet</h2>
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
            <div className="text-sm">
              <div className="text-red-200 font-medium mb-1">{connectionError}</div>
              {connectionError.includes('install') && (
                <div className="text-red-300/70">
                  After installation, please refresh this page and try connecting again.
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="max-h-[60vh] overflow-y-auto">
          <div className="divide-y divide-gray-800">
            {walletOptions.map((wallet) => (
              <button
                key={wallet.id}
                className={cn(
                  "flex items-center gap-3 w-full p-4 hover:bg-gray-800/50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed",
                  wallet.status === 'recommended' && "bg-blue-900/20"
                )}
                onClick={() => handleWalletConnect(wallet)}
                disabled={connecting && wallet.status !== 'not-installed'}
              >
                <div className="bg-white w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden">
                  {wallet.icon}
                </div>
                <div className="flex-1">
                  <div className="font-semibold flex items-center gap-2">
                    {wallet.name}
                    {wallet.status === 'recommended' && (
                      <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full">Recommended</span>
                    )}
                    {wallet.status === 'installed' && (
                      <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-300 rounded-full">Installed</span>
                    )}
                  </div>
                  {wallet.description && (
                    <div className="text-sm text-gray-400">{wallet.description}</div>
                  )}
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
