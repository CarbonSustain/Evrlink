import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WalletOption {
  id: string;
  name: string;
  logo: string;
  status?: 'recommended' | 'installed';
  downloadUrl: string;
  description?: string;
}

interface WalletConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect?: (address: string) => void;
}

const walletOptions: WalletOption[] = [
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    logo: '/lovable-uploads/f6a6f43f-d2ee-4ba6-83c1-8c143386d6f5.png',
    status: 'recommended',
    downloadUrl: 'https://www.coinbase.com/wallet',
    description: 'Secure crypto wallet for storing and trading crypto'
  },
  {
    id: 'brave',
    name: 'Brave Wallet',
    logo: '/lovable-uploads/f6a6f43f-d2ee-4ba6-83c1-8c143386d6f5.png',
    status: 'installed',
    downloadUrl: 'https://brave.com/wallet/',
    description: 'Built into the Brave browser'
  },
  {
    id: 'metamask',
    name: 'MetaMask',
    logo: '/lovable-uploads/f6a6f43f-d2ee-4ba6-83c1-8c143386d6f5.png',
    downloadUrl: 'https://metamask.io/download/',
    description: 'The most popular Web3 wallet'
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    logo: '/lovable-uploads/f6a6f43f-d2ee-4ba6-83c1-8c143386d6f5.png',
    downloadUrl: 'https://rainbow.me/',
    description: 'Beautiful, simple, and secure'
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    logo: '/lovable-uploads/f6a6f43f-d2ee-4ba6-83c1-8c143386d6f5.png',
    downloadUrl: 'https://walletconnect.com/',
    description: 'Connect to any wallet'
  }
];

const WalletConnectDialog: React.FC<WalletConnectDialogProps> = ({
  open,
  onOpenChange,
  onConnect
}) => {
  const handleWalletConnect = (wallet: WalletOption) => {
    // TODO: Replace with actual wallet connection logic
    const mockAddress = '0x2937...ee92';
    onConnect?.(mockAddress);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 text-white border-none p-0 max-w-md w-full overflow-hidden rounded-xl">
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-pink-500 to-orange-500 w-6 h-6 rounded-md flex items-center justify-center">
              <span className="text-white text-xs">❤️</span>
            </div>
            <h2 className="text-xl font-bold">Connect to Onchain Gift</h2>
          </div>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto">
          <div className="divide-y divide-gray-800">
            {walletOptions.map((wallet) => (
              <button
                key={wallet.id}
                className="flex items-center gap-3 w-full p-4 hover:bg-gray-800/50 transition-colors text-left"
                onClick={() => handleWalletConnect(wallet)}
              >
                <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden">
                  {wallet.id === 'brave' ? (
                    <div className="bg-white w-full h-full flex items-center justify-center">
                      <div className="text-orange-500 text-2xl">🦁</div>
                    </div>
                  ) : wallet.id === 'metamask' ? (
                    <div className="bg-white w-full h-full flex items-center justify-center">
                      <div className="text-orange-500 text-2xl">🦊</div>
                    </div>
                  ) : wallet.id === 'rainbow' ? (
                    <div className="bg-white w-full h-full flex items-center justify-center">
                      <div className="text-blue-500 text-2xl">🌈</div>
                    </div>
                  ) : wallet.id === 'walletconnect' ? (
                    <div className="bg-white w-full h-full flex items-center justify-center">
                      <div className="text-blue-500 text-2xl">
                        <Wallet className="w-6 h-6 text-blue-500" />
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white w-full h-full flex items-center justify-center">
                      <div className="text-blue-500 text-2xl">□</div>
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-semibold">{wallet.name}</div>
                  {wallet.description && (
                    <div className="text-sm text-gray-400">{wallet.description}</div>
                  )}
                  {wallet.status && (
                    <div className={cn(
                      "text-sm",
                      wallet.status === 'recommended' ? 'text-gray-400' : 'text-gray-500'
                    )}>
                      {wallet.status === 'recommended' ? 'Recommended' : 'Installed'}
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
            onClick={() => window.open('https://ethereum.org/en/learn/', '_blank')}
          >
            Get started
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletConnectDialog;
