import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Gift, Wallet } from 'lucide-react';
import Navbar from './Navbar';
import Button from './Button';
import WalletConnectDialog from './WalletConnectDialog';
import { useWallet } from '@/contexts/WalletContext';
import { toast } from 'react-hot-toast';
import AccountMenu from './AccountMenu';

const Layout = () => {
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);
  const { address, connect } = useWallet();
  const [connecting, setConnecting] = useState(false);

  const handleOpenWalletDialog = () => {
    setWalletDialogOpen(true);
  };

  const handleConnect = async (newAddress: string) => {
    try {
      setConnecting(true);
      await connect(newAddress);
      toast.success('Wallet connected successfully!');
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      toast.error(error.message || 'Failed to connect wallet');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0B14] flex">
      {/* Header with Logo and Wallet */}
      <div className="fixed top-0 left-0 right-0 h-16 z-50 px-4 flex items-center justify-between bg-[#0A0B14]/80 backdrop-blur-sm border-b border-white/10">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center space-x-2 transition-opacity hover:opacity-80"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Gift className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-display font-medium bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Evrlink</span>
        </Link>

        {/* Wallet Connection */}
        <div className="flex items-center">
          {address ? (
            <AccountMenu address={address} />
          ) : (
            <Button 
              onClick={handleOpenWalletDialog} 
              disabled={connecting}
              className="flex items-center gap-2"
            >
              {connecting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4" /> 
                  Connect Wallet
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <Navbar />
      <main className="flex-1 mt-16">
        <div className="content-container p-8">
          <Outlet />
        </div>
      </main>

      <WalletConnectDialog
        open={walletDialogOpen}
        onOpenChange={setWalletDialogOpen}
        onConnect={handleConnect}
      />
    </div>
  );
};

export default Layout;
