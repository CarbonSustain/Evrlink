export const debugEthereumProvider = () => {
  console.log('Debugging Ethereum Provider:');
  console.log('window.ethereum exists:', typeof window !== 'undefined' && !!window.ethereum);
  
  if (typeof window !== 'undefined' && window.ethereum) {
    console.log('window.ethereum properties:', {
      isMetaMask: window.ethereum.isMetaMask,
      isCoinbaseWallet: window.ethereum.isCoinbaseWallet,
      hasProviders: !!window.ethereum.providers,
      hasRequest: !!window.ethereum.request,
      hasOn: !!window.ethereum.on,
      hasRemoveListener: !!window.ethereum.removeListener
    });

    if (window.ethereum.providers) {
      console.log('Available providers:', window.ethereum.providers.map((p: any) => ({
        isMetaMask: p.isMetaMask,
        isCoinbaseWallet: p.isCoinbaseWallet
      })));
    }
  }
};
