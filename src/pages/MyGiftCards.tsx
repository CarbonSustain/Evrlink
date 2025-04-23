import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Gift as GiftIcon, Send, Download } from 'lucide-react';
import GiftCardDetailsDialog from '@/components/GiftCardDetailsDialog';

interface GiftCard {
  id: string;
  imageUrl: string;
  senderName: string;
  recipientName: string;
  message: string;
  amount: string;
  date: string;
  transactionHash: string;
}

// Mock data with actual images
const mockGiftCards: GiftCard[] = [
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=500&auto=format&fit=crop',
    senderName: 'Alice Smith',
    recipientName: 'You',
    message: 'Happy Birthday!',
    amount: '50 USDC',
    date: '2024-03-28',
    transactionHash: '0x1234...5678'
  },
  {
    id: '2',
    imageUrl: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=500&auto=format&fit=crop',
    senderName: 'Bob Johnson',
    recipientName: 'You',
    message: 'Congratulations!',
    amount: '100 USDC',
    date: '2024-03-27',
    transactionHash: '0x5678...9012'
  }
];

const MyGiftCards = () => {
  const [sentGifts, setSentGifts] = useState<GiftCard[]>([]);
  const [receivedGifts, setReceivedGifts] = useState<GiftCard[]>([]);
  const [selectedGift, setSelectedGift] = useState<GiftCard | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    // TODO: Replace with actual API call to fetch gift cards
    const mockData = {
      sent: [
        {
          id: '1',
          imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=500&auto=format&fit=crop',
          senderName: 'You',
          recipientName: 'Alice Smith',
          message: 'Happy Birthday!',
          amount: '50 USDC',
          date: '2024-03-28',
          transactionHash: '0x1234...5678'
        },
        {
          id: '2',
          imageUrl: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=500&auto=format&fit=crop',
          senderName: 'You',
          recipientName: 'Bob Johnson',
          message: 'Congratulations!',
          amount: '100 USDC',
          date: '2024-03-27',
          transactionHash: '0x5678...9012'
        }
      ],
      received: [
        {
          id: '3',
          imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=500&auto=format&fit=crop',
          senderName: 'Alice Smith',
          recipientName: 'You',
          message: 'Thank you for your help!',
          amount: '50 USDC',
          date: '2024-03-28',
          transactionHash: '0x9876...5432'
        },
        {
          id: '4',
          imageUrl: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=500&auto=format&fit=crop',
          senderName: 'Bob Johnson',
          recipientName: 'You',
          message: 'For being awesome!',
          amount: '100 USDC',
          date: '2024-03-27',
          transactionHash: '0x4321...8765'
        }
      ]
    };

    setSentGifts(mockData.sent);
    setReceivedGifts(mockData.received);
  }, []);

  const handleGiftClick = (gift: GiftCard) => {
    setSelectedGift(gift);
    setDetailsOpen(true);
  };

  const GiftCardItem = ({ gift }: { gift: GiftCard }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative"
    >
      <Card 
        onClick={() => handleGiftClick(gift)}
        className="cursor-pointer bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-200 overflow-hidden"
      >
        <CardContent className="p-0">
          <div className="aspect-video relative">
            {gift.imageUrl ? (
              <>
                <img 
                  src={gift.imageUrl} 
                  alt={`Gift from ${gift.senderName}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <GiftIcon className="w-12 h-12 text-white/50" />
              </div>
            )}
            
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/90">From {gift.senderName}</p>
                  <p className="text-xs text-white/60">{gift.date}</p>
                </div>
                <p className="text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                  {gift.amount}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <Tabs defaultValue="received" className="w-full">
        <TabsList className="w-full bg-white/5 border-b border-white/10 p-0 h-auto">
          <div className="max-w-7xl mx-auto w-full flex">
            <TabsTrigger 
              value="received" 
              className="flex-1 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-white/5"
            >
              <Download className="w-4 h-4 mr-2" />
              Received ({receivedGifts.length})
            </TabsTrigger>
            <TabsTrigger 
              value="sent" 
              className="flex-1 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-white/5"
            >
              <Send className="w-4 h-4 mr-2" />
              Sent ({sentGifts.length})
            </TabsTrigger>
          </div>
        </TabsList>

        <div className="max-w-7xl mx-auto py-8">
          <TabsContent value="received" className="m-0">
            <AnimatePresence>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {receivedGifts.map((gift) => (
                  <GiftCardItem key={gift.id} gift={gift} />
                ))}
              </div>
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="sent" className="m-0">
            <AnimatePresence>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sentGifts.map((gift) => (
                  <GiftCardItem 
                    key={gift.id} 
                    gift={{...gift, senderName: 'You', recipientName: gift.recipientName}} 
                  />
                ))}
              </div>
            </AnimatePresence>
          </TabsContent>
        </div>
      </Tabs>

      {selectedGift && (
        <GiftCardDetailsDialog
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          gift={selectedGift}
        />
      )}
    </div>
  );
};

export default MyGiftCards;
