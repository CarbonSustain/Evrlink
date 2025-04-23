import React from "react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Copy, Settings, LogOut, User, ImagePlus } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";

const truncateAddress = (address: string) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

interface AccountMenuProps {
  address: string;
}

const AccountMenu = ({ address }: AccountMenuProps) => {
  const navigate = useNavigate();
  const { disconnect } = useWallet();
  const [copied, setCopied] = React.useState(false);

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  const handleLogout = () => {
    disconnect();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-purple-600" />
          <span className="text-white/90">{truncateAddress(address)}</span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-[300px] bg-[#1a1a1a] border-white/10 text-white">
        <div className="flex items-center gap-3 p-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-purple-600" />
          <span className="font-medium">Manage account</span>
        </div>

        <div className="px-4 py-3 space-y-4 border-t border-white/10">
          <div>
            <p className="text-sm text-gray-400">CONNECTED WALLET</p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-white/90">{truncateAddress(address)}</span>
              <button
                className="p-1.5 hover:bg-white/5 rounded-md transition-colors"
                onClick={copyAddress}
              >
                <Copy className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <img src="/ronin-logo.png" alt="RON" className="w-5 h-5" />
                <span>0</span>
              </div>
              <span>$0.00</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src="/wrapped-ron-logo.png"
                  alt="WRON"
                  className="w-5 h-5"
                />
                <span>0</span>
              </div>
              <span>$0.00</span>
            </div>
          </div>

          <button className="w-full py-2.5 px-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-center">
            Wrap/Unwrap RON
          </button>

          <button
            onClick={() => navigate("/create-background")}
            className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity text-center flex items-center justify-center gap-2"
          >
            <ImagePlus className="w-4 h-4" />
            Create Background
          </button>
        </div>

        <DropdownMenuSeparator className="bg-white/10" />

        <DropdownMenuItem
          className="px-4 py-2.5 text-white hover:bg-white/5 cursor-pointer"
          onClick={() => navigate("/profile")}
        >
          <User className="w-4 h-4 mr-2" />
          My Profile
        </DropdownMenuItem>

        <DropdownMenuItem className="px-4 py-2.5 text-white hover:bg-white/5 cursor-pointer">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-white/10" />

        <DropdownMenuItem
          className="px-4 py-2.5 text-red-500 hover:bg-white/5 cursor-pointer"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AccountMenu;
