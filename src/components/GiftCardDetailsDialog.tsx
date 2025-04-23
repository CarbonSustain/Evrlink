import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Gift, ExternalLink, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

interface GiftCardDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gift: GiftCard | null;
}

const GiftCardDetailsDialog = ({ open, onOpenChange, gift }: GiftCardDetailsDialogProps) => {
  const [copied, setCopied] = React.useState(false);

  if (!gift) return null;

  const copyHash = () => {
    navigator.clipboard.writeText(gift.transactionHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const viewOnExplorer = () => {
    window.open(`https://etherscan.io/tx/${gift.transactionHash}`, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0A0B14] text-white border-white/10 p-0 overflow-hidden max-w-2xl">
        <div className="relative aspect-video">
          {gift.imageUrl ? (
            <>
              <img 
                src={gift.imageUrl} 
                alt={`Gift from ${gift.senderName}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <Gift className="w-20 h-20 text-white/50" />
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-lg font-medium text-white">From {gift.senderName}</p>
                <p className="text-sm text-white/60">To {gift.recipientName}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                  {gift.amount}
                </p>
                <p className="text-sm text-white/60">{gift.date}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-white/60">Message</p>
            <p className="text-white/90">{gift.message}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-white/60">Transaction</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-3 bg-white/5 rounded-lg text-sm text-white/80 font-mono">
                {gift.transactionHash}
              </code>
              <Button
                size="icon"
                variant="outline"
                className="shrink-0 border-white/10 bg-white/5 hover:bg-white/10"
                onClick={copyHash}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="shrink-0 border-white/10 bg-white/5 hover:bg-white/10"
                onClick={viewOnExplorer}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GiftCardDetailsDialog;
