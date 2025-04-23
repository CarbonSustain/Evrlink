interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    request: (request: { method: string; params?: Array<any> }) => Promise<any>;
    on?: (eventName: string, callback: Function) => void;
    removeListener?: (eventName: string, callback: Function) => void;
    selectedAddress?: string | null;
    chainId?: string;
  };
} 