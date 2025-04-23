/**
 * Mock data for development and testing
 */

// Mock NFT data
export const mockNFTs = [
  {
    id: '1',
    tokenId: '1',
    name: 'Abstract #1',
    description: 'Created by 0x1234...5678',
    imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb585d82c616?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    category: 'Abstract',
    price: '0.05',
    usageCount: 0,
    isMinted: true,
    createdAt: new Date().toISOString(),
    contractAddress: '0x5F31383a31f095906BA9c21b8B9C991158f7201c',
    tokenURI: 'https://api.evrlink.com/api/nfts/token/1/metadata'
  },
  {
    id: '2',
    tokenId: '2',
    name: 'Nature #2',
    description: 'Created by 0x1234...5678',
    imageUrl: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    category: 'Nature',
    price: '0.08',
    usageCount: 0,
    isMinted: true,
    createdAt: new Date().toISOString(),
    contractAddress: '0x5F31383a31f095906BA9c21b8B9C991158f7201c',
    tokenURI: 'https://api.evrlink.com/api/nfts/token/2/metadata'
  },
  {
    id: '3',
    tokenId: '3',
    name: 'Urban #3',
    description: 'Created by 0x1234...5678',
    imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    category: 'Urban',
    price: '0.12',
    usageCount: 0,
    isMinted: true,
    createdAt: new Date().toISOString(),
    contractAddress: '0x5F31383a31f095906BA9c21b8B9C991158f7201c',
    tokenURI: 'https://api.evrlink.com/api/nfts/token/3/metadata'
  },
  {
    id: '4',
    tokenId: '4',
    name: 'Minimalist #4',
    description: 'Created by 0x1234...5678',
    imageUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    category: 'Minimalist',
    price: '0.15',
    usageCount: 0,
    isMinted: true,
    createdAt: new Date().toISOString(),
    contractAddress: '0x5F31383a31f095906BA9c21b8B9C991158f7201c',
    tokenURI: 'https://api.evrlink.com/api/nfts/token/4/metadata'
  }
];

// Mock API functions
export const mockApi = {
  testConnection: async () => {
    return { success: true, message: 'Mock API connected successfully' };
  },
  
  getOwnedNFTs: async (address: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      nfts: mockNFTs
    };
  }
}; 